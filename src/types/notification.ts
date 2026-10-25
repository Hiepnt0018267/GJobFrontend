export const KNOWN_NOTIFICATION_TYPES = [
  'SYSTEM',
  'APPLICATION_SUBMITTED',
  'APPLICATION_STATUS_CHANGED',
  'APPLICATION_WITHDRAWN',
  'JOB_APPROVED',
  'JOB_REJECTED',
] as const

export type KnownNotificationType = (typeof KNOWN_NOTIFICATION_TYPES)[number]
export type NotificationTargetType = 'USER' | 'APPLICATION' | 'JOB' | 'CV'

export interface NotificationItem {
  id: string
  type: string
  title: string
  message: string
  read_at: string | null
  is_read: boolean
  target_type: string | null
  target_id: string | null
  created_at: string
}

export interface NotificationListResponse {
  items: NotificationItem[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

export interface NotificationUnreadCountResponse {
  unread_count: number
}

export interface NotificationMarkAllReadResponse {
  updated_count: number
}

export interface NotificationListParams {
  page?: number
  page_size?: number
  unread_only?: boolean
}
