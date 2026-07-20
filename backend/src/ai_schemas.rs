use serde_json::{json, Value};

pub fn resume_schema() -> Value {
    json!({
        "type": "object",
        "properties": {
            "profile_strength_score": {"type": "integer"},
            "profile_strength_tip": {"type": "string"},
            "skills": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "name": {"type": "string"},
                        "category": {"type": "string", "enum": ["technical", "design", "soft", "language", "tool"]}
                    },
                    "required": ["name", "category"]
                }
            },
            "work_experience": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "title": {"type": "string"},
                        "company": {"type": "string"},
                        "period": {"type": "string"},
                        "summary": {"type": "string"}
                    },
                    "required": ["title", "company", "period", "summary"]
                }
            },
            "education": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "degree": {"type": "string"},
                        "institution": {"type": "string"},
                        "period": {"type": "string"},
                        "specialization": {"type": "string"}
                    },
                    "required": ["degree", "institution", "period"]
                }
            },
            "projects": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "name": {"type": "string"},
                        "description": {"type": "string"},
                        "technologies": {"type": "array", "items": {"type": "string"}}
                    },
                    "required": ["name", "description", "technologies"]
                }
            }
        },
        "required": ["profile_strength_score", "profile_strength_tip", "skills", "work_experience", "education", "projects"]
    })
}

pub fn job_analysis_schema(include_parsing: bool) -> Value {
    let mut props = json!({
        "analysis_ready": {"type": "boolean"},
        "role_summary": {"type": "string"},
        "company_background": {"type": "string"},
        "match_reasons": {"type": "array", "items": {"type": "string"}},
        "improvement_tips": {"type": "array", "items": {"type": "string"}},
        "skills_required": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "name": {"type": "string"},
                    "candidate_has": {"type": "boolean"}
                },
                "required": ["name", "candidate_has"]
            }
        },
        "fit_score": {"type": "integer"},
        "urgency_level": {"type": "string", "enum": ["high", "medium", "low"]}
    });

    let mut required = vec![
        "analysis_ready", "role_summary", "company_background", "match_reasons", 
        "improvement_tips", "skills_required", "fit_score", "urgency_level"
    ];

    if include_parsing {
        props.as_object_mut().unwrap().insert("company".to_string(), json!({"type": "string"}));
        props.as_object_mut().unwrap().insert("title".to_string(), json!({"type": "string"}));
        required.insert(0, "title");
        required.insert(0, "company");
    }

    json!({
        "type": "object",
        "properties": props,
        "required": required
    })
}
