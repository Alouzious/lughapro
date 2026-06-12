use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct Certificate {
    pub id: Uuid,
    pub student_id: Uuid,
    pub level: String,
    pub stellar_tx_hash: Option<String>,
    pub contract_address: Option<String>,
    pub certificate_id: Option<String>,
    pub issued_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct CertificateWithStudent {
    pub id: Uuid,
    pub student_id: Uuid,
    pub student_name: String,
    pub level: String,
    pub stellar_tx_hash: Option<String>,
    pub contract_address: Option<String>,
    pub certificate_id: Option<String>,
    pub issued_at: DateTime<Utc>,
}
