import api from './api'
import type { AxiosResponse } from 'axios'
import type { CV, CVCreateRequest, CVListResponse, CVUpdateRequest } from '../types/cv'

const BASE = '/api/v1/candidate/cvs'

export const cvService = {
  async getCVs(): Promise<CVListResponse> { return (await api.get<CVListResponse>(BASE)).data },
  async getCV(id: string): Promise<CV> { return (await api.get<CV>(`${BASE}/${id}`)).data },
  async createCV(data: CVCreateRequest): Promise<CV> { return (await api.post<CV>(BASE, data)).data },
  async uploadCV(title: string, file: File): Promise<CV> {
    const data = new FormData()
    data.append('title', title)
    data.append('file', file)
    return (await api.post<CV>(`${BASE}/upload`, data, { gjobSkipDataRefresh: true })).data
  },
  async updateCV(id: string, data: CVUpdateRequest): Promise<CV> { return (await api.patch<CV>(`${BASE}/${id}`, data)).data },
  async deleteCV(id: string): Promise<void> { await api.delete(`${BASE}/${id}`) },
  async setDefaultCV(id: string): Promise<CV> { return (await api.patch<CV>(`${BASE}/${id}/default`)).data },
  async getCVFile(id: string): Promise<AxiosResponse<Blob>> { return api.get<Blob>(`${BASE}/${id}/file`, { responseType: 'blob' }) },
  async uploadCVPhoto(id: string, file: File): Promise<CV> {
    const data = new FormData()
    data.append('file', file)
    return (await api.post<CV>(`${BASE}/${id}/photo`, data, { gjobSkipDataRefresh: true })).data
  },
  async deleteCVPhoto(id: string): Promise<CV> { return (await api.delete<CV>(`${BASE}/${id}/photo`, { gjobSkipDataRefresh: true })).data },
}
