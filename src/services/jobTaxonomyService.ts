import api from './api'
import type { JobTaxonomyResponse } from '../types/jobTaxonomy'

export const jobTaxonomyService = {
  getActive: async (signal?: AbortSignal): Promise<JobTaxonomyResponse> => {
    const { data } = await api.get<JobTaxonomyResponse>('/api/v1/job-taxonomy', { signal })
    return data
  },
}
