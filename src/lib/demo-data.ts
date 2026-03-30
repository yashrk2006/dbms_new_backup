export const DEMO_STUDENT = {
  id: '00000000-0000-0000-0000-000000000000',
  name: 'Arjun Sharma',
  email: 'arjun@iitd.ac.in',
  college: 'IIT Delhi',
  branch: 'Computer Science',
  graduation_year: 2025
};

export const DEMO_SKILLS = [
  { skill_id: 1,  skill_name: 'Python',       category: 'Programming' },
  { skill_id: 2,  skill_name: 'React',         category: 'Frontend'    },
  { skill_id: 3,  skill_name: 'SQL',           category: 'Database'    },
  { skill_id: 4,  skill_name: 'Node.js',       category: 'Backend'     },
  { skill_id: 5,  skill_name: 'TypeScript',    category: 'Programming' },
  { skill_id: 6,  skill_name: 'Docker',        category: 'DevOps'      },
  { skill_id: 7,  skill_name: 'AWS',           category: 'Cloud'       },
  { skill_id: 8,  skill_name: 'Tailwind CSS',  category: 'Frontend'    },
  { skill_id: 9,  skill_name: 'Machine Learning', category: 'AI/ML'   },
  { skill_id: 10, skill_name: 'REST APIs',     category: 'Backend'     },
  { skill_id: 11, skill_name: 'Next.js',       category: 'Frontend'    },
  { skill_id: 12, skill_name: 'PostgreSQL',    category: 'Database'    },
  { skill_id: 13, skill_name: 'Git',           category: 'DevOps'      },
  { skill_id: 14, skill_name: 'Kubernetes',    category: 'DevOps'      },
  { skill_id: 15, skill_name: 'TensorFlow',    category: 'AI/ML'       },
];

export const DEMO_STUDENT_SKILLS = [
  { skill_id: 1,  proficiency_level: 'Advanced',      skill: { skill_id: 1,  skill_name: 'Python',      category: 'Programming' } },
  { skill_id: 2,  proficiency_level: 'Intermediate',  skill: { skill_id: 2,  skill_name: 'React',        category: 'Frontend'    } },
  { skill_id: 3,  proficiency_level: 'Advanced',      skill: { skill_id: 3,  skill_name: 'SQL',          category: 'Database'    } },
  { skill_id: 10, proficiency_level: 'Intermediate',  skill: { skill_id: 10, skill_name: 'REST APIs',    category: 'Backend'     } },
  { skill_id: 13, proficiency_level: 'Beginner',      skill: { skill_id: 13, skill_name: 'Git',          category: 'DevOps'      } },
];

export const DEMO_INTERNSHIPS = [
  {
    internship_id: 1,
    title: 'Frontend Developer Intern',
    description: 'Build modern user interfaces using React, Next.js, and Tailwind CSS for our consumer product team.',
    duration: '6 Months',
    stipend: '₹30,000/month',
    location: 'Remote',
    company: { company_name: 'InnovateTech Solutions' },
    required_skills: [
      { skill_id: 2,  skill_name: 'React'        },
      { skill_id: 8,  skill_name: 'Tailwind CSS' },
      { skill_id: 11, skill_name: 'Next.js'      },
    ]
  },
  {
    internship_id: 2,
    title: 'Backend System Engineer',
    description: 'Design and build scalable REST APIs with Node.js and PostgreSQL for high-traffic financial platforms.',
    duration: '3 Months',
    stipend: '₹45,000/month',
    location: 'Bengaluru, India',
    company: { company_name: 'DataFlow Systems' },
    required_skills: [
      { skill_id: 3,  skill_name: 'SQL'         },
      { skill_id: 4,  skill_name: 'Node.js'     },
      { skill_id: 10, skill_name: 'REST APIs'   },
      { skill_id: 12, skill_name: 'PostgreSQL'  },
    ]
  },
  {
    internship_id: 3,
    title: 'Full Stack Developer',
    description: 'Work across the entire stack from pixel-perfect UI to optimized database queries in an agile team.',
    duration: '4 Months',
    stipend: '₹40,000/month',
    location: 'Mumbai, India',
    company: { company_name: 'FutureWare Technologies' },
    required_skills: [
      { skill_id: 2,  skill_name: 'React'    },
      { skill_id: 4,  skill_name: 'Node.js'  },
      { skill_id: 3,  skill_name: 'SQL'      },
      { skill_id: 10, skill_name: 'REST APIs'},
    ]
  },
  {
    internship_id: 4,
    title: 'ML Research Intern',
    description: 'Work on cutting-edge NLP and computer vision models with India\'s leading AI research lab.',
    duration: '6 Months',
    stipend: '₹55,000/month',
    location: 'Hyderabad, India',
    company: { company_name: 'CogniSpark AI' },
    required_skills: [
      { skill_id: 1,  skill_name: 'Python'         },
      { skill_id: 9,  skill_name: 'Machine Learning'},
      { skill_id: 15, skill_name: 'TensorFlow'      },
    ]
  },
  {
    internship_id: 5,
    title: 'DevOps & Cloud Intern',
    description: 'Manage CI/CD pipelines, containerize workloads, and automate cloud infrastructure on AWS.',
    duration: '6 Months',
    stipend: '₹35,000/month',
    location: 'Pune, India',
    company: { company_name: 'InfraEdge Technologies' },
    required_skills: [
      { skill_id: 6,  skill_name: 'Docker'     },
      { skill_id: 7,  skill_name: 'AWS'        },
      { skill_id: 14, skill_name: 'Kubernetes' },
      { skill_id: 13, skill_name: 'Git'        },
    ]
  },
];

export const DEMO_APPLICATIONS = [
  {
    application_id: 1,
    applied_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'Interviewing',
    internship: {
      title: 'Frontend Developer Intern',
      duration: '6 Months',
      stipend: '₹30,000/month',
      location: 'Remote',
      company: { company_name: 'InnovateTech Solutions' }
    }
  },
  {
    application_id: 2,
    applied_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'Under Review',
    internship: {
      title: 'Full Stack Developer',
      duration: '4 Months',
      stipend: '₹40,000/month',
      location: 'Mumbai, India',
      company: { company_name: 'FutureWare Technologies' }
    }
  },
  {
    application_id: 3,
    applied_date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'Accepted',
    internship: {
      title: 'Backend System Engineer',
      duration: '3 Months',
      stipend: '₹45,000/month',
      location: 'Bengaluru, India',
      company: { company_name: 'DataFlow Systems' }
    }
  }
];

export const DEMO_ADMIN_STATS = {
  students: 1240,
  companies: 85,
  internships: 312,
  applications: 4850
};

// --- NEW: AI Simulation Engine Data ---
export const AI_RESUME_TIPS: Record<string, string[]> = {
  'Frontend Developer': [
    "Highlight your experience with 'Responsive Design' and 'React State Management'.",
    "Showcase a specific project where you optimized page load speeds by over 30%.",
    "Emphasize your proficiency in 'Tailwind CSS' and 'TypeScript' as these are highly valued."
  ],
  'Backend Engineer': [
    "Focus on your knowledge of 'RESTful API Design' and 'Database Normalization'.",
    "Mention any experience with 'Docker' or 'Kubernetes' for containerized deployments.",
    "Detail your work with 'Asynchronous Programming' and 'Message Queues'."
  ],
  'Data Analyst': [
    "Demonstrate your ability to use 'SQL' for complex data extraction and joins.",
    "Showcase your visualization skills using 'Tableau' or 'Power BI'.",
    "Highlight your experience with 'Python' libraries like 'Pandas' and 'NumPy'."
  ],
  'Default': [
    "Quantify your achievements with specific numbers and percentages.",
    "Tailor your profile to match the exact keywords in the internship description.",
    "Ensure your academic projects are clearly detailed with the technologies used."
  ]
};

export const AI_INTERVIEW_QUESTIONS: Record<string, string[]> = {
  'Python': [
    "Explain the difference between deep copy and shallow copy in Python.",
    "How do you handle memory management and garbage collection in your scripts?",
    "What are decorators and how have you used them to enhance function logic?"
  ],
  'React': [
    "Describe the 'Virtual DOM' and why it makes React faster than traditional manipulation.",
    "How do you decide between using 'Context API' vs 'Redux' for state management?",
    "Explain the lifecycle of a React component using 'Hooks'."
  ],
  'SQL': [
    "What is the difference between 'INNER JOIN' and 'LEFT OUTER JOIN'?",
    "How would you optimize a slow-running query that handles millions of rows?",
    "Explain 'ACID' properties and why they are critical for database transactions."
  ],
  'Default': [
    "Tell us about a complex technical challenge you faced and how you solved it.",
    "How do you stay updated with the latest trends in your tech stack?",
    "Describe your experience working in an Agile/Scrum development environment."
  ]
};

// Rich demo candidates for Company Applicants page
export const DEMO_CANDIDATES = [
  {
    application_id: 101, status: 'Pending',
    applied_date: new Date(Date.now() - 2 * 86400000).toISOString(),
    student: { name: 'Priya Nair', email: 'priya@bits.edu', college: 'BITS Pilani', branch: 'CSE', graduation_year: 2025 },
    internship: { title: 'Frontend Developer Intern', company_id: 'demo' }
  },
  {
    application_id: 102, status: 'Under Review',
    applied_date: new Date(Date.now() - 5 * 86400000).toISOString(),
    student: { name: 'Rahul Verma', email: 'rahul@iitb.ac.in', college: 'IIT Bombay', branch: 'IT', graduation_year: 2025 },
    internship: { title: 'Backend System Engineer', company_id: 'demo' }
  },
  {
    application_id: 103, status: 'Interviewing',
    applied_date: new Date(Date.now() - 8 * 86400000).toISOString(),
    student: { name: 'Sneha Kulkarni', email: 'sneha@nitk.edu', college: 'NITK Surathkal', branch: 'CSE', graduation_year: 2025 },
    internship: { title: 'Full Stack Developer', company_id: 'demo' }
  },
  {
    application_id: 104, status: 'Accepted',
    applied_date: new Date(Date.now() - 12 * 86400000).toISOString(),
    student: { name: 'Aryan Mehta', email: 'aryan@vit.edu', college: 'VIT Vellore', branch: 'ECE', graduation_year: 2026 },
    internship: { title: 'Frontend Developer Intern', company_id: 'demo' }
  },
  {
    application_id: 105, status: 'Rejected',
    applied_date: new Date(Date.now() - 15 * 86400000).toISOString(),
    student: { name: 'Diksha Singh', email: 'diksha@dtu.edu', college: 'DTU Delhi', branch: 'CS', graduation_year: 2025 },
    internship: { title: 'ML Research Intern', company_id: 'demo' }
  },
];
