use std::env;

#[derive(Debug, Clone)]
pub struct AppConfig {
    pub database_url: Option<String>,
    pub port: u16,
    pub app_env: String,
    pub log_level: String,
    pub jwt_secret: String,
    pub groq_api_key: Option<String>,
    pub stellar_network: Option<String>,
    pub stellar_rpc_url: Option<String>,
    pub stellar_soroban_contract_id: Option<String>,
    pub custodial_master_secret: Option<String>,
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
            groq_api_key: env::var("GROQ_API_KEY").ok(),
            stellar_network: env::var("STELLAR_NETWORK").ok(),
            stellar_rpc_url: env::var("STELLAR_RPC_URL").ok(),
            stellar_soroban_contract_id: env::var("STELLAR_SOROBAN_CONTRACT_ID").ok(),
            custodial_master_secret: env::var("CUSTODIAL_MASTER_SECRET").ok(),
        }
    }

    pub fn is_production(&self) -> bool {
        self.app_env == "production"
    }
}
