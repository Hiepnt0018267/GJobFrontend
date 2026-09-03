import api from './api'
import type {
  AdminAuditApplicationDetail,
  AdminAuditApplicationListParams,
  AdminAuditApplicationListResponse,
  AdminAuditCVDetail,
  AdminAuditCVListParams,
  AdminAuditCVListResponse,
} from '../types/adminAudit'

const applicationsPath = '/api/v1/admin/applications'
const cvsPath = '/api/v1/admin/cvs'

export const adminAuditService = {
  async getApplications(params: AdminAuditApplicationListParams, signal?: AbortSignal): Promise<AdminAuditApplicationListResponse> {
    return (await api.get<AdminAuditApplicationListResponse>(applicationsPath, { params, signal })).data
  },
  async getApplication(id: string): Promise<AdminAuditApplicationDetail> {
    return (await api.get<AdminAuditApplicationDetail>(`${applicationsPath}/${id}`)).data
  },
  async getCandidateCVs(params: AdminAuditCVListParams, signal?: AbortSignal): Promise<AdminAuditCVListResponse> {
    return (await api.get<AdminAuditCVListResponse>(cvsPath, { params, signal })).data
  },
  async getCandidateCV(id: string): Promise<AdminAuditCVDetail> {
    return (await api.get<AdminAuditCVDetail>(`${cvsPath}/${id}`)).data
  },
}
