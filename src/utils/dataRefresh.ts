export const DATA_REFRESH_EVENT = 'gjob:data-refresh'

/**
 * Broadcasts a completed data change to visible data screens.
 * A future SSE client can call this same function for cross-user updates.
 */
export function notifyDataRefresh(): void {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new Event(DATA_REFRESH_EVENT))
}
