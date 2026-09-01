export type AdminUserStats = {
  total: number
  candidates: number
  recruiters: number
  admins: number
  active: number
  inactive: number
}

export type AdminJobStats = {
  total: number
  pending: number
  approved: number
  rejected: number
  closed: number
}

export type AdminApplicationStats = {
  total: number
  submitted: number
  reviewing: number
  shortlisted: number
  rejected: number
  hired: number
  withdrawn: number
}

export type AdminCVStats = {
  total: number
}

export type AdminCVTemplateStats = {
  total: number
  active: number
  inactive: number
}

export type AdminDashboardResponse = {
  users: AdminUserStats
  jobs: AdminJobStats
  applications: AdminApplicationStats
  cvs: AdminCVStats
  cv_templates: AdminCVTemplateStats
}
