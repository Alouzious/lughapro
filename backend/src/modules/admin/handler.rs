use axum::{
    extract::{Path, Query, State},
    Json,
};
use serde::Deserialize;
use uuid::Uuid;
use crate::{
    errors::{AppError, AppResult},
    middleware::auth::AuthUser,
    modules::{
        bookings::repository::BookingRepository,
        disputes::repository::DisputeRepository,
        payments::repository::PaymentRepository,
        tutors::{schemas::UpdateVerificationRequest, service::TutorService},
        users::repository::UserProfileRepository,
    },
    state::AppState,
};

#[derive(Debug, Deserialize)]
pub struct PaginationQuery {
    pub page: Option<i64>,
    pub limit: Option<i64>,
}

fn require_admin(auth: &AuthUser) -> AppResult<()> {
    if auth.role != "admin" {
        return Err(AppError::Forbidden);
    }
    Ok(())
}

pub async fn list_users(
    State(state): State<AppState>,
    auth: AuthUser,
    Query(q): Query<PaginationQuery>,
) -> AppResult<Json<serde_json::Value>> {
    require_admin(&auth)?;
    let pool = state.db().ok_or_else(|| AppError::Internal(anyhow::anyhow!("Database not available")))?;
    let page = q.page.unwrap_or(1).max(1);
    let limit = q.limit.unwrap_or(20).min(100).max(1);
    let offset = (page - 1) * limit;
    let users = UserProfileRepository::list_all(pool, limit, offset).await?;
    let total = UserProfileRepository::count_all(pool).await?;
    Ok(Json(serde_json::json!({ "users": users, "total": total, "page": page, "limit": limit })))
}

pub async fn list_tutors(
    State(state): State<AppState>,
    auth: AuthUser,
    Query(q): Query<PaginationQuery>,
) -> AppResult<Json<serde_json::Value>> {
    require_admin(&auth)?;
    let pool = state.db().ok_or_else(|| AppError::Internal(anyhow::anyhow!("Database not available")))?;
    let page = q.page.unwrap_or(1).max(1);
    let limit = q.limit.unwrap_or(20).min(100).max(1);
    let offset = (page - 1) * limit;
    let tutors = UserProfileRepository::list_by_role(pool, "tutor", limit, offset).await?;
    let total = UserProfileRepository::count_by_role(pool, "tutor").await?;
    Ok(Json(serde_json::json!({ "tutors": tutors, "total": total, "page": page, "limit": limit })))
}

pub async fn list_students(
    State(state): State<AppState>,
    auth: AuthUser,
    Query(q): Query<PaginationQuery>,
) -> AppResult<Json<serde_json::Value>> {
    require_admin(&auth)?;
    let pool = state.db().ok_or_else(|| AppError::Internal(anyhow::anyhow!("Database not available")))?;
    let page = q.page.unwrap_or(1).max(1);
    let limit = q.limit.unwrap_or(20).min(100).max(1);
    let offset = (page - 1) * limit;
    let students = UserProfileRepository::list_by_role(pool, "student", limit, offset).await?;
    let total = UserProfileRepository::count_by_role(pool, "student").await?;
    Ok(Json(serde_json::json!({ "students": students, "total": total, "page": page, "limit": limit })))
}

pub async fn list_all_bookings(
    State(state): State<AppState>,
    auth: AuthUser,
    Query(q): Query<PaginationQuery>,
) -> AppResult<Json<serde_json::Value>> {
    require_admin(&auth)?;
    let pool = state.db().ok_or_else(|| AppError::Internal(anyhow::anyhow!("Database not available")))?;
    let page = q.page.unwrap_or(1).max(1);
    let limit = q.limit.unwrap_or(20).min(100).max(1);
    let offset = (page - 1) * limit;
    let bookings = BookingRepository::find_all(pool, limit, offset).await?;
    let total = BookingRepository::count_all(pool).await?;
    Ok(Json(serde_json::json!({ "bookings": bookings, "total": total, "page": page, "limit": limit })))
}

pub async fn list_all_payments(
    State(state): State<AppState>,
    auth: AuthUser,
    Query(q): Query<PaginationQuery>,
) -> AppResult<Json<serde_json::Value>> {
    require_admin(&auth)?;
    let pool = state.db().ok_or_else(|| AppError::Internal(anyhow::anyhow!("Database not available")))?;
    let page = q.page.unwrap_or(1).max(1);
    let limit = q.limit.unwrap_or(20).min(100).max(1);
    let offset = (page - 1) * limit;
    let payments = PaymentRepository::find_all(pool, limit, offset).await?;
    let total = PaymentRepository::count(pool).await?;
    Ok(Json(serde_json::json!({ "payments": payments, "total": total, "page": page, "limit": limit })))
}

pub async fn list_all_disputes(
    State(state): State<AppState>,
    auth: AuthUser,
    Query(q): Query<PaginationQuery>,
) -> AppResult<Json<serde_json::Value>> {
    require_admin(&auth)?;
    let pool = state.db().ok_or_else(|| AppError::Internal(anyhow::anyhow!("Database not available")))?;
    let page = q.page.unwrap_or(1).max(1);
    let limit = q.limit.unwrap_or(20).min(100).max(1);
    let offset = (page - 1) * limit;
    let disputes = DisputeRepository::find_all(pool, limit, offset).await?;
    let total = DisputeRepository::count(pool).await?;
    Ok(Json(serde_json::json!({ "disputes": disputes, "total": total, "page": page, "limit": limit })))
}

pub async fn update_tutor_verification(
    State(state): State<AppState>,
    auth: AuthUser,
    Path(tutor_id): Path<Uuid>,
    Json(req): Json<UpdateVerificationRequest>,
) -> AppResult<Json<serde_json::Value>> {
    require_admin(&auth)?;
    let pool = state.db().ok_or_else(|| AppError::Internal(anyhow::anyhow!("Database not available")))?;
    let profile = TutorService::update_verification_status(pool, tutor_id, &req.status).await?;
    Ok(Json(profile))
}

pub async fn get_stats(
    State(state): State<AppState>,
    auth: AuthUser,
) -> AppResult<Json<serde_json::Value>> {
    require_admin(&auth)?;
    let pool = state.db().ok_or_else(|| AppError::Internal(anyhow::anyhow!("Database not available")))?;
    let total_users = UserProfileRepository::count_all(pool).await?;
    let total_tutors = UserProfileRepository::count_by_role(pool, "tutor").await?;
    let total_students = UserProfileRepository::count_by_role(pool, "student").await?;
    let total_bookings = BookingRepository::count_all(pool).await?;
    let total_payments = PaymentRepository::count(pool).await?;
    let total_disputes = DisputeRepository::count(pool).await?;
    Ok(Json(serde_json::json!({
        "total_users": total_users,
        "total_tutors": total_tutors,
        "total_students": total_students,
        "total_bookings": total_bookings,
        "total_payments": total_payments,
        "total_disputes": total_disputes,
    })))
}
