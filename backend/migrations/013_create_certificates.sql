-- On-chain certificate mirror

CREATE TABLE IF NOT EXISTS certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES users(id),
  level VARCHAR(5) NOT NULL CHECK (level IN ('A1','A2','B1','B2','C1','C2')),
  stellar_tx_hash VARCHAR(64) UNIQUE,
  contract_address VARCHAR(56),
  certificate_id VARCHAR(64),
  issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(student_id, level)
);
CREATE INDEX IF NOT EXISTS idx_certificates_student ON certificates (student_id);
