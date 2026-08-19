import express from 'express';
import Razorpay from 'razorpay';
import cors from 'cors';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import twilio from 'twilio';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import crypto from 'node:crypto';

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
app.use(express.json({ limit: '100kb' }));

// Health check - Render healthCheckPath, and a quick reachability ping when
// tunnelling webhooks through ngrok.
app.get('/health', (req, res) => res.json({ ok: true }));

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

app.post('/api/create-payment-link', async (req, res) => {
    try {
        const { amount, customer } = req.body;

        const order = await razorpay.orders.create({
            amount: Math.round(Number(amount) * 100),
            currency: 'INR',
            receipt: `receipt_${Date.now()}`,
            notes: {
                customer_name: customer?.name,
                customer_email: customer?.email
            }
        });

        res.json({
            order_id: order.id,
            amount: order.amount,
            currency: order.currency,
            key_id: RAZORPAY_KEY_ID
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Order creation failed' });
    }
});

/* ---------------- VERIFY PAYMENT ---------------- */
app.post('/api/verify-payment', (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        } = req.body;

        const body = razorpay_order_id + "|" + razorpay_payment_id;

        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body)
            .digest("hex");

        if (expectedSignature === razorpay_signature) {
            res.json({ success: true, payment_id: razorpay_payment_id });
        } else {
            res.status(400).json({ success: false });
        }
    } catch (err) {
        res.status(500).json({ success: false });
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
