use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct Course {
    pub id: Uuid,
    pub tutor_id: Option<Uuid>,
    pub title: String,
    pub description: Option<String>,
    pub thumbnail_url: Option<String>,
    pub level: String,
    pub price: f64,
    pub is_free: bool,
    pub status: String,
    pub tags: Option<Vec<String>>,
    pub estimated_hours: Option<i32>,
    pub enrolled_count: i32,
    pub avg_rating: f64,
    pub created_at: DateTime<Utc>,
    pub published_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct CourseWithTutor {
    pub id: Uuid,
    pub tutor_id: Option<Uuid>,
    pub tutor_name: Option<String>,
    pub title: String,
    pub description: Option<String>,
    pub thumbnail_url: Option<String>,
    pub level: String,
    pub price: f64,
    pub is_free: bool,
    pub status: String,
    pub tags: Option<Vec<String>>,
    pub estimated_hours: Option<i32>,
    pub enrolled_count: i32,
    pub avg_rating: f64,
    pub created_at: DateTime<Utc>,
    pub published_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct Module {
    pub id: Uuid,
    pub course_id: Uuid,
    pub title: String,
    pub content_type: String,
    pub content_url: Option<String>,
    pub content_body: Option<String>,
    pub order_index: i32,
    pub is_free_preview: bool,
    pub credits_on_complete: i32,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct Quiz {
    pub id: Uuid,
    pub module_id: Uuid,
    pub pass_score: i32,
    pub credits_on_pass: i32,
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct QuizQuestion {
    pub id: Uuid,
    pub quiz_id: Uuid,
    pub question_text: String,
    pub options: serde_json::Value,
    pub correct_option: String,
    pub order_index: i32,
}
