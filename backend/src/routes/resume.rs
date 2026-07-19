use axum::{
    extract::{Multipart, State},
    http::StatusCode,
    Json,
};
use serde_json::{json, Value};

use crate::ai_client::AiClient;

pub async fn get_resume(
    State(ai): State<AiClient>,
) -> Result<Json<Value>, (StatusCode, Json<Value>)> {
    ai.get_resume().await.map(Json).map_err(|e| {
        let code = if e.to_string().contains("No resume") {
            StatusCode::NOT_FOUND
        } else {
            StatusCode::INTERNAL_SERVER_ERROR
        };
        (code, Json(json!({"error": e.to_string()})))
    })
}

pub async fn upload_resume(
    State(ai): State<AiClient>,
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
        let result = ai
            .upload_resume_bytes(&filename, bytes.to_vec())
            .await
            .map_err(|e| {
                (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    Json(json!({"error": e.to_string()})),
                )
            });
        return result.map(Json);
    }
    Err((
        StatusCode::BAD_REQUEST,
        Json(json!({"error": "No file provided."})),
    ))
}

pub async fn delete_resume(
    State(ai): State<AiClient>,
) -> Result<Json<Value>, (StatusCode, Json<Value>)> {
    ai.delete_resume().await.map(Json).map_err(|e| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({"error": e.to_string()})),
        )
    })
}

pub async fn put_resume(
    State(ai): State<AiClient>,
    Json(body): Json<Value>,
) -> Result<Json<Value>, (StatusCode, Json<Value>)> {
    ai.update_resume(body).await.map(Json).map_err(|e| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({"error": e.to_string()})),
        )
    })
}
