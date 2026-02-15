-- Create workouts table
CREATE TABLE IF NOT EXISTS workouts (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    total_duration_minutes INTEGER NOT NULL,
    description TEXT NOT NULL,
    phases JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_workouts_id ON workouts(id);
