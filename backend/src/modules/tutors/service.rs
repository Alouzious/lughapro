use sqlx::PgPool;
use tracing::info;
use uuid::Uuid;
use crate::errors::{AppError, AppResult};
use super::{
    repository::TutorRepository,
    schemas::{CreateProfileRequest, TutorListItem, TutorListQuery, TutorListResponse, UpdateProfileRequest},
};

pub struct TutorService;

impl TutorService {
    pub async fn create_profile(pool: &PgPool, user_id: Uuid, req: CreateProfileRequest) -> AppResult<serde_json::Value> {
        if req.bio.trim().is_empty() {
            return Err(AppError::BadRequest("Bio is required".to_string()));
        }
        if req.hourly_rate <= 0.0 {
            return Err(AppError::BadRequest("Hourly rate must be positive".to_string()));
        }
        if TutorRepository::find_by_user_id(pool, user_id).await?.is_some() {
            return Err(AppError::Conflict("Tutor profile already exists".to_string()));
        }
        let profile = TutorRepository::create(
            pool,
            user_id,
            req.bio.trim(),
            req.hourly_rate,
            req.availability_summary.as_deref(),
            req.expertise.as_deref(),
            req.profile_image_url.as_deref(),
            req.phone.as_deref(),
            req.location.as_deref(),
            req.teaching_focus.as_deref(),
        ).await?;
        info!("Tutor profile created for user {}", user_id);
        Ok(serde_json::to_value(profile).unwrap())
    }

    pub async fn get_profile(pool: &PgPool, user_id: Uuid) -> AppResult<serde_json::Value> {
        let profile = TutorRepository::find_by_user_id(pool, user_id).await?
            .ok_or_else(|| AppError::NotFound("Tutor profile not found".to_string()))?;
        Ok(serde_json::to_value(profile).unwrap())
    }

    pub async fn update_profile(pool: &PgPool, user_id: Uuid, req: UpdateProfileRequest) -> AppResult<serde_json::Value> {
        if let Some(rate) = req.hourly_rate {
            if rate <= 0.0 {
                return Err(AppError::BadRequest("Hourly rate must be positive".to_string()));
            }
        }
        let profile = TutorRepository::update(
            pool,
            user_id,
            req.bio.as_deref(),
            req.hourly_rate,
            req.availability_summary.as_deref(),
            req.expertise.as_deref(),
            req.profile_image_url.as_deref(),
            req.phone.as_deref(),
            req.location.as_deref(),
            req.teaching_focus.as_deref(),
        ).await?
        .ok_or_else(|| AppError::NotFound("Tutor profile not found".to_string()))?;
        Ok(serde_json::to_value(profile).unwrap())
    }

    pub async fn list_tutors(pool: &PgPool, query: TutorListQuery) -> AppResult<TutorListResponse> {
        let page = query.page.unwrap_or(1).max(1);
        let limit = query.limit.unwrap_or(10).min(100).max(1);
        let offset = (page - 1) * limit;
        let vs = query.verification_status.as_deref();

        let tutors = TutorRepository::list(pool, limit, offset, vs).await?;
        let total = TutorRepository::count(pool, vs).await?;

        Ok(TutorListResponse {
            tutors: tutors.into_iter().map(|t| TutorListItem {
                id: t.id.to_string(),
                full_name: t.full_name,
                bio: t.bio,
                hourly_rate: t.hourly_rate,
                availability_summary: t.availability_summary,
                expertise: t.expertise,
                verification_status: t.verification_status,
                profile_image_url: t.profile_image_url,
                average_rating: t.average_rating,
            }).collect(),
            total,
            page,
            limit,
        })
    }

    pub async fn update_verification_status(pool: &PgPool, user_id: Uuid, status: &str) -> AppResult<serde_json::Value> {
        let valid = ["pending_review", "verified", "rejected", "suspended"];
        if !valid.contains(&status) {
            return Err(AppError::BadRequest(format!("Invalid verification status: {}", status)));
        }
        let profile = TutorRepository::update_verification_status(pool, user_id, status).await?
            .ok_or_else(|| AppError::NotFound("Tutor profile not found".to_string()))?;
        Ok(serde_json::to_value(profile).unwrap())
    }
}
