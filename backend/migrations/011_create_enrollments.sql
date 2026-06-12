-- Course enrollments and per-module progress

CREATE TABLE IF NOT EXISTS enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES users(id),
  course_id UUID NOT NULL REFERENCES courses(id),
  paid_amount DOUBLE PRECISION NOT NULL DEFAULT 0,
  payment_method VARCHAR(20) NOT NULL DEFAULT 'free'
    CHECK (payment_method IN ('free','stripe','stellar')),
  stripe_payment_intent VARCHAR(255),
  stellar_tx_hash VARCHAR(64),
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  UNIQUE(student_id, course_id)
);
CREATE INDEX IF NOT EXISTS idx_enrollments_student ON enrollments (student_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course ON enrollments (course_id);

CREATE TABLE IF NOT EXISTS module_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id UUID NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
  module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  quiz_score INTEGER,
  quiz_passed BOOLEAN,
  quiz_attempts INTEGER NOT NULL DEFAULT 0,
  last_attempt_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  credits_awarded INTEGER NOT NULL DEFAULT 0,
  UNIQUE(enrollment_id, module_id)
);
CREATE INDEX IF NOT EXISTS idx_module_progress_enrollment ON module_progress (enrollment_id);
