export const workspaceRouteModules = {
  recruiterDashboard: () => import('../pages/recruiter/RecruiterDashboardPage'),
  recruiterProfile: () => import('../pages/recruiter/RecruiterProfilePage'),
  recruiterProfileEdit: () => import('../pages/recruiter/RecruiterProfileEditPage'),
  recruiterJobs: () => import('../pages/recruiter/RecruiterJobsPage'),
  recruiterJobCreate: () => import('../pages/recruiter/RecruiterJobCreatePage'),
  recruiterJobEdit: () => import('../pages/recruiter/RecruiterJobEditPage'),
  recruiterJobDetail: () => import('../pages/recruiter/RecruiterJobDetailPage'),
  recruiterApplications: () => import('../pages/recruiter/RecruiterApplicationsPage'),
  recruiterApplicationDetail: () => import('../pages/recruiter/RecruiterApplicationDetailPage'),
  recruiterPlans: () => import('../pages/recruiter/RecruiterPlansPage'),
  recruiterPayment: () => import('../pages/recruiter/RecruiterPaymentPage'),
  recruiterSettings: () => import('../pages/recruiter/RecruiterSettingsPage'),
  adminDashboard: () => import('../pages/admin/AdminDashboardPage'),
  adminJobs: () => import('../pages/admin/AdminJobsPage'),
  adminJobDetail: () => import('../pages/admin/AdminJobDetailPage'),
  adminUsers: () => import('../pages/admin/AdminUsersPage'),
  adminUserDetail: () => import('../pages/admin/AdminUserDetailPage'),
  adminCVTemplates: () => import('../pages/admin/AdminCVTemplatesPage'),
  adminCVTemplateCreate: () => import('../pages/admin/AdminCVTemplateCreatePage'),
  adminCVTemplateDetail: () => import('../pages/admin/AdminCVTemplateDetailPage'),
  adminCVTemplateEdit: () => import('../pages/admin/AdminCVTemplateEditPage'),
  adminApplications: () => import('../pages/admin/AdminApplicationsPage'),
  adminApplicationDetail: () => import('../pages/admin/AdminApplicationDetailPage'),
  adminCandidateCVs: () => import('../pages/admin/AdminCandidateCVsPage'),
  adminCandidateCVDetail: () => import('../pages/admin/AdminCandidateCVDetailPage'),
  adminSubscriptionPlans: () => import('../pages/admin/AdminSubscriptionPlansPage'),
  adminPayments: () => import('../pages/admin/AdminPaymentsPage'),
}

type WorkspaceRouteLoader = () => Promise<unknown>

const workspaceRoutePreloaders: Array<[RegExp, WorkspaceRouteLoader]> = [
  [/^\/recruiter\/?$/, workspaceRouteModules.recruiterDashboard],
  [/^\/recruiter\/profile\/edit\/?$/, workspaceRouteModules.recruiterProfileEdit],
  [/^\/recruiter\/profile\/?$/, workspaceRouteModules.recruiterProfile],
  [/^\/recruiter\/jobs\/create\/?$/, workspaceRouteModules.recruiterJobCreate],
  [/^\/recruiter\/jobs\/[^/]+\/edit\/?$/, workspaceRouteModules.recruiterJobEdit],
  [/^\/recruiter\/jobs\/[^/]+\/applications\/?$/, workspaceRouteModules.recruiterApplications],
  [/^\/recruiter\/jobs\/[^/]+\/?$/, workspaceRouteModules.recruiterJobDetail],
  [/^\/recruiter\/jobs\/?$/, workspaceRouteModules.recruiterJobs],
  [/^\/recruiter\/applications\/[^/]+\/?$/, workspaceRouteModules.recruiterApplicationDetail],
  [/^\/recruiter\/applications\/?$/, workspaceRouteModules.recruiterApplications],
  [/^\/recruiter\/plans\/?$/, workspaceRouteModules.recruiterPlans],
  [/^\/recruiter\/payments\/[^/]+\/?$/, workspaceRouteModules.recruiterPayment],
  [/^\/recruiter\/settings\/?$/, workspaceRouteModules.recruiterSettings],
  [/^\/admin\/?$/, workspaceRouteModules.adminDashboard],
  [/^\/admin\/jobs\/[^/]+\/?$/, workspaceRouteModules.adminJobDetail],
  [/^\/admin\/jobs\/?$/, workspaceRouteModules.adminJobs],
  [/^\/admin\/users\/[^/]+\/?$/, workspaceRouteModules.adminUserDetail],
  [/^\/admin\/users\/?$/, workspaceRouteModules.adminUsers],
  [/^\/admin\/cv-templates\/new\/?$/, workspaceRouteModules.adminCVTemplateCreate],
  [/^\/admin\/cv-templates\/[^/]+\/edit\/?$/, workspaceRouteModules.adminCVTemplateEdit],
  [/^\/admin\/cv-templates\/[^/]+\/?$/, workspaceRouteModules.adminCVTemplateDetail],
  [/^\/admin\/cv-templates\/?$/, workspaceRouteModules.adminCVTemplates],
  [/^\/admin\/applications\/[^/]+\/?$/, workspaceRouteModules.adminApplicationDetail],
  [/^\/admin\/applications\/?$/, workspaceRouteModules.adminApplications],
  [/^\/admin\/cvs\/[^/]+\/?$/, workspaceRouteModules.adminCandidateCVDetail],
  [/^\/admin\/cvs\/?$/, workspaceRouteModules.adminCandidateCVs],
  [/^\/admin\/subscription-plans\/?$/, workspaceRouteModules.adminSubscriptionPlans],
  [/^\/admin\/payments\/?$/, workspaceRouteModules.adminPayments],
]

const warmedPaths = new Set<string>()

export function preloadWorkspaceRoute(pathname: string): void {
  if (warmedPaths.has(pathname)) return
  const route = workspaceRoutePreloaders.find(([pattern]) => pattern.test(pathname))
  if (!route) return
  warmedPaths.add(pathname)
  void route[1]().catch(() => warmedPaths.delete(pathname))
}
