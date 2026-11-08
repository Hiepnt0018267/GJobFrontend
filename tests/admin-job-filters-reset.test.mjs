import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const page = await readFile(
  new URL('../src/pages/admin/AdminJobsPage.tsx', import.meta.url),
  'utf8',
)

test('admin job reset selects ALL instead of falling back to the default pending queue', () => {
  assert.match(page, /onReset=\{\(\) => setParams\(\{ status: 'ALL' \}\)\}/)
  assert.doesNotMatch(page, /onReset=\{\(\) => setParams\(\{\}\)\}/)
})

test('admin jobs default to all statuses when the URL has no valid status', () => {
  assert.match(page, /rawStatus && rawStatus !== 'ALL' && JOB_STATUSES\.includes/)
  assert.doesNotMatch(page, /: 'PENDING'/)
  assert.match(page, /const activeFilter = selectedStatus \?\? 'ALL'/)
})

test('dashboard can still open the dedicated pending moderation queue', async () => {
  const dashboard = await readFile(
    new URL('../src/components/admin/AdminDashboardCharts.tsx', import.meta.url),
    'utf8',
  )

  assert.match(dashboard, /\/admin\/jobs\?status=PENDING/)
})
