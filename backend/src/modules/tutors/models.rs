use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct TutorProfile {
    pub id: Uuid,
    pub user_id: Uuid,
    pub bio: String,
    pub hourly_rate: f64,
    pub availability_summary: Option<String>,
    pub expertise: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct TutorListing {
    pub id: Uuid,
    pub full_name: String,
    pub profile_id: Uuid,
    pub bio: String,
    pub hourly_rate: f64,
    pub availability_summary: Option<String>,
    pub expertise: Option<String>,
    pub average_rating: f64,
}
