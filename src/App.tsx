import { lazy } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import { canRestorePathForRole, dashboardFor } from './utils/dashboardFor'
import { hasPendingRecruiterOnboarding } from './utils/recruiterOnboarding'
import { candidateRouteModules } from './config/candidateRouteModules'
import { workspaceRouteModules } from './config/workspaceRouteModules'

// Layouts
import MainLayout from './layouts/MainLayout'
import RecruiterLayout from './layouts/RecruiterLayout'
import AdminLayout from './layouts/AdminLayout'
import PageTransition from './components/motion/PageTransition'

// Candidate/public pages are split by route and prefetched from MainLayout.
const HomePage = lazy(candidateRouteModules.home)
const JobListPage = lazy(candidateRouteModules.jobs)
const JobDetailPage = lazy(candidateRouteModules.jobDetail)
const CandidateProfilePage = lazy(candidateRouteModules.profile)
const CandidateProfileEditPage = lazy(candidateRouteModules.profileEdit)
const CandidateCVsPage = lazy(candidateRouteModules.cvs)
const CandidateCVCreatePage = lazy(candidateRouteModules.cvCreate)
const CandidateCVDetailPage = lazy(candidateRouteModules.cvDetail)
const CandidateCVEditPage = lazy(candidateRouteModules.cvEdit)
const CandidateCVTemplatesPage = lazy(candidateRouteModules.cvTemplates)
const CandidateApplicationsPage = lazy(candidateRouteModules.applications)
const CandidateApplicationDetailPage = lazy(candidateRouteModules.applicationDetail)
const SavedJobsPage = lazy(candidateRouteModules.savedJobs)
const CandidateJobRecommendationsPage = lazy(candidateRouteModules.recommendations)
const CandidateSettingsPage = lazy(candidateRouteModules.settings)

// Recruiter/admin pages are split by route and prefetched from their workspace shell.
const RecruiterDashboardPage = lazy(workspaceRouteModules.recruiterDashboard)
const RecruiterProfilePage = lazy(workspaceRouteModules.recruiterProfile)
const RecruiterProfileEditPage = lazy(workspaceRouteModules.recruiterProfileEdit)
const RecruiterJobsPage = lazy(workspaceRouteModules.recruiterJobs)
const RecruiterJobCreatePage = lazy(workspaceRouteModules.recruiterJobCreate)
const RecruiterJobEditPage = lazy(workspaceRouteModules.recruiterJobEdit)
const RecruiterJobDetailPage = lazy(workspaceRouteModules.recruiterJobDetail)
const RecruiterApplicationsPage = lazy(workspaceRouteModules.recruiterApplications)
const RecruiterApplicationDetailPage = lazy(workspaceRouteModules.recruiterApplicationDetail)
const RecruiterPlansPage = lazy(workspaceRouteModules.recruiterPlans)
const RecruiterPaymentPage = lazy(workspaceRouteModules.recruiterPayment)
const RecruiterSettingsPage = lazy(workspaceRouteModules.recruiterSettings)
const AdminDashboardPage = lazy(workspaceRouteModules.adminDashboard)
const AdminJobsPage = lazy(workspaceRouteModules.adminJobs)
const AdminJobDetailPage = lazy(workspaceRouteModules.adminJobDetail)
const AdminUsersPage = lazy(workspaceRouteModules.adminUsers)
const AdminUserDetailPage = lazy(workspaceRouteModules.adminUserDetail)
const AdminCVTemplatesPage = lazy(workspaceRouteModules.adminCVTemplates)
const AdminCVTemplateCreatePage = lazy(workspaceRouteModules.adminCVTemplateCreate)
const AdminCVTemplateDetailPage = lazy(workspaceRouteModules.adminCVTemplateDetail)
const AdminCVTemplateEditPage = lazy(workspaceRouteModules.adminCVTemplateEdit)
const AdminApplicationsPage = lazy(workspaceRouteModules.adminApplications)
const AdminApplicationDetailPage = lazy(workspaceRouteModules.adminApplicationDetail)
const AdminCandidateCVsPage = lazy(workspaceRouteModules.adminCandidateCVs)
const AdminCandidateCVDetailPage = lazy(workspaceRouteModules.adminCandidateCVDetail)
const AdminSubscriptionPlansPage = lazy(workspaceRouteModules.adminSubscriptionPlans)
const AdminPaymentsPage = lazy(workspaceRouteModules.adminPayments)

// Auth pages
import AuthPage from './pages/auth/AuthPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'
import ResetPasswordPage from './pages/auth/ResetPasswordPage'
import VerifyEmailPage from './pages/auth/VerifyEmailPage'
import VerificationRequiredPage from './pages/auth/VerificationRequiredPage'

// Error pages
import ForbiddenPage from './pages/errors/ForbiddenPage'

import NotificationCenterPage from './pages/notifications/NotificationCenterPage'

// Route guards
import ProtectedRoute from './routes/ProtectedRoute'
import RoleRoute      from './routes/RoleRoute'

// ─── Redirect auth pages when already logged in ───────────────────────────────
function RedirectIfAuthenticated({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading, user } = useAuth()
  const location = useLocation()
  if (loading) return null
  if (isAuthenticated && user) {
    const state = location.state as { from?: { pathname?: string; search?: string; hash?: string }; resumeApplicationJobId?: string } | null
    const from = state?.from
    const returnTo = from?.pathname && from.pathname.startsWith('/') && !from.pathname.startsWith('//') && canRestorePathForRole(from.pathname, user.role)
      ? `${from.pathname}${from.search ?? ''}${from.hash ?? ''}`
      : null
    const needsRecruiterOnboarding = user.role === 'RECRUITER' && hasPendingRecruiterOnboarding(user.email)
    const dest = needsRecruiterOnboarding
      ? '/recruiter/profile/edit?onboarding=1'
      : (returnTo ?? dashboardFor(user.role))
    const resumeApplicationJobId = returnTo ? state?.resumeApplicationJobId : undefined
    return <Navigate to={dest} state={resumeApplicationJobId ? { resumeApplicationJobId } : null} replace />
  }
  return <>{children}</>
}

function App() {
  return (
    <Routes>
      {/* ── Public routes with MainLayout ── */}
      <Route element={<MainLayout />}>
        <Route path="/"         element={<HomePage />} />
        <Route path="/jobs"     element={<JobListPage />} />
        <Route path="/jobs/:id" element={<JobDetailPage />} />
        <Route element={<ProtectedRoute loadingVariant="candidate" />}>
          <Route element={<RoleRoute allowedRoles={['CANDIDATE']} />}>
            <Route path="/candidate" element={<Navigate to="/" replace />} />
            <Route path="/candidate/profile" element={<CandidateProfilePage />} />
            <Route path="/candidate/profile/edit" element={<CandidateProfileEditPage />} />
            <Route path="/candidate/cvs" element={<CandidateCVsPage />} />
            <Route path="/candidate/cvs/templates" element={<CandidateCVTemplatesPage />} />
            <Route path="/candidate/cvs/create" element={<CandidateCVCreatePage />} />
            <Route path="/candidate/cvs/:id" element={<CandidateCVDetailPage />} />
            <Route path="/candidate/cvs/:id/edit" element={<CandidateCVEditPage />} />
            <Route path="/candidate/applications" element={<CandidateApplicationsPage />} />
            <Route path="/candidate/applications/:id" element={<CandidateApplicationDetailPage />} />
            <Route path="/candidate/saved-jobs" element={<SavedJobsPage />} />
            <Route path="/candidate/job-recommendations" element={<CandidateJobRecommendationsPage />} />
            <Route path="/candidate/notifications" element={<NotificationCenterPage />} />
            <Route path="/candidate/settings" element={<CandidateSettingsPage />} />
          </Route>
        </Route>
      </Route>

      {/* ── Auth pages (standalone, redirect if already logged in) ── */}
      <Route
        element={
          <RedirectIfAuthenticated>
            <AuthPage />
          </RedirectIfAuthenticated>
        }
      >
        <Route path="/login" />
        <Route path="/register" />
      </Route>
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route path="/verification-required" element={<VerificationRequiredPage />} />

      {/* ── Error pages ── */}
      <Route path="/403" element={<PageTransition><ForbiddenPage /></PageTransition>} />

      {/* ── Protected: must be authenticated ── */}
      <Route element={<ProtectedRoute />}>
        {/* RECRUITER dashboard */}
        <Route element={<RoleRoute allowedRoles={['RECRUITER']} />}>
          <Route element={<RecruiterLayout />}>
            <Route path="/recruiter" element={<RecruiterDashboardPage />} />
            <Route path="/recruiter/profile" element={<RecruiterProfilePage />} />
            <Route path="/recruiter/profile/edit" element={<RecruiterProfileEditPage />} />
            <Route path="/recruiter/jobs" element={<RecruiterJobsPage />} />
            <Route path="/recruiter/jobs/create" element={<RecruiterJobCreatePage />} />
            <Route path="/recruiter/jobs/:id/edit" element={<RecruiterJobEditPage />} />
            <Route path="/recruiter/jobs/:jobId/applications" element={<RecruiterApplicationsPage />} />
            <Route path="/recruiter/jobs/:id" element={<RecruiterJobDetailPage />} />
            <Route path="/recruiter/applications" element={<RecruiterApplicationsPage />} />
            <Route path="/recruiter/applications/:id" element={<RecruiterApplicationDetailPage />} />
            <Route path="/recruiter/settings" element={<RecruiterSettingsPage />} />
            <Route path="/recruiter/plans" element={<RecruiterPlansPage />} />
            <Route path="/recruiter/payments/:orderId" element={<RecruiterPaymentPage />} />
            <Route path="/recruiter/notifications" element={<NotificationCenterPage />} />
          </Route>
        </Route>

        {/* ADMIN dashboard */}
        <Route element={<RoleRoute allowedRoles={['ADMIN']} />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/admin/jobs" element={<AdminJobsPage />} />
            <Route path="/admin/jobs/:id" element={<AdminJobDetailPage />} />
            <Route path="/admin/users" element={<AdminUsersPage />} />
            <Route path="/admin/users/:id" element={<AdminUserDetailPage />} />
            <Route path="/admin/cv-templates" element={<AdminCVTemplatesPage />} />
            <Route path="/admin/cv-templates/new" element={<AdminCVTemplateCreatePage />} />
            <Route path="/admin/cv-templates/:id" element={<AdminCVTemplateDetailPage />} />
            <Route path="/admin/cv-templates/:id/edit" element={<AdminCVTemplateEditPage />} />
            <Route path="/admin/applications" element={<AdminApplicationsPage />} />
            <Route path="/admin/applications/:id" element={<AdminApplicationDetailPage />} />
            <Route path="/admin/cvs" element={<AdminCandidateCVsPage />} />
            <Route path="/admin/cvs/:id" element={<AdminCandidateCVDetailPage />} />
            <Route path="/admin/subscription-plans" element={<AdminSubscriptionPlansPage />} />
            <Route path="/admin/payments" element={<AdminPaymentsPage />} />
            <Route path="/admin/notifications" element={<NotificationCenterPage />} />
          </Route>
        </Route>
      </Route>

      {/* ── 404 fallback ── */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
