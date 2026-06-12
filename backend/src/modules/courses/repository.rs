use sqlx::PgPool;
use uuid::Uuid;

use crate::errors::AppResult;
use super::models::{Course, CourseWithTutor, Module, Quiz, QuizQuestion};
use super::schemas::{CreateCourseRequest, CreateModuleRequest, UpdateCourseRequest, UpdateModuleRequest};

pub struct CourseRepository;

impl CourseRepository {
    #[allow(clippy::too_many_arguments)]
    pub async fn list(
        pool: &PgPool,
        level: Option<&str>,
        is_free: Option<bool>,
        tutor_id: Option<Uuid>,
        status: Option<&str>,
        limit: i64,
        offset: i64,
    ) -> AppResult<Vec<CourseWithTutor>> {
        let rows = sqlx::query_as::<_, CourseWithTutor>(
            r#"SELECT
                c.id, c.tutor_id, u.full_name AS tutor_name,
                c.title, c.description, c.thumbnail_url, c.level, c.price, c.is_free,
                c.status, c.tags, c.estimated_hours, c.enrolled_count, c.avg_rating,
                c.created_at, c.published_at
            FROM courses c
            LEFT JOIN users u ON u.id = c.tutor_id
            WHERE ($1::text IS NULL OR c.level = $1)
              AND ($2::bool IS NULL OR c.is_free = $2)
              AND ($3::uuid IS NULL OR c.tutor_id = $3)
              AND ($4::text IS NULL OR c.status = $4)
            ORDER BY c.created_at DESC
            LIMIT $5 OFFSET $6"#,
        )
        .bind(level)
        .bind(is_free)
        .bind(tutor_id)
        .bind(status)
        .bind(limit)
        .bind(offset)
        .fetch_all(pool)
        .await?;
        Ok(rows)
    }

    pub async fn find_by_id(pool: &PgPool, id: Uuid) -> AppResult<Option<Course>> {
        let row = sqlx::query_as::<_, Course>(
            r#"SELECT id, tutor_id, title, description, thumbnail_url, level, price, is_free,
                status, tags, estimated_hours, enrolled_count, avg_rating, created_at, published_at
               FROM courses WHERE id = $1"#,
        )
        .bind(id)
        .fetch_optional(pool)
        .await?;
        Ok(row)
    }

    pub async fn find_with_tutor(pool: &PgPool, id: Uuid) -> AppResult<Option<CourseWithTutor>> {
        let row = sqlx::query_as::<_, CourseWithTutor>(
            r#"SELECT
                c.id, c.tutor_id, u.full_name AS tutor_name,
                c.title, c.description, c.thumbnail_url, c.level, c.price, c.is_free,
                c.status, c.tags, c.estimated_hours, c.enrolled_count, c.avg_rating,
                c.created_at, c.published_at
            FROM courses c
            LEFT JOIN users u ON u.id = c.tutor_id
            WHERE c.id = $1"#,
        )
        .bind(id)
        .fetch_optional(pool)
        .await?;
        Ok(row)
    }

    pub async fn create(
        pool: &PgPool,
        tutor_id: Uuid,
        req: &CreateCourseRequest,
        status: &str,
    ) -> AppResult<Course> {
        let row = sqlx::query_as::<_, Course>(
            r#"INSERT INTO courses (tutor_id, title, description, thumbnail_url, level, price, status, tags, estimated_hours)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
               RETURNING id, tutor_id, title, description, thumbnail_url, level, price, is_free,
                 status, tags, estimated_hours, enrolled_count, avg_rating, created_at, published_at"#,
        )
        .bind(tutor_id)
        .bind(&req.title)
        .bind(&req.description)
        .bind(&req.thumbnail_url)
        .bind(&req.level)
        .bind(req.price)
        .bind(status)
        .bind(&req.tags)
        .bind(req.estimated_hours)
        .fetch_one(pool)
        .await?;
        Ok(row)
    }

    pub async fn update(pool: &PgPool, id: Uuid, req: &UpdateCourseRequest) -> AppResult<Option<Course>> {
        let row = sqlx::query_as::<_, Course>(
            r#"UPDATE courses SET
                title = COALESCE($2, title),
                description = COALESCE($3, description),
                thumbnail_url = COALESCE($4, thumbnail_url),
                level = COALESCE($5, level),
                price = COALESCE($6, price),
                tags = COALESCE($7, tags),
                estimated_hours = COALESCE($8, estimated_hours),
                status = COALESCE($9, status)
               WHERE id = $1
               RETURNING id, tutor_id, title, description, thumbnail_url, level, price, is_free,
                 status, tags, estimated_hours, enrolled_count, avg_rating, created_at, published_at"#,
        )
        .bind(id)
        .bind(&req.title)
        .bind(&req.description)
        .bind(&req.thumbnail_url)
        .bind(&req.level)
        .bind(req.price)
        .bind(&req.tags)
        .bind(req.estimated_hours)
        .bind(&req.status)
        .fetch_optional(pool)
        .await?;
        Ok(row)
    }

    pub async fn set_status(pool: &PgPool, id: Uuid, status: &str, set_published: bool) -> AppResult<Option<Course>> {
        let row = sqlx::query_as::<_, Course>(
            r#"UPDATE courses SET
                status = $2,
                published_at = CASE WHEN $3 THEN NOW() ELSE published_at END
               WHERE id = $1
               RETURNING id, tutor_id, title, description, thumbnail_url, level, price, is_free,
                 status, tags, estimated_hours, enrolled_count, avg_rating, created_at, published_at"#,
        )
        .bind(id)
        .bind(status)
        .bind(set_published)
        .fetch_optional(pool)
        .await?;
        Ok(row)
    }

    pub async fn increment_enrolled(pool: &PgPool, course_id: Uuid) -> AppResult<()> {
        sqlx::query("UPDATE courses SET enrolled_count = enrolled_count + 1 WHERE id = $1")
            .bind(course_id)
            .execute(pool)
            .await?;
        Ok(())
    }

    // ---- Modules ----

    pub async fn list_modules(pool: &PgPool, course_id: Uuid) -> AppResult<Vec<Module>> {
        let rows = sqlx::query_as::<_, Module>(
            r#"SELECT id, course_id, title, content_type, content_url, content_body,
                 order_index, is_free_preview, credits_on_complete, created_at
               FROM modules WHERE course_id = $1 ORDER BY order_index ASC"#,
        )
        .bind(course_id)
        .fetch_all(pool)
        .await?;
        Ok(rows)
    }

    pub async fn find_module(pool: &PgPool, id: Uuid) -> AppResult<Option<Module>> {
        let row = sqlx::query_as::<_, Module>(
            r#"SELECT id, course_id, title, content_type, content_url, content_body,
                 order_index, is_free_preview, credits_on_complete, created_at
               FROM modules WHERE id = $1"#,
        )
        .bind(id)
        .fetch_optional(pool)
        .await?;
        Ok(row)
    }

    pub async fn next_module_order(pool: &PgPool, course_id: Uuid) -> AppResult<i32> {
        let row: (Option<i32>,) =
            sqlx::query_as("SELECT MAX(order_index) FROM modules WHERE course_id = $1")
                .bind(course_id)
                .fetch_one(pool)
                .await?;
        Ok(row.0.unwrap_or(0) + 1)
    }

    pub async fn create_module(
        pool: &PgPool,
        course_id: Uuid,
        req: &CreateModuleRequest,
        order_index: i32,
    ) -> AppResult<Module> {
        let row = sqlx::query_as::<_, Module>(
            r#"INSERT INTO modules (course_id, title, content_type, content_url, content_body,
                 order_index, is_free_preview, credits_on_complete)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
               RETURNING id, course_id, title, content_type, content_url, content_body,
                 order_index, is_free_preview, credits_on_complete, created_at"#,
        )
        .bind(course_id)
        .bind(&req.title)
        .bind(&req.content_type)
        .bind(&req.content_url)
        .bind(&req.content_body)
        .bind(order_index)
        .bind(req.is_free_preview)
        .bind(req.credits_on_complete.unwrap_or(10))
        .fetch_one(pool)
        .await?;
        Ok(row)
    }

    pub async fn update_module(pool: &PgPool, id: Uuid, req: &UpdateModuleRequest) -> AppResult<Option<Module>> {
        let row = sqlx::query_as::<_, Module>(
            r#"UPDATE modules SET
                title = COALESCE($2, title),
                content_type = COALESCE($3, content_type),
                content_url = COALESCE($4, content_url),
                content_body = COALESCE($5, content_body),
                order_index = COALESCE($6, order_index),
                is_free_preview = COALESCE($7, is_free_preview),
                credits_on_complete = COALESCE($8, credits_on_complete)
               WHERE id = $1
               RETURNING id, course_id, title, content_type, content_url, content_body,
                 order_index, is_free_preview, credits_on_complete, created_at"#,
        )
        .bind(id)
        .bind(&req.title)
        .bind(&req.content_type)
        .bind(&req.content_url)
        .bind(&req.content_body)
        .bind(req.order_index)
        .bind(req.is_free_preview)
        .bind(req.credits_on_complete)
        .fetch_optional(pool)
        .await?;
        Ok(row)
    }

    pub async fn delete_module(pool: &PgPool, id: Uuid) -> AppResult<u64> {
        let res = sqlx::query("DELETE FROM modules WHERE id = $1")
            .bind(id)
            .execute(pool)
            .await?;
        Ok(res.rows_affected())
    }

    pub async fn set_module_order(pool: &PgPool, id: Uuid, order_index: i32) -> AppResult<()> {
        sqlx::query("UPDATE modules SET order_index = $2 WHERE id = $1")
            .bind(id)
            .bind(order_index)
            .execute(pool)
            .await?;
        Ok(())
    }

    pub async fn count_modules(pool: &PgPool, course_id: Uuid) -> AppResult<i64> {
        let row: (i64,) = sqlx::query_as("SELECT COUNT(*) FROM modules WHERE course_id = $1")
            .bind(course_id)
            .fetch_one(pool)
            .await?;
        Ok(row.0)
    }

    // ---- Quizzes ----

    pub async fn find_quiz_by_module(pool: &PgPool, module_id: Uuid) -> AppResult<Option<Quiz>> {
        let row = sqlx::query_as::<_, Quiz>(
            "SELECT id, module_id, pass_score, credits_on_pass FROM quizzes WHERE module_id = $1",
        )
        .bind(module_id)
        .fetch_optional(pool)
        .await?;
        Ok(row)
    }

    pub async fn create_quiz(
        pool: &PgPool,
        module_id: Uuid,
        pass_score: i32,
        credits_on_pass: i32,
    ) -> AppResult<Quiz> {
        let row = sqlx::query_as::<_, Quiz>(
            "INSERT INTO quizzes (module_id, pass_score, credits_on_pass) VALUES ($1, $2, $3)
             RETURNING id, module_id, pass_score, credits_on_pass",
        )
        .bind(module_id)
        .bind(pass_score)
        .bind(credits_on_pass)
        .fetch_one(pool)
        .await?;
        Ok(row)
    }

    pub async fn create_quiz_question(
        pool: &PgPool,
        quiz_id: Uuid,
        question_text: &str,
        options: &serde_json::Value,
        correct_option: &str,
        order_index: i32,
    ) -> AppResult<QuizQuestion> {
        let row = sqlx::query_as::<_, QuizQuestion>(
            r#"INSERT INTO quiz_questions (quiz_id, question_text, options, correct_option, order_index)
               VALUES ($1, $2, $3, $4, $5)
               RETURNING id, quiz_id, question_text, options, correct_option, order_index"#,
        )
        .bind(quiz_id)
        .bind(question_text)
        .bind(options)
        .bind(correct_option)
        .bind(order_index)
        .fetch_one(pool)
        .await?;
        Ok(row)
    }

    pub async fn list_quiz_questions(pool: &PgPool, quiz_id: Uuid) -> AppResult<Vec<QuizQuestion>> {
        let rows = sqlx::query_as::<_, QuizQuestion>(
            "SELECT id, quiz_id, question_text, options, correct_option, order_index
             FROM quiz_questions WHERE quiz_id = $1 ORDER BY order_index ASC",
        )
        .bind(quiz_id)
        .fetch_all(pool)
        .await?;
        Ok(rows)
    }
}
