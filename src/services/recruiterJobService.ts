import api from './api'
import type { JobCreateRequest, JobUpdateRequest, RecruiterJob, RecruiterJobListResponse, RecruiterJobSearchParams } from '../types/job'

export const recruiterJobService = {
  getMyJobs: async (params: RecruiterJobSearchParams = {}): Promise<RecruiterJobListResponse> => {
    const { data } = await api.get<RecruiterJobListResponse>('/api/v1/recruiters/jobs', { params })
    return data
  },
  getMyJob: async (id: string): Promise<RecruiterJob> => {
    const { data } = await api.get<RecruiterJob>(`/api/v1/recruiters/jobs/${id}`)
    return data
  },
  createJob: async (payload: JobCreateRequest): Promise<RecruiterJob> => {
    const { data } = await api.post<RecruiterJob>('/api/v1/recruiters/jobs', payload)
    return data
  },
  updateJob: async (id: string, payload: JobUpdateRequest): Promise<RecruiterJob> => {
    const { data } = await api.patch<RecruiterJob>(`/api/v1/recruiters/jobs/${id}`, payload)
    return data
  },
  deleteJob: async (id: string): Promise<void> => {
    await api.delete(`/api/v1/recruiters/jobs/${id}`)
  },
  closeJob: async (id: string): Promise<RecruiterJob> => {
    const { data } = await api.patch<RecruiterJob>(`/api/v1/recruiters/jobs/${id}/close`)
    return data
  },
}
