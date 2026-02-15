use actix_cors::Cors;
use actix_web::{web, App, HttpResponse, HttpServer};
use dotenv::dotenv;
use jejak_backend::workout;
use sqlx::postgres::PgPoolOptions;
use std::env;
use tracing::info;
use tracing_actix_web::TracingLogger;
use tracing_subscriber::EnvFilter;

async fn health_check() -> HttpResponse {
    HttpResponse::Ok().json(serde_json::json!({ "status": "ok" }))
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    dotenv().ok();
    tracing_subscriber::fmt()
        .with_env_filter(EnvFilter::from_default_env())
        .init();

    let database_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set");
    let server_host = env::var("SERVER_HOST").unwrap_or_else(|_| "127.0.0.1".to_string());
    let server_port = env::var("SERVER_PORT")
        .unwrap_or_else(|_| "8080".to_string())
        .parse()
        .expect("SERVER_PORT must be a valid port");

    info!("Connecting to database: {}", database_url);

    let pool = PgPoolOptions::new()
        .max_connections(5)
        .connect(&database_url)
        .await
        .expect("Failed to connect to database");

    info!("Database connection established");

    let pool = web::Data::new(pool);

    HttpServer::new(move || {
        App::new()
            .wrap(TracingLogger::default())
            .wrap(Cors::permissive())
            .app_data(pool.clone())
            .route("/health", web::get().to(health_check))
            .service(web::scope("/api").configure(workout::configure))
    })
    .bind((server_host.as_str(), server_port))?
    .run()
    .await
}
