import api from './api'
import type { CVTemplateCatalogResponse } from '../types/cv'
import { sortCVTemplates } from '../utils/cvTemplateSort'

const BASE = '/api/v1/cv-templates'

export const cvTemplateService = {
  async getCVTemplates(): Promise<CVTemplateCatalogResponse> {
    const response = (await api.get<CVTemplateCatalogResponse>(BASE)).data
    return { ...response, items: sortCVTemplates(response.items) }
  },
}
