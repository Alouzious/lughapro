use sqlx::PgPool;
use tracing::info;
use uuid::Uuid;
use crate::errors::{AppError, AppResult};
use super::{repository::RatingRepository, schemas::CreateRatingRequest};

pub struct RatingService;

impl RatingService {
    pub async fn create(pool: &PgPool, student_id: Uuid, req: CreateRatingRequest) -> AppResult<serde_json::Value> {
        if req.rating < 1 || req.rating > 5 {
            return Err(AppError::BadRequest("Rating must be between 1 and 5".to_string()));
        }

        let booking: Option<(uuid::Uuid, String, uuid::Uuid, uuid::Uuid)> = sqlx::query_as(
            "SELECT id, status, student_id, tutor_id FROM bookings WHERE id = $1"
        )
        .bind(req.booking_id)
        .fetch_optional(pool)
        .await
        .map_err(|e| AppError::Internal(anyhow::anyhow!("DB error: {}", e)))?;

        let (_, status, booking_student_id, booking_tutor_id) = booking
            .ok_or_else(|| AppError::NotFound("Booking not found".to_string()))?;

        if booking_student_id != student_id {
            return Err(AppError::Forbidden);
        }
        if booking_tutor_id != req.tutor_id {
            return Err(AppError::BadRequest("Tutor ID does not match booking".to_string()));
        }
        if status != "completed" {
            return Err(AppError::BadRequest("Can only rate completed bookings".to_string()));
        }

        if RatingRepository::exists_for_booking(pool, req.booking_id).await? {
            return Err(AppError::Conflict("This booking has already been rated".to_string()));
        }

        let rating = RatingRepository::create(
            pool,
            student_id,
            req.tutor_id,
            req.booking_id,
            req.rating,
            req.review_text.as_deref(),
        ).await?;

        info!("Rating created for tutor {} by student {}", req.tutor_id, student_id);
        Ok(serde_json::to_value(rating).unwrap())
    }

    pub async fn get_tutor_ratings(pool: &PgPool, tutor_id: Uuid) -> AppResult<serde_json::Value> {
        let ratings = RatingRepository::find_for_tutor(pool, tutor_id).await?;
        Ok(serde_json::to_value(ratings).unwrap())
    }

    pub async fn get_average_rating(pool: &PgPool, tutor_id: Uuid) -> AppResult<serde_json::Value> {
        let avg = RatingRepository::average_for_tutor(pool, tutor_id).await?;
        Ok(serde_json::json!({ "tutor_id": tutor_id, "average_rating": avg }))
    }
}
