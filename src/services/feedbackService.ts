import api from './api'
import type {
  FeedbackCreatePayload,
  FeedbackItem,
  FeedbackListParams,
  FeedbackListResponse,
  FeedbackStatus,
} from '../types/feedback'

export const feedbackService = {
  submitFeedback: async (payload: FeedbackCreatePayload): Promise<FeedbackItem> => {
    const { data } = await api.post<FeedbackItem>('/api/v1/feedbacks', payload)
    return data
  },

  getFeedbacksAdmin: async (
    params: FeedbackListParams,
    signal?: AbortSignal,
  ): Promise<FeedbackListResponse> => {
    const { data } = await api.get<FeedbackListResponse>('/api/v1/admin/feedbacks', {
      params,
      signal,
    })
    return data
  },

  getFeedbackDetailAdmin: async (
    feedbackId: string,
    signal?: AbortSignal,
  ): Promise<FeedbackItem> => {
    const { data } = await api.get<FeedbackItem>(`/api/v1/admin/feedbacks/${feedbackId}`, {
      signal,
    })
    return data
  },

  updateFeedbackStatusAdmin: async (
    feedbackId: string,
    status: FeedbackStatus,
  ): Promise<FeedbackItem> => {
    const { data } = await api.patch<FeedbackItem>(
      `/api/v1/admin/feedbacks/${feedbackId}/status`,
      { status },
    )
    return data
  },
}

