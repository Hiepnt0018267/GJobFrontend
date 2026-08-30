import api from './api'
import type { RecruiterDashboardSummary, RecruiterProfile, RecruiterProfileUpdate } from '../types/recruiter'

export const recruiterService = {
  getMyRecruiterProfile: async (): Promise<RecruiterProfile> => {
    const { data } = await api.get<RecruiterProfile>('/api/v1/recruiters/me')
    return data
  },
  updateMyRecruiterProfile: async (payload: RecruiterProfileUpdate): Promise<RecruiterProfile> => {
    const { data } = await api.patch<RecruiterProfile>('/api/v1/recruiters/me', payload)
    return data
  },
  getRecruiterDashboard: async (): Promise<RecruiterDashboardSummary> => {
    const { data } = await api.get<RecruiterDashboardSummary>('/api/v1/recruiters/me/dashboard')
    return data
  },
}
