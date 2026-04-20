use axum::{extract::State, Json};
use crate::{errors::{AppError, AppResult}, middleware::auth::AuthUser, state::AppState};
use super::{schemas::UpdateProfileRequest, service::UserProfileService};

pub async fn get_me(
    State(state): State<AppState>,
    auth: AuthUser,
) -> AppResult<Json<serde_json::Value>> {
    let pool = state.db().ok_or_else(|| AppError::Internal(anyhow::anyhow!("Database not available")))?;
    let profile = UserProfileService::get_profile(pool, auth.id).await?;
    Ok(Json(serde_json::to_value(profile).unwrap()))
}

pub async fn update_me(
    State(state): State<AppState>,
    auth: AuthUser,
    Json(req): Json<UpdateProfileRequest>,
) -> AppResult<Json<serde_json::Value>> {
    let pool = state.db().ok_or_else(|| AppError::Internal(anyhow::anyhow!("Database not available")))?;
    let profile = UserProfileService::update_profile(pool, auth.id, req).await?;
    Ok(Json(serde_json::to_value(profile).unwrap()))
}
