use jejak_backend::workout::WorkoutPhase;
use sqlx::postgres::PgPoolOptions;
use std::env;
use tracing::{error, info};
use uuid::Uuid;

fn m(minutes: i32) -> i32 {
    minutes * 60
}

fn s(seconds: i32) -> i32 {
    seconds
}

fn repeat(count: i32, phases: Vec<WorkoutPhase>) -> Vec<WorkoutPhase> {
    let mut result = Vec::new();
    for i in 0..count {
        for p in &phases {
            result.push(WorkoutPhase {
                name: format!("{} ({}/{})", p.name, i + 1, count),
                duration_seconds: p.duration_seconds,
                bpm: p.bpm,
            });
        }
    }
    result
}

struct WorkoutTemplate {
    id: Uuid,
    order: i32,
    name: String,
    total_duration_minutes: i32,
    description: String,
    phases: Vec<WorkoutPhase>,
}

fn get_workout_templates() -> Vec<WorkoutTemplate> {
    vec![
        WorkoutTemplate {
            id: Uuid::now_v7(),
            order: 1,
            name: "Recovery".to_string(),
            total_duration_minutes: 20,
            description: "Light recovery run with low cadence".to_string(),
            phases: vec![
                WorkoutPhase {
                    name: "Warmup".to_string(),
                    duration_seconds: m(5),
                    bpm: 160,
                },
                WorkoutPhase {
                    name: "Easy".to_string(),
                    duration_seconds: m(10),
                    bpm: 168,
                },
                WorkoutPhase {
                    name: "Cooldown".to_string(),
                    duration_seconds: m(5),
                    bpm: 156,
                },
            ],
        },
        WorkoutTemplate {
            id: Uuid::now_v7(),
            order: 2,
            name: "Easy Run (short)".to_string(),
            total_duration_minutes: 30,
            description: "Short easy-paced run".to_string(),
            phases: vec![
                WorkoutPhase {
                    name: "Warmup".to_string(),
                    duration_seconds: m(6),
                    bpm: 162,
                },
                WorkoutPhase {
                    name: "Easy".to_string(),
                    duration_seconds: m(20),
                    bpm: 170,
                },
                WorkoutPhase {
                    name: "Cooldown".to_string(),
                    duration_seconds: m(4),
                    bpm: 156,
                },
            ],
        },
        WorkoutTemplate {
            id: Uuid::now_v7(),
            order: 3,
            name: "Aerobic Steady".to_string(),
            total_duration_minutes: 40,
            description: "Sustained aerobic effort at steady cadence".to_string(),
            phases: vec![
                WorkoutPhase {
                    name: "Warmup".to_string(),
                    duration_seconds: m(8),
                    bpm: 162,
                },
                WorkoutPhase {
                    name: "Steady".to_string(),
                    duration_seconds: m(28),
                    bpm: 174,
                },
                WorkoutPhase {
                    name: "Cooldown".to_string(),
                    duration_seconds: m(4),
                    bpm: 156,
                },
            ],
        },
        WorkoutTemplate {
            id: Uuid::now_v7(),
            order: 4,
            name: "Long Easy".to_string(),
            total_duration_minutes: 60,
            description: "Long easy run for building endurance".to_string(),
            phases: vec![
                WorkoutPhase {
                    name: "Warmup".to_string(),
                    duration_seconds: m(8),
                    bpm: 162,
                },
                WorkoutPhase {
                    name: "Easy".to_string(),
                    duration_seconds: m(46),
                    bpm: 170,
                },
                WorkoutPhase {
                    name: "Cooldown".to_string(),
                    duration_seconds: m(6),
                    bpm: 156,
                },
            ],
        },
        WorkoutTemplate {
            id: Uuid::now_v7(),
            order: 5,
            name: "Tempo Blocks".to_string(),
            total_duration_minutes: 42,
            description: "3 × 6-min tempo blocks with 2-min easy recovery".to_string(),
            phases: {
                let mut phases = vec![WorkoutPhase {
                    name: "Warmup".to_string(),
                    duration_seconds: m(12),
                    bpm: 162,
                }];
                phases.extend(repeat(
                    3,
                    vec![
                        WorkoutPhase {
                            name: "Tempo".to_string(),
                            duration_seconds: m(6),
                            bpm: 180,
                        },
                        WorkoutPhase {
                            name: "Easy".to_string(),
                            duration_seconds: m(2),
                            bpm: 168,
                        },
                    ],
                ));
                phases.push(WorkoutPhase {
                    name: "Cooldown".to_string(),
                    duration_seconds: m(8),
                    bpm: 156,
                });
                phases
            },
        },
        WorkoutTemplate {
            id: Uuid::now_v7(),
            order: 6,
            name: "1:00 Intervals".to_string(),
            total_duration_minutes: 38,
            description: "10 × 1-min hard with 1-min easy recovery".to_string(),
            phases: {
                let mut phases = vec![WorkoutPhase {
                    name: "Warmup".to_string(),
                    duration_seconds: m(12),
                    bpm: 162,
                }];
                phases.extend(repeat(
                    10,
                    vec![
                        WorkoutPhase {
                            name: "Hard".to_string(),
                            duration_seconds: m(1),
                            bpm: 186,
                        },
                        WorkoutPhase {
                            name: "Easy".to_string(),
                            duration_seconds: m(1),
                            bpm: 168,
                        },
                    ],
                ));
                phases.push(WorkoutPhase {
                    name: "Cooldown".to_string(),
                    duration_seconds: m(6),
                    bpm: 156,
                });
                phases
            },
        },
        WorkoutTemplate {
            id: Uuid::now_v7(),
            order: 7,
            name: "Hill Simulation".to_string(),
            total_duration_minutes: 44,
            description: "8 × 1:30 uphill simulation with downhill recovery".to_string(),
            phases: {
                let mut phases = vec![WorkoutPhase {
                    name: "Warmup".to_string(),
                    duration_seconds: m(12),
                    bpm: 162,
                }];
                phases.extend(repeat(
                    8,
                    vec![
                        WorkoutPhase {
                            name: "Up".to_string(),
                            duration_seconds: s(90),
                            bpm: 184,
                        },
                        WorkoutPhase {
                            name: "Down".to_string(),
                            duration_seconds: s(90),
                            bpm: 168,
                        },
                    ],
                ));
                phases.push(WorkoutPhase {
                    name: "Cooldown".to_string(),
                    duration_seconds: m(8),
                    bpm: 156,
                });
                phases
            },
        },
        WorkoutTemplate {
            id: Uuid::now_v7(),
            order: 8,
            name: "Strides".to_string(),
            total_duration_minutes: 30,
            description: "8 × 20-sec fast strides with 70-sec easy recovery".to_string(),
            phases: {
                let mut phases = vec![WorkoutPhase {
                    name: "Warmup".to_string(),
                    duration_seconds: m(12),
                    bpm: 162,
                }];
                phases.extend(repeat(
                    8,
                    vec![
                        WorkoutPhase {
                            name: "Fast".to_string(),
                            duration_seconds: s(20),
                            bpm: 190,
                        },
                        WorkoutPhase {
                            name: "Easy".to_string(),
                            duration_seconds: s(70),
                            bpm: 168,
                        },
                    ],
                ));
                phases.push(WorkoutPhase {
                    name: "Cooldown".to_string(),
                    duration_seconds: m(6),
                    bpm: 156,
                });
                phases
            },
        },
    ]
}

#[tokio::main]
async fn main() -> std::io::Result<()> {
    dotenv::dotenv().ok();
    tracing_subscriber::fmt::init();

    let database_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set");

    info!("Connecting to database: {}", database_url);

    let pool = PgPoolOptions::new()
        .max_connections(5)
        .connect(&database_url)
        .await
        .expect("Failed to connect to database");

    info!("Database connection established");

    let templates = get_workout_templates();

    for template in templates {
        let phases_json = serde_json::to_value(&template.phases).unwrap();

        let result = sqlx::query(
            r#"
            INSERT INTO workouts (id, name, total_duration_minutes, description, phases, "order")
            VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT (id) DO UPDATE SET
                name = EXCLUDED.name,
                total_duration_minutes = EXCLUDED.total_duration_minutes,
                description = EXCLUDED.description,
                phases = EXCLUDED.phases,
                "order" = EXCLUDED."order",
                updated_at = NOW()
            "#,
        )
        .bind(template.id)
        .bind(&template.name)
        .bind(template.total_duration_minutes)
        .bind(&template.description)
        .bind(phases_json)
        .bind(template.order)
        .execute(&pool)
        .await;

        match result {
            Ok(_) => info!("Seeded workout: {}", template.name),
            Err(e) => error!("Failed to seed workout {}: {}", template.name, e),
        }
    }

    info!("Seeding completed!");
    Ok(())
}
