import type {
  EmploymentType,
  ExperienceRequirement,
  Industry,
  JobStatus,
  SalaryType,
  WorkMode,
} from './job'

export type SavedJobStatus = {
  saved: boolean
  saved_at: string | null
}

export type SavedJobSummary = {
  id: string
  title: string
  company_name: string
  company_logo_url: string | null
  location: string | null
  salary_min: number | null
  salary_max: number | null
  salary_type: SalaryType | null
  salary_fixed: number | null
  salary_currency: string
  employment_type: EmploymentType | null
  experience_requirement: ExperienceRequirement | null
  work_mode: WorkMode | null
  industry: Industry | null
  status: JobStatus
  created_at: string
}

export type SavedJobListItem = {
  id: string
  saved_at: string
  job: SavedJobSummary
}

export type SavedJobListResponse = {
  items: SavedJobListItem[]
  page: number
  page_size: number
  total: number
  total_pages: number
}

export type SavedJobListParams = {
  page?: number
  page_size?: number
}
