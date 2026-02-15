use super::model::{WorkoutPhase, WorkoutResponse};
use sqlx::{Pool, Postgres};

pub struct WorkoutRepository;

impl WorkoutRepository {
    pub async fn find_all(pool: &Pool<Postgres>) -> Result<Vec<WorkoutResponse>, sqlx::Error> {
        let workouts = sqlx::query_as::<_, (uuid::Uuid, String, i32, String, serde_json::Value, i32)>(
            "SELECT id, name, total_duration_minutes, description, phases, \"order\" FROM workouts ORDER BY \"order\"",
        )
        .fetch_all(pool)
        .await?;

        let result: Vec<WorkoutResponse> = workouts
            .into_iter()
            .map(|(id, name, total_duration_minutes, description, phases, order)| {
                let phases: Vec<WorkoutPhase> = serde_json::from_value(phases).unwrap_or_default();
                WorkoutResponse {
                    id: id.to_string(),
                    name,
                    total_duration_minutes,
                    description,
                    phases,
                    order,
                }
            })
            .collect();

        Ok(result)
    }

    pub async fn find_by_id(
        pool: &Pool<Postgres>,
        id: &str,
    ) -> Result<Option<WorkoutResponse>, sqlx::Error> {
        let result = sqlx::query_as::<_, (uuid::Uuid, String, i32, String, serde_json::Value, i32)>(
            "SELECT id, name, total_duration_minutes, description, phases, \"order\" FROM workouts WHERE id = $1",
        )
        .bind(id)
        .fetch_optional(pool)
        .await?;

        match result {
            Some((id, name, total_duration_minutes, description, phases, order)) => {
                let phases: Vec<WorkoutPhase> = serde_json::from_value(phases).unwrap_or_default();
                Ok(Some(WorkoutResponse {
                    id: id.to_string(),
                    name,
                    total_duration_minutes,
                    description,
                    phases,
                    order,
                }))
            }
            None => Ok(None),
        }
    }
}
