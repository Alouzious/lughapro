use axum::{
    extract::{Path, State},
    http::StatusCode,
    Json,
};
use uuid::Uuid;

use crate::{errors::{AppError, AppResult}, middleware::auth::AuthUser, state::AppState};
use super::schemas::{EnrollRequest, QuizSubmitRequest};
use super::service::EnrollmentService;

fn db(state: &AppState) -> AppResult<&sqlx::PgPool> {
    state
        .db()
        .ok_or_else(|| AppError::Internal(anyhow::anyhow!("Database not available")))
}

pub async fn enroll(
    State(state): State<AppState>,
    auth: AuthUser,
    Path(course_id): Path<Uuid>,
    Json(req): Json<EnrollRequest>,
) -> AppResult<(StatusCode, Json<serde_json::Value>)> {
    let pool = db(&state)?;
    let result = EnrollmentService::enroll(pool, auth.id, course_id, req).await?;
    Ok((StatusCode::CREATED, Json(result)))
}

pub async fn my_enrollments(
    State(state): State<AppState>,
    auth: AuthUser,
) -> AppResult<Json<serde_json::Value>> {
    let pool = db(&state)?;
    let result = EnrollmentService::list_my_enrollments(pool, auth.id).await?;
    Ok(Json(result))
}

pub async fn course_progress(
    State(state): State<AppState>,
    auth: AuthUser,
    Path(course_id): Path<Uuid>,
) -> AppResult<Json<serde_json::Value>> {
    let pool = db(&state)?;
    let result = EnrollmentService::course_progress(pool, auth.id, course_id).await?;
    Ok(Json(result))
}

pub async fn complete_module(
    State(state): State<AppState>,
    auth: AuthUser,
    Path(module_id): Path<Uuid>,
) -> AppResult<Json<serde_json::Value>> {
    let pool = db(&state)?;
    let result = EnrollmentService::complete_module(pool, &state.config, auth.id, module_id).await?;
    Ok(Json(result))
}

pub async fn submit_quiz(
    State(state): State<AppState>,
    auth: AuthUser,
    Path(module_id): Path<Uuid>,
    Json(req): Json<QuizSubmitRequest>,
) -> AppResult<Json<serde_json::Value>> {
    let pool = db(&state)?;
    let result = EnrollmentService::submit_quiz(pool, &state.config, auth.id, module_id, req).await?;
    Ok(Json(result))
}

pub async fn quiz_result(
    State(state): State<AppState>,
    auth: AuthUser,
    Path(module_id): Path<Uuid>,
) -> AppResult<Json<serde_json::Value>> {
    let pool = db(&state)?;
    let result = EnrollmentService::quiz_result(pool, auth.id, module_id).await?;
    Ok(Json(result))
}

pub async fn get_quiz(
    State(state): State<AppState>,
    auth: AuthUser,
    Path(module_id): Path<Uuid>,
) -> AppResult<Json<serde_json::Value>> {
    let pool = db(&state)?;
    let result = EnrollmentService::get_quiz(pool, auth.id, module_id).await?;
    Ok(Json(result))
}
