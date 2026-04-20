use sqlx::PgPool;
use uuid::Uuid;
use crate::errors::AppResult;
use super::models::{TutorListing, TutorProfile};

pub struct TutorRepository;

impl TutorRepository {
    pub async fn find_by_user_id(pool: &PgPool, user_id: Uuid) -> AppResult<Option<TutorProfile>> {
        let profile = sqlx::query_as::<_, TutorProfile>(
            "SELECT id, user_id, bio, hourly_rate, availability_summary, expertise, verification_status, profile_image_url, phone, location, teaching_focus, created_at, updated_at FROM tutor_profiles WHERE user_id = $1"
        )
        .bind(user_id)
        .fetch_optional(pool)
        .await?;
        Ok(profile)
    }

    pub async fn create(
        pool: &PgPool,
        user_id: Uuid,
        bio: &str,
        hourly_rate: f64,
        availability_summary: Option<&str>,
        expertise: Option<&str>,
        profile_image_url: Option<&str>,
        phone: Option<&str>,
        location: Option<&str>,
        teaching_focus: Option<&str>,
    ) -> AppResult<TutorProfile> {
        let profile = sqlx::query_as::<_, TutorProfile>(
            "INSERT INTO tutor_profiles (user_id, bio, hourly_rate, availability_summary, expertise, profile_image_url, phone, location, teaching_focus) \
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) \
             RETURNING id, user_id, bio, hourly_rate, availability_summary, expertise, verification_status, profile_image_url, phone, location, teaching_focus, created_at, updated_at"
        )
        .bind(user_id)
        .bind(bio)
        .bind(hourly_rate)
        .bind(availability_summary)
        .bind(expertise)
        .bind(profile_image_url)
        .bind(phone)
        .bind(location)
        .bind(teaching_focus)
        .fetch_one(pool)
        .await?;
        Ok(profile)
    }

    pub async fn update(
        pool: &PgPool,
        user_id: Uuid,
        bio: Option<&str>,
        hourly_rate: Option<f64>,
        availability_summary: Option<&str>,
        expertise: Option<&str>,
        profile_image_url: Option<&str>,
        phone: Option<&str>,
        location: Option<&str>,
        teaching_focus: Option<&str>,
    ) -> AppResult<Option<TutorProfile>> {
        let profile = sqlx::query_as::<_, TutorProfile>(
            "UPDATE tutor_profiles SET
                bio = COALESCE($2, bio),
                hourly_rate = COALESCE($3, hourly_rate),
                availability_summary = COALESCE($4, availability_summary),
                expertise = COALESCE($5, expertise),
                profile_image_url = COALESCE($6, profile_image_url),
                phone = COALESCE($7, phone),
                location = COALESCE($8, location),
                teaching_focus = COALESCE($9, teaching_focus),
                updated_at = NOW()
             WHERE user_id = $1
             RETURNING id, user_id, bio, hourly_rate, availability_summary, expertise, verification_status, profile_image_url, phone, location, teaching_focus, created_at, updated_at"
        )
        .bind(user_id)
        .bind(bio)
        .bind(hourly_rate)
        .bind(availability_summary)
        .bind(expertise)
        .bind(profile_image_url)
        .bind(phone)
        .bind(location)
        .bind(teaching_focus)
        .fetch_optional(pool)
        .await?;
        Ok(profile)
    }

    pub async fn update_verification_status(pool: &PgPool, user_id: Uuid, status: &str) -> AppResult<Option<TutorProfile>> {
        let profile = sqlx::query_as::<_, TutorProfile>(
            "UPDATE tutor_profiles SET verification_status = $2, updated_at = NOW() WHERE user_id = $1 \
             RETURNING id, user_id, bio, hourly_rate, availability_summary, expertise, verification_status, profile_image_url, phone, location, teaching_focus, created_at, updated_at"
        )
        .bind(user_id)
        .bind(status)
        .fetch_optional(pool)
        .await?;
        Ok(profile)
    }

    pub async fn list(pool: &PgPool, limit: i64, offset: i64, verification_status: Option<&str>) -> AppResult<Vec<TutorListing>> {
        let tutors = sqlx::query_as::<_, TutorListing>(
            r#"SELECT
                u.id,
                u.full_name,
                tp.id AS profile_id,
                tp.bio,
                tp.hourly_rate,
                tp.availability_summary,
                tp.expertise,
                tp.verification_status,
                tp.profile_image_url,
                CAST(COALESCE(AVG(r.rating), 0) AS DOUBLE PRECISION) AS average_rating
            FROM users u
            JOIN tutor_profiles tp ON tp.user_id = u.id
            LEFT JOIN ratings r ON r.tutor_id = u.id
            WHERE u.role = 'tutor'
              AND ($3::TEXT IS NULL OR tp.verification_status = $3)
            GROUP BY u.id, u.full_name, tp.id, tp.bio, tp.hourly_rate, tp.availability_summary, tp.expertise, tp.verification_status, tp.profile_image_url
            ORDER BY tp.created_at DESC
            LIMIT $1 OFFSET $2"#
        )
        .bind(limit)
        .bind(offset)
        .bind(verification_status)
        .fetch_all(pool)
        .await?;
        Ok(tutors)
    }

    pub async fn get_by_id(pool: &PgPool, user_id: Uuid) -> AppResult<Option<TutorListing>> {
        let tutor = sqlx::query_as::<_, TutorListing>(
            r#"SELECT
                u.id,
                u.full_name,
                tp.id AS profile_id,
                tp.bio,
                tp.hourly_rate,
                tp.availability_summary,
                tp.expertise,
                tp.verification_status,
                tp.profile_image_url,
                CAST(COALESCE(AVG(r.rating), 0) AS DOUBLE PRECISION) AS average_rating
            FROM users u
            JOIN tutor_profiles tp ON tp.user_id = u.id
            LEFT JOIN ratings r ON r.tutor_id = u.id
            WHERE u.role = 'tutor' AND u.id = $1
            GROUP BY u.id, u.full_name, tp.id, tp.bio, tp.hourly_rate, tp.availability_summary, tp.expertise, tp.verification_status, tp.profile_image_url"#
        )
        .bind(user_id)
        .fetch_optional(pool)
        .await?;
        Ok(tutor)
    }

    pub async fn count(pool: &PgPool, verification_status: Option<&str>) -> AppResult<i64> {
        let row: (i64,) = sqlx::query_as(
            "SELECT COUNT(*) FROM users u JOIN tutor_profiles tp ON tp.user_id = u.id WHERE u.role = 'tutor' AND ($1::TEXT IS NULL OR tp.verification_status = $1)"
        )
        .bind(verification_status)
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
