use axum::{extract::State, Json};

use crate::{errors::{AppError, AppResult}, middleware::auth::AuthUser, state::AppState};
use super::service::CreditService;

fn db(state: &AppState) -> AppResult<&sqlx::PgPool> {
    state
        .db()
        .ok_or_else(|| AppError::Internal(anyhow::anyhow!("Database not available")))
}

pub async fn get_my_credits(
    State(state): State<AppState>,
    auth: AuthUser,
) -> AppResult<Json<serde_json::Value>> {
    let pool = db(&state)?;
    let summary = CreditService::get_summary(pool, auth.id).await?;
    Ok(Json(summary))
}

pub async fn get_history(
    State(state): State<AppState>,
    auth: AuthUser,
) -> AppResult<Json<serde_json::Value>> {
    let pool = db(&state)?;
    let history = CreditService::get_history(pool, auth.id).await?;
    Ok(Json(history))
}

pub async fn sync(
    State(state): State<AppState>,
    auth: AuthUser,
) -> AppResult<Json<serde_json::Value>> {
    // Reads are served from the Postgres mirror; this re-derives the level from
    // the stored credit total to keep the mirror self-consistent.
    let pool = db(&state)?;
    let summary = CreditService::get_summary(pool, auth.id).await?;
    Ok(Json(summary))
}
