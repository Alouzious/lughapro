use serde::{Deserialize, Serialize};
use serde_json::json;
use sqlx::PgPool;
use tracing::warn;
use uuid::Uuid;

use crate::config::AppConfig;
use crate::errors::{AppError, AppResult};
use crate::modules::credits::service::CreditService;
use super::repository::AiRepository;

const SYSTEM_PROMPT: &str = "You are Amina, a warm native Kiswahili tutor. Respond primarily in \
Kiswahili and always include a short English translation in parentheses. Gently correct the \
student's grammar and adapt to their current CEFR level. Keep replies concise and encouraging.";

const AI_PRACTICE_CREDITS: i32 = 5;
const DAILY_CREDIT_THRESHOLD: i32 = 10;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChatMessage {
    pub role: String, // "user" | "assistant"
    pub content: String,
}

#[derive(Debug, Deserialize)]
pub struct ChatRequest {
    pub messages: Vec<ChatMessage>,
}

pub struct AiService;

impl AiService {
    pub async fn usage(pool: &PgPool, config: &AppConfig, student_id: Uuid) -> AppResult<serde_json::Value> {
        let used = AiRepository::today_usage(pool, student_id).await?;
        let tier = AiRepository::subscription_tier(pool, student_id).await?;
        let limit = if tier == "free" { Some(config.ai_daily_free_limit as i32) } else { None };
        Ok(json!({
            "messages_used": used,
            "tier": tier,
            "daily_limit": limit,
            "remaining": limit.map(|l| (l - used).max(0)),
        }))
    }

    pub async fn chat(
        pool: &PgPool,
        config: &AppConfig,
        student_id: Uuid,
        req: ChatRequest,
    ) -> AppResult<serde_json::Value> {
        let tier = AiRepository::subscription_tier(pool, student_id).await?;
        let used = AiRepository::today_usage(pool, student_id).await?;
        let limit = config.ai_daily_free_limit as i32;
        if tier == "free" && used >= limit {
            return Err(AppError::Forbidden);
        }

        let reply = Self::generate_reply(config, &req.messages).await;

        let new_count = AiRepository::increment_usage(pool, student_id).await?;

        // Award daily AI-practice credits once the student crosses the threshold.
        let mut credit_result = json!(null);
        if new_count == DAILY_CREDIT_THRESHOLD {
            credit_result =
                CreditService::award(pool, config, student_id, AI_PRACTICE_CREDITS, "ai_practice", None)
                    .await
                    .unwrap_or(json!(null));
        }

        let remaining = if tier == "free" { Some((limit - new_count).max(0)) } else { None };
        Ok(json!({
            "reply": reply,
            "messages_used": new_count,
            "remaining": remaining,
            "tier": tier,
            "credits": credit_result,
        }))
    }

    async fn generate_reply(config: &AppConfig, messages: &[ChatMessage]) -> String {
        if let Some(key) = &config.anthropic_api_key {
            match Self::call_anthropic(key, messages).await {
                Ok(text) => return text,
                Err(e) => warn!("Anthropic call failed: {e}"),
            }
        }
        if let Some(key) = &config.groq_api_key {
            match Self::call_groq(key, messages).await {
                Ok(text) => return text,
                Err(e) => warn!("Groq call failed: {e}"),
            }
        }
        // Offline fallback keeps the tutor usable without API keys.
        "Samahani, mwalimu wa AI hayupo mtandaoni kwa sasa. (Sorry, the AI tutor is offline right now.) \
Jaribu tena baadaye. (Please try again later.)"
            .to_string()
    }

    async fn call_anthropic(api_key: &str, messages: &[ChatMessage]) -> anyhow::Result<String> {
        let client = reqwest::Client::new();
        let body = json!({
            "model": "claude-3-5-sonnet-20241022",
            "max_tokens": 1024,
            "system": SYSTEM_PROMPT,
            "messages": messages.iter().map(|m| json!({"role": m.role, "content": m.content})).collect::<Vec<_>>(),
        });
        let resp = client
            .post("https://api.anthropic.com/v1/messages")
            .header("x-api-key", api_key)
            .header("anthropic-version", "2023-06-01")
            .header("content-type", "application/json")
            .json(&body)
            .send()
            .await?
            .error_for_status()?;
        let data: serde_json::Value = resp.json().await?;
        let text = data["content"][0]["text"]
            .as_str()
            .unwrap_or("(no response)")
            .to_string();
        Ok(text)
    }

    async fn call_groq(api_key: &str, messages: &[ChatMessage]) -> anyhow::Result<String> {
        let client = reqwest::Client::new();
        let mut msgs = vec![json!({"role": "system", "content": SYSTEM_PROMPT})];
        for m in messages {
            msgs.push(json!({"role": m.role, "content": m.content}));
        }
        let body = json!({
            "model": "llama-3.3-70b-versatile",
            "messages": msgs,
            "max_tokens": 1024,
        });
        let resp = client
            .post("https://api.groq.com/openai/v1/chat/completions")
            .bearer_auth(api_key)
            .json(&body)
            .send()
            .await?
            .error_for_status()?;
        let data: serde_json::Value = resp.json().await?;
        let text = data["choices"][0]["message"]["content"]
            .as_str()
            .unwrap_or("(no response)")
            .to_string();
        Ok(text)
    }
}
