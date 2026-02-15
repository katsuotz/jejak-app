use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WorkoutPhase {
    pub name: String,
    #[serde(rename = "durationSeconds")]
    pub duration_seconds: i32,
    pub bpm: i32,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Workout {
    pub id: String,
    pub name: String,
    pub total_duration_minutes: i32,
    pub description: String,
    pub phases: Vec<WorkoutPhase>,
    pub created_at: Option<chrono::DateTime<chrono::Utc>>,
    pub updated_at: Option<chrono::DateTime<chrono::Utc>>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct WorkoutResponse {
    pub id: String,
    pub name: String,
    #[serde(rename = "totalDurationMinutes")]
    pub total_duration_minutes: i32,
    pub description: String,
    pub phases: Vec<WorkoutPhase>,
}
