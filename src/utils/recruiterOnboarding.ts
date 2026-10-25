const RECRUITER_ONBOARDING_PENDING_KEY_PREFIX = 'gjob:recruiter-onboarding-pending:'

function defaultStorage(): Storage | null {
  return typeof window === 'undefined' ? null : window.localStorage
}

function normalizedEmail(email: string): string {
  return email.trim().toLowerCase()
}

export function recruiterOnboardingPendingKey(email: string): string {
  return `${RECRUITER_ONBOARDING_PENDING_KEY_PREFIX}${normalizedEmail(email)}`
}

export function requestRecruiterOnboarding(
  email: string,
  storage: Storage | null = defaultStorage(),
): void {
  if (!storage || !normalizedEmail(email)) return
  try {
    storage.setItem(recruiterOnboardingPendingKey(email), '1')
  } catch {
    // Storage can be unavailable in private or restricted browser contexts.
  }
}

export function hasPendingRecruiterOnboarding(
  email: string,
  storage: Storage | null = defaultStorage(),
): boolean {
  if (!storage || !normalizedEmail(email)) return false
  try {
    return storage.getItem(recruiterOnboardingPendingKey(email)) === '1'
  } catch {
    return false
  }
}

export function markRecruiterOnboardingSeen(
  email: string,
  storage: Storage | null = defaultStorage(),
): void {
  if (!storage || !normalizedEmail(email)) return
  try {
    storage.removeItem(recruiterOnboardingPendingKey(email))
  } catch {
    // Storage can be unavailable in private or restricted browser contexts.
  }
}

export const recruiterProfileFieldLabels: Record<string, string> = {
  phone: 'Số điện thoại',
  company_name: 'Tên công ty',
  company_description: 'Giới thiệu công ty',
  company_address: 'Địa chỉ công ty',
  industry: 'Ngành nghề',
  company_size: 'Quy mô công ty',
}
