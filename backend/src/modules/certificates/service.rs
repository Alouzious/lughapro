use serde_json::json;
use sqlx::PgPool;
use tracing::info;
use uuid::Uuid;

use crate::config::AppConfig;
use crate::errors::{AppError, AppResult};
use crate::modules::blockchain::BlockchainService;
use super::repository::CertificateRepository;

pub struct CertificateService;

impl CertificateService {
    /// Issue (mint + persist) a certificate for a completed level. Idempotent:
    /// returns `Ok(None)` if the student already holds a certificate for it.
    pub async fn issue_for_level(
        pool: &PgPool,
        config: &AppConfig,
        student_id: Uuid,
        level: &str,
    ) -> AppResult<Option<serde_json::Value>> {
        if CertificateRepository::find_for_student_level(pool, student_id, level)
            .await?
            .is_some()
        {
            return Ok(None);
        }

        let chain = BlockchainService::mint_certificate(config, None, level);
        let cert_meta = BlockchainService::certificate_metadata_id();
        let cert = CertificateRepository::create(
            pool,
            student_id,
            level,
            &chain.tx_hash,
            config.certificate_contract.as_deref(),
            &cert_meta,
        )
        .await?;

        info!(
            "Minted {level} certificate for {student_id} (tx {}, simulated={})",
            chain.tx_hash, chain.simulated
        );
        Ok(Some(json!({ "certificate": cert, "simulated": chain.simulated })))
    }

    pub async fn list_for_student(pool: &PgPool, student_id: Uuid) -> AppResult<serde_json::Value> {
        let certs = CertificateRepository::list_for_student(pool, student_id).await?;
        Ok(json!(certs))
    }

    pub async fn verify(pool: &PgPool, tx_hash: &str) -> AppResult<serde_json::Value> {
        let cert = CertificateRepository::find_by_tx_hash(pool, tx_hash)
            .await?
            .ok_or_else(|| AppError::NotFound("Certificate not found".into()))?;
        Ok(json!({ "valid": true, "certificate": cert }))
    }
}
