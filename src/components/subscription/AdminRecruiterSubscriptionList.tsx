import { ShieldOff } from 'lucide-react'
import type { AdminRecruiterSubscriptionItem } from '../../types/subscription'
import { formatSubscriptionDate, formatVnd, planDisplayName, subscriptionSourceLabel, subscriptionStatusLabel } from '../../utils/subscription'

type Props = {
  recruiters: AdminRecruiterSubscriptionItem[]
  onGrant: (recruiter: AdminRecruiterSubscriptionItem) => void
  onRevoke: (recruiter: AdminRecruiterSubscriptionItem) => void
}

export default function AdminRecruiterSubscriptionList({ recruiters, onGrant, onRevoke }: Props) {
  return <div className="space-y-3" aria-label="Danh sách gói của nhà tuyển dụng">
    {recruiters.map((recruiter) => {
      const paid = recruiter.effective_plan.code !== 'FREE' && recruiter.subscription !== null
      const planLabel = paid ? planDisplayName(recruiter.effective_plan) : 'Gói hiện tại: Miễn phí'
      return <article key={recruiter.id} className="rounded-2xl bg-white p-5 ring-1 ring-slate-200 sm:p-6"><div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h2 className="truncate text-base font-semibold text-slate-950">{recruiter.full_name}</h2><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${recruiter.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{recruiter.is_active ? 'Tài khoản hoạt động' : 'Đã vô hiệu hóa'}</span></div><p className="mt-1 truncate text-sm text-slate-500">{recruiter.email}</p>
          <dl className="mt-4 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2 xl:grid-cols-3"><div><dt className="inline text-slate-500">Gói: </dt><dd className="inline font-semibold text-slate-950">{planLabel} · {formatVnd(recruiter.effective_plan.price)}</dd></div><div><dt className="inline text-slate-500">Trạng thái: </dt><dd className="inline font-semibold text-slate-800">{recruiter.subscription ? subscriptionStatusLabel(recruiter.subscription.status) : 'FREE mặc định'}</dd></div>{recruiter.subscription && <><div><dt className="inline text-slate-500">Bắt đầu: </dt><dd className="inline font-semibold text-slate-800">{formatSubscriptionDate(recruiter.subscription.starts_at)}</dd></div><div><dt className="inline text-slate-500">Hết hạn: </dt><dd className="inline font-semibold text-slate-800">{formatSubscriptionDate(recruiter.subscription.expires_at)}</dd></div><div><dt className="inline text-slate-500">Nguồn cấp: </dt><dd className="inline font-semibold text-slate-800">{subscriptionSourceLabel(recruiter.subscription.source)}</dd></div></>}</dl>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2"><button type="button" onClick={() => onGrant(recruiter)} className="btn-press rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-black">{paid ? 'Đổi gói' : 'Cấp gói'}</button>{paid && <button type="button" onClick={() => onRevoke(recruiter)} className="btn-press inline-flex items-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-50"><ShieldOff size={16} />Thu hồi</button>}</div>
      </div></article>
    })}
  </div>
}
