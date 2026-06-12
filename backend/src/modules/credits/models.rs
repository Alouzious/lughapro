use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct StudentCredits {
    pub id: Uuid,
    pub student_id: Uuid,
    pub total_credits: i32,
    pub level_unlocked: String,
    pub last_updated: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct CreditTransaction {
    pub id: Uuid,
    pub student_id: Uuid,
    pub amount: i32,
    pub reason: String,
    pub reference_id: Option<Uuid>,
    pub stellar_tx_hash: Option<String>,
    pub created_at: DateTime<Utc>,
}
