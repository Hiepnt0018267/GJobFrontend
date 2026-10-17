import type { PaymentDisposition, PaymentOrderStatus } from '../types/adminPayment'

export const paymentDispositionLabel: Record<PaymentDisposition, string> = {
  APPLIED: 'Đã ghi nhận',
  UNMATCHED: 'Không khớp đơn',
  AMOUNT_MISMATCH: 'Sai số tiền',
  ORDER_EXPIRED: 'Đơn đã hết hạn',
  ORDER_CANCELLED: 'Đơn đã hủy',
  OUTGOING_IGNORED: 'Giao dịch đi',
  ACCOUNT_MISMATCH: 'Sai tài khoản nhận',
}

export const paymentOrderStatusLabel: Record<PaymentOrderStatus, string> = {
  PENDING: 'Chờ thanh toán', PAID: 'Đã thanh toán', EXPIRED: 'Hết hạn', CANCELLED: 'Đã hủy',
}

export function paymentTone(value: PaymentDisposition | PaymentOrderStatus) {
  if (value === 'APPLIED' || value === 'PAID') return 'bg-emerald-50 text-emerald-700 ring-emerald-200'
  if (value === 'PENDING') return 'bg-amber-50 text-amber-700 ring-amber-200'
  if (value === 'OUTGOING_IGNORED' || value === 'CANCELLED') return 'bg-slate-100 text-slate-600 ring-slate-200'
  return 'bg-red-50 text-red-700 ring-red-200'
}

export function formatVnd(value: string | number) {
  return `${new Intl.NumberFormat('vi-VN').format(Number(value))} ₫`
}

export function formatPaymentDate(value: string) {
  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'short', timeStyle: 'short',
  }).format(new Date(value))
}

export function paymentDateBounds(from: string, to: string) {
  const start = from ? new Date(`${from}T00:00:00`) : null
  const end = to ? new Date(`${to}T00:00:00`) : null
  if (end) end.setDate(end.getDate() + 1)
  return {
    date_from: start?.toISOString(),
    date_to: end?.toISOString(),
  }
}
