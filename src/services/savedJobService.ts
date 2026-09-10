import api from './api'
import type { SavedJobListParams, SavedJobListResponse, SavedJobStatus } from '../types/savedJob'

export const savedJobService = {
  getSavedJobs: async (params: SavedJobListParams, signal?: AbortSignal): Promise<SavedJobListResponse> => {
    const { data } = await api.get<SavedJobListResponse>('/api/v1/candidate/saved-jobs', { params, signal })
    return data
  },
  getStatus: async (jobId: string, signal?: AbortSignal): Promise<SavedJobStatus> => {
    const { data } = await api.get<SavedJobStatus>(`/api/v1/candidate/saved-jobs/by-job/${jobId}`, { signal })
    return data
  },
  save: async (jobId: string): Promise<SavedJobStatus> => {
    const { data } = await api.post<SavedJobStatus>(`/api/v1/candidate/saved-jobs/${jobId}`)
    return data
  },
  unsave: async (jobId: string): Promise<void> => {
    await api.delete(`/api/v1/candidate/saved-jobs/${jobId}`)
  },
}
