export interface Skill {
  skill_name: string;
  level?: string;
}

export interface Internship {
  id: string;
  internship_id: number;
  company_id: string;
  company_name: string;
  title: string;
  description: string;
  requirements: {
    role_skills: string[];
    experience_level?: string;
  };
  duration: string;
  stipend: string;
  location: string;
  status: 'Open' | 'Closed';
  // AI Match Engine Fields
  match_percentage?: number;
  success_probability?: number;
  applied?: boolean;
  required_skills?: string[];
  missing_skills?: string[];
  match_diagnosis?: any;
}

export interface Application {
  application_id: string;
  student_id: string;
  internship_id: string;
  company_id: string;
  status: 'Pending' | 'Under Review' | 'Interviewing' | 'Accepted' | 'Rejected';
  applied_date: string;
  // Enriched fields
  student_name?: string;
  role_title?: string;
  company_name?: string;
  match_score?: number;
  ai_match_score?: number;
  ai_interview_guide?: string[];
}

export interface Student {
  id: string;
  name: string;
  email: string;
  roll_no?: string;
  college: string;
  skills: Skill[];
  market_reach?: number;
  high_impact_skill?: {
    name: string;
    boost: number;
  };
  ai_resume_analysis?: any;
}

export interface Company {
  id: string;
  name: string;
  industry: string;
  location: string;
  description: string;
}

export interface MarketEquilibriumItem {
  name: string;
  supply: number;
  demand: number;
  gap: number;
}
