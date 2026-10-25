import assert from 'node:assert/strict'
import { after, before, test } from 'node:test'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { createServer } from 'vite'

let server, Badges, Directory, Filters, StatusActions, service, api

before(async () => {
  server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom', logLevel: 'error' })
  Badges = await server.ssrLoadModule('/src/components/admin/users/AdminUserBadges.tsx')
  Directory = (await server.ssrLoadModule('/src/components/admin/users/AdminUserDirectory.tsx')).default
  Filters = (await server.ssrLoadModule('/src/components/admin/users/AdminUserFilters.tsx')).default
  StatusActions = (await server.ssrLoadModule('/src/components/admin/users/AdminUserStatusActions.tsx')).default
  service = (await server.ssrLoadModule('/src/services/adminUserService.ts')).adminUserService
  api = (await server.ssrLoadModule('/src/services/api.ts')).default
})

after(async () => { await server?.close() })

const pendingUser = {
  id: 'pending-user',
  email: 'pending@example.com',
  full_name: 'Pending User',
  role: 'CANDIDATE',
  account_status: 'PENDING',
  is_active: true,
  email_verified: false,
  email_verified_at: null,
  avatar_url: null,
  phone: null,
  address: null,
  bio: null,
  created_at: '2026-10-20T00:00:00Z',
  updated_at: '2026-10-20T00:00:00Z',
}

test('pending verification uses a distinct amber status badge', () => {
  const html = renderToStaticMarkup(React.createElement(Badges.AdminUserStatusBadge, { status: 'PENDING' }))
  assert.match(html, /Chờ xác minh/)
  assert.match(html, /bg-amber-50/)
})

test('admin directory labels pending registrations and links to their detail', () => {
  const html = renderToStaticMarkup(
    React.createElement(MemoryRouter, null, React.createElement(Directory, { users: [pendingUser], returnTo: '/admin/users?account_status=PENDING' })),
  )
  assert.match(html, /Chờ xác minh/)
  assert.match(html, /Đăng ký/)
  assert.match(html, /\/admin\/users\/pending-user/)
})

test('admin filters expose pending, active and inactive account states', () => {
  const html = renderToStaticMarkup(React.createElement(Filters, {
    role: 'ALL', accountStatus: 'PENDING', search: '',
    onSearchChange() {}, onRoleChange() {}, onAccountStatusChange() {},
  }))
  for (const label of ['Tất cả trạng thái', 'Chờ xác minh', 'Đang hoạt động', 'Đã vô hiệu hóa']) {
    assert.match(html, new RegExp(label))
  }
})

test('pending account detail explains verification and has no moderation action', () => {
  const html = renderToStaticMarkup(React.createElement(StatusActions, {
    user: pendingUser, isCurrentUser: false, onUpdated() {}, onConflict() {},
  }))
  assert.match(html, /Đang chờ xác minh email/)
  assert.doesNotMatch(html, /Kích hoạt tài khoản|Vô hiệu hóa tài khoản/)
})

test('admin user service sends the account status filter', async () => {
  const originalAdapter = api.defaults.adapter
  const originalLocalStorage = globalThis.localStorage
  const calls = []
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: { getItem: () => null, setItem() {}, removeItem() {} } })
  api.defaults.adapter = async (config) => {
    calls.push(config)
    return { data: { items: [], page: 1, page_size: 10, total: 0, total_pages: 0 }, status: 200, statusText: 'OK', headers: {}, config }
  }
  try { await service.getAdminUsers({ account_status: 'PENDING', page: 1, page_size: 10 }) }
  finally {
    api.defaults.adapter = originalAdapter
    if (originalLocalStorage === undefined) delete globalThis.localStorage
    else Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: originalLocalStorage })
  }
  assert.equal(calls[0].params.account_status, 'PENDING')
})
