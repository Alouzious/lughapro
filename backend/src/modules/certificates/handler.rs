use axum::{
    extract::{Path, State},
    Json,
};
use serde::Deserialize;
use uuid::Uuid;

use crate::{errors::{AppError, AppResult}, middleware::auth::AuthUser, state::AppState};
use super::service::CertificateService;

fn db(state: &AppState) -> AppResult<&sqlx::PgPool> {
    state
        .db()
        .ok_or_else(|| AppError::Internal(anyhow::anyhow!("Database not available")))
}

pub async fn get_my_certificates(
    State(state): State<AppState>,
    auth: AuthUser,
) -> AppResult<Json<serde_json::Value>> {
    let pool = db(&state)?;
    let certs = CertificateService::list_for_student(pool, auth.id).await?;
    Ok(Json(certs))
}

pub async fn verify(
    State(state): State<AppState>,
    Path(tx_hash): Path<String>,
) -> AppResult<Json<serde_json::Value>> {
    let pool = db(&state)?;
    let result = CertificateService::verify(pool, &tx_hash).await?;
    Ok(Json(result))
}

#[derive(Debug, Deserialize)]
pub struct MintRequest {
    pub student_id: Uuid,
    pub level: String,
}

pub async fn mint(
    State(state): State<AppState>,
    auth: AuthUser,
    Json(req): Json<MintRequest>,
) -> AppResult<Json<serde_json::Value>> {
    if auth.role != "admin" {
        return Err(AppError::Forbidden);
    }
    let pool = db(&state)?;
    let result = CertificateService::issue_for_level(pool, &state.config, req.student_id, &req.level)
        .await?
        .unwrap_or_else(|| serde_json::json!({ "message": "Certificate already issued" }));
    Ok(Json(result))
}
