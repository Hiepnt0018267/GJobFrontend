import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'

// Layouts
import MainLayout from './layouts/MainLayout'

// Public pages
import HomePage        from './pages/HomePage'
import JobListPage     from './pages/jobs/JobListPage'
import JobDetailPage   from './pages/jobs/JobDetailPage'
import LoginPage       from './pages/auth/LoginPage'
import RegisterPage    from './pages/auth/RegisterPage'

// Error pages
import ForbiddenPage from './pages/errors/ForbiddenPage'

// Protected / role pages
import CandidateDashboardPage from './pages/candidate/CandidateDashboardPage'
import CandidateProfilePage   from './pages/candidate/CandidateProfilePage'
import CandidateProfileEditPage from './pages/candidate/CandidateProfileEditPage'
import RecruiterDashboardPage from './pages/recruiter/RecruiterDashboardPage'
import RecruiterProfilePage from './pages/recruiter/RecruiterProfilePage'
import RecruiterProfileEditPage from './pages/recruiter/RecruiterProfileEditPage'
import RecruiterJobsPage from './pages/recruiter/RecruiterJobsPage'
import RecruiterJobCreatePage from './pages/recruiter/RecruiterJobCreatePage'
import RecruiterJobEditPage from './pages/recruiter/RecruiterJobEditPage'
import RecruiterJobDetailPage from './pages/recruiter/RecruiterJobDetailPage'
import RecruiterHeader from './components/recruiter/RecruiterHeader'
import AdminDashboardPage     from './pages/admin/AdminDashboardPage'

// Route guards
import ProtectedRoute from './routes/ProtectedRoute'
import RoleRoute      from './routes/RoleRoute'

// ─── Redirect auth pages when already logged in ───────────────────────────────
function RedirectIfAuthenticated({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading, user } = useAuth()
  if (loading) return null
  if (isAuthenticated && user) {
    const dest = user.role === 'CANDIDATE' ? '/candidate'
               : user.role === 'RECRUITER' ? '/recruiter'
               : '/admin'
    return <Navigate to={dest} replace />
  }
  return <>{children}</>
}

function RecruiterProfileLayout() {
  return <><RecruiterHeader /><Outlet /></>
}

function App() {
  return (
    <Routes>
      {/* ── Public routes with MainLayout ── */}
      <Route element={<MainLayout />}>
        <Route path="/"         element={<HomePage />} />
        <Route path="/jobs"     element={<JobListPage />} />
        <Route path="/jobs/:id" element={<JobDetailPage />} />
      </Route>

      {/* ── Auth pages (standalone, redirect if already logged in) ── */}
      <Route
        path="/login"
        element={
          <RedirectIfAuthenticated>
            <LoginPage />
          </RedirectIfAuthenticated>
        }
      />
      <Route
        path="/register"
        element={
          <RedirectIfAuthenticated>
            <RegisterPage />
          </RedirectIfAuthenticated>
        }
      />

      {/* ── Error pages ── */}
      <Route path="/403" element={<ForbiddenPage />} />

      {/* ── Protected: must be authenticated ── */}
      <Route element={<ProtectedRoute />}>
        {/* CANDIDATE routes */}
        <Route element={<RoleRoute allowedRoles={['CANDIDATE']} />}>
          <Route path="/candidate"              element={<CandidateDashboardPage />} />
          <Route path="/candidate/profile"      element={<CandidateProfilePage />} />
          <Route path="/candidate/profile/edit" element={<CandidateProfileEditPage />} />
        </Route>

        {/* RECRUITER dashboard */}
        <Route element={<RoleRoute allowedRoles={['RECRUITER']} />}>
          <Route path="/recruiter" element={<RecruiterDashboardPage />} />
          <Route element={<RecruiterProfileLayout />}>
            <Route path="/recruiter/profile" element={<RecruiterProfilePage />} />
          </Route>
          <Route path="/recruiter/profile/edit" element={<RecruiterProfileEditPage />} />
          <Route path="/recruiter/jobs" element={<RecruiterJobsPage />} />
          <Route path="/recruiter/jobs/create" element={<RecruiterJobCreatePage />} />
          <Route path="/recruiter/jobs/:id/edit" element={<RecruiterJobEditPage />} />
          <Route path="/recruiter/jobs/:id" element={<RecruiterJobDetailPage />} />
        </Route>

        {/* ADMIN dashboard */}
        <Route element={<RoleRoute allowedRoles={['ADMIN']} />}>
          <Route path="/admin" element={<AdminDashboardPage />} />
        </Route>
      </Route>

      {/* ── 404 fallback ── */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
