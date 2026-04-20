use sqlx::PgPool;
use uuid::Uuid;
use crate::errors::AppResult;
use super::models::User;

pub struct UserRepository;

impl UserRepository {
    pub async fn find_by_email(pool: &PgPool, email: &str) -> AppResult<Option<User>> {
        let user = sqlx::query_as::<_, User>(
            "SELECT id, email, password_hash, full_name, role, phone, location, profile_image_url, bio, learning_goals, learning_level, created_at, updated_at FROM users WHERE email = $1"
        )
        .bind(email)
        .fetch_optional(pool)
        .await?;
        Ok(user)
    }

    pub async fn find_by_id(pool: &PgPool, id: Uuid) -> AppResult<Option<User>> {
        let user = sqlx::query_as::<_, User>(
            "SELECT id, email, password_hash, full_name, role, phone, location, profile_image_url, bio, learning_goals, learning_level, created_at, updated_at FROM users WHERE id = $1"
        )
        .bind(id)
        .fetch_optional(pool)
        .await?;
        Ok(user)
    }

    pub async fn create(pool: &PgPool, email: &str, password_hash: &str, full_name: &str, role: &str) -> AppResult<User> {
        let user = sqlx::query_as::<_, User>(
            "INSERT INTO users (email, password_hash, full_name, role) VALUES ($1, $2, $3, $4) RETURNING id, email, password_hash, full_name, role, phone, location, profile_image_url, bio, learning_goals, learning_level, created_at, updated_at"
        )
        .bind(email)
        .bind(password_hash)
        .bind(full_name)
        .bind(role)
        .fetch_one(pool)
        .await?;
        Ok(user)
    }
}
