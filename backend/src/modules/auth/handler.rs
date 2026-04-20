use axum::{extract::State, http::StatusCode, Json};
use tracing::error;
use crate::{errors::{AppError, AppResult}, state::AppState};
use super::{schemas::{AuthResponse, LoginRequest, RegisterRequest}, service::AuthService};

pub async fn register(
    State(state): State<AppState>,
    Json(req): Json<RegisterRequest>,
) -> AppResult<(StatusCode, Json<AuthResponse>)> {
    let pool = state.db().ok_or_else(|| {
        error!("Database not configured");
        AppError::Internal(anyhow::anyhow!("Database not available"))
    })?;
    let resp = AuthService::register(pool, req, &state.config.jwt_secret, state.config.jwt_expiry_hours).await?;
    Ok((StatusCode::CREATED, Json(resp)))
}

pub async fn login(
    State(state): State<AppState>,
    Json(req): Json<LoginRequest>,
) -> AppResult<Json<AuthResponse>> {
    let pool = state.db().ok_or_else(|| {
        error!("Database not configured");
        AppError::Internal(anyhow::anyhow!("Database not available"))
    })?;
    let resp = AuthService::login(pool, req, &state.config.jwt_secret, state.config.jwt_expiry_hours).await?;
    Ok(Json(resp))
}
