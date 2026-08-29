export const EMPLOYMENT_TYPES = ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'FREELANCE'] as const
export const EXPERIENCE_LEVELS = ['ENTRY', 'MID', 'SENIOR', 'LEAD', 'MANAGER'] as const
export const JOB_SORT_OPTIONS = ['newest', 'oldest', 'salary_high', 'salary_low'] as const

export type EmploymentType = (typeof EMPLOYMENT_TYPES)[number]
export type ExperienceLevel = (typeof EXPERIENCE_LEVELS)[number]
export type JobSortOption = (typeof JOB_SORT_OPTIONS)[number]

export type Job = {
  id: string
  title: string
  description: string
  company_name: string
  location: string | null
  salary_min: number | null
  salary_max: number | null
  employment_type: EmploymentType | null
  experience_level: ExperienceLevel | null
  skills: string[] | null
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CLOSED'
  created_at: string
  updated_at: string
}

export type JobListResponse = { items: Job[]; page: number; page_size: number; total: number; total_pages: number }
export type JobSearchParams = { keyword?: string; location?: string; employment_type?: EmploymentType; experience_level?: ExperienceLevel; salary_min?: number; salary_max?: number; page?: number; page_size?: number; sort?: JobSortOption }
export type MockJob = { id: string; title: string; company: string; location: string; salary: string; type: string }
export type Category = { id: string; name: string; icon: string; jobCount: number }
export type Company = { id: string; name: string; location: string; jobCount: number; initial: string }
