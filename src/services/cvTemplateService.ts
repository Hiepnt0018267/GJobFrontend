import api from './api'
import type { CVTemplateCatalogResponse } from '../types/cv'

const BASE = '/api/v1/cv-templates'

export const cvTemplateService = {
  async getCVTemplates(): Promise<CVTemplateCatalogResponse> {
    return (await api.get<CVTemplateCatalogResponse>(BASE)).data
  },
}
