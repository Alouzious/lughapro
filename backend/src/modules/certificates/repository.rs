use sqlx::PgPool;
use uuid::Uuid;

use crate::errors::AppResult;
use super::models::{Certificate, CertificateWithStudent};

pub struct CertificateRepository;

impl CertificateRepository {
    pub async fn find_for_student_level(
        pool: &PgPool,
        student_id: Uuid,
        level: &str,
    ) -> AppResult<Option<Certificate>> {
        let row = sqlx::query_as::<_, Certificate>(
            r#"SELECT id, student_id, level, stellar_tx_hash, contract_address, certificate_id, issued_at
               FROM certificates WHERE student_id = $1 AND level = $2"#,
        )
        .bind(student_id)
        .bind(level)
        .fetch_optional(pool)
        .await?;
        Ok(row)
    }

    pub async fn list_for_student(pool: &PgPool, student_id: Uuid) -> AppResult<Vec<Certificate>> {
        let rows = sqlx::query_as::<_, Certificate>(
            r#"SELECT id, student_id, level, stellar_tx_hash, contract_address, certificate_id, issued_at
               FROM certificates WHERE student_id = $1 ORDER BY issued_at DESC"#,
        )
        .bind(student_id)
        .fetch_all(pool)
        .await?;
        Ok(rows)
    }

    pub async fn find_by_tx_hash(pool: &PgPool, tx_hash: &str) -> AppResult<Option<CertificateWithStudent>> {
        let row = sqlx::query_as::<_, CertificateWithStudent>(
            r#"SELECT c.id, c.student_id, u.full_name AS student_name, c.level,
                 c.stellar_tx_hash, c.contract_address, c.certificate_id, c.issued_at
               FROM certificates c
               JOIN users u ON u.id = c.student_id
               WHERE c.stellar_tx_hash = $1"#,
        )
        .bind(tx_hash)
        .fetch_optional(pool)
        .await?;
        Ok(row)
    }

    pub async fn create(
        pool: &PgPool,
        student_id: Uuid,
        level: &str,
        stellar_tx_hash: &str,
        contract_address: Option<&str>,
        certificate_id: &str,
    ) -> AppResult<Certificate> {
        let row = sqlx::query_as::<_, Certificate>(
            r#"INSERT INTO certificates (student_id, level, stellar_tx_hash, contract_address, certificate_id)
               VALUES ($1, $2, $3, $4, $5)
               RETURNING id, student_id, level, stellar_tx_hash, contract_address, certificate_id, issued_at"#,
        )
        .bind(student_id)
        .bind(level)
        .bind(stellar_tx_hash)
        .bind(contract_address)
        .bind(certificate_id)
        .fetch_one(pool)
        .await?;
        Ok(row)
    }
}
