use anyhow::Result;
use sqlx::PgPool;

pub async fn create_pool(database_url: &str) -> Result<PgPool> {
    let pool = sqlx::postgres::PgPoolOptions::new()
        .max_connections(10)
        .connect(database_url)
        .await?;
    Ok(pool)
}

pub async fn init_schema(pool: &PgPool) -> Result<()> {
    sqlx::query(
        "CREATE TABLE IF NOT EXISTS jobs (
            id VARCHAR(50) PRIMARY KEY,
            company VARCHAR(255) NOT NULL,
            title VARCHAR(255) NOT NULL,
            status VARCHAR(50) NOT NULL DEFAULT 'Applied',
            date VARCHAR(10),
            link TEXT,
            contact VARCHAR(255),
            description TEXT,
            notes TEXT,
            ai_company_background TEXT,
            ai_role_summary TEXT,
            ai_skills_required JSONB,
            ai_fit_score INTEGER,
            ai_fit_reasons JSONB,
            ai_gaps JSONB,
            ai_urgency_level VARCHAR(10),
            ai_processed_at TIMESTAMPTZ,
            created_at TIMESTAMPTZ DEFAULT NOW()
        );",
    )
    .execute(pool)
    .await?;

    // Idempotent column migrations
    let ai_columns = [
        ("ai_company_background", "TEXT"),
        ("ai_role_summary", "TEXT"),
        ("ai_skills_required", "JSONB"),
        ("ai_fit_score", "INTEGER"),
        ("ai_fit_reasons", "JSONB"),
        ("ai_gaps", "JSONB"),
        ("ai_urgency_level", "VARCHAR(10)"),
        ("ai_processed_at", "TIMESTAMPTZ"),
    ];
    for (col, typ) in ai_columns {
        let _ = sqlx::query(&format!(
            "ALTER TABLE jobs ADD COLUMN IF NOT EXISTS {} {};",
            col, typ
        ))
        .execute(pool)
        .await;
    }

    tracing::info!("Database schema initialised.");
    Ok(())
}
