import api from './api'
import type { CV, CVCreateRequest, CVListResponse, CVUpdateRequest } from '../types/cv'

const BASE = '/api/v1/candidate/cvs'

export const cvService = {
  async getCVs(): Promise<CVListResponse> { return (await api.get<CVListResponse>(BASE)).data },
  async getCV(id: string): Promise<CV> { return (await api.get<CV>(`${BASE}/${id}`)).data },
  async createCV(data: CVCreateRequest): Promise<CV> { return (await api.post<CV>(BASE, data)).data },
  async updateCV(id: string, data: CVUpdateRequest): Promise<CV> { return (await api.patch<CV>(`${BASE}/${id}`, data)).data },
  async deleteCV(id: string): Promise<void> { await api.delete(`${BASE}/${id}`) },
  async setDefaultCV(id: string): Promise<CV> { return (await api.patch<CV>(`${BASE}/${id}/default`)).data },
}
