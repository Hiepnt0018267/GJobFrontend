import assert from 'node:assert/strict'
import { after, before, test } from 'node:test'
import { readFileSync } from 'node:fs'
import { createServer } from 'vite'

let server, payment, service, api, navigation

before(async () => {
  server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom', logLevel: 'error' })
  payment = await server.ssrLoadModule('/src/utils/adminPayment.ts')
  service = (await server.ssrLoadModule('/src/services/adminPaymentService.ts')).adminPaymentService
  api = (await server.ssrLoadModule('/src/services/api.ts')).default
  navigation = await server.ssrLoadModule('/src/config/adminNavigation.ts')
})

after(async () => { await server?.close() })

test('payment labels, tones and currency formatting are deterministic', () => {
  assert.equal(payment.paymentDispositionLabel.APPLIED, 'Đã ghi nhận')
  assert.equal(payment.paymentOrderStatusLabel.EXPIRED, 'Hết hạn')
  assert.match(payment.paymentTone('APPLIED'), /emerald/)
  assert.match(payment.paymentTone('AMOUNT_MISMATCH'), /red/)
  assert.equal(payment.formatVnd('99000'), '99.000 ₫')
})

test('date filters use an exclusive upper bound for the full selected day', () => {
  const bounds = payment.paymentDateBounds('2026-10-01', '2026-10-17')
  assert.equal(bounds.date_from, new Date('2026-10-01T00:00:00').toISOString())
  assert.equal(bounds.date_to, new Date('2026-10-18T00:00:00').toISOString())
})

test('admin payment service is read-only and calls exact endpoints', async () => {
  const originalAdapter = api.defaults.adapter
  const originalLocalStorage = globalThis.localStorage
  const calls = []
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: { getItem: () => null, setItem() {}, removeItem() {} } })
  api.defaults.adapter = async (config) => {
    calls.push(config)
    return { data: config.url.endsWith('/summary') ? {} : { items: [], total: 0 }, status: 200, statusText: 'OK', headers: {}, config }
  }
  try {
    await service.getSummary({ plan_code: 'PRO_MONTHLY' })
    await service.getTransactions({ search: 'abc', page: 2 })
    await service.getTransaction('transaction-1')
    await service.getOrders({ order_status: 'PAID' })
    await service.getOrder('order-1')
  } finally {
    api.defaults.adapter = originalAdapter
    if (originalLocalStorage === undefined) delete globalThis.localStorage
    else Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: originalLocalStorage })
  }
  assert.deepEqual(calls.map((call) => [call.method, call.url]), [
    ['get', '/api/v1/admin/payments/summary'],
    ['get', '/api/v1/admin/payment-transactions'],
    ['get', '/api/v1/admin/payment-transactions/transaction-1'],
    ['get', '/api/v1/admin/payment-orders'],
    ['get', '/api/v1/admin/payment-orders/order-1'],
  ])
  assert.equal(calls.every((call) => call.method === 'get'), true)
})

test('admin navigation exposes transaction history with exact page metadata', () => {
  const commerce = navigation.adminNavigationGroups.find((group) => group.label === 'Thương mại')
  assert.ok(commerce.items.some((item) => item.to === '/admin/payments'))
  assert.deepEqual(navigation.getAdminPageMeta('/admin/payments'), {
    title: 'Lịch sử giao dịch', context: 'Thương mại',
  })
})

test('history page has both audit views, details and no manual payment mutation', () => {
  const source = readFileSync(new URL('../src/pages/admin/AdminPaymentsPage.tsx', import.meta.url), 'utf8')
  for (const text of ['Giao dịch ngân hàng', 'Đơn thanh toán', 'Cần đối soát', 'Chi tiết thanh toán']) {
    assert.match(source, new RegExp(text))
  }
  assert.doesNotMatch(source, /api\.post|api\.patch|markPaid|đánh dấu.{0,10}thanh toán/i)
})
