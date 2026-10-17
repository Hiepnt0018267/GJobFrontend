import assert from 'node:assert/strict'
import { after, before, test } from 'node:test'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { createServer } from 'vite'

let server, Panel, service, api

before(async () => {
  server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom', logLevel: 'error' })
  Panel = (await server.ssrLoadModule('/src/components/admin/users/AdminUserRoleOverview.tsx')).default
  service = (await server.ssrLoadModule('/src/services/adminUserService.ts')).adminUserService
  api = (await server.ssrLoadModule('/src/services/api.ts')).default
})

after(async () => { await server?.close() })

const baseUser = {
  id: 'user-1', email: 'user@example.com', full_name: 'Test User', role: 'CANDIDATE',
  is_active: true, avatar_url: null, phone: null, address: null, bio: null,
  created_at: '2026-10-17T00:00:00Z', updated_at: '2026-10-17T00:00:00Z',
}

const render = (user, overview) => renderToStaticMarkup(
  React.createElement(MemoryRouter, null, React.createElement(Panel, { user, overview })),
)

test('candidate overview shows CV and application activity with exact scoped links', () => {
  const html = render(baseUser, {
    user_id: baseUser.id, role: 'CANDIDATE', recruiter: null, administrator: null,
    candidate: {
      cv_total: 2, analyzed_cv_total: 1, uploaded_cv_total: 1,
      application_total: 3, hired_total: 1, saved_job_total: 4,
      recent_cvs: [{ id: 'cv-1', title: 'Backend CV', source_type: 'UPLOADED', is_default: true, updated_at: baseUser.updated_at }],
      recent_applications: [{ id: 'app-1', job_id: 'job-1', job_title: 'Backend Engineer', company_name: 'GJob', status: 'HIRED', updated_at: baseUser.updated_at }],
    },
  })
  for (const value of ['Hoạt động ứng viên', 'Tổng số CV', 'CV đã phân tích', 'Đơn ứng tuyển', 'Việc đã lưu', 'Backend CV', 'Backend Engineer']) assert.match(html, new RegExp(value))
  assert.match(html, /\/admin\/cvs\?candidate_id=user-1/)
  assert.match(html, /\/admin\/applications\?candidate_id=user-1/)
})

test('recruiter overview shows company, plan, jobs and payment history', () => {
  const user = { ...baseUser, role: 'RECRUITER' }
  const html = render(user, {
    user_id: user.id, role: 'RECRUITER', candidate: null, administrator: null,
    recruiter: {
      company_profile: { company_name: 'GJob Company', company_website: null, company_description: 'Hiring team', company_address: 'Hà Nội', company_logo_url: null, industry: 'IT', company_size: 20 },
      current_plan: { code: 'PRO_MONTHLY', name: 'PRO', source: 'PAYMENT', expires_at: null },
      job_total: 2, pending_job_total: 0, approved_job_total: 2, closed_job_total: 0,
      received_application_total: 5, paid_order_total: 1, successful_payment_total: 1, revenue: '99000',
      recent_jobs: [{ id: 'job-1', title: 'Senior Engineer', status: 'APPROVED', application_total: 5, updated_at: baseUser.updated_at }],
      recent_payment_orders: [{ id: 'order-1', payment_code: 'GJOB123', plan_name: 'PRO', amount: '99000', currency: 'VND', status: 'PAID', created_at: baseUser.created_at }],
    },
  })
  for (const value of ['Hoạt động tuyển dụng và dịch vụ', 'GJob Company', 'Gói hiện tại', 'Senior Engineer', 'Lịch sử mua gói', '99.000 ₫']) assert.match(html, new RegExp(value))
  assert.match(html, /recruiter_id=user-1/)
})

test('administrator overview exposes audit activity without candidate or payment panels', () => {
  const user = { ...baseUser, role: 'ADMIN' }
  const html = render(user, {
    user_id: user.id, role: 'ADMIN', candidate: null, recruiter: null,
    administrator: { audit_action_total: 1, recent_actions: [{ id: 'audit-1', action: 'JOB_APPROVED', entity_type: 'JOB', entity_id: 'job-1', created_at: baseUser.created_at }] },
  })
  assert.match(html, /Hoạt động quản trị/)
  assert.match(html, /JOB APPROVED/)
  assert.doesNotMatch(html, /Lịch sử mua gói|Tổng số CV/)
})

test('admin user service requests the dedicated read-only overview endpoint', async () => {
  const originalAdapter = api.defaults.adapter
  const originalLocalStorage = globalThis.localStorage
  const calls = []
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: { getItem: () => null, setItem() {}, removeItem() {} } })
  api.defaults.adapter = async (config) => {
    calls.push(config)
    return { data: { user_id: 'user-1', role: 'CANDIDATE' }, status: 200, statusText: 'OK', headers: {}, config }
  }
  try { await service.getAdminUserOverview('user-1') }
  finally {
    api.defaults.adapter = originalAdapter
    if (originalLocalStorage === undefined) delete globalThis.localStorage
    else Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: originalLocalStorage })
  }
  assert.deepEqual(calls.map((call) => [call.method, call.url]), [['get', '/api/v1/admin/users/user-1/overview']])
})
