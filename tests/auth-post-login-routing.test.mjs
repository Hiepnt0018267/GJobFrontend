import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const authPageSource = await readFile(new URL('../src/pages/auth/AuthPage.tsx', import.meta.url), 'utf8')
const appSource = await readFile(new URL('../src/App.tsx', import.meta.url), 'utf8')

test('login submission delegates redirecting to the authenticated route guard', () => {
  const loginHandler = authPageSource.slice(
    authPageSource.indexOf('async function handleLoginSubmit'),
    authPageSource.indexOf('async function handleRegisterSubmit'),
  )

  assert.match(loginHandler, /await login\(loginEmail\.trim\(\), loginPassword\)/)
  assert.doesNotMatch(loginHandler, /setTimeout\s*\(/)
  assert.doesNotMatch(loginHandler, /navigate\s*\(/)
  assert.doesNotMatch(loginHandler, /dashboardFor/)
})

test('authenticated route guard redirects from the fresh user role', () => {
  assert.match(appSource, /const dest = returnTo \?\? dashboardFor\(user\.role\)/)
  assert.match(appSource, /return <Navigate to=\{dest\}/)
})
