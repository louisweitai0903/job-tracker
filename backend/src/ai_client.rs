use anyhow::{anyhow, Result};
use serde_json::Value;

#[derive(Clone)]
pub struct AiClient {
    http: reqwest::Client,
    pub base_url: String,
}

impl AiClient {
    pub fn new(base_url: String) -> Self {
        let http = reqwest::Client::builder()
            .timeout(std::time::Duration::from_secs(120))
            .build()
            .expect("Failed to build HTTP client");
        Self { http, base_url }
    }

    pub async fn get_resume(&self) -> Result<Value> {
        let res = self
            .http
            .get(format!("{}/resume", self.base_url))
            .send()
            .await?;
        if res.status() == 404 {
            return Err(anyhow!("No resume uploaded yet."));
        }
        let json: Value = res.json().await?;
        Ok(json)
    }

    pub async fn delete_resume(&self) -> Result<Value> {
        let res = self
            .http
            .delete(format!("{}/resume", self.base_url))
            .send()
            .await?;
        Ok(res.json().await?)
    }

    pub async fn update_resume(&self, resume_data: Value) -> Result<Value> {
        let res = self.http
            .put(format!("{}/resume", self.base_url))
            .json(&resume_data)
            .send().await?;
        if !res.status().is_success() {
            let err: Value = res.json().await.unwrap_or(Value::Null);
            return Err(anyhow!(err["detail"].as_str().unwrap_or("Failed to update resume").to_string()));
        }
        Ok(res.json().await?)
    }

    pub async fn analyse_job(&self, job_text: &str) -> Result<Value> {
        let body = serde_json::json!({ "job_text": job_text });
        let res = self
            .http
            .post(format!("{}/resume/analyse-job", self.base_url))
            .json(&body)
            .send()
            .await?;
        if !res.status().is_success() {
            let err: Value = res.json().await.unwrap_or(Value::Null);
            return Err(anyhow!(err["detail"]
                .as_str()
                .unwrap_or("AI service error")
                .to_string()));
        }
        Ok(res.json().await?)
    }

    pub async fn upload_resume_bytes(&self, filename: &str, bytes: Vec<u8>) -> Result<Value> {
        let part = reqwest::multipart::Part::bytes(bytes)
            .file_name(filename.to_string())
            .mime_str("application/pdf")?;
        let form = reqwest::multipart::Form::new().part("file", part);
        let res = self
            .http
            .post(format!("{}/resume/upload", self.base_url))
            .multipart(form)
            .send()
            .await?;
        if !res.status().is_success() {
            let err: Value = res.json().await.unwrap_or(Value::Null);
            return Err(anyhow!(err["detail"]
                .as_str()
                .unwrap_or("Upload failed")
                .to_string()));
        }
        Ok(res.json().await?)
    }
    pub async fn parse_job_url(&self, job_text: &str) -> Result<Value> {
        let body = serde_json::json!({ "job_text": job_text });
        let res = self
            .http
            .post(format!("{}/resume/parse-job-url", self.base_url))
            .json(&body)
            .send()
            .await?;
        if !res.status().is_success() {
            let err: Value = res.json().await.unwrap_or(Value::Null);
            return Err(anyhow!(err["detail"]
                .as_str()
                .unwrap_or("AI service error")
                .to_string()));
        }
        Ok(res.json().await?)
    }
}
