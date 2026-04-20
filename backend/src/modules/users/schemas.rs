use serde::{Deserialize, Serialize};
use super::models::UserProfile;

#[derive(Debug, Deserialize)]
pub struct UpdateProfileRequest {
    pub full_name: Option<String>,
    pub bio: Option<String>,
    pub phone: Option<String>,
    pub location: Option<String>,
    pub profile_image_url: Option<String>,
    pub learning_goals: Option<String>,
    pub learning_level: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct UserProfileResponse {
    pub id: String,
    pub email: String,
    pub full_name: String,
    pub role: String,
    pub phone: Option<String>,
    pub location: Option<String>,
    pub profile_image_url: Option<String>,
    pub bio: Option<String>,
    pub learning_goals: Option<String>,
    pub learning_level: Option<String>,
}

impl From<UserProfile> for UserProfileResponse {
    fn from(u: UserProfile) -> Self {
        Self {
            id: u.id.to_string(),
            email: u.email,
            full_name: u.full_name,
            role: u.role,
            phone: u.phone,
            location: u.location,
            profile_image_url: u.profile_image_url,
            bio: u.bio,
            learning_goals: u.learning_goals,
            learning_level: u.learning_level,
        }
    }
}
