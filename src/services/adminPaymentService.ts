import api from './api'
import type {
  AdminPaymentFilters,
  AdminPaymentOrderDetail,
  AdminPaymentOrderList,
  AdminPaymentSummary,
  AdminPaymentTransaction,
  AdminPaymentTransactionList,
} from '../types/adminPayment'

const compactParams = (filters: AdminPaymentFilters) =>
  Object.fromEntries(Object.entries(filters).filter(([, value]) => value !== '' && value !== undefined))

export const adminPaymentService = {
  async getSummary(filters: Pick<AdminPaymentFilters, 'plan_code' | 'recruiter_id' | 'date_from' | 'date_to'>, signal?: AbortSignal) {
    return (await api.get<AdminPaymentSummary>('/api/v1/admin/payments/summary', {
      params: compactParams(filters), signal,
    })).data
  },

  async getTransactions(filters: AdminPaymentFilters, signal?: AbortSignal) {
    return (await api.get<AdminPaymentTransactionList>('/api/v1/admin/payment-transactions', {
      params: compactParams(filters), signal,
    })).data
  },

  async getTransaction(id: string, signal?: AbortSignal) {
    return (await api.get<AdminPaymentTransaction>(`/api/v1/admin/payment-transactions/${id}`, { signal })).data
  },

  async getOrders(filters: AdminPaymentFilters, signal?: AbortSignal) {
    return (await api.get<AdminPaymentOrderList>('/api/v1/admin/payment-orders', {
      params: compactParams(filters), signal,
    })).data
  },

  async getOrder(id: string, signal?: AbortSignal) {
    return (await api.get<AdminPaymentOrderDetail>(`/api/v1/admin/payment-orders/${id}`, { signal })).data
  },
}
