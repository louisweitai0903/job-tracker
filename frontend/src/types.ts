export interface Job {
  id: string
  company: string
  title: string
  status: string
  date?: string
  link?: string
  contact?: string
  description?: string
  notes?: string
  ai_company_background?: string
  ai_role_summary?: string
  ai_skills_required?: SkillRequired[]
  ai_fit_score?: number
  ai_fit_reasons?: { match: string[]; tips: string[] }
  ai_gaps?: string[]
  ai_urgency_level?: 'high' | 'medium' | 'low'
  ai_processed_at?: string
  created_at?: string
}

export interface SkillRequired {
  name: string
  candidate_has: boolean
}

export interface SkillItem {
  name: string
  category: 'technical' | 'design' | 'soft' | 'language' | 'tool'
}

export interface WorkExperience {
  title: string
  company: string
  period: string
  summary: string
}

export interface Education {
  degree: string
  institution: string
  period: string
  specialization?: string
}

export interface Project {
  name: string
  description: string
  technologies: string[]
}

export interface ResumeData {
  filename: string
  profile_strength_score: number
  profile_strength_tip: string
  skills: SkillItem[]
  work_experience: WorkExperience[]
  education: Education[]
  projects: Project[]
  uploaded_at: string
}

export type View = 'dashboard' | 'profile' | 'settings'
