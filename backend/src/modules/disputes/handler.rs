use axum::{
    extract::{Path, State},
    http::StatusCode,
    Json,
};
use uuid::Uuid;
use crate::{errors::{AppError, AppResult}, middleware::auth::AuthUser, state::AppState};
use super::{
    schemas::{CreateDisputeRequest, UpdateDisputeStatusRequest},
    service::DisputeService,
};

pub async fn create_dispute(
    State(state): State<AppState>,
    auth: AuthUser,
    Json(req): Json<CreateDisputeRequest>,
) -> AppResult<(StatusCode, Json<serde_json::Value>)> {
    let pool = state.db().ok_or_else(|| AppError::Internal(anyhow::anyhow!("Database not available")))?;
    let dispute = DisputeService::create_dispute(pool, auth.id, req).await?;
    Ok((StatusCode::CREATED, Json(serde_json::to_value(dispute).unwrap())))
}

pub async fn get_my_disputes(
    State(state): State<AppState>,
    auth: AuthUser,
) -> AppResult<Json<serde_json::Value>> {
    let pool = state.db().ok_or_else(|| AppError::Internal(anyhow::anyhow!("Database not available")))?;
    let disputes = DisputeService::get_my_disputes(pool, auth.id).await?;
    Ok(Json(serde_json::to_value(disputes).unwrap()))
}

pub async fn update_dispute_status(
    State(state): State<AppState>,
    auth: AuthUser,
    Path(dispute_id): Path<Uuid>,
    Json(req): Json<UpdateDisputeStatusRequest>,
) -> AppResult<Json<serde_json::Value>> {
    if auth.role != "admin" {
        return Err(AppError::Forbidden);
    }
    let pool = state.db().ok_or_else(|| AppError::Internal(anyhow::anyhow!("Database not available")))?;
    let dispute = DisputeService::update_status(pool, dispute_id, &req.status).await?;
    Ok(Json(serde_json::to_value(dispute).unwrap()))
}
