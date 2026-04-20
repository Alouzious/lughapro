use sqlx::PgPool;
use uuid::Uuid;
use crate::errors::{AppError, AppResult};
use super::{
    repository::UserProfileRepository,
    schemas::{UpdateProfileRequest, UserProfileResponse},
};

pub struct UserProfileService;

impl UserProfileService {
    pub async fn get_profile(pool: &PgPool, user_id: Uuid) -> AppResult<UserProfileResponse> {
        let user = UserProfileRepository::find_by_id(pool, user_id).await?
            .ok_or_else(|| AppError::NotFound("User not found".to_string()))?;
        Ok(UserProfileResponse::from(user))
    }

    pub async fn update_profile(pool: &PgPool, user_id: Uuid, req: UpdateProfileRequest) -> AppResult<UserProfileResponse> {
        let user = UserProfileRepository::update_profile(
            pool,
            user_id,
            req.full_name.as_deref(),
            req.bio.as_deref(),
            req.phone.as_deref(),
            req.location.as_deref(),
            req.profile_image_url.as_deref(),
            req.learning_goals.as_deref(),
            req.learning_level.as_deref(),
        ).await?
        .ok_or_else(|| AppError::NotFound("User not found".to_string()))?;
        Ok(UserProfileResponse::from(user))
    }
}
