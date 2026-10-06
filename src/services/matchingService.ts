import api from './api'
import type { CVJobMatchResponse } from '../types/matching'

const MATCH_REQUEST_TIMEOUT_MS = 45_000

export const matchingService = {
  async matchRecruiterApplication(applicationId: string, signal?: AbortSignal): Promise<CVJobMatchResponse> {
    return (await api.post<CVJobMatchResponse>(`/api/v1/recruiters/applications/${applicationId}/match`, undefined, {
      signal,
      timeout: MATCH_REQUEST_TIMEOUT_MS,
      gjobSkipDataRefresh: true,
    })).data
  },
}
