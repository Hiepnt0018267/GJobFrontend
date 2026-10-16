import { useEffect, useState } from 'react'
import {
  AlertCircle, ArrowRight, ArrowUpRight, Award, Briefcase,
  BriefcaseBusiness, Building2, Clock, FileText,
  RefreshCw, ShieldCheck, Sparkles, Star, TrendingUp, Users
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import CategoryCard from '../components/home/CategoryCard'
import CompanyMarquee from '../components/home/CompanyMarquee'
import PersonalizedHomeHero from '../components/home/PersonalizedHomeHero'
import JobCard from '../components/job/JobCard'
import ScrollProgress from '../components/motion/ScrollProgress'
import ScrollReveal from '../components/motion/ScrollReveal'
import TiltCard from '../components/motion/TiltCard'
import SpotlightGrid from '../components/motion/SpotlightGrid'
import { useAuth } from '../hooks/useAuth'
import { useDataRefreshVersion } from '../hooks/useDataRefreshVersion'
import { MOCK_CATEGORIES, MOCK_COMPANIES } from '../data/mockData'
import { jobService } from '../services/jobService'
import type { UserRole } from '../types/auth'
import type { Job } from '../types/job'

const FEATURED_PAGE_SIZE = 6

const CORE_FEATURES = [
  {
    icon: FileText,
    badge: 'Công nghệ AI',
    badgeColor: 'bg-teal-100 text-[#49BBBD]',
    title: 'Phân tích & Tối ưu CV',
    description: 'Hệ thống AI tự động phát hiện thế mạnh, từ khóa then chốt và đề xuất cải thiện hồ sơ theo tiêu chuẩn ATS quốc tế.',
    to: '/candidate/cvs/templates',
    actionLabel: 'Tạo CV ngay',
  },
  {
    icon: Sparkles,
    badge: 'Thông minh',
    badgeColor: 'bg-sky-100 text-sky-800',
    title: 'Khớp năng lực chuẩn xác',
    description: 'Đo lường độ tương thích giữa kinh nghiệm của bạn và từng tiêu chí tuyển dụng cụ thể để tăng tỷ lệ được mời phỏng vấn.',
    to: '/jobs',
    actionLabel: 'Khám phá việc làm',
  },
  {
    icon: Building2,
    badge: 'Trực tiếp',
    badgeColor: 'bg-amber-100 text-amber-800',
    title: 'Kết nối Nhà tuyển dụng',
    description: 'Trao đổi trực tiếp với nhà tuyển dụng, theo dõi tiến độ xử lý hồ sơ minh bạch theo thời gian thực.',
    to: '/jobs',
    actionLabel: 'Xem doanh nghiệp',
  },
]

const STATS_DATA = [
  { value: '10,000+', label: 'Việc làm xác thực', icon: Briefcase, color: 'text-[#49BBBD]' },
  { value: '2,500+', label: 'Doanh nghiệp đối tác', icon: Building2, color: 'text-sky-600' },
  { value: '98%', label: 'Tỷ lệ phản hồi', icon: TrendingUp, color: 'text-[#49BBBD]' },
  { value: '50,000+', label: 'Ứng viên tin cậy', icon: Users, color: 'text-amber-600' },
]

const MOCK_INSIGHTS = [
  {
    id: 1,
    title: 'Bí quyết viết CV ngành Công nghệ thông tin chinh phục nhà tuyển dụng 2026',
    category: 'Cẩm nang nghề nghiệp',
    readTime: '5 phút đọc',
    date: '12/10/2026',
    image: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=800&q=80',
    featured: true,
  },
  {
    id: 2,
    title: 'Top 7 kỹ năng mềm được săn đón nhất trong các buổi phỏng vấn vị trí Senior',
    category: 'Kỹ năng phỏng vấn',
    readTime: '4 phút đọc',
    date: '10/10/2026',
    image: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=400&q=80',
    featured: false,
  },
  {
    id: 3,
    title: 'Xu hướng làm việc Remote và Hybrid tại Việt Nam: Cơ hội và thách thức mới',
    category: 'Thị trường lao động',
    readTime: '6 phút đọc',
    date: '08/10/2026',
    image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=400&q=80',
    featured: false,
  },
  {
    id: 4,
    title: 'Làm thế nào để đàm phán mức lương xứng đáng với năng lực chuyên môn?',
    category: 'Lương & Đãi ngộ',
    readTime: '4 phút đọc',
    date: '05/10/2026',
    image: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=400&q=80',
    featured: false,
  },
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
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true" aria-label="Đang tải danh sách việc làm">
      {Array.from({ length: 6 }, (_, index) => (
        <div key={index} className="flex h-72 flex-col justify-between rounded-3xl border border-slate-100 bg-white p-6 shadow-xs">
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="skeleton-shimmer h-14 w-14 rounded-2xl" />
              <div className="min-w-0 flex-1 space-y-2">
                <div className="skeleton-shimmer h-5 w-3/4 rounded-md" />
                <div className="skeleton-shimmer h-4 w-1/2 rounded-md" />
              </div>
            </div>
            <div className="skeleton-shimmer mt-4 h-6 w-36 rounded-full" />
            <div className="flex gap-2 pt-2">
              <div className="skeleton-shimmer h-5 w-20 rounded-md" />
              <div className="skeleton-shimmer h-5 w-16 rounded-md" />
            </div>
          </div>
          <div className="flex items-center justify-between border-t border-slate-100 pt-4">
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

  const featuredContent = (() => {
    if (featuredLoading) return <FeaturedJobsSkeleton />

    if (featuredError) {
      return (
        <div role="alert" className="rounded-3xl border border-slate-200/80 bg-white p-10 text-center shadow-xs">
          <AlertCircle className="mx-auto text-rose-500" size={36} />
          <h3 className="mt-4 text-lg font-bold text-slate-900">Chưa thể tải danh sách việc làm mới nhất</h3>
          <p className="mt-2 text-sm text-slate-500">Vui lòng kiểm tra kết nối mạng và thử lại.</p>
          <button
            type="button"
            onClick={() => setFeaturedRequest((value) => value + 1)}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#49BBBD] px-6 py-3 text-sm font-bold text-white shadow-md hover:bg-[#49BBBD]/90 transition-all"
          >
            <RefreshCw size={16} />
            Thử lại
          </button>
        </div>
      )
    }

    if (featuredJobs.length === 0) {
      return (
        <div className="rounded-3xl border border-slate-200/80 bg-white p-12 text-center shadow-xs">
          <BriefcaseBusiness className="mx-auto text-[#49BBBD]" size={40} />
          <h3 className="mt-4 text-lg font-bold text-slate-900">Chưa có việc làm để hiển thị</h3>
          <p className="mt-2 text-sm text-slate-500">Hãy quay lại sau hoặc khám phá toàn bộ danh sách việc làm có sẵn.</p>
          <Link
            to="/jobs"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#49BBBD] px-6 py-3 text-sm font-bold text-white shadow-md hover:bg-[#49BBBD]/90 transition-all"
          >
            Khám phá tất cả việc làm <ArrowRight size={16} />
          </Link>
        </div>
      )
    }

    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {featuredJobs.map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
      </div>
    )
  })()

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* ── Top Scroll Reading Progress Bar ── */}
      <ScrollProgress />

      {/* ── 1. Hero Section (Curved Wave Banner & Floating Search Bar) ── */}
      <PersonalizedHomeHero
        user={user}
        keyword={keyword}
        location={location}
        onKeywordChange={setKeyword}
        onLocationChange={setLocation}
        onSearch={handleSearch}
      />

      {/* ── 2. Success in Numbers (Counters Row) ── */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal delayMs={100}>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:gap-6">
              {STATS_DATA.map((item, idx) => {
                const Icon = item.icon
                return (
                  <div
                    key={idx}
                    className="flex flex-col items-center justify-center p-6 sm:p-8 rounded-3xl bg-white border border-slate-100 shadow-sm text-center hover:shadow-md hover:-translate-y-1 transition-all duration-300"
                  >
                    <div className={`p-3 rounded-2xl bg-slate-50 ${item.color} mb-3 transition-transform group-hover:scale-110`}>
                      <Icon size={24} />
                    </div>
                    <p className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                      {item.value}
                    </p>
                    <p className="mt-1 text-xs sm:text-sm font-semibold text-slate-500">
                      {item.label}
                    </p>
                  </div>
                )
              })}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── 3. Core Features Section (Figma 3-Card Architecture with Spotlight) ── */}
      <section id="how-it-works" className="py-16 sm:py-20 bg-white border-y border-slate-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal delayMs={50}>
            <div className="text-center max-w-2xl mx-auto mb-14">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-[#49BBBD] text-xs font-bold uppercase tracking-wider mb-3">
                <Sparkles size={14} /> Quy trình tuyển dụng thông minh
              </span>
              <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900">
                Giải pháp toàn diện cho sự nghiệp của bạn
              </h2>
              <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
                Tối ưu hóa từng bước từ tạo hồ sơ, đối chiếu năng lực đến kết nối phỏng vấn với các nhà tuyển dụng hàng đầu.
              </p>
            </div>
          </ScrollReveal>

          <SpotlightGrid className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {CORE_FEATURES.map((feature, idx) => {
              const Icon = feature.icon
              return (
                <ScrollReveal key={idx} delayMs={100 + idx * 80}>
                  <div
                    className="group relative flex flex-col justify-between p-8 rounded-3xl bg-slate-50/70 border border-slate-200/80 hover:border-teal-300 hover:bg-white hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 min-h-[340px]"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-6">
                        <div className="w-14 h-14 rounded-2xl bg-[#49BBBD] text-white flex items-center justify-center shadow-md shadow-[#49BBBD]/20 group-hover:scale-110 transition-transform">
                          <Icon size={26} />
                        </div>
                        <span className={`text-[11px] font-bold px-3 py-1 rounded-full ${feature.badgeColor}`}>
                          {feature.badge}
                        </span>
                      </div>

                      <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-[#49BBBD] transition-colors">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-200/60">
                      <Link
                        to={feature.to}
                        className="inline-flex items-center gap-2 text-sm font-bold text-[#49BBBD] hover:text-[#49BBBD] transition-colors"
                      >
                        <span>{feature.actionLabel}</span>
                        <ArrowRight size={16} className="group-hover:translate-x-1.5 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </ScrollReveal>
              )
            })}
          </SpotlightGrid>
        </div>
      </section>

      {/* ── 4. Persona Showcase (Interactive 3D Tilt Cards) ── */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal delayMs={100}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

              {/* Card 1: Dành cho Ứng viên with 3D Tilt */}
              <TiltCard maxTilt={5} glare={true} className="rounded-3xl sm:rounded-[36px]">
                <div
                  className="relative overflow-hidden rounded-3xl sm:rounded-[36px] text-white p-8 sm:p-12 flex flex-col justify-between min-h-[380px] shadow-xl group"
                  style={{
                    background: 'linear-gradient(135deg, rgba(73, 187, 189, 0.94) 0%, rgba(42, 130, 132, 0.96) 100%)',
                  }}
                >
                  <img
                    src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1000&q=80"
                    alt="Dành cho ứng viên"
                    className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-30 group-hover:scale-105 transition-transform duration-700 pointer-events-none"
                  />
                  <div className="pointer-events-none absolute -right-12 -top-12 h-56 w-56 rounded-full bg-white/15 blur-2xl" />

                  <div className="relative z-10">
                    <span className="inline-block px-3.5 py-1 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-wider mb-4 border border-white/30 backdrop-blur-md">
                      Dành cho Ứng viên
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-black text-white leading-snug">
                      Tìm kiếm cơ hội việc làm & Xây dựng hồ sơ chuẩn mực
                    </h3>
                    <p className="mt-3 text-sm sm:text-base text-teal-50/95 max-w-md leading-relaxed">
                      Tạo CV chuẩn ATS, đối chiếu năng lực với các vị trí tuyển dụng thực tế và nhận thông báo khi có việc làm phù hợp.
                    </p>
                  </div>

                  <div className="relative z-10 mt-8">
                    <Link
                      to="/jobs"
                      className="btn-press group inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-white hover:bg-teal-50 text-[#49BBBD] font-bold text-sm shadow-xl active:scale-95 transition-all"
                    >
                      <span>Khám phá việc làm ngay</span>
                      <ArrowRight size={17} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </TiltCard>

              {/* Card 2: Dành cho Nhà tuyển dụng with 3D Tilt */}
              <TiltCard maxTilt={5} glare={true} className="rounded-3xl sm:rounded-[36px]">
                <div
                  className="relative overflow-hidden rounded-3xl sm:rounded-[36px] text-white p-8 sm:p-12 flex flex-col justify-between min-h-[380px] shadow-xl group"
                  style={{
                    background: 'linear-gradient(135deg, rgba(46, 141, 143, 0.94) 0%, rgba(28, 92, 94, 0.96) 100%)',
                  }}
                >
                  <img
                    src="https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1000&q=80"
                    alt="Dành cho nhà tuyển dụng"
                    className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-30 group-hover:scale-105 transition-transform duration-700 pointer-events-none"
                  />
                  <div className="pointer-events-none absolute -right-12 -top-12 h-56 w-56 rounded-full bg-white/15 blur-2xl" />

                  <div className="relative z-10">
                    <span className="inline-block px-3.5 py-1 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-wider mb-4 border border-white/30 backdrop-blur-md">
                      Dành cho Doanh nghiệp
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-black text-white leading-snug">
                      Đăng tin tuyển dụng & Tiếp cận 50,000+ nhân tài
                    </h3>
                    <p className="mt-3 text-sm sm:text-base text-teal-50/95 max-w-md leading-relaxed">
                      Công cụ lọc ứng viên thông minh, xếp hạng mức độ phù hợp và quản lý quy trình phỏng vấn tập trung, hiệu quả.
                    </p>
                  </div>

                  <div className="relative z-10 mt-8">
                    <Link
                      to={user?.role === 'RECRUITER' ? '/recruiter/jobs/create' : '/login'}
                      className="btn-press group inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-transparent hover:bg-white/15 border-2 border-white text-white font-bold text-sm shadow-xl active:scale-95 transition-all backdrop-blur-sm"
                    >
                      <span>Đăng tin tuyển dụng</span>
                      <ArrowRight size={17} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </TiltCard>

            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── 5. Featured Jobs Grid (Matches Figma Course Catalog) ── */}
      <section className="py-16 sm:py-20 bg-white border-y border-slate-100" aria-labelledby="jobs-heading">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal delayMs={80}>
            <div className="mb-12 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#49BBBD] bg-teal-50 px-3 py-1 rounded-full">
                  Cơ hội nổi bật
                </span>
                <h2 id="jobs-heading" className="mt-2 text-2xl sm:text-4xl font-black tracking-tight text-slate-900">
                  Việc làm mới nhất hôm nay
                </h2>
                <p className="mt-2 text-sm sm:text-base text-slate-600">
                  Những vị trí tuyển dụng vừa được các đối tác doanh nghiệp cập nhật.
                </p>
              </div>
              <Link
                to="/jobs"
                className="btn-press group inline-flex shrink-0 items-center gap-2 rounded-full border border-slate-200 hover:border-teal-300 px-5 py-2.5 text-sm font-bold text-[#49BBBD] hover:bg-teal-50 transition-all"
              >
                <span>Xem tất cả việc làm</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            {featuredContent}
          </ScrollReveal>
        </div>
      </section>

      {/* ── 6. Categories Bento Grid (Pastel Palette) ── */}
      <section className="py-16 sm:py-24" aria-labelledby="categories-heading">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal delayMs={80}>
            <div className="mb-12 text-center max-w-2xl mx-auto">
              <span className="text-xs font-bold uppercase tracking-wider text-[#49BBBD] bg-teal-50 px-3 py-1 rounded-full">
                Khám phá ngành nghề
              </span>
              <h2 id="categories-heading" className="mt-2 text-2xl sm:text-4xl font-black tracking-tight text-slate-900">
                Nhóm ngành tuyển dụng sôi động
              </h2>
              <p className="mt-3 text-sm sm:text-base text-slate-600">
                Tìm kiếm công việc theo chuyên môn phù hợp với năng lực và mục tiêu sự nghiệp của bạn.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {MOCK_CATEGORIES.map((category, idx) => (
                <CategoryCard key={category.id} category={category} index={idx} />
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── 7. Featured Companies Infinite Marquee (Kinetic Scroll Track) ── */}
      <section className="py-16 sm:py-20 bg-slate-50/70 border-t border-slate-100" aria-labelledby="companies-heading">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal delayMs={80}>
            <div className="mb-10 text-center max-w-2xl mx-auto">
              <h2 id="companies-heading" className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                Doanh nghiệp tuyển dụng tiêu biểu
              </h2>
              <p className="mt-2 text-sm sm:text-base text-slate-600">
                Đồng hành cùng những môi trường làm việc chuyên nghiệp hàng đầu Việt Nam.
              </p>
            </div>
            <CompanyMarquee companies={MOCK_COMPANIES} />
          </ScrollReveal>
        </div>
      </section>

      {/* ── 8. Testimonials Split Section (Figma Proof Block with 3D Tilt Photo) ── */}
      <section className="py-16 sm:py-24 bg-white border-y border-slate-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal delayMs={80}>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

              {/* Left Photo Container with 3D Tilt */}
              <div className="lg:col-span-5 relative">
                <TiltCard maxTilt={5} glare={true} className="rounded-[36px]">
                  <div className="relative mx-auto w-full max-w-sm aspect-4/5 rounded-[36px] overflow-hidden shadow-2xl bg-teal-50">
                    <img
                      src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80"
                      alt="Ứng viên thành công tại GJob"
                      className="w-full h-full object-cover object-center"
                    />
                  </div>
                </TiltCard>
                <div className="animate-float-1 absolute -bottom-6 -right-4 sm:right-6 bg-white p-4 rounded-3xl shadow-xl border border-slate-100 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-teal-50 text-[#49BBBD] flex items-center justify-center font-bold">
                    <Award size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Offer Chấp nhận</p>
                    <p className="text-[11px] text-[#49BBBD] font-semibold">Tăng 35% thu nhập</p>
                  </div>
                </div>
              </div>

              {/* Right Testimonial Quote */}
              <div className="lg:col-span-7 text-left">
                <div className="flex items-center gap-1 text-amber-400 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={20} className="fill-amber-400" />
                  ))}
                </div>
                <blockquote className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 leading-snug">
                  "Nhờ tính năng phân tích và đối chiếu mức độ phù hợp hồ sơ bằng AI của GJob, tôi đã biết chính xác những điểm cần bổ sung trong CV và nhanh chóng nhận được lời mời phỏng vấn từ công ty mong ước."
                </blockquote>
                <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <h4 className="text-base font-bold text-slate-900">Lê Quỳnh Mai</h4>
                    <p className="text-sm text-slate-500">Product Designer tại FinTech Corp</p>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-[#49BBBD] text-xs font-semibold">
                    <ShieldCheck size={14} /> Ứng viên xác thực
                  </div>
                </div>
              </div>

            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── 9. Career Insights / News (Figma 1-Large + 3-Small Grid) ── */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal delayMs={80}>
            <div className="mb-12 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#49BBBD] bg-teal-50 px-3 py-1 rounded-full">
                  Cẩm nang sự nghiệp
                </span>
                <h2 className="mt-2 text-2xl sm:text-4xl font-black tracking-tight text-slate-900">
                  Bí quyết phỏng vấn & Thị trường việc làm
                </h2>
              </div>
              <Link
                to="/jobs"
                className="btn-press group inline-flex shrink-0 items-center gap-1.5 text-sm font-bold text-[#49BBBD] hover:text-[#49BBBD]"
              >
                <span>Xem tất cả bài viết</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

              {/* Big Featured Article */}
              <div className="lg:col-span-6 flex flex-col justify-between rounded-3xl bg-white border border-slate-100 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                <div className="relative aspect-16/10 overflow-hidden bg-slate-100">
                  <img
                    src={MOCK_INSIGHTS[0].image}
                    alt={MOCK_INSIGHTS[0].title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-4 left-4 bg-[#49BBBD] text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                    {MOCK_INSIGHTS[0].category}
                  </span>
                </div>
                <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-3 text-xs text-slate-400 mb-3">
                      <span className="flex items-center gap-1"><Clock size={13} /> {MOCK_INSIGHTS[0].readTime}</span>
                      <span>•</span>
                      <span>{MOCK_INSIGHTS[0].date}</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug group-hover:text-[#49BBBD] transition-colors">
                      {MOCK_INSIGHTS[0].title}
                    </h3>
                  </div>
                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center text-sm font-bold text-[#49BBBD] group-hover:text-[#49BBBD]">
                    <span>Đọc chi tiết</span>
                    <ArrowUpRight size={16} className="ml-1 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </div>
                </div>
              </div>

              {/* 3 Stacked Articles */}
              <div className="lg:col-span-6 flex flex-col justify-between gap-4">
                {MOCK_INSIGHTS.slice(1).map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 p-4 sm:p-5 rounded-3xl bg-white border border-slate-100 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group cursor-pointer"
                  >
                    <div className="w-24 sm:w-32 aspect-square rounded-2xl overflow-hidden shrink-0 bg-slate-100">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="flex flex-col justify-between min-w-0 flex-1">
                      <div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 mb-1.5">
                          <span className="font-semibold text-[#49BBBD] bg-teal-50 px-2 py-0.5 rounded-full">{item.category}</span>
                          <span>•</span>
                          <span>{item.readTime}</span>
                        </div>
                        <h4 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-[#49BBBD] transition-colors line-clamp-2">
                          {item.title}
                        </h4>
                      </div>
                      <span className="text-xs font-bold text-slate-400 group-hover:text-[#49BBBD] mt-2 flex items-center">
                        <span>Xem bài viết</span>
                        <ArrowRight size={13} className="ml-1 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── 10. Final Action CTA Section ── */}
      {!authLoading && (
        <section className="pb-20 sm:pb-28" aria-labelledby="cta-heading">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <ScrollReveal delayMs={80}>
              <div
                className="relative overflow-hidden rounded-[36px] sm:rounded-[48px] px-8 py-16 sm:py-20 text-center text-white shadow-2xl shadow-teal-900/15"
                style={{
                  background: 'linear-gradient(135deg, #49BBBD 0%, #49BBBD 50%, #49BBBD 100%)',
                }}
              >
                <div className="pointer-events-none absolute -right-20 -top-20 w-80 h-80 rounded-full bg-white/10 blur-3xl" />
                <div className="relative mx-auto max-w-3xl">
                  <h2 id="cta-heading" className="text-3xl sm:text-5xl font-black leading-tight tracking-tight text-white">
                    {finalCta.title}
                  </h2>
                  <p className="mt-5 text-base sm:text-lg text-teal-100 max-w-2xl mx-auto leading-relaxed">
                    {finalCta.description}
                  </p>
                  <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link
                      to={finalCta.primary.to}
                      className="btn-press group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-white text-slate-950 hover:bg-teal-50 font-black text-sm sm:text-base shadow-xl active:scale-95 transition-all"
                    >
                      <span>{finalCta.primary.label}</span>
                      <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <Link
                      to={finalCta.secondary.to}
                      className="btn-press w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-white/15 hover:bg-white/25 border border-white/25 text-white font-bold text-sm sm:text-base backdrop-blur-md transition-all"
                    >
                      <span>{finalCta.secondary.label}</span>
                    </Link>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>
      )}

    </div>
  )
}
