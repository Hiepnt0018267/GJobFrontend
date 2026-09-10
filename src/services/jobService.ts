import api from './api'
import type { JobDetail, JobListResponse, JobSearchParams } from '../types/job'

export const jobService = {
  getJobs: async (params: JobSearchParams, signal?: AbortSignal): Promise<JobListResponse> => {
    const { data } = await api.get<JobListResponse>('/api/v1/jobs', { params, signal })
    return data
  },
  getJobById: async (id: string, signal?: AbortSignal): Promise<JobDetail> => {
    const { data } = await api.get<JobDetail>(`/api/v1/jobs/${id}`, { signal })
    return data
  },
}
