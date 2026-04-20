use sqlx::PgPool;
use uuid::Uuid;
use crate::errors::{AppError, AppResult};
use super::{
    repository::DisputeRepository,
    schemas::{CreateDisputeRequest, DisputeResponse},
};

pub struct DisputeService;

impl DisputeService {
    pub async fn create_dispute(pool: &PgPool, raised_by: Uuid, req: CreateDisputeRequest) -> AppResult<DisputeResponse> {
        if req.reason.trim().is_empty() {
            return Err(AppError::BadRequest("Reason is required".to_string()));
        }
        if DisputeRepository::find_by_booking(pool, req.booking_id).await?.is_some() {
            return Err(AppError::Conflict("A dispute already exists for this booking".to_string()));
        }
        let dispute = DisputeRepository::create(pool, req.booking_id, raised_by, req.reason.trim()).await?;
        Ok(DisputeResponse::from(dispute))
    }

    pub async fn get_my_disputes(pool: &PgPool, user_id: Uuid) -> AppResult<Vec<DisputeResponse>> {
        let disputes = DisputeRepository::find_for_user(pool, user_id).await?;
        Ok(disputes.into_iter().map(DisputeResponse::from).collect())
    }

    pub async fn update_status(pool: &PgPool, dispute_id: Uuid, status: &str) -> AppResult<DisputeResponse> {
        let valid = ["open", "under_review", "resolved"];
        if !valid.contains(&status) {
            return Err(AppError::BadRequest(format!("Invalid dispute status: {}", status)));
        }
        let dispute = DisputeRepository::update_status(pool, dispute_id, status).await?
            .ok_or_else(|| AppError::NotFound("Dispute not found".to_string()))?;
        Ok(DisputeResponse::from(dispute))
    }
}
