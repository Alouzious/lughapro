use serde::Deserialize;
use uuid::Uuid;

#[derive(Debug, Deserialize)]
pub struct CreateRatingRequest {
    pub tutor_id: Uuid,
    pub booking_id: Uuid,
    pub rating: i32,
    pub review_text: Option<String>,
}
