use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct Rating {
    pub id: Uuid,
    pub student_id: Uuid,
    pub tutor_id: Uuid,
    pub booking_id: Uuid,
    pub rating: i32,
    pub review_text: Option<String>,
    pub created_at: DateTime<Utc>,
}
