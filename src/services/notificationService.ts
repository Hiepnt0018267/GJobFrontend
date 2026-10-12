import api from './api'
import type {
  NotificationItem,
  NotificationListParams,
  NotificationListResponse,
  NotificationMarkAllReadResponse,
  NotificationUnreadCountResponse,
} from '../types/notification'

export const notificationService = {
  async getNotifications(params: NotificationListParams, signal?: AbortSignal): Promise<NotificationListResponse> {
    const response = await api.get<NotificationListResponse>('/api/v1/notifications', { params, signal })
    return response.data
  },

  async getUnreadCount(signal?: AbortSignal): Promise<NotificationUnreadCountResponse> {
    const response = await api.get<NotificationUnreadCountResponse>('/api/v1/notifications/unread-count', { signal })
    return response.data
  },

  async markNotificationRead(id: string, signal?: AbortSignal): Promise<NotificationItem> {
    const response = await api.patch<NotificationItem>(
      `/api/v1/notifications/${id}/read`,
      undefined,
      { signal, gjobSkipDataRefresh: true },
    )
    return response.data
  },

  async markAllNotificationsRead(signal?: AbortSignal): Promise<NotificationMarkAllReadResponse> {
    const response = await api.patch<NotificationMarkAllReadResponse>(
      '/api/v1/notifications/read-all',
      undefined,
      { signal, gjobSkipDataRefresh: true },
    )
    return response.data
  },
}
