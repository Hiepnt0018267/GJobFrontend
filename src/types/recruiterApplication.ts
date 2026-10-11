import type { CV, CVSourceType, CVTemplateSummary } from './cv'
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

export type RecruiterApplicationSort = 'newest' | 'ai_match'
export type ApplicantRankingStatus = 'ranked' | 'pending' | 'unavailable' | 'error'
export type ApplicantRankingMode = 'all' | 'top_n'

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
  source_type: CVSourceType
  template: CVTemplateSummary | null
  original_filename: string | null
  mime_type: string | null
  file_size: number | null
  has_managed_photo: boolean
}

export type RecruiterApplicationListItem = {
  ai_rank?: number | null
  ranking_status?: ApplicantRankingStatus | null
  semantic_match_score?: number | null
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
  ranking_mode?: ApplicantRankingMode | null
  requested_top_n?: number | null
  ranked_available_count?: number | null
  returned_ranked_count?: number | null
  unranked_count?: number | null
  ranking_snapshot?: string | null
  items: RecruiterApplicationListItem[]
  page: number
  page_size: number
  total: number
  total_pages: number
}

export type RecruiterApplicationListParams = {
  ranking_mode?: ApplicantRankingMode
  top_n?: number
  sort?: RecruiterApplicationSort
  ranking_snapshot?: string
  search?: string
  status?: RecruiterApplicationStatus
  job_id?: string
  page: number
  page_size: number
}
