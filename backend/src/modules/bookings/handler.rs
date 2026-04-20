use axum::{
    extract::{Path, State},
    http::StatusCode,
    Json,
};
use uuid::Uuid;
use crate::{errors::{AppError, AppResult}, middleware::auth::AuthUser, state::AppState};
use super::{schemas::{CreateBookingRequest, UpdateStatusRequest}, service::BookingService};

pub async fn create_booking(
    State(state): State<AppState>,
    auth: AuthUser,
    Json(req): Json<CreateBookingRequest>,
) -> AppResult<(StatusCode, Json<serde_json::Value>)> {
    if auth.role != "student" {
        return Err(AppError::Forbidden);
    }
    let pool = state.db().ok_or_else(|| AppError::Internal(anyhow::anyhow!("Database not available")))?;
    let booking = BookingService::create(pool, auth.id, req).await?;
    Ok((StatusCode::CREATED, Json(booking)))
}

pub async fn get_my_bookings(
    State(state): State<AppState>,
    auth: AuthUser,
) -> AppResult<Json<serde_json::Value>> {
    let pool = state.db().ok_or_else(|| AppError::Internal(anyhow::anyhow!("Database not available")))?;
    let bookings = BookingService::get_my_bookings(pool, auth.id, &auth.role).await?;
    Ok(Json(bookings))
}

pub async fn update_booking_status(
    State(state): State<AppState>,
    auth: AuthUser,
    Path(id): Path<Uuid>,
    Json(req): Json<UpdateStatusRequest>,
) -> AppResult<Json<serde_json::Value>> {
    let pool = state.db().ok_or_else(|| AppError::Internal(anyhow::anyhow!("Database not available")))?;
    let booking = BookingService::update_status(pool, id, auth.id, &auth.role, req).await?;
    Ok(Json(booking))
}
