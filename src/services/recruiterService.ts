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
  uploadCompanyLogo: async (file: File): Promise<RecruiterProfile> => {
    const payload = new FormData()
    payload.append('file', file)
    const { data } = await api.post<RecruiterProfile>('/api/v1/recruiters/me/logo', payload, { gjobSkipDataRefresh: true })
    return data
  },
  deleteCompanyLogo: async (): Promise<RecruiterProfile> => {
    const { data } = await api.delete<RecruiterProfile>('/api/v1/recruiters/me/logo', { gjobSkipDataRefresh: true })
    return data
  },
  getRecruiterDashboard: async (): Promise<RecruiterDashboardSummary> => {
    const { data } = await api.get<RecruiterDashboardSummary>('/api/v1/recruiters/me/dashboard')
    return data
  },
}
