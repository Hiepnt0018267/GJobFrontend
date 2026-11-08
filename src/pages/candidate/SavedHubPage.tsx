import { ArrowLeft, Bookmark, Building2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import FollowedCompaniesTab from '../../components/candidate/saved/FollowedCompaniesTab'
import SavedJobsTab from '../../components/candidate/saved/SavedJobsTab'
import { useAuth } from '../../hooks/useAuth'
import { useDataRefreshVersion } from '../../hooks/useDataRefreshVersion'
import { companyService } from '../../services/companyService'
import { savedJobService } from '../../services/savedJobService'

export type SavedTabKey = 'jobs' | 'companies'

export default function SavedHubPage() {
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const rawTab = searchParams.get('tab')
  const activeTab: SavedTabKey = rawTab === 'companies' ? 'companies' : 'jobs'

  const [visitedTabs, setVisitedTabs] = useState<Record<SavedTabKey, boolean>>(() => ({
    jobs: activeTab === 'jobs',
    companies: activeTab === 'companies',
  }))

  if (!visitedTabs[activeTab]) {
    setVisitedTabs((prev) => ({ ...prev, [activeTab]: true }))
  }

  const [jobsTotal, setJobsTotal] = useState<number | null>(null)
  const [companiesTotal, setCompaniesTotal] = useState<number | null>(null)
  const refreshVersion = useDataRefreshVersion()

  // Fetch initial totals so both tab badges display immediately without waiting for user to click each tab
  useEffect(() => {
    if (!user || user.role !== 'CANDIDATE') return
    const controller = new AbortController()

    savedJobService
      .getSavedJobs({ page: 1, page_size: 1 }, controller.signal)
      .then((res) => {
        if (!controller.signal.aborted && typeof res?.total === 'number') {
          setJobsTotal(res.total)
        }
      })
      .catch(() => {})

    companyService
      .getFollowedCompanies({ page: 1, page_size: 1 }, controller.signal)
      .then((res) => {
        if (!controller.signal.aborted && typeof res?.total === 'number') {
          setCompaniesTotal(res.total)
        }
      })
      .catch(() => {})

    return () => {
      controller.abort()
    }
  }, [user, refreshVersion])

  // Normalize URL if tab is missing or invalid, keeping any other search params intact
  useEffect(() => {
    if (rawTab !== 'jobs' && rawTab !== 'companies') {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          next.set('tab', 'jobs')
          return next
        },
        { replace: true }
      )
    }
  }, [rawTab, setSearchParams])

  const handleSelectTab = (nextTab: SavedTabKey) => {
    if (nextTab === activeTab) return
    setVisitedTabs((prev) => (prev[nextTab] ? prev : { ...prev, [nextTab]: true }))
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.set('tab', nextTab)
      return next
    })
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="border-b border-slate-200 pb-6">
        <div>
          <Link
            to="/jobs"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition-colors hover:text-[#49BBBD]"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            Tìm việc làm
          </Link>
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl font-[Plus_Jakarta_Sans,sans-serif]">
            Đã lưu
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Xem lại các việc làm và công ty bạn đang quan tâm để dễ dàng ứng tuyển hoặc theo dõi cơ hội mới.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mt-6 border-b border-slate-200">
          <nav className="-mb-px flex space-x-6" aria-label="Các mục đã lưu" role="tablist">
            <button
              type="button"
              role="tab"
              id="tab-jobs"
              aria-selected={activeTab === 'jobs'}
              aria-controls="panel-jobs"
              onClick={() => handleSelectTab('jobs')}
              className={`inline-flex items-center gap-2 border-b-2 py-3 px-1 text-sm font-semibold transition-colors ${
                activeTab === 'jobs'
                  ? 'border-[#49BBBD] text-[#15999B]'
                  : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
              }`}
            >
              <Bookmark size={17} aria-hidden="true" />
              <span>Việc làm đã lưu</span>
              {typeof jobsTotal === 'number' && (
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-bold tabular-nums ${
                    activeTab === 'jobs' ? 'bg-teal-50 text-[#15999B]' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {jobsTotal.toLocaleString('vi-VN')}
                </span>
              )}
            </button>

            <button
              type="button"
              role="tab"
              id="tab-companies"
              aria-selected={activeTab === 'companies'}
              aria-controls="panel-companies"
              onClick={() => handleSelectTab('companies')}
              className={`inline-flex items-center gap-2 border-b-2 py-3 px-1 text-sm font-semibold transition-colors ${
                activeTab === 'companies'
                  ? 'border-[#49BBBD] text-[#15999B]'
                  : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
              }`}
            >
              <Building2 size={17} aria-hidden="true" />
              <span>Công ty đã theo dõi</span>
              {typeof companiesTotal === 'number' && (
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-bold tabular-nums ${
                    activeTab === 'companies' ? 'bg-teal-50 text-[#15999B]' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {companiesTotal.toLocaleString('vi-VN')}
                </span>
              )}
            </button>
          </nav>
        </div>
      </header>

      {/* Tab Panels: both preserved in DOM once visited, retaining their independent state & cache */}
      <div
        role="tabpanel"
        id="panel-jobs"
        aria-labelledby="tab-jobs"
        tabIndex={0}
        className={activeTab === 'jobs' ? 'mt-6 block' : 'hidden'}
      >
        {visitedTabs.jobs && (
          <SavedJobsTab
            onTotalChange={setJobsTotal}
            userId={user?.id}
          />
        )}
      </div>

      <div
        role="tabpanel"
        id="panel-companies"
        aria-labelledby="tab-companies"
        tabIndex={0}
        className={activeTab === 'companies' ? 'mt-6 block' : 'hidden'}
      >
        {visitedTabs.companies && (
          <FollowedCompaniesTab
            onTotalChange={setCompaniesTotal}
            userId={user?.id}
          />
        )}
      </div>
    </main>
  )
}
