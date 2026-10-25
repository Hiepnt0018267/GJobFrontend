export const candidateRouteModules = {
  home: () => import('../pages/HomePage'),
  jobs: () => import('../pages/jobs/JobListPage'),
  jobDetail: () => import('../pages/jobs/JobDetailPage'),
  profile: () => import('../pages/candidate/CandidateProfilePage'),
  profileEdit: () => import('../pages/candidate/CandidateProfileEditPage'),
  cvs: () => import('../pages/candidate/CandidateCVsPage'),
  cvTemplates: () => import('../pages/candidate/CandidateCVTemplatesPage'),
  cvCreate: () => import('../pages/candidate/CandidateCVCreatePage'),
  cvDetail: () => import('../pages/candidate/CandidateCVDetailPage'),
  cvEdit: () => import('../pages/candidate/CandidateCVEditPage'),
  applications: () => import('../pages/candidate/CandidateApplicationsPage'),
  applicationDetail: () => import('../pages/candidate/CandidateApplicationDetailPage'),
  savedJobs: () => import('../pages/candidate/SavedJobsPage'),
  recommendations: () => import('../pages/candidate/CandidateJobRecommendationsPage'),
  settings: () => import('../pages/candidate/CandidateSettingsPage'),
}

type CandidateRouteLoader = () => Promise<unknown>

const candidateRoutePreloaders: Array<[RegExp, CandidateRouteLoader]> = [
  [/^\/$/, candidateRouteModules.home],
  [/^\/jobs\/[^/]+\/?$/, candidateRouteModules.jobDetail],
  [/^\/jobs\/?$/, candidateRouteModules.jobs],
  [/^\/candidate\/profile\/edit\/?$/, candidateRouteModules.profileEdit],
  [/^\/candidate\/profile\/?$/, candidateRouteModules.profile],
  [/^\/candidate\/cvs\/templates\/?$/, candidateRouteModules.cvTemplates],
  [/^\/candidate\/cvs\/create\/?$/, candidateRouteModules.cvCreate],
  [/^\/candidate\/cvs\/[^/]+\/edit\/?$/, candidateRouteModules.cvEdit],
  [/^\/candidate\/cvs\/[^/]+\/?$/, candidateRouteModules.cvDetail],
  [/^\/candidate\/cvs\/?$/, candidateRouteModules.cvs],
  [/^\/candidate\/applications\/[^/]+\/?$/, candidateRouteModules.applicationDetail],
  [/^\/candidate\/applications\/?$/, candidateRouteModules.applications],
  [/^\/candidate\/saved-jobs\/?$/, candidateRouteModules.savedJobs],
  [/^\/candidate\/job-recommendations\/?$/, candidateRouteModules.recommendations],
  [/^\/candidate\/settings\/?$/, candidateRouteModules.settings],
]

const warmedPaths = new Set<string>()

export function preloadCandidateRoute(pathname: string): void {
  if (warmedPaths.has(pathname)) return
  const route = candidateRoutePreloaders.find(([pattern]) => pattern.test(pathname))
  if (!route) return
  warmedPaths.add(pathname)
  void route[1]().catch(() => warmedPaths.delete(pathname))
}
