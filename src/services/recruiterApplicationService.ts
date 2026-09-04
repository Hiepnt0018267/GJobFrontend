import api from './api'
import type {
  RecruiterApplicationDetail,
  RecruiterApplicationListParams,
  RecruiterApplicationListResponse,
} from '../types/recruiterApplication'

const applicationsPath = '/api/v1/recruiters/applications'

export const recruiterApplicationService = {
  async getApplications(params: RecruiterApplicationListParams, signal?: AbortSignal): Promise<RecruiterApplicationListResponse> {
    return (await api.get<RecruiterApplicationListResponse>(applicationsPath, { params, signal })).data
  },
  async getApplicationsByJob(jobId: string, params: Omit<RecruiterApplicationListParams, 'job_id'>, signal?: AbortSignal): Promise<RecruiterApplicationListResponse> {
    return (await api.get<RecruiterApplicationListResponse>(`/api/v1/recruiters/jobs/${jobId}/applications`, { params, signal })).data
  },
  async getApplicationById(id: string, signal?: AbortSignal): Promise<RecruiterApplicationDetail> {
    return (await api.get<RecruiterApplicationDetail>(`${applicationsPath}/${id}`, { signal })).data
  },
  async reviewApplication(id: string): Promise<RecruiterApplicationDetail> {
    return (await api.patch<RecruiterApplicationDetail>(`${applicationsPath}/${id}/review`, undefined, { gjobSkipDataRefresh: true })).data
  },
  async shortlistApplication(id: string): Promise<RecruiterApplicationDetail> {
    return (await api.patch<RecruiterApplicationDetail>(`${applicationsPath}/${id}/shortlist`, undefined, { gjobSkipDataRefresh: true })).data
  },
  async rejectApplication(id: string): Promise<RecruiterApplicationDetail> {
    return (await api.patch<RecruiterApplicationDetail>(`${applicationsPath}/${id}/reject`, undefined, { gjobSkipDataRefresh: true })).data
  },
  async hireApplication(id: string): Promise<RecruiterApplicationDetail> {
    return (await api.patch<RecruiterApplicationDetail>(`${applicationsPath}/${id}/hire`, undefined, { gjobSkipDataRefresh: true })).data
  },
}
