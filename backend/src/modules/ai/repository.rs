use sqlx::PgPool;
use uuid::Uuid;

use crate::errors::AppResult;

pub struct AiRepository;

impl AiRepository {
    pub async fn today_usage(pool: &PgPool, student_id: Uuid) -> AppResult<i32> {
        let row: Option<(i32,)> = sqlx::query_as(
            "SELECT messages_used FROM ai_daily_usage WHERE student_id = $1 AND date = CURRENT_DATE",
        )
        .bind(student_id)
        .fetch_optional(pool)
        .await?;
        Ok(row.map(|r| r.0).unwrap_or(0))
    }

    /// Increment today's counter and return the new value.
    pub async fn increment_usage(pool: &PgPool, student_id: Uuid) -> AppResult<i32> {
        let row: (i32,) = sqlx::query_as(
            r#"INSERT INTO ai_daily_usage (student_id, date, messages_used)
               VALUES ($1, CURRENT_DATE, 1)
               ON CONFLICT (student_id, date)
               DO UPDATE SET messages_used = ai_daily_usage.messages_used + 1
               RETURNING messages_used"#,
        )
        .bind(student_id)
        .fetch_one(pool)
        .await?;
        Ok(row.0)
    }

    pub async fn subscription_tier(pool: &PgPool, student_id: Uuid) -> AppResult<String> {
        let row: Option<(String,)> =
            sqlx::query_as("SELECT subscription_tier FROM users WHERE id = $1")
                .bind(student_id)
                .fetch_optional(pool)
                .await?;
        Ok(row.map(|r| r.0).unwrap_or_else(|| "free".to_string()))
    }
}
