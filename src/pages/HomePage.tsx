import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Search,
  MapPin,
  Sparkles,
  FileText,
  CheckCircle2,
  Lightbulb,
  ArrowRight,
  ChevronRight,
} from 'lucide-react'
import JobCard from '../components/job/JobCard'
import CategoryCard from '../components/home/CategoryCard'
import CompanyCard from '../components/home/CompanyCard'
import { MOCK_JOBS, MOCK_CATEGORIES, MOCK_COMPANIES } from '../data/mockData'
import type { Job } from '../types/job'

const AI_FEATURES = [
  {
    icon: FileText,
    title: 'Phân tích CV thông minh',
    desc: 'AI đánh giá và cho điểm CV của bạn theo từng vị trí ứng tuyển.',
  },
  {
    icon: CheckCircle2,
    title: 'Đánh giá mức độ phù hợp',
    desc: 'Biết ngay bạn phù hợp bao nhiêu % với công việc trước khi nộp.',
  },
  {
    icon: Sparkles,
    title: 'Gợi ý việc làm cá nhân hoá',
    desc: 'Nhận danh sách việc làm được chọn lọc riêng cho hồ sơ của bạn.',
  },
  {
    icon: Lightbulb,
    title: 'Đề xuất cải thiện CV',
    desc: 'Hướng dẫn cụ thể để nâng cao điểm mạnh và lấp đầy khoảng trống.',
  },
]

function featuredJobToApiJob(job: (typeof MOCK_JOBS)[number]): Job {
  return { id: job.id, title: job.title, description: '', company_name: job.company, location: job.location, salary_min: null, salary_max: null, employment_type: job.type === 'Full-time' ? 'FULL_TIME' : null, experience_level: null, skills: [], status: 'APPROVED', created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
}

export default function HomePage() {
  const [keyword, setKeyword] = useState('')
  const [location, setLocation] = useState('')
  const navigate = useNavigate()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    navigate('/jobs')
  }

  return (
    <div className="overflow-x-hidden">
      {/* ───────────────────── SECTION 1 — HERO ───────────────────── */}
      <section className="relative bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-blue-600/20 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3 pointer-events-none" aria-hidden="true" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4 pointer-events-none" aria-hidden="true" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold uppercase tracking-wider px-4 py-1.5 rounded-full mb-6">
            <Sparkles size={14} />
            Nền tảng tuyển dụng AI thế hệ mới
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight mb-6">
            Kiến tạo cơ hội nghề nghiệp
            <br />
            <span className="text-blue-400">phù hợp với bạn</span>
          </h1>

          <p className="text-slate-300 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Tìm kiếm việc làm, xây dựng CV và khám phá những cơ hội phù hợp với năng lực của bạn.
          </p>

          {/* Search Box */}
          <form
            onSubmit={handleSearch}
            className="bg-white rounded-2xl p-2 sm:p-3 flex flex-col sm:flex-row gap-2 max-w-3xl mx-auto shadow-2xl"
            role="search"
            aria-label="Tìm kiếm việc làm"
          >
            <label htmlFor="hero-keyword" className="sr-only">Từ khóa tìm kiếm</label>
            <div className="flex items-center gap-3 flex-1 bg-slate-50 rounded-xl px-4 py-3">
              <Search size={18} className="text-slate-400 shrink-0" aria-hidden="true" />
              <input
                id="hero-keyword"
                type="text"
                placeholder="Tìm kiếm theo kỹ năng, vị trí, công ty..."
                className="flex-1 bg-transparent text-slate-800 text-sm placeholder-slate-400 outline-none"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
            </div>

            <label htmlFor="hero-location" className="sr-only">Địa điểm</label>
            <div className="flex items-center gap-3 flex-1 bg-slate-50 rounded-xl px-4 py-3">
              <MapPin size={18} className="text-slate-400 shrink-0" aria-hidden="true" />
              <input
                id="hero-location"
                type="text"
                placeholder="Tất cả địa điểm"
                className="flex-1 bg-transparent text-slate-800 text-sm placeholder-slate-400 outline-none"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-6 py-3 rounded-xl transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 focus:ring-offset-white shrink-0"
            >
              <Search size={16} />
              Tìm việc
            </button>
          </form>

          <p className="mt-5 text-slate-500 text-sm">
            Hơn <span className="text-slate-300 font-semibold">3.500+</span> công việc đang chờ bạn
          </p>
        </div>
      </section>

      {/* ───────────────── SECTION 2 — JOB CATEGORIES ────────────── */}
      <section className="py-20 bg-white" aria-labelledby="categories-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 id="categories-heading" className="text-3xl font-bold text-slate-900 mb-3">
              Khám phá theo nhóm ngành
            </h2>
            <p className="text-slate-500">Tìm kiếm công việc theo lĩnh vực bạn đam mê</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {MOCK_CATEGORIES.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────── SECTION 3 — FEATURED JOBS ─────────────── */}
      <section className="py-20 bg-slate-50" aria-labelledby="jobs-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
            <div>
              <h2 id="jobs-heading" className="text-3xl font-bold text-slate-900 mb-2">
                Việc làm nổi bật
              </h2>
              <p className="text-slate-500">Những cơ hội tốt nhất đang chờ bạn ứng tuyển</p>
            </div>
            <Link
              to="/jobs"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700 shrink-0 transition-colors"
            >
              Xem tất cả việc làm
              <ChevronRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {MOCK_JOBS.map((job) => (
              <JobCard key={job.id} job={featuredJobToApiJob(job)} />
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────── SECTION 4 — FEATURED COMPANIES ───────────── */}
      <section className="py-20 bg-white" aria-labelledby="companies-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 id="companies-heading" className="text-3xl font-bold text-slate-900 mb-3">
              Công ty hàng đầu
            </h2>
            <p className="text-slate-500">Khám phá các công ty uy tín đang tuyển dụng</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {MOCK_COMPANIES.map((company) => (
              <CompanyCard key={company.id} company={company} />
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────── SECTION 5 — AI FEATURE ──────────────────── */}
      <section className="py-20 bg-slate-900" aria-labelledby="ai-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left: Content */}
            <div>
              <div className="inline-flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-5">
                <Sparkles size={16} />
                AI-Powered
              </div>
              <h2 id="ai-heading" className="text-3xl sm:text-4xl font-bold text-white leading-tight mb-5">
                AI đồng hành cùng{' '}
                <span className="text-blue-400">hành trình nghề nghiệp</span>
              </h2>
              <p className="text-slate-400 text-lg mb-10 leading-relaxed">
                Hệ thống AI của GJob phân tích, đánh giá và cá nhân hoá mọi bước trong quá trình tìm việc của bạn.
              </p>

              <ul className="space-y-6">
                {AI_FEATURES.map((feature) => {
                  const Icon = feature.icon
                  return (
                    <li key={feature.title} className="flex items-start gap-4">
                      <div className="shrink-0 flex items-center justify-center w-10 h-10 bg-blue-600/20 text-blue-400 rounded-lg mt-0.5">
                        <Icon size={20} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white text-sm mb-1">{feature.title}</h3>
                        <p className="text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
                      </div>
                    </li>
                  )
                })}
              </ul>
            </div>

            {/* Right: Visual */}
            <div className="hidden lg:block">
              <div className="relative bg-gradient-to-br from-blue-900/50 to-slate-800/50 rounded-2xl p-8 border border-slate-700">
                {/* Simulated AI UI card */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
                      <Sparkles size={18} className="text-white" />
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm">GJob AI Assistant</p>
                      <p className="text-slate-400 text-xs">Đang phân tích hồ sơ...</p>
                    </div>
                  </div>

                  {[
                    { label: 'Điểm CV', value: '87/100', color: 'bg-emerald-500', pct: '87%' },
                    { label: 'Phù hợp với Frontend Dev', value: '92%', color: 'bg-blue-500', pct: '92%' },
                    { label: 'Hoàn thiện hồ sơ', value: '74%', color: 'bg-amber-500', pct: '74%' },
                  ].map((item) => (
                    <div key={item.label} className="bg-slate-800/60 rounded-xl p-4">
                      <div className="flex justify-between mb-2">
                        <span className="text-slate-300 text-xs font-medium">{item.label}</span>
                        <span className="text-white text-xs font-bold">{item.value}</span>
                      </div>
                      <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${item.color}`}
                          style={{ width: item.pct }}
                        />
                      </div>
                    </div>
                  ))}

                  <div className="bg-blue-600/20 border border-blue-500/30 rounded-xl p-4">
                    <p className="text-blue-300 text-xs font-medium mb-1.5">💡 Gợi ý AI</p>
                    <p className="text-slate-300 text-xs leading-relaxed">
                      Thêm kinh nghiệm với React Testing Library để tăng điểm phù hợp lên 15%.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────── SECTION 6 — CTA ─────────────────────── */}
      <section className="py-20 bg-blue-600" aria-labelledby="cta-heading">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 id="cta-heading" className="text-3xl sm:text-4xl font-bold text-white mb-4 leading-tight">
            Dù bạn đang tìm việc hay tìm kiếm nhân tài,
            <br className="hidden sm:block" />
            GJob luôn sẵn sàng đồng hành.
          </h2>
          <p className="text-blue-100 text-lg mb-10">
            Hàng nghìn cơ hội đang chờ — bắt đầu ngay hôm nay.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/jobs"
              className="inline-flex items-center gap-2 bg-white text-blue-600 font-semibold px-8 py-3.5 rounded-xl hover:bg-blue-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600"
            >
              Tìm việc ngay
              <ArrowRight size={18} />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 bg-blue-700 text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-blue-800 border border-blue-500 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600"
            >
              Đăng tin tuyển dụng
              <ChevronRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
