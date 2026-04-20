use sqlx::PgPool;
use uuid::Uuid;
use crate::errors::AppResult;
use super::models::Payment;

pub struct PaymentRepository;

impl PaymentRepository {
    pub async fn create(
        pool: &PgPool,
        booking_id: Uuid,
        amount: f64,
        currency: &str,
        reference_id: Option<&str>,
    ) -> AppResult<Payment> {
        let payment = sqlx::query_as::<_, Payment>(
            "INSERT INTO payments (booking_id, amount, currency, reference_id) VALUES ($1, $2, $3, $4) \
             RETURNING id, booking_id, amount, currency, status, reference_id, funds_locked, ready_for_release, released, refund_pending, created_at, updated_at"
        )
        .bind(booking_id)
        .bind(amount)
        .bind(currency)
        .bind(reference_id)
        .fetch_one(pool)
        .await?;
        Ok(payment)
    }

    pub async fn find_by_booking_id(pool: &PgPool, booking_id: Uuid) -> AppResult<Option<Payment>> {
        let payment = sqlx::query_as::<_, Payment>(
            "SELECT id, booking_id, amount, currency, status, reference_id, funds_locked, ready_for_release, released, refund_pending, created_at, updated_at FROM payments WHERE booking_id = $1"
        )
        .bind(booking_id)
        .fetch_optional(pool)
        .await?;
        Ok(payment)
    }

    pub async fn find_all(pool: &PgPool, limit: i64, offset: i64) -> AppResult<Vec<Payment>> {
        let payments = sqlx::query_as::<_, Payment>(
            "SELECT id, booking_id, amount, currency, status, reference_id, funds_locked, ready_for_release, released, refund_pending, created_at, updated_at FROM payments ORDER BY created_at DESC LIMIT $1 OFFSET $2"
        )
        .bind(limit)
        .bind(offset)
        .fetch_all(pool)
        .await?;
        Ok(payments)
    }

    pub async fn count(pool: &PgPool) -> AppResult<i64> {
        let row: (i64,) = sqlx::query_as("SELECT COUNT(*) FROM payments")
            .fetch_one(pool)
            .await?;
        Ok(row.0)
    }

    pub async fn update_status(pool: &PgPool, booking_id: Uuid, status: &str) -> AppResult<Option<Payment>> {
        let payment = sqlx::query_as::<_, Payment>(
            "UPDATE payments SET status = $2, updated_at = NOW() WHERE booking_id = $1 \
             RETURNING id, booking_id, amount, currency, status, reference_id, funds_locked, ready_for_release, released, refund_pending, created_at, updated_at"
        )
        .bind(booking_id)
        .bind(status)
        .fetch_optional(pool)
        .await?;
        Ok(payment)
    }
}
