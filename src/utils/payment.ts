import type { PaymentOrderStatus, RecruiterPlanCatalogItem } from '../types/subscription'

const TERMINAL_PAYMENT_STATUSES = new Set<PaymentOrderStatus>(['PAID', 'EXPIRED', 'CANCELLED'])

export function paymentOrderPath(orderId: string): string {
  return '/recruiter/payments/' + encodeURIComponent(orderId)
}

export function isTerminalPaymentStatus(status: PaymentOrderStatus): boolean {
  return TERMINAL_PAYMENT_STATUSES.has(status)
}

export function shouldPollPayment(status: PaymentOrderStatus, visibilityState: string): boolean {
  return status === 'PENDING' && visibilityState === 'visible'
}

export function isPurchasablePlan(plan: RecruiterPlanCatalogItem, currentPlanCode?: string): boolean {
  return (
    plan.is_active
    && plan.code !== 'FREE'
    && plan.code !== currentPlanCode
    && /^\d+$/.test(plan.price)
    && !/^0+$/.test(plan.price)
  )
}

export async function copyPaymentValue(
  value: string,
  writeText: (text: string) => Promise<void>,
): Promise<void> {
  await writeText(value)
}
