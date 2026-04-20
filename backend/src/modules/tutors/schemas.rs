use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize)]
pub struct CreateProfileRequest {
    pub bio: String,
    pub hourly_rate: f64,
    pub availability_summary: Option<String>,
    pub expertise: Option<String>,
    pub profile_image_url: Option<String>,
    pub phone: Option<String>,
    pub location: Option<String>,
    pub teaching_focus: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateProfileRequest {
    pub bio: Option<String>,
    pub hourly_rate: Option<f64>,
    pub availability_summary: Option<String>,
    pub expertise: Option<String>,
    pub profile_image_url: Option<String>,
    pub phone: Option<String>,
    pub location: Option<String>,
    pub teaching_focus: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct TutorListQuery {
    pub page: Option<i64>,
    pub limit: Option<i64>,
    pub expertise: Option<String>,
    pub verification_status: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct TutorListResponse {
    pub tutors: Vec<TutorListItem>,
    pub total: i64,
    pub page: i64,
    pub limit: i64,
}

#[derive(Debug, Serialize)]
pub struct TutorListItem {
    pub id: String,
    pub full_name: String,
    pub bio: String,
    pub hourly_rate: f64,
    pub availability_summary: Option<String>,
    pub expertise: Option<String>,
    pub verification_status: String,
    pub profile_image_url: Option<String>,
    pub average_rating: f64,
}

#[derive(Debug, Deserialize)]
pub struct UpdateVerificationRequest {
    pub status: String,
}
