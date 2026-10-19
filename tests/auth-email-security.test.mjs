import assert from 'node:assert/strict'
import { after, before, test } from 'node:test'
import { readFile } from 'node:fs/promises'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { createServer } from 'vite'

let server, security, service, api, ForgotPage, ResetPage, VerifyPage, CandidateSettings, RecruiterSettings

before(async () => {
  server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom', logLevel: 'error' })
  security = await server.ssrLoadModule('/src/utils/authSecurity.ts')
  service = (await server.ssrLoadModule('/src/services/authService.ts')).authService
  api = (await server.ssrLoadModule('/src/services/api.ts')).default
  ForgotPage = (await server.ssrLoadModule('/src/pages/auth/ForgotPasswordPage.tsx')).default
  ResetPage = (await server.ssrLoadModule('/src/pages/auth/ResetPasswordPage.tsx')).default
  VerifyPage = (await server.ssrLoadModule('/src/pages/auth/VerifyEmailPage.tsx')).default
  CandidateSettings = (await server.ssrLoadModule('/src/pages/candidate/CandidateSettingsPage.tsx')).default
  RecruiterSettings = (await server.ssrLoadModule('/src/pages/recruiter/RecruiterSettingsPage.tsx')).default
})

after(async () => { await server?.close() })

test('every frozen auth code maps by detail.code without English message parsing', () => {
  const codes = [
    'EMAIL_NOT_VERIFIED', 'VERIFICATION_TOKEN_INVALID', 'VERIFICATION_TOKEN_EXPIRED', 'VERIFICATION_TOKEN_USED',
    'RESET_TOKEN_INVALID', 'RESET_TOKEN_EXPIRED', 'RESET_TOKEN_USED', 'CURRENT_PASSWORD_INCORRECT',
    'PASSWORD_SAME_AS_CURRENT', 'PASSWORD_POLICY_VIOLATION', 'AUTH_SESSION_INVALIDATED',
  ]
  for (const code of codes) {
    const error = { isAxiosError: true, response: { data: { detail: { code, message: 'server wording may change' } } } }
    assert.notEqual(security.authSecurityErrorMessage(error), 'Không thể hoàn tất yêu cầu. Vui lòng thử lại.')
  }
})

test('password UX mirrors the 8 character and 72 UTF-8 byte backend policy', () => {
  assert.match(security.passwordPolicyError('       '), /trống/)
  assert.match(security.passwordPolicyError('1234567'), /8/)
  assert.equal(security.passwordPolicyError('12345678'), null)
  assert.match(security.passwordPolicyError('á'.repeat(37)), /72 byte/)
})

test('auth service calls exact security endpoints and never changes public privacy contracts', async () => {
  const originalPost = api.post
  const calls = []
  api.post = async (url, data) => { calls.push([url, data]); return { data: { message: 'generic' } } }
  try {
    await service.resendVerification('user@example.com')
    await service.forgotPassword('user@example.com')
    await service.verifyEmail('verification-token')
    await service.resetPassword({ token: 'reset-token', new_password: 'password123' })
    await service.changePassword({ current_password: 'password123', new_password: 'password456' })
  } finally { api.post = originalPost }
  assert.deepEqual(calls.map(([url]) => url), [
    '/api/v1/auth/resend-verification', '/api/v1/auth/forgot-password', '/api/v1/auth/verify-email',
    '/api/v1/auth/reset-password', '/api/v1/account/change-password',
  ])
})

test('email verification reuses one request for the same one-time token', async () => {
  const originalPost = api.post
  const calls = []
  let finishRequest
  api.post = (url, data) => {
    calls.push([url, data])
    return new Promise((resolve) => { finishRequest = resolve })
  }

  try {
    const first = service.verifyEmail('strict-mode-token')
    const second = service.verifyEmail('strict-mode-token')

    assert.strictEqual(first, second)
    assert.equal(calls.length, 1)

    finishRequest({ data: { message: 'verified' } })
    await Promise.all([first, second])

    await service.verifyEmail('strict-mode-token')
    assert.equal(calls.length, 1)
  } finally { api.post = originalPost }
})

test('failed email verification can be retried without duplicating the in-flight request', async () => {
  const originalPost = api.post
  const calls = []
  let failRequest
  api.post = (url, data) => {
    calls.push([url, data])
    return new Promise((_, reject) => { failRequest = reject })
  }

  try {
    const first = service.verifyEmail('retryable-token')
    const second = service.verifyEmail('retryable-token')
    assert.strictEqual(first, second)
    assert.equal(calls.length, 1)

    failRequest(new Error('temporary network error'))
    await assert.rejects(Promise.all([first, second]), /temporary network error/)

    api.post = async (url, data) => {
      calls.push([url, data])
      return { data: { message: 'verified after retry' } }
    }
    await service.verifyEmail('retryable-token')
    assert.equal(calls.length, 2)
  } finally { api.post = originalPost }
})

test('forgot flow uses the real API and privacy-safe generic wording with no fake timer', async () => {
  const source = await readFile(new URL('../src/pages/auth/ForgotPasswordPage.tsx', import.meta.url), 'utf8')
  assert.match(source, /authService\.forgotPassword/)
  assert.doesNotMatch(source, /setTimeout/)
  assert.match(source, /Nếu email thuộc một tài khoản hợp lệ/)
  const html = renderToStaticMarkup(createElement(MemoryRouter, null, createElement(ForgotPage)))
  assert.match(html, /forgot-email/)
  assert.match(html, /Gửi hướng dẫn/)
})

test('verification and reset pages SSR safely without rendering raw query tokens', () => {
  const verifyHtml = renderToStaticMarkup(createElement(MemoryRouter, { initialEntries: ['/verify-email?token=raw-secret'] }, createElement(VerifyPage)))
  const resetHtml = renderToStaticMarkup(createElement(MemoryRouter, { initialEntries: ['/reset-password?token=raw-secret'] }, createElement(ResetPage)))
  assert.doesNotMatch(verifyHtml, /raw-secret/)
  assert.doesNotMatch(resetHtml, /raw-secret/)
  assert.match(resetHtml, /reset-password/)
  assert.match(resetHtml, /reset-confirm/)
})

test('used verification token has friendly guidance and a login action', async () => {
  const error = {
    isAxiosError: true,
    response: { data: { detail: { code: 'VERIFICATION_TOKEN_USED' } } },
  }
  assert.match(security.authSecurityErrorMessage(error), /đã được sử dụng.*hãy đăng nhập/i)

  const source = await readFile(new URL('../src/pages/auth/VerifyEmailPage.tsx', import.meta.url), 'utf8')
  assert.match(source, /VERIFICATION_TOKEN_USED/)
  assert.match(source, /to="\/login"/)
  assert.match(source, /Yêu cầu gửi lại email xác minh/)
})

test('missing verification token remains a safe local error', () => {
  const html = renderToStaticMarkup(createElement(MemoryRouter, { initialEntries: ['/verify-email'] }, createElement(VerifyPage)))
  assert.match(html, /Liên kết xác minh không hợp lệ/)
})

test('candidate and recruiter settings reuse the same account security form', async () => {
  const candidateSource = await readFile(new URL('../src/pages/candidate/CandidateSettingsPage.tsx', import.meta.url), 'utf8')
  const recruiterSource = await readFile(new URL('../src/pages/recruiter/RecruiterSettingsPage.tsx', import.meta.url), 'utf8')
  assert.match(candidateSource, /AccountSecurityForm/)
  assert.match(recruiterSource, /AccountSecurityForm/)
  const candidateHtml = renderToStaticMarkup(createElement(MemoryRouter, null, createElement(CandidateSettings)))
  const recruiterHtml = renderToStaticMarkup(createElement(MemoryRouter, null, createElement(RecruiterSettings)))
  for (const html of [candidateHtml, recruiterHtml]) {
    assert.match(html, /current-password/)
    assert.match(html, /new-password/)
    assert.match(html, /confirm-password/)
  }
})

test('router exposes all public and protected auth-security routes', async () => {
  const source = await readFile(new URL('../src/App.tsx', import.meta.url), 'utf8')
  for (const route of ['/verify-email', '/forgot-password', '/reset-password', '/candidate/settings', '/recruiter/settings']) {
    assert.match(source, new RegExp(route.replace('/', '\\/')))
  }
})
