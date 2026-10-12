import { createContext } from 'react'
import type { NotificationItem } from '../types/notification'

export type NotificationContextValue = {
  identityId: string | null
  identityGeneration: number
  unreadCount: number | null
  countLoading: boolean
  countError: boolean
  previewItems: NotificationItem[]
  previewLoading: boolean
  previewError: boolean
  pendingIds: ReadonlySet<string>
  markAllPending: boolean
  refreshCount: () => Promise<void>
  refreshPreview: () => Promise<void>
  markOne: (item: NotificationItem) => Promise<NotificationItem>
  markAll: () => Promise<number>
}

export const NotificationContext = createContext<NotificationContextValue | null>(null)
