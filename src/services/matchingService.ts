import api from './api'
import type { CandidateMatchRequest, CVJobMatchResponse } from '../types/matching'

const MATCH_REQUEST_TIMEOUT_MS = 45_000

export const matchingService = {
  async matchCandidateJob(jobId: string, cvId: string, signal?: AbortSignal): Promise<CVJobMatchResponse> {
    const payload: CandidateMatchRequest = { cv_id: cvId }
    return (await api.post<CVJobMatchResponse>(`/api/v1/candidate/jobs/${jobId}/match`, payload, {
      signal,
      timeout: MATCH_REQUEST_TIMEOUT_MS,
      gjobSkipDataRefresh: true,
    })).data
  },

  async matchRecruiterApplication(applicationId: string, signal?: AbortSignal): Promise<CVJobMatchResponse> {
    return (await api.post<CVJobMatchResponse>(`/api/v1/recruiters/applications/${applicationId}/match`, undefined, {
      signal,
      timeout: MATCH_REQUEST_TIMEOUT_MS,
      gjobSkipDataRefresh: true,
    })).data
  },
}
