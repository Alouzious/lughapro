use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct Payment {
    pub id: Uuid,
    pub booking_id: Uuid,
    pub amount: f64,
    pub currency: String,
    pub status: String,
    pub reference_id: Option<String>,
    pub funds_locked: bool,
    pub ready_for_release: bool,
    pub released: bool,
    pub refund_pending: bool,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}
