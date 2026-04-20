use chrono::{DateTime, Utc};
use sqlx::PgPool;
use uuid::Uuid;
use crate::errors::AppResult;
use super::models::{Booking, BookingWithNames};

pub struct BookingRepository;

impl BookingRepository {
    pub async fn create(pool: &PgPool, student_id: Uuid, tutor_id: Uuid, session_time: DateTime<Utc>, notes: Option<&str>) -> AppResult<Booking> {
        let booking = sqlx::query_as::<_, Booking>(
            "INSERT INTO bookings (student_id, tutor_id, session_time, notes) VALUES ($1, $2, $3, $4) RETURNING id, student_id, tutor_id, session_time, status, notes, created_at, updated_at"
        )
        .bind(student_id)
        .bind(tutor_id)
        .bind(session_time)
        .bind(notes)
        .fetch_one(pool)
        .await?;
        Ok(booking)
    }

    pub async fn find_by_id(pool: &PgPool, id: Uuid) -> AppResult<Option<Booking>> {
        let booking = sqlx::query_as::<_, Booking>(
            "SELECT id, student_id, tutor_id, session_time, status, notes, created_at, updated_at FROM bookings WHERE id = $1"
        )
        .bind(id)
        .fetch_optional(pool)
        .await?;
        Ok(booking)
    }

    pub async fn find_for_student(pool: &PgPool, student_id: Uuid) -> AppResult<Vec<BookingWithNames>> {
        let bookings = sqlx::query_as::<_, BookingWithNames>(
            r#"SELECT
                b.id, b.student_id, b.tutor_id,
                su.full_name AS student_name,
                tu.full_name AS tutor_name,
                b.session_time, b.status, b.notes, b.created_at, b.updated_at
            FROM bookings b
            JOIN users su ON su.id = b.student_id
            JOIN users tu ON tu.id = b.tutor_id
            WHERE b.student_id = $1
            ORDER BY b.session_time DESC"#
        )
        .bind(student_id)
        .fetch_all(pool)
        .await?;
        Ok(bookings)
    }

    pub async fn find_for_tutor(pool: &PgPool, tutor_id: Uuid) -> AppResult<Vec<BookingWithNames>> {
        let bookings = sqlx::query_as::<_, BookingWithNames>(
            r#"SELECT
                b.id, b.student_id, b.tutor_id,
                su.full_name AS student_name,
                tu.full_name AS tutor_name,
                b.session_time, b.status, b.notes, b.created_at, b.updated_at
            FROM bookings b
            JOIN users su ON su.id = b.student_id
            JOIN users tu ON tu.id = b.tutor_id
            WHERE b.tutor_id = $1
            ORDER BY b.session_time DESC"#
        )
        .bind(tutor_id)
        .fetch_all(pool)
        .await?;
        Ok(bookings)
    }

    pub async fn update_status(pool: &PgPool, id: Uuid, status: &str) -> AppResult<Option<Booking>> {
        let booking = sqlx::query_as::<_, Booking>(
            "UPDATE bookings SET status = $2, updated_at = NOW() WHERE id = $1 RETURNING id, student_id, tutor_id, session_time, status, notes, created_at, updated_at"
        )
        .bind(id)
        .bind(status)
        .fetch_optional(pool)
        .await?;
        Ok(booking)
    }
}
