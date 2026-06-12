use sqlx::PgPool;
use uuid::Uuid;

use crate::errors::AppResult;
use super::models::{CreditTransaction, StudentCredits};

pub struct CreditRepository;

impl CreditRepository {
    pub async fn get_or_create(pool: &PgPool, student_id: Uuid) -> AppResult<StudentCredits> {
        let row = sqlx::query_as::<_, StudentCredits>(
            r#"INSERT INTO student_credits (student_id) VALUES ($1)
               ON CONFLICT (student_id) DO UPDATE SET student_id = EXCLUDED.student_id
               RETURNING id, student_id, total_credits, level_unlocked, last_updated"#,
        )
        .bind(student_id)
        .fetch_one(pool)
        .await?;
        Ok(row)
    }

    pub async fn get(pool: &PgPool, student_id: Uuid) -> AppResult<Option<StudentCredits>> {
        let row = sqlx::query_as::<_, StudentCredits>(
            "SELECT id, student_id, total_credits, level_unlocked, last_updated FROM student_credits WHERE student_id = $1",
        )
        .bind(student_id)
        .fetch_optional(pool)
        .await?;
        Ok(row)
    }

    pub async fn update_totals(
        pool: &PgPool,
        student_id: Uuid,
        total_credits: i32,
        level_unlocked: &str,
    ) -> AppResult<StudentCredits> {
        let row = sqlx::query_as::<_, StudentCredits>(
            r#"UPDATE student_credits
               SET total_credits = $2, level_unlocked = $3, last_updated = NOW()
               WHERE student_id = $1
               RETURNING id, student_id, total_credits, level_unlocked, last_updated"#,
        )
        .bind(student_id)
        .bind(total_credits)
        .bind(level_unlocked)
        .fetch_one(pool)
        .await?;
        Ok(row)
    }

    pub async fn log_transaction(
        pool: &PgPool,
        student_id: Uuid,
        amount: i32,
        reason: &str,
        reference_id: Option<Uuid>,
        stellar_tx_hash: Option<&str>,
    ) -> AppResult<CreditTransaction> {
        let row = sqlx::query_as::<_, CreditTransaction>(
            r#"INSERT INTO credit_transactions (student_id, amount, reason, reference_id, stellar_tx_hash)
               VALUES ($1, $2, $3, $4, $5)
               RETURNING id, student_id, amount, reason, reference_id, stellar_tx_hash, created_at"#,
        )
        .bind(student_id)
        .bind(amount)
        .bind(reason)
        .bind(reference_id)
        .bind(stellar_tx_hash)
        .fetch_one(pool)
        .await?;
        Ok(row)
    }

    pub async fn history(pool: &PgPool, student_id: Uuid, limit: i64) -> AppResult<Vec<CreditTransaction>> {
        let rows = sqlx::query_as::<_, CreditTransaction>(
            r#"SELECT id, student_id, amount, reason, reference_id, stellar_tx_hash, created_at
               FROM credit_transactions WHERE student_id = $1 ORDER BY created_at DESC LIMIT $2"#,
        )
        .bind(student_id)
        .bind(limit)
        .fetch_all(pool)
        .await?;
        Ok(rows)
    }
}
