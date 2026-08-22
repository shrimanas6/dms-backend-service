import express from 'express';
import Razorpay from 'razorpay';
import cors from 'cors';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import twilio from 'twilio';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import crypto from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from backend root
dotenv.config({ path: join(__dirname, '../.env') });

const app = express();

// Configure CORS for production
const corsOptions = {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// ---------------------------------------------------------------------------
// Middleware ordering below is load-bearing.
//
// express.json() consumes the request stream, and re-serialising req.body is NOT
// byte-identical to what Razorpay signed (key order, whitespace, unicode
// escapes). Any route that verifies a signature over the raw payload - i.e. the
// Razorpay webhook - must therefore be registered ABOVE the global JSON parser
// using express.raw(). Such a route responds without calling next(), so
// express.json() never sees it.
// ---------------------------------------------------------------------------

// Health check - Render's healthCheckPath, and a quick reachability ping when
// tunnelling webhooks through ngrok.
app.get('/health', (req, res) => res.json({ ok: true }));

// Razorpay webhook - raw body, MUST stay above express.json().
app.post(
    '/api/payments/webhook',
    express.raw({ type: 'application/json', limit: '1mb' }),
    handleRazorpayWebhook
);

// Global JSON parser for every other route.
app.use(express.json({ limit: '100kb' }));

// TODO: drop the VITE_ fallback once the Render env vars are renamed to RAZORPAY_KEY_ID.
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID;

const razorpay = new Razorpay({
    key_id: RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Nodemailer setup
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.ethereal.email',
    port: process.env.SMTP_PORT || 587,
    secure: false,
    auth: {
        user: process.env.SMTP_USER || 'test@ethereal.email',
        pass: process.env.SMTP_PASS || 'testpass',
    },
});

// Twilio setup (optional)
const twilioClient = process.env.TWILIO_SID && process.env.TWILIO_AUTH_TOKEN
    ? twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN)
    : null;

// ---------------------------------------------------------------------------
// Supabase (service role)
//
// The service role key bypasses row level security. It is what lets the backend
// own the donations table while the browser is restricted to reading its own
// rows. It must never reach the frontend.
// ---------------------------------------------------------------------------
const supabaseAdmin = process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
    ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
        auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
    })
    : null;

// Fail loudly at boot rather than silently mid-payment.
const missingEnv = [
    ['RAZORPAY_KEY_ID', RAZORPAY_KEY_ID],
    ['RAZORPAY_KEY_SECRET', process.env.RAZORPAY_KEY_SECRET],
    ['SUPABASE_URL', process.env.SUPABASE_URL],
    ['SUPABASE_SERVICE_ROLE_KEY', process.env.SUPABASE_SERVICE_ROLE_KEY],
].filter(([, value]) => !value).map(([name]) => name);

if (missingEnv.length) {
    console.error(`❌ Missing required environment variables: ${missingEnv.join(', ')}`);
    console.error('   Payments will not work. See backend/.env.example.');
    if (process.env.NODE_ENV === 'production') process.exit(1);
}
if (!process.env.RAZORPAY_WEBHOOK_SECRET) {
    console.warn('⚠️  RAZORPAY_WEBHOOK_SECRET is not set - the payment webhook is disabled.');
}

/**
 * Constant-time comparison of two hex signature strings.
 *
 * Compared as UTF-8 bytes rather than Buffer.from(sig, 'hex'): the hex decoder
 * silently drops invalid nibbles, which can make two different signatures decode
 * to equal-length buffers.
 */
function safeEqualHex(a, b) {
    const ba = Buffer.from(String(a), 'utf8');
    const bb = Buffer.from(String(b), 'utf8');
    if (ba.length !== bb.length) return false; // timingSafeEqual throws on length mismatch
    return crypto.timingSafeEqual(ba, bb);
}

/**
 * Verifies the caller's Supabase access token and attaches the trusted user to
 * req.user. Handlers must take the user id from req.user.id and never from the
 * request body.
 *
 * Uses supabaseAdmin.auth.getUser() rather than verifying the JWT locally: it
 * needs no extra dependency, keeps working if the project migrates to asymmetric
 * signing keys, and detects sessions that have been revoked.
 */
async function requireAuth(req, res, next) {
    if (!supabaseAdmin) {
        return res.status(503).json({ error: 'Server auth is not configured' });
    }

    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7).trim() : null;
    if (!token) {
        return res.status(401).json({ error: 'Missing authorization token' });
    }

    try {
        const { data, error } = await supabaseAdmin.auth.getUser(token);
        if (error || !data?.user) {
            return res.status(401).json({ error: 'Invalid or expired session' });
        }
        req.user = data.user;
        next();
    } catch (err) {
        console.error('Auth check failed:', err);
        return res.status(503).json({ error: 'Auth check failed' });
    }
}

/* ------------------------------ RAZORPAY WEBHOOK --------------------------- */

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Marks the donation behind this payment as paid.
 *
 * Ordered update -> lookup -> insert so that it is idempotent (a replayed webhook
 * updates nothing) while still recovering an "orphan" payment: one where the
 * Razorpay order was created but our pending insert failed and the user paid
 * anyway. The owner is recovered from the notes set at order creation.
 */
async function markPaid(payment) {
    const paidAt = new Date(payment.created_at * 1000).toISOString();

    const { data, error } = await supabaseAdmin
        .from('donations')
        .update({
            status: 'paid',
            razorpay_payment_id: payment.id,
            transaction_id: payment.id,
            method: payment.method ?? null,
            paid_at: paidAt,
        })
        .eq('razorpay_order_id', payment.order_id)
        .neq('status', 'paid') // replays become no-ops
        .select('id')
        .maybeSingle();

    if (error) throw error;
    if (data) return;

    // Nothing updated: either the row is already paid, or there is no row at all.
    const { data: existing, error: selErr } = await supabaseAdmin
        .from('donations')
        .select('id')
        .eq('razorpay_order_id', payment.order_id)
        .maybeSingle();

    if (selErr) throw selErr;
    if (existing) return; // already paid - nothing to do

    const userId = payment.notes?.user_id;
    if (!UUID_RE.test(String(userId ?? ''))) {
        console.error('Orphan payment with no usable user_id in notes:', payment.id);
        return;
    }

    const { error: insErr } = await supabaseAdmin.from('donations').insert({
        user_id: userId,
        amount: payment.amount / 100,
        amount_paise: payment.amount,
        currency: payment.currency ?? 'INR',
        transaction_id: payment.id,
        razorpay_order_id: payment.order_id,
        razorpay_payment_id: payment.id,
        method: payment.method ?? null,
        status: 'paid',
        paid_at: paidAt,
        notes: 'Razorpay donation (recovered via webhook)',
    });

    // 23505 = unique violation: a concurrent verify/webhook won the race. Fine.
    if (insErr && insErr.code !== '23505') throw insErr;
}

/** Records a failed payment. Never downgrades a row that is already paid. */
async function markFailed(payment) {
    const { error } = await supabaseAdmin
        .from('donations')
        .update({
            status: 'failed',
            razorpay_payment_id: payment.id,
            failure_reason: payment.error_description ?? payment.error_reason ?? null,
        })
        .eq('razorpay_order_id', payment.order_id)
        .neq('status', 'paid');

    if (error) throw error;
}

/**
 * Razorpay webhook. Registered with express.raw() ABOVE the global JSON parser so
 * the HMAC is computed over the exact bytes Razorpay signed.
 *
 * The signature IS the authentication here - there is no bearer token. This is
 * the safety net for a browser that dies or loses network right after paying:
 * without it, money is taken and no donation is ever recorded.
 */
async function handleRazorpayWebhook(req, res) {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!secret || !supabaseAdmin) {
        console.error('Webhook received but RAZORPAY_WEBHOOK_SECRET / Supabase is not configured');
        return res.status(500).json({ error: 'Webhook not configured' });
    }

    const signature = req.headers['x-razorpay-signature'];
    const rawBody = Buffer.isBuffer(req.body) ? req.body : Buffer.alloc(0);
    const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');

    if (!signature || !safeEqualHex(expected, signature)) {
        console.warn('Webhook signature rejected');
        return res.status(400).json({ error: 'Invalid signature' });
    }

    let event;
    try {
        event = JSON.parse(rawBody.toString('utf8'));
    } catch {
        return res.status(400).json({ error: 'Malformed payload' });
    }

    try {
        const entity = event?.payload?.payment?.entity;

        switch (event?.event) {
            case 'payment.captured':
                if (entity) await markPaid(entity);
                break;
            case 'payment.failed':
                if (entity) await markFailed(entity);
                break;
            default:
                break; // unhandled event types are acknowledged, not retried
        }

        return res.json({ received: true });
    } catch (err) {
        console.error('Webhook processing error:', err);
        // A non-2xx makes Razorpay retry with backoff for ~24h.
        return res.status(500).json({ error: 'Processing failed' });
    }
}

/* ------------------------------- CREATE ORDER ------------------------------ */

const MIN_PAISE = 100;         // ₹1 - Razorpay's minimum
const MAX_PAISE = 50_000_000;  // ₹5,00,000
const AMOUNT_RE = /^\d{1,7}(\.\d{1,2})?$/;

app.post('/api/payments/order', requireAuth, async (req, res) => {
    try {
        // Validate server-side. The client does the same check for UX only; this
        // is the authoritative one.
        const raw = String(req.body?.amount ?? '').trim();
        if (!AMOUNT_RE.test(raw)) {
            return res.status(400).json({ error: 'Invalid amount' });
        }

        const amountPaise = Math.round(Number(raw) * 100);
        if (amountPaise < MIN_PAISE || amountPaise > MAX_PAISE) {
            return res.status(400).json({
                error: `Amount must be between ₹${MIN_PAISE / 100} and ₹${MAX_PAISE / 100}`,
            });
        }

        const receipt = `don_${crypto.randomUUID().replace(/-/g, '')}`; // 36 chars; Razorpay caps at 40

        const order = await razorpay.orders.create({
            amount: amountPaise,
            currency: 'INR',
            receipt,
            // notes.user_id is how the webhook recovers this donation if the
            // pending insert below fails but the user goes on to pay anyway.
            notes: { user_id: req.user.id, email: req.user.email ?? '' },
        });

        const { error: dbError } = await supabaseAdmin.from('donations').insert({
            user_id: req.user.id,          // trusted: from the verified token, never the body
            amount: amountPaise / 100,
            amount_paise: amountPaise,
            currency: 'INR',
            transaction_id: order.id,      // satisfies NOT NULL; replaced by the payment id on capture
            razorpay_order_id: order.id,
            receipt,
            status: 'created',
            notes: 'Razorpay donation',
        });

        if (dbError) {
            console.error('Failed to persist pending donation for order', order.id, dbError);
            return res.status(500).json({ error: 'Could not start payment' });
        }

        res.json({
            order_id: order.id,
            amount: order.amount,
            currency: order.currency,
            key_id: RAZORPAY_KEY_ID,
        });
    } catch (err) {
        console.error('Order creation failed:', err);
        res.status(500).json({ error: 'Order creation failed' });
    }
});

/* ------------------------------ VERIFY PAYMENT ----------------------------- */

app.post('/api/payments/verify', requireAuth, async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body || {};
        const fields = [razorpay_order_id, razorpay_payment_id, razorpay_signature];
        if (!fields.every((v) => typeof v === 'string' && v.length > 0)) {
            return res.status(400).json({ success: false, error: 'Missing payment fields' });
        }

        const expected = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest('hex');

        if (!safeEqualHex(expected, razorpay_signature)) {
            // Deliberately do NOT mark the row failed - a bad signature may be
            // someone probing another user's order id.
            console.warn('Signature mismatch for order', razorpay_order_id);
            return res.status(400).json({ success: false, error: 'Signature verification failed' });
        }

        // Best-effort confirmation with Razorpay; also gives us the real instrument.
        let method = null;
        try {
            const payment = await razorpay.payments.fetch(razorpay_payment_id);
            if (payment.order_id !== razorpay_order_id) {
                return res.status(400).json({ success: false, error: 'Order mismatch' });
            }
            method = payment.method ?? null;
        } catch (e) {
            console.warn('payments.fetch failed (non-fatal):', e?.message);
        }

        const { data: updated, error: updErr } = await supabaseAdmin
            .from('donations')
            .update({
                status: 'paid',
                razorpay_payment_id,
                transaction_id: razorpay_payment_id,
                method,
                paid_at: new Date().toISOString(),
            })
            .eq('razorpay_order_id', razorpay_order_id)
            .eq('user_id', req.user.id)                      // ownership: cannot claim another user's order
            .in('status', ['created', 'pending', 'failed'])  // idempotency: never clobber a paid row
            .select('id, amount, razorpay_payment_id')
            .maybeSingle();

        if (updErr) throw updErr;

        if (!updated) {
            // Zero rows updated: either the webhook already marked this paid, or
            // the order does not belong to the caller.
            const { data: existing } = await supabaseAdmin
                .from('donations')
                .select('id, amount, status, razorpay_payment_id')
                .eq('razorpay_order_id', razorpay_order_id)
                .eq('user_id', req.user.id)
                .maybeSingle();

            if (existing?.status === 'paid') {
                return res.json({
                    success: true,
                    payment_id: existing.razorpay_payment_id ?? razorpay_payment_id,
                    donation_id: existing.id,
                    amount: existing.amount,
                    already_recorded: true,
                });
            }

            return res.status(404).json({ success: false, error: 'Order not found for this user' });
        }

        res.json({
            success: true,
            payment_id: updated.razorpay_payment_id,
            donation_id: updated.id,
            amount: updated.amount,
        });
    } catch (err) {
        console.error('Verify failed:', err);
        res.status(500).json({ success: false, error: 'Verification error' });
    }
});


app.post('/api/send-reminder', async (req, res) => {
    const { name, email, phone, daysSinceLastDonation } = req.body;
    console.log(`🔔 Sending reminder to ${name} (${email} / ${phone})`);

    const results = { email: 'skipped', sms: 'skipped' };

    try {
        // Send Email
        if (email) {
            const mailOptions = {
                from: '"Temple Management" <reminders@temple.com>',
                to: email,
                subject: 'Monthly Donation Reminder',
                text: `Namaste ${name},\n\nIt has been ${daysSinceLastDonation} days since your last donation. Your contribution helps us maintain the temple and serve the community.\n\nVisit your dashboard to make a donation: ${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard\n\nBlessings,\nTemple Management`,
                html: `<div style="font-family: sans-serif; padding: 20px; border: 1px solid #ffedd5; border-radius: 10px;">
                    <h2 style="color: #ea580c;">Namaste ${name},</h2>
                    <p>It has been <b>${daysSinceLastDonation} days</b> since your last donation.</p>
                    <p>Your contribution helps us maintain the temple and serve the community.</p>
                    <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard" style="display: inline-block; background: #ea580c; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Donate Now</a>
                    <p style="margin-top: 20px; color: #666;">Blessings,<br>Temple Management</p>
                </div>`
            };
            const info = await transporter.sendMail(mailOptions);
            results.email = 'sent';
            console.log('Email sent:', nodemailer.getTestMessageUrl(info) || info.messageId);
        }

        // Send SMS
        if (phone) {
            const smsMessage = `Namaste ${name}, it has been a month since your last donation to the Temple. Your support means a lot. Donate here: ${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard`;

            if (twilioClient && process.env.TWILIO_PHONE) {
                await twilioClient.messages.create({
                    body: smsMessage,
                    from: process.env.TWILIO_PHONE,
                    to: phone.startsWith('+') ? phone : `+91${phone}`
                });
                results.sms = 'sent';
            } else {
                console.log('--- [MOCK SMS SENT] ---');
                console.log(`To: ${phone}`);
                console.log(`Message: ${smsMessage}`);
                console.log('-----------------------');
                results.sms = 'mock_sent';
            }
        }

        res.json({ success: true, results });
    } catch (error) {
        console.error('Reminder error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/test-email', async (req, res) => {
    const { email, name } = req.body;

    console.log('📧 Test email request received for:', email);

    // Validate SMTP configuration
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.error('❌ SMTP credentials not configured in .env file');
        return res.status(500).json({
            error: 'Email service not configured. Please add SMTP_USER and SMTP_PASS to your .env file.'
        });
    }

    if (process.env.SMTP_USER === 'your-email@gmail.com') {
        console.error('❌ SMTP credentials are placeholder values');
        return res.status(500).json({
            error: 'Please update SMTP_USER and SMTP_PASS in your .env file with real credentials.'
        });
    }

    try {
        console.log('Sending test email via:', process.env.SMTP_HOST);
        const info = await transporter.sendMail({
            from: `"Temple Management" <${process.env.SMTP_USER}>`,
            to: email,
            subject: 'Monthly Donation Reminder - Test',
            text: `Namaste ${name},\n\nIt has been a month since your last donation. Your contribution helps us maintain the temple and serve the community.\n\nVisit your dashboard to make a donation: ${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard\n\nBlessings,\nTemple Management`,
            html: `<div style="font-family: sans-serif; padding: 20px; border: 1px solid #ffedd5; border-radius: 10px;">
                <h2 style="color: #ea580c;">Namaste ${name},</h2>
                <p>It has been <b>a month</b> since your last donation.</p>
                <p>Your contribution helps us maintain the temple and serve the community.</p>
                <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard" style="display: inline-block; background: #ea580c; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Donate Now</a>
                <p style="margin-top: 20px; color: #666;">Blessings,<br>Temple Management</p>
            </div>`
        });
        console.log('✅ Test email sent successfully:', info.messageId);
        const previewUrl = nodemailer.getTestMessageUrl(info);
        if (previewUrl) {
            console.log('📧 Preview URL:', previewUrl);
        }
        res.json({
            success: true,
            url: previewUrl,
            messageId: info.messageId
        });
    } catch (error) {
        console.error('❌ Failed to send test email:', error.message);
        res.status(500).json({
            error: `Failed to send email: ${error.message}. Please check your SMTP credentials.`
        });
    }
});


app.post('/api/test-sms', async (req, res) => {
    const { phone, name } = req.body;

    console.log('📱 Test SMS request received for:', phone);

    if (!phone) {
        return res.status(400).json({ error: 'Phone number is required' });
    }

    try {
        const msg = `Namaste ${name}, this is a test SMS from your Temple Management app. It works!`;

        if (twilioClient && process.env.TWILIO_PHONE) {
            console.log('Sending real SMS via Twilio...');
            const message = await twilioClient.messages.create({
                body: msg,
                from: process.env.TWILIO_PHONE,
                to: phone.startsWith('+') ? phone : `+91${phone}`
            });
            console.log('✅ SMS sent successfully:', message.sid);
            res.json({ success: true, sid: message.sid });
        } else {
            console.log('⚠️ Twilio not configured - using MOCK mode');
            console.log('╔════════════════════════════════════════╗');
            console.log('║         📱 MOCK SMS SENT              ║');
            console.log('╠════════════════════════════════════════╣');
            console.log(`║ To: ${phone.padEnd(35)}║`);
            console.log(`║ Message: ${msg.substring(0, 30).padEnd(30)}║`);
            console.log('╚════════════════════════════════════════╝');
            res.json({
                success: true,
                mock: true,
                message: 'SMS sent in mock mode (Twilio not configured). Check server console for details.'
            });
        }
    } catch (error) {
        console.error('❌ Failed to send SMS:', error.message);
        res.status(500).json({
            error: `Failed to send SMS: ${error.message}`
        });
    }
});

// Use environment variables for production deployment
const PORT = process.env.PORT || 3055;
const HOST = process.env.HOST || '0.0.0.0';

app.listen(PORT, HOST, () => {
    console.log(`🚀 Temple Backend READY at http://${HOST}:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
});
