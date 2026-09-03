import api from './api'
import type { Job, JobListResponse, JobSearchParams } from '../types/job'

export const jobService = {
  getJobs: async (params: JobSearchParams, signal?: AbortSignal): Promise<JobListResponse> => {
    const { data } = await api.get<JobListResponse>('/api/v1/jobs', { params, signal })
    return data
  },
  getJobById: async (id: string): Promise<Job> => {
    const { data } = await api.get<Job>(`/api/v1/jobs/${id}`)
    return data
  },
}
