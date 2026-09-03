import api from './api'
import type { AdminCVTemplate, AdminCVTemplateCreateRequest, AdminCVTemplateListParams, AdminCVTemplateListResponse, AdminCVTemplateUpdateRequest } from '../types/adminCVTemplate'

const basePath = '/api/v1/admin/cv-templates'

export const adminCVTemplateService = {
  async getAdminCVTemplates(params: AdminCVTemplateListParams, signal?: AbortSignal): Promise<AdminCVTemplateListResponse> { return (await api.get<AdminCVTemplateListResponse>(basePath, { params, signal })).data },
  async getAdminCVTemplate(id: string): Promise<AdminCVTemplate> { return (await api.get<AdminCVTemplate>(`${basePath}/${id}`)).data },
  async createAdminCVTemplate(payload: AdminCVTemplateCreateRequest): Promise<AdminCVTemplate> { return (await api.post<AdminCVTemplate>(basePath, payload)).data },
  async updateAdminCVTemplate(id: string, payload: AdminCVTemplateUpdateRequest): Promise<AdminCVTemplate> { return (await api.patch<AdminCVTemplate>(`${basePath}/${id}`, payload)).data },
  async activateAdminCVTemplate(id: string): Promise<AdminCVTemplate> { return (await api.patch<AdminCVTemplate>(`${basePath}/${id}/activate`)).data },
  async deactivateAdminCVTemplate(id: string): Promise<AdminCVTemplate> { return (await api.patch<AdminCVTemplate>(`${basePath}/${id}/deactivate`)).data },
  async featureAdminCVTemplate(id: string): Promise<AdminCVTemplate> { return (await api.patch<AdminCVTemplate>(`${basePath}/${id}/feature`)).data },
  async unfeatureAdminCVTemplate(id: string): Promise<AdminCVTemplate> { return (await api.patch<AdminCVTemplate>(`${basePath}/${id}/unfeature`)).data },
  async deleteAdminCVTemplate(id: string): Promise<void> { await api.delete(`${basePath}/${id}`) },
}
