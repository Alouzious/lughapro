use sqlx::PgPool;
use uuid::Uuid;
use crate::errors::AppResult;
use super::models::{TutorListing, TutorProfile};

pub struct TutorRepository;

impl TutorRepository {
    pub async fn find_by_user_id(pool: &PgPool, user_id: Uuid) -> AppResult<Option<TutorProfile>> {
        let profile = sqlx::query_as::<_, TutorProfile>(
            "SELECT id, user_id, bio, hourly_rate, availability_summary, expertise, created_at, updated_at FROM tutor_profiles WHERE user_id = $1"
        )
        .bind(user_id)
        .fetch_optional(pool)
        .await?;
        Ok(profile)
    }

    pub async fn create(pool: &PgPool, user_id: Uuid, bio: &str, hourly_rate: f64, availability_summary: Option<&str>, expertise: Option<&str>) -> AppResult<TutorProfile> {
        let profile = sqlx::query_as::<_, TutorProfile>(
            "INSERT INTO tutor_profiles (user_id, bio, hourly_rate, availability_summary, expertise) VALUES ($1, $2, $3, $4, $5) RETURNING id, user_id, bio, hourly_rate, availability_summary, expertise, created_at, updated_at"
        )
        .bind(user_id)
        .bind(bio)
        .bind(hourly_rate)
        .bind(availability_summary)
        .bind(expertise)
        .fetch_one(pool)
        .await?;
        Ok(profile)
    }

    pub async fn update(pool: &PgPool, user_id: Uuid, bio: Option<&str>, hourly_rate: Option<f64>, availability_summary: Option<&str>, expertise: Option<&str>) -> AppResult<Option<TutorProfile>> {
        let profile = sqlx::query_as::<_, TutorProfile>(
            "UPDATE tutor_profiles SET
                bio = COALESCE($2, bio),
                hourly_rate = COALESCE($3, hourly_rate),
                availability_summary = COALESCE($4, availability_summary),
                expertise = COALESCE($5, expertise),
                updated_at = NOW()
             WHERE user_id = $1
             RETURNING id, user_id, bio, hourly_rate, availability_summary, expertise, created_at, updated_at"
        )
        .bind(user_id)
        .bind(bio)
        .bind(hourly_rate)
        .bind(availability_summary)
        .bind(expertise)
        .fetch_optional(pool)
        .await?;
        Ok(profile)
    }

    pub async fn list(pool: &PgPool, limit: i64, offset: i64) -> AppResult<Vec<TutorListing>> {
        let tutors = sqlx::query_as::<_, TutorListing>(
            r#"SELECT
                u.id,
                u.full_name,
                tp.id AS profile_id,
                tp.bio,
                tp.hourly_rate,
                tp.availability_summary,
                tp.expertise,
                CAST(COALESCE(AVG(r.rating), 0) AS DOUBLE PRECISION) AS average_rating
            FROM users u
            JOIN tutor_profiles tp ON tp.user_id = u.id
            LEFT JOIN ratings r ON r.tutor_id = u.id
            WHERE u.role = 'tutor'
            GROUP BY u.id, u.full_name, tp.id, tp.bio, tp.hourly_rate, tp.availability_summary, tp.expertise
            ORDER BY tp.created_at DESC
            LIMIT $1 OFFSET $2"#
        )
        .bind(limit)
        .bind(offset)
        .fetch_all(pool)
        .await?;
        Ok(tutors)
    }

    pub async fn count(pool: &PgPool) -> AppResult<i64> {
        let row: (i64,) = sqlx::query_as(
            "SELECT COUNT(*) FROM users u JOIN tutor_profiles tp ON tp.user_id = u.id WHERE u.role = 'tutor'"
        )
        .fetch_one(pool)
        .await?;
        Ok(row.0)
    }

    pub async fn get_average_rating(pool: &PgPool, tutor_id: Uuid) -> AppResult<f64> {
        let row: (f64,) = sqlx::query_as(
            "SELECT CAST(COALESCE(AVG(rating), 0) AS DOUBLE PRECISION) FROM ratings WHERE tutor_id = $1"
        )
        .bind(tutor_id)
        .fetch_one(pool)
        .await?;
        Ok(row.0)
    }
}
