-- Enable RLS on all tables if not already
ALTER TABLE student ENABLE ROW LEVEL SECURITY;
ALTER TABLE company ENABLE ROW LEVEL SECURITY;
ALTER TABLE application ENABLE ROW LEVEL SECURITY;
ALTER TABLE internship ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin ENABLE ROW LEVEL SECURITY;

-- Drop any existing unsafe policies on application
DROP POLICY IF EXISTS "Public application read" ON application;
DROP POLICY IF EXISTS "anyone_can_read_applications" ON application;
DROP POLICY IF EXISTS "student_can_read_own_applications" ON application;

-- 1. Student can only read their own applications
CREATE POLICY "student_can_read_own_applications"
ON application FOR SELECT
USING (auth.uid() = student_id);

-- 2. Student can only insert their own applications
CREATE POLICY "student_can_insert_own_applications"
ON application FOR INSERT
WITH CHECK (auth.uid() = student_id);

-- 3. Student can basically update only their own applications (if needed)
CREATE POLICY "student_can_update_own_applications"
ON application FOR UPDATE
USING (auth.uid() = student_id);

-- 4. Delete own applications
CREATE POLICY "student_can_delete_own_applications"
ON application FOR DELETE
USING (auth.uid() = student_id);

-- NOTE: Admins and Companies use supabaseAdmin (service_role keys), which 
-- bypasses RLS completely. So we don't need explicit policies for them.

-- Also ensure 'internship' table can be read by everyone (since students browse them)
DROP POLICY IF EXISTS "Public internship read" ON internship;
CREATE POLICY "Public internship read"
ON internship FOR SELECT
USING (true);
