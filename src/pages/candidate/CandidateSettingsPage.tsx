import { Settings } from 'lucide-react'
import AccountSecurityForm from '../../components/account/AccountSecurityForm'
import GoogleAuthPanel from '../../components/auth/GoogleAuthPanel'

export default function CandidateSettingsPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-8"><div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#49BBBD] text-white"><Settings size={20} /></div><p className="mt-5 text-xs font-bold uppercase tracking-[0.16em] text-[#31999b]">Tài khoản ứng viên</p><h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Cài đặt bảo mật</h1><p className="mt-2 text-sm leading-6 text-slate-500">Quản lý mật khẩu và bảo vệ quyền truy cập tài khoản GJob.</p></header>
      <AccountSecurityForm />
      <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"><GoogleAuthPanel sessionLink /></div>
    </main>
  )
}
