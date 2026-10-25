import { CalendarDays, CircleDollarSign, Pencil, ShieldCheck } from 'lucide-react'
import type { SubscriptionPlan } from '../../types/subscription'
import { billingPeriodLabel, effectivePlanPrice, formatSubscriptionDate, formatVnd, hasActivePlanDiscount, planDisplayName } from '../../utils/subscription'

type Props = {
  plans: SubscriptionPlan[]
  onEdit: (plan: SubscriptionPlan) => void
}

export default function SubscriptionPlanGrid({ plans, onEdit }: Props) {
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3" aria-label="Danh mục gói dịch vụ">
      {plans.map((plan) => {
        const onSale = hasActivePlanDiscount(plan)
        return (
        <article key={plan.id} className="flex min-h-72 flex-col rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 transition-shadow hover:shadow-md sm:p-6">
          <header className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="break-words text-lg font-semibold text-slate-950">{planDisplayName(plan)}</h2>
                <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${plan.is_active ? 'bg-emerald-50 text-emerald-800 ring-emerald-200' : 'bg-slate-100 text-slate-600 ring-slate-200'}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${plan.is_active ? 'bg-emerald-500' : 'bg-slate-400'}`} aria-hidden="true" />
                  {plan.is_active ? 'Đang hoạt động' : 'Đã vô hiệu hóa'}
                </span>
              </div>
              <p className="mt-1 font-mono text-xs font-medium text-slate-400">{plan.code}</p>
            </div>
            <button type="button" onClick={() => onEdit(plan)} className="btn-press inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition-colors hover:bg-slate-900 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2" aria-label={`Chỉnh sửa gói ${planDisplayName(plan)}`}>
              <Pencil size={16} aria-hidden="true" />
            </button>
          </header>

          <div className="mt-6">
            {onSale && <div className="mb-1 flex items-center gap-2"><span className="text-sm text-slate-400 line-through">{formatVnd(plan.price)}</span><span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-bold text-red-600">-{plan.discount_percent}%</span></div>}
            <p className="text-3xl font-semibold tracking-tight text-slate-950 tabular-nums">{formatVnd(effectivePlanPrice(plan))}</p>
            <p className="mt-1 text-sm text-slate-500">{billingPeriodLabel(plan.billing_period)} · {plan.currency}</p>
            {!onSale && plan.discount_percent !== null && <p className="mt-2 text-xs font-medium text-amber-700">Khuyến mãi đã lên lịch hoặc đã kết thúc</p>}
          </div>

          <p className="mt-5 min-h-12 text-sm leading-6 text-slate-600">{plan.description || 'Chưa có mô tả cho gói dịch vụ này.'}</p>

          <dl className="mt-5 grid gap-3 border-t border-slate-100 pt-5 text-sm">
            <div className="flex items-center justify-between gap-4">
              <dt className="inline-flex items-center gap-2 text-slate-500"><CalendarDays size={15} aria-hidden="true" />Thời hạn</dt>
              <dd className="font-medium text-slate-900">{plan.duration_days ? `${plan.duration_days} ngày` : 'Không thời hạn'}</dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="inline-flex items-center gap-2 text-slate-500"><CircleDollarSign size={15} aria-hidden="true" />Chu kỳ</dt>
              <dd className="font-medium text-slate-900">{billingPeriodLabel(plan.billing_period)}</dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="inline-flex items-center gap-2 text-slate-500"><ShieldCheck size={15} aria-hidden="true" />Cập nhật</dt>
              <dd className="text-right text-xs font-medium text-slate-700">{formatSubscriptionDate(plan.updated_at)}</dd>
            </div>
          </dl>
        </article>
      )})}
    </section>
  )
}
