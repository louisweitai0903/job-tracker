use axum::{
    routing::{get, post, put},
    Router,
};
use std::net::SocketAddr;
use tower_http::{
    cors::{Any, CorsLayer},
    services::ServeDir,
};

mod ai_client;
mod ai_schemas;
mod config;
mod db;
mod models;
mod routes;

#[derive(Clone)]
pub struct AppState {
    pub pool: sqlx::PgPool,
    pub ai: ai_client::AiClient,
}

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    tracing_subscriber::fmt()
        .with_env_filter(
            tracing_subscriber::EnvFilter::from_default_env()
                .add_directive(tracing::Level::INFO.into()),
        )
        .init();

    dotenvy::dotenv().ok();
    let cfg = config::Config::from_env();

    tracing::info!("Connecting to database…");
    let pool = db::create_pool(&cfg.database_url)
        .await
        .expect("Failed to connect to PostgreSQL");
    db::init_schema(&pool)
        .await
        .expect("Failed to initialise schema");

    let ai = ai_client::AiClient::new(cfg.ai_service_url.clone());
    let app_state = AppState {
        pool: pool.clone(),
        ai: ai.clone(),
    };

    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    // Job CRUD — state: PgPool
    let jobs_router = Router::new()
        .route(
            "/api/jobs",
            get(routes::jobs::list_jobs).post(routes::jobs::create_job),
        )
        .route(
            "/api/jobs/:id",
            put(routes::jobs::update_job).delete(routes::jobs::delete_job),
        )
        .with_state(pool);

    // Resume proxy — state: AppState
    let resume_router = Router::new()
        .route(
            "/api/resume",
            get(routes::resume::get_resume)
                .post(routes::resume::upload_resume)
                .put(routes::resume::put_resume)
                .delete(routes::resume::delete_resume),
        )
        .with_state(app_state.clone());

    // AI analysis — state: AppState
    let analyse_router = Router::new()
        .route(
            "/api/jobs/:id/analyse",
            post(routes::analyse::analyse_by_url),
        )
        .route(
            "/api/jobs/:id/analyse-text",
            post(routes::analyse::analyse_by_text),
        )
        .route(
            "/api/jobs/parse-url",
            post(routes::analyse::parse_url_and_fill),
        )
        .with_state(app_state.clone());

    // Merge all routers; serve the frontend as a fallback for any unmatched path
    let app = Router::new()
        .merge(jobs_router)
        .merge(resume_router)
        .merge(analyse_router)
        .fallback_service(ServeDir::new(&cfg.frontend_dir))
        .layer(cors);

    let addr = SocketAddr::from(([0, 0, 0, 0], cfg.port));
    tracing::info!("CareerFlow backend listening on http://{}", addr);
    let listener = tokio::net::TcpListener::bind(addr).await?;
    axum::serve(listener, app).await?;
    Ok(())
}
