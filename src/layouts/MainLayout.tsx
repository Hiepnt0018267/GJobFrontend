import { Suspense } from 'react'
import { Outlet } from 'react-router-dom'
import CandidateRouteFallback from '../components/feedback/CandidateRouteFallback'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import CandidateNavigationFeedback from '../components/motion/CandidateNavigationFeedback'
import CandidateScrollManager from '../components/motion/CandidateScrollManager'
import PageTransition from '../components/motion/PageTransition'

export default function MainLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <CandidateNavigationFeedback />
      <CandidateScrollManager />
      <Header />
      <main className="relative flex-1">
        <PageTransition variant="candidate">
          <Suspense fallback={<CandidateRouteFallback />}>
            <Outlet />
          </Suspense>
        </PageTransition>
      </main>
      <Footer />
    </div>
  )
}
