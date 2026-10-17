import { AlertCircle, CalendarDays, CheckCircle2, CreditCard, RefreshCw, ShieldCheck } from 'lucide-react'
import { useCallback } from 'react'
import { usePaginatedQuery } from '../../hooks/usePaginatedQuery'
import { subscriptionService } from '../../services/subscriptionService'
import type { RecruiterSubscriptionResponse } from '../../types/subscription'
import { subscriptionErrorMessage } from '../../utils/apiError'
import { billingPeriodLabel, formatSubscriptionDate, formatVnd, isFreeFallback, planDisplayName, subscriptionSourceLabel, subscriptionStatusLabel } from '../../utils/subscription'

export function RecruiterSubscriptionSummary({ data }: { data: RecruiterSubscriptionResponse }) {
  const free = isFreeFallback(data)
  const { effective_plan: plan, subscription } = data
  return <section className="mt-6 overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200" aria-labelledby="current-subscription-title">
    <div className="flex flex-col justify-between gap-5 bg-slate-950 px-6 py-6 text-white sm:flex-row sm:items-center"><div><p className="text-xs font-semibold uppercase tracking-[0.17em] text-slate-400">Gói đang sử dụng</p><h2 id="current-subscription-title" className="mt-2 text-2xl font-semibold">{planDisplayName(plan)}</h2><p className="mt-1 text-sm text-slate-300">{free ? 'Gói hiện tại: Miễn phí · Không phát sinh đăng ký.' : `${formatVnd(plan.price)} · ${billingPeriodLabel(plan.billing_period)}`}</p></div><span className="inline-flex w-fit items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold ring-1 ring-white/15"><CheckCircle2 size={15} />{subscription ? subscriptionStatusLabel(subscription.status) : 'Đang sử dụng'}</span></div>
    <dl className="grid gap-px bg-slate-200 sm:grid-cols-3"><div className="bg-white p-5"><dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400"><CreditCard size={15} />Chi phí</dt><dd className="mt-2 text-sm font-semibold text-slate-950">{formatVnd(plan.price)}</dd></div><div className="bg-white p-5"><dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400"><CalendarDays size={15} />Hiệu lực đến</dt><dd className="mt-2 text-sm font-semibold text-slate-950">{formatSubscriptionDate(subscription?.expires_at ?? null)}</dd></div><div className="bg-white p-5"><dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400"><ShieldCheck size={15} />Nguồn cấp</dt><dd className="mt-2 text-sm font-semibold text-slate-950">{subscription ? subscriptionSourceLabel(subscription.source) : 'Hệ thống mặc định'}</dd></div></dl>
  </section>
}

export default function RecruiterSubscriptionSection() {
  const fetchSubscription = useCallback((signal: AbortSignal) => subscriptionService.getMyRecruiterSubscription(signal), [])
  const query = usePaginatedQuery({ queryKey: 'my-recruiter-subscription', fetcher: fetchSubscription })

  if (query.isInitialLoading) return <section className="mt-6 h-48 animate-pulse rounded-2xl bg-slate-200" aria-label="Đang tải gói dịch vụ" />
  if (query.error && !query.data) return <section className="mt-6 rounded-2xl bg-white p-6 ring-1 ring-slate-200"><div className="flex items-start gap-3"><AlertCircle className="mt-0.5 shrink-0 text-red-500" size={20} /><div><h2 className="font-semibold text-slate-950">Không thể tải gói hiện tại</h2><p className="mt-1 text-sm text-slate-500">{subscriptionErrorMessage(query.error, 'self')}</p><button type="button" onClick={query.refetch} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-3.5 py-2 text-sm font-semibold text-white"><RefreshCw size={15} />Thử lại</button></div></div></section>
  if (!query.data) return null

  return <RecruiterSubscriptionSummary data={query.data} />
}
