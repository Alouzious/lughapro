use serde::Deserialize;
use uuid::Uuid;

#[derive(Debug, Deserialize)]
pub struct ListCoursesQuery {
    pub level: Option<String>,
    pub is_free: Option<bool>,
    pub tutor_id: Option<Uuid>,
    pub status: Option<String>,
    pub limit: Option<i64>,
    pub page: Option<i64>,
}

#[derive(Debug, Deserialize)]
pub struct CreateCourseRequest {
    pub title: String,
    pub description: Option<String>,
    pub thumbnail_url: Option<String>,
    pub level: String,
    #[serde(default)]
    pub price: f64,
    pub tags: Option<Vec<String>>,
    pub estimated_hours: Option<i32>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateCourseRequest {
    pub title: Option<String>,
    pub description: Option<String>,
    pub thumbnail_url: Option<String>,
    pub level: Option<String>,
    pub price: Option<f64>,
    pub tags: Option<Vec<String>>,
    pub estimated_hours: Option<i32>,
    pub status: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct CreateModuleRequest {
    pub title: String,
    pub content_type: String,
    pub content_url: Option<String>,
    pub content_body: Option<String>,
    pub order_index: Option<i32>,
    #[serde(default)]
    pub is_free_preview: bool,
    pub credits_on_complete: Option<i32>,
    pub quiz: Option<CreateQuizRequest>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateModuleRequest {
    pub title: Option<String>,
    pub content_type: Option<String>,
    pub content_url: Option<String>,
    pub content_body: Option<String>,
    pub order_index: Option<i32>,
    pub is_free_preview: Option<bool>,
    pub credits_on_complete: Option<i32>,
}

#[derive(Debug, Deserialize)]
pub struct CreateQuizRequest {
    pub pass_score: Option<i32>,
    pub credits_on_pass: Option<i32>,
    pub questions: Vec<CreateQuizQuestion>,
}

#[derive(Debug, Deserialize)]
pub struct CreateQuizQuestion {
    pub question_text: String,
    pub options: serde_json::Value,
    pub correct_option: String,
}

#[derive(Debug, Deserialize)]
pub struct ReorderModulesRequest {
    pub course_id: Uuid,
    pub module_ids: Vec<Uuid>,
}
