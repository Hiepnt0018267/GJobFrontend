export interface SupportConfig {
  zaloUrl: string | null
  email: string | null
  hotline: string | null
}

export function validateSafeExternalUrl(url?: string | null): string | null {
  if (!url) return null
  const trimmed = url.trim()
  if (!trimmed) return null
  try {
    const parsed = new URL(trimmed)
    if (parsed.protocol === 'https:' || parsed.protocol === 'http:') {
      return trimmed
    }
    return null
  } catch {
    return null
  }
}

export function validateEmail(email?: string | null): string | null {
  if (!email) return null
  const trimmed = email.trim()
  if (!trimmed) return null
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(trimmed) ? trimmed : null
}

export function validatePhone(phone?: string | null): string | null {
  if (!phone) return null
  const trimmed = phone.trim()
  if (!trimmed) return null
  const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]{6,15}$/
  return phoneRegex.test(trimmed) ? trimmed : null
}

export function getSupportConfig(): SupportConfig {
  const envZalo = import.meta.env.VITE_SUPPORT_ZALO_URL
  const envEmail = import.meta.env.VITE_SUPPORT_EMAIL
  const envHotline = import.meta.env.VITE_SUPPORT_HOTLINE

  return {
    zaloUrl: validateSafeExternalUrl(envZalo),
    email: validateEmail(envEmail),
    hotline: validatePhone(envHotline),
  }
}

