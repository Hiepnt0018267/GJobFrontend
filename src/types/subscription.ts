export type BillingPeriod = 'NONE' | 'MONTHLY'
export type SubscriptionStatus = 'ACTIVE' | 'CANCELLED' | 'EXPIRED'
export type SubscriptionSource = 'ADMIN' | 'PAYMENT'
export type RecruiterFeature = 'AI_CANDIDATE_RANKING' | 'DETAILED_CV_JD_MATCH'

export type SubscriptionPlan = {
  id: string
  code: string
  name: string
  description: string | null
  price: string
  currency: string
  billing_period: BillingPeriod
  duration_days: number | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export type EffectivePlan = {
  id: string
  code: string
  name: string
  price: string
  currency: string
  billing_period: BillingPeriod
}

export type RecruiterSubscription = {
  id: string
  status: SubscriptionStatus
  starts_at: string
  expires_at: string | null
  source: SubscriptionSource
}

export type RecruiterSubscriptionResponse = {
  effective_plan: EffectivePlan
  subscription: RecruiterSubscription | null
  entitlements?: Partial<Record<RecruiterFeature, boolean>>
}

export type RecruiterPlanFeature = {
  key: RecruiterFeature
  label: string
  included: boolean
}

export type RecruiterPlanCatalogItem = SubscriptionPlan & {
  features: RecruiterPlanFeature[]
}

export type AdminRecruiterSubscriptionItem = {
  id: string
  email: string
  full_name: string
  is_active: boolean
  effective_plan: EffectivePlan
  subscription: RecruiterSubscription | null
}

export type PlanListResponse = {
  items: SubscriptionPlan[]
  page: number
  page_size: number
  total: number
  total_pages: number
}

export type AdminRecruiterSubscriptionListResponse = {
  items: AdminRecruiterSubscriptionItem[]
  page: number
  page_size: number
  total: number
  total_pages: number
}

export type PlanListParams = {
  is_active?: boolean
  page?: number
  page_size?: number
}

export type AdminRecruiterSubscriptionListParams = {
  page?: number
  page_size?: number
}

export type PlanCreateRequest = {
  code: string
  name: string
  description: string | null
  price: string
  currency: string
  billing_period: BillingPeriod
  duration_days: number | null
  is_active: boolean
}

export type PlanUpdateRequest = Pick<SubscriptionPlan, 'name' | 'description' | 'price' | 'is_active'>

export type GrantSubscriptionRequest = {
  plan_id: string
  starts_at: string | null
  expires_at: string | null
}

export type PaymentOrderStatus = 'PENDING' | 'PAID' | 'EXPIRED' | 'CANCELLED'

export type PaymentOrder = {
  id: string
  status: PaymentOrderStatus
  plan: {
    id: string
    code: string
    name: string
    billing_period: BillingPeriod
    duration_days: number
  }
  amount: string
  currency: string
  payment_code: string
  transfer_content: string
  bank: {
    bank_name: string
    bank_bin: string
    account_number: string
    account_name: string
  }
  qr: {
    image_url: string
  }
  expires_at: string
  paid_at: string | null
  created_at: string
}
