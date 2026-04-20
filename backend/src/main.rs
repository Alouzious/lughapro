mod config;
mod state;
mod routes;
mod handlers;
mod services;
mod repositories;
mod models;
mod schemas;
mod middleware;
mod utils;
mod errors;
mod modules;

use dotenvy::dotenv;
use sqlx::PgPool;
use tracing::{info, warn};

#[tokio::main]
async fn main() {
    dotenv().ok();

    let config = config::AppConfig::from_env();

    tracing_subscriber::fmt()
        .with_env_filter(&config.log_level)
        .init();

    info!("Starting LughaPro API in {} mode", config.app_env);

    // Attempt database connection; the server starts regardless.
    let db_pool = match &config.database_url {
        Some(url) => match PgPool::connect(url).await {
            Ok(pool) => {
                info!("Connected to PostgreSQL database");
                Some(pool)
            }
            Err(err) => {
                warn!("Database connection failed: {}. Running without database.", err);
                None
            }
        },
        None => {
            warn!("DATABASE_URL not set. Running without database connection.");
            None
        }
    };

    let app_state = state::AppState::new(config.clone(), db_pool);
    let app = routes::create_router(app_state);

    let addr = format!("0.0.0.0:{}", config.port);
    info!("LughaPro API listening on http://{}", addr);

    let listener = tokio::net::TcpListener::bind(&addr).await
        .expect("Failed to bind to address");

    axum::serve(listener, app).await
        .expect("Server failed");
}
