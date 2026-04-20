use sqlx::PgPool;
use uuid::Uuid;
use crate::errors::{AppError, AppResult};
use super::{
    repository::PaymentRepository,
    schemas::{CreatePaymentRequest, PaymentResponse},
};

pub struct PaymentService;

impl PaymentService {
    pub async fn create_payment(pool: &PgPool, req: CreatePaymentRequest) -> AppResult<PaymentResponse> {
        if req.amount <= 0.0 {
            return Err(AppError::BadRequest("Amount must be positive".to_string()));
        }
        if PaymentRepository::find_by_booking_id(pool, req.booking_id).await?.is_some() {
            return Err(AppError::Conflict("Payment already exists for this booking".to_string()));
        }
        let currency = req.currency.as_deref().unwrap_or("USD");
        let payment = PaymentRepository::create(pool, req.booking_id, req.amount, currency, req.reference_id.as_deref()).await?;
        Ok(PaymentResponse::from(payment))
    }

    pub async fn get_by_booking(pool: &PgPool, booking_id: Uuid) -> AppResult<PaymentResponse> {
        let payment = PaymentRepository::find_by_booking_id(pool, booking_id).await?
            .ok_or_else(|| AppError::NotFound("Payment not found".to_string()))?;
        Ok(PaymentResponse::from(payment))
    }

    pub async fn list_all(pool: &PgPool, page: i64, limit: i64) -> AppResult<serde_json::Value> {
        let page = page.max(1);
        let limit = limit.min(100).max(1);
        let offset = (page - 1) * limit;
        let payments = PaymentRepository::find_all(pool, limit, offset).await?;
        let total = PaymentRepository::count(pool).await?;
        Ok(serde_json::json!({
            "payments": payments.into_iter().map(PaymentResponse::from).collect::<Vec<_>>(),
            "total": total,
            "page": page,
            "limit": limit,
        }))
    }
}
