use axum::{
    extract::{Path, Query, State},
    http::StatusCode,
    Json,
};
use uuid::Uuid;

use crate::{errors::{AppError, AppResult}, middleware::auth::AuthUser, state::AppState};
use super::schemas::{
    CreateCourseRequest, CreateModuleRequest, ListCoursesQuery, ReorderModulesRequest,
    UpdateCourseRequest, UpdateModuleRequest,
};
use super::service::CourseService;

fn db(state: &AppState) -> AppResult<&sqlx::PgPool> {
    state
        .db()
        .ok_or_else(|| AppError::Internal(anyhow::anyhow!("Database not available")))
}

pub async fn list_courses(
    State(state): State<AppState>,
    Query(q): Query<ListCoursesQuery>,
) -> AppResult<Json<serde_json::Value>> {
    let pool = db(&state)?;
    let limit = q.limit.unwrap_or(50).clamp(1, 100);
    let offset = (q.page.unwrap_or(1).max(1) - 1) * limit;
    let courses = CourseService::list_published(
        pool,
        q.level.as_deref(),
        q.is_free,
        q.tutor_id,
        limit,
        offset,
    )
    .await?;
    Ok(Json(courses))
}

pub async fn list_my_courses(
    State(state): State<AppState>,
    auth: AuthUser,
) -> AppResult<Json<serde_json::Value>> {
    let pool = db(&state)?;
    let courses = CourseService::list_for_owner(pool, &auth).await?;
    Ok(Json(courses))
}

pub async fn get_course(
    State(state): State<AppState>,
    Path(id): Path<Uuid>,
) -> AppResult<Json<serde_json::Value>> {
    let pool = db(&state)?;
    let detail = CourseService::get_detail(pool, id).await?;
    Ok(Json(detail))
}

pub async fn create_course(
    State(state): State<AppState>,
    auth: AuthUser,
    Json(req): Json<CreateCourseRequest>,
) -> AppResult<(StatusCode, Json<serde_json::Value>)> {
    let pool = db(&state)?;
    let course = CourseService::create(pool, &auth, req).await?;
    Ok((StatusCode::CREATED, Json(course)))
}

pub async fn update_course(
    State(state): State<AppState>,
    auth: AuthUser,
    Path(id): Path<Uuid>,
    Json(req): Json<UpdateCourseRequest>,
) -> AppResult<Json<serde_json::Value>> {
    let pool = db(&state)?;
    let course = CourseService::update(pool, &auth, id, req).await?;
    Ok(Json(course))
}

pub async fn publish_course(
    State(state): State<AppState>,
    auth: AuthUser,
    Path(id): Path<Uuid>,
) -> AppResult<Json<serde_json::Value>> {
    let pool = db(&state)?;
    let course = CourseService::submit_for_review(pool, &auth, id).await?;
    Ok(Json(course))
}

pub async fn approve_course(
    State(state): State<AppState>,
    auth: AuthUser,
    Path(id): Path<Uuid>,
) -> AppResult<Json<serde_json::Value>> {
    let pool = db(&state)?;
    let course = CourseService::approve(pool, &auth, id).await?;
    Ok(Json(course))
}

pub async fn add_module(
    State(state): State<AppState>,
    auth: AuthUser,
    Path(id): Path<Uuid>,
    Json(req): Json<CreateModuleRequest>,
) -> AppResult<(StatusCode, Json<serde_json::Value>)> {
    let pool = db(&state)?;
    let module = CourseService::add_module(pool, &auth, id, req).await?;
    Ok((StatusCode::CREATED, Json(module)))
}

pub async fn update_module(
    State(state): State<AppState>,
    auth: AuthUser,
    Path(id): Path<Uuid>,
    Json(req): Json<UpdateModuleRequest>,
) -> AppResult<Json<serde_json::Value>> {
    let pool = db(&state)?;
    let module = CourseService::update_module(pool, &auth, id, req).await?;
    Ok(Json(module))
}

pub async fn delete_module(
    State(state): State<AppState>,
    auth: AuthUser,
    Path(id): Path<Uuid>,
) -> AppResult<StatusCode> {
    let pool = db(&state)?;
    CourseService::delete_module(pool, &auth, id).await?;
    Ok(StatusCode::NO_CONTENT)
}

pub async fn reorder_modules(
    State(state): State<AppState>,
    auth: AuthUser,
    Json(req): Json<ReorderModulesRequest>,
) -> AppResult<Json<serde_json::Value>> {
    let pool = db(&state)?;
    let modules = CourseService::reorder_modules(pool, &auth, req).await?;
    Ok(Json(modules))
}
