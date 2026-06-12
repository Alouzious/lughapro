use std::env;

#[derive(Debug, Clone)]
pub struct AppConfig {
    pub database_url: Option<String>,
    pub port: u16,
    pub app_env: String,
    pub log_level: String,
    pub jwt_secret: String,
    pub jwt_expiry_hours: i64,
    pub groq_api_key: Option<String>,
    pub anthropic_api_key: Option<String>,
    pub stellar_network: Option<String>,
    pub stellar_rpc_url: Option<String>,
    pub stellar_soroban_contract_id: Option<String>,
    pub custodial_master_secret: Option<String>,
    pub stellar_admin_secret_key: Option<String>,
    pub credit_ledger_contract: Option<String>,
    pub certificate_contract: Option<String>,
    pub course_payment_contract: Option<String>,
    pub session_escrow_contract: Option<String>,
    pub platform_fee_bps: u32,
    pub ai_daily_free_limit: i64,
}

impl AppConfig {
    pub fn from_env() -> Self {
        Self {
            database_url: env::var("DATABASE_URL").ok(),
            port: env::var("PORT")
                .unwrap_or_else(|_| "8000".to_string())
                .parse()
                .unwrap_or(8000),
            app_env: env::var("APP_ENV").unwrap_or_else(|_| "development".to_string()),
            log_level: env::var("LOG_LEVEL").unwrap_or_else(|_| "info".to_string()),
            jwt_secret: env::var("JWT_SECRET")
                .unwrap_or_else(|_| "changeme-dev-secret-not-for-production".to_string()),
            jwt_expiry_hours: env::var("JWT_EXPIRY_HOURS")
                .unwrap_or_else(|_| "24".to_string())
                .parse()
                .unwrap_or(24),
            groq_api_key: env::var("GROQ_API_KEY").ok(),
            anthropic_api_key: env::var("ANTHROPIC_API_KEY").ok(),
            stellar_network: env::var("STELLAR_NETWORK").ok(),
            stellar_rpc_url: env::var("STELLAR_RPC_URL").ok(),
            stellar_soroban_contract_id: env::var("STELLAR_SOROBAN_CONTRACT_ID").ok(),
            custodial_master_secret: env::var("CUSTODIAL_MASTER_SECRET").ok(),
            stellar_admin_secret_key: env::var("STELLAR_ADMIN_SECRET_KEY").ok(),
            credit_ledger_contract: env::var("CREDIT_LEDGER_CONTRACT").ok(),
            certificate_contract: env::var("CERTIFICATE_CONTRACT").ok(),
            course_payment_contract: env::var("COURSE_PAYMENT_CONTRACT").ok(),
            session_escrow_contract: env::var("SESSION_ESCROW_CONTRACT").ok(),
            platform_fee_bps: env::var("PLATFORM_FEE_BPS")
                .ok()
                .and_then(|v| v.parse().ok())
                .unwrap_or(1500),
            ai_daily_free_limit: env::var("AI_DAILY_FREE_LIMIT")
                .ok()
                .and_then(|v| v.parse().ok())
                .unwrap_or(10),
        }
    }

    pub fn is_production(&self) -> bool {
        self.app_env == "production"
    }
}
