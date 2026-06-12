use sqlx::PgPool;
use uuid::Uuid;

use crate::errors::AppResult;
use super::models::{Enrollment, EnrollmentWithCourse, ModuleProgress};

pub struct EnrollmentRepository;

impl EnrollmentRepository {
    pub async fn find(pool: &PgPool, student_id: Uuid, course_id: Uuid) -> AppResult<Option<Enrollment>> {
        let row = sqlx::query_as::<_, Enrollment>(
            r#"SELECT id, student_id, course_id, paid_amount, payment_method,
                 stripe_payment_intent, stellar_tx_hash, enrolled_at, completed_at
               FROM enrollments WHERE student_id = $1 AND course_id = $2"#,
        )
        .bind(student_id)
        .bind(course_id)
        .fetch_optional(pool)
        .await?;
        Ok(row)
    }

    pub async fn find_by_id(pool: &PgPool, id: Uuid) -> AppResult<Option<Enrollment>> {
        let row = sqlx::query_as::<_, Enrollment>(
            r#"SELECT id, student_id, course_id, paid_amount, payment_method,
                 stripe_payment_intent, stellar_tx_hash, enrolled_at, completed_at
               FROM enrollments WHERE id = $1"#,
        )
        .bind(id)
        .fetch_optional(pool)
        .await?;
        Ok(row)
    }

    pub async fn create(
        pool: &PgPool,
        student_id: Uuid,
        course_id: Uuid,
        paid_amount: f64,
        payment_method: &str,
        stripe_payment_intent: Option<&str>,
        stellar_tx_hash: Option<&str>,
    ) -> AppResult<Enrollment> {
        let row = sqlx::query_as::<_, Enrollment>(
            r#"INSERT INTO enrollments (student_id, course_id, paid_amount, payment_method, stripe_payment_intent, stellar_tx_hash)
               VALUES ($1, $2, $3, $4, $5, $6)
               RETURNING id, student_id, course_id, paid_amount, payment_method,
                 stripe_payment_intent, stellar_tx_hash, enrolled_at, completed_at"#,
        )
        .bind(student_id)
        .bind(course_id)
        .bind(paid_amount)
        .bind(payment_method)
        .bind(stripe_payment_intent)
        .bind(stellar_tx_hash)
        .fetch_one(pool)
        .await?;
        Ok(row)
    }

    pub async fn list_for_student(pool: &PgPool, student_id: Uuid) -> AppResult<Vec<EnrollmentWithCourse>> {
        let rows = sqlx::query_as::<_, EnrollmentWithCourse>(
            r#"SELECT e.id, e.student_id, e.course_id, c.title AS course_title, c.level AS course_level,
                 c.thumbnail_url, e.paid_amount, e.payment_method, e.enrolled_at, e.completed_at
               FROM enrollments e
               JOIN courses c ON c.id = e.course_id
               WHERE e.student_id = $1
               ORDER BY e.enrolled_at DESC"#,
        )
        .bind(student_id)
        .fetch_all(pool)
        .await?;
        Ok(rows)
    }

    pub async fn mark_completed(pool: &PgPool, enrollment_id: Uuid) -> AppResult<()> {
        sqlx::query("UPDATE enrollments SET completed_at = NOW() WHERE id = $1 AND completed_at IS NULL")
            .bind(enrollment_id)
            .execute(pool)
            .await?;
        Ok(())
    }

    // ---- Module progress ----

    pub async fn list_progress(pool: &PgPool, enrollment_id: Uuid) -> AppResult<Vec<ModuleProgress>> {
        let rows = sqlx::query_as::<_, ModuleProgress>(
            r#"SELECT id, enrollment_id, module_id, completed, quiz_score, quiz_passed,
                 quiz_attempts, last_attempt_at, completed_at, credits_awarded
               FROM module_progress WHERE enrollment_id = $1"#,
        )
        .bind(enrollment_id)
        .fetch_all(pool)
        .await?;
        Ok(rows)
    }

    pub async fn get_progress(
        pool: &PgPool,
        enrollment_id: Uuid,
        module_id: Uuid,
    ) -> AppResult<Option<ModuleProgress>> {
        let row = sqlx::query_as::<_, ModuleProgress>(
            r#"SELECT id, enrollment_id, module_id, completed, quiz_score, quiz_passed,
                 quiz_attempts, last_attempt_at, completed_at, credits_awarded
               FROM module_progress WHERE enrollment_id = $1 AND module_id = $2"#,
        )
        .bind(enrollment_id)
        .bind(module_id)
        .fetch_optional(pool)
        .await?;
        Ok(row)
    }

    pub async fn mark_complete(
        pool: &PgPool,
        enrollment_id: Uuid,
        module_id: Uuid,
        credits_awarded: i32,
    ) -> AppResult<ModuleProgress> {
        let row = sqlx::query_as::<_, ModuleProgress>(
            r#"INSERT INTO module_progress (enrollment_id, module_id, completed, completed_at, credits_awarded)
               VALUES ($1, $2, TRUE, NOW(), $3)
               ON CONFLICT (enrollment_id, module_id) DO UPDATE SET
                 completed = TRUE,
                 completed_at = COALESCE(module_progress.completed_at, NOW()),
                 credits_awarded = module_progress.credits_awarded + $3
               RETURNING id, enrollment_id, module_id, completed, quiz_score, quiz_passed,
                 quiz_attempts, last_attempt_at, completed_at, credits_awarded"#,
        )
        .bind(enrollment_id)
        .bind(module_id)
        .bind(credits_awarded)
        .fetch_one(pool)
        .await?;
        Ok(row)
    }

    pub async fn record_quiz_attempt(
        pool: &PgPool,
        enrollment_id: Uuid,
        module_id: Uuid,
        score: i32,
        passed: bool,
        credits_awarded: i32,
    ) -> AppResult<ModuleProgress> {
        let row = sqlx::query_as::<_, ModuleProgress>(
            r#"INSERT INTO module_progress
                 (enrollment_id, module_id, completed, quiz_score, quiz_passed, quiz_attempts,
                  last_attempt_at, completed_at, credits_awarded)
               VALUES ($1, $2, $5, $3, $5, 1, NOW(), CASE WHEN $5 THEN NOW() ELSE NULL END, $4)
               ON CONFLICT (enrollment_id, module_id) DO UPDATE SET
                 quiz_score = $3,
                 quiz_passed = module_progress.quiz_passed OR $5,
                 quiz_attempts = module_progress.quiz_attempts + 1,
                 last_attempt_at = NOW(),
                 completed = module_progress.completed OR $5,
                 completed_at = COALESCE(module_progress.completed_at, CASE WHEN $5 THEN NOW() ELSE NULL END),
                 credits_awarded = module_progress.credits_awarded + $4
               RETURNING id, enrollment_id, module_id, completed, quiz_score, quiz_passed,
                 quiz_attempts, last_attempt_at, completed_at, credits_awarded"#,
        )
        .bind(enrollment_id)
        .bind(module_id)
        .bind(score)
        .bind(credits_awarded)
        .bind(passed)
        .fetch_one(pool)
        .await?;
        Ok(row)
    }
}
