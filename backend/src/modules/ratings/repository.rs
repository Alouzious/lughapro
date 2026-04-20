use sqlx::PgPool;
use uuid::Uuid;
use crate::errors::AppResult;
use super::models::Rating;

pub struct RatingRepository;

impl RatingRepository {
    pub async fn create(pool: &PgPool, student_id: Uuid, tutor_id: Uuid, booking_id: Uuid, rating: i32, review_text: Option<&str>) -> AppResult<Rating> {
        let r = sqlx::query_as::<_, Rating>(
            "INSERT INTO ratings (student_id, tutor_id, booking_id, rating, review_text) VALUES ($1, $2, $3, $4, $5) RETURNING id, student_id, tutor_id, booking_id, rating, review_text, created_at"
        )
        .bind(student_id)
        .bind(tutor_id)
        .bind(booking_id)
        .bind(rating)
        .bind(review_text)
        .fetch_one(pool)
        .await?;
        Ok(r)
    }

    pub async fn find_for_tutor(pool: &PgPool, tutor_id: Uuid) -> AppResult<Vec<Rating>> {
        let ratings = sqlx::query_as::<_, Rating>(
            "SELECT id, student_id, tutor_id, booking_id, rating, review_text, created_at FROM ratings WHERE tutor_id = $1 ORDER BY created_at DESC"
        )
        .bind(tutor_id)
        .fetch_all(pool)
        .await?;
        Ok(ratings)
    }

    pub async fn average_for_tutor(pool: &PgPool, tutor_id: Uuid) -> AppResult<f64> {
        let row: (f64,) = sqlx::query_as(
            "SELECT CAST(COALESCE(AVG(rating), 0) AS DOUBLE PRECISION) FROM ratings WHERE tutor_id = $1"
        )
        .bind(tutor_id)
        .fetch_one(pool)
        .await?;
        Ok(row.0)
    }

    pub async fn exists_for_booking(pool: &PgPool, booking_id: Uuid) -> AppResult<bool> {
        let row: (bool,) = sqlx::query_as(
            "SELECT EXISTS(SELECT 1 FROM ratings WHERE booking_id = $1)"
        )
        .bind(booking_id)
        .fetch_one(pool)
        .await?;
        Ok(row.0)
    }
}
