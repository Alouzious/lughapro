use sqlx::PgPool;
use uuid::Uuid;
use crate::errors::AppResult;
use super::models::Dispute;
use super::schemas::DisputeWithNames;

pub struct DisputeRepository;

impl DisputeRepository {
    pub async fn create(pool: &PgPool, booking_id: Uuid, raised_by: Uuid, reason: &str) -> AppResult<Dispute> {
        let dispute = sqlx::query_as::<_, Dispute>(
            "INSERT INTO disputes (booking_id, raised_by, reason) VALUES ($1, $2, $3) \
             RETURNING id, booking_id, raised_by, reason, status, created_at, updated_at"
        )
        .bind(booking_id)
        .bind(raised_by)
        .bind(reason)
        .fetch_one(pool)
        .await?;
        Ok(dispute)
    }

    pub async fn find_by_id(pool: &PgPool, id: Uuid) -> AppResult<Option<Dispute>> {
        let dispute = sqlx::query_as::<_, Dispute>(
            "SELECT id, booking_id, raised_by, reason, status, created_at, updated_at FROM disputes WHERE id = $1"
        )
        .bind(id)
        .fetch_optional(pool)
        .await?;
        Ok(dispute)
    }

    pub async fn find_by_booking(pool: &PgPool, booking_id: Uuid) -> AppResult<Option<Dispute>> {
        let dispute = sqlx::query_as::<_, Dispute>(
            "SELECT id, booking_id, raised_by, reason, status, created_at, updated_at FROM disputes WHERE booking_id = $1"
        )
        .bind(booking_id)
        .fetch_optional(pool)
        .await?;
        Ok(dispute)
    }

    pub async fn find_for_user(pool: &PgPool, user_id: Uuid) -> AppResult<Vec<Dispute>> {
        let disputes = sqlx::query_as::<_, Dispute>(
            "SELECT id, booking_id, raised_by, reason, status, created_at, updated_at FROM disputes WHERE raised_by = $1 ORDER BY created_at DESC"
        )
        .bind(user_id)
        .fetch_all(pool)
        .await?;
        Ok(disputes)
    }

    pub async fn find_all(pool: &PgPool, limit: i64, offset: i64) -> AppResult<Vec<DisputeWithNames>> {
        let disputes = sqlx::query_as::<_, DisputeWithNames>(
            r#"SELECT
                d.id::TEXT,
                d.booking_id::TEXT,
                d.raised_by::TEXT,
                u.full_name AS raised_by_name,
                d.reason,
                d.status
            FROM disputes d
            JOIN users u ON u.id = d.raised_by
            ORDER BY d.created_at DESC
            LIMIT $1 OFFSET $2"#
        )
        .bind(limit)
        .bind(offset)
        .fetch_all(pool)
        .await?;
        Ok(disputes)
    }

    pub async fn update_status(pool: &PgPool, id: Uuid, status: &str) -> AppResult<Option<Dispute>> {
        let dispute = sqlx::query_as::<_, Dispute>(
            "UPDATE disputes SET status = $2, updated_at = NOW() WHERE id = $1 \
             RETURNING id, booking_id, raised_by, reason, status, created_at, updated_at"
        )
        .bind(id)
        .bind(status)
        .fetch_optional(pool)
        .await?;
        Ok(dispute)
    }

    pub async fn count(pool: &PgPool) -> AppResult<i64> {
        let row: (i64,) = sqlx::query_as("SELECT COUNT(*) FROM disputes")
            .fetch_one(pool)
            .await?;
        Ok(row.0)
    }
}
