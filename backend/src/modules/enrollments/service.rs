use chrono::{Duration, Utc};
use serde_json::json;
use sqlx::PgPool;
use std::collections::HashMap;
use uuid::Uuid;

use crate::config::AppConfig;
use crate::errors::{AppError, AppResult};
use crate::modules::courses::repository::CourseRepository;
use crate::modules::credits::service::CreditService;
use super::models::ModuleProgress;
use super::repository::EnrollmentRepository;
use super::schemas::{EnrollRequest, QuizSubmitRequest};

const QUIZ_COOLDOWN_HOURS: i64 = 24;
const COURSE_COMPLETE_BONUS: i32 = 100;

pub struct EnrollmentService;

impl EnrollmentService {
    pub async fn enroll(
        pool: &PgPool,
        student_id: Uuid,
        course_id: Uuid,
        req: EnrollRequest,
    ) -> AppResult<serde_json::Value> {
        let course = CourseRepository::find_by_id(pool, course_id)
            .await?
            .ok_or_else(|| AppError::NotFound("Course not found".into()))?;
        if course.status != "published" {
            return Err(AppError::BadRequest("Course is not available for enrollment".into()));
        }

        if let Some(existing) = EnrollmentRepository::find(pool, student_id, course_id).await? {
            return Ok(json!({ "enrollment": existing, "already_enrolled": true }));
        }

        let (method, paid_amount) = if course.is_free || course.price <= 0.0 {
            ("free".to_string(), 0.0)
        } else {
            let m = req
                .payment_method
                .clone()
                .unwrap_or_default();
            if m != "stripe" && m != "stellar" {
                return Err(AppError::BadRequest(
                    "Paid course requires payment_method 'stripe' or 'stellar'".into(),
                ));
            }
            (m, course.price)
        };

        let enrollment = EnrollmentRepository::create(
            pool,
            student_id,
            course_id,
            paid_amount,
            &method,
            req.stripe_payment_intent.as_deref(),
            req.stellar_tx_hash.as_deref(),
        )
        .await?;
        CourseRepository::increment_enrolled(pool, course_id).await?;

        Ok(json!({ "enrollment": enrollment, "already_enrolled": false }))
    }

    pub async fn list_my_enrollments(pool: &PgPool, student_id: Uuid) -> AppResult<serde_json::Value> {
        let rows = EnrollmentRepository::list_for_student(pool, student_id).await?;
        Ok(json!(rows))
    }

    pub async fn course_progress(
        pool: &PgPool,
        student_id: Uuid,
        course_id: Uuid,
    ) -> AppResult<serde_json::Value> {
        let course = CourseRepository::find_with_tutor(pool, course_id)
            .await?
            .ok_or_else(|| AppError::NotFound("Course not found".into()))?;
        let modules = CourseRepository::list_modules(pool, course_id).await?;
        let enrollment = EnrollmentRepository::find(pool, student_id, course_id).await?;

        let progress_map: HashMap<Uuid, ModuleProgress> = match &enrollment {
            Some(e) => EnrollmentRepository::list_progress(pool, e.id)
                .await?
                .into_iter()
                .map(|p| (p.module_id, p))
                .collect(),
            None => HashMap::new(),
        };

        let enrolled = enrollment.is_some();
        let mut module_views = Vec::with_capacity(modules.len());
        let mut prev_completed = true; // first module is always unlocked
        for m in &modules {
            let progress = progress_map.get(&m.id);
            let completed = progress.map(|p| p.completed).unwrap_or(false);
            let quiz = CourseRepository::find_quiz_by_module(pool, m.id).await?;
            // Unlock rules: free preview always; otherwise need enrollment and the
            // previous module completed.
            let locked = if m.is_free_preview {
                false
            } else if !enrolled {
                true
            } else {
                !prev_completed
            };
            module_views.push(json!({
                "id": m.id,
                "title": m.title,
                "content_type": m.content_type,
                "content_url": m.content_url,
                "content_body": if locked { None } else { m.content_body.clone() },
                "order_index": m.order_index,
                "is_free_preview": m.is_free_preview,
                "credits_on_complete": m.credits_on_complete,
                "has_quiz": quiz.is_some(),
                "completed": completed,
                "quiz_passed": progress.and_then(|p| p.quiz_passed),
                "quiz_score": progress.and_then(|p| p.quiz_score),
                "locked": locked,
            }));
            prev_completed = completed;
        }

        let completed_count = module_views.iter().filter(|m| m["completed"] == json!(true)).count();
        Ok(json!({
            "course": course,
            "enrolled": enrolled,
            "enrollment": enrollment,
            "modules": module_views,
            "completed_count": completed_count,
            "total_modules": modules.len(),
        }))
    }

    /// Ensure prior modules are complete before a module can be worked on.
    async fn assert_sequential_access(
        pool: &PgPool,
        enrollment_id: Uuid,
        course_id: Uuid,
        module_id: Uuid,
        is_free_preview: bool,
    ) -> AppResult<()> {
        if is_free_preview {
            return Ok(());
        }
        let modules = CourseRepository::list_modules(pool, course_id).await?;
        let progress: HashMap<Uuid, ModuleProgress> = EnrollmentRepository::list_progress(pool, enrollment_id)
            .await?
            .into_iter()
            .map(|p| (p.module_id, p))
            .collect();
        for m in &modules {
            if m.id == module_id {
                return Ok(());
            }
            let done = progress.get(&m.id).map(|p| p.completed).unwrap_or(false);
            if !done {
                return Err(AppError::BadRequest(
                    "Complete the previous module first".into(),
                ));
            }
        }
        Ok(())
    }

    async fn maybe_complete_course(
        pool: &PgPool,
        config: &AppConfig,
        student_id: Uuid,
        enrollment_id: Uuid,
        course_id: Uuid,
    ) -> AppResult<bool> {
        let enrollment = EnrollmentRepository::find_by_id(pool, enrollment_id).await?;
        if let Some(e) = &enrollment {
            if e.completed_at.is_some() {
                return Ok(false);
            }
        }
        let total = CourseRepository::count_modules(pool, course_id).await?;
        if total == 0 {
            return Ok(false);
        }
        let progress = EnrollmentRepository::list_progress(pool, enrollment_id).await?;
        let completed = progress.iter().filter(|p| p.completed).count() as i64;
        if completed >= total {
            EnrollmentRepository::mark_completed(pool, enrollment_id).await?;
            CreditService::award(
                pool,
                config,
                student_id,
                COURSE_COMPLETE_BONUS,
                "course_complete",
                Some(course_id),
            )
            .await?;
            return Ok(true);
        }
        Ok(false)
    }

    pub async fn complete_module(
        pool: &PgPool,
        config: &AppConfig,
        student_id: Uuid,
        module_id: Uuid,
    ) -> AppResult<serde_json::Value> {
        let module = CourseRepository::find_module(pool, module_id)
            .await?
            .ok_or_else(|| AppError::NotFound("Module not found".into()))?;
        let enrollment = EnrollmentRepository::find(pool, student_id, module.course_id)
            .await?
            .ok_or_else(|| AppError::Forbidden)?;

        if CourseRepository::find_quiz_by_module(pool, module_id).await?.is_some() {
            return Err(AppError::BadRequest(
                "This module has a quiz; submit the quiz to complete it".into(),
            ));
        }

        if let Some(p) = EnrollmentRepository::get_progress(pool, enrollment.id, module_id).await? {
            if p.completed {
                return Ok(json!({ "progress": p, "already_completed": true }));
            }
        }

        Self::assert_sequential_access(pool, enrollment.id, module.course_id, module_id, module.is_free_preview).await?;

        let progress =
            EnrollmentRepository::mark_complete(pool, enrollment.id, module_id, module.credits_on_complete).await?;
        let credit_result = CreditService::award(
            pool,
            config,
            student_id,
            module.credits_on_complete,
            "module_complete",
            Some(module_id),
        )
        .await?;

        let course_completed =
            Self::maybe_complete_course(pool, config, student_id, enrollment.id, module.course_id).await?;

        Ok(json!({
            "progress": progress,
            "credits": credit_result,
            "course_completed": course_completed,
        }))
    }

    pub async fn submit_quiz(
        pool: &PgPool,
        config: &AppConfig,
        student_id: Uuid,
        module_id: Uuid,
        req: QuizSubmitRequest,
    ) -> AppResult<serde_json::Value> {
        let module = CourseRepository::find_module(pool, module_id)
            .await?
            .ok_or_else(|| AppError::NotFound("Module not found".into()))?;
        let enrollment = EnrollmentRepository::find(pool, student_id, module.course_id)
            .await?
            .ok_or_else(|| AppError::Forbidden)?;
        let quiz = CourseRepository::find_quiz_by_module(pool, module_id)
            .await?
            .ok_or_else(|| AppError::BadRequest("This module has no quiz".into()))?;

        // Already passed → return prior result, no re-award.
        let existing = EnrollmentRepository::get_progress(pool, enrollment.id, module_id).await?;
        if let Some(p) = &existing {
            if p.quiz_passed == Some(true) {
                return Ok(json!({
                    "score": p.quiz_score,
                    "passed": true,
                    "pass_score": quiz.pass_score,
                    "credits_awarded": 0,
                    "already_passed": true,
                }));
            }
            // 24h cooldown after a failed attempt.
            if let Some(last) = p.last_attempt_at {
                if p.quiz_passed != Some(true)
                    && Utc::now() - last < Duration::hours(QUIZ_COOLDOWN_HOURS)
                    && p.quiz_attempts > 0
                {
                    return Err(AppError::BadRequest(format!(
                        "You can retry this quiz in {QUIZ_COOLDOWN_HOURS}h"
                    )));
                }
            }
        }

        Self::assert_sequential_access(pool, enrollment.id, module.course_id, module_id, module.is_free_preview).await?;

        let questions = CourseRepository::list_quiz_questions(pool, quiz.id).await?;
        if questions.is_empty() {
            return Err(AppError::BadRequest("Quiz has no questions".into()));
        }
        let answer_map: HashMap<Uuid, String> = req
            .answers
            .into_iter()
            .map(|a| (a.question_id, a.selected_option))
            .collect();

        let mut correct = 0;
        for q in &questions {
            if let Some(sel) = answer_map.get(&q.id) {
                if sel.eq_ignore_ascii_case(&q.correct_option) {
                    correct += 1;
                }
            }
        }
        let total = questions.len() as i32;
        let score = ((correct as f64 / total as f64) * 100.0).round() as i32;
        let passed = score >= quiz.pass_score;

        let newly_passed = passed && existing.as_ref().map(|p| p.quiz_passed != Some(true)).unwrap_or(true);
        let credits = if newly_passed { quiz.credits_on_pass } else { 0 };

        let progress =
            EnrollmentRepository::record_quiz_attempt(pool, enrollment.id, module_id, score, passed, credits)
                .await?;

        let mut credit_result = json!(null);
        let mut course_completed = false;
        if newly_passed {
            credit_result =
                CreditService::award(pool, config, student_id, credits, "quiz_pass", Some(module_id)).await?;
            course_completed =
                Self::maybe_complete_course(pool, config, student_id, enrollment.id, module.course_id).await?;
        }

        Ok(json!({
            "score": score,
            "passed": passed,
            "pass_score": quiz.pass_score,
            "correct": correct,
            "total": total,
            "credits_awarded": credits,
            "credits": credit_result,
            "progress": progress,
            "course_completed": course_completed,
        }))
    }

    /// Return quiz questions for an accessible module, without exposing the
    /// correct answers.
    pub async fn get_quiz(
        pool: &PgPool,
        student_id: Uuid,
        module_id: Uuid,
    ) -> AppResult<serde_json::Value> {
        let module = CourseRepository::find_module(pool, module_id)
            .await?
            .ok_or_else(|| AppError::NotFound("Module not found".into()))?;
        if !module.is_free_preview
            && EnrollmentRepository::find(pool, student_id, module.course_id)
                .await?
                .is_none()
        {
            return Err(AppError::Forbidden);
        }
        let quiz = CourseRepository::find_quiz_by_module(pool, module_id)
            .await?
            .ok_or_else(|| AppError::NotFound("This module has no quiz".into()))?;
        let questions = CourseRepository::list_quiz_questions(pool, quiz.id).await?;
        let public_questions: Vec<_> = questions
            .iter()
            .map(|q| json!({
                "id": q.id,
                "question_text": q.question_text,
                "options": q.options,
                "order_index": q.order_index,
            }))
            .collect();
        Ok(json!({
            "pass_score": quiz.pass_score,
            "credits_on_pass": quiz.credits_on_pass,
            "questions": public_questions,
        }))
    }

    pub async fn quiz_result(
        pool: &PgPool,
        student_id: Uuid,
        module_id: Uuid,
    ) -> AppResult<serde_json::Value> {
        let module = CourseRepository::find_module(pool, module_id)
            .await?
            .ok_or_else(|| AppError::NotFound("Module not found".into()))?;
        let enrollment = EnrollmentRepository::find(pool, student_id, module.course_id)
            .await?
            .ok_or_else(|| AppError::Forbidden)?;
        let progress = EnrollmentRepository::get_progress(pool, enrollment.id, module_id).await?;
        Ok(json!(progress))
    }
}
