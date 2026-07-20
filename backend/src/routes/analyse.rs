use axum::{
    extract::{Path, State},
    http::StatusCode,
    Json,
};
use serde_json::{json, Value};
use sqlx::{PgPool, Row};

use crate::ai_client::AiClient;
use crate::models::AnalyseTextRequest;
use crate::AppState;

const SINGLETON_ID: &str = "my_profile";

/// Minimal HTML tag stripper — no external regex dependency required.
fn strip_html_tags(html: &str) -> String {
    let mut result = String::with_capacity(html.len());
    let mut in_tag = false;
    for ch in html.chars() {
        match ch {
            '<' => in_tag = true,
            '>' => in_tag = false,
            c if !in_tag => result.push(c),
            _ => {}
        }
    }
    result
}

async fn scrape_job_text(url: &str) -> Option<String> {
    let client = reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(15))
        .user_agent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
        .default_headers({
            let mut headers = reqwest::header::HeaderMap::new();
            headers.insert(reqwest::header::ACCEPT, "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7".parse().unwrap());
            headers.insert(reqwest::header::ACCEPT_LANGUAGE, "en-US,en;q=0.9".parse().unwrap());
            headers
        })
        .build()
        .ok()?;
    let html = client.get(url).send().await.ok()?.text().await.ok()?;
    let text = strip_html_tags(&html);
    let trimmed = text.split_whitespace().collect::<Vec<_>>().join(" ");
    if trimmed.len() > 100 {
        Some(trimmed.chars().take(8000).collect())
    } else {
        None
    }
}

async fn get_profile(pool: &PgPool) -> Result<Value, (StatusCode, Json<Value>)> {
    let row = sqlx::query("SELECT data FROM profile WHERE id = $1")
        .bind(SINGLETON_ID)
        .fetch_optional(pool)
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": e.to_string()}))))?;

    match row {
        Some(r) => {
            let data: Value = r.get("data");
            Ok(data)
        }
        None => Err((StatusCode::NOT_FOUND, Json(json!({"error": "No resume found. Please upload your resume first in the profile section."})))),
    }
}

async fn run_analysis(
    pool: &PgPool,
    ai: &AiClient,
    job_id: &str,
    job_text: &str,
) -> Result<Json<Value>, (StatusCode, Json<Value>)> {
    let profile = get_profile(pool).await?;

    let analysis = ai.analyse_job(&profile, job_text).await.map_err(|e| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({"error": e.to_string()})),
        )
    })?;

    let skills = analysis["skills_required"]
        .as_array()
        .cloned()
        .unwrap_or_default();
    let gaps: Vec<&str> = skills
        .iter()
        .filter(|s| !s["candidate_has"].as_bool().unwrap_or(false))
        .filter_map(|s| s["name"].as_str())
        .collect();
    let fit_reasons = json!({
        "match": analysis["match_reasons"],
        "tips":  analysis["improvement_tips"],
    });

    sqlx::query(
        "UPDATE jobs
         SET ai_company_background=$1, ai_role_summary=$2, ai_skills_required=$3, ai_fit_score=$4,
             ai_fit_reasons=$5, ai_gaps=$6, ai_urgency_level=$7, ai_processed_at=NOW()
         WHERE id=$8",
    )
    .bind(analysis["company_background"].as_str().unwrap_or(""))
    .bind(analysis["role_summary"].as_str().unwrap_or(""))
    .bind(&analysis["skills_required"])
    .bind(analysis["fit_score"].as_i64().unwrap_or(0) as i32)
    .bind(&fit_reasons)
    .bind(json!(gaps))
    .bind(analysis["urgency_level"].as_str().unwrap_or("medium"))
    .bind(job_id)
    .execute(pool)
    .await
    .map_err(|e| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({"error": e.to_string()})),
        )
    })?;

    let updated = sqlx::query_as::<_, crate::models::Job>(
        "SELECT * FROM jobs WHERE id=$1",
    )
    .bind(job_id)
    .fetch_optional(pool)
    .await
    .map_err(|e| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({"error": e.to_string()})),
        )
    })?
    .ok_or_else(|| {
        (
            StatusCode::NOT_FOUND,
            Json(json!({"error": "Job not found."})),
        )
    })?;

    Ok(Json(json!(updated)))
}

pub async fn analyse_by_url(
    State(state): State<AppState>,
    Path(id): Path<String>,
) -> Result<Json<Value>, (StatusCode, Json<Value>)> {
    let job = sqlx::query_as::<_, crate::models::Job>(
        "SELECT * FROM jobs WHERE id=$1",
    )
    .bind(&id)
    .fetch_optional(&state.pool)
    .await
    .map_err(|e| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({"error": e.to_string()})),
        )
    })?
    .ok_or_else(|| {
        (
            StatusCode::NOT_FOUND,
            Json(json!({"error": "Job not found."})),
        )
    })?;

    let mut job_text = job.description.clone().unwrap_or_default();
    if let Some(url) = &job.link {
        if !url.is_empty() {
            if let Some(scraped) = scrape_job_text(url).await {
                job_text = scraped;
            }
        }
    }

    if job_text.trim().len() < 50 {
        return Err((
            StatusCode::BAD_REQUEST,
            Json(json!({
                "error": "Could not fetch job description. Please paste it manually."
            })),
        ));
    }

    run_analysis(&state.pool, &state.ai, &id, &job_text).await
}

pub async fn analyse_by_text(
    State(state): State<AppState>,
    Path(id): Path<String>,
    Json(req): Json<AnalyseTextRequest>,
) -> Result<Json<Value>, (StatusCode, Json<Value>)> {
    if req.job_text.trim().len() < 50 {
        return Err((
            StatusCode::BAD_REQUEST,
            Json(json!({
                "error": "Please provide at least 50 characters of job description."
            })),
        ));
    }
    run_analysis(&state.pool, &state.ai, &id, &req.job_text).await
}

#[derive(Debug, serde::Deserialize)]
pub struct ParseUrlRequest {
    pub url: Option<String>,
    pub job_text: Option<String>,
}

pub async fn parse_url_and_fill(
    State(state): State<AppState>,
    Json(req): Json<ParseUrlRequest>,
) -> Result<Json<Value>, (StatusCode, Json<Value>)> {
    let profile = get_profile(&state.pool).await?;

    let mut job_text = req.job_text.unwrap_or_default();
    
    if job_text.trim().is_empty() {
        if let Some(url) = &req.url {
            if !url.trim().is_empty() {
                if let Some(scraped) = scrape_job_text(url).await {
                    job_text = scraped;
                }
            }
        }
    }

    if job_text.trim().len() < 50 {
        return Err((
            StatusCode::BAD_REQUEST,
            Json(json!({
                "error": "Could not retrieve job description text. Please paste it manually."
            })),
        ));
    }

    let parsed = state.ai.parse_job_url(&profile, &job_text).await.map_err(|e| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({"error": e.to_string()})),
        )
    })?;

    // Return the parsed JSON back directly, which contains:
    // company, title, analysis_ready, role_summary, match_reasons, improvement_tips, skills_required, fit_score, urgency_level
    // We also return the job_text so the frontend can populate the description
    let mut parsed_obj = parsed;
    if let Some(obj) = parsed_obj.as_object_mut() {
        obj.insert("description".to_string(), json!(job_text));
    }

    Ok(Json(parsed_obj))
}
