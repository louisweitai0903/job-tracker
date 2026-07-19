pub struct Config {
    pub database_url: String,
    pub ai_service_url: String,
    pub port: u16,
    pub frontend_dir: String,
}

impl Config {
    pub fn from_env() -> Self {
        let host = std::env::var("PGHOST").unwrap_or_else(|_| "localhost".to_string());
        let user = std::env::var("PGUSER").unwrap_or_else(|_| "tracker_user".to_string());
        let password =
            std::env::var("PGPASSWORD").unwrap_or_else(|_| "tracker_password".to_string());
        let db = std::env::var("PGDATABASE").unwrap_or_else(|_| "job_tracker".to_string());
        let pg_port = std::env::var("PGPORT").unwrap_or_else(|_| "5432".to_string());

        Config {
            database_url: format!("postgres://{user}:{password}@{host}:{pg_port}/{db}"),
            ai_service_url: std::env::var("AI_SERVICE_URL")
                .unwrap_or_else(|_| "http://localhost:8001".to_string()),
            port: std::env::var("PORT")
                .ok()
                .and_then(|p| p.parse().ok())
                .unwrap_or(8000),
            frontend_dir: std::env::var("FRONTEND_DIR")
                .unwrap_or_else(|_| "/app/frontend".to_string()),
        }
    }
}
