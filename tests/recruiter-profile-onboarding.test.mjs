import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const editSource = await readFile(new URL('../src/pages/recruiter/RecruiterProfileEditPage.tsx', import.meta.url), 'utf8')
const authSource = await readFile(new URL('../src/pages/auth/AuthPage.tsx', import.meta.url), 'utf8')
const appSource = await readFile(new URL('../src/App.tsx', import.meta.url), 'utf8')
const onboardingSource = await readFile(new URL('../src/utils/recruiterOnboarding.ts', import.meta.url), 'utf8')
const createSource = await readFile(new URL('../src/pages/recruiter/RecruiterJobCreatePage.tsx', import.meta.url), 'utf8')
const dashboardSource = await readFile(new URL('../src/pages/recruiter/RecruiterDashboardPage.tsx', import.meta.url), 'utf8')

test('only a newly registered recruiter is sent through company onboarding once', () => {
  assert.match(authSource, /regRole === 'RECRUITER'\) requestRecruiterOnboarding\(regEmail\)/)
  assert.match(appSource, /hasPendingRecruiterOnboarding\(user\.email\)/)
  assert.doesNotMatch(appSource, /!hasSeenRecruiterOnboarding/)
  assert.match(onboardingSource, /storage\.removeItem\(recruiterOnboardingPendingKey\(email\)\)/)
  assert.match(editSource, /searchParams\.get\('onboarding'\) === '1'/)
  assert.match(editSource, /Hoàn thiện sau/)
  assert.match(editSource, /markRecruiterOnboardingSeen\(user\.email\)/)
})

test('job creation is gated by the canonical profile completion state', () => {
  assert.match(createSource, /getMyRecruiterProfile\(\)/)
  assert.match(createSource, /!profile\.profile_completed/)
  assert.match(createSource, /Hoàn thiện hồ sơ trước khi đăng tin/)
  assert.match(createSource, /profile\?\.profile_completed/)
})

test('dashboard reminds incomplete recruiters without blocking other features', () => {
  assert.match(dashboardSource, /!data\.profile\.profile_completed/)
  assert.match(dashboardSource, /Các chức năng khác vẫn sử dụng bình thường/)
})
