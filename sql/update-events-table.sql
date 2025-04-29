-- Add unique_code column to events table if it doesn't exist
ALTER TABLE events ADD COLUMN IF NOT EXISTS unique_code TEXT;

-- Create index for faster lookups by unique code
CREATE INDEX IF NOT EXISTS events_unique_code_idx ON events(unique_code);
