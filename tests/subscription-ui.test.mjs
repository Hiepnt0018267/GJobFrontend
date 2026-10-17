import assert from 'node:assert/strict'
import { after, before, test } from 'node:test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { createServer } from 'vite'

let server, subscription, service, api, AdminPage, AdminRecruiterList, RecruiterSection, RecruiterSummary, PlanGrid, PlanDialog, GrantDialog, adminNavigation

before(async () => {
  server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom', logLevel: 'error' })
  subscription = await server.ssrLoadModule('/src/utils/subscription.ts')
  service = (await server.ssrLoadModule('/src/services/subscriptionService.ts')).subscriptionService
  api = (await server.ssrLoadModule('/src/services/api.ts')).default
  AdminPage = (await server.ssrLoadModule('/src/pages/admin/AdminSubscriptionPlansPage.tsx')).default
  AdminRecruiterList = (await server.ssrLoadModule('/src/components/subscription/AdminRecruiterSubscriptionList.tsx')).default
  const recruiterModule = await server.ssrLoadModule('/src/components/subscription/RecruiterSubscriptionSection.tsx')
  RecruiterSection = recruiterModule.default
  RecruiterSummary = recruiterModule.RecruiterSubscriptionSummary
  PlanGrid = (await server.ssrLoadModule('/src/components/subscription/SubscriptionPlanGrid.tsx')).default
  PlanDialog = (await server.ssrLoadModule('/src/components/subscription/SubscriptionPlanDialog.tsx')).default
  GrantDialog = (await server.ssrLoadModule('/src/components/subscription/RecruiterSubscriptionDialog.tsx')).default
  adminNavigation = await server.ssrLoadModule('/src/config/adminNavigation.ts')
})

after(async () => { await server?.close() })

const freePlan = { id: 'free', code: 'FREE', name: 'Miễn phí', description: null, price: '0', currency: 'VND', billing_period: 'NONE', duration_days: null, is_active: true, created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' }
const paidPlan = { ...freePlan, id: 'pro', code: 'PRO', name: 'Pro', price: '12345678901234567890', billing_period: 'MONTHLY', duration_days: 30 }

test('money remains a decimal string and formats without Number or parseFloat', () => {
  assert.equal(subscription.formatVnd('99000'), '99.000 ₫')
  assert.equal(subscription.formatVnd('12345678901234567890'), '12.345.678.901.234.567.890 ₫')
  assert.equal(subscription.formatVnd('0000'), '0 ₫')
  assert.equal(subscription.formatVnd('1.5'), '—')
  const payload = subscription.buildPlanCreatePayload({ code: 'PRO', name: 'Pro', description: '', price: '12345678901234567890', currency: 'VND', billing_period: 'MONTHLY', duration_days: '30', is_active: true })
  assert.equal(typeof payload.price, 'string')
  assert.equal(payload.price, '12345678901234567890')
})

test('plan form enforces FREE and paid-plan invariants and edit allowlist', () => {
  assert.equal(subscription.validatePlanForm({ code: 'FREE', name: 'Free', description: '', price: '0', currency: 'VND', billing_period: 'NONE', duration_days: '', is_active: true }, 'create'), null)
  assert.match(subscription.validatePlanForm({ code: 'PRO', name: 'Pro', description: '', price: '0', currency: 'VND', billing_period: 'MONTHLY', duration_days: '30', is_active: true }, 'create'), /trả phí/)
  assert.deepEqual(subscription.buildPlanUpdatePayload({ code: 'LOCKED', name: 'Pro 2', description: '', price: '99000', currency: 'USD', billing_period: 'NONE', duration_days: '', is_active: false }), { name: 'Pro 2', description: null, price: '99000', is_active: false })
  const inactive = { ...paidPlan, id: 'inactive', code: 'OLD', name: 'Old', is_active: false }
  assert.deepEqual(subscription.activePaidPlans([freePlan, inactive, paidPlan]).map((plan) => plan.id), ['pro'])
  assert.equal(subscription.planDisplayName({ code: 'FUTURE_UNKNOWN', name: '' }), 'FUTURE_UNKNOWN')
})

test('datetime-local grant input is converted to ISO and range is bounded', () => {
  const payload = subscription.buildGrantPayload({ plan_id: 'pro', starts_at: '2026-10-16T09:30', expires_at: '2026-11-16T09:30' })
  assert.equal(payload.plan_id, 'pro')
  assert.equal(payload.starts_at, new Date('2026-10-16T09:30').toISOString())
  assert.equal(payload.expires_at, new Date('2026-11-16T09:30').toISOString())
  assert.equal(subscription.validGrantDateRange('2026-10-16T09:30', '2026-10-16T09:29'), false)
  assert.equal(subscription.validGrantDateRange('', ''), true)
  assert.deepEqual(subscription.buildGrantPayload({ plan_id: 'pro', starts_at: '', expires_at: '' }), { plan_id: 'pro', starts_at: null, expires_at: null })
})

test('FREE is an implicit fallback without a subscription row', () => {
  assert.equal(subscription.isFreeFallback({ effective_plan: freePlan, subscription: null }), true)
  assert.equal(subscription.isFreeFallback({ effective_plan: paidPlan, subscription: null }), false)
})

test('dynamic catalog, readonly edit fields and paid-only grant options SSR safely', () => {
  const unknown = { ...paidPlan, id: 'future', code: 'FUTURE_UNKNOWN', name: '', price: '99000' }
  const inactive = { ...paidPlan, id: 'inactive', code: 'OLD', name: 'Old', is_active: false }
  const gridHtml = renderToStaticMarkup(createElement(PlanGrid, { plans: [freePlan, paidPlan, unknown], onEdit() {} }))
  assert.match(gridHtml, /Miễn phí/)
  assert.match(gridHtml, /Pro/)
  assert.match(gridHtml, /FUTURE_UNKNOWN/)
  assert.match(gridHtml, /99\.000 ₫/)

  const editHtml = renderToStaticMarkup(createElement(PlanDialog, { mode: 'edit', plan: paidPlan, pending: false, requestError: null, onClose() {}, onSubmit: async () => {} }))
  assert.equal((editHtml.match(/disabled=""/g) ?? []).length, 4)
  assert.match(editHtml, /Giá mới áp dụng cho các đăng ký hoặc giao dịch trong tương lai/)

  const recruiter = { id: 'r1', email: 'r@example.com', full_name: 'Recruiter', is_active: true, effective_plan: freePlan, subscription: null }
  const grantHtml = renderToStaticMarkup(createElement(GrantDialog, { recruiter, plans: [freePlan, inactive, paidPlan], pending: false, requestError: null, onClose() {}, onSubmit: async () => {} }))
  assert.match(grantHtml, />Pro · 12\.345\.678\.901\.234\.567\.890 ₫</)
  assert.doesNotMatch(grantHtml, />Miễn phí ·/)
  assert.doesNotMatch(grantHtml, />Old ·/)
})

test('recruiter SSR distinguishes FREE fallback, paid state and revoke result', () => {
  const freeResponse = { effective_plan: freePlan, subscription: null }
  const paidResponse = { effective_plan: paidPlan, subscription: { id: 'sub-1', status: 'ACTIVE', starts_at: '2026-10-01T00:00:00Z', expires_at: '2026-11-01T00:00:00Z', source: 'ADMIN' } }
  const freeHtml = renderToStaticMarkup(createElement(RecruiterSummary, { data: freeResponse }))
  const paidHtml = renderToStaticMarkup(createElement(RecruiterSummary, { data: paidResponse }))
  assert.match(freeHtml, /Gói hiện tại: Miễn phí/)
  assert.doesNotMatch(freeHtml, /Không có subscription|Chưa đăng ký/)
  assert.match(paidHtml, /Pro/)
  assert.match(paidHtml, /Quản trị viên/)
  const revokeResult = freeResponse
  assert.equal(subscription.isFreeFallback(revokeResult), true)
})

test('admin recruiter SSR shows FREE and full paid subscription metadata without Company', () => {
  const paidSubscription = { id: 'sub-1', status: 'ACTIVE', starts_at: '2026-10-01T00:00:00Z', expires_at: '2026-11-01T00:00:00Z', source: 'ADMIN' }
  const html = renderToStaticMarkup(createElement(AdminRecruiterList, { recruiters: [
    { id: 'free-r', email: 'free@example.com', full_name: 'Free Recruiter', is_active: true, effective_plan: freePlan, subscription: null },
    { id: 'paid-r', email: 'paid@example.com', full_name: 'Paid Recruiter', is_active: true, effective_plan: paidPlan, subscription: paidSubscription },
  ], onGrant() {}, onRevoke() {} }))
  assert.match(html, /Gói hiện tại: Miễn phí/)
  assert.match(html, /FREE mặc định/)
  assert.match(html, /Bắt đầu:/)
  assert.match(html, /Hết hạn:/)
  assert.match(html, /Nguồn cấp:/)
  assert.match(html, /Quản trị viên/)
  assert.doesNotMatch(html, /Company/)
})

test('service uses the exact 01A endpoints and opts mutations out of global duplicate refresh', async () => {
  const originalAdapter = api.defaults.adapter
  const originalLocalStorage = globalThis.localStorage
  const calls = []
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: { getItem: () => null, setItem() {}, removeItem() {} } })
  api.defaults.adapter = async (config) => {
    calls.push(config)
    return { data: {}, status: 200, statusText: 'OK', headers: {}, config }
  }
  try {
    await service.getSubscriptionPlans({ page: 1, page_size: 100 })
    await service.createSubscriptionPlan({})
    await service.updateSubscriptionPlan('plan-a', {})
    await service.getAdminRecruiters({ page: 2, page_size: 12 })
    await service.grantOrChangeRecruiterSubscription('recruiter-a', { plan_id: 'plan-a', starts_at: null, expires_at: null })
    await service.revokeRecruiterSubscription('recruiter-a')
    await service.getMyRecruiterSubscription()
    await service.getRecruiterPlanCatalog()
  } finally {
    api.defaults.adapter = originalAdapter
    if (originalLocalStorage === undefined) delete globalThis.localStorage
    else Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: originalLocalStorage })
  }

  assert.deepEqual(calls.map((call) => [call.method, call.url]), [
    ['get', '/api/v1/admin/subscription-plans'],
    ['post', '/api/v1/admin/subscription-plans'],
    ['patch', '/api/v1/admin/subscription-plans/plan-a'],
    ['get', '/api/v1/admin/recruiters'],
    ['post', '/api/v1/admin/recruiters/recruiter-a/subscription'],
    ['post', '/api/v1/admin/recruiters/recruiter-a/subscription/revoke'],
    ['get', '/api/v1/recruiter/subscription'],
    ['get', '/api/v1/recruiter/subscription-plans'],
  ])
  for (const call of calls.filter((entry) => entry.method !== 'get')) assert.equal(call.gjobSkipDataRefresh, true)
})

test('admin workspace and recruiter plan section render safe initial states on the server', () => {
  const adminHtml = renderToStaticMarkup(createElement(MemoryRouter, null, createElement(AdminPage)))
  assert.match(adminHtml, /Gói dịch vụ nhà tuyển dụng/)
  assert.match(adminHtml, /Danh mục gói/)
  assert.match(adminHtml, /Nhà tuyển dụng/)
  const recruiterHtml = renderToStaticMarkup(createElement(RecruiterSection))
  assert.match(recruiterHtml, /Đang tải gói dịch vụ/)
})

test('admin navigation exposes one exact monetization route and metadata', () => {
  const matches = adminNavigation.adminNavigationGroups.flatMap((group) => group.items).filter((item) => item.to === '/admin/subscription-plans')
  assert.equal(matches.length, 1)
  assert.equal(matches[0].isActive('/admin/subscription-plans'), true)
  assert.deepEqual(adminNavigation.getAdminPageMeta('/admin/subscription-plans'), { title: 'Quản lý gói dịch vụ', context: 'Thương mại' })
})
