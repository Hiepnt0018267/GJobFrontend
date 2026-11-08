import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const detailPage = await readFile(
  new URL('../src/pages/admin/AdminJobDetailPage.tsx', import.meta.url),
  'utf8',
)

test('admin job detail falls back to the all-jobs directory', () => {
  assert.match(detailPage, /return '\/admin\/jobs\?status=ALL'/)
  assert.doesNotMatch(detailPage, /return '\/admin\/jobs\?status=PENDING'/)
})
