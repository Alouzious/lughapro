use serde_json::json;
use sqlx::PgPool;
use tracing::{info, warn};
use uuid::Uuid;

use crate::config::AppConfig;
use crate::errors::AppResult;
use crate::modules::blockchain::BlockchainService;
use crate::modules::certificates::service::CertificateService;
use super::repository::CreditRepository;

/// Ordered CEFR levels with the cumulative credits required to unlock each.
pub const LEVELS: [(&str, i32); 6] = [
    ("A1", 0),
    ("A2", 150),
    ("B1", 300),
    ("B2", 500),
    ("C1", 800),
    ("C2", 1200),
];

pub struct CreditService;

impl CreditService {
    pub fn level_for_credits(credits: i32) -> &'static str {
        let mut current = "A1";
        for (level, threshold) in LEVELS.iter() {
            if credits >= *threshold {
                current = level;
            }
        }
        current
    }

    /// Credits required to reach the next level (None if already at C2).
    pub fn next_threshold(level: &str) -> Option<i32> {
        let idx = LEVELS.iter().position(|(l, _)| *l == level)?;
        LEVELS.get(idx + 1).map(|(_, t)| *t)
    }

    fn level_index(level: &str) -> usize {
        LEVELS.iter().position(|(l, _)| *l == level).unwrap_or(0)
    }

    /// Award credits to a student: persists the transaction, mirrors to the
    /// Soroban credit_ledger, advances the unlocked level and mints a
    /// certificate for each level the student completes along the way.
    pub async fn award(
        pool: &PgPool,
        config: &AppConfig,
        student_id: Uuid,
        amount: i32,
        reason: &str,
        reference_id: Option<Uuid>,
    ) -> AppResult<serde_json::Value> {
        if amount == 0 {
            let record = CreditRepository::get_or_create(pool, student_id).await?;
            return Ok(json!({ "credits": record, "awarded": 0 }));
        }

        let current = CreditRepository::get_or_create(pool, student_id).await?;
        let prev_level = current.level_unlocked.clone();
        let new_total = (current.total_credits + amount).max(0);
        let new_level = Self::level_for_credits(new_total);

        // Mirror award to chain (or simulate when contracts aren't deployed).
        let chain = BlockchainService::award_credits(config, None, amount, reason);

        CreditRepository::log_transaction(
            pool,
            student_id,
            amount,
            reason,
            reference_id,
            Some(&chain.tx_hash),
        )
        .await?;

        let record = CreditRepository::update_totals(pool, student_id, new_total, new_level).await?;

        // Mint a certificate for each level newly completed (e.g. A1 -> A2 mints A1).
        let mut minted = Vec::new();
        let from = Self::level_index(&prev_level);
        let to = Self::level_index(new_level);
        if to > from {
            for i in from..to {
                let completed_level = LEVELS[i].0;
                match CertificateService::issue_for_level(pool, config, student_id, completed_level).await {
                    Ok(Some(cert)) => minted.push(cert),
                    Ok(None) => {}
                    Err(e) => warn!("Certificate mint failed for {completed_level}: {e}"),
                }
            }
        }

        info!(
            "Awarded {amount} credits to {student_id} ({reason}); total {new_total}, level {new_level}, tx {}",
            chain.tx_hash
        );

        Ok(json!({
            "credits": record,
            "awarded": amount,
            "reason": reason,
            "stellar_tx_hash": chain.tx_hash,
            "simulated": chain.simulated,
            "next_threshold": Self::next_threshold(new_level),
            "level_changed": new_level != prev_level,
            "certificates_minted": minted,
        }))
    }

    pub async fn get_summary(pool: &PgPool, student_id: Uuid) -> AppResult<serde_json::Value> {
        let record = CreditRepository::get_or_create(pool, student_id).await?;
        let next = Self::next_threshold(&record.level_unlocked);
        Ok(json!({
            "total_credits": record.total_credits,
            "level_unlocked": record.level_unlocked,
            "next_threshold": next,
            "last_updated": record.last_updated,
            "levels": LEVELS,
        }))
    }

    pub async fn get_history(pool: &PgPool, student_id: Uuid) -> AppResult<serde_json::Value> {
        let rows = CreditRepository::history(pool, student_id, 100).await?;
        Ok(json!(rows))
    }
}
