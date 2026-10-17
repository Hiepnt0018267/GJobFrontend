import assert from 'node:assert/strict'
import { after, before, test } from 'node:test'
import { readFileSync } from 'node:fs'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { createServer } from 'vite'

let server, subscription, apiError, MatchPanel, PlansPage, SettingsPage, AccountMenu, ToastProvider, recruiterNavigation, service, api

before(async () => {
  server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom', logLevel: 'error' })
  subscription = await server.ssrLoadModule('/src/utils/subscription.ts')
  apiError = await server.ssrLoadModule('/src/utils/apiError.ts')
  MatchPanel = (await server.ssrLoadModule('/src/components/matching/RecruiterApplicationMatchPanel.tsx')).default
  PlansPage = (await server.ssrLoadModule('/src/pages/recruiter/RecruiterPlansPage.tsx')).default
  SettingsPage = (await server.ssrLoadModule('/src/pages/recruiter/RecruiterSettingsPage.tsx')).default
  AccountMenu = (await server.ssrLoadModule('/src/components/recruiter/layout/RecruiterAccountMenu.tsx')).default
  ToastProvider = (await server.ssrLoadModule('/src/contexts/ToastContext.tsx')).ToastProvider
  recruiterNavigation = await server.ssrLoadModule('/src/config/recruiterNavigation.ts')
  service = (await server.ssrLoadModule('/src/services/subscriptionService.ts')).subscriptionService
  api = (await server.ssrLoadModule('/src/services/api.ts')).default
})

after(async () => { await server?.close() })

test('missing or false entitlement fails closed and only explicit true unlocks', () => {
  const base = { effective_plan: { code: 'FREE' }, subscription: null }
  assert.equal(subscription.hasRecruiterFeature(null, 'AI_CANDIDATE_RANKING'), false)
  assert.equal(subscription.hasRecruiterFeature(base, 'AI_CANDIDATE_RANKING'), false)
  assert.equal(subscription.hasRecruiterFeature({ ...base, entitlements: { AI_CANDIDATE_RANKING: false } }, 'AI_CANDIDATE_RANKING'), false)
  assert.equal(subscription.hasRecruiterFeature({ ...base, entitlements: { AI_CANDIDATE_RANKING: true } }, 'AI_CANDIDATE_RANKING'), true)
})

test('FEATURE_NOT_INCLUDED is matched by both code and exact feature', () => {
  const error = { isAxiosError: true, response: { status: 403, data: { detail: { code: 'FEATURE_NOT_INCLUDED', feature: 'DETAILED_CV_JD_MATCH' } } } }
  assert.equal(apiError.isFeatureNotIncludedError(error, 'DETAILED_CV_JD_MATCH'), true)
  assert.equal(apiError.isFeatureNotIncludedError(error, 'AI_CANDIDATE_RANKING'), false)
  assert.equal(apiError.isFeatureNotIncludedError({ ...error, response: { ...error.response, status: 500 } }, 'DETAILED_CV_JD_MATCH'), false)
})

test('locked recruiter match panel exposes upgrade path without a premium request', () => {
  let deniedCalls = 0
  const html = renderToStaticMarkup(createElement(MemoryRouter, null, createElement(MatchPanel, {
    applicationId: 'application-1', candidateName: 'Candidate', jobTitle: 'Backend', entitled: false,
    entitlementLoading: false, onEntitlementDenied: () => { deniedCalls += 1 },
  })))
  assert.match(html, /Phân tích chi tiết CV–JD không có trong gói hiện tại/)
  assert.match(html, /\/recruiter\/plans/)
  assert.doesNotMatch(html, /So khớp CV/)
  assert.equal(deniedCalls, 0)
})

test('plan catalog endpoint is recruiter-scoped and the plan page renders without invented payment state', async () => {
  const original = api.get
  const calls = []
  api.get = async (url) => { calls.push(url); return { data: [] } }
  try { await service.getRecruiterPlanCatalog() } finally { api.get = original }
  assert.deepEqual(calls, ['/api/v1/recruiter/subscription-plans'])
  const html = renderToStaticMarkup(createElement(MemoryRouter, null, createElement(ToastProvider, null, createElement(PlansPage))))
  assert.match(html, /Quyền lợi phù hợp cho bạn/)
  assert.doesNotMatch(html, /Đã thanh toán|Thanh toán thành công|checkout/i)
})

test('plan cards render only admin-authored catalog data without invented marketing copy', () => {
  const source = readFileSync(new URL('../src/pages/recruiter/RecruiterPlansPage.tsx', import.meta.url), 'utf8')
  assert.doesNotMatch(source, /Gói dịch vụ dành cho nhà tuyển dụng GJob|Nổi bật|Gói quyền lợi tham khảo|mãi mãi/)
  assert.match(source, /const descriptionItems = plan\.description/)
  assert.match(source, /plan\.description\.split\(\/\\r\?\\n\/\)/)
  assert.match(source, /descriptionItems\.map/)
  assert.doesNotMatch(source, /plan\.features\.map/)
  assert.match(source, /formatVnd\(plan\.price\)/)
  assert.match(source, /billingPeriodLabel\(plan\.billing_period\)/)
})

test('avatar menu opens the settings hub without duplicating service management', () => {
  const html = renderToStaticMarkup(createElement(MemoryRouter, null, createElement(AccountMenu, {
    name: 'Recruiter', email: 'recruiter@example.com', open: true,
    onToggle() {}, onClose() {}, onLogout() {},
  })))
  assert.match(html, /Cài đặt/)
  assert.match(html, /href="\/recruiter\/settings"/)
  assert.doesNotMatch(html, /Hồ sơ công ty|href="\/recruiter\/profile"/)
  assert.doesNotMatch(html, /Quản lý dịch vụ|href="\/recruiter\/plans"/)
  assert.equal(recruiterNavigation.recruiterNavigationGroups.flatMap((group) => group.items).some((item) => item.to === '/recruiter/plans'), false)
  assert.deepEqual(recruiterNavigation.getRecruiterPageMeta('/recruiter/plans'), { title: 'Quản lý dịch vụ', context: 'Nhà tuyển dụng' })
  const topbarSource = readFileSync(new URL('../src/components/recruiter/layout/RecruiterTopbar.tsx', import.meta.url), 'utf8')
  const sidebarSource = readFileSync(new URL('../src/components/recruiter/layout/RecruiterSidebar.tsx', import.meta.url), 'utf8')
  assert.match(topbarSource, /useRecruiterSubscription/)
  assert.match(topbarSource, /planDisplayName\(subscriptionQuery\.data\.effective_plan\)/)
  assert.match(topbarSource, /to="\/recruiter\/plans"/)
  assert.doesNotMatch(topbarSource, /RecruiterAccountMenu/)
  assert.match(sidebarSource, /<RecruiterAccountMenu/)
  assert.match(sidebarSource, /border-t border-slate-200\/80/)
})

test('company profile does not duplicate the current subscription section', () => {
  const source = readFileSync(new URL('../src/pages/recruiter/RecruiterProfilePage.tsx', import.meta.url), 'utf8')
  assert.doesNotMatch(source, /RecruiterSubscriptionSection|Gói đang sử dụng/)
})

test('settings hub exposes company profile and service management without a fake password action', () => {
  const html = renderToStaticMarkup(createElement(MemoryRouter, null, createElement(SettingsPage)))
  assert.match(html, /Cài đặt/)
  assert.match(html, /href="\/recruiter\/profile\/edit"/)
  assert.match(html, /href="\/recruiter\/plans"/)
  assert.match(html, /Quản lý dịch vụ/)
  assert.match(html, /Đổi mật khẩu/)
  assert.match(html, /Sắp có/)
  assert.doesNotMatch(html, /button[^>]*>[^<]*Đổi mật khẩu/)
  assert.deepEqual(recruiterNavigation.getRecruiterPageMeta('/recruiter/settings'), { title: 'Cài đặt', context: 'Tài khoản' })
})
