use axum::{
    extract::{Path, State},
    http::StatusCode,
    Json,
};
use uuid::Uuid;
use crate::{errors::{AppError, AppResult}, middleware::auth::AuthUser, state::AppState};
use super::{schemas::CreateRatingRequest, service::RatingService};

pub async fn create_rating(
    State(state): State<AppState>,
    auth: AuthUser,
    Json(req): Json<CreateRatingRequest>,
) -> AppResult<(StatusCode, Json<serde_json::Value>)> {
    if auth.role != "student" {
        return Err(AppError::Forbidden);
    }
    let pool = state.db().ok_or_else(|| AppError::Internal(anyhow::anyhow!("Database not available")))?;
    let rating = RatingService::create(pool, auth.id, req).await?;
    Ok((StatusCode::CREATED, Json(rating)))
}

pub async fn get_tutor_ratings(
    State(state): State<AppState>,
    Path(id): Path<Uuid>,
) -> AppResult<Json<serde_json::Value>> {
    let pool = state.db().ok_or_else(|| AppError::Internal(anyhow::anyhow!("Database not available")))?;
    let ratings = RatingService::get_tutor_ratings(pool, id).await?;
    Ok(Json(ratings))
}

pub async fn get_average_rating(
    State(state): State<AppState>,
    Path(id): Path<Uuid>,
) -> AppResult<Json<serde_json::Value>> {
    let pool = state.db().ok_or_else(|| AppError::Internal(anyhow::anyhow!("Database not available")))?;
    let avg = RatingService::get_average_rating(pool, id).await?;
    Ok(Json(avg))
}
