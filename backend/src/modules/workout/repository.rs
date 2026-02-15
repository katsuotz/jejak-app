use super::model::{WorkoutPhase, WorkoutResponse};
use sqlx::{Pool, Postgres};

pub struct WorkoutRepository;

impl WorkoutRepository {
    pub async fn find_all(pool: &Pool<Postgres>) -> Result<Vec<WorkoutResponse>, sqlx::Error> {
        let workouts = sqlx::query_as::<_, (String, String, i32, String, serde_json::Value)>(
            "SELECT id, name, total_duration_minutes, description, phases FROM workouts ORDER BY id",
        )
        .fetch_all(pool)
        .await?;

        let result: Vec<WorkoutResponse> = workouts
            .into_iter()
            .map(|(id, name, total_duration_minutes, description, phases)| {
                let phases: Vec<WorkoutPhase> = serde_json::from_value(phases).unwrap_or_default();
                WorkoutResponse {
                    id,
                    name,
                    total_duration_minutes,
                    description,
                    phases,
                }
            })
            .collect();

        Ok(result)
    }

    pub async fn find_by_id(
        pool: &Pool<Postgres>,
        id: &str,
    ) -> Result<Option<WorkoutResponse>, sqlx::Error> {
        let result = sqlx::query_as::<_, (String, String, i32, String, serde_json::Value)>(
            "SELECT id, name, total_duration_minutes, description, phases FROM workouts WHERE id = $1",
        )
        .bind(id)
        .fetch_optional(pool)
        .await?;

        match result {
            Some((id, name, total_duration_minutes, description, phases)) => {
                let phases: Vec<WorkoutPhase> = serde_json::from_value(phases).unwrap_or_default();
                Ok(Some(WorkoutResponse {
                    id,
                    name,
                    total_duration_minutes,
                    description,
                    phases,
                }))
            }
            None => Ok(None),
        }
    }
}
