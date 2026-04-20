use axum::{async_trait, extract::FromRequestParts, http::request::Parts};
use uuid::Uuid;
use crate::{errors::AppError, state::AppState, utils::jwt::verify_token};

#[derive(Debug, Clone)]
pub struct AuthUser {
    pub id: Uuid,
    pub role: String,
}

#[async_trait]
impl FromRequestParts<AppState> for AuthUser {
    type Rejection = AppError;

    async fn from_request_parts(parts: &mut Parts, state: &AppState) -> Result<Self, Self::Rejection> {
        let auth_header = parts
            .headers
            .get("Authorization")
            .and_then(|v| v.to_str().ok())
            .ok_or(AppError::Unauthorized)?;

        let token = auth_header.strip_prefix("Bearer ").ok_or(AppError::Unauthorized)?;
        let claims = verify_token(token, &state.config.jwt_secret)?;
        let id = Uuid::parse_str(&claims.sub).map_err(|_| AppError::Unauthorized)?;

        Ok(AuthUser { id, role: claims.role })
    }
}
