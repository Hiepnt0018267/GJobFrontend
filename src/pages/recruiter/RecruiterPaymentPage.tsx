import {
  AlertCircle,
  ArrowLeft,
  Check,
  CheckCircle2,
  Clock3,
  Copy,
  Landmark,
  LoaderCircle,
  RefreshCw,
  ShieldCheck,
  XCircle,
} from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useRecruiterSubscription } from '../../hooks/useRecruiterSubscription'
import { useToast } from '../../hooks/useToast'
import { subscriptionService } from '../../services/subscriptionService'
import type { PaymentOrder } from '../../types/subscription'
import { paymentErrorMessage } from '../../utils/apiError'
import { notifyDataRefresh } from '../../utils/dataRefresh'
import { copyPaymentValue, shouldPollPayment } from '../../utils/payment'
import { formatVnd, planDisplayName } from '../../utils/subscription'

const POLL_INTERVAL_MS = 5_000

function remainingTime(expiresAt: string, now: number): string {
  const milliseconds = Math.max(0, new Date(expiresAt).getTime() - now)
  const totalSeconds = Math.floor(milliseconds / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return String(minutes).padStart(2, '0') + ':' + String(seconds).padStart(2, '0')
}

function statusLabel(status: PaymentOrder['status']): string {
  if (status === 'PAID') return 'Đã thanh toán'
  if (status === 'EXPIRED') return 'Đã hết hạn'
  if (status === 'CANCELLED') return 'Đã hủy'
  return 'Đang chờ thanh toán'
}

type CopyRowProps = {
  label: string
  value: string
  prominent?: boolean
  copied: boolean
  onCopy: () => void
}

function CopyRow({ label, value, prominent = false, copied, onCopy }: CopyRowProps) {
  return (
    <div className={'rounded-2xl border p-4 ' + (prominent ? 'border-amber-200 bg-amber-50' : 'border-slate-200 bg-white')}>
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{label}</p>
      <div className="mt-2 flex items-center justify-between gap-4">
        <strong className={'break-all ' + (prominent ? 'text-lg tracking-[0.08em] text-slate-950' : 'text-base text-slate-900')}>{value}</strong>
        <button
          type="button"
          onClick={onCopy}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1C1C1C]"
        >
          {copied ? <Check size={15} aria-hidden="true" /> : <Copy size={15} aria-hidden="true" />}
          {copied ? 'Đã sao chép' : 'Sao chép'}
        </button>
      </div>
    </div>
  )
}

export default function RecruiterPaymentPage() {
  const { orderId = '' } = useParams()
  const toast = useToast()
  const subscription = useRecruiterSubscription()
  const refetchSubscription = subscription.refetch
  const [order, setOrder] = useState<PaymentOrder | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [now, setNow] = useState(() => Date.now())
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const paidHandled = useRef(false)
  const orderStatus = order?.status

  const fetchOrder = useCallback(async (signal?: AbortSignal) => {
    if (!orderId) throw new Error('Missing payment order id')
    const nextOrder = await subscriptionService.getPaymentOrder(orderId, signal)
    setOrder(nextOrder)
    setError(null)
    return nextOrder
  }, [orderId])

  useEffect(() => {
    const controller = new AbortController()
    const timeoutId = window.setTimeout(() => {
      setLoading(true)
      setOrder(null)
      setError(null)
      paidHandled.current = false
      void fetchOrder(controller.signal)
        .catch((requestError: unknown) => {
          if (!controller.signal.aborted) setError(paymentErrorMessage(requestError, 'read'))
        })
        .finally(() => {
          if (!controller.signal.aborted) setLoading(false)
        })
    }, 0)
    return () => {
      window.clearTimeout(timeoutId)
      controller.abort()
    }
  }, [fetchOrder])

  useEffect(() => {
    if (cancelling || !orderStatus || !shouldPollPayment(orderStatus, document.visibilityState)) return
    let active = true
    let controller: AbortController | null = null

    const poll = () => {
      if (!active || document.visibilityState !== 'visible') return
      controller?.abort()
      controller = new AbortController()
      void fetchOrder(controller.signal).catch((requestError: unknown) => {
        if (active && !controller?.signal.aborted) setError(paymentErrorMessage(requestError, 'read'))
      })
    }
    const intervalId = window.setInterval(poll, POLL_INTERVAL_MS)
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') poll()
    }
    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => {
      active = false
      controller?.abort()
      window.clearInterval(intervalId)
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [cancelling, fetchOrder, orderStatus])

  useEffect(() => {
    if (order?.status !== 'PENDING') return
    const intervalId = window.setInterval(() => setNow(Date.now()), 1_000)
    return () => window.clearInterval(intervalId)
  }, [order?.status])

  useEffect(() => {
    if (order?.status !== 'PAID' || paidHandled.current) return
    paidHandled.current = true
    refetchSubscription()
    notifyDataRefresh()
    toast.success('Thanh toán thành công. Gói dịch vụ của bạn đã được cập nhật.')
  }, [order?.status, refetchSubscription, toast])

  useEffect(() => {
    if (!cancelDialogOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !cancelling) setCancelDialogOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [cancelDialogOpen, cancelling])

  const copy = async (field: string, value: string) => {
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable')
      await copyPaymentValue(value, (text) => navigator.clipboard.writeText(text))
      setCopiedField(field)
      toast.success('Đã sao chép')
      window.setTimeout(() => setCopiedField((current) => current === field ? null : current), 1_800)
    } catch {
      toast.error('Không thể sao chép tự động. Vui lòng sao chép thủ công.')
    }
  }

  const cancelOrder = async () => {
    if (!order || order.status !== 'PENDING' || cancelling) return
    setCancelling(true)
    try {
      const cancelledOrder = await subscriptionService.cancelPaymentOrder(order.id)
      setOrder(cancelledOrder)
      setError(null)
      setCancelDialogOpen(false)
      notifyDataRefresh()
      toast.success('Đã hủy đơn thanh toán.')
    } catch (cancelError) {
      const message = paymentErrorMessage(cancelError, 'cancel')
      try { await fetchOrder() } catch { /* Keep the current order visible. */ }
      setError(message)
      setCancelDialogOpen(false)
      toast.error(message)
    } finally {
      setCancelling(false)
    }
  }

  if (loading) {
    return <main className="grid min-h-[calc(100vh-68px)] place-items-center bg-slate-50 px-4"><div className="text-center"><LoaderCircle className="mx-auto animate-spin text-slate-700" size={32} /><p className="mt-3 text-sm text-slate-500">Đang tải đơn thanh toán...</p></div></main>
  }

  if (!order) {
    return (
      <main className="grid min-h-[calc(100vh-68px)] place-items-center bg-slate-50 px-4">
        <section role="alert" className="w-full max-w-lg rounded-3xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-200">
          <AlertCircle className="mx-auto text-red-500" size={36} />
          <h1 className="mt-4 text-xl font-bold text-slate-950">Chưa thể tải đơn thanh toán</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">{error ?? 'Đơn thanh toán không hợp lệ.'}</p>
          <div className="mt-6 flex justify-center gap-3">
            <Link to="/recruiter/plans" className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Quay lại gói dịch vụ</Link>
            <button type="button" onClick={() => window.location.reload()} className="inline-flex items-center gap-2 rounded-xl bg-[#1C1C1C] px-4 py-2.5 text-sm font-semibold text-white hover:bg-black"><RefreshCw size={15} />Thử lại</button>
          </div>
        </section>
      </main>
    )
  }

  const terminal = order.status !== 'PENDING'
  const statusTone = order.status === 'PAID'
    ? 'bg-emerald-50 text-emerald-700 ring-emerald-200'
    : terminal
      ? 'bg-slate-100 text-slate-600 ring-slate-200'
      : 'bg-amber-50 text-amber-700 ring-amber-200'

  return (
    <main className="min-h-[calc(100vh-68px)] bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <Link to="/recruiter/plans" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-950"><ArrowLeft size={16} />Quay lại quản lý dịch vụ</Link>

        <header className="mt-6 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Thanh toán chuyển khoản</p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-[-0.035em] text-slate-950 sm:text-4xl">{planDisplayName(order.plan)}</h1>
            <p className="mt-2 text-sm text-slate-600">Mã đơn <span className="font-mono text-slate-800">{order.id}</span></p>
          </div>
          <span className={'inline-flex w-fit items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ring-1 ' + statusTone}>
            {order.status === 'PAID' ? <CheckCircle2 size={16} /> : terminal ? <XCircle size={16} /> : <Clock3 size={16} />}
            {statusLabel(order.status)}
          </span>
        </header>

        {error ? (
          <div role="status" className="mt-5 flex items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            <AlertCircle className="mt-0.5 shrink-0" size={17} aria-hidden="true" />
            <span>{error} Thông tin thanh toán hiện tại vẫn được giữ nguyên.</span>
          </div>
        ) : null}

        {order.status === 'PAID' && (
          <section className="mt-7 rounded-3xl border border-emerald-200 bg-emerald-50 p-6 sm:p-8">
            <CheckCircle2 className="text-emerald-600" size={34} />
            <h2 className="mt-4 text-2xl font-bold text-emerald-950">Thanh toán thành công</h2>
            <p className="mt-2 text-sm leading-6 text-emerald-800">Gói dịch vụ đã được xác nhận bởi backend và quyền lợi tài khoản đang được làm mới.</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link to="/recruiter/plans" className="rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800">Xem gói hiện tại</Link>
              <Link to="/recruiter" className="rounded-xl border border-emerald-300 px-4 py-2.5 text-sm font-semibold text-emerald-800 hover:bg-emerald-100">Về tổng quan</Link>
            </div>
          </section>
        )}

        {(order.status === 'EXPIRED' || order.status === 'CANCELLED') && (
          <section className="mt-7 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8">
            <XCircle className="text-slate-500" size={34} />
            <h2 className="mt-4 text-2xl font-bold text-slate-950">{order.status === 'EXPIRED' ? 'Phiên thanh toán đã hết hạn.' : 'Đơn thanh toán đã được hủy.'}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">Đơn này không còn nhận thanh toán. Hãy tạo một đơn mới để nhận đúng mã và thời hạn.</p>
            <Link to="/recruiter/plans" className="mt-5 inline-flex rounded-xl bg-[#1C1C1C] px-4 py-2.5 text-sm font-semibold text-white hover:bg-black">Tạo đơn thanh toán mới</Link>
          </section>
        )}

        {order.status === 'PENDING' && (
          <div className="mt-7 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
            <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-7">
              <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-5">
                <div>
                  <p className="text-sm text-slate-500">Số tiền cần chuyển</p>
                  <p className="mt-1 text-3xl font-extrabold tracking-[-0.04em] text-slate-950">{formatVnd(order.amount)}</p>
                </div>
                <div className="rounded-2xl bg-slate-100 p-3 text-slate-700"><Landmark size={24} /></div>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div><p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-400">Ngân hàng</p><p className="mt-1 font-semibold text-slate-900">{order.bank.bank_name}</p></div>
                <div><p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-400">Chủ tài khoản</p><p className="mt-1 font-semibold text-slate-900">{order.bank.account_name}</p></div>
              </div>

              <div className="mt-5 space-y-3">
                <CopyRow label="Số tài khoản" value={order.bank.account_number} copied={copiedField === 'account'} onCopy={() => void copy('account', order.bank.account_number)} />
                <CopyRow label="Số tiền" value={order.amount} copied={copiedField === 'amount'} onCopy={() => void copy('amount', order.amount)} />
                <CopyRow label="Nội dung chuyển khoản" value={order.transfer_content} prominent copied={copiedField === 'content'} onCopy={() => void copy('content', order.transfer_content)} />
              </div>

              <div className="mt-5 flex items-start gap-3 rounded-2xl bg-slate-950 px-4 py-4 text-white">
                <ShieldCheck className="mt-0.5 shrink-0 text-amber-300" size={20} />
                <div><p className="font-semibold">Vui lòng giữ nguyên nội dung chuyển khoản.</p><p className="mt-1 text-sm leading-5 text-slate-300">Hệ thống chỉ kích hoạt gói khi mã đơn, tài khoản nhận và số tiền khớp chính xác.</p></div>
              </div>
            </section>

            <aside className="h-fit rounded-3xl bg-white p-6 text-center shadow-sm ring-1 ring-slate-200">
              <div className="mx-auto overflow-hidden rounded-2xl border border-slate-200 bg-white p-3">
                <img src={order.qr.image_url} alt={'Mã QR thanh toán cho ' + planDisplayName(order.plan)} className="mx-auto aspect-square w-full object-contain" referrerPolicy="no-referrer" />
              </div>
              <p className="mt-5 text-sm font-semibold text-slate-900">Quét QR bằng ứng dụng ngân hàng</p>
              <p className="mt-1 text-xs leading-5 text-slate-500">Thông tin trong QR do backend tạo từ đơn thanh toán này.</p>
              <div className="mt-5 rounded-2xl bg-amber-50 px-4 py-3 ring-1 ring-amber-200">
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-amber-700">Thời gian còn lại</p>
                <p className="mt-1 font-mono text-2xl font-bold text-amber-900">{remainingTime(order.expires_at, now)}</p>
              </div>
              <div className="mt-4 inline-flex items-center gap-2 text-xs text-slate-500"><LoaderCircle className="animate-spin" size={14} />Tự động kiểm tra mỗi 5 giây</div>
              <button type="button" onClick={() => setCancelDialogOpen(true)} className="btn-press mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 transition-colors hover:bg-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"><XCircle size={16} aria-hidden="true" />Hủy giao dịch</button>
            </aside>
          </div>
        )}
      </div>
      {cancelDialogOpen && order.status === 'PENDING' && (
        <div className="motion-backdrop fixed inset-0 z-50 grid place-items-center bg-slate-950/45 px-4 backdrop-blur-[2px]" onMouseDown={(event) => { if (event.target === event.currentTarget && !cancelling) setCancelDialogOpen(false) }}>
          <section role="dialog" aria-modal="true" aria-labelledby="cancel-payment-title" className="motion-dialog w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl ring-1 ring-slate-200 sm:p-7">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-50 text-red-600"><XCircle size={22} aria-hidden="true" /></span>
            <h2 id="cancel-payment-title" className="mt-5 text-xl font-bold text-slate-950">Hủy đơn thanh toán này?</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">Chỉ hủy nếu bạn chưa chuyển khoản. Sau khi hủy, mã thanh toán này không còn dùng để kích hoạt gói và bạn cần tạo đơn mới nếu muốn tiếp tục.</p>
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button type="button" disabled={cancelling} onClick={() => setCancelDialogOpen(false)} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-50">Tiếp tục chờ</button>
              <button type="button" disabled={cancelling} onClick={() => void cancelOrder()} className="btn-press inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-wait disabled:opacity-60">{cancelling ? <LoaderCircle className="animate-spin" size={16} aria-hidden="true" /> : <XCircle size={16} aria-hidden="true" />}{cancelling ? 'Đang hủy...' : 'Xác nhận hủy'}</button>
            </div>
          </section>
        </div>
      )}
    </main>
  )
}
