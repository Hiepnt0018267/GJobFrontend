let fallbackRowSequence = 0

export function createCVClientRowKey(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID()
  fallbackRowSequence += 1
  return `cv-row-${Date.now()}-${fallbackRowSequence}`
}

export function createCVClientRowKeys(count: number): string[] {
  return Array.from({ length: count }, createCVClientRowKey)
}

export function reconcileCVClientRowKeys(current: string[], count: number): string[] {
  if (current.length === count) return current
  if (current.length > count) return current.slice(0, count)
  return [...current, ...createCVClientRowKeys(count - current.length)]
}
