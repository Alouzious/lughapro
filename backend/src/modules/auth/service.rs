use bcrypt::{hash, verify, DEFAULT_COST};
use sqlx::PgPool;
use tracing::info;
use crate::errors::{AppError, AppResult};
use super::{
    models::User,
    repository::UserRepository,
    schemas::{AuthResponse, LoginRequest, RegisterRequest, UserInfo},
};
use crate::utils::jwt::generate_token;

pub struct AuthService;

impl AuthService {
    pub async fn register(pool: &PgPool, req: RegisterRequest, jwt_secret: &str, jwt_expiry_hours: i64) -> AppResult<AuthResponse> {
        if req.email.is_empty() || !req.email.contains('@') {
            return Err(AppError::BadRequest("Invalid email address".to_string()));
        }
        if req.password.len() < 8 {
            return Err(AppError::BadRequest("Password must be at least 8 characters".to_string()));
        }
        if req.full_name.trim().is_empty() {
            return Err(AppError::BadRequest("Full name is required".to_string()));
        }

        let role = req.role.as_deref().unwrap_or("student");
        if !["student", "tutor", "admin"].contains(&role) {
            return Err(AppError::BadRequest("Invalid role. Must be student, tutor, or admin".to_string()));
        }

        if UserRepository::find_by_email(pool, &req.email).await?.is_some() {
            return Err(AppError::Conflict("An account with this email already exists".to_string()));
        }

        let password_hash = hash(&req.password, DEFAULT_COST)
            .map_err(|e| AppError::Internal(anyhow::anyhow!("Hash error: {}", e)))?;

        let user = UserRepository::create(pool, &req.email, &password_hash, req.full_name.trim(), role).await?;
        info!("New user registered: {} ({})", user.email, user.role);

        let token = generate_token(&user.id, &user.role, jwt_secret, jwt_expiry_hours)?;
        Ok(build_auth_response(token, user))
    }

    pub async fn login(pool: &PgPool, req: LoginRequest, jwt_secret: &str, jwt_expiry_hours: i64) -> AppResult<AuthResponse> {
        let user = UserRepository::find_by_email(pool, &req.email).await?
            .ok_or_else(|| AppError::Unauthorized)?;

        let valid = verify(&req.password, &user.password_hash)
            .map_err(|e| AppError::Internal(anyhow::anyhow!("Verify error: {}", e)))?;

        if !valid {
            return Err(AppError::Unauthorized);
        }

        let token = generate_token(&user.id, &user.role, jwt_secret, jwt_expiry_hours)?;
        Ok(build_auth_response(token, user))
    }
}

fn build_auth_response(token: String, user: User) -> AuthResponse {
    AuthResponse {
        token,
        user: UserInfo {
            id: user.id,
            email: user.email,
            full_name: user.full_name,
            role: user.role,
        },
    }
}
