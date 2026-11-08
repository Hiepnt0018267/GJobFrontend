import api from './api'
import type { CVATSStatus, CVTemplateCatalogResponse, CVTemplateExperienceLevel, CVTemplateStyle, CVTemplateTaxonomy } from '../types/cv'
import { sortCVTemplates } from '../utils/cvTemplateSort'

const BASE = '/api/v1/cv-templates'

export const cvTemplateService = {
  async getCVTemplates(params: { industry_group?: string; job_position?: string; experience_level?: CVTemplateExperienceLevel; style?: CVTemplateStyle; ats_status?: CVATSStatus } = {}): Promise<CVTemplateCatalogResponse> {
    const response = (await api.get<CVTemplateCatalogResponse>(BASE, { params })).data
    return { ...response, items: sortCVTemplates(response.items) }
  },
  async getCVTemplateTaxonomy(): Promise<CVTemplateTaxonomy> {
    return (await api.get<CVTemplateTaxonomy>('/api/v1/cv-template-taxonomy')).data
  },
}
