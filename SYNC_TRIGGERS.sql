-- ============================================================
-- Sync Trigger: Automatically links Auth Users to Profiles
-- Deployment terminal: https://supabase.com/dashboard/project/cwtyqajzdlfzybnzjpma/sql/new
-- ============================================================

-- 1. Create the handler function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  IF (new.raw_user_meta_data->>'role' = 'company') THEN
    INSERT INTO public.company (company_id, company_name, email, industry, location)
    VALUES (
      new.id,
      COALESCE(new.raw_user_meta_data->>'full_name', 'Unnamed Company'),
      new.email,
      'Technology',
      'Remote'
    );
  ELSE
    -- Default to Student profile
    INSERT INTO public.student (student_id, name, email, college, branch, graduation_year)
    VALUES (
      new.id,
      COALESCE(new.raw_user_meta_data->>'full_name', 'Student User'),
      new.email,
      'Global Institute of Technology',
      'Computer Science',
      EXTRACT(YEAR FROM CURRENT_DATE)::INT + 2
    );
  END IF;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Create the trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Ensure permissions are set
GRANT ALL ON FUNCTION public.handle_new_user() TO postgres, service_role;
