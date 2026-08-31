export const EMPLOYMENT_TYPES = ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'FREELANCE'] as const
export const EXPERIENCE_LEVELS = ['ENTRY', 'MID', 'SENIOR', 'LEAD', 'MANAGER'] as const
export const JOB_SORT_OPTIONS = ['newest', 'oldest', 'salary_high', 'salary_low'] as const
export const JOB_STATUSES = ['PENDING', 'APPROVED', 'REJECTED', 'CLOSED'] as const
export const JOB_LEVELS = ['INTERN', 'JUNIOR', 'STAFF', 'SENIOR', 'LEAD', 'MANAGER'] as const
export const EXPERIENCE_REQUIREMENTS = ['NO_EXPERIENCE', 'LESS_THAN_ONE_YEAR', 'ONE_TO_THREE_YEARS', 'THREE_TO_FIVE_YEARS', 'MORE_THAN_FIVE_YEARS'] as const
export const WORK_MODES = ['ONSITE', 'HYBRID', 'REMOTE'] as const
export const SALARY_TYPES = ['RANGE', 'FIXED', 'NEGOTIABLE'] as const
export const INDUSTRIES = ['INFORMATION_TECHNOLOGY', 'FINANCE_BANKING', 'MARKETING_ADVERTISING', 'SALES', 'HUMAN_RESOURCES', 'EDUCATION', 'HEALTHCARE', 'MANUFACTURING', 'LOGISTICS', 'OTHER'] as const
export const RECRUITER_JOB_SORT_OPTIONS = ['newest', 'oldest', 'updated'] as const

export type EmploymentType = (typeof EMPLOYMENT_TYPES)[number]
export type ExperienceLevel = (typeof EXPERIENCE_LEVELS)[number]
export type JobSortOption = (typeof JOB_SORT_OPTIONS)[number]
export type JobStatus = (typeof JOB_STATUSES)[number]
export type JobLevel = (typeof JOB_LEVELS)[number]
export type ExperienceRequirement = (typeof EXPERIENCE_REQUIREMENTS)[number]
export type WorkMode = (typeof WORK_MODES)[number]
export type SalaryType = (typeof SALARY_TYPES)[number]
export type Industry = (typeof INDUSTRIES)[number]
export type RecruiterJobSortOption = (typeof RECRUITER_JOB_SORT_OPTIONS)[number]

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
  level: JobLevel | null
  experience_requirement: ExperienceRequirement | null
  work_mode: WorkMode | null
  industry: Industry | null
  vacancies: number
  salary_type: SalaryType | null
  salary_fixed: number | null
  salary_currency: string
  skills: string[] | null
  requirements: string | null
  benefits: string | null
  status: JobStatus
  created_at: string
  updated_at: string
}

export type JobListResponse = { items: Job[]; page: number; page_size: number; total: number; total_pages: number }
export type JobSearchParams = { keyword?: string; location?: string; employment_type?: EmploymentType; experience_level?: ExperienceLevel; salary_min?: number; salary_max?: number; page?: number; page_size?: number; sort?: JobSortOption }
export type RecruiterJob = Job & { recruiter_id: string }
export type JobCreateRequest = {
  title: string; description: string; company_name: string; location: string | null
  employment_type: EmploymentType | null; level: JobLevel | null
  experience_requirement: ExperienceRequirement | null; work_mode: WorkMode | null
  industry: Industry | null; vacancies: number; salary_type: SalaryType
  salary_min: number | null; salary_max: number | null; salary_fixed: number | null
  salary_currency: string; skills: string[]; requirements: string; benefits: string | null
}
export type JobUpdateRequest = Partial<JobCreateRequest>
export type RecruiterJobListResponse = { items: RecruiterJob[]; page: number; page_size: number; total: number; total_pages: number }
export type RecruiterJobSearchParams = { keyword?: string; status?: JobStatus; page?: number; page_size?: number; sort?: RecruiterJobSortOption }
export type MockJob = { id: string; title: string; company: string; location: string; salary: string; type: string }
export type Category = { id: string; name: string; icon: string; jobCount: number }
export type Company = { id: string; name: string; location: string; jobCount: number; initial: string }
