import { Link } from 'react-router-dom'
import {
  Briefcase, FileText, User,
  TrendingUp, MapPin,
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import CandidateHeader from '../../components/candidate/CandidateHeader'

const MOCK_JOBS = [
  { title: 'Frontend Developer', company: 'TechViet Corp', location: 'Hà Nội', match: 94 },
  { title: 'UI/UX Designer',     company: 'Creative Hub',   location: 'TP.HCM', match: 88 },
  { title: 'React Developer',    company: 'Startup Labs',   location: 'Remote', match: 81 },
]

export default function CandidateDashboardPage() {
  const { user } = useAuth()
  const initial = user?.full_name.charAt(0).toUpperCase() ?? '?'

  return (
    <div className="min-h-screen bg-slate-50">
      <CandidateHeader />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Welcome */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl p-6 text-white">
          <h1 className="text-xl font-bold mb-1">Dashboard ứng viên</h1>
          <p className="text-sm text-blue-100">Xin chào, {user?.full_name} · Ứng viên</p>
          <p className="mt-1 text-sm text-blue-100">{user?.email}</p>
          <div className="mt-4 inline-flex items-center gap-1.5 bg-white/15 px-3 py-1.5 rounded-full text-xs font-medium">
            <TrendingUp size={12} />
            3 việc làm phù hợp mới hôm nay
          </div>
        </div>

        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div><h2 className="font-bold text-slate-900">CV của tôi</h2><p className="mt-1 text-sm text-slate-500">Tạo và quản lý CV cho các cơ hội sắp tới.</p></div>
            <div className="flex gap-2"><Link to="/candidate/cvs" className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"><FileText size={14}/>CV của tôi</Link><Link to="/candidate/cvs/templates" className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700">Tạo CV</Link></div>
          </div>
        </section>

        {/* Recommended jobs */}
        <section aria-label="Việc làm gợi ý">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Gợi ý AI cho bạn</h2>
            <Link to="/jobs" className="text-xs text-blue-600 hover:underline">Xem tất cả</Link>
          </div>
          <div className="space-y-3">
            {MOCK_JOBS.map((job) => (
              <div
                key={job.title}
                className="flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-200 hover:shadow-sm transition-shadow duration-200"
              >
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                  <Briefcase size={18} className="text-slate-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">{job.title}</p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-xs text-slate-500">{job.company}</span>
                    <span className="flex items-center gap-1 text-xs text-slate-400">
                      <MapPin size={10} /> {job.location}
                    </span>
                  </div>
                </div>
                <div className="shrink-0 flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 rounded-full">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span className="text-xs font-semibold text-emerald-700">{job.match}%</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Profile completion */}
        <section
          aria-label="Hồ sơ"
          className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg shrink-0">
            {initial}
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-slate-900">{user?.full_name}</p>
            <p className="text-xs text-slate-500 mb-2">{user?.email}</p>
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full w-[40%] bg-blue-500 rounded-full" />
            </div>
            <p className="text-xs text-slate-400 mt-1">Hồ sơ hoàn thành 40% — Cập nhật để tăng cơ hội</p>
          </div>
          <Link
            to="/candidate/profile"
            className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-blue-600 border border-blue-200 hover:bg-blue-50 transition-colors"
          >
            <User size={13} />
            Cập nhật
          </Link>
        </section>
      </main>
    </div>
  )
}
