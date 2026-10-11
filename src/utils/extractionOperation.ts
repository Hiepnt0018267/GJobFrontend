/** Synchronous lock protects the interval before React's disabled state rerenders. */
export async function runExtractionExclusive<T>(lock: { current: boolean }, operation: () => Promise<T>): Promise<T | undefined> {
  if (lock.current) return undefined
  lock.current = true
  try { return await operation() } finally { lock.current = false }
}

export function extractionRequestTimeout(policy: { operation_timeout_ms: number; request_timeout_ms: number }) {
  if (!Number.isFinite(policy.operation_timeout_ms) || !Number.isFinite(policy.request_timeout_ms)
    || policy.operation_timeout_ms <= 0 || policy.request_timeout_ms < policy.operation_timeout_ms + 10_000) {
    throw new Error('Không thể xác nhận thời gian xử lý CV an toàn. Vui lòng thử lại sau.')
  }
  return policy.request_timeout_ms
}
