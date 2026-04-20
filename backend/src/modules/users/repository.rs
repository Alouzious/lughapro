use sqlx::PgPool;
use uuid::Uuid;
use crate::errors::AppResult;
use super::models::UserProfile;

pub struct UserProfileRepository;

impl UserProfileRepository {
    pub async fn find_by_id(pool: &PgPool, id: Uuid) -> AppResult<Option<UserProfile>> {
        let user = sqlx::query_as::<_, UserProfile>(
            "SELECT id, email, full_name, role, phone, location, profile_image_url, bio, learning_goals, learning_level, created_at, updated_at FROM users WHERE id = $1"
        )
        .bind(id)
        .fetch_optional(pool)
        .await?;
        Ok(user)
    }

    pub async fn update_profile(
        pool: &PgPool,
        id: Uuid,
        full_name: Option<&str>,
        bio: Option<&str>,
        phone: Option<&str>,
        location: Option<&str>,
        profile_image_url: Option<&str>,
        learning_goals: Option<&str>,
        learning_level: Option<&str>,
    ) -> AppResult<Option<UserProfile>> {
        let user = sqlx::query_as::<_, UserProfile>(
            "UPDATE users SET
                full_name = COALESCE($2, full_name),
                bio = COALESCE($3, bio),
                phone = COALESCE($4, phone),
                location = COALESCE($5, location),
                profile_image_url = COALESCE($6, profile_image_url),
                learning_goals = COALESCE($7, learning_goals),
                learning_level = COALESCE($8, learning_level),
                updated_at = NOW()
             WHERE id = $1
             RETURNING id, email, full_name, role, phone, location, profile_image_url, bio, learning_goals, learning_level, created_at, updated_at"
        )
        .bind(id)
        .bind(full_name)
        .bind(bio)
        .bind(phone)
        .bind(location)
        .bind(profile_image_url)
        .bind(learning_goals)
        .bind(learning_level)
        .fetch_optional(pool)
        .await?;
        Ok(user)
    }

    pub async fn list_all(pool: &PgPool, limit: i64, offset: i64) -> AppResult<Vec<UserProfile>> {
        let users = sqlx::query_as::<_, UserProfile>(
            "SELECT id, email, full_name, role, phone, location, profile_image_url, bio, learning_goals, learning_level, created_at, updated_at FROM users ORDER BY created_at DESC LIMIT $1 OFFSET $2"
        )
        .bind(limit)
        .bind(offset)
        .fetch_all(pool)
        .await?;
        Ok(users)
    }

    pub async fn list_by_role(pool: &PgPool, role: &str, limit: i64, offset: i64) -> AppResult<Vec<UserProfile>> {
        let users = sqlx::query_as::<_, UserProfile>(
            "SELECT id, email, full_name, role, phone, location, profile_image_url, bio, learning_goals, learning_level, created_at, updated_at FROM users WHERE role = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3"
        )
        .bind(role)
        .bind(limit)
        .bind(offset)
        .fetch_all(pool)
        .await?;
        Ok(users)
    }

    pub async fn count_by_role(pool: &PgPool, role: &str) -> AppResult<i64> {
        let row: (i64,) = sqlx::query_as("SELECT COUNT(*) FROM users WHERE role = $1")
            .bind(role)
            .fetch_one(pool)
            .await?;
        Ok(row.0)
    }

    pub async fn count_all(pool: &PgPool) -> AppResult<i64> {
        let row: (i64,) = sqlx::query_as("SELECT COUNT(*) FROM users")
            .fetch_one(pool)
            .await?;
        Ok(row.0)
    }
}
