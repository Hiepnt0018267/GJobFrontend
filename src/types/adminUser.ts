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
