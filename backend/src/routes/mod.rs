use axum::{routing::{get, patch, post}, Router};
use tower_http::cors::{Any, CorsLayer};
use crate::handlers::health;
use crate::modules::{
    admin::handler as admin_handler,
    ai::handler as ai_handler,
    auth::handler as auth_handler,
    bookings::handler as booking_handler,
    certificates::handler as certificate_handler,
    courses::handler as course_handler,
    credits::handler as credit_handler,
    disputes::handler as dispute_handler,
    enrollments::handler as enrollment_handler,
    payments::handler as payment_handler,
    ratings::handler as rating_handler,
    tutors::handler as tutor_handler,
    users::handler as user_handler,
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

    let user_routes = Router::new()
        .route("/me", get(user_handler::get_me))
        .route("/me", patch(user_handler::update_me));

    let payment_routes = Router::new()
        .route("/", post(payment_handler::create_payment))
        .route("/me", get(payment_handler::list_my_payments))
        .route("/booking/:booking_id", get(payment_handler::get_payment_for_booking));

    let dispute_routes = Router::new()
        .route("/", post(dispute_handler::create_dispute))
        .route("/me", get(dispute_handler::get_my_disputes))
        .route("/:id/status", patch(dispute_handler::update_dispute_status));

    let admin_routes = Router::new()
        .route("/users", get(admin_handler::list_users))
        .route("/tutors", get(admin_handler::list_tutors))
        .route("/students", get(admin_handler::list_students))
        .route("/bookings", get(admin_handler::list_all_bookings))
        .route("/payments", get(admin_handler::list_all_payments))
        .route("/disputes", get(admin_handler::list_all_disputes))
        .route("/tutors/:id/verification", patch(admin_handler::update_tutor_verification))
        .route("/courses/:id/approve", post(course_handler::approve_course))
        .route("/stats", get(admin_handler::get_stats));

    let course_routes = Router::new()
        .route("/", get(course_handler::list_courses).post(course_handler::create_course))
        .route("/mine", get(course_handler::list_my_courses))
        .route("/:id", get(course_handler::get_course).patch(course_handler::update_course))
        .route("/:id/publish", post(course_handler::publish_course))
        .route("/:id/modules", post(course_handler::add_module))
        .route("/:id/enroll", post(enrollment_handler::enroll))
        .route("/:id/progress", get(enrollment_handler::course_progress));

    let module_routes = Router::new()
        .route("/reorder", patch(course_handler::reorder_modules))
        .route("/:id", patch(course_handler::update_module).delete(course_handler::delete_module))
        .route("/:id/complete", post(enrollment_handler::complete_module))
        .route("/:id/quiz", get(enrollment_handler::get_quiz))
        .route("/:id/quiz-submit", post(enrollment_handler::submit_quiz))
        .route("/:id/quiz-result", get(enrollment_handler::quiz_result));

    let enrollment_routes = Router::new()
        .route("/me", get(enrollment_handler::my_enrollments));

    let credit_routes = Router::new()
        .route("/me", get(credit_handler::get_my_credits))
        .route("/history", get(credit_handler::get_history))
        .route("/sync", post(credit_handler::sync));

    let certificate_routes = Router::new()
        .route("/me", get(certificate_handler::get_my_certificates))
        .route("/verify/:tx_hash", get(certificate_handler::verify))
        .route("/mint", post(certificate_handler::mint));

    let ai_routes = Router::new()
        .route("/chat", post(ai_handler::chat))
        .route("/usage", get(ai_handler::usage));

    Router::new()
        .route("/health", get(health::health_check))
        .route("/health/db", get(health::health_db))
        .nest("/api/auth", auth_routes)
        .nest("/api/tutors", tutor_routes)
        .nest("/api/bookings", booking_routes)
        .nest("/api/ratings", rating_routes)
        .nest("/api/users", user_routes)
        .nest("/api/payments", payment_routes)
        .nest("/api/disputes", dispute_routes)
        .nest("/api/admin", admin_routes)
        .nest("/api/courses", course_routes)
        .nest("/api/modules", module_routes)
        .nest("/api/enrollments", enrollment_routes)
        .nest("/api/credits", credit_routes)
        .nest("/api/certificates", certificate_routes)
        .nest("/api/ai", ai_routes)
        .layer(cors)
        .with_state(state)
}
