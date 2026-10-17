import api from './api'
import type {
  AdminRecruiterSubscriptionListParams,
  AdminRecruiterSubscriptionListResponse,
  GrantSubscriptionRequest,
  PlanCreateRequest,
  PlanListParams,
  PlanListResponse,
  PlanUpdateRequest,
  RecruiterSubscriptionResponse,
  RecruiterPlanCatalogItem,
  PaymentOrder,
  SubscriptionPlan,
} from '../types/subscription'

const planPath = '/api/v1/admin/subscription-plans'
const recruiterPath = '/api/v1/admin/recruiters'

export const subscriptionService = {
  async getSubscriptionPlans(params: PlanListParams, signal?: AbortSignal): Promise<PlanListResponse> {
    return (await api.get<PlanListResponse>(planPath, { params, signal })).data
  },

  async getSubscriptionPlan(planId: string, signal?: AbortSignal): Promise<SubscriptionPlan> {
    return (await api.get<SubscriptionPlan>(`${planPath}/${planId}`, { signal })).data
  },

  async createSubscriptionPlan(payload: PlanCreateRequest): Promise<SubscriptionPlan> {
    return (await api.post<SubscriptionPlan>(planPath, payload, { gjobSkipDataRefresh: true })).data
  },

  async updateSubscriptionPlan(planId: string, payload: PlanUpdateRequest): Promise<SubscriptionPlan> {
    return (await api.patch<SubscriptionPlan>(`${planPath}/${planId}`, payload, { gjobSkipDataRefresh: true })).data
  },

  async getAdminRecruiters(params: AdminRecruiterSubscriptionListParams, signal?: AbortSignal): Promise<AdminRecruiterSubscriptionListResponse> {
    return (await api.get<AdminRecruiterSubscriptionListResponse>(recruiterPath, { params, signal })).data
  },

  async getAdminRecruiterSubscription(recruiterId: string, signal?: AbortSignal): Promise<RecruiterSubscriptionResponse> {
    return (await api.get<RecruiterSubscriptionResponse>(`${recruiterPath}/${recruiterId}/subscription`, { signal })).data
  },

  async grantOrChangeRecruiterSubscription(recruiterId: string, payload: GrantSubscriptionRequest): Promise<RecruiterSubscriptionResponse> {
    return (await api.post<RecruiterSubscriptionResponse>(`${recruiterPath}/${recruiterId}/subscription`, payload, { gjobSkipDataRefresh: true })).data
  },

  async revokeRecruiterSubscription(recruiterId: string): Promise<RecruiterSubscriptionResponse> {
    return (await api.post<RecruiterSubscriptionResponse>(`${recruiterPath}/${recruiterId}/subscription/revoke`, undefined, { gjobSkipDataRefresh: true })).data
  },

  async getMyRecruiterSubscription(signal?: AbortSignal): Promise<RecruiterSubscriptionResponse> {
    return (await api.get<RecruiterSubscriptionResponse>('/api/v1/recruiter/subscription', { signal })).data
  },

  async getRecruiterPlanCatalog(signal?: AbortSignal): Promise<RecruiterPlanCatalogItem[]> {
    return (await api.get<RecruiterPlanCatalogItem[]>('/api/v1/recruiter/subscription-plans', { signal })).data
  },

  async createPaymentOrder(planId: string): Promise<PaymentOrder> {
    return (await api.post<PaymentOrder>(
      '/api/v1/recruiter/payment-orders',
      { plan_id: planId },
      { gjobSkipDataRefresh: true },
    )).data
  },

  async getPaymentOrder(orderId: string, signal?: AbortSignal): Promise<PaymentOrder> {
    return (await api.get<PaymentOrder>('/api/v1/recruiter/payment-orders/' + orderId, { signal })).data
  },

  async cancelPaymentOrder(orderId: string): Promise<PaymentOrder> {
    return (await api.post<PaymentOrder>(
      '/api/v1/recruiter/payment-orders/' + orderId + '/cancel',
      undefined,
      { gjobSkipDataRefresh: true },
    )).data
  },
}
