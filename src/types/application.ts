import type { CV, CVListItem } from './cv'
import type { Job } from './job'

export const APPLICATION_STATUSES = ['SUBMITTED', 'REVIEWING', 'SHORTLISTED', 'REJECTED', 'HIRED', 'WITHDRAWN'] as const

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number]

export interface JobApplication {
  id: string
  job_id: string
  candidate_id: string
  cv_id: string
  status: ApplicationStatus
  created_at: string
  updated_at: string
}

export interface SubmitApplicationRequest {
  cv_id: string
}

export type CandidateApplicationJobSummary = Pick<Job, 'id' | 'title' | 'company_name' | 'status' | 'location' | 'work_mode'>

export interface CandidateApplicationListItem {
  id: string
  job_id: string
  cv_id: string
  status: ApplicationStatus
  created_at: string
  updated_at: string
  job: CandidateApplicationJobSummary
  cv: CVListItem
}

export interface CandidateApplicationDetail extends Omit<CandidateApplicationListItem, 'cv'> {
  cv: CV
}

export interface CandidateApplicationListResponse {
  items: CandidateApplicationListItem[]
  page: number
  page_size: number
  total: number
  total_pages: number
}

export interface CandidateApplicationListParams {
  status?: ApplicationStatus
  search?: string
  page: number
  page_size: number
}

export interface CandidateApplicationAppliedSummary {
  id: string
  status: ApplicationStatus
  created_at: string
  updated_at: string
}

export interface AppliedStatusResponse {
  has_applied: boolean
  application: CandidateApplicationAppliedSummary | null
}
