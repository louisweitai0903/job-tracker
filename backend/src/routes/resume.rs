use axum::{
    extract::{Multipart, State},
    http::StatusCode,
    Json,
};
use serde_json::{json, Value};
use sqlx::Row;

use crate::AppState;

const SINGLETON_ID: &str = "my_profile";

pub async fn get_resume(
    State(state): State<AppState>,
) -> Result<Json<Value>, (StatusCode, Json<Value>)> {
    let row = sqlx::query("SELECT data FROM profile WHERE id = $1")
        .bind(SINGLETON_ID)
        .fetch_optional(&state.pool)
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": e.to_string()}))))?;

    match row {
        Some(r) => {
            let data: Value = r.get("data");
            Ok(Json(data))
        }
        None => Err((StatusCode::NOT_FOUND, Json(json!({"error": "No resume uploaded yet."})))),
    }
}

pub async fn upload_resume(
    State(state): State<AppState>,
    mut multipart: Multipart,
) -> Result<Json<Value>, (StatusCode, Json<Value>)> {
    while let Some(field) = multipart
        .next_field()
        .await
        .map_err(|e| (StatusCode::BAD_REQUEST, Json(json!({"error": e.to_string()}))))?
    {
        let filename = field.file_name().unwrap_or("resume.pdf").to_string();
        let bytes = field
            .bytes()
            .await
            .map_err(|e| (StatusCode::BAD_REQUEST, Json(json!({"error": e.to_string()}))))?;
            
        let mut result = state.ai
            .upload_resume_bytes(&filename, bytes.to_vec())
            .await
            .map_err(|e| {
                (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    Json(json!({"error": e.to_string()})),
                )
            })?;
            
        // add filename and uploaded_at
        if let Some(obj) = result.as_object_mut() {
            obj.insert("filename".to_string(), json!(filename));
            obj.insert("uploaded_at".to_string(), json!(chrono::Utc::now().to_rfc3339()));
        }

        // Save to DB
        sqlx::query("INSERT INTO profile (id, data) VALUES ($1, $2) ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data")
            .bind(SINGLETON_ID)
            .bind(&result)
            .execute(&state.pool)
            .await
            .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": e.to_string()}))))?;

        return Ok(Json(result));
    }
    Err((
        StatusCode::BAD_REQUEST,
        Json(json!({"error": "No file provided."})),
    ))
}

pub async fn delete_resume(
    State(state): State<AppState>,
) -> Result<Json<Value>, (StatusCode, Json<Value>)> {
    sqlx::query("DELETE FROM profile WHERE id = $1")
        .bind(SINGLETON_ID)
        .execute(&state.pool)
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": e.to_string()}))))?;
        
    Ok(Json(json!({"message": "Resume deleted successfully."})))
}

pub async fn put_resume(
    State(state): State<AppState>,
    Json(body): Json<Value>,
) -> Result<Json<Value>, (StatusCode, Json<Value>)> {
    sqlx::query("INSERT INTO profile (id, data) VALUES ($1, $2) ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data")
        .bind(SINGLETON_ID)
        .bind(&body)
        .execute(&state.pool)
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"error": e.to_string()}))))?;
        
    Ok(Json(body))
}
