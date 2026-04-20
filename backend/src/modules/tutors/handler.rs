use axum::{extract::{Query, State}, http::StatusCode, Json};
use crate::{errors::{AppError, AppResult}, middleware::auth::AuthUser, state::AppState};
use super::{schemas::{CreateProfileRequest, TutorListQuery, UpdateProfileRequest}, service::TutorService};

pub async fn list_tutors(
    State(state): State<AppState>,
    Query(query): Query<TutorListQuery>,
) -> AppResult<Json<serde_json::Value>> {
    let pool = state.db().ok_or_else(|| AppError::Internal(anyhow::anyhow!("Database not available")))?;
    let result = TutorService::list_tutors(pool, query).await?;
    Ok(Json(serde_json::to_value(result).unwrap()))
}

pub async fn create_profile(
    State(state): State<AppState>,
    auth: AuthUser,
    Json(req): Json<CreateProfileRequest>,
) -> AppResult<(StatusCode, Json<serde_json::Value>)> {
    if auth.role != "tutor" {
        return Err(AppError::Forbidden);
    }
    let pool = state.db().ok_or_else(|| AppError::Internal(anyhow::anyhow!("Database not available")))?;
    let profile = TutorService::create_profile(pool, auth.id, req).await?;
    Ok((StatusCode::CREATED, Json(profile)))
}

pub async fn get_profile(
    State(state): State<AppState>,
    auth: AuthUser,
) -> AppResult<Json<serde_json::Value>> {
    let pool = state.db().ok_or_else(|| AppError::Internal(anyhow::anyhow!("Database not available")))?;
    let profile = TutorService::get_profile(pool, auth.id).await?;
    Ok(Json(profile))
}

pub async fn update_profile(
    State(state): State<AppState>,
    auth: AuthUser,
    Json(req): Json<UpdateProfileRequest>,
) -> AppResult<Json<serde_json::Value>> {
    if auth.role != "tutor" {
        return Err(AppError::Forbidden);
    }
    let pool = state.db().ok_or_else(|| AppError::Internal(anyhow::anyhow!("Database not available")))?;
    let profile = TutorService::update_profile(pool, auth.id, req).await?;
    Ok(Json(profile))
}
