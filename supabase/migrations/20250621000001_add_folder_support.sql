-- Add folder support to user_settings table

-- Add folders and shipment_folders columns to user_settings
ALTER TABLE user_settings 
ADD COLUMN folders JSONB DEFAULT '[]',
ADD COLUMN shipment_folders JSONB DEFAULT '{}';

-- Add comments for documentation
COMMENT ON COLUMN user_settings.folders IS 'Array of folder objects with id and name fields';
COMMENT ON COLUMN user_settings.shipment_folders IS 'Object mapping shipment IDs to folder IDs';

-- Initialize existing users with default folders
UPDATE user_settings 
SET folders = '[
  {"id": "1", "name": "Q1 2024"},
  {"id": "2", "name": "Electronics"},
  {"id": "3", "name": "Archived"}
]'
WHERE folders = '[]';