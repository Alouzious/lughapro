use axum::{extract::State, Json};
use serde_json::{json, Value};
use crate::state::AppState;

pub async fn health_check() -> Json<Value> {
    Json(json!({
        "status": "ok",
        "service": "lughapro-api",
        "version": env!("CARGO_PKG_VERSION")
    }))
}

pub async fn health_db(State(state): State<AppState>) -> Json<Value> {
    let db_status = if state.db().is_some() {
        "connected"
    } else {
        "not_configured"
    };

    Json(json!({
        "status": "ok",
        "database": db_status
    }))
}
