import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env from .env.local
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; // Service role
const supabase = createClient(supabaseUrl, supabaseKey);

const skills = [
  // Programming Languages
  { skill_name: 'JavaScript', category: 'Language' },
  { skill_name: 'TypeScript', category: 'Language' },
  { skill_name: 'Python', category: 'Language' },
  { skill_name: 'Java', category: 'Language' },
  { skill_name: 'C++', category: 'Language' },
  { skill_name: 'Go', category: 'Language' },
  { skill_name: 'Rust', category: 'Language' },
  { skill_name: 'Swift', category: 'Language' },
  { skill_name: 'Kotlin', category: 'Language' },
  { skill_name: 'PHP', category: 'Language' },
  { skill_name: 'C#', category: 'Language' },
  { skill_name: 'Ruby', category: 'Language' },
  
  // Frontend
  { skill_name: 'React', category: 'Frontend' },
  { skill_name: 'Next.js', category: 'Frontend' },
  { skill_name: 'Vue.js', category: 'Frontend' },
  { skill_name: 'Angular', category: 'Frontend' },
  { skill_name: 'Tailwind CSS', category: 'Frontend' },
  { skill_name: 'Redux', category: 'Frontend' },
  { skill_name: 'Svelte', category: 'Frontend' },
  { skill_name: 'Three.js', category: 'Frontend' },
  { skill_name: 'HTML5/CSS3', category: 'Frontend' },
  
  // Backend
  { skill_name: 'Node.js', category: 'Backend' },
  { skill_name: 'Express', category: 'Backend' },
  { skill_name: 'Django', category: 'Backend' },
  { skill_name: 'Flask', category: 'Backend' },
  { skill_name: 'Spring Boot', category: 'Backend' },
  { skill_name: 'FastAPI', category: 'Backend' },
  { skill_name: 'GraphQL', category: 'Backend' },
  { skill_name: 'NestJS', category: 'Backend' },
  
  // Cloud & DevOps
  { skill_name: 'AWS', category: 'Cloud' },
  { skill_name: 'Google Cloud Platform', category: 'Cloud' },
  { skill_name: 'Azure', category: 'Cloud' },
  { skill_name: 'Docker', category: 'DevOps' },
  { skill_name: 'Kubernetes', category: 'DevOps' },
  { skill_name: 'Terraform', category: 'DevOps' },
  { skill_name: 'CI/CD Pipelines', category: 'DevOps' },
  { skill_name: 'Jenkins', category: 'DevOps' },
  
  // Database
  { skill_name: 'PostgreSQL', category: 'Database' },
  { skill_name: 'MongoDB', category: 'Database' },
  { skill_name: 'Redis', category: 'Database' },
  { skill_name: 'MySQL', category: 'Database' },
  { skill_name: 'Supabase', category: 'Database' },
  { skill_name: 'Firebase', category: 'Database' },
  { skill_name: 'Prisma ORM', category: 'Database' },
  
  // AI & Data
  { skill_name: 'Machine Learning', category: 'AI' },
  { skill_name: 'PyTorch', category: 'AI' },
  { skill_name: 'TensorFlow', category: 'AI' },
  { skill_name: 'Natural Language Processing', category: 'AI' },
  { skill_name: 'Computer Vision', category: 'AI' },
  { skill_name: 'Data Science', category: 'Data' },
  { skill_name: 'LangChain', category: 'AI' },
  
  // Mobile & Cross Platform
  { skill_name: 'React Native', category: 'Mobile' },
  { skill_name: 'Flutter', category: 'Mobile' },
  
  // Professional Tools
  { skill_name: 'Git', category: 'Tool' },
  { skill_name: 'Figma', category: 'Design' },
  { skill_name: 'Jira', category: 'Agile' },
  { skill_name: 'Testing (Jest/Vitest)', category: 'Testing' }
];

async function seed() {
  console.log('🚀 Seeding skills table with 50+ tech competencies...');
  
  const { data, error } = await supabase
    .from('skill')
    .upsert(skills, { onConflict: 'skill_name' });

  if (error) {
    console.error('❌ Seeding failed:', error);
  } else {
    console.log('✅ Skills seeded successfully! (Count: ' + skills.length + ')');
  }
}

seed();
