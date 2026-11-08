import { Suspense, useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import CandidateRouteFallback from '../components/feedback/CandidateRouteFallback'
import FeedbackIntentModal from '../components/feedback/FeedbackIntentModal'
import FeedbackModal from '../components/feedback/FeedbackModal'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import CandidateQuickDock from '../components/navigation/CandidateQuickDock'
import CandidateNavigationFeedback from '../components/motion/CandidateNavigationFeedback'
import CandidateScrollManager from '../components/motion/CandidateScrollManager'
import PageTransition from '../components/motion/PageTransition'

export default function MainLayout() {
  const { pathname } = useLocation()
  const isCVEditor = pathname === '/candidate/cvs/create' || /^\/candidate\/cvs\/[^/]+\/edit$/.test(pathname)
  const [intentOpen, setIntentOpen] = useState(false)
  const [feedbackOpen, setFeedbackOpen] = useState(false)

  useEffect(() => {
    const handleOpenFeedback = () => setIntentOpen(true)
    window.addEventListener('gjob:open-feedback', handleOpenFeedback)
    return () => window.removeEventListener('gjob:open-feedback', handleOpenFeedback)
  }, [])

  return (
    <div className={isCVEditor ? 'flex h-dvh flex-col overflow-hidden' : 'flex min-h-screen flex-col'}>
      <CandidateNavigationFeedback />
      <CandidateScrollManager />
      <Header />
      <main className={`relative flex-1 ${isCVEditor ? 'min-h-0 overflow-hidden' : ''}`}>
        <PageTransition variant="candidate" className={isCVEditor ? 'h-full' : ''}>
          <Suspense fallback={<CandidateRouteFallback />}>
            <Outlet />
          </Suspense>
        </PageTransition>
      </main>
      {!isCVEditor && <Footer />}
      {!isCVEditor && <CandidateQuickDock />}
      <FeedbackIntentModal
        open={intentOpen}
        onClose={() => setIntentOpen(false)}
        onSelectFeedback={() => setFeedbackOpen(true)}
      />
      <FeedbackModal open={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
    </div>
  )
}
