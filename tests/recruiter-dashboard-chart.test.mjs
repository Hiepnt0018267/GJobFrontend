import assert from 'node:assert/strict'
import { after, before, test } from 'node:test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createServer } from 'vite'

let server
let RecruiterJobStatusChart

before(async () => {
  server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom', logLevel: 'error' })
  const module = await server.ssrLoadModule('/src/components/recruiter/RecruiterJobStatusChart.tsx')
  RecruiterJobStatusChart = module.default
})

after(async () => { await server?.close() })

const render = (summary) => renderToStaticMarkup(createElement(RecruiterJobStatusChart, { summary }))

test('recruiter donut shares interactive dashboard behavior and exact status routes', () => {
  const markup = render({
    total_jobs: 10,
    pending_jobs: 1,
    approved_jobs: 7,
    rejected_jobs: 1,
    closed_jobs: 1,
  })

  assert.match(markup, /Phân bổ trạng thái tin tuyển dụng của nhà tuyển dụng/)
  assert.match(markup, /data-target="\/recruiter\/jobs\?status=APPROVED"/)
  assert.match(markup, /data-target="\/recruiter\/jobs\?status=PENDING"/)
  assert.match(markup, /data-target="\/recruiter\/jobs\?status=CLOSED"/)
  assert.match(markup, /data-target="\/recruiter\/jobs\?status=REJECTED"/)
  assert.match(markup, /Di chuột để xem tỷ lệ, nhấn để mở danh sách tương ứng/)
  assert.match(markup, /70\.0%/)
})

test('recruiter donut zero state remains finite and keeps navigation available', () => {
  const markup = render({
    total_jobs: 0,
    pending_jobs: 0,
    approved_jobs: 0,
    rejected_jobs: 0,
    closed_jobs: 0,
  })

  assert.doesNotMatch(markup, /NaN|Infinity/)
  assert.match(markup, />0<\/strong>/)
  assert.match(markup, /data-target="\/recruiter\/jobs\?status=PENDING"/)
})
