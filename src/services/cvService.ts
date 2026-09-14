import api from './api'
import type { AxiosResponse } from 'axios'
import type { CV, CVCreateRequest, CVExtraction, CVExtractionConfirmationResponse, CVListResponse, CVStructuredData, CVUpdateRequest } from '../types/cv'

const BASE = '/api/v1/candidate/cvs'

export const cvService = {
  async getCVs(): Promise<CVListResponse> { return (await api.get<CVListResponse>(BASE)).data },
  async getCV(id: string, signal?: AbortSignal): Promise<CV> { return (await api.get<CV>(`${BASE}/${id}`, { signal })).data },
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
  async triggerExtraction(id: string, signal?: AbortSignal): Promise<CVExtraction> {
    return (await api.post<CVExtraction>(`${BASE}/${id}/extractions`, undefined, { signal, timeout: 60_000 })).data
  },
  async getLatestExtraction(id: string, signal?: AbortSignal): Promise<CVExtraction> {
    return (await api.get<CVExtraction>(`${BASE}/${id}/extractions/latest`, { signal })).data
  },
  async confirmExtraction(id: string, extractionId: string, payload: CVStructuredData, signal?: AbortSignal): Promise<CVExtractionConfirmationResponse> {
    return (await api.post<CVExtractionConfirmationResponse>(`${BASE}/${id}/extractions/${extractionId}/confirm`, payload, { signal })).data
  },
}
