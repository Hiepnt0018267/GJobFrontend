import { AlertCircle, Check, LoaderCircle, Package, RefreshCw } from 'lucide-react'
import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDataRefreshVersion } from '../../hooks/useDataRefreshVersion'
import { usePaginatedQuery } from '../../hooks/usePaginatedQuery'
import { useRecruiterSubscription } from '../../hooks/useRecruiterSubscription'
import { useToast } from '../../hooks/useToast'
import { subscriptionService } from '../../services/subscriptionService'
import type { BillingPeriod, RecruiterPlanCatalogItem } from '../../types/subscription'
import { paymentErrorMessage, subscriptionErrorMessage } from '../../utils/apiError'
import { isPurchasablePlan, paymentOrderPath } from '../../utils/payment'
import { billingPeriodLabel, effectivePlanPrice, formatSubscriptionDate, formatVnd, hasActivePlanDiscount, planDisplayName } from '../../utils/subscription'

type PlanCardProps = {
  plan: RecruiterPlanCatalogItem
  current: boolean
  purchasable: boolean
  purchasing: boolean
  onPurchase: () => void
}

type PaidBillingPeriod = Exclude<BillingPeriod, 'NONE'>

function PlanCard({ plan, current, purchasable, purchasing, onPurchase }: PlanCardProps) {
  const descriptionItems = plan.description
    ? plan.description.split(/\r?\n/).map((item) => item.trim()).filter(Boolean)
    : []
  const onSale = hasActivePlanDiscount(plan)

  return (
    <article
      className={`motion-card group relative flex cursor-default flex-col overflow-hidden rounded-[22px] bg-white px-6 py-7 will-change-transform active:scale-[0.985] sm:px-7 ${
        current
          ? 'ring-1 ring-black/[0.08] shadow-[0_22px_55px_-24px_rgba(15,23,42,0.35)] hover:ring-black/[0.16] hover:shadow-[0_30px_70px_-28px_rgba(15,23,42,0.42)] lg:-translate-y-4 lg:hover:-translate-y-6'
          : 'ring-1 ring-slate-200/90 shadow-[0_10px_30px_-24px_rgba(15,23,42,0.28)] hover:-translate-y-2 hover:ring-slate-300 hover:shadow-[0_26px_60px_-28px_rgba(15,23,42,0.38)]'
      }`}
    >
      <span className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-slate-500/45 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" aria-hidden="true" />
      <div className="flex min-h-7 items-start justify-between gap-3">
        <span className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.08em] ${current ? 'text-[#1C1C1C]' : 'text-slate-500'}`}>
          <Package size={14} className="transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110" aria-hidden="true" />
          {plan.code}
        </span>
        {current ? (
          <span className="rounded-full bg-[#1C1C1C] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-white">Đang dùng</span>
        ) : onSale ? (
          <span className="rounded-full bg-red-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-red-600 ring-1 ring-red-100">Giảm {plan.discount_percent}%</span>
        ) : null}
      </div>

      <h2 className="mt-5 text-2xl font-bold tracking-tight text-slate-950">{planDisplayName(plan)}</h2>

      <div className="mt-6 flex items-end gap-2 border-b border-slate-100 pb-6">
        <div>
          {onSale && <p className="mb-1 text-sm font-medium text-slate-400 line-through">{formatVnd(plan.price)}</p>}
          <strong className="text-[32px] font-extrabold leading-none tracking-[-0.04em] text-slate-950">
            {formatVnd(effectivePlanPrice(plan))}
          </strong>
        </div>
        <span className="pb-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
          {billingPeriodLabel(plan.billing_period)}
        </span>
      </div>
      {onSale && plan.discount_ends_at && <p className="mt-3 text-xs font-medium text-red-600">Ưu đãi đến {formatSubscriptionDate(plan.discount_ends_at)}</p>}

      {descriptionItems.length > 0 && (
        <ul className="mt-6 flex-1 space-y-3.5" aria-label={`Quyền lợi gói ${planDisplayName(plan)}`}>
          {descriptionItems.map((item, index) => (
            <li key={`description-${index}`} className="flex items-start gap-3 text-sm leading-5 text-slate-700">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#E5ECF6] text-slate-700 transition-transform duration-200 group-hover:scale-105">
                <Check size={12} strokeWidth={2.8} aria-hidden="true" />
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}

      {current ? (
        <div className="mt-7 rounded-xl bg-[#1C1C1C] px-4 py-3 text-center text-sm font-semibold text-white transition-[transform,box-shadow,background-color] duration-200 group-hover:bg-black group-hover:shadow-md">Gói đang sử dụng</div>
      ) : purchasable ? (
        <button
          type="button"
          disabled={purchasing}
          onClick={onPurchase}
          className="btn-press mt-7 inline-flex items-center justify-center gap-2 rounded-xl bg-[#1C1C1C] px-4 py-3 text-sm font-semibold text-white shadow-sm transition-[background-color,box-shadow,transform] hover:bg-black hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1C1C1C] focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-65"
        >
          {purchasing ? <LoaderCircle className="animate-spin" size={16} aria-hidden="true" /> : null}
          {purchasing ? 'Đang tạo đơn...' : 'Đăng ký'}
        </button>
      ) : null}
    </article>
  )
}

export default function RecruiterPlansPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const refreshVersion = useDataRefreshVersion()
  const subscription = useRecruiterSubscription()
  const [purchasingPlanId, setPurchasingPlanId] = useState<string | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState<PaidBillingPeriod>('MONTHLY')
  const fetchCatalog = useCallback((signal: AbortSignal) => subscriptionService.getRecruiterPlanCatalog(signal), [])
  const catalog = usePaginatedQuery({ queryKey: 'recruiter-plan-catalog', refreshKey: refreshVersion, fetcher: fetchCatalog })
  const loading = catalog.isInitialLoading || subscription.isInitialLoading
  const error = catalog.error ?? subscription.error
  const plans = catalog.data ?? []
  const hasPaidPlans = plans.some((plan) => plan.billing_period !== 'NONE')
  const visiblePlans = plans.filter((plan) => plan.billing_period === 'NONE' || plan.billing_period === selectedPeriod)
  const selectedPaidPlanCount = visiblePlans.filter((plan) => plan.billing_period === selectedPeriod).length
  const catalogWidth = visiblePlans.length <= 1 ? 'max-w-sm' : visiblePlans.length === 2 ? 'max-w-[720px] md:grid-cols-2' : 'max-w-5xl md:grid-cols-2 lg:grid-cols-3'

  const purchase = async (plan: RecruiterPlanCatalogItem) => {
    if (purchasingPlanId) return
    setPurchasingPlanId(plan.id)
    try {
      const order = await subscriptionService.createPaymentOrder(plan.id)
      navigate(paymentOrderPath(order.id))
    } catch (purchaseError) {
      toast.error(paymentErrorMessage(purchaseError, 'create'))
      setPurchasingPlanId(null)
    }
  }

  return (
    <main className="min-h-[calc(100vh-68px)] bg-white px-4 pb-16 pt-10 sm:px-6 sm:pt-14 lg:px-8 lg:pt-16">
      <header className="mx-auto max-w-3xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Gói dịch vụ GJob</p>
        <h1 className="mt-3 text-4xl font-extrabold tracking-[-0.04em] text-[#1C1C1C] sm:text-5xl">Quyền lợi phù hợp cho bạn</h1>
      </header>

      {!loading && !error && hasPaidPlans && (
        <div className="relative mx-auto mt-8 grid w-fit grid-cols-2 rounded-2xl bg-slate-100 p-1.5 ring-1 ring-slate-200" role="group" aria-label="Chọn chu kỳ thanh toán">
          <span
            aria-hidden="true"
            className={`pointer-events-none absolute bottom-1.5 left-1.5 top-1.5 w-[calc(50%-0.375rem)] rounded-xl bg-slate-950 shadow-sm transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${selectedPeriod === 'YEARLY' ? 'translate-x-full' : 'translate-x-0'}`}
          />
          {([
            ['MONTHLY', 'Hàng tháng'],
            ['YEARLY', 'Hàng năm'],
          ] as const).map(([period, label]) => (
            <button
              key={period}
              type="button"
              aria-pressed={selectedPeriod === period}
              onClick={() => { if (period !== selectedPeriod) setSelectedPeriod(period) }}
              className={`relative z-10 min-w-28 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors duration-200 ${selectedPeriod === period ? 'text-white' : 'text-slate-600 hover:text-slate-950'}`}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <section className="mx-auto mt-14 grid max-w-3xl gap-5 md:grid-cols-2" aria-label="Đang tải danh sách gói">
          {[1, 2].map((key) => <div key={key} className="h-[430px] animate-pulse rounded-[22px] bg-slate-100" />)}
        </section>
      ) : error && !catalog.data ? (
        <section role="alert" className="mx-auto mt-12 max-w-xl rounded-2xl bg-white px-6 py-12 text-center ring-1 ring-slate-200 shadow-[0_10px_35px_-25px_rgba(15,23,42,0.3)]">
          <AlertCircle className="mx-auto text-red-600" size={32} />
          <p className="mt-3 text-sm text-slate-600">{subscriptionErrorMessage(error, 'self')}</p>
          <button type="button" onClick={() => { catalog.refetch(); subscription.refetch() }} className="btn-press mt-5 inline-flex items-center gap-2 rounded-xl bg-[#1C1C1C] px-4 py-2.5 text-sm font-semibold text-white hover:bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1C1C1C] focus-visible:ring-offset-2">
            <RefreshCw size={15} aria-hidden="true" />Thử lại
          </button>
        </section>
      ) : plans.length === 0 ? (
        <section className="mx-auto mt-12 max-w-xl rounded-2xl bg-slate-50 px-6 py-12 text-center ring-1 ring-slate-200">
          <p className="font-semibold text-slate-900">Chưa có gói dịch vụ để hiển thị.</p>
          <p className="mt-2 text-sm text-slate-500">Vui lòng quay lại sau khi danh mục gói được cập nhật.</p>
        </section>
      ) : (
        <div
          key={selectedPeriod}
          className={selectedPeriod === 'YEARLY' ? 'motion-plan-period-from-right' : 'motion-plan-period-from-left'}
          aria-live="polite"
        >
          {hasPaidPlans && selectedPaidPlanCount === 0 && (
            <p className="mx-auto mt-8 max-w-xl rounded-2xl bg-slate-50 px-5 py-4 text-center text-sm text-slate-600 ring-1 ring-slate-200">
              Chưa có gói {selectedPeriod === 'YEARLY' ? 'hàng năm' : 'hàng tháng'} đang mở bán. Quản trị viên có thể tạo gói mới cho chu kỳ này.
            </p>
          )}
          <section className={`mx-auto mt-8 grid gap-5 lg:mt-12 ${catalogWidth}`} aria-label="Danh sách gói dịch vụ">
            {visiblePlans.map((plan) => {
              const current = subscription.data?.effective_plan.code === plan.code
              return (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  current={current}
                  purchasable={isPurchasablePlan(plan, subscription.data?.effective_plan.code)}
                  purchasing={purchasingPlanId === plan.id}
                  onPurchase={() => void purchase(plan)}
                />
              )
            })}
          </section>
        </div>
      )}
    </main>
  )
}
