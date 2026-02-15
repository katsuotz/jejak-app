-- Create workouts table
CREATE TABLE IF NOT EXISTS workouts (
    id UUID PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    total_duration_minutes INTEGER NOT NULL,
    description TEXT NOT NULL,
    phases JSONB NOT NULL DEFAULT '[]',
    "order" INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_workouts_id ON workouts(id);
CREATE INDEX IF NOT EXISTS idx_workouts_order ON workouts("order");
