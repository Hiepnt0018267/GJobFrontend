import { resolveApiAssetUrl } from '../services/api'

export function safeExternalUrl(value: string | null | undefined): string | null {
  if (!value) return null
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.toString() : null
  } catch {
    return null
  }
}

export function safeImageUrl(value: string | null | undefined): string | null {
  if (!value) return null
  if (value.startsWith('/')) return resolveApiAssetUrl(value) ?? null
  return safeExternalUrl(value)
}

export function externalUrlLabel(value: string): string {
  try {
    return new URL(value).hostname.replace(/^www\./, '')
  } catch {
    return value
  }
}
