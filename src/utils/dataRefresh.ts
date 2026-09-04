export const DATA_REFRESH_EVENT = 'gjob:data-refresh'
const DATA_REFRESH_CHANNEL = 'gjob:data-refresh-channel'

type DataRefreshOptions = {
  local?: boolean
}

/**
 * Broadcasts a completed data change to visible data screens and sibling tabs.
 * A future SSE client can call this same function for cross-user updates.
 */
export function notifyDataRefresh({ local = true }: DataRefreshOptions = {}): void {
  if (typeof window === 'undefined') return
  if (local) window.dispatchEvent(new Event(DATA_REFRESH_EVENT))

  if (typeof BroadcastChannel === 'undefined') return
  const channel = new BroadcastChannel(DATA_REFRESH_CHANNEL)
  channel.postMessage(DATA_REFRESH_EVENT)
  channel.close()
}

/** Listens for mutations completed in another tab of the same GJob origin. */
export function subscribeToExternalDataRefresh(onRefresh: () => void): () => void {
  if (typeof BroadcastChannel === 'undefined') return () => undefined
  const channel = new BroadcastChannel(DATA_REFRESH_CHANNEL)
  channel.onmessage = (event: MessageEvent<unknown>) => {
    if (event.data === DATA_REFRESH_EVENT) onRefresh()
  }
  return () => channel.close()
}
