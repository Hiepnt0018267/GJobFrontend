import api from './api'
import type { AdminDashboardResponse } from '../types/adminDashboard'

export const adminDashboardService = {
  async getAdminDashboard(): Promise<AdminDashboardResponse> {
    return (await api.get<AdminDashboardResponse>('/api/v1/admin/dashboard')).data
  },
}
