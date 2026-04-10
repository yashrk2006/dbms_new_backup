import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const { Client } = pg;
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ Missing DATABASE_URL in .env.local');
  process.exit(1);
}

const client = new Client({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const ROLES = [
  { 
    title: 'Cloud Infrastructure Architect', 
    description: 'Design and optimize scalable cloud architectures using modern DevOps practices and serverless frameworks.',
    duration: '6 Months',
    stipend: '₹45,000/mo',
    location: 'Remote / Bengaluru',
    skills: ['AWS', 'Docker', 'Kubernetes', 'Cloud Computing']
  },
  { 
    title: 'Full Stack Neural Engineer', 
    description: 'Build high-performance web applications with real-time data streaming and AI-integrated components.',
    duration: '3 Months',
    stipend: '₹35,000/mo',
    location: 'Hybrid / Mumbai',
    skills: ['React', 'Next.js', 'Node.js', 'PostgreSQL']
  },
  { 
    title: 'Cybersecurity Analyst', 
    description: 'Implement robust security protocols and conduct vulnerability assessments for enterprise-grade applications.',
    duration: '6 Months',
    stipend: '₹40,000/mo',
    location: 'In-office / Hyderabad',
    skills: ['Cybersecurity', 'Network Security', 'Python']
  },
  { 
    title: 'AI/ML Research Intern', 
    description: 'Develop and train Large Language Models for specialized industrial applications and recruitment intelligence.',
    duration: '4 Months',
    stipend: '₹50,000/mo',
    location: 'Remote',
    skills: ['Python', 'Machine Learning', 'Data Analysis']
  },
  { 
    title: 'Frontend Experience Designer', 
    description: 'Craft industry-leading user interfaces with a focus on glassmorphism, GSAP animations, and micro-interactions.',
    duration: '3 Months',
    stipend: '₹30,000/mo',
    location: 'Hybrid / Pune',
    skills: ['React', 'Tailwind CSS', 'UI/UX Design']
  }
];

async function seed() {
  console.log('🚀 Activating Neural Provisions Engine (SQL Mode)...');
  
  try {
    await client.connect();

    // 1. Fetch Companies
    const compRes = await client.query('SELECT company_id, company_name FROM company');
    const companies = compRes.rows;
    console.log(`📡 Found ${companies.length} corporate nodes.`);

    // 2. Fetch Skills
    const skillRes = await client.query('SELECT skill_id, skill_name FROM skill');
    const skills = skillRes.rows;
    console.log(`🧠 Loaded ${skills.length} skills from intelligence bank.`);

    await client.query('TRUNCATE internship CASCADE');
    console.log('🧹 Purged legacy internship grid.');

    let totalProvisioned = 0;

    for (const company of companies) {
      const internshipCount = Math.floor(Math.random() * 2) + 1;
      
      for (let i = 0; i < internshipCount; i++) {
        const role = ROLES[Math.floor(Math.random() * ROLES.length)];
        
        const insRes = await client.query(
          `INSERT INTO internship (company_id, title, description, duration, stipend, location) 
           VALUES ($1, $2, $3, $4, $5, $6) 
           RETURNING internship_id`,
          [company.company_id, role.title, role.description, role.duration, role.stipend, role.location]
        );
        
        const internshipId = insRes.rows[0].internship_id;
        totalProvisioned++;

        // Add Requirements
        for (const skillName of role.skills) {
          const skill = skills.find(s => s.skill_name.toLowerCase() === skillName.toLowerCase());
          if (skill) {
            await client.query(
              'INSERT INTO internship_skill (internship_id, skill_id) VALUES ($1, $2)',
              [internshipId, skill.skill_id]
            );
          }
        }
      }
      console.log(`   ✅ Provisioned: ${company.company_name}`);
    }

    console.log(`\n✨ Neural Ecosystem Populated! Total Internships: ${totalProvisioned}`);
  } catch (err) {
    console.error('💥 Seeding failure:', err.message);
  } finally {
    await client.end();
  }
}

seed();
