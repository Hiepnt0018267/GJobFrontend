export type RecruiterProfile = {
  id: string
  email: string
  full_name: string
  phone: string | null
  company_name: string | null
  company_website: string | null
  company_description: string | null
  company_address: string | null
  company_logo_url: string | null
  industry: string | null
  company_size: number | null
  created_at: string
  updated_at: string
}

export type RecruiterProfileUpdate = {
  full_name?: string
  phone?: string | null
  company_name?: string | null
  company_website?: string | null
  company_description?: string | null
  company_address?: string | null
  company_logo_url?: string | null
  industry?: string | null
  company_size?: number | null
}

export type RecruiterDashboardSummary = {
  total_jobs: number
  pending_jobs: number
  approved_jobs: number
  rejected_jobs: number
  closed_jobs: number
}
