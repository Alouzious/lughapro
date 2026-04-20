use chrono::Utc;
use sqlx::PgPool;
use tracing::info;
use uuid::Uuid;
use crate::errors::{AppError, AppResult};
use super::{
    repository::BookingRepository,
    schemas::{CreateBookingRequest, UpdateStatusRequest},
};

pub struct BookingService;

impl BookingService {
    pub async fn create(pool: &PgPool, student_id: Uuid, req: CreateBookingRequest) -> AppResult<serde_json::Value> {
        if req.session_time <= Utc::now() {
            return Err(AppError::BadRequest("Session time must be in the future".to_string()));
        }

        let tutor_exists: (bool,) = sqlx::query_as(
            "SELECT EXISTS(SELECT 1 FROM users WHERE id = $1 AND role = 'tutor')"
        )
        .bind(req.tutor_id)
        .fetch_one(pool)
        .await
        .map_err(|e| AppError::Internal(anyhow::anyhow!("DB error: {}", e)))?;

        if !tutor_exists.0 {
            return Err(AppError::NotFound("Tutor not found".to_string()));
        }

        let booking = BookingRepository::create(
            pool,
            student_id,
            req.tutor_id,
            req.session_time,
            req.notes.as_deref(),
        ).await?;

        info!("Booking created: {} (student: {}, tutor: {})", booking.id, student_id, req.tutor_id);
        Ok(serde_json::to_value(booking).unwrap())
    }

    pub async fn get_my_bookings(pool: &PgPool, user_id: Uuid, role: &str) -> AppResult<serde_json::Value> {
        let bookings = match role {
            "tutor" => BookingRepository::find_for_tutor(pool, user_id).await?,
            _ => BookingRepository::find_for_student(pool, user_id).await?,
        };
        Ok(serde_json::to_value(bookings).unwrap())
    }

    pub async fn update_status(pool: &PgPool, booking_id: Uuid, user_id: Uuid, role: &str, req: UpdateStatusRequest) -> AppResult<serde_json::Value> {
        let booking = BookingRepository::find_by_id(pool, booking_id).await?
            .ok_or_else(|| AppError::NotFound("Booking not found".to_string()))?;

        let valid_statuses = ["pending", "confirmed", "completed", "cancelled"];
        if !valid_statuses.contains(&req.status.as_str()) {
            return Err(AppError::BadRequest(format!(
                "Invalid status: {}. Must be one of: pending, confirmed, completed, cancelled",
                req.status
            )));
        }

        match (booking.status.as_str(), req.status.as_str(), role) {
            ("pending", "confirmed", "tutor") if booking.tutor_id == user_id => {},
            ("confirmed" | "pending", "completed", "tutor") if booking.tutor_id == user_id => {},
            ("confirmed" | "pending", "completed", "admin") => {},
            (_, "cancelled", "student") if booking.student_id == user_id => {},
            (_, "cancelled", "tutor") if booking.tutor_id == user_id => {},
            _ => return Err(AppError::Forbidden),
        }

        let updated = BookingRepository::update_status(pool, booking_id, &req.status).await?
            .ok_or_else(|| AppError::NotFound("Booking not found".to_string()))?;

        info!("Booking {} status updated to {}", booking_id, req.status);
        Ok(serde_json::to_value(updated).unwrap())
    }
}
