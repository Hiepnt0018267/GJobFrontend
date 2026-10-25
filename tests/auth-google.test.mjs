import assert from 'node:assert/strict'
import { test } from 'node:test'
import { readFile } from 'node:fs/promises'

test('Google auth uses the official GIS renderer with one shared SDK load', async () => {
  const source = await readFile(new URL('../src/components/auth/GoogleAuthPanel.tsx', import.meta.url), 'utf8')
  assert.match(source, /accounts\.google\.com\/gsi\/client/)
  assert.match(source, /renderButton/)
  assert.match(source, /let sdkPromise/)
  assert.match(source, /activeCredential/)
  assert.doesNotMatch(source, /GOOGLE_CLIENT_SECRET/)
})

test('Google onboarding exposes Candidate and Recruiter but never Admin', async () => {
  const source = await readFile(new URL('../src/components/auth/GoogleAuthPanel.tsx', import.meta.url), 'utf8')
  assert.match(source, /CANDIDATE/)
  assert.match(source, /RECRUITER/)
  assert.doesNotMatch(source, /setRole\('ADMIN'\)/)
  assert.match(source, /suggested_full_name/)
})

test('Google service uses discriminated backend states and exact safe-link endpoints', async () => {
  const service = await readFile(new URL('../src/services/authService.ts', import.meta.url), 'utf8')
  const types = await readFile(new URL('../src/types/auth.ts', import.meta.url), 'utf8')
  assert.match(service, /\/api\/v1\/auth\/google/)
  assert.match(service, /google\/complete-registration/)
  assert.match(service, /google\/link\/password/)
  for (const state of ['AUTHENTICATED', 'ROLE_SELECTION_REQUIRED', 'GOOGLE_ACCOUNT_LINK_REQUIRED', 'LOCAL_ACCOUNT_VERIFICATION_REQUIRED']) {
    assert.match(types, new RegExp(state))
  }
})

test('account security switches between set and change password from canonical user contract', async () => {
  const form = await readFile(new URL('../src/components/account/AccountSecurityForm.tsx', import.meta.url), 'utf8')
  const types = await readFile(new URL('../src/types/auth.ts', import.meta.url), 'utf8')
  assert.match(types, /has_local_password: boolean/)
  assert.match(form, /authService\.setPassword/)
  assert.match(form, /authService\.changePassword/)
})
