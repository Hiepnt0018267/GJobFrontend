import api from './api'
import type { AdminJob, AdminJobListParams, AdminJobListResponse } from '../types/adminJob'

const adminJobsPath = '/api/v1/admin/jobs'

export const adminJobService = {
  async getAdminJobs(params: AdminJobListParams, signal?: AbortSignal): Promise<AdminJobListResponse> {
    return (await api.get<AdminJobListResponse>(adminJobsPath, { params, signal })).data
  },

  async getAdminJob(jobId: string): Promise<AdminJob> {
    return (await api.get<AdminJob>(`${adminJobsPath}/${jobId}`)).data
  },

  async approveAdminJob(jobId: string): Promise<AdminJob> {
    return (await api.patch<AdminJob>(`${adminJobsPath}/${jobId}/approve`)).data
  },

  async rejectAdminJob(jobId: string): Promise<AdminJob> {
    return (await api.patch<AdminJob>(`${adminJobsPath}/${jobId}/reject`)).data
  },
}
