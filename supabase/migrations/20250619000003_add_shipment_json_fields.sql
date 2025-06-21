-- Add missing JSON fields to shipments table for storing products, containers, and config
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS products JSONB DEFAULT '[]'::jsonb;
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS containers JSONB DEFAULT '[]'::jsonb;
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS config JSONB DEFAULT '{}'::jsonb;
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS description TEXT;

-- Add indexes for better performance on JSON fields
CREATE INDEX IF NOT EXISTS idx_shipments_products ON shipments USING GIN (products);
CREATE INDEX IF NOT EXISTS idx_shipments_containers ON shipments USING GIN (containers);