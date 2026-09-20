import type { Job, JobStatus } from './job'

export type AdminJobRecruiterAccount = {
  id: string
  email: string
  full_name: string
  phone: string | null
  is_active: boolean
  created_at: string
}

export type AdminJobCompanyProfile = {
  id: string
  company_name: string | null
  company_website: string | null
  company_description: string | null
  company_address: string | null
  company_logo_url: string | null
  industry: string | null
  company_size: number | null
}

export type AdminJob = Job & {
  recruiter_id: string | null
  recruiter_account: AdminJobRecruiterAccount | null
  company_profile: AdminJobCompanyProfile | null
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
