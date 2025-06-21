-- Update saved_containers table to match the application schema

-- Add missing columns
ALTER TABLE saved_containers 
ADD COLUMN IF NOT EXISTS shipping_cost DECIMAL(12,2) DEFAULT 0 CHECK (shipping_cost >= 0),
ADD COLUMN IF NOT EXISTS shipping_duration INTEGER DEFAULT 30 CHECK (shipping_duration > 0),
ADD COLUMN IF NOT EXISTS tags JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL;

-- Rename weight_limit to max_weight to match application code
ALTER TABLE saved_containers 
RENAME COLUMN weight_limit TO max_weight;

-- Create trigger for updated_at if it doesn't exist
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER handle_saved_containers_updated_at
    BEFORE UPDATE ON saved_containers
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

-- Create additional indexes for performance
CREATE INDEX IF NOT EXISTS idx_saved_containers_name ON saved_containers(name);
CREATE INDEX IF NOT EXISTS idx_saved_containers_created_at ON saved_containers(created_at);