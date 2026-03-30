-- Final Migration: Add AI Matching & Persistence Columns
-- This ensures that Match Scores and Interview Guides are correctly saved
-- at the moment of application, rather than recalculated on the fly.

ALTER TABLE application 
ADD COLUMN IF NOT EXISTS ai_match_score INTEGER,
ADD COLUMN IF NOT EXISTS ai_interview_questions JSONB;

-- Comment for Clarity
COMMENT ON COLUMN application.ai_match_score IS 'AI-calculated match score at the time of student application.';
COMMENT ON COLUMN application.ai_interview_questions IS 'AI-generated interview assessment guide for recruiters.';
