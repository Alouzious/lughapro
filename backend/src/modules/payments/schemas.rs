use serde::{Deserialize, Serialize};
use uuid::Uuid;
use super::models::Payment;

#[derive(Debug, Deserialize)]
pub struct CreatePaymentRequest {
    pub booking_id: Uuid,
    pub amount: f64,
    pub currency: Option<String>,
    pub reference_id: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct UpdatePaymentStatusRequest {
    pub status: String,
}

#[derive(Debug, Serialize)]
pub struct PaymentResponse {
    pub id: String,
    pub booking_id: String,
    pub amount: f64,
    pub currency: String,
    pub status: String,
    pub reference_id: Option<String>,
    pub funds_locked: bool,
    pub ready_for_release: bool,
    pub released: bool,
    pub refund_pending: bool,
}

impl From<Payment> for PaymentResponse {
    fn from(p: Payment) -> Self {
        Self {
            id: p.id.to_string(),
            booking_id: p.booking_id.to_string(),
            amount: p.amount,
            currency: p.currency,
            status: p.status,
            reference_id: p.reference_id,
            funds_locked: p.funds_locked,
            ready_for_release: p.ready_for_release,
            released: p.released,
            refund_pending: p.refund_pending,
        }
    }
}
