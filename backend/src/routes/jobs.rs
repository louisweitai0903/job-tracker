use axum::{
    extract::{Path, State},
    http::StatusCode,
    Json,
};
use serde_json::{json, Value};
use sqlx::PgPool;

use crate::models::{CreateJobRequest, UpdateJobRequest};

pub async fn list_jobs(
    State(pool): State<PgPool>,
) -> Result<Json<Value>, (StatusCode, Json<Value>)> {
    let rows = sqlx::query_as::<_, crate::models::Job>(
        "SELECT * FROM jobs ORDER BY created_at DESC",
    )
    .fetch_all(&pool)
    .await
    .map_err(|e| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({"error": e.to_string()})),
        )
    })?;
    Ok(Json(json!(rows)))
}

pub async fn create_job(
    State(pool): State<PgPool>,
    Json(req): Json<CreateJobRequest>,
) -> Result<(StatusCode, Json<Value>), (StatusCode, Json<Value>)> {
    if req.company.is_empty() || req.title.is_empty() {
        return Err((
            StatusCode::BAD_REQUEST,
            Json(json!({"error": "Company and Title are required."})),
        ));
    }
    let id = req
        .id
        .unwrap_or_else(|| uuid::Uuid::new_v4().to_string());
    let row = sqlx::query_as::<_, crate::models::Job>(
        "INSERT INTO jobs (
            id, company, title, status, date, link, contact, description, notes,
            ai_company_background, ai_role_summary, ai_skills_required, ai_fit_score,
            ai_fit_reasons, ai_gaps, ai_urgency_level, ai_processed_at
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17) RETURNING *",
    )
    .bind(&id)
    .bind(&req.company)
    .bind(&req.title)
    .bind(req.status.as_deref().unwrap_or("Applied"))
    .bind(req.date.as_deref().unwrap_or(""))
    .bind(req.link.as_deref().unwrap_or(""))
    .bind(req.contact.as_deref().unwrap_or(""))
    .bind(req.description.as_deref().unwrap_or(""))
    .bind(req.notes.as_deref().unwrap_or(""))
    .bind(req.ai_company_background.as_deref().unwrap_or(""))
    .bind(req.ai_role_summary.as_deref().unwrap_or(""))
    .bind(&req.ai_skills_required)
    .bind(req.ai_fit_score)
    .bind(&req.ai_fit_reasons)
    .bind(&req.ai_gaps)
    .bind(req.ai_urgency_level.as_deref().unwrap_or(""))
    .bind(req.ai_processed_at)
    .fetch_one(&pool)
    .await
    .map_err(|e| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({"error": e.to_string()})),
        )
    })?;
    Ok((StatusCode::CREATED, Json(json!(row))))
}

pub async fn update_job(
    State(pool): State<PgPool>,
    Path(id): Path<String>,
    Json(req): Json<UpdateJobRequest>,
) -> Result<Json<Value>, (StatusCode, Json<Value>)> {
    if req.company.is_empty() || req.title.is_empty() {
        return Err((
            StatusCode::BAD_REQUEST,
            Json(json!({"error": "Company and Title are required."})),
        ));
    }
    let row = sqlx::query_as::<_, crate::models::Job>(
        "UPDATE jobs
         SET company=$1, title=$2, status=$3, date=$4, link=$5,
             contact=$6, description=$7, notes=$8,
             ai_company_background=$9, ai_role_summary=$10, ai_skills_required=$11, ai_fit_score=$12,
             ai_fit_reasons=$13, ai_gaps=$14, ai_urgency_level=$15, ai_processed_at=$16
         WHERE id=$17 RETURNING *",
    )
    .bind(&req.company)
    .bind(&req.title)
    .bind(&req.status)
    .bind(req.date.as_deref().unwrap_or(""))
    .bind(req.link.as_deref().unwrap_or(""))
    .bind(req.contact.as_deref().unwrap_or(""))
    .bind(req.description.as_deref().unwrap_or(""))
    .bind(req.notes.as_deref().unwrap_or(""))
    .bind(req.ai_company_background.as_deref().unwrap_or(""))
    .bind(req.ai_role_summary.as_deref().unwrap_or(""))
    .bind(&req.ai_skills_required)
    .bind(req.ai_fit_score)
    .bind(&req.ai_fit_reasons)
    .bind(&req.ai_gaps)
    .bind(req.ai_urgency_level.as_deref().unwrap_or(""))
    .bind(req.ai_processed_at)
    .bind(&id)
    .fetch_optional(&pool)
    .await
    .map_err(|e| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({"error": e.to_string()})),
        )
    })?;
    match row {
        Some(j) => Ok(Json(json!(j))),
        None => Err((
            StatusCode::NOT_FOUND,
            Json(json!({"error": "Job not found."})),
        )),
    }
}

pub async fn delete_job(
    State(pool): State<PgPool>,
    Path(id): Path<String>,
) -> Result<Json<Value>, (StatusCode, Json<Value>)> {
    let row = sqlx::query_as::<_, crate::models::Job>(
        "DELETE FROM jobs WHERE id=$1 RETURNING *",
    )
    .bind(&id)
    .fetch_optional(&pool)
    .await
    .map_err(|e| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({"error": e.to_string()})),
        )
    })?;
    match row {
        Some(_) => Ok(Json(json!({"message": "Deleted."}))),
        None => Err((
            StatusCode::NOT_FOUND,
            Json(json!({"error": "Job not found."})),
        )),
    }
}
