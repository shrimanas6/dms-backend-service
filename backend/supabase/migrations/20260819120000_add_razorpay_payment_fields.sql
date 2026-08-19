/*
  # Razorpay Payment Fields & Donation Write Lockdown

  ## Overview
  Converts `donations` from a client-written "record of a successful payment" into
  a server-owned payment lifecycle row, and removes the browser's ability to write
  to it at all.

  Before this migration the frontend inserted donation rows directly from the
  Razorpay checkout handler. Because RLS only checked `auth.uid() = user_id`, any
  signed-in user could insert an arbitrary donation from the browser console
  without paying. The backend now creates the Razorpay order, verifies the
  signature, and writes the row itself using the service role (which bypasses RLS).

  ## Changes

  ### `donations` - new columns
  - `razorpay_order_id` (text) - the `order_xxx` this donation was created for
  - `razorpay_payment_id` (text) - the `pay_xxx` once captured
  - `status` (text) - created | pending | paid | failed | refunded
  - `currency` (text, default 'INR')
  - `amount_paise` (bigint) - authoritative integer amount, avoids float drift
  - `method` (text) - upi | card | netbanking | wallet, as reported by Razorpay
  - `receipt` (text) - our receipt reference sent to Razorpay
  - `failure_reason` (text) - populated from the payment.failed webhook
  - `paid_at` (timestamptz) - capture time
  - `updated_at` (timestamptz) - maintained by trigger

  Existing columns are deliberately left alone. `transaction_id` stays NOT NULL
  (the server writes the order id at creation, then overwrites it with the payment
  id on capture) and `amount` keeps its `CHECK (amount > 0)` (the amount is known
  at order-creation time, so the check always holds).

  ### Idempotency
  Partial unique indexes on `razorpay_order_id` and `razorpay_payment_id` are the
  database-level guarantee that a replayed webhook cannot create a duplicate
  donation. A duplicate insert fails with SQLSTATE 23505, which the webhook
  handler treats as success.

  ## Security

  ### RLS
  The INSERT, UPDATE and DELETE policies on `donations` are DROPPED. The SELECT
  policy is intentionally KEPT so the Dashboard and History pages keep working.
  Donations are now written exclusively by the backend via the service role key.

  `profiles` and `user_settings` policies are untouched.

  ## Migration Safety
  Existing donation rows are backfilled as `status = 'paid'` so they continue to
  appear in History and in the donation totals.
*/

-- ---------------------------------------------------------------------------
-- 1. New columns
-- ---------------------------------------------------------------------------

ALTER TABLE donations ADD COLUMN IF NOT EXISTS razorpay_order_id   text;
ALTER TABLE donations ADD COLUMN IF NOT EXISTS razorpay_payment_id text;
ALTER TABLE donations ADD COLUMN IF NOT EXISTS currency            text NOT NULL DEFAULT 'INR';
ALTER TABLE donations ADD COLUMN IF NOT EXISTS amount_paise        bigint;
ALTER TABLE donations ADD COLUMN IF NOT EXISTS method              text;
ALTER TABLE donations ADD COLUMN IF NOT EXISTS receipt             text;
ALTER TABLE donations ADD COLUMN IF NOT EXISTS failure_reason      text;
ALTER TABLE donations ADD COLUMN IF NOT EXISTS paid_at             timestamptz;
ALTER TABLE donations ADD COLUMN IF NOT EXISTS updated_at          timestamptz DEFAULT now();

-- ---------------------------------------------------------------------------
-- 2. Status column
--
-- Added with DEFAULT 'paid' so every pre-existing row is backfilled as paid in a
-- single statement, then the default is flipped to 'created' for new rows. The
-- server always sets status explicitly; the default is only a safety net.
-- ---------------------------------------------------------------------------

ALTER TABLE donations ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'paid';
ALTER TABLE donations ALTER COLUMN status SET DEFAULT 'created';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'donations_status_check'
  ) THEN
    ALTER TABLE donations ADD CONSTRAINT donations_status_check
      CHECK (status IN ('created', 'pending', 'paid', 'failed', 'refunded'));
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- 3. Backfill legacy rows
--
-- Rows written by the old client-side flow stored the real Razorpay payment id in
-- transaction_id. Rows from the old (never-called) handleFinalizeDonation stored a
-- fabricated TXN... id; those keep NULL razorpay ids, which is harmless.
-- ---------------------------------------------------------------------------

UPDATE donations
   SET razorpay_payment_id = transaction_id
 WHERE razorpay_payment_id IS NULL
   AND transaction_id LIKE 'pay!_%' ESCAPE '!';

UPDATE donations
   SET amount_paise = round(amount * 100)::bigint
 WHERE amount_paise IS NULL;

UPDATE donations
   SET paid_at = created_at
 WHERE status = 'paid' AND paid_at IS NULL;

-- ---------------------------------------------------------------------------
-- 4. Indexes
-- ---------------------------------------------------------------------------

CREATE UNIQUE INDEX IF NOT EXISTS donations_razorpay_order_id_key
  ON donations(razorpay_order_id) WHERE razorpay_order_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS donations_razorpay_payment_id_key
  ON donations(razorpay_payment_id) WHERE razorpay_payment_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS donations_user_status_created_idx
  ON donations(user_id, status, created_at DESC);

-- ---------------------------------------------------------------------------
-- 5. updated_at trigger (reuses update_updated_at_column() from the initial migration)
-- ---------------------------------------------------------------------------

DROP TRIGGER IF EXISTS update_donations_updated_at ON donations;
CREATE TRIGGER update_donations_updated_at
  BEFORE UPDATE ON donations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ---------------------------------------------------------------------------
-- 6. RLS lockdown
--
-- The browser may still READ its own donations. It may no longer write them.
-- The backend uses the service role key, which bypasses RLS entirely.
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS "Users can insert own donations" ON donations;
DROP POLICY IF EXISTS "Users can update own donations" ON donations;
DROP POLICY IF EXISTS "Users can delete own donations" ON donations;

-- "Users can view own donations" (SELECT) is intentionally retained.
