export type PaymentOrderStatus = 'PENDING' | 'PAID' | 'EXPIRED' | 'CANCELLED'
export type PaymentDisposition =
  | 'APPLIED'
  | 'UNMATCHED'
  | 'AMOUNT_MISMATCH'
  | 'ORDER_EXPIRED'
  | 'ORDER_CANCELLED'
  | 'OUTGOING_IGNORED'
  | 'ACCOUNT_MISMATCH'

export type AdminPaymentRecruiter = {
  id: string
  full_name: string
  email: string
}

export type AdminPaymentOrder = {
  id: string
  payment_code: string
  status: PaymentOrderStatus
  plan_code: string
  plan_name: string
  amount: string
  original_amount: string
  discount_percent: number
  discount_amount: string
  currency: string
  expires_at: string
  paid_at: string | null
  created_at: string
  recruiter: AdminPaymentRecruiter
}

export type AdminPaymentTransaction = {
  id: string
  provider: 'SEPAY'
  provider_transaction_id: string
  amount: string
  transaction_date: string
  reference_code: string | null
  content: string | null
  destination_account: string | null
  disposition: PaymentDisposition
  created_at: string
  order: AdminPaymentOrder | null
}

export type AdminPaymentOrderDetail = AdminPaymentOrder & {
  billing_period: string
  duration_days: number
  transactions: AdminPaymentTransaction[]
}

export type AdminPaymentSummary = {
  successful_transactions: number
  revenue: string
  needs_review: number
  pending_orders: number
  paid_orders: number
}

export type AdminPaymentTransactionList = {
  items: AdminPaymentTransaction[]
  total: number
  page: number
  page_size: number
}

export type AdminPaymentOrderList = {
  items: AdminPaymentOrder[]
  total: number
  page: number
  page_size: number
}

export type AdminPaymentFilters = {
  search?: string
  disposition?: PaymentDisposition
  order_status?: PaymentOrderStatus
  plan_code?: string
  recruiter_id?: string
  date_from?: string
  date_to?: string
  page?: number
  page_size?: number
}
