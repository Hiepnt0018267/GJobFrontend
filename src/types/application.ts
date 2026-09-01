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
