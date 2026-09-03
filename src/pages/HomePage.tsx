import { useEffect, useState } from 'react'
import { AlertCircle, ArrowRight, BriefcaseBusiness, CheckCircle2, FileText, Lightbulb, RefreshCw, Sparkles } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import CategoryCard from '../components/home/CategoryCard'
import CompanyCard from '../components/home/CompanyCard'
import PersonalizedHomeHero from '../components/home/PersonalizedHomeHero'
import JobCard from '../components/job/JobCard'
import { useAuth } from '../hooks/useAuth'
import { useDataRefreshVersion } from '../hooks/useDataRefreshVersion'
import { MOCK_CATEGORIES, MOCK_COMPANIES } from '../data/mockData'
import { jobService } from '../services/jobService'
import type { UserRole } from '../types/auth'
import type { Job } from '../types/job'

const FEATURED_PAGE_SIZE = 6

const CANDIDATE_AI_FEATURES = [
  { icon: FileText, title: 'Phân tích CV', description: 'Nhận diện điểm mạnh và khoảng cần bổ sung trong hồ sơ.' },
  { icon: CheckCircle2, title: 'Đối chiếu với vị trí', description: 'Hiểu rõ kỹ năng phù hợp và những điểm cần phát triển.' },
]

const RECRUITER_AI_FEATURES = [
  { icon: Sparkles, title: 'Sàng lọc có định hướng', description: 'Hỗ trợ tìm ứng viên phù hợp nhanh hơn theo yêu cầu vị trí.' },
  { icon: Lightbulb, title: 'Giải thích mức độ phù hợp', description: 'Làm rõ kỹ năng khớp hoặc còn thiếu để ra quyết định tự tin hơn.' },
]

function ctaFor(role: UserRole | undefined) {
  if (role === 'CANDIDATE') return { title: 'Sẵn sàng cho cơ hội tiếp theo?', description: 'Tiếp tục khám phá những vị trí phù hợp với hành trình của bạn.', primary: { label: 'Vào Dashboard', to: '/candidate' }, secondary: { label: 'Tìm việc', to: '/jobs' } }
  if (role === 'RECRUITER') return { title: 'Xây dựng đội ngũ cùng GJob', description: 'Quay lại khu vực tuyển dụng để đăng tin và quản lý các vị trí của bạn.', primary: { label: 'Vào Dashboard tuyển dụng', to: '/recruiter' }, secondary: { label: 'Đăng tin tuyển dụng', to: '/recruiter/jobs/create' } }
  if (role === 'ADMIN') return { title: 'Quay lại khu vực quản trị', description: 'Các công cụ quản trị của bạn vẫn sẵn sàng trong workspace.', primary: { label: 'Trang quản trị', to: '/admin' }, secondary: { label: 'Khám phá việc làm', to: '/jobs' } }
  return { title: 'Bắt đầu hành trình cùng GJob', description: 'Khám phá cơ hội phù hợp hoặc tạo tài khoản để bắt đầu hành trình của bạn.', primary: { label: 'Tìm việc ngay', to: '/jobs' }, secondary: { label: 'Đăng ký', to: '/register' } }
}

function FeaturedJobsSkeleton() {
  return <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 6 }, (_, index) => <div key={index} className="h-72 animate-pulse rounded-2xl bg-slate-200" />)}</div>
}

export default function HomePage() {
  const { user, loading: authLoading } = useAuth()
  const refreshVersion = useDataRefreshVersion()
  const navigate = useNavigate()
  const [keyword, setKeyword] = useState('')
  const [location, setLocation] = useState('')
  const [featuredJobs, setFeaturedJobs] = useState<Job[]>([])
  const [featuredLoading, setFeaturedLoading] = useState(true)
  const [featuredError, setFeaturedError] = useState(false)
  const [featuredRequest, setFeaturedRequest] = useState(0)

  useEffect(() => {
    let active = true
    Promise.resolve()
      .then(() => {
        if (active) {
          setFeaturedLoading(true)
          setFeaturedError(false)
        }
        return jobService.getJobs({ page: 1, page_size: FEATURED_PAGE_SIZE, sort: 'newest' })
      })
      .then((response) => { if (active) setFeaturedJobs(response.items) })
      .catch(() => { if (active) setFeaturedError(true) })
      .finally(() => { if (active) setFeaturedLoading(false) })
    return () => { active = false }
  }, [featuredRequest, refreshVersion])

  function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const params = new URLSearchParams()
    if (keyword.trim()) params.set('keyword', keyword.trim())
    if (location.trim()) params.set('location', location.trim())
    navigate(params.size ? `/jobs?${params.toString()}` : '/jobs')
  }

  const finalCta = ctaFor(user?.role)
  const aiCta = user?.role === 'RECRUITER'
    ? { label: 'Vào Dashboard tuyển dụng', to: '/recruiter' }
    : user?.role === 'CANDIDATE'
      ? { label: 'Khám phá việc làm', to: '/jobs' }
      : user?.role === 'ADMIN'
        ? { label: 'Trang quản trị', to: '/admin' }
        : { label: 'Bắt đầu với GJob', to: '/register' }
  const featuredContent = (() => {
    if (featuredLoading) return <FeaturedJobsSkeleton />

    if (featuredError) {
      return <div role="alert" className="rounded-2xl bg-white p-8 text-center ring-1 ring-slate-200">
        <AlertCircle className="mx-auto text-red-500" size={32} />
        <h3 className="mt-4 text-lg font-bold text-slate-900">Chưa thể tải việc làm mới nhất</h3>
        <p className="mt-2 text-sm text-slate-500">Vui lòng kiểm tra kết nối và thử lại.</p>
        <button type="button" onClick={() => setFeaturedRequest((value) => value + 1)} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"><RefreshCw size={16} />Thử lại</button>
      </div>
    }

    if (featuredJobs.length === 0) {
      return <div className="rounded-2xl bg-white p-10 text-center ring-1 ring-slate-200">
        <BriefcaseBusiness className="mx-auto text-blue-600" size={32} />
        <h3 className="mt-4 text-lg font-bold text-slate-900">Chưa có việc làm để hiển thị</h3>
        <p className="mt-2 text-sm text-slate-500">Hãy quay lại sau hoặc khám phá toàn bộ danh sách việc làm.</p>
        <Link to="/jobs" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700">Khám phá việc làm <ArrowRight size={16} /></Link>
      </div>
    }

    return <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">{featuredJobs.map((job) => <JobCard key={job.id} job={job} />)}</div>
  })()

  return (
    <div className="overflow-x-hidden">
      {authLoading ? <section className="bg-slate-900 py-20 sm:py-28" aria-label="Đang tải trang chủ"><div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"><div className="mx-auto h-12 w-72 max-w-full animate-pulse rounded-xl bg-slate-800" /><div className="mx-auto mt-6 h-6 w-full max-w-2xl animate-pulse rounded-lg bg-slate-800" /><div className="mx-auto mt-10 h-14 w-full max-w-3xl animate-pulse rounded-2xl bg-slate-800" /></div></section> : <PersonalizedHomeHero user={user} keyword={keyword} location={location} onKeywordChange={setKeyword} onLocationChange={setLocation} onSearch={handleSearch} />}

      <section className="bg-white py-20" aria-labelledby="categories-heading"><div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"><div className="mb-12 text-center"><h2 id="categories-heading" className="text-3xl font-bold text-slate-900">Khám phá theo nhóm ngành</h2><p className="mt-3 text-slate-500">Bắt đầu tìm hiểu các lĩnh vực đang có cơ hội tại GJob.</p></div><div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">{MOCK_CATEGORIES.map((category) => <CategoryCard key={category.id} category={category} />)}</div></div></section>

      <section className="bg-slate-50 py-20" aria-labelledby="jobs-heading">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h2 id="jobs-heading" className="text-3xl font-bold text-slate-900">Việc làm mới nhất</h2>
              <p className="mt-3 text-slate-500">Những cơ hội vừa được cập nhật từ hệ thống GJob.</p>
            </div>
            <Link to="/jobs" className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-blue-600 transition-colors hover:text-blue-700">Xem tất cả việc làm <ArrowRight size={16} /></Link>
          </div>
          {featuredContent}
        </div>
      </section>

      <section className="bg-white py-20" aria-labelledby="companies-heading"><div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"><div className="mb-12 text-center"><h2 id="companies-heading" className="text-3xl font-bold text-slate-900">Khám phá doanh nghiệp</h2><p className="mt-3 text-slate-500">Một số doanh nghiệp được giới thiệu trên GJob.</p></div><div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">{MOCK_COMPANIES.map((company) => <CompanyCard key={company.id} company={company} />)}</div></div></section>

      <section className="bg-slate-900 py-20 text-white" aria-labelledby="ai-heading"><div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:px-8"><div><h2 id="ai-heading" className="text-3xl font-bold leading-tight sm:text-4xl">AI đồng hành cùng quá trình tuyển dụng</h2><p className="mt-5 max-w-xl text-lg leading-8 text-slate-300">Các trợ lý AI đang được phát triển trong GJob để hỗ trợ ứng viên và nhà tuyển dụng ra quyết định rõ ràng hơn.</p><Link to={aiCta.to} className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-blue-300 transition-colors hover:text-blue-200">{aiCta.label} <ArrowRight size={16} /></Link></div><div className="grid gap-6 sm:grid-cols-2"><section className="rounded-2xl border border-slate-700 bg-slate-800/60 p-6"><h3 className="text-lg font-bold text-white">Dành cho ứng viên</h3><ul className="mt-6 space-y-5">{CANDIDATE_AI_FEATURES.map(({ icon: Icon, title, description }) => <li key={title} className="flex gap-3"><Icon size={19} className="mt-0.5 shrink-0 text-blue-300" /><div><p className="font-semibold text-slate-100">{title}</p><p className="mt-1 text-sm leading-6 text-slate-300">{description}</p></div></li>)}</ul></section><section className="rounded-2xl border border-slate-700 bg-slate-800/60 p-6"><h3 className="text-lg font-bold text-white">Dành cho nhà tuyển dụng</h3><ul className="mt-6 space-y-5">{RECRUITER_AI_FEATURES.map(({ icon: Icon, title, description }) => <li key={title} className="flex gap-3"><Icon size={19} className="mt-0.5 shrink-0 text-blue-300" /><div><p className="font-semibold text-slate-100">{title}</p><p className="mt-1 text-sm leading-6 text-slate-300">{description}</p></div></li>)}</ul></section></div></div></section>

      {/* impeccable-disable-next-line gray-on-color: sibling CTA variants are independently colored in one JSX expression. */}
      {!authLoading && <section className="bg-blue-600 py-20 text-white" aria-labelledby="cta-heading"><div className="mx-auto max-w-3xl px-4 text-center sm:px-6"><h2 id="cta-heading" className="text-3xl font-bold leading-tight sm:text-4xl">{finalCta.title}</h2><p className="mt-4 text-lg text-blue-100">{finalCta.description}</p><div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"><Link to={finalCta.primary.to} className="inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 text-sm font-semibold text-blue-700 transition-colors hover:bg-blue-50">{finalCta.primary.label} <ArrowRight size={18} /></Link><Link to={finalCta.secondary.to} className="inline-flex items-center gap-2 rounded-xl border border-blue-400 bg-blue-700 px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-blue-800">{finalCta.secondary.label}</Link></div></div></section>}
    </div>
  )
}
