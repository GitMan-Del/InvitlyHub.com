-- Add short_code column to invitations table if it doesn't exist
ALTER TABLE invitations ADD COLUMN IF NOT EXISTS short_code TEXT;

-- Create index for faster lookups by short code
CREATE INDEX IF NOT EXISTS invitations_short_code_idx ON invitations(short_code);

-- Update existing invitations with short codes
-- This is a placeholder - in a real implementation, you'd want to generate unique codes
-- and update each invitation individually
