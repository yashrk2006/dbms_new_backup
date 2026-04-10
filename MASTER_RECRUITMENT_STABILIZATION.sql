-- ============================================================
-- SkillSync — Master Recruitment Stabilization Schema Update
-- 
-- 1. Student Persistence: Adds AI Resume Analysis support
-- 2. Internship Expansion: Adds rich job details for better matching
-- 3. Neural Library: Seeds 50+ technical and soft skills
-- ============================================================

-- 1. ENHANCE STUDENT TABLE
ALTER TABLE student 
ADD COLUMN IF NOT EXISTS ai_resume_analysis JSONB,
ADD COLUMN IF NOT EXISTS ai_match_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS ai_match_last_updated TIMESTAMP WITH TIME ZONE;

COMMENT ON COLUMN student.ai_resume_analysis IS 'Stores extracted skills, ATS score, and suggestions from AI resume parsing.';

-- 2. ENHANCE INTERNSHIP TABLE
ALTER TABLE internship 
ADD COLUMN IF NOT EXISTS internship_type VARCHAR(50) DEFAULT 'Remote',
ADD COLUMN IF NOT EXISTS start_date DATE,
ADD COLUMN IF NOT EXISTS openings INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS perks TEXT,
ADD COLUMN IF NOT EXISTS deadline DATE;

COMMENT ON COLUMN internship.internship_type IS 'Type: Remote, On-site, or Hybrid';
COMMENT ON COLUMN internship.openings IS 'Number of positions available';
COMMENT ON COLUMN internship.deadline IS 'Application deadline';

-- 3. SEED 50+ NEURAL SKILLS (Unified Library)
-- We use categories for high-fidelity filtering in the UI.
INSERT INTO skill (skill_name, category) VALUES
  -- Programming Languages
  ('Python', 'Programming'), ('JavaScript', 'Programming'), ('TypeScript', 'Programming'), 
  ('Java', 'Programming'), ('C++', 'Programming'), ('Go', 'Programming'), 
  ('Rust', 'Programming'), ('Swift', 'Programming'), ('Kotlin', 'Programming'),
  
  -- Frontend Foundations
  ('React', 'Frontend'), ('Next.js', 'Frontend'), ('Vue.js', 'Frontend'), 
  ('Tailwind CSS', 'Frontend'), ('Svelte', 'Frontend'), ('Three.js', 'Frontend'),
  
  -- Backend & Architecture
  ('Node.js', 'Backend'), ('Express.js', 'Backend'), ('Django', 'Backend'), 
  ('Spring Boot', 'Backend'), ('GraphQL', 'Backend'), ('REST API', 'Backend'),
  
  -- Database & Storage
  ('PostgreSQL', 'Database'), ('SQL', 'Database'), ('MongoDB', 'Database'), 
  ('Redis', 'Database'), ('Firebase', 'Database'), ('Prisma', 'Database'),
  
  -- AI / ML / Data Science
  ('Machine Learning', 'AI/ML'), ('Deep Learning', 'AI/ML'), ('PyTorch', 'AI/ML'), 
  ('TensorFlow', 'AI/ML'), ('Natural Language Processing', 'AI/ML'), ('LLMs', 'AI/ML'),
  ('Data Visualization', 'Analytics'), ('Excel', 'Analytics'), ('PowerBI', 'Analytics'),
  
  -- Cloud & DevOps
  ('AWS', 'Cloud'), ('Azure', 'Cloud'), ('Google Cloud', 'Cloud'), 
  ('Docker', 'DevOps'), ('Kubernetes', 'DevOps'), ('CI/CD', 'DevOps'), 
  ('Terraform', 'DevOps'), ('GitHub Actions', 'DevOps'),
  
  -- Design & Product
  ('Figma', 'Design'), ('Adobe XD', 'Design'), ('UI/UX Design', 'Design'), 
  ('Product Management', 'Product'), ('Agile/Scrum', 'Product'),
  
  -- Mobile Development
  ('Flutter', 'Mobile'), ('React Native', 'Mobile'), ('Android (Java/Kotlin)', 'Mobile'), 
  ('iOS (Swift)', 'Mobile'),
  
  -- Soft Skills & Professional
  ('Communication', 'Professional'), ('Leadership', 'Professional'), 
  ('Problem Solving', 'Professional'), ('Public Speaking', 'Professional'),
  ('Teamwork', 'Professional'), ('Strategic Thinking', 'Professional')

ON CONFLICT (skill_name) DO UPDATE SET category = EXCLUDED.category;

-- 4. REFRESH SCHEMA CACHE
NOTIFY pgrst, 'reload schema';
