import type { UserRole } from '../types/auth'
import type { KnownNotificationType, NotificationItem } from '../types/notification'

export type NotificationVisualCategory = 'neutral' | 'application' | 'status' | 'withdrawn' | 'approved' | 'rejected'

const TYPE_CATEGORY: Record<KnownNotificationType, NotificationVisualCategory> = {
  SYSTEM: 'neutral',
  APPLICATION_SUBMITTED: 'application',
  APPLICATION_STATUS_CHANGED: 'status',
  APPLICATION_WITHDRAWN: 'withdrawn',
  JOB_APPROVED: 'approved',
  JOB_REJECTED: 'rejected',
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export function notificationVisualCategory(type: string): NotificationVisualCategory {
  return Object.prototype.hasOwnProperty.call(TYPE_CATEGORY, type)
    ? TYPE_CATEGORY[type as KnownNotificationType]
    : 'neutral'
}

export function notificationBadgeText(unreadCount: number | null): string | null {
  if (unreadCount === null || unreadCount <= 0) return null
  return unreadCount >= 100 ? '99+' : String(unreadCount)
}

export function notificationBellLabel(unreadCount: number | null): string {
  if (unreadCount === null || unreadCount <= 0) return 'Mở thông báo'
  return `Mở thông báo, ${unreadCount.toLocaleString('vi-VN')} thông báo chưa đọc`
}

export function notificationCenterPath(role: UserRole): string {
  if (role === 'CANDIDATE') return '/candidate/notifications'
  if (role === 'RECRUITER') return '/recruiter/notifications'
  return '/admin/notifications'
}

export function getNotificationTargetPath({
  role,
  targetType,
  targetId,
}: {
  role: UserRole
  targetType: string | null
  targetId: string | null
}): string | null {
  if (!targetType || !targetId || !UUID_PATTERN.test(targetId)) return null
  const id = encodeURIComponent(targetId)

  if (targetType === 'APPLICATION') {
    if (role === 'CANDIDATE') return `/candidate/applications/${id}`
    if (role === 'RECRUITER') return `/recruiter/applications/${id}`
    return `/admin/applications/${id}`
  }

  if (targetType === 'JOB') {
    if (role === 'CANDIDATE') return `/jobs/${id}`
    if (role === 'RECRUITER') return `/recruiter/jobs/${id}`
    return `/admin/jobs/${id}`
  }

  if (targetType === 'CV') {
    if (role === 'CANDIDATE') return `/candidate/cvs/${id}`
    if (role === 'ADMIN') return `/admin/cvs/${id}`
  }

  return null
}

export function formatNotificationTimestamp(value: string): string {
  const timestamp = new Date(value)
  if (Number.isNaN(timestamp.getTime())) return 'Thời gian không xác định'

  const deltaSeconds = Math.round((timestamp.getTime() - Date.now()) / 1000)
  const absoluteSeconds = Math.abs(deltaSeconds)
  const relative = new Intl.RelativeTimeFormat('vi-VN', { numeric: 'auto' })
  if (absoluteSeconds < 60) return 'Vừa xong'
  if (absoluteSeconds < 3_600) return relative.format(Math.round(deltaSeconds / 60), 'minute')
  if (absoluteSeconds < 86_400) return relative.format(Math.round(deltaSeconds / 3_600), 'hour')
  if (absoluteSeconds < 604_800) return relative.format(Math.round(deltaSeconds / 86_400), 'day')
  return new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium', timeStyle: 'short' }).format(timestamp)
}

export type NotificationClientState = {
  identityId: string | null
  generation: number
  unreadCount: number | null
  previewItems: NotificationItem[]
  countLoading: boolean
  previewLoading: boolean
  countError: boolean
  previewError: boolean
  pendingIds: string[]
  markAllPending: boolean
}

export type NotificationStateAction =
  | { type: 'identity/reset'; identityId: string | null; generation: number }
  | { type: 'count/start'; identityId: string; generation: number }
  | { type: 'count/success'; identityId: string; generation: number; unreadCount: number }
  | { type: 'count/failure'; identityId: string; generation: number }
  | { type: 'preview/start'; identityId: string; generation: number }
  | { type: 'preview/success'; identityId: string; generation: number; items: NotificationItem[] }
  | { type: 'preview/failure'; identityId: string; generation: number }
  | { type: 'mark-one/start'; identityId: string; generation: number; id: string }
  | { type: 'mark-one/success'; identityId: string; generation: number; item: NotificationItem; wasUnread: boolean }
  | { type: 'mark-one/finish'; identityId: string; generation: number; id: string }
  | { type: 'mark-all/start'; identityId: string; generation: number }
  | { type: 'mark-all/success'; identityId: string; generation: number }
  | { type: 'mark-all/finish'; identityId: string; generation: number }

export function createNotificationClientState(identityId: string | null, generation = 0): NotificationClientState {
  return {
    identityId,
    generation,
    unreadCount: null,
    previewItems: [],
    countLoading: false,
    previewLoading: false,
    countError: false,
    previewError: false,
    pendingIds: [],
    markAllPending: false,
  }
}

function appliesToState(state: NotificationClientState, action: { identityId: string; generation: number }): boolean {
  return state.identityId === action.identityId && state.generation === action.generation
}

export function notificationStateReducer(
  state: NotificationClientState,
  action: NotificationStateAction,
): NotificationClientState {
  if (action.type === 'identity/reset') return createNotificationClientState(action.identityId, action.generation)
  if (!appliesToState(state, action)) return state

  switch (action.type) {
    case 'count/start':
      return { ...state, countLoading: true, countError: false }
    case 'count/success':
      return { ...state, unreadCount: Math.max(0, action.unreadCount), countLoading: false, countError: false }
    case 'count/failure':
      return { ...state, countLoading: false, countError: true }
    case 'preview/start':
      return { ...state, previewLoading: true, previewError: false }
    case 'preview/success':
      return { ...state, previewItems: action.items, previewLoading: false, previewError: false }
    case 'preview/failure':
      return { ...state, previewLoading: false, previewError: true }
    case 'mark-one/start':
      return state.pendingIds.includes(action.id)
        ? state
        : { ...state, pendingIds: [...state.pendingIds, action.id] }
    case 'mark-one/success':
      return {
        ...state,
        previewItems: state.previewItems.map((item) => (item.id === action.item.id ? action.item : item)),
        unreadCount: action.wasUnread && state.unreadCount !== null ? Math.max(0, state.unreadCount - 1) : state.unreadCount,
      }
    case 'mark-one/finish':
      return { ...state, pendingIds: state.pendingIds.filter((id) => id !== action.id) }
    case 'mark-all/start':
      return { ...state, markAllPending: true }
    case 'mark-all/success':
      return {
        ...state,
        unreadCount: 0,
        previewItems: state.previewItems.map((item) => ({ ...item, is_read: true })),
      }
    case 'mark-all/finish':
      return { ...state, markAllPending: false }
  }
}

export function notificationPageFromSearch(params: URLSearchParams): { page: number; unreadOnly: boolean } {
  const pageValue = Number(params.get('page'))
  return {
    page: Number.isInteger(pageValue) && pageValue > 0 ? pageValue : 1,
    unreadOnly: params.get('filter') === 'unread',
  }
}

export function createNotificationListParams({
  page,
  pageSize,
  unreadOnly,
}: {
  page: number
  pageSize: number
  unreadOnly: boolean
}) {
  return { page, page_size: pageSize, unread_only: unreadOnly }
}

export function notificationRequestKey({
  userId,
  generation,
  page,
  pageSize,
  unreadOnly,
}: {
  userId: string
  generation: number
  page: number
  pageSize: number
  unreadOnly: boolean
}): string {
  return `${userId}:${generation}:${unreadOnly ? 'unread' : 'all'}:${page}:${pageSize}`
}

export function updateNotificationSearch(
  current: URLSearchParams,
  update: { page?: number; unreadOnly?: boolean },
): URLSearchParams {
  const next = new URLSearchParams(current)
  if (update.unreadOnly !== undefined) {
    if (update.unreadOnly) next.set('filter', 'unread')
    else next.delete('filter')
    next.delete('page')
  }
  if (update.page !== undefined) {
    if (update.page <= 1) next.delete('page')
    else next.set('page', String(update.page))
  }
  return next
}
