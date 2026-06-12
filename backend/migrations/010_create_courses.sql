-- Courses, modules, quizzes and quiz questions

CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tutor_id UUID REFERENCES users(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  thumbnail_url VARCHAR(500),
  level VARCHAR(5) NOT NULL CHECK (level IN ('A1','A2','B1','B2','C1','C2')),
  price DOUBLE PRECISION NOT NULL DEFAULT 0,
  is_free BOOLEAN GENERATED ALWAYS AS (price = 0) STORED,
  status VARCHAR(20) NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft','pending_review','published','archived')),
  tags TEXT[],
  estimated_hours INTEGER,
  enrolled_count INTEGER NOT NULL DEFAULT 0,
  avg_rating DOUBLE PRECISION NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  published_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_courses_tutor ON courses (tutor_id);
CREATE INDEX IF NOT EXISTS idx_courses_status ON courses (status);
CREATE INDEX IF NOT EXISTS idx_courses_level ON courses (level);

CREATE TABLE IF NOT EXISTS modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content_type VARCHAR(20) NOT NULL DEFAULT 'text'
    CHECK (content_type IN ('video','text','pdf','mixed')),
  content_url VARCHAR(500),
  content_body TEXT,
  order_index INTEGER NOT NULL,
  is_free_preview BOOLEAN NOT NULL DEFAULT FALSE,
  credits_on_complete INTEGER NOT NULL DEFAULT 10,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_modules_course ON modules (course_id, order_index);

CREATE TABLE IF NOT EXISTS quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  pass_score INTEGER NOT NULL DEFAULT 70,
  credits_on_pass INTEGER NOT NULL DEFAULT 20
);
CREATE INDEX IF NOT EXISTS idx_quizzes_module ON quizzes (module_id);

CREATE TABLE IF NOT EXISTS quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_option VARCHAR(1) NOT NULL,
  order_index INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz ON quiz_questions (quiz_id, order_index);
