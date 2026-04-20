use axum::{routing::{get, patch, post}, Router};
use tower_http::cors::{Any, CorsLayer};
use crate::handlers::health;
use crate::modules::{
    auth::handler as auth_handler,
    bookings::handler as booking_handler,
    ratings::handler as rating_handler,
    tutors::handler as tutor_handler,
};
use crate::state::AppState;

pub fn create_router(state: AppState) -> Router {
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    let auth_routes = Router::new()
        .route("/register", post(auth_handler::register))
        .route("/login", post(auth_handler::login));

    let tutor_routes = Router::new()
        .route("/", get(tutor_handler::list_tutors))
        .route("/profile", post(tutor_handler::create_profile))
        .route("/profile", get(tutor_handler::get_profile))
        .route("/profile", patch(tutor_handler::update_profile))
        .route("/:id/ratings", get(rating_handler::get_tutor_ratings))
        .route("/:id/average-rating", get(rating_handler::get_average_rating));

    let booking_routes = Router::new()
        .route("/", post(booking_handler::create_booking))
        .route("/me", get(booking_handler::get_my_bookings))
        .route("/:id/status", patch(booking_handler::update_booking_status));

    let rating_routes = Router::new()
        .route("/", post(rating_handler::create_rating));

    Router::new()
        .route("/health", get(health::health_check))
        .route("/health/db", get(health::health_db))
        .nest("/api/auth", auth_routes)
        .nest("/api/tutors", tutor_routes)
        .nest("/api/bookings", booking_routes)
        .nest("/api/ratings", rating_routes)
        .layer(cors)
        .with_state(state)
}
