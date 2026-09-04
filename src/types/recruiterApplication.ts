import type { CV, CVTemplateSummary } from './cv'
import type { Job, JobStatus } from './job'

export const RECRUITER_APPLICATION_STATUSES = [
  'SUBMITTED',
  'REVIEWING',
  'SHORTLISTED',
  'REJECTED',
  'HIRED',
  'WITHDRAWN',
] as const

export type RecruiterApplicationStatus = (typeof RECRUITER_APPLICATION_STATUSES)[number]

export type RecruiterApplicationCandidateSummary = {
  id: string
  full_name: string
  email: string
  avatar_url: string | null
}

export type RecruiterApplicationCandidateDetail = RecruiterApplicationCandidateSummary & {
  phone: string | null
}

export type RecruiterApplicationJobSummary = {
  id: string
  title: string
  company_name: string
  status: JobStatus
}

export type RecruiterApplicationCVSummary = {
  id: string
  title: string
  template: CVTemplateSummary
}

export type RecruiterApplicationListItem = {
  id: string
  candidate_id: string
  job_id: string
  cv_id: string
  status: RecruiterApplicationStatus
  created_at: string
  updated_at: string
  candidate: RecruiterApplicationCandidateSummary
  job: RecruiterApplicationJobSummary
  cv: RecruiterApplicationCVSummary
}

export type RecruiterApplicationDetail = Omit<RecruiterApplicationListItem, 'candidate' | 'job' | 'cv'> & {
  candidate: RecruiterApplicationCandidateDetail
  job: Job
  cv: CV
}

export type RecruiterApplicationListResponse = {
  items: RecruiterApplicationListItem[]
  page: number
  page_size: number
  total: number
  total_pages: number
}

export type RecruiterApplicationListParams = {
  search?: string
  status?: RecruiterApplicationStatus
  job_id?: string
  page: number
  page_size: number
}
