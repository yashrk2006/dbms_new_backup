-- ============================================================
-- Neural Schema Consolidation: Legacy DECOMMISSIONING
-- SkillSync Deployment terminal: https://supabase.com/dashboard/project/cwtyqajzdlfzybnzjpma/sql/new
-- Run this script to purge the 'Shadow Tables' and unify the visualizer.
-- ============================================================

-- 1. DROP PLURAL/SHADOW TABLES (REDUNDANT)
DROP TABLE IF EXISTS public.applications CASCADE;
DROP TABLE IF EXISTS public.companies CASCADE;
DROP TABLE IF EXISTS public.internships CASCADE;
DROP TABLE IF EXISTS public.students CASCADE;
DROP TABLE IF EXISTS public.skills CASCADE;
DROP TABLE IF EXISTS public.student_skills CASCADE;
DROP TABLE IF EXISTS public.internship_skills CASCADE;

-- 2. ENSURE SINGULAR TABLES HAVE CORRECT RLS & PERMISSIONS
-- (Already handled by APPLY_THIS_SQL.sql, but this reinforces the modern schema)
GRANT ALL ON TABLE public.admin TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.student TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.company TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.skill TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.student_skill TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.internship TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.application TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.internship_requirements TO anon, authenticated, service_role;

NOTIFY pgrst, 'reload schema';
