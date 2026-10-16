import { useCallback, useEffect, useMemo, useReducer, useRef, type ReactNode } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useDataRefreshVersion } from '../hooks/useDataRefreshVersion'
import { notificationService } from '../services/notificationService'
import { notifyDataRefresh } from '../utils/dataRefresh'
import {
  createNotificationListParams,
  createNotificationClientState,
  notificationStateReducer,
} from '../utils/notification'
import {
  enableNotificationSound,
  playNotificationSound,
  shouldPlayNotificationSound,
} from '../utils/notificationSound'
import type { NotificationItem } from '../types/notification'
import { NotificationContext } from './notificationState'

const PREVIEW_PAGE_SIZE = 6
const NOTIFICATION_REFRESH_INTERVAL_MS = 30_000

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated, loading } = useAuth()
  const dataRefreshVersion = useDataRefreshVersion()
  const identityId = !loading && isAuthenticated && user ? user.id : null
  const [state, dispatch] = useReducer(notificationStateReducer, createNotificationClientState(null))
  const identityRef = useRef<string | null>(null)
  const generationRef = useRef(0)
  const countControllerRef = useRef<AbortController | null>(null)
  const previewControllerRef = useRef<AbortController | null>(null)
  const mutationControllersRef = useRef(new Map<string, AbortController>())
  const markAllControllerRef = useRef<AbortController | null>(null)
  const pendingIdsRef = useRef(new Set<string>())
  const markAllPendingRef = useRef(false)
  const lastUnreadCountRef = useRef<number | null>(null)

  const abortAll = useCallback(() => {
    countControllerRef.current?.abort()
    previewControllerRef.current?.abort()
    markAllControllerRef.current?.abort()
    for (const controller of mutationControllersRef.current.values()) controller.abort()
    countControllerRef.current = null
    previewControllerRef.current = null
    markAllControllerRef.current = null
    mutationControllersRef.current.clear()
    pendingIdsRef.current.clear()
    markAllPendingRef.current = false
  }, [])

  useEffect(() => {
    abortAll()
    identityRef.current = identityId
    generationRef.current += 1
    lastUnreadCountRef.current = null
    dispatch({ type: 'identity/reset', identityId, generation: generationRef.current })
  }, [abortAll, identityId])

  useEffect(() => () => abortAll(), [abortAll])

  const refreshCount = useCallback(async () => {
    const requestIdentity = identityId
    if (!requestIdentity) return
    const requestGeneration = generationRef.current
    countControllerRef.current?.abort()
    const controller = new AbortController()
    countControllerRef.current = controller
    dispatch({ type: 'count/start', identityId: requestIdentity, generation: requestGeneration })
    try {
      const response = await notificationService.getUnreadCount(controller.signal)
      if (
        !controller.signal.aborted
        && identityRef.current === requestIdentity
        && generationRef.current === requestGeneration
      ) {
        const unreadCount = Math.max(0, response.unread_count)
        const shouldPlaySound = shouldPlayNotificationSound(lastUnreadCountRef.current, unreadCount)
        lastUnreadCountRef.current = unreadCount
        dispatch({
          type: 'count/success',
          identityId: requestIdentity,
          generation: requestGeneration,
          unreadCount,
        })
        if (shouldPlaySound) playNotificationSound()
      }
    } catch {
      if (!controller.signal.aborted && identityRef.current === requestIdentity) {
        dispatch({ type: 'count/failure', identityId: requestIdentity, generation: requestGeneration })
      }
    } finally {
      if (countControllerRef.current === controller) countControllerRef.current = null
    }
  }, [identityId])

  const refreshPreview = useCallback(async () => {
    const requestIdentity = identityId
    if (!requestIdentity) return
    const requestGeneration = generationRef.current
    previewControllerRef.current?.abort()
    const controller = new AbortController()
    previewControllerRef.current = controller
    dispatch({ type: 'preview/start', identityId: requestIdentity, generation: requestGeneration })
    try {
      const response = await notificationService.getNotifications(
        createNotificationListParams({ page: 1, pageSize: PREVIEW_PAGE_SIZE, unreadOnly: true }),
        controller.signal,
      )
      if (
        !controller.signal.aborted
        && identityRef.current === requestIdentity
        && generationRef.current === requestGeneration
      ) {
        dispatch({
          type: 'preview/success',
          identityId: requestIdentity,
          generation: requestGeneration,
          items: response.items,
        })
      }
    } catch {
      if (!controller.signal.aborted && identityRef.current === requestIdentity) {
        dispatch({ type: 'preview/failure', identityId: requestIdentity, generation: requestGeneration })
      }
    } finally {
      if (previewControllerRef.current === controller) previewControllerRef.current = null
    }
  }, [identityId])

  useEffect(() => {
    if (identityId) void refreshCount()
  }, [dataRefreshVersion, identityId, refreshCount])

  useEffect(() => {
    if (!identityId) return

    const unlockSound = () => {
      void enableNotificationSound()
      window.removeEventListener('pointerdown', unlockSound)
      window.removeEventListener('keydown', unlockSound)
    }

    window.addEventListener('pointerdown', unlockSound, { passive: true })
    window.addEventListener('keydown', unlockSound)
    return () => {
      window.removeEventListener('pointerdown', unlockSound)
      window.removeEventListener('keydown', unlockSound)
    }
  }, [identityId])

  useEffect(() => {
    if (!identityId) return

    const intervalId = window.setInterval(() => {
      if (document.visibilityState === 'visible') void refreshCount()
    }, NOTIFICATION_REFRESH_INTERVAL_MS)
    return () => window.clearInterval(intervalId)
  }, [identityId, refreshCount])

  const markOne = useCallback(async (item: NotificationItem): Promise<NotificationItem> => {
    const requestIdentity = identityId
    if (!requestIdentity) throw new Error('Notification identity is unavailable')
    if (item.is_read) return item
    if (pendingIdsRef.current.has(item.id)) throw new Error('Notification update is already pending')

    const requestGeneration = generationRef.current
    const controller = new AbortController()
    pendingIdsRef.current.add(item.id)
    mutationControllersRef.current.set(item.id, controller)
    dispatch({ type: 'mark-one/start', identityId: requestIdentity, generation: requestGeneration, id: item.id })
    try {
      const updated = await notificationService.markNotificationRead(item.id, controller.signal)
      if (
        !controller.signal.aborted
        && identityRef.current === requestIdentity
        && generationRef.current === requestGeneration
      ) {
        dispatch({
          type: 'mark-one/success',
          identityId: requestIdentity,
          generation: requestGeneration,
          item: updated,
          wasUnread: !item.is_read,
        })
        if (!item.is_read && lastUnreadCountRef.current !== null) {
          lastUnreadCountRef.current = Math.max(0, lastUnreadCountRef.current - 1)
        }
        notifyDataRefresh({ local: false })
        return updated
      }
      throw new DOMException('Notification identity changed', 'AbortError')
    } finally {
      pendingIdsRef.current.delete(item.id)
      mutationControllersRef.current.delete(item.id)
      if (identityRef.current === requestIdentity && generationRef.current === requestGeneration) {
        dispatch({ type: 'mark-one/finish', identityId: requestIdentity, generation: requestGeneration, id: item.id })
      }
    }
  }, [identityId])

  const markAll = useCallback(async (): Promise<number> => {
    const requestIdentity = identityId
    if (!requestIdentity) throw new Error('Notification identity is unavailable')
    if (markAllPendingRef.current) throw new Error('Notification update is already pending')

    const requestGeneration = generationRef.current
    const controller = new AbortController()
    markAllPendingRef.current = true
    markAllControllerRef.current = controller
    dispatch({ type: 'mark-all/start', identityId: requestIdentity, generation: requestGeneration })
    try {
      const response = await notificationService.markAllNotificationsRead(controller.signal)
      if (
        !controller.signal.aborted
        && identityRef.current === requestIdentity
        && generationRef.current === requestGeneration
      ) {
        dispatch({ type: 'mark-all/success', identityId: requestIdentity, generation: requestGeneration })
        lastUnreadCountRef.current = 0
        notifyDataRefresh({ local: false })
        return response.updated_count
      }
      throw new DOMException('Notification identity changed', 'AbortError')
    } finally {
      markAllPendingRef.current = false
      if (markAllControllerRef.current === controller) markAllControllerRef.current = null
      if (identityRef.current === requestIdentity && generationRef.current === requestGeneration) {
        dispatch({ type: 'mark-all/finish', identityId: requestIdentity, generation: requestGeneration })
      }
    }
  }, [identityId])

  const visibleState = state.identityId === identityId
    ? state
    : createNotificationClientState(identityId)

  const value = useMemo(() => ({
    identityId,
    identityGeneration: visibleState.generation,
    unreadCount: visibleState.unreadCount,
    countLoading: visibleState.countLoading,
    countError: visibleState.countError,
    previewItems: visibleState.previewItems,
    previewLoading: visibleState.previewLoading,
    previewError: visibleState.previewError,
    pendingIds: new Set(visibleState.pendingIds),
    markAllPending: visibleState.markAllPending,
    refreshCount,
    refreshPreview,
    markOne,
    markAll,
  }), [identityId, markAll, markOne, refreshCount, refreshPreview, visibleState])

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>
}
