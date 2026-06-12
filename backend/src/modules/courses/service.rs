use serde_json::json;
use sqlx::PgPool;
use uuid::Uuid;

use crate::errors::{AppError, AppResult};
use crate::middleware::auth::AuthUser;
use super::repository::CourseRepository;
use super::schemas::{
    CreateCourseRequest, CreateModuleRequest, ReorderModulesRequest, UpdateCourseRequest,
    UpdateModuleRequest,
};

const VALID_LEVELS: [&str; 6] = ["A1", "A2", "B1", "B2", "C1", "C2"];

pub struct CourseService;

impl CourseService {
    fn validate_level(level: &str) -> AppResult<()> {
        if !VALID_LEVELS.contains(&level) {
            return Err(AppError::BadRequest(format!("Invalid level: {level}")));
        }
        Ok(())
    }

    pub async fn list_published(
        pool: &PgPool,
        level: Option<&str>,
        is_free: Option<bool>,
        tutor_id: Option<Uuid>,
        limit: i64,
        offset: i64,
    ) -> AppResult<serde_json::Value> {
        let courses =
            CourseRepository::list(pool, level, is_free, tutor_id, Some("published"), limit, offset)
                .await?;
        Ok(json!(courses))
    }

    pub async fn list_for_owner(pool: &PgPool, auth: &AuthUser) -> AppResult<serde_json::Value> {
        let tutor_filter = if auth.role == "admin" { None } else { Some(auth.id) };
        let courses = CourseRepository::list(pool, None, None, tutor_filter, None, 200, 0).await?;
        Ok(json!(courses))
    }

    pub async fn get_detail(pool: &PgPool, course_id: Uuid) -> AppResult<serde_json::Value> {
        let course = CourseRepository::find_with_tutor(pool, course_id)
            .await?
            .ok_or_else(|| AppError::NotFound("Course not found".into()))?;

        let modules = CourseRepository::list_modules(pool, course_id).await?;
        let mut module_views = Vec::with_capacity(modules.len());
        for m in &modules {
            let quiz = CourseRepository::find_quiz_by_module(pool, m.id).await?;
            module_views.push(json!({
                "id": m.id,
                "title": m.title,
                "content_type": m.content_type,
                "order_index": m.order_index,
                "is_free_preview": m.is_free_preview,
                "credits_on_complete": m.credits_on_complete,
                "has_quiz": quiz.is_some(),
            }));
        }

        Ok(json!({ "course": course, "modules": module_views }))
    }

    pub async fn create(
        pool: &PgPool,
        auth: &AuthUser,
        req: CreateCourseRequest,
    ) -> AppResult<serde_json::Value> {
        if auth.role != "tutor" && auth.role != "admin" {
            return Err(AppError::Forbidden);
        }
        Self::validate_level(&req.level)?;
        // Admins publish official courses directly; tutors start as drafts.
        let status = if auth.role == "admin" { "published" } else { "draft" };
        let course = CourseRepository::create(pool, auth.id, &req, status).await?;
        if status == "published" {
            CourseRepository::set_status(pool, course.id, "published", true).await?;
        }
        Ok(json!(course))
    }

    async fn require_owner_or_admin(pool: &PgPool, auth: &AuthUser, course_id: Uuid) -> AppResult<()> {
        let course = CourseRepository::find_by_id(pool, course_id)
            .await?
            .ok_or_else(|| AppError::NotFound("Course not found".into()))?;
        if auth.role == "admin" || course.tutor_id == Some(auth.id) {
            Ok(())
        } else {
            Err(AppError::Forbidden)
        }
    }

    pub async fn update(
        pool: &PgPool,
        auth: &AuthUser,
        course_id: Uuid,
        req: UpdateCourseRequest,
    ) -> AppResult<serde_json::Value> {
        Self::require_owner_or_admin(pool, auth, course_id).await?;
        if let Some(level) = &req.level {
            Self::validate_level(level)?;
        }
        // Only admins may directly set arbitrary status via update.
        let mut req = req;
        if auth.role != "admin" {
            req.status = None;
        }
        let course = CourseRepository::update(pool, course_id, &req)
            .await?
            .ok_or_else(|| AppError::NotFound("Course not found".into()))?;
        Ok(json!(course))
    }

    pub async fn submit_for_review(
        pool: &PgPool,
        auth: &AuthUser,
        course_id: Uuid,
    ) -> AppResult<serde_json::Value> {
        Self::require_owner_or_admin(pool, auth, course_id).await?;
        // Admin-owned submissions publish immediately.
        let (status, publish) = if auth.role == "admin" {
            ("published", true)
        } else {
            ("pending_review", false)
        };
        let course = CourseRepository::set_status(pool, course_id, status, publish)
            .await?
            .ok_or_else(|| AppError::NotFound("Course not found".into()))?;
        Ok(json!(course))
    }

    pub async fn approve(pool: &PgPool, auth: &AuthUser, course_id: Uuid) -> AppResult<serde_json::Value> {
        if auth.role != "admin" {
            return Err(AppError::Forbidden);
        }
        let course = CourseRepository::set_status(pool, course_id, "published", true)
            .await?
            .ok_or_else(|| AppError::NotFound("Course not found".into()))?;
        Ok(json!(course))
    }

    pub async fn add_module(
        pool: &PgPool,
        auth: &AuthUser,
        course_id: Uuid,
        req: CreateModuleRequest,
    ) -> AppResult<serde_json::Value> {
        Self::require_owner_or_admin(pool, auth, course_id).await?;
        let order_index = match req.order_index {
            Some(o) => o,
            None => CourseRepository::next_module_order(pool, course_id).await?,
        };
        let module = CourseRepository::create_module(pool, course_id, &req, order_index).await?;

        if let Some(quiz_req) = &req.quiz {
            let quiz = CourseRepository::create_quiz(
                pool,
                module.id,
                quiz_req.pass_score.unwrap_or(70),
                quiz_req.credits_on_pass.unwrap_or(20),
            )
            .await?;
            for (i, q) in quiz_req.questions.iter().enumerate() {
                CourseRepository::create_quiz_question(
                    pool,
                    quiz.id,
                    &q.question_text,
                    &q.options,
                    &q.correct_option,
                    i as i32,
                )
                .await?;
            }
        }

        Ok(json!(module))
    }

    pub async fn update_module(
        pool: &PgPool,
        auth: &AuthUser,
        module_id: Uuid,
        req: UpdateModuleRequest,
    ) -> AppResult<serde_json::Value> {
        let module = CourseRepository::find_module(pool, module_id)
            .await?
            .ok_or_else(|| AppError::NotFound("Module not found".into()))?;
        Self::require_owner_or_admin(pool, auth, module.course_id).await?;
        let updated = CourseRepository::update_module(pool, module_id, &req)
            .await?
            .ok_or_else(|| AppError::NotFound("Module not found".into()))?;
        Ok(json!(updated))
    }

    pub async fn delete_module(pool: &PgPool, auth: &AuthUser, module_id: Uuid) -> AppResult<()> {
        let module = CourseRepository::find_module(pool, module_id)
            .await?
            .ok_or_else(|| AppError::NotFound("Module not found".into()))?;
        Self::require_owner_or_admin(pool, auth, module.course_id).await?;
        CourseRepository::delete_module(pool, module_id).await?;
        Ok(())
    }

    pub async fn reorder_modules(
        pool: &PgPool,
        auth: &AuthUser,
        req: ReorderModulesRequest,
    ) -> AppResult<serde_json::Value> {
        Self::require_owner_or_admin(pool, auth, req.course_id).await?;
        for (i, module_id) in req.module_ids.iter().enumerate() {
            CourseRepository::set_module_order(pool, *module_id, (i as i32) + 1).await?;
        }
        let modules = CourseRepository::list_modules(pool, req.course_id).await?;
        Ok(json!(modules))
    }
}
