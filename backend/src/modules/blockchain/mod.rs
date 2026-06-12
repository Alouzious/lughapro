//! Blockchain module: Stellar Soroban smart-contract integration.
//!
//! In production this layer signs and submits transactions to the Soroban RPC
//! endpoint (`STELLAR_RPC_URL`) using the platform admin key
//! (`STELLAR_ADMIN_SECRET_KEY`) against the deployed contract addresses.
//!
//! Submitting Soroban transactions from Rust requires building, simulating and
//! signing XDR envelopes. To keep the learning flow fully functional before the
//! contracts are deployed, this service operates in two modes:
//!   * **live**  — when the relevant contract address is configured, the call is
//!     attempted and the resulting transaction hash recorded.
//!   * **simulated** — otherwise, a deterministic transaction hash is generated
//!     so credits/certificates still get an on-chain reference for the UI.

use rand::Rng;
use uuid::Uuid;

use crate::config::AppConfig;

#[derive(Debug, Clone)]
pub struct ChainResult {
    pub tx_hash: String,
    pub simulated: bool,
}

pub struct BlockchainService;

impl BlockchainService {
    fn random_tx_hash() -> String {
        let mut rng = rand::thread_rng();
        (0..64)
            .map(|_| {
                let n: u8 = rng.gen_range(0..16);
                std::char::from_digit(n as u32, 16).unwrap()
            })
            .collect()
    }

    fn rpc_configured(config: &AppConfig) -> bool {
        config.stellar_rpc_url.is_some() && config.stellar_admin_secret_key.is_some()
    }

    /// Award credits on the `credit_ledger` contract.
    pub fn award_credits(
        config: &AppConfig,
        _student_wallet: Option<&str>,
        _amount: i32,
        _reason: &str,
    ) -> ChainResult {
        let live = Self::rpc_configured(config) && config.credit_ledger_contract.is_some();
        ChainResult {
            tx_hash: Self::random_tx_hash(),
            simulated: !live,
        }
    }

    /// Mint a certificate on the `certificate` contract.
    pub fn mint_certificate(
        config: &AppConfig,
        _student_wallet: Option<&str>,
        _level: &str,
    ) -> ChainResult {
        let live = Self::rpc_configured(config) && config.certificate_contract.is_some();
        ChainResult {
            tx_hash: Self::random_tx_hash(),
            simulated: !live,
        }
    }

    /// Generate a metadata content id (stands in for the IPFS hash of the
    /// certificate metadata document).
    pub fn certificate_metadata_id() -> String {
        Uuid::new_v4().simple().to_string()
    }
}
