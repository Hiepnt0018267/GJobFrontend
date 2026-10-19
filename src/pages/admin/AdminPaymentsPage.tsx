import {
  AlertTriangle, ArrowLeft, ArrowRight, Banknote, CheckCircle2, Clock3,
  Eye, FileClock, RefreshCw, Search, X,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { createPortal } from 'react-dom'
import { useSearchParams } from 'react-router-dom'
import { adminPaymentService } from '../../services/adminPaymentService'
import { subscriptionService } from '../../services/subscriptionService'
import type {
  AdminPaymentOrder, AdminPaymentOrderDetail, AdminPaymentSummary,
  AdminPaymentTransaction, PaymentDisposition, PaymentOrderStatus,
} from '../../types/adminPayment'
import type { SubscriptionPlan } from '../../types/subscription'
import {
  formatPaymentDate, formatVnd, paymentDateBounds, paymentDispositionLabel,
  paymentOrderStatusLabel, paymentTone,
} from '../../utils/adminPayment'

type View = 'transactions' | 'orders'
type Detail = { kind: 'transaction'; value: AdminPaymentTransaction } | { kind: 'order'; value: AdminPaymentOrderDetail }
const PAGE_SIZE = 15

function StatusBadge({ value }: { value: PaymentDisposition | PaymentOrderStatus }) {
  const label = value in paymentDispositionLabel
    ? paymentDispositionLabel[value as PaymentDisposition]
    : paymentOrderStatusLabel[value as PaymentOrderStatus]
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${paymentTone(value)}`}>{label}</span>
}

function SummaryCard({ label, value, hint, icon: Icon }: { label: string; value: string; hint: string; icon: typeof Banknote }) {
  return <article className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
    <div className="flex items-start justify-between gap-4"><div><p className="text-sm font-medium text-slate-500">{label}</p><p className="mt-2 text-2xl font-semibold tabular-nums text-slate-950">{value}</p></div><span className="rounded-xl bg-slate-100 p-2.5 text-slate-700"><Icon size={19} /></span></div>
    <p className="mt-3 text-xs text-slate-500">{hint}</p>
  </article>
}

function DetailDrawer({ detail, loading, onClose }: { detail: Detail | null; loading: boolean; onClose: () => void }) {
  const scrollRef = useRef<HTMLDivElement>(null)

  // Khoá scroll trang nền và reset vị trí cuộn bên trong modal
  useEffect(() => {
    if (!detail && !loading) return
    document.body.style.overflow = 'hidden'
    scrollRef.current?.scrollTo({ top: 0 })
    const close = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose() }
    document.addEventListener('keydown', close)
    return () => {
      document.removeEventListener('keydown', close)
      document.body.style.overflow = ''
    }
  }, [detail, loading, onClose])

  if (!detail && !loading) return null
  const transaction = detail?.kind === 'transaction' ? detail.value : null
  const order = detail?.kind === 'order' ? detail.value : transaction?.order

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
      role="presentation"
      onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Chi tiết thanh toán"
        className="flex flex-col w-full max-w-xl max-h-[85vh] rounded-2xl bg-white shadow-2xl overflow-hidden"
      >
        {/* Header cố định trên cùng */}
        <header className="flex items-start justify-between border-b border-slate-200 bg-white px-6 py-5 shrink-0">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Chỉ đọc</p>
            <h2 className="mt-1 text-xl font-semibold text-slate-950">Chi tiết thanh toán</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 transition-colors"
          >
            <X size={20} />
          </button>
        </header>

        {/* Vùng nội dung cuộn mượt mà độc lập */}
        <div ref={scrollRef} className="overflow-y-auto px-6 py-6 flex-1">
          {loading && (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((key) => <div key={key} className="h-16 animate-pulse rounded-xl bg-slate-100" />)}
            </div>
          )}
          {!loading && detail && (
            <div className="space-y-6">
              {transaction && (
                <section>
                  <h3 className="text-sm font-semibold text-slate-950">Giao dịch ngân hàng</h3>
                  <dl className="mt-3 grid gap-3 rounded-2xl bg-slate-50 p-4 text-sm">
                    <div className="flex justify-between gap-4"><dt className="text-slate-500">Trạng thái</dt><dd><StatusBadge value={transaction.disposition} /></dd></div>
                    <div className="flex justify-between gap-4"><dt className="text-slate-500">Mã SePay</dt><dd className="break-all text-right font-medium">{transaction.provider_transaction_id}</dd></div>
                    <div className="flex justify-between gap-4"><dt className="text-slate-500">Số tiền</dt><dd className="font-semibold tabular-nums">{formatVnd(transaction.amount)}</dd></div>
                    <div className="flex justify-between gap-4"><dt className="text-slate-500">Thời gian</dt><dd>{formatPaymentDate(transaction.transaction_date)}</dd></div>
                    <div className="flex justify-between gap-4"><dt className="text-slate-500">Nội dung</dt><dd className="max-w-[65%] break-words text-right">{transaction.content || '—'}</dd></div>
                    <div className="flex justify-between gap-4"><dt className="text-slate-500">Tài khoản nhận</dt><dd>{transaction.destination_account || '—'}</dd></div>
                  </dl>
                </section>
              )}
              {order && (
                <section>
                  <h3 className="text-sm font-semibold text-slate-950">Đơn thanh toán</h3>
                  <dl className="mt-3 grid gap-3 rounded-2xl bg-slate-50 p-4 text-sm">
                    <div className="flex justify-between gap-4"><dt className="text-slate-500">Mã thanh toán</dt><dd className="font-semibold">{order.payment_code}</dd></div>
                    <div className="flex justify-between gap-4"><dt className="text-slate-500">Trạng thái</dt><dd><StatusBadge value={order.status} /></dd></div>
                    <div className="flex justify-between gap-4"><dt className="text-slate-500">Gói</dt><dd className="text-right">{order.plan_name} · {order.plan_code}</dd></div>
                    <div className="flex justify-between gap-4"><dt className="text-slate-500">Nhà tuyển dụng</dt><dd className="text-right"><strong className="block">{order.recruiter.full_name}</strong><span className="text-slate-500">{order.recruiter.email}</span></dd></div>
                    <div className="flex justify-between gap-4"><dt className="text-slate-500">Khởi tạo</dt><dd>{formatPaymentDate(order.created_at)}</dd></div>
                    <div className="flex justify-between gap-4"><dt className="text-slate-500">Hết hạn</dt><dd>{formatPaymentDate(order.expires_at)}</dd></div>
                    {detail.kind === 'order' && <div className="flex justify-between gap-4"><dt className="text-slate-500">Thời hạn gói</dt><dd>{detail.value.duration_days} ngày</dd></div>}
                  </dl>
                </section>
              )}
              {detail.kind === 'order' && (
                <section>
                  <h3 className="text-sm font-semibold text-slate-950">Giao dịch liên quan ({detail.value.transactions.length})</h3>
                  {detail.value.transactions.length === 0
                    ? <p className="mt-3 rounded-xl bg-slate-50 p-4 text-sm text-slate-500">Chưa có giao dịch ngân hàng.</p>
                    : <div className="mt-3 space-y-2">{detail.value.transactions.map((item) => (
                        <div key={item.id} className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 p-3 text-sm">
                          <div><strong className="block">{formatVnd(item.amount)}</strong><span className="text-xs text-slate-500">{formatPaymentDate(item.transaction_date)}</span></div>
                          <StatusBadge value={item.disposition} />
                        </div>
                      ))}
                    </div>
                  }
                </section>
              )}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}

export default function AdminPaymentsPage() {
  const [params, setParams] = useSearchParams()
  const view = (params.get('view') === 'orders' ? 'orders' : 'transactions') as View
  const page = Math.max(1, Number(params.get('page')) || 1)
  const [searchInput, setSearchInput] = useState(params.get('search') ?? '')
  const [summary, setSummary] = useState<AdminPaymentSummary | null>(null)
  const [transactions, setTransactions] = useState<AdminPaymentTransaction[]>([])
  const [orders, setOrders] = useState<AdminPaymentOrder[]>([])
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [detail, setDetail] = useState<Detail | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)

  const filters = useMemo(() => {
    const dates = paymentDateBounds(params.get('from') ?? '', params.get('to') ?? '')
    return {
      search: params.get('search') || undefined,
      disposition: (params.get('disposition') || undefined) as PaymentDisposition | undefined,
      order_status: (params.get('status') || undefined) as PaymentOrderStatus | undefined,
      plan_code: params.get('plan') || undefined,
      recruiter_id: params.get('recruiter_id') || undefined,
      ...dates,
      page,
      page_size: PAGE_SIZE,
    }
  }, [page, params])

  useEffect(() => {
    const controller = new AbortController()
    queueMicrotask(() => {
      if (!controller.signal.aborted) { setLoading(true); setError(null) }
    })
    const listRequest = view === 'transactions'
      ? adminPaymentService.getTransactions(filters, controller.signal)
      : adminPaymentService.getOrders(filters, controller.signal)
    Promise.all([
      listRequest,
      adminPaymentService.getSummary({ plan_code: filters.plan_code, recruiter_id: filters.recruiter_id, date_from: filters.date_from, date_to: filters.date_to }, controller.signal),
      subscriptionService.getSubscriptionPlans({ page: 1, page_size: 100 }, controller.signal),
    ]).then(([list, nextSummary, planList]) => {
      if ('items' in list) {
        if (view === 'transactions') setTransactions(list.items as AdminPaymentTransaction[])
        else setOrders(list.items as AdminPaymentOrder[])
        setTotal(list.total)
      }
      setSummary(nextSummary); setPlans(planList.items)
    }).catch((requestError: unknown) => {
      if ((requestError as { name?: string }).name !== 'CanceledError') setError('Không thể tải lịch sử thanh toán. Vui lòng thử lại.')
    }).finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [filters, refreshKey, view])

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value); else next.delete(key)
    if (key !== 'page') next.delete('page')
    setParams(next)
  }
  const submitSearch = (event: FormEvent) => { event.preventDefault(); updateParam('search', searchInput.trim()) }
  const changeView = (nextView: View) => {
    const next = new URLSearchParams(params); next.set('view', nextView); next.delete('page')
    if (nextView === 'orders') next.delete('disposition')
    setParams(next)
  }
  const openDetail = async (kind: 'transaction' | 'order', id: string) => {
    setDetail(null); setDetailLoading(true)
    try {
      if (kind === 'transaction') setDetail({ kind, value: await adminPaymentService.getTransaction(id) })
      else setDetail({ kind, value: await adminPaymentService.getOrder(id) })
    } catch { setError('Không thể tải chi tiết thanh toán.') }
    finally { setDetailLoading(false) }
  }
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return <div className="min-h-screen bg-slate-50"><main className="mx-auto max-w-[1500px] px-4 py-8 sm:px-6 lg:px-8">
    <header className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-6 lg:flex-row lg:items-end"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Thương mại</p><h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Lịch sử giao dịch</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Theo dõi giao dịch SePay và đơn mua gói của nhà tuyển dụng. Dữ liệu tại đây chỉ dùng để đối soát.</p></div><button type="button" onClick={() => setRefreshKey((key) => key + 1)} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100"><RefreshCw size={16} />Làm mới</button></header>

    <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5" aria-label="Tổng quan thanh toán">
      <SummaryCard label="Doanh thu ghi nhận" value={summary ? formatVnd(summary.revenue) : '—'} hint="Chỉ giao dịch đã áp dụng" icon={Banknote} />
      <SummaryCard label="Giao dịch thành công" value={summary?.successful_transactions.toLocaleString('vi-VN') ?? '—'} hint="Đã kích hoạt gói" icon={CheckCircle2} />
      <SummaryCard label="Cần đối soát" value={summary?.needs_review.toLocaleString('vi-VN') ?? '—'} hint="Không khớp hoặc sai thông tin" icon={AlertTriangle} />
      <SummaryCard label="Đơn đang chờ" value={summary?.pending_orders.toLocaleString('vi-VN') ?? '—'} hint="Còn hiệu lực thanh toán" icon={Clock3} />
      <SummaryCard label="Đơn đã thanh toán" value={summary?.paid_orders.toLocaleString('vi-VN') ?? '—'} hint="Tổng đơn hoàn tất" icon={FileClock} />
    </section>

    <section className="mt-6 overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200">
      <div className="border-b border-slate-200 p-4 sm:p-5"><div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between"><div className="inline-flex w-fit rounded-xl bg-slate-100 p-1" role="tablist"><button type="button" role="tab" aria-selected={view === 'transactions'} onClick={() => changeView('transactions')} className={`rounded-lg px-4 py-2 text-sm font-semibold ${view === 'transactions' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500'}`}>Giao dịch ngân hàng</button><button type="button" role="tab" aria-selected={view === 'orders'} onClick={() => changeView('orders')} className={`rounded-lg px-4 py-2 text-sm font-semibold ${view === 'orders' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500'}`}>Đơn thanh toán</button></div><span className="text-sm text-slate-500"><strong className="tabular-nums text-slate-950">{total}</strong> kết quả</span></div>
        <form onSubmit={submitSearch} className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-6"><label className="relative xl:col-span-2"><span className="sr-only">Tìm kiếm</span><Search className="absolute left-3 top-3 text-slate-400" size={17} /><input value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="Mã giao dịch, mã đơn, email..." className="h-11 w-full rounded-xl border border-slate-200 pl-10 pr-3 text-sm outline-none focus:border-slate-400" /></label>
          {view === 'transactions' && <select aria-label="Kết quả xử lý" value={params.get('disposition') ?? ''} onChange={(event) => updateParam('disposition', event.target.value)} className="h-11 rounded-xl border border-slate-200 px-3 text-sm"><option value="">Mọi kết quả</option>{Object.entries(paymentDispositionLabel).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>}
          <select aria-label="Trạng thái đơn" value={params.get('status') ?? ''} onChange={(event) => updateParam('status', event.target.value)} className="h-11 rounded-xl border border-slate-200 px-3 text-sm"><option value="">Mọi trạng thái đơn</option>{Object.entries(paymentOrderStatusLabel).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
          <select aria-label="Gói dịch vụ" value={params.get('plan') ?? ''} onChange={(event) => updateParam('plan', event.target.value)} className="h-11 rounded-xl border border-slate-200 px-3 text-sm"><option value="">Mọi gói dịch vụ</option>{plans.map((plan) => <option key={plan.id} value={plan.code}>{plan.name}</option>)}</select>
          <button type="submit" className="h-11 rounded-xl bg-slate-950 px-4 text-sm font-semibold text-white">Tìm kiếm</button>
        </form>
        <div className="mt-3 flex flex-wrap items-center gap-3"><label className="text-xs font-medium text-slate-500">Từ ngày <input type="date" value={params.get('from') ?? ''} onChange={(event) => updateParam('from', event.target.value)} className="ml-2 h-9 rounded-lg border border-slate-200 px-2 text-sm text-slate-700" /></label><label className="text-xs font-medium text-slate-500">Đến ngày <input type="date" value={params.get('to') ?? ''} onChange={(event) => updateParam('to', event.target.value)} className="ml-2 h-9 rounded-lg border border-slate-200 px-2 text-sm text-slate-700" /></label></div>
      </div>

      {error && <div role="alert" className="m-5 flex items-center justify-between gap-4 rounded-xl bg-red-50 p-4 text-sm text-red-700"><span>{error}</span><button type="button" onClick={() => setRefreshKey((key) => key + 1)} className="font-semibold underline">Thử lại</button></div>}
      {loading ? <div className="space-y-3 p-5">{[1, 2, 3, 4, 5].map((key) => <div key={key} className="h-14 animate-pulse rounded-xl bg-slate-100" />)}</div> : !error && total === 0 ? <div className="py-16 text-center"><FileClock className="mx-auto text-slate-300" size={36} /><h2 className="mt-4 font-semibold text-slate-950">Chưa có dữ liệu phù hợp</h2><p className="mt-1 text-sm text-slate-500">Thử thay đổi bộ lọc hoặc khoảng thời gian.</p></div> : !error && <div className="overflow-x-auto"><table className="min-w-full text-left text-sm"><thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500"><tr>{view === 'transactions' ? <><th className="px-5 py-3">Giao dịch</th><th className="px-5 py-3">Nhà tuyển dụng / Đơn</th><th className="px-5 py-3">Số tiền</th><th className="px-5 py-3">Kết quả</th><th className="px-5 py-3">Thời gian</th></> : <><th className="px-5 py-3">Mã đơn</th><th className="px-5 py-3">Nhà tuyển dụng</th><th className="px-5 py-3">Gói / Số tiền</th><th className="px-5 py-3">Trạng thái</th><th className="px-5 py-3">Khởi tạo</th></>}<th className="px-5 py-3 text-right">Chi tiết</th></tr></thead><tbody className="divide-y divide-slate-100">
        {view === 'transactions' ? transactions.map((item) => <tr key={item.id} className="hover:bg-slate-50"><td className="px-5 py-4"><strong className="block text-slate-950">{item.provider_transaction_id}</strong><span className="mt-1 block max-w-56 truncate text-xs text-slate-500">{item.content || item.reference_code || 'Không có nội dung'}</span></td><td className="px-5 py-4">{item.order ? <><strong className="block text-slate-800">{item.order.recruiter.full_name}</strong><span className="text-xs text-slate-500">{item.order.payment_code}</span></> : <span className="text-slate-400">Chưa khớp đơn</span>}</td><td className="px-5 py-4 font-semibold tabular-nums">{formatVnd(item.amount)}</td><td className="px-5 py-4"><StatusBadge value={item.disposition} /></td><td className="px-5 py-4 whitespace-nowrap text-slate-600">{formatPaymentDate(item.transaction_date)}</td><td className="px-5 py-4 text-right"><button type="button" onClick={() => void openDetail('transaction', item.id)} aria-label={`Xem giao dịch ${item.provider_transaction_id}`} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-950"><Eye size={17} /></button></td></tr>) : orders.map((item) => <tr key={item.id} className="hover:bg-slate-50"><td className="px-5 py-4 font-semibold text-slate-950">{item.payment_code}</td><td className="px-5 py-4"><strong className="block text-slate-800">{item.recruiter.full_name}</strong><span className="text-xs text-slate-500">{item.recruiter.email}</span></td><td className="px-5 py-4"><strong className="block text-slate-800">{item.plan_name}</strong><span className="text-xs tabular-nums text-slate-500">{formatVnd(item.amount)}</span></td><td className="px-5 py-4"><StatusBadge value={item.status} /></td><td className="px-5 py-4 whitespace-nowrap text-slate-600">{formatPaymentDate(item.created_at)}</td><td className="px-5 py-4 text-right"><button type="button" onClick={() => void openDetail('order', item.id)} aria-label={`Xem đơn ${item.payment_code}`} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-950"><Eye size={17} /></button></td></tr>)}</tbody></table></div>}
      {!loading && totalPages > 1 && <nav aria-label="Phân trang lịch sử thanh toán" className="flex items-center justify-between border-t border-slate-200 px-5 py-4"><button type="button" disabled={page <= 1} onClick={() => updateParam('page', String(page - 1))} className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-semibold disabled:opacity-35"><ArrowLeft size={16} />Trước</button><span className="text-sm text-slate-500">Trang <strong className="text-slate-950">{page}</strong> / {totalPages}</span><button type="button" disabled={page >= totalPages} onClick={() => updateParam('page', String(page + 1))} className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-semibold disabled:opacity-35">Sau<ArrowRight size={16} /></button></nav>}
    </section>
  </main><DetailDrawer detail={detail} loading={detailLoading} onClose={() => { setDetail(null); setDetailLoading(false) }} /></div>
}
