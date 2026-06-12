use axum::{extract::State, Json};

use crate::{errors::{AppError, AppResult}, middleware::auth::AuthUser, state::AppState};
use super::service::{AiService, ChatRequest};

fn db(state: &AppState) -> AppResult<&sqlx::PgPool> {
    state
        .db()
        .ok_or_else(|| AppError::Internal(anyhow::anyhow!("Database not available")))
}

pub async fn chat(
    State(state): State<AppState>,
    auth: AuthUser,
    Json(req): Json<ChatRequest>,
) -> AppResult<Json<serde_json::Value>> {
    let pool = db(&state)?;
    let result = AiService::chat(pool, &state.config, auth.id, req).await?;
    Ok(Json(result))
}

pub async fn usage(
    State(state): State<AppState>,
    auth: AuthUser,
) -> AppResult<Json<serde_json::Value>> {
    let pool = db(&state)?;
    let result = AiService::usage(pool, &state.config, auth.id).await?;
    Ok(Json(result))
}
