import assert from 'node:assert/strict'
import { after, before, test } from 'node:test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createServer } from 'vite'

let server
let charts

before(async () => {
  server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom', logLevel: 'error' })
  charts = await server.ssrLoadModule('/src/components/admin/AdminDashboardCharts.tsx')
})

after(async () => { await server?.close() })

const render = (Component, data) => renderToStaticMarkup(createElement(Component, { data }))

test('user and job summaries render accessible interactive donut charts from existing totals', () => {
  const users = render(charts.AdminUserChart, {
    total: 27, candidates: 21, recruiters: 4, admins: 2, active: 27, inactive: 0,
  })
  const jobs = render(charts.AdminJobChart, {
    total: 9, pending: 0, approved: 8, rejected: 0, closed: 1,
  })

  assert.match(users, /Phân bổ người dùng theo vai trò/)
  assert.match(users, /Ứng viên/)
  assert.match(users, /77\.8%/)
  assert.match(users, /27 · 100\.0% đang hoạt động/)
  assert.match(users, /Bộ lọc phân bổ người dùng theo vai trò/)
  assert.match(users, /data-target="\/admin\/users\?role=CANDIDATE"/)
  assert.match(users, /data-target="\/admin\/users\?is_active=true"/)
  assert.match(users, /Di chuột để xem tỷ lệ, nhấn để mở danh sách tương ứng/)
  assert.match(jobs, /Phân bổ trạng thái tin tuyển dụng/)
  assert.match(jobs, /Đã duyệt/)
  assert.match(jobs, /88\.9%/)
  assert.match(jobs, /data-target="\/admin\/jobs\?status=APPROVED"/)
})

test('application summary uses comparative bars without inventing non-zero widths', () => {
  const markup = render(charts.AdminApplicationChart, {
    total: 12, submitted: 7, reviewing: 3, shortlisted: 0, rejected: 0, hired: 2, withdrawn: 0,
  })

  assert.match(markup, /Biểu đồ thanh trạng thái đơn ứng tuyển/)
  assert.match(markup, /Mở 7 đơn đã gửi, chiếm 58\.3%/)
  assert.match(markup, /width:100%/)
  assert.match(markup, /Mở 0 đơn danh sách ngắn, chiếm 0\.0%/)
  assert.match(markup, /width:0%/)
  assert.match(markup, /Nhấn một trạng thái để mở danh sách đơn tương ứng/)
  assert.match(markup, /role="group" aria-label="Biểu đồ thanh trạng thái đơn ứng tuyển"/)
  assert.match(markup, /data-target="\/admin\/applications\?status=HIRED"/)
})

test('template progress and every zero-total state stay finite', () => {
  const templates = render(charts.AdminTemplateChart, { total: 87, active: 87, inactive: 0 })
  const zeroUsers = render(charts.AdminUserChart, {
    total: 0, candidates: 0, recruiters: 0, admins: 0, active: 0, inactive: 0,
  })

  assert.match(templates, /100\.0% mẫu CV đang hoạt động/)
  assert.match(templates, /width:100%/)
  assert.match(templates, /aria-label="Chọn trạng thái mẫu CV"/)
  assert.match(templates, /data-target="\/admin\/cv-templates\?is_active=true"/)
  assert.doesNotMatch(`${templates}${zeroUsers}`, /NaN|Infinity/)
})
