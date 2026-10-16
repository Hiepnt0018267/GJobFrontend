import { useEffect, useRef, type FormEvent } from 'react'
import {
  BriefcaseBusiness, Calendar, Globe, GraduationCap, MapPin,
  Play, Search, Sparkles, Star, Users, X
} from 'lucide-react'
import { Link } from 'react-router-dom'
import type { User } from '../../types/auth'
import TiltCard from '../motion/TiltCard'

type Props = {
  user: User | null
  keyword: string
  location: string
  onKeywordChange: (value: string) => void
  onLocationChange: (value: string) => void
  onSearch: (event: FormEvent<HTMLFormElement>) => void
}

type QuickFilter = {
  label: string
  icon?: typeof Globe
  to: string
}

const QUICK_FILTERS: QuickFilter[] = [
  { label: 'Làm từ xa (Remote)', icon: Globe, to: '/jobs?work_mode=REMOTE' },
  { label: 'Thực tập sinh', icon: GraduationCap, to: '/jobs?level=INTERN' },
  { label: 'Chưa cần kinh nghiệm', to: '/jobs?experience_requirement=NO_EXPERIENCE' },
  { label: 'Lương thỏa thuận', to: '/jobs?salary=NEGOTIABLE' },
  { label: 'Frontend Developer', to: '/jobs?search=Frontend' },
  { label: 'Backend Engineer', to: '/jobs?search=Backend' },
]

export default function PersonalizedHomeHero({
  user,
  keyword,
  location,
  onKeywordChange,
  onLocationChange,
  onSearch,
}: Props) {
  const keywordInputRef = useRef<HTMLInputElement>(null)

  // Keyboard shortcut '/' focuses the search input
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key === '/' &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        event.preventDefault()
        keywordInputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const greeting =
    user?.role === 'CANDIDATE' || user?.role === 'RECRUITER'
      ? `Chào mừng trở lại, ${user.full_name || 'bạn'}!`
      : null

  return (
    <div className="relative pb-16 sm:pb-20">
      {/* ── Main Hero Section with Iconic Figma Curved Wave Container ── */}
      <section
        className="relative overflow-hidden pt-12 sm:pt-16 pb-24 sm:pb-32 text-white rounded-b-[40px] sm:rounded-b-[64px] lg:rounded-b-[88px] shadow-2xl shadow-teal-900/10"
        style={{
          background: 'linear-gradient(135deg, #49BBBD 0%, #49BBBD 50%, #49BBBD 100%)',
        }}
      >
        {/* Subtle decorative background shapes */}
        <div className="pointer-events-none absolute -top-32 -left-32 w-96 h-96 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute top-1/2 -right-24 w-80 h-80 rounded-full bg-cyan-300/15 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-1/3 w-64 h-64 rounded-full bg-teal-400/20 blur-2xl" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">

            {/* Left Column: Headline, Description & Dual Actions */}
            <div className="lg:col-span-7 text-left">
              {greeting ? (
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 border border-white/20 text-white text-xs sm:text-sm font-semibold mb-6 backdrop-blur-md">
                  <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
                  {greeting}
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 border border-white/20 text-white text-xs sm:text-sm font-semibold mb-6 backdrop-blur-md">
                  <Sparkles size={14} className="text-amber-300 fill-amber-300" />
                  <span>Nền tảng kết nối nhân tài & việc làm AI</span>
                </div>
              )}

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.15]">
                Khởi đầu sự nghiệp{' '}
                <span className="relative inline-block text-amber-300">
                  mơ ước
                  <span className="absolute -bottom-1 left-0 right-0 h-1.5 bg-amber-300/40 rounded-full" />
                </span>{' '}
                cùng GJob
              </h1>

              <p className="mt-6 text-base sm:text-lg text-teal-50/90 leading-relaxed max-w-2xl font-normal">
                Tiếp cận hơn 10,000+ cơ hội nghề nghiệp xác thực từ các doanh nghiệp hàng đầu. Đối chiếu năng lực tự động với AI và ứng tuyển trực tiếp chỉ trong tích tắc.
              </p>

              {/* Dual Action Buttons (Figma Style) */}
              <div className="mt-8 sm:mt-10 flex flex-wrap items-center gap-4">
                <Link
                  to={user ? (user.role === 'RECRUITER' ? '/recruiter' : '/jobs') : '/jobs'}
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-white text-[#49BBBD] hover:bg-teal-50 font-black text-sm sm:text-base shadow-xl hover:shadow-2xl active:scale-95 transition-all duration-200"
                >
                  <BriefcaseBusiness size={18} />
                  <span>{user?.role === 'RECRUITER' ? 'Dashboard tuyển dụng' : 'Khám phá việc làm ngay'}</span>
                </Link>

                <a
                  href="#how-it-works"
                  className="inline-flex items-center gap-3 px-6 py-4 rounded-full bg-white/15 hover:bg-white/25 border border-white/25 text-white font-bold text-sm sm:text-base backdrop-blur-md transition-all duration-200"
                >
                  <div className="w-8 h-8 rounded-full bg-white text-[#49BBBD] flex items-center justify-center shadow-md">
                    <Play size={14} className="fill-[#49BBBD] ml-0.5" />
                  </div>
                  <span>Xem cách hoạt động</span>
                </a>
              </div>
            </div>

            {/* Right Column: Hero Visual with 3 Floating Badges (Figma TOTC Style) */}
            <div className="lg:col-span-5 relative flex justify-center">
              <div className="relative w-full max-w-md">

                {/* Main Visual Image Container with Squircle Borders and 3D Tilt */}
                <TiltCard maxTilt={6} glare={true} className="rounded-[40px]">
                  <div className="relative mx-auto w-72 sm:w-84 lg:w-96 aspect-4/5 rounded-[40px] overflow-hidden border-4 border-white/30 shadow-2xl bg-[#49BBBD]/60">
                    <img
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80"
                      alt="Ứng viên GJob tự tin kết nối cơ hội"
                      className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent pointer-events-none" />
                  </div>
                </TiltCard>

                {/* Floating Badge 1: Top-Left Calendar / Interview Invite with Floating Motion */}
                <div className="animate-float-1 absolute -top-4 -left-4 sm:-left-8 bg-white text-slate-800 p-3 sm:p-4 rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-100 flex items-center gap-3 transition-transform hover:scale-105 hover:shadow-teal-900/10 cursor-default">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#49BBBD] flex items-center justify-center font-bold">
                    <Calendar size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Lịch phỏng vấn mới</p>
                    <p className="text-[11px] text-[#49BBBD] font-semibold">Đã xác nhận • 14:00 Hôm nay</p>
                  </div>
                </div>

                {/* Floating Badge 2: Middle-Right Talent Community with Counter Floating Motion */}
                <div className="animate-float-2 absolute top-1/2 -right-4 sm:-right-8 -translate-y-1/2 bg-white text-slate-800 p-3 sm:p-4 rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-100 flex items-center gap-3 transition-transform hover:scale-105 hover:shadow-teal-900/10 cursor-default">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#49BBBD] flex items-center justify-center font-bold">
                    <Users size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-900">250K+ Ứng viên</p>
                    <p className="text-[11px] text-slate-500 font-medium">Đang tìm việc tích cực</p>
                  </div>
                </div>

                {/* Floating Badge 3: Bottom Partner Companies with Gentle Float */}
                <div className="animate-float-3 absolute -bottom-6 left-6 right-6 bg-white/95 backdrop-blur-md text-slate-800 p-3.5 rounded-2xl sm:rounded-3xl shadow-2xl border border-white/60 flex items-center justify-between gap-3 transition-transform hover:scale-[1.02] cursor-default">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
                      <Star size={18} className="fill-amber-400 text-amber-400" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">Top 500+ Doanh nghiệp</p>
                      <p className="text-[11px] text-slate-500">Tỷ lệ hài lòng 98%</p>
                    </div>
                  </div>
                  <span className="text-xs font-black text-[#49BBBD] bg-teal-50 px-2.5 py-1 rounded-full">
                    Đã xác thực
                  </span>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── Composite Floating Search Bar (Positioned at Hero Junction) ── */}
      <div className="relative -mt-10 sm:-mt-14 z-30 mx-auto max-w-5xl px-4 sm:px-6">
        <form
          onSubmit={onSearch}
          className="bg-white p-3 sm:p-4 rounded-3xl sm:rounded-full shadow-2xl shadow-slate-900/10 border border-slate-100 flex flex-col sm:flex-row items-center gap-2.5"
          role="search"
          aria-label="Tìm kiếm việc làm"
        >
          {/* Keyword Field */}
          <div className="flex flex-1 w-full items-center gap-3 px-4 py-2 sm:py-0">
            <Search size={20} className="text-[#49BBBD] shrink-0" />
            <input
              ref={keywordInputRef}
              type="text"
              value={keyword}
              onChange={(e) => onKeywordChange(e.target.value)}
              placeholder="Vị trí, kỹ năng, công ty..."
              className="w-full text-sm sm:text-base font-medium text-slate-900 placeholder:text-slate-400 outline-none bg-transparent"
            />
            {keyword && (
              <button
                type="button"
                onClick={() => onKeywordChange('')}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Divider */}
          <div className="hidden sm:block w-px h-8 bg-slate-200" />

          {/* Location Field */}
          <div className="flex flex-1 w-full items-center gap-3 px-4 py-2 sm:py-0">
            <MapPin size={20} className="text-[#49BBBD] shrink-0" />
            <input
              type="text"
              value={location}
              onChange={(e) => onLocationChange(e.target.value)}
              placeholder="Địa điểm (Hà Nội, TP.HCM, Remote...)"
              className="w-full text-sm sm:text-base font-medium text-slate-900 placeholder:text-slate-400 outline-none bg-transparent"
            />
            {location && (
              <button
                type="button"
                onClick={() => onLocationChange('')}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Search Button (Figma Pill) */}
          <button
            type="submit"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-[#49BBBD] hover:bg-[#49BBBD]/90 active:scale-95 text-white font-bold text-sm sm:text-base shadow-md shadow-[#49BBBD]/30 transition-all shrink-0 cursor-pointer"
          >
            <Search size={18} />
            <span>Tìm việc</span>
          </button>
        </form>

        {/* Quick Filter Tag Chips Underneath */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs">
          <span className="text-slate-500 font-semibold mr-1">Tìm kiếm phổ biến:</span>
          {QUICK_FILTERS.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white hover:bg-teal-50 border border-slate-200/80 hover:border-teal-300 text-slate-700 hover:text-[#49BBBD] font-medium transition-all shadow-xs"
            >
              {item.icon && <item.icon size={13} className="text-[#49BBBD]" />}
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
