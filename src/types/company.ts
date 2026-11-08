import type { Job } from './job'

export type PublicCompany = {
  id: string
  name: string
  logo_url: string | null
  website: string | null
  description: string | null
  industry: string | null
  address: string | null
  size: number | null
  follower_count: number
  active_job_count: number
}

export type CompanyJobSort = 'newest' | 'oldest'

export type PublicCompanyJobsResponse = {
  items: Job[]
  page: number
  page_size: number
  total: number
  total_pages: number
}

export type CompanyFollowStatus = {
  company_id: string
  is_following: boolean
  follower_count: number
}

export type FollowedCompanyListItem = {
  company: Omit<PublicCompany, 'follower_count' | 'active_job_count'>
  followed_at: string
  follower_count: number
  active_job_count: number
}

export type FollowedCompanyListResponse = {
  items: FollowedCompanyListItem[]
  page: number
  page_size: number
  total: number
  total_pages: number
}
