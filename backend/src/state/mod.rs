use sqlx::PgPool;
use std::sync::Arc;
use crate::config::AppConfig;

#[derive(Clone)]
pub struct AppState {
    pub config: Arc<AppConfig>,
    pub db: Option<PgPool>,
}

impl AppState {
    pub fn new(config: AppConfig, db: Option<PgPool>) -> Self {
        Self {
            config: Arc::new(config),
            db,
        }
    }

    pub fn db(&self) -> Option<&PgPool> {
        self.db.as_ref()
    }
}
