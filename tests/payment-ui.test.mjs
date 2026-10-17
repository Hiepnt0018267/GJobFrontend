import assert from 'node:assert/strict'
import { after, before, test } from 'node:test'
import { readFileSync } from 'node:fs'
import { createServer } from 'vite'

let server, payment, service, api, recruiterNavigation

before(async () => {
  server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom', logLevel: 'error' })
  payment = await server.ssrLoadModule('/src/utils/payment.ts')
  service = (await server.ssrLoadModule('/src/services/subscriptionService.ts')).subscriptionService
  api = (await server.ssrLoadModule('/src/services/api.ts')).default
  recruiterNavigation = await server.ssrLoadModule('/src/config/recruiterNavigation.ts')
})

after(async () => { await server?.close() })

const freePlan = {
  id: 'free', code: 'FREE', name: 'Miễn phí', description: null, price: '0', currency: 'VND',
  billing_period: 'NONE', duration_days: null, is_active: true,
  created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z', features: [],
}
const paidPlan = { ...freePlan, id: 'pro', code: 'PRO_MONTHLY', name: 'PRO tháng', price: '99000', billing_period: 'MONTHLY', duration_days: 30 }

test('only an active non-current paid plan exposes the purchase action', () => {
  assert.equal(payment.isPurchasablePlan(freePlan, 'FREE'), false)
  assert.equal(payment.isPurchasablePlan(paidPlan, 'PRO_MONTHLY'), false)
  assert.equal(payment.isPurchasablePlan(paidPlan, 'FREE'), true)
  assert.equal(payment.isPurchasablePlan({ ...paidPlan, is_active: false }, 'FREE'), false)
  assert.equal(payment.isPurchasablePlan({ ...paidPlan, price: '0' }, 'FREE'), false)
})

test('payment route builder encodes ids and recruiter metadata covers the route', () => {
  assert.equal(payment.paymentOrderPath('order/with space'), '/recruiter/payments/order%2Fwith%20space')
  assert.deepEqual(recruiterNavigation.getRecruiterPageMeta('/recruiter/payments/order-1'), {
    title: 'Thanh toán dịch vụ', context: 'Nhà tuyển dụng',
  })
})

test('polling runs only for a visible pending order and terminal states stop it', () => {
  assert.equal(payment.shouldPollPayment('PENDING', 'visible'), true)
  assert.equal(payment.shouldPollPayment('PENDING', 'hidden'), false)
  for (const status of ['PAID', 'EXPIRED', 'CANCELLED']) {
    assert.equal(payment.isTerminalPaymentStatus(status), true)
    assert.equal(payment.shouldPollPayment(status, 'visible'), false)
  }
  assert.equal(payment.isTerminalPaymentStatus('PENDING'), false)
})

test('copy helper preserves the exact backend-provided string', async () => {
  let copied = ''
  await payment.copyPaymentValue('GJOB000123', async (value) => { copied = value })
  assert.equal(copied, 'GJOB000123')
})

test('payment service sends plan_id only and reads the exact recruiter order endpoint', async () => {
  const originalAdapter = api.defaults.adapter
  const originalLocalStorage = globalThis.localStorage
  const calls = []
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: { getItem: () => null, setItem() {}, removeItem() {} } })
  api.defaults.adapter = async (config) => {
    calls.push(config)
    return { data: { id: 'order-1' }, status: config.method === 'post' ? 201 : 200, statusText: 'OK', headers: {}, config }
  }
  try {
    await service.createPaymentOrder('plan-1')
    await service.getPaymentOrder('order-1')
    await service.cancelPaymentOrder('order-1')
  } finally {
    api.defaults.adapter = originalAdapter
    if (originalLocalStorage === undefined) delete globalThis.localStorage
    else Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: originalLocalStorage })
  }
  assert.deepEqual(calls.map((call) => [call.method, call.url]), [
    ['post', '/api/v1/recruiter/payment-orders'],
    ['get', '/api/v1/recruiter/payment-orders/order-1'],
    ['post', '/api/v1/recruiter/payment-orders/order-1/cancel'],
  ])
  assert.equal(calls[0].data, JSON.stringify({ plan_id: 'plan-1' }))
  assert.equal(calls[0].gjobSkipDataRefresh, true)
  assert.equal(calls[2].gjobSkipDataRefresh, true)
})

test('payment page keeps backend authority and implements bounded visibility-aware polling', () => {
  const source = readFileSync(new URL('../src/pages/recruiter/RecruiterPaymentPage.tsx', import.meta.url), 'utf8')
  assert.match(source, /const POLL_INTERVAL_MS = 5_000/)
  assert.match(source, /document\.visibilityState/)
  assert.match(source, /visibilitychange/)
  assert.match(source, /window\.clearInterval/)
  assert.match(source, /order\?\.status !== 'PAID'/)
  assert.match(source, /refetchSubscription\(\)/)
  assert.match(source, /notifyDataRefresh\(\)/)
  assert.doesNotMatch(source, /setPlan|setSubscription|PRO_MONTHLY\s*['"]/)
})

test('payment page includes required bank, QR, copy, warning and terminal-state content without unsafe HTML', () => {
  const source = readFileSync(new URL('../src/pages/recruiter/RecruiterPaymentPage.tsx', import.meta.url), 'utf8')
  for (const text of ['Số tiền cần chuyển', 'Ngân hàng', 'Chủ tài khoản', 'Số tài khoản', 'Nội dung chuyển khoản', 'Quét QR', 'Vui lòng giữ nguyên nội dung chuyển khoản', 'Thanh toán thành công', 'Phiên thanh toán đã hết hạn', 'Đơn thanh toán đã được hủy']) {
    assert.match(source, new RegExp(text))
  }
  assert.match(source, /order\.amount/)
  assert.match(source, /order\.qr\.image_url/)
  assert.match(source, /order\.transfer_content/)
  assert.match(source, /Hủy giao dịch/)
  assert.match(source, /Chỉ hủy nếu bạn chưa chuyển khoản/)
  assert.match(source, /cancelPaymentOrder\(order\.id\)/)
  assert.doesNotMatch(source, /dangerouslySetInnerHTML/)
})
