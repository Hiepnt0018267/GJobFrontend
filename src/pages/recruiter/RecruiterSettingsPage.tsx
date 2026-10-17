import { Building2, ChevronRight, CreditCard, LockKeyhole, Settings } from 'lucide-react'
import { Link } from 'react-router-dom'

const linkClass = 'group flex items-center gap-4 rounded-2xl border border-black/[0.05] bg-white p-5 transition-all duration-150 hover:-translate-y-0.5 hover:border-black/[0.1] hover:shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1C1C1C]'

export default function RecruiterSettingsPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-8 font-[Inter,sans-serif] sm:px-6 lg:px-8">
      <header>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1C1C1C] text-white">
          <Settings size={19} aria-hidden="true" />
        </div>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight text-[#1C1C1C]">Cài đặt</h1>
        <p className="mt-1.5 text-sm leading-6 text-slate-500">Quản lý hồ sơ, dịch vụ và các thiết lập bảo mật của tài khoản nhà tuyển dụng.</p>
      </header>

      <section className="mt-8" aria-labelledby="workspace-settings-title">
        <h2 id="workspace-settings-title" className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Tài khoản và dịch vụ</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <Link to="/recruiter/profile/edit" className={linkClass}>
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#E5ECF6] text-[#1C1C1C]">
              <Building2 size={19} aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-semibold text-[#1C1C1C]">Hồ sơ công ty</span>
              <span className="mt-1 block text-xs leading-5 text-slate-500">Cập nhật thông tin và nhận diện doanh nghiệp.</span>
            </span>
            <ChevronRight size={18} className="shrink-0 text-slate-400 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </Link>

          <Link to="/recruiter/plans" className={linkClass}>
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#E3F5FF] text-[#1C1C1C]">
              <CreditCard size={19} aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-semibold text-[#1C1C1C]">Quản lý dịch vụ</span>
              <span className="mt-1 block text-xs leading-5 text-slate-500">Xem gói dịch vụ và các quyền lợi do quản trị viên cấu hình.</span>
            </span>
            <ChevronRight size={18} className="shrink-0 text-slate-400 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </Link>
        </div>
      </section>

      <section className="mt-8" aria-labelledby="security-settings-title">
        <h2 id="security-settings-title" className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Bảo mật</h2>
        <div className="mt-3 flex items-center gap-4 rounded-2xl border border-black/[0.05] bg-[#F7F9FB] p-5" aria-disabled="true">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-slate-500 ring-1 ring-black/[0.05]">
            <LockKeyhole size={19} aria-hidden="true" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-semibold text-slate-700">Đổi mật khẩu</span>
            <span className="mt-1 block text-xs leading-5 text-slate-500">Chức năng sẽ được bổ sung khi luồng bảo mật tài khoản sẵn sàng.</span>
          </span>
          <span className="shrink-0 rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500 ring-1 ring-black/[0.06]">Sắp có</span>
        </div>
      </section>
    </main>
  )
}
