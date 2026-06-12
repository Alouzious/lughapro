use serde::Deserialize;

#[derive(Debug, Deserialize)]
pub struct EnrollRequest {
    /// "free" | "stripe" | "stellar". Defaults to free for free courses.
    pub payment_method: Option<String>,
    pub stripe_payment_intent: Option<String>,
    pub stellar_tx_hash: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct QuizSubmitRequest {
    /// Map of question_id -> chosen option id (e.g. "a").
    pub answers: Vec<QuizAnswer>,
}

#[derive(Debug, Deserialize)]
pub struct QuizAnswer {
    pub question_id: uuid::Uuid,
    pub selected_option: String,
}
