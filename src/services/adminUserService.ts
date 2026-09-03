import api from './api'
import type { AdminUserDetail, AdminUserListParams, AdminUserListResponse } from '../types/adminUser'

const adminUsersPath = '/api/v1/admin/users'

export const adminUserService = {
  async getAdminUsers(params: AdminUserListParams, signal?: AbortSignal): Promise<AdminUserListResponse> {
    return (await api.get<AdminUserListResponse>(adminUsersPath, { params, signal })).data
  },

  async getAdminUser(userId: string): Promise<AdminUserDetail> {
    return (await api.get<AdminUserDetail>(`${adminUsersPath}/${userId}`)).data
  },

  async activateAdminUser(userId: string): Promise<AdminUserDetail> {
    return (await api.patch<AdminUserDetail>(`${adminUsersPath}/${userId}/activate`)).data
  },

  async deactivateAdminUser(userId: string): Promise<AdminUserDetail> {
    return (await api.patch<AdminUserDetail>(`${adminUsersPath}/${userId}/deactivate`)).data
  },
}
