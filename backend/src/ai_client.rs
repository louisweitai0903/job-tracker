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

    pub async fn upload_resume_bytes(&self, filename: &str, bytes: Vec<u8>) -> Result<Value> {
        use crate::ai_schemas::resume_schema;
        
        let schema_str = serde_json::to_string(&resume_schema())?;
        
        let part = reqwest::multipart::Part::bytes(bytes)
            .file_name(filename.to_string())
            .mime_str("application/pdf")?;
        
        let form = reqwest::multipart::Form::new().part("file", part);
        
        let url = format!("{}?system_prompt={}&schema_definition={}", 
            format!("{}/extract-file", self.base_url),
            "Extract structured data accurately from the provided resume PDF. Be thorough and specific. Score profile_strength_score from 0-100 based on completeness, specificity, and measurable impact. Write profile_strength_tip as one concrete, actionable sentence to improve job match rates.",
            urlencoding::encode(&schema_str)
        );

        let res = self
            .http
            .post(&url)
            .multipart(form)
            .send()
            .await?;
            
        if !res.status().is_success() {
            let err: Value = res.json().await.unwrap_or(Value::Null);
            return Err(anyhow!(err["detail"].as_str().unwrap_or("Upload failed").to_string()));
        }
        
        let json: Value = res.json().await?;
        // The new AI service wraps it in {"result": {...}, "model": "..."}
        Ok(json["result"].clone())
    }

    pub async fn analyse_job(&self, resume_json: &Value, job_text: &str) -> Result<Value> {
        use crate::ai_schemas::job_analysis_schema;
        
        let skills_list = resume_json["skills"].as_array().unwrap_or(&vec![]).iter().filter_map(|s| s["name"].as_str()).collect::<Vec<_>>().join(", ");
        let exp_list = resume_json["work_experience"].as_array().unwrap_or(&vec![]).iter().map(|e| format!("{} at {} ({})", e["title"].as_str().unwrap_or(""), e["company"].as_str().unwrap_or(""), e["period"].as_str().unwrap_or(""))).collect::<Vec<_>>().join("; ");
        let projects_list = resume_json["projects"].as_array().unwrap_or(&vec![]).iter().filter_map(|p| p["name"].as_str()).collect::<Vec<_>>().join("; ");
        
        let context = serde_json::json!({
            "candidate_skills": skills_list,
            "candidate_experience": exp_list,
            "candidate_projects": projects_list,
            "job_description": job_text,
        });

        let body = serde_json::json!({
            "context": context,
            "system_prompt": "You are an expert career coach and talent analyst. Analyse the job description against the candidate resume profile and return a structured fit analysis. Be specific, honest, and insightful. fit_score is 0-100. urgency_level: high=strong match pursue immediately, medium=worth applying with preparation, low=significant gaps exist.",
            "schema_definition": job_analysis_schema(false)
        });

        let res = self
            .http
            .post(format!("{}/search", self.base_url)) // We use /search because we want the company background grounding!
            .json(&body)
            .send()
            .await?;
            
        if !res.status().is_success() {
            let err: Value = res.json().await.unwrap_or(Value::Null);
            return Err(anyhow!(err["detail"].as_str().unwrap_or("AI service error").to_string()));
        }
        
        let json: Value = res.json().await?;
        Ok(json["result"].clone())
    }

    pub async fn parse_job_url(&self, resume_json: &Value, job_text: &str) -> Result<Value> {
        use crate::ai_schemas::job_analysis_schema;
        
        let skills_list = resume_json["skills"].as_array().unwrap_or(&vec![]).iter().filter_map(|s| s["name"].as_str()).collect::<Vec<_>>().join(", ");
        let exp_list = resume_json["work_experience"].as_array().unwrap_or(&vec![]).iter().map(|e| format!("{} at {} ({})", e["title"].as_str().unwrap_or(""), e["company"].as_str().unwrap_or(""), e["period"].as_str().unwrap_or(""))).collect::<Vec<_>>().join("; ");
        let projects_list = resume_json["projects"].as_array().unwrap_or(&vec![]).iter().filter_map(|p| p["name"].as_str()).collect::<Vec<_>>().join("; ");
        
        let context = serde_json::json!({
            "candidate_skills": skills_list,
            "candidate_experience": exp_list,
            "candidate_projects": projects_list,
            "job_description": job_text,
        });

        let body = serde_json::json!({
            // /search requires a "query", we will map context to it in our generic endpoint if needed, wait /search in Python expects "query" string. 
            // The prompt we passed earlier used data context. 
            // Wait, let's look at /search in python: it just takes `query` and uses `use_google_search=True`. But it doesn't take `data`.
            // Let's pass the context inside the query.
            "query": serde_json::to_string(&context).unwrap_or_default(),
            "system_prompt": "You are an expert career coach and talent analyst. Analyse the job description against the candidate resume profile and return a structured fit analysis. You MUST also extract the correct company name and job title from the job text. Be specific, honest, and insightful. fit_score is 0-100. urgency_level: high=strong match pursue immediately, medium=worth applying with preparation, low=significant gaps exist.",
            "schema_definition": job_analysis_schema(true)
        });

        let res = self
            .http
            .post(format!("{}/search", self.base_url))
            .json(&body)
            .send()
            .await?;
            
        if !res.status().is_success() {
            let err: Value = res.json().await.unwrap_or(Value::Null);
            return Err(anyhow!(err["detail"].as_str().unwrap_or("AI service error").to_string()));
        }
        let json: Value = res.json().await?;
        Ok(json["result"].clone())
    }
}
