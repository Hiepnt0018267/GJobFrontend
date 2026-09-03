import api from './api'
import type {
  AppliedStatusResponse,
  CandidateApplicationDetail,
  CandidateApplicationListParams,
  CandidateApplicationListResponse,
  JobApplication,
  SubmitApplicationRequest,
} from '../types/application'

const jobApplicationsPath = (jobId: string) => `/api/v1/jobs/${jobId}/applications`
const candidateApplicationsPath = '/api/v1/candidate/applications'

export const applicationService = {
  async submitApplication(jobId: string, payload: SubmitApplicationRequest): Promise<JobApplication> {
    return (await api.post<JobApplication>(jobApplicationsPath(jobId), payload, { gjobSkipDataRefresh: true })).data
  },
  async getApplications(params: CandidateApplicationListParams, signal?: AbortSignal): Promise<CandidateApplicationListResponse> {
    return (await api.get<CandidateApplicationListResponse>(candidateApplicationsPath, { params, signal })).data
  },
  async getApplicationById(id: string, signal?: AbortSignal): Promise<CandidateApplicationDetail> {
    return (await api.get<CandidateApplicationDetail>(`${candidateApplicationsPath}/${id}`, { signal })).data
  },
  async withdrawApplication(id: string): Promise<CandidateApplicationDetail> {
    return (await api.patch<CandidateApplicationDetail>(`${candidateApplicationsPath}/${id}/withdraw`, undefined, { gjobSkipDataRefresh: true })).data
  },
  async getApplicationByJob(jobId: string, signal?: AbortSignal): Promise<AppliedStatusResponse> {
    return (await api.get<AppliedStatusResponse>(`${candidateApplicationsPath}/by-job/${jobId}`, { signal })).data
  },
}
