import type { PaymentOrderStatus } from './adminPayment'

export type AdminUserRole = 'CANDIDATE' | 'RECRUITER' | 'ADMIN'

export type AdminUserListItem = {
  id: string
  email: string
  full_name: string
  role: AdminUserRole
  is_active: boolean
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export type AdminUserDetail = AdminUserListItem & {
  phone: string | null
  address: string | null
  bio: string | null
}

export type AdminUserListResponse = {
  items: AdminUserListItem[]
  page: number
  page_size: number
  total: number
  total_pages: number
}

export type AdminUserListParams = {
  search?: string
  role?: AdminUserRole
  is_active?: boolean
  page?: number
  page_size?: number
}

export type AdminUserRecentCV = {
  id: string
  title: string
  source_type: 'BUILDER' | 'UPLOADED'
  is_default: boolean
  updated_at: string
}

export type AdminUserRecentApplication = {
  id: string
  job_id: string
  job_title: string
  company_name: string
  status: string
  updated_at: string
}

export type AdminCandidateOverview = {
  cv_total: number
  analyzed_cv_total: number
  uploaded_cv_total: number
  application_total: number
  hired_total: number
  saved_job_total: number
  recent_cvs: AdminUserRecentCV[]
  recent_applications: AdminUserRecentApplication[]
}

export type AdminRecruiterOverview = {
  company_profile: {
    company_name: string | null
    company_website: string | null
    company_description: string | null
    company_address: string | null
    company_logo_url: string | null
    industry: string | null
    company_size: number | null
  } | null
  current_plan: { code: string; name: string; source: 'ADMIN' | 'PAYMENT' | null; expires_at: string | null }
  job_total: number
  pending_job_total: number
  approved_job_total: number
  closed_job_total: number
  received_application_total: number
  paid_order_total: number
  successful_payment_total: number
  revenue: string
  recent_jobs: Array<{ id: string; title: string; status: string; application_total: number; updated_at: string }>
  recent_payment_orders: Array<{ id: string; payment_code: string; plan_name: string; amount: string; currency: string; status: PaymentOrderStatus; created_at: string }>
}

export type AdminAdministratorOverview = {
  audit_action_total: number
  recent_actions: Array<{ id: string; action: string; entity_type: string; entity_id: string; created_at: string }>
}

export type AdminUserRoleOverview = {
  user_id: string
  role: AdminUserRole
  candidate: AdminCandidateOverview | null
  recruiter: AdminRecruiterOverview | null
  administrator: AdminAdministratorOverview | null
}
