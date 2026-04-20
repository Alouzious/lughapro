use axum::{routing::get, Router};
use tower_http::cors::{Any, CorsLayer};
use crate::handlers::health;
use crate::state::AppState;

pub fn create_router(state: AppState) -> Router {
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    Router::new()
        .route("/health", get(health::health_check))
        .route("/health/db", get(health::health_db))
        .layer(cors)
        .with_state(state)
}
