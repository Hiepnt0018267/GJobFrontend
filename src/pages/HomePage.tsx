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
  { icon: FileText, title: 'Phân tích CV Thông minh', description: 'Tự động nhận diện thế mạnh, từ khóa then chốt và các điểm cần bổ sung trong hồ sơ.' },
  { icon: CheckCircle2, title: 'Đối chiếu Mức độ Phù hợp', description: 'Đo lường độ khớp giữa năng lực của bạn với từng yêu cầu cụ thể của nhà tuyển dụng.' },
]

const RECRUITER_AI_FEATURES = [
  { icon: Sparkles, title: 'Sàng lọc Hồ sơ Định hướng', description: 'Hỗ trợ tìm kiếm và phân loại ứng viên tiềm năng nhanh chóng theo tiêu chí vị trí.' },
  { icon: Lightbulb, title: 'Báo cáo Khớp Năng lực', description: 'Làm rõ các kỹ năng trọng yếu đã khớp hoặc còn thiếu để hỗ trợ ra quyết định phỏng vấn.' },
]

function ctaFor(role: UserRole | undefined) {
  if (role === 'CANDIDATE')
    return {
      title: 'Sẵn sàng cho nấc thang sự nghiệp tiếp theo?',
      description: 'Hoàn thiện hồ sơ chuyên nghiệp và tiếp cận các vị trí công việc có mức đãi ngộ xứng đáng.',
      primary: { label: 'Tạo CV ngay', to: '/candidate/cvs/templates' },
      secondary: { label: 'Khám phá việc làm', to: '/jobs' },
    }
  if (role === 'RECRUITER')
    return {
      title: 'Xây dựng đội ngũ nhân sự xuất sắc cùng GJob',
      description: 'Đăng tin tuyển dụng nhanh chóng và tiếp cận nguồn ứng viên chất lượng cao trong hệ sinh thái.',
      primary: { label: 'Vào Dashboard tuyển dụng', to: '/recruiter' },
      secondary: { label: 'Đăng tin tuyển dụng', to: '/recruiter/jobs/create' },
    }
  if (role === 'ADMIN')
    return {
      title: 'Trung tâm Quản trị Hệ thống GJob',
      description: 'Quản lý người dùng, duyệt tin tuyển dụng và theo dõi các chỉ số hoạt động toàn diện.',
      primary: { label: 'Trang quản trị', to: '/admin' },
      secondary: { label: 'Danh sách việc làm', to: '/jobs' },
    }
  return {
    title: 'Bắt đầu hành trình sự nghiệp cùng GJob ngay hôm nay',
    description: 'Khám phá hàng nghìn cơ hội việc làm hấp dẫn hoặc tạo tài khoản miễn phí để kết nối cùng nhà tuyển dụng.',
    primary: { label: 'Tìm việc ngay', to: '/jobs' },
    secondary: { label: 'Đăng ký tài khoản', to: '/register' },
  }
}

function FeaturedJobsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true" aria-label="Đang tải danh sách việc làm">
      {Array.from({ length: 6 }, (_, index) => (
        <div key={index} className="flex h-64 flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="skeleton-shimmer h-12 w-12 rounded-xl" />
              <div className="min-w-0 flex-1 space-y-2">
                <div className="skeleton-shimmer h-5 w-3/4 rounded-md" />
                <div className="skeleton-shimmer h-3.5 w-1/2 rounded-md" />
              </div>
            </div>
            <div className="skeleton-shimmer mt-4 h-6 w-32 rounded-md" />
            <div className="flex gap-2 pt-2">
              <div className="skeleton-shimmer h-5 w-20 rounded-md" />
              <div className="skeleton-shimmer h-5 w-16 rounded-md" />
            </div>
          </div>
          <div className="flex items-center justify-between border-t border-slate-100 pt-3">
            <div className="skeleton-shimmer h-4 w-24 rounded-md" />
            <div className="skeleton-shimmer h-4 w-20 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  )
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
      .then((response) => {
        if (active) setFeaturedJobs(response.items)
      })
      .catch(() => {
        if (active) setFeaturedError(true)
      })
      .finally(() => {
        if (active) setFeaturedLoading(false)
      })
    return () => {
      active = false
    }
  }, [featuredRequest, refreshVersion])

  function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const params = new URLSearchParams()
    if (keyword.trim()) params.set('search', keyword.trim())
    if (location.trim()) params.set('location', location.trim())
    navigate(params.size ? `/jobs?${params.toString()}` : '/jobs')
  }

  const finalCta = ctaFor(user?.role)
  const aiCta =
    user?.role === 'RECRUITER'
      ? { label: 'Vào Dashboard tuyển dụng', to: '/recruiter' }
      : user?.role === 'CANDIDATE'
        ? { label: 'Khám phá việc làm', to: '/jobs' }
        : user?.role === 'ADMIN'
          ? { label: 'Trang quản trị', to: '/admin' }
          : { label: 'Bắt đầu với GJob', to: '/register' }

  const featuredContent = (() => {
    if (featuredLoading) return <FeaturedJobsSkeleton />

    if (featuredError) {
      return (
        <div role="alert" className="rounded-2xl border border-slate-200/80 bg-white p-8 text-center shadow-xs">
          <AlertCircle className="mx-auto text-rose-500" size={32} />
          <h3 className="mt-4 text-base font-bold text-slate-900">Chưa thể tải danh sách việc làm mới nhất</h3>
          <p className="mt-2 text-sm text-slate-500">Vui lòng kiểm tra kết nối mạng và thử lại.</p>
          <button
            type="button"
            onClick={() => setFeaturedRequest((value) => value + 1)}
            className="btn-press mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-blue-700"
          >
            <RefreshCw size={15} />
            Thử lại
          </button>
        </div>
      )
    }

    if (featuredJobs.length === 0) {
      return (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-10 text-center shadow-xs">
          <BriefcaseBusiness className="mx-auto text-blue-600" size={34} />
          <h3 className="mt-4 text-base font-bold text-slate-900">Chưa có việc làm để hiển thị</h3>
          <p className="mt-2 text-sm text-slate-500">Hãy quay lại sau hoặc khám phá toàn bộ danh sách việc làm có sẵn.</p>
          <Link
            to="/jobs"
            className="btn-press mt-5 inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700"
          >
            Khám phá tất cả việc làm <ArrowRight size={16} />
          </Link>
        </div>
      )
    }

    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {featuredJobs.map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
      </div>
    )
  })()

  return (
    <div className="min-h-screen bg-slate-50/40">
      {authLoading ? (
        <section className="bg-slate-950 py-20 sm:py-28" aria-label="Đang tải trang chủ">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto h-12 w-72 max-w-full animate-pulse rounded-xl bg-slate-800" />
            <div className="mx-auto mt-6 h-6 w-full max-w-2xl animate-pulse rounded-lg bg-slate-800" />
            <div className="mx-auto mt-10 h-14 w-full max-w-3xl animate-pulse rounded-2xl bg-slate-800" />
          </div>
        </section>
      ) : (
        <PersonalizedHomeHero
          user={user}
          keyword={keyword}
          location={location}
          onKeywordChange={setKeyword}
          onLocationChange={setLocation}
          onSearch={handleSearch}
        />
      )}

      {/* Categories Section */}
      <section className="py-20 lg:py-24" aria-labelledby="categories-heading">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 id="categories-heading" className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
              Khám phá theo nhóm ngành
            </h2>
            <p className="mt-3 text-base text-slate-600">
              Tìm hiểu các lĩnh vực đang có nhu cầu tuyển dụng sôi động nhất tại GJob.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {MOCK_CATEGORIES.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Jobs Section */}
      <section className="border-y border-slate-200/60 bg-white/70 py-20 backdrop-blur-xs lg:py-24" aria-labelledby="jobs-heading">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h2 id="jobs-heading" className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
                Cơ hội việc làm mới nhất
              </h2>
              <p className="mt-2 text-base text-slate-600">
                Những vị trí vừa được cập nhật trực tiếp từ mạng lưới doanh nghiệp đối tác.
              </p>
            </div>
            <Link
              to="/jobs"
              className="btn-press inline-flex shrink-0 items-center gap-1.5 text-sm font-bold text-blue-600 transition-colors hover:text-blue-700"
            >
              Xem tất cả việc làm <ArrowRight size={16} />
            </Link>
          </div>
          {featuredContent}
        </div>
      </section>

      {/* Featured Companies Section */}
      <section className="py-20 lg:py-24" aria-labelledby="companies-heading">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 id="companies-heading" className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
              Doanh nghiệp tiêu biểu
            </h2>
            <p className="mt-3 text-base text-slate-600">
              Kết nối cùng những môi trường làm việc chuyên nghiệp hàng đầu.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {MOCK_COMPANIES.map((company) => (
              <CompanyCard key={company.id} company={company} />
            ))}
          </div>
        </div>
      </section>

      {/* AI Bento Box Section */}
      <section className="py-20 lg:py-24" aria-labelledby="ai-heading">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-8 shadow-2xl sm:p-12 lg:p-16">
            {/* Ambient glows inside bento box */}
            <div
              className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-indigo-500/15 blur-3xl"
              aria-hidden="true"
            />
            <div
              className="pointer-events-none absolute -bottom-20 left-10 h-72 w-72 rounded-full bg-blue-500/15 blur-3xl"
              aria-hidden="true"
            />

            <div className="relative grid gap-12 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3.5 py-1 text-xs font-semibold text-indigo-300">
                  <Sparkles size={13} className="text-indigo-400" />
                  GJob AI Platform
                </span>
                <h2 id="ai-heading" className="mt-4 text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl">
                  AI đồng hành cùng quá trình tuyển dụng
                </h2>
                <p className="mt-5 text-base leading-relaxed text-slate-300">
                  Các mô hình trợ lý AI đang được phát triển trong GJob để hỗ trợ ứng viên tối ưu hóa hồ sơ và giúp nhà
                  tuyển dụng sàng lọc ứng viên phù hợp với tốc độ vượt trội.
                </p>
                <Link
                  to={aiCta.to}
                  className="btn-press mt-8 inline-flex items-center gap-2 text-sm font-bold text-blue-400 transition-colors hover:text-blue-300"
                >
                  {aiCta.label} <ArrowRight size={16} />
                </Link>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-colors hover:border-white/20">
                  <h3 className="text-base font-bold text-white">Dành cho Ứng viên</h3>
                  <ul className="mt-6 space-y-5">
                    {CANDIDATE_AI_FEATURES.map(({ icon: Icon, title, description }) => (
                      <li key={title} className="flex gap-3.5">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/15 text-blue-400">
                          <Icon size={16} />
                        </span>
                        <div>
                          <p className="text-sm font-bold text-white">{title}</p>
                          <p className="mt-1 text-xs leading-relaxed text-slate-400">{description}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-colors hover:border-white/20">
                  <h3 className="text-base font-bold text-white">Dành cho Nhà tuyển dụng</h3>
                  <ul className="mt-6 space-y-5">
                    {RECRUITER_AI_FEATURES.map(({ icon: Icon, title, description }) => (
                      <li key={title} className="flex gap-3.5">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-500/15 text-indigo-400">
                          <Icon size={16} />
                        </span>
                        <div>
                          <p className="text-sm font-bold text-white">{title}</p>
                          <p className="mt-1 text-xs leading-relaxed text-slate-400">{description}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final Action CTA Section */}
      {!authLoading && (
        <section className="pb-20 lg:pb-24" aria-labelledby="cta-heading">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 px-6 py-16 text-center text-white shadow-xl sm:px-12 lg:py-20">
              <div
                className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-2xl"
                aria-hidden="true"
              />
              <div className="relative mx-auto max-w-3xl">
                <h2 id="cta-heading" className="text-2xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl">
                  {finalCta.title}
                </h2>
                <p className="mt-4 text-base leading-relaxed text-blue-100 sm:text-lg">
                  {finalCta.description}
                </p>
                <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                  <Link
                    to={finalCta.primary.to}
                    className="btn-press inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 text-sm font-bold text-blue-900 shadow-md transition-colors hover:bg-blue-50"
                  >
                    {finalCta.primary.label} <ArrowRight size={17} />
                  </Link>
                  <Link
                    to={finalCta.secondary.to}
                    className="btn-press inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-7 py-3.5 text-sm font-bold text-white backdrop-blur-sm transition-colors hover:bg-white/20"
                  >
                    {finalCta.secondary.label}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
