-- Student credit balances (mirrored from chain) and transaction log

CREATE TABLE IF NOT EXISTS student_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL UNIQUE REFERENCES users(id),
  total_credits INTEGER NOT NULL DEFAULT 0,
  level_unlocked VARCHAR(5) NOT NULL DEFAULT 'A1'
    CHECK (level_unlocked IN ('A1','A2','B1','B2','C1','C2')),
  last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES users(id),
  amount INTEGER NOT NULL,
  reason VARCHAR(100) NOT NULL,
  reference_id UUID,
  stellar_tx_hash VARCHAR(64),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_credit_tx_student ON credit_transactions (student_id, created_at DESC);
