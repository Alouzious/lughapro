-- LughaPro extensions to the users table: wallet, tokens, referrals, subscription tier
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS stellar_wallet VARCHAR(56),
  ADD COLUMN IF NOT EXISTS lugha_tokens INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS referral_code VARCHAR(12) UNIQUE,
  ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES users(id),
  ADD COLUMN IF NOT EXISTS subscription_tier VARCHAR(20) NOT NULL DEFAULT 'free'
    CHECK (subscription_tier IN ('free', 'pro', 'corporate'));

CREATE INDEX IF NOT EXISTS idx_users_referral_code ON users (referral_code);
