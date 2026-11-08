import api from './api'
import type {
  AdminIndustryCreate,
  AdminIndustryUpdate,
  AdminJobTaxonomy,
  AdminPositionCreate,
  AdminPositionUpdate,
  AdminTaxonomyIndustry,
  AdminTaxonomyJobStats,
  AdminTaxonomyPosition,
} from '../types/adminJobTaxonomy'

const basePath = '/api/v1/admin/job-taxonomy'

export const adminJobTaxonomyService = {
  async getTaxonomy(signal?: AbortSignal): Promise<AdminJobTaxonomy> {
    return (await api.get<AdminJobTaxonomy>(basePath, { signal })).data
  },
  async getStats(signal?: AbortSignal): Promise<AdminTaxonomyJobStats> {
    return (await api.get<AdminTaxonomyJobStats>(`${basePath}/stats`, { signal })).data
  },
  async createIndustry(payload: AdminIndustryCreate): Promise<AdminTaxonomyIndustry> {
    return (await api.post<AdminTaxonomyIndustry>(`${basePath}/industries`, payload)).data
  },
  async updateIndustry(id: string, payload: AdminIndustryUpdate): Promise<AdminTaxonomyIndustry> {
    return (await api.patch<AdminTaxonomyIndustry>(`${basePath}/industries/${id}`, payload)).data
  },
  async createPosition(payload: AdminPositionCreate): Promise<AdminTaxonomyPosition> {
    return (await api.post<AdminTaxonomyPosition>(`${basePath}/positions`, payload)).data
  },
  async updatePosition(id: string, payload: AdminPositionUpdate): Promise<AdminTaxonomyPosition> {
    return (await api.patch<AdminTaxonomyPosition>(`${basePath}/positions/${id}`, payload)).data
  },
}
