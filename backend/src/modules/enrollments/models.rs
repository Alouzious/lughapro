use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct Enrollment {
    pub id: Uuid,
    pub student_id: Uuid,
    pub course_id: Uuid,
    pub paid_amount: f64,
    pub payment_method: String,
    pub stripe_payment_intent: Option<String>,
    pub stellar_tx_hash: Option<String>,
    pub enrolled_at: DateTime<Utc>,
    pub completed_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct EnrollmentWithCourse {
    pub id: Uuid,
    pub student_id: Uuid,
    pub course_id: Uuid,
    pub course_title: String,
    pub course_level: String,
    pub thumbnail_url: Option<String>,
    pub paid_amount: f64,
    pub payment_method: String,
    pub enrolled_at: DateTime<Utc>,
    pub completed_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct ModuleProgress {
    pub id: Uuid,
    pub enrollment_id: Uuid,
    pub module_id: Uuid,
    pub completed: bool,
    pub quiz_score: Option<i32>,
    pub quiz_passed: Option<bool>,
    pub quiz_attempts: i32,
    pub last_attempt_at: Option<DateTime<Utc>>,
    pub completed_at: Option<DateTime<Utc>>,
    pub credits_awarded: i32,
}
