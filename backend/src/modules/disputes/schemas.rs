use serde::{Deserialize, Serialize};
use uuid::Uuid;
use super::models::Dispute;

#[derive(Debug, Deserialize)]
pub struct CreateDisputeRequest {
    pub booking_id: Uuid,
    pub reason: String,
}

#[derive(Debug, Deserialize)]
pub struct UpdateDisputeStatusRequest {
    pub status: String,
}

#[derive(Debug, Serialize)]
pub struct DisputeResponse {
    pub id: String,
    pub booking_id: String,
    pub raised_by: String,
    pub reason: String,
    pub status: String,
}

impl From<Dispute> for DisputeResponse {
    fn from(d: Dispute) -> Self {
        Self {
            id: d.id.to_string(),
            booking_id: d.booking_id.to_string(),
            raised_by: d.raised_by.to_string(),
            reason: d.reason,
            status: d.status,
        }
    }
}

#[derive(Debug, Serialize, sqlx::FromRow)]
pub struct DisputeWithNames {
    pub id: String,
    pub booking_id: String,
    pub raised_by: String,
    pub raised_by_name: String,
    pub reason: String,
    pub status: String,
}
