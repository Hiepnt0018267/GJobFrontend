import type { Job, JobStatus } from './job'

export type AdminJob = Job & {
  recruiter_id: string | null
}

export type AdminJobListResponse = {
  items: AdminJob[]
  page: number
  page_size: number
  total: number
  total_pages: number
}

export type AdminJobListParams = {
  status?: JobStatus
  search?: string
  page?: number
  page_size?: number
}
