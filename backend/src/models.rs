use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use serde_json::Value;

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
pub struct Job {
    pub id: String,
    pub company: String,
    pub title: String,
    pub status: String,
    pub date: Option<String>,
    pub link: Option<String>,
    pub contact: Option<String>,
    pub description: Option<String>,
    pub notes: Option<String>,
    pub ai_company_background: Option<String>,
    pub ai_role_summary: Option<String>,
    pub ai_skills_required: Option<Value>,
    pub ai_fit_score: Option<i32>,
    pub ai_fit_reasons: Option<Value>,
    pub ai_gaps: Option<Value>,
    pub ai_urgency_level: Option<String>,
    pub ai_processed_at: Option<DateTime<Utc>>,
    pub created_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Deserialize)]
pub struct CreateJobRequest {
    pub id: Option<String>,
    pub company: String,
    pub title: String,
    pub status: Option<String>,
    pub date: Option<String>,
    pub link: Option<String>,
    pub contact: Option<String>,
    pub description: Option<String>,
    pub notes: Option<String>,
    pub ai_company_background: Option<String>,
    pub ai_role_summary: Option<String>,
    pub ai_skills_required: Option<Value>,
    pub ai_fit_score: Option<i32>,
    pub ai_fit_reasons: Option<Value>,
    pub ai_gaps: Option<Value>,
    pub ai_urgency_level: Option<String>,
    pub ai_processed_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateJobRequest {
    pub company: String,
    pub title: String,
    pub status: String,
    pub date: Option<String>,
    pub link: Option<String>,
    pub contact: Option<String>,
    pub description: Option<String>,
    pub notes: Option<String>,
    pub ai_company_background: Option<String>,
    pub ai_role_summary: Option<String>,
    pub ai_skills_required: Option<Value>,
    pub ai_fit_score: Option<i32>,
    pub ai_fit_reasons: Option<Value>,
    pub ai_gaps: Option<Value>,
    pub ai_urgency_level: Option<String>,
    pub ai_processed_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Deserialize)]
pub struct AnalyseTextRequest {
    pub job_text: String,
    pub model: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct AnalyseUrlRequest {
    pub model: Option<String>,
}
