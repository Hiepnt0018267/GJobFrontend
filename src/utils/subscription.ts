import type {
  BillingPeriod,
  GrantSubscriptionRequest,
  PlanCreateRequest,
  PlanUpdateRequest,
  RecruiterSubscriptionResponse,
  RecruiterFeature,
  SubscriptionPlan,
} from '../types/subscription'

export type PlanFormValues = {
  code: string
  name: string
  description: string
  price: string
  discount_enabled: boolean
  discount_percent: string
  discount_starts_at: string
  discount_ends_at: string
  currency: string
  billing_period: BillingPeriod
  duration_days: string
  is_active: boolean
}

export type GrantFormValues = {
  plan_id: string
  starts_at: string
  expires_at: string
}

export const editablePlanFields = ['name', 'description', 'price', 'discount_percent', 'discount_starts_at', 'discount_ends_at', 'is_active'] as const
export const readonlyPlanFields = ['code', 'currency', 'billing_period', 'duration_days'] as const

export function formatVnd(value: string): string {
  const normalized = value.trim()
  if (!/^\d+$/.test(normalized)) return '—'
  const digits = normalized.replace(/^0+(?=\d)/, '')
  return `${digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.')} ₫`
}

export function billingPeriodLabel(period: BillingPeriod): string {
  if (period === 'NONE') return 'Không chu kỳ'
  return period === 'YEARLY' ? 'Hàng năm' : 'Hàng tháng'
}

export function subscriptionStatusLabel(status: string): string {
  if (status === 'ACTIVE') return 'Đang hiệu lực'
  if (status === 'CANCELLED') return 'Đã thu hồi'
  if (status === 'EXPIRED') return 'Đã hết hạn'
  return status || 'Không xác định'
}

export function subscriptionSourceLabel(source: string): string {
  if (source === 'ADMIN') return 'Quản trị viên'
  if (source === 'PAYMENT') return 'Thanh toán'
  return source || 'Không xác định'
}

export function planDisplayName(plan: { name?: string | null; code: string }): string {
  return plan.name?.trim() || plan.code
}

export function activePaidPlans(plans: SubscriptionPlan[]): SubscriptionPlan[] {
  return plans.filter((plan) => plan.is_active && plan.code !== 'FREE' && plan.price !== '0')
}

export function hasActivePlanDiscount(plan: Pick<SubscriptionPlan, 'discount_is_active' | 'discount_percent' | 'discounted_price'>): boolean {
  return plan.discount_is_active && plan.discount_percent !== null && plan.discounted_price !== null
}

export function effectivePlanPrice(plan: Pick<SubscriptionPlan, 'price' | 'discount_is_active' | 'discount_percent' | 'discounted_price'>): string {
  return hasActivePlanDiscount(plan) ? (plan.discounted_price as string) : plan.price
}

export function discountedPricePreview(price: string, percent: string): string | null {
  if (!/^\d+$/.test(price) || !/^\d+$/.test(percent)) return null
  const rate = Number.parseInt(percent, 10)
  if (rate < 1 || rate > 99) return null
  const original = BigInt(price)
  const rounded = (original * BigInt(100 - rate) + 50n) / 100n
  return (rounded > 0n ? rounded : 1n).toString()
}

function isoToDatetimeLocal(value: string | null | undefined): string {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
  return local.toISOString().slice(0, 16)
}

export function createPlanFormValues(plan?: SubscriptionPlan): PlanFormValues {
  return {
    code: plan?.code ?? '',
    name: plan?.name ?? '',
    description: plan?.description ?? '',
    price: plan?.price ?? '',
    discount_enabled: plan?.discount_percent !== null && plan?.discount_percent !== undefined,
    discount_percent: plan?.discount_percent === null || plan?.discount_percent === undefined ? '' : String(plan.discount_percent),
    discount_starts_at: isoToDatetimeLocal(plan?.discount_starts_at),
    discount_ends_at: isoToDatetimeLocal(plan?.discount_ends_at),
    currency: plan?.currency ?? 'VND',
    billing_period: plan?.billing_period ?? 'MONTHLY',
    duration_days: plan ? (plan.duration_days === null ? '' : String(plan.duration_days)) : '30',
    is_active: plan?.is_active ?? true,
  }
}

export function validatePlanForm(values: PlanFormValues, mode: 'create' | 'edit'): string | null {
  if (mode === 'create' && !/^[A-Z][A-Z0-9_]*$/.test(values.code.trim().toUpperCase())) return 'Mã gói chỉ gồm chữ in hoa, chữ số và dấu gạch dưới.'
  if (!values.name.trim()) return 'Vui lòng nhập tên gói.'
  if (!/^\d+$/.test(values.price.trim())) return 'Giá phải là số nguyên không âm.'
  if (values.discount_enabled) {
    if (!values.discount_percent) return 'Vui lòng nhập phần trăm giảm giá.'
    if (!/^\d+$/.test(values.discount_percent)) return 'Phần trăm giảm giá phải là số nguyên.'
    const percent = Number.parseInt(values.discount_percent, 10)
    if (percent < 1 || percent > 99) return 'Phần trăm giảm giá phải từ 1 đến 99%.'
    if (values.code.trim().toUpperCase() === 'FREE') return 'Gói FREE không thể áp dụng giảm giá.'
    if (values.discount_starts_at && values.discount_ends_at && new Date(values.discount_ends_at) <= new Date(values.discount_starts_at)) return 'Thời gian kết thúc giảm giá phải sau thời gian bắt đầu.'
  }
  if (mode === 'create') {
    const code = values.code.trim().toUpperCase()
    if (code === 'FREE') {
      if (values.price.replace(/^0+(?=\d)/, '') !== '0' || values.billing_period !== 'NONE' || values.duration_days !== '') return 'Gói FREE phải có giá 0, không chu kỳ và không thời hạn.'
    } else if (values.price.replace(/^0+(?=\d)/, '') === '0' || !['MONTHLY', 'YEARLY'].includes(values.billing_period) || !/^\d+$/.test(values.duration_days) || values.duration_days === '0') {
      return 'Gói trả phí cần giá lớn hơn 0, chu kỳ tháng và thời hạn dương.'
    }
  }
  return null
}

export function buildPlanCreatePayload(values: PlanFormValues): PlanCreateRequest {
  return {
    code: values.code.trim().toUpperCase(),
    name: values.name.trim(),
    description: values.description.trim() || null,
    price: values.price.trim(),
    discount_percent: values.discount_enabled ? Number.parseInt(values.discount_percent, 10) : null,
    discount_starts_at: values.discount_enabled ? datetimeLocalToIso(values.discount_starts_at) : null,
    discount_ends_at: values.discount_enabled ? datetimeLocalToIso(values.discount_ends_at) : null,
    currency: values.currency.trim().toUpperCase(),
    billing_period: values.billing_period,
    duration_days: values.duration_days === '' ? null : Number.parseInt(values.duration_days, 10),
    is_active: values.is_active,
  }
}

export function buildPlanUpdatePayload(values: PlanFormValues): PlanUpdateRequest {
  return {
    name: values.name.trim(),
    description: values.description.trim() || null,
    price: values.price.trim(),
    discount_percent: values.discount_enabled ? Number.parseInt(values.discount_percent, 10) : null,
    discount_starts_at: values.discount_enabled ? datetimeLocalToIso(values.discount_starts_at) : null,
    discount_ends_at: values.discount_enabled ? datetimeLocalToIso(values.discount_ends_at) : null,
    is_active: values.is_active,
  }
}

export function datetimeLocalToIso(value: string): string | null {
  if (!value.trim()) return null
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2})?$/.test(value)) throw new TypeError('Invalid datetime-local value')
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) throw new TypeError('Invalid datetime-local value')
  return date.toISOString()
}

export function validGrantDateRange(startsAt: string, expiresAt: string): boolean {
  if (!startsAt || !expiresAt) return true
  const start = new Date(startsAt)
  const end = new Date(expiresAt)
  return !Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime()) && end > start
}

export function buildGrantPayload(values: GrantFormValues): GrantSubscriptionRequest {
  return {
    plan_id: values.plan_id,
    starts_at: datetimeLocalToIso(values.starts_at),
    expires_at: datetimeLocalToIso(values.expires_at),
  }
}

export function isFreeFallback(response: RecruiterSubscriptionResponse): boolean {
  return response.effective_plan.code === 'FREE' && response.subscription === null
}

export function hasRecruiterFeature(
  response: RecruiterSubscriptionResponse | null,
  feature: RecruiterFeature,
): boolean {
  return response?.entitlements?.[feature] === true
}

export function formatSubscriptionDate(value: string | null): string {
  if (!value) return 'Không thời hạn'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Không xác định'
  return new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium', timeStyle: 'short' }).format(date)
}
