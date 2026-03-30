-- Add extra columns to the internship table for more detailed postings
ALTER TABLE internship 
ADD COLUMN IF NOT EXISTS internship_type VARCHAR(50) DEFAULT 'Remote',
ADD COLUMN IF NOT EXISTS start_date DATE,
ADD COLUMN IF NOT EXISTS openings INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS perks TEXT,
ADD COLUMN IF NOT EXISTS deadline DATE;

-- Update existing records if needed (optional)
UPDATE internship SET internship_type = 'Remote' WHERE internship_type IS NULL;
UPDATE internship SET openings = 1 WHERE openings IS NULL;

-- Comment for Clarity
COMMENT ON COLUMN internship.internship_type IS 'Type of internship: Remote, On-site, or Hybrid';
COMMENT ON COLUMN internship.start_date IS 'Expected start date of the internship';
COMMENT ON COLUMN internship.openings IS 'Number of positions available';
COMMENT ON COLUMN internship.perks IS 'Additional benefits (comma-separated or text)';
COMMENT ON COLUMN internship.deadline IS 'Application deadline';
