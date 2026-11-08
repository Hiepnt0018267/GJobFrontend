import api from './api'
import type {
  CompanyFollowStatus,
  CompanyJobSort,
  FollowedCompanyListResponse,
  PublicCompany,
  PublicCompanyJobsResponse,
} from '../types/company'

export const companyService = {
  getFollowedCompanies: async (
    params: { page: number; page_size: number },
    signal?: AbortSignal,
  ): Promise<FollowedCompanyListResponse> => {
    const { data } = await api.get<FollowedCompanyListResponse>('/api/v1/candidate/followed-companies', {
      params,
      signal,
    })
    return data
  },

  getCompany: async (companyId: string, signal?: AbortSignal): Promise<PublicCompany> => {
    const { data } = await api.get<PublicCompany>(`/api/v1/companies/${companyId}`, { signal })
    return data
  },

  getCompanyJobs: async (
    companyId: string,
    params: { page: number; page_size: number; sort: CompanyJobSort },
    signal?: AbortSignal,
  ): Promise<PublicCompanyJobsResponse> => {
    const { data } = await api.get<PublicCompanyJobsResponse>(`/api/v1/companies/${companyId}/jobs`, {
      params,
      signal,
    })
    return data
  },

  getFollowStatus: async (companyId: string, signal?: AbortSignal): Promise<CompanyFollowStatus> => {
    const { data } = await api.get<CompanyFollowStatus>(`/api/v1/candidate/followed-companies/${companyId}`, { signal })
    return data
  },

  follow: async (companyId: string): Promise<CompanyFollowStatus> => {
    const { data } = await api.post<CompanyFollowStatus>(`/api/v1/candidate/followed-companies/${companyId}`, {})
    return data
  },

  unfollow: async (companyId: string): Promise<CompanyFollowStatus> => {
    const { data } = await api.delete<CompanyFollowStatus>(`/api/v1/candidate/followed-companies/${companyId}`)
    return data
  },
}
