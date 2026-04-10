-- ============================================================
-- SkillSync — Notification Infrastructure
-- ============================================================

CREATE TABLE IF NOT EXISTS notifications (
    notification_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL, -- References auth.users(id) or student_id/company_id
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'system', -- 'system', 'application', 'interview'
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS (Optional but recommended)
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can see their own notifications" 
ON notifications FOR SELECT 
USING (auth.uid() = user_id);

COMMENT ON TABLE notifications IS 'Tracks real-time alerts and intelligence logs for all platform roles.';
