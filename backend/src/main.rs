use axum::{routing::get, Router};
use dotenvy::dotenv;
use sqlx::PgPool;
use std::{env, net::SocketAddr};

async fn health() -> &'static str {
    "API is running"
}

async fn db_health() -> &'static str {
    "Database connection is configured"
}

#[tokio::main]
async fn main() {
    dotenv().ok();

    let database_url =
        env::var("DATABASE_URL").expect("DATABASE_URL must be set in .env");

    let pool = PgPool::connect(&database_url)
        .await
        .expect("Failed to connect to database");

    println!("Connected to Neon PostgreSQL");

    let app = Router::new()
        .route("/health", get(health))
        .route("/health/db", get(db_health))
        .with_state(pool);

    let port: u16 = env::var("PORT")
        .unwrap_or_else(|_| "8000".to_string())
        .parse()
        .expect("PORT must be a valid number");

    let addr = SocketAddr::from(([127, 0, 0, 1], port));
    println!("Backend running on http://{}", addr);

    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}
