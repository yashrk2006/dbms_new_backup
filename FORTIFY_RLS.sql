-- ============================================================
-- SkillSync — Row-Level Security Fortification (Master Reset)
-- ============================================================

-- 1. FORCE ENABLE RLS ON ALL CORE TABLES
ALTER TABLE public.student ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.internship ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_skill ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.internship_requirements ENABLE ROW LEVEL SECURITY;

-- 2. PURGE ALL EXISTING POLICIES (Full Reset)
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public."' || r.tablename || '"';
    END LOOP;
END $$;

-- 3. ESTABLISH "NO-READ" DEFAULT (Explicit Denial of Anon Access)
-- This ensures that if no policy is matched, access is denied. 
-- Supplying explicit denial policies for 'anon' role.

CREATE POLICY "anon_denial_student" ON public.student FOR SELECT TO anon USING (false);
CREATE POLICY "anon_denial_company" ON public.company FOR SELECT TO anon USING (false);
CREATE POLICY "anon_denial_application" ON public.application FOR SELECT TO anon USING (false);

-- 4. PROVISION AUTHENTICATED ACCESS (Recruitment Intelligence Lifecycle)

-- [STUDENT] Students can only see their own profile.
CREATE POLICY "student_select_own" ON public.student
    FOR SELECT TO authenticated 
    USING (auth.uid() = student_id);

-- [COMPANY] Any authenticated user can see active company names (for job listings).
CREATE POLICY "company_select_all" ON public.company
    FOR SELECT TO authenticated 
    USING (true);

-- [APPLICATION] Students can only see their own applications.
CREATE POLICY "application_select_own" ON public.application
    FOR SELECT TO authenticated 
    USING (auth.uid() = student_id);

-- [INTERNSHIP] Public-facing listings for authenticated users.
CREATE POLICY "internship_select_all" ON public.internship
    FOR SELECT TO authenticated 
    USING (true);

-- [SKILL] Skill library is public-scale for all students.
CREATE POLICY "skill_select_all" ON public.skill
    FOR SELECT TO authenticated 
    USING (true);

-- 5. RELOAD SCHEMA CACHE
NOTIFY pgrst, 'reload schema';
