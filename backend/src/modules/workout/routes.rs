use super::repository::WorkoutRepository;
use actix_web::{web, HttpResponse, Result};

pub fn configure(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/workouts")
            .route("", web::get().to(get_workouts))
            .route("/{id}", web::get().to(get_workout_by_id)),
    );
}

async fn get_workouts(pool: web::Data<sqlx::Pool<sqlx::Postgres>>) -> Result<HttpResponse> {
    let workouts = WorkoutRepository::find_all(pool.get_ref())
        .await
        .map_err(actix_web::error::ErrorInternalServerError)?;

    Ok(HttpResponse::Ok().json(workouts))
}

async fn get_workout_by_id(
    pool: web::Data<sqlx::Pool<sqlx::Postgres>>,
    path: web::Path<String>,
) -> Result<HttpResponse> {
    let id = path.into_inner();

    let workout = WorkoutRepository::find_by_id(pool.get_ref(), &id)
        .await
        .map_err(actix_web::error::ErrorInternalServerError)?;

    match workout {
        Some(workout) => Ok(HttpResponse::Ok().json(workout)),
        None => Ok(HttpResponse::NotFound().json(serde_json::json!({
            "error": "Workout not found"
        }))),
    }
}
