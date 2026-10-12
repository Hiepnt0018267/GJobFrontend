import api from './api'
import type { CandidateJobRecommendationListResponse, CandidateJobRecommendationParams } from '../types/job'

export const jobRecommendationService = {
  async getRecommendations(
    params: CandidateJobRecommendationParams,
    signal?: AbortSignal,
  ): Promise<CandidateJobRecommendationListResponse> {
    const { data } = await api.get<CandidateJobRecommendationListResponse>(
      '/api/v1/candidate/jobs/recommendations',
      { params, signal },
    )
    return data
  },
}
