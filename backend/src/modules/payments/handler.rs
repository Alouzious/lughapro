use axum::{
    extract::{Path, Query, State},
    http::StatusCode,
    Json,
};
use serde::Deserialize;
use uuid::Uuid;
use crate::{errors::{AppError, AppResult}, middleware::auth::AuthUser, state::AppState};
use super::{schemas::CreatePaymentRequest, service::PaymentService};

#[derive(Debug, Deserialize)]
pub struct PaginationQuery {
    pub page: Option<i64>,
    pub limit: Option<i64>,
}

pub async fn create_payment(
    State(state): State<AppState>,
    _auth: AuthUser,
    Json(req): Json<CreatePaymentRequest>,
) -> AppResult<(StatusCode, Json<serde_json::Value>)> {
    let pool = state.db().ok_or_else(|| AppError::Internal(anyhow::anyhow!("Database not available")))?;
    let payment = PaymentService::create_payment(pool, req).await?;
    Ok((StatusCode::CREATED, Json(serde_json::to_value(payment).unwrap())))
}

pub async fn get_payment_for_booking(
    State(state): State<AppState>,
    _auth: AuthUser,
    Path(booking_id): Path<Uuid>,
) -> AppResult<Json<serde_json::Value>> {
    let pool = state.db().ok_or_else(|| AppError::Internal(anyhow::anyhow!("Database not available")))?;
    let payment = PaymentService::get_by_booking(pool, booking_id).await?;
    Ok(Json(serde_json::to_value(payment).unwrap()))
}

pub async fn list_my_payments(
    State(state): State<AppState>,
    _auth: AuthUser,
    Query(q): Query<PaginationQuery>,
) -> AppResult<Json<serde_json::Value>> {
    let pool = state.db().ok_or_else(|| AppError::Internal(anyhow::anyhow!("Database not available")))?;
    let result = PaymentService::list_all(pool, q.page.unwrap_or(1), q.limit.unwrap_or(10)).await?;
    Ok(Json(result))
}
