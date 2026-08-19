# Backend - Temple Management Application

Express API for the Temple Management Application. It owns the Razorpay payment
flow (order creation, signature verification, webhook) and the email/SMS
reminders. All other reads go browser -> Supabase directly.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Fill in your Razorpay, Supabase and SMTP credentials

3. Run development server:
```bash
npm run dev
```

## Production Deployment

Deploy to Render using the included `render.yaml` configuration. Every secret is
declared `sync: false`, so set the values in the Render dashboard.

## API Endpoints

### Payments
- `POST /api/payments/order` - Create a Razorpay order (auth required)
- `POST /api/payments/verify` - Verify the payment signature and record the donation (auth required)
- `POST /api/payments/webhook` - Razorpay webhook for `payment.captured` / `payment.failed`

`order` and `verify` require an `Authorization: Bearer <supabase-access-token>`
header. The donation row is written server-side with the Supabase service role;
the browser cannot insert donations.

### Notifications
- `POST /api/send-reminder` - Send donation reminder
- `POST /api/test-email` - Test email configuration
- `POST /api/test-sms` - Test SMS configuration

### Ops
- `GET /health` - Health check (used by Render's `healthCheckPath`)

## Razorpay Dashboard Setup

1. **Settings -> Payments -> Payment capture: Automatic** (100%, immediate).
   Without this you only ever receive `payment.authorized`, never
   `payment.captured`, and the money auto-refunds after 5 days.
2. **Settings -> Webhooks -> Add New Webhook**
   - URL: `https://<your-render-service>.onrender.com/api/payments/webhook`
   - Secret: generate with `openssl rand -hex 32`, paste the same value into
     `RAZORPAY_WEBHOOK_SECRET`
   - Active events: `payment.captured`, `payment.failed`
3. Test Mode and Live Mode have **separate** webhook lists and secrets.
   Configure whichever mode your `RAZORPAY_KEY_ID` belongs to.

## Environment Variables

See `.env.example` for the full list. Note that
`SUPABASE_SERVICE_ROLE_KEY` bypasses all row level security - never expose it to
the frontend, never prefix it `VITE_`, never log it.

## Database

Migrations live in `supabase/migrations/`. Apply them via the Supabase dashboard
SQL editor or the Supabase CLI.
