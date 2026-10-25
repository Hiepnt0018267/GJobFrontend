import assert from 'node:assert/strict'
import { after, before, test } from 'node:test'
import { readFileSync } from 'node:fs'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { createServer } from 'vite'

let server, notification, notificationSound, Item, Bell, Page, service, api, recruiterNavigation, adminNavigation, AuthContext, NotificationContext, ToastContext, DataRefreshContext

before(async () => {
  server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom', logLevel: 'error' })
  notification = await server.ssrLoadModule('/src/utils/notification.ts')
  notificationSound = await server.ssrLoadModule('/src/utils/notificationSound.ts')
  Item = (await server.ssrLoadModule('/src/components/notification/NotificationItem.tsx')).default
  Bell = (await server.ssrLoadModule('/src/components/notification/NotificationBell.tsx')).default
  Page = (await server.ssrLoadModule('/src/pages/notifications/NotificationCenterPage.tsx')).default
  service = (await server.ssrLoadModule('/src/services/notificationService.ts')).notificationService
  api = (await server.ssrLoadModule('/src/services/api.ts')).default
  recruiterNavigation = await server.ssrLoadModule('/src/config/recruiterNavigation.ts')
  adminNavigation = await server.ssrLoadModule('/src/config/adminNavigation.ts')
  AuthContext = (await server.ssrLoadModule('/src/contexts/AuthContext.tsx')).AuthContext
  NotificationContext = (await server.ssrLoadModule('/src/contexts/notificationState.ts')).NotificationContext
  ToastContext = (await server.ssrLoadModule('/src/contexts/toastContextValue.ts')).ToastContext
  DataRefreshContext = (await server.ssrLoadModule('/src/contexts/dataRefreshState.ts')).DataRefreshContext
})

after(async () => { await server?.close() })

const user = { id: 'user-a', email: 'candidate@example.com', full_name: 'Ứng viên A', role: 'CANDIDATE', is_active: true, created_at: '2026-10-01T00:00:00Z' }
const noopAsync = async () => {}
const authValue = { user, token: 'token', isAuthenticated: true, loading: false, login: noopAsync, register: async () => ({ message: '', user }), logout() {}, updateUser: noopAsync, updateAuthenticatedUser() {} }
const toastValue = { showToast() {}, success() {}, error() {}, info() {} }

function item(overrides = {}) {
  return {
    id: '11111111-1111-4111-8111-111111111111',
    type: 'SYSTEM',
    title: 'Thông báo hệ thống',
    message: 'Nội dung an toàn',
    read_at: null,
    is_read: false,
    target_type: null,
    target_id: null,
    created_at: '2026-10-12T01:00:00Z',
    ...overrides,
  }
}

function notificationValue(overrides = {}) {
  return {
    identityId: user.id,
    identityGeneration: 1,
    unreadCount: 1,
    countLoading: false,
    countError: false,
    previewItems: [],
    previewLoading: false,
    previewError: false,
    pendingIds: new Set(),
    markAllPending: false,
    refreshCount: async () => {},
    refreshPreview: async () => {},
    markOne: async (entry) => ({ ...entry, is_read: true }),
    markAll: async () => 0,
    ...overrides,
  }
}

function renderWithContexts(node, notifications = notificationValue()) {
  return renderToStaticMarkup(
    createElement(MemoryRouter, null,
      createElement(DataRefreshContext.Provider, { value: 0 },
        createElement(AuthContext.Provider, { value: authValue },
          createElement(ToastContext.Provider, { value: toastValue },
            createElement(NotificationContext.Provider, { value: notifications }, node))))),
  )
}

test('badge formatting hides zero, preserves 1 and 99, and caps 100 visually', () => {
  assert.equal(notification.notificationBadgeText(0), null)
  assert.equal(notification.notificationBadgeText(1), '1')
  assert.equal(notification.notificationBadgeText(99), '99')
  assert.equal(notification.notificationBadgeText(100), '99+')
  assert.equal(notification.notificationBellLabel(0), 'Mở thông báo')
  assert.equal(notification.notificationBellLabel(5), 'Mở thông báo, 5 thông báo chưa đọc')
})

test('notification sound only announces a new unread increase after the initial baseline', () => {
  assert.equal(notificationSound.shouldPlayNotificationSound(null, 1), false)
  assert.equal(notificationSound.shouldPlayNotificationSound(0, 0), false)
  assert.equal(notificationSound.shouldPlayNotificationSound(2, 1), false)
  assert.equal(notificationSound.shouldPlayNotificationSound(2, 2), false)
  assert.equal(notificationSound.shouldPlayNotificationSound(0, 1), true)
  assert.equal(notificationSound.shouldPlayNotificationSound(2, 5), true)
})

test('SYSTEM, all five domain types, and unknown future type map safely', () => {
  const expected = {
    SYSTEM: 'neutral',
    APPLICATION_SUBMITTED: 'application',
    APPLICATION_STATUS_CHANGED: 'status',
    APPLICATION_WITHDRAWN: 'withdrawn',
    JOB_APPROVED: 'approved',
    JOB_REJECTED: 'rejected',
  }
  for (const [type, category] of Object.entries(expected)) assert.equal(notification.notificationVisualCategory(type), category)
  assert.equal(notification.notificationVisualCategory('FUTURE_BACKEND_EVENT'), 'neutral')
})

test('strict target allowlist returns exact role routes and no fabricated path', () => {
  const id = '12345678-1234-4123-8123-123456789abc'
  const path = (role, targetType) => notification.getNotificationTargetPath({ role, targetType, targetId: id })
  assert.equal(path('CANDIDATE', 'APPLICATION'), `/candidate/applications/${id}`)
  assert.equal(path('RECRUITER', 'APPLICATION'), `/recruiter/applications/${id}`)
  assert.equal(path('ADMIN', 'APPLICATION'), `/admin/applications/${id}`)
  assert.equal(path('CANDIDATE', 'JOB'), `/jobs/${id}`)
  assert.equal(path('RECRUITER', 'JOB'), `/recruiter/jobs/${id}`)
  assert.equal(path('ADMIN', 'JOB'), `/admin/jobs/${id}`)
  assert.equal(path('CANDIDATE', 'CV'), `/candidate/cvs/${id}`)
  assert.equal(path('ADMIN', 'CV'), `/admin/cvs/${id}`)
  assert.equal(path('RECRUITER', 'CV'), null)
  assert.equal(path('ADMIN', 'USER'), `/admin/users/${id}`)
  assert.equal(path('CANDIDATE', 'USER'), null)
  assert.equal(path('ADMIN', 'UNKNOWN'), null)
  assert.equal(notification.getNotificationTargetPath({ role: 'ADMIN', targetType: 'JOB', targetId: '../unsafe' }), null)
  assert.equal(notification.getNotificationTargetPath({ role: 'ADMIN', notificationType: 'CANDIDATE_REGISTERED', targetType: null, targetId: null }), '/admin/users')
  assert.equal(notification.getNotificationTargetPath({ role: 'ADMIN', notificationType: 'RECRUITER_REGISTERED', targetType: null, targetId: null }), '/admin/users')
  assert.equal(notification.getNotificationTargetPath({ role: 'CANDIDATE', notificationType: 'CANDIDATE_REGISTERED', targetType: null, targetId: null }), null)
})

test('server list params and request key contain page, view, page size, user and generation', () => {
  assert.deepEqual(notification.createNotificationListParams({ page: 3, pageSize: 20, unreadOnly: true }), { page: 3, page_size: 20, unread_only: true })
  assert.equal(notification.notificationRequestKey({ userId: 'user-a', generation: 7, page: 3, pageSize: 20, filter: 'read' }), 'user-a:7:read:3:20')
  assert.notEqual(
    notification.notificationRequestKey({ userId: 'user-a', generation: 7, page: 1, pageSize: 20, filter: 'unread' }),
    notification.notificationRequestKey({ userId: 'user-a', generation: 7, page: 1, pageSize: 20, filter: 'read' }),
  )
})

test('role notification center paths and recruiter/admin page metadata are exact', () => {
  assert.equal(notification.notificationCenterPath('CANDIDATE'), '/candidate/notifications')
  assert.equal(notification.notificationCenterPath('RECRUITER'), '/recruiter/notifications')
  assert.equal(notification.notificationCenterPath('ADMIN'), '/admin/notifications')
  assert.deepEqual(recruiterNavigation.getRecruiterPageMeta('/recruiter/notifications'), { title: 'Thông báo', context: 'Khu vực nhà tuyển dụng' })
  assert.deepEqual(adminNavigation.getAdminPageMeta('/admin/notifications'), { title: 'Thông báo', context: 'Quản trị GJob' })
})

test('filter change resets page while page change preserves filter', () => {
  const current = new URLSearchParams('filter=read&page=4')
  const unread = notification.updateNotificationSearch(current, { filter: 'unread' })
  assert.equal(unread.has('filter'), false); assert.equal(unread.has('page'), false)
  const pageTwo = notification.updateNotificationSearch(current, { page: 2 })
  assert.equal(pageTwo.get('filter'), 'read'); assert.equal(pageTwo.get('page'), '2')
  assert.deepEqual(notification.notificationPageFromSearch(new URLSearchParams('filter=read&page=3')), { page: 3, filter: 'read' })
  assert.deepEqual(notification.notificationPageFromSearch(new URLSearchParams('filter=unread&page=invalid')), { page: 1, filter: 'unread' })
})

test('read view keeps only read notifications, removes duplicates and paginates locally', () => {
  const rows = [
    item({ id: 'read-1', is_read: true, read_at: '2026-10-12T02:00:00Z' }),
    item({ id: 'unread-1', is_read: false }),
    item({ id: 'read-2', is_read: true, read_at: '2026-10-12T03:00:00Z' }),
    item({ id: 'read-1', is_read: true, read_at: '2026-10-12T02:00:00Z' }),
    item({ id: 'read-3', is_read: true, read_at: '2026-10-12T04:00:00Z' }),
  ]
  const first = notification.createReadNotificationPage(rows, 1, 2)
  const second = notification.createReadNotificationPage(rows, 2, 2)
  assert.deepEqual(first.items.map((entry) => entry.id), ['read-1', 'read-2'])
  assert.deepEqual(second.items.map((entry) => entry.id), ['read-3'])
  assert.equal(first.total, 3); assert.equal(first.total_pages, 2); assert.equal(first.page_size, 2)
})

test('identity reset clears private data and late User A responses are rejected', () => {
  let state = notification.createNotificationClientState('user-a', 4)
  state = { ...state, unreadCount: 3, previewItems: [item()], countError: true, previewError: true, pendingIds: ['n1'], markAllPending: true }
  state = notification.notificationStateReducer(state, { type: 'identity/reset', identityId: 'user-b', generation: 5 })
  assert.deepEqual(state, notification.createNotificationClientState('user-b', 5))
  const afterLateA = notification.notificationStateReducer(state, { type: 'preview/success', identityId: 'user-a', generation: 4, items: [item({ title: 'Dữ liệu riêng A' })] })
  assert.deepEqual(afterLateA, state)
  const afterOldGeneration = notification.notificationStateReducer(state, { type: 'count/success', identityId: 'user-b', generation: 4, unreadCount: 99 })
  assert.deepEqual(afterOldGeneration, state)
})

test('mark-one and mark-all remove read items from the unread preview', () => {
  const first = item({ id: 'n1' })
  const second = item({ id: 'n2' })
  let state = { ...notification.createNotificationClientState('user-a', 1), unreadCount: 2, previewItems: [first, second] }
  state = notification.notificationStateReducer(state, { type: 'mark-one/success', identityId: 'user-a', generation: 1, item: { ...first, is_read: true }, wasUnread: true })
  assert.equal(state.unreadCount, 1); assert.deepEqual(state.previewItems.map((entry) => entry.id), ['n2'])
  state = notification.notificationStateReducer(state, { type: 'mark-all/success', identityId: 'user-a', generation: 1 })
  assert.equal(state.unreadCount, 0); assert.deepEqual(state.previewItems, [])
})

test('pending reducer deduplicates mark-one and failed completion preserves unread state', () => {
  let state = { ...notification.createNotificationClientState('user-a', 1), unreadCount: 1, previewItems: [item({ id: 'n1' })] }
  state = notification.notificationStateReducer(state, { type: 'mark-one/start', identityId: 'user-a', generation: 1, id: 'n1' })
  state = notification.notificationStateReducer(state, { type: 'mark-one/start', identityId: 'user-a', generation: 1, id: 'n1' })
  assert.deepEqual(state.pendingIds, ['n1']); assert.equal(state.unreadCount, 1); assert.equal(state.previewItems[0].is_read, false)
  state = notification.notificationStateReducer(state, { type: 'mark-one/finish', identityId: 'user-a', generation: 1, id: 'n1' })
  assert.deepEqual(state.pendingIds, []); assert.equal(state.unreadCount, 1); assert.equal(state.previewItems[0].is_read, false)
})

test('notification API uses exact endpoints/params and suppresses generic PATCH refresh', async () => {
  const originalAdapter = api.defaults.adapter
  const originalLocalStorage = globalThis.localStorage
  const calls = []
  globalThis.localStorage = { getItem: () => null, setItem() {}, removeItem() {}, clear() {}, key: () => null, length: 0 }
  api.defaults.adapter = async (config) => {
    calls.push(config)
    const data = config.url?.endsWith('/unread-count')
      ? { unread_count: 0 }
      : config.url?.endsWith('/read-all')
        ? { updated_count: 1 }
        : config.method === 'patch'
          ? item({ is_read: true })
          : { items: [], total: 0, page: 2, page_size: 20, total_pages: 0 }
    return { data, status: 200, statusText: 'OK', headers: {}, config }
  }
  try {
    await service.getNotifications({ page: 2, page_size: 20, unread_only: true })
    await service.getUnreadCount()
    await service.markNotificationRead(item().id)
    await service.markAllNotificationsRead()
    assert.equal(calls[0].url, '/api/v1/notifications'); assert.deepEqual(calls[0].params, { page: 2, page_size: 20, unread_only: true })
    assert.equal(calls[1].url, '/api/v1/notifications/unread-count')
    assert.equal(calls[2].url, `/api/v1/notifications/${item().id}/read`); assert.equal(calls[2].gjobSkipDataRefresh, true)
    assert.equal(calls[3].url, '/api/v1/notifications/read-all'); assert.equal(calls[3].gjobSkipDataRefresh, true)
  } finally {
    api.defaults.adapter = originalAdapter
    if (originalLocalStorage === undefined) delete globalThis.localStorage
    else globalThis.localStorage = originalLocalStorage
  }
})

test('SSR keeps backend copy as escaped plain text and exposes unread semantics', () => {
  const malicious = item({ type: 'FUTURE_BACKEND_EVENT', title: '<script>alert(1)</script>', message: '<img src=x onerror=alert(1)>' })
  const html = renderToStaticMarkup(createElement(Item, { item: malicious }))
  assert.ok(html.includes('&lt;script&gt;alert(1)&lt;/script&gt;'))
  assert.ok(html.includes('&lt;img src=x onerror=alert(1)&gt;'))
  assert.equal(html.includes('<script>'), false); assert.equal(html.includes('<img src=x'), false)
  assert.ok(html.includes('aria-label="Chưa đọc"')); assert.ok(html.includes('data-notification-category="neutral"'))
})

test('SSR bell has accessible state, empty panel, mark-all and full-page action', () => {
  const html = renderWithContexts(createElement(Bell, { open: true, onOpenChange() {} }), notificationValue({ unreadCount: 100 }))
  assert.ok(html.includes('aria-label="Mở thông báo, 100 thông báo chưa đọc"'))
  assert.ok(html.includes('aria-expanded="true"')); assert.ok(html.includes('99+'))
  assert.ok(html.includes('Không còn thông báo chưa đọc')); assert.ok(html.includes('Đánh dấu tất cả đã đọc')); assert.ok(html.includes('Xem tất cả thông báo'))
  assert.ok(html.includes('/candidate/notifications'))
})

test('shared notification bell opens on hover and closes with a short grace period', () => {
  const source = readFileSync(new URL('../src/components/notification/NotificationBell.tsx', import.meta.url), 'utf8')
  assert.match(source, /onMouseEnter=\{openFromHover\}/)
  assert.match(source, /onMouseLeave=\{scheduleHoverClose\}/)
  assert.match(source, /window\.setTimeout\(\(\) => \{/)
  assert.match(source, /\}, 180\)/)
})

test('SSR popover renders SYSTEM item and notification page exposes loading/filter controls', () => {
  const system = item()
  const bellHtml = renderWithContexts(createElement(Bell, { open: true, onOpenChange() {} }), notificationValue({ previewItems: [system] }))
  assert.ok(bellHtml.includes('Thông báo hệ thống')); assert.ok(bellHtml.includes('data-notification-category="neutral"'))
  const pageHtml = renderWithContexts(createElement(Page))
  assert.ok(pageHtml.includes('Trung tâm cập nhật')); assert.ok(pageHtml.includes('Chưa đọc')); assert.ok(pageHtml.includes('Đã đọc'))
  assert.ok(pageHtml.includes('Đánh dấu tất cả đã đọc')); assert.ok(pageHtml.includes('Đang tải danh sách thông báo'))
})
