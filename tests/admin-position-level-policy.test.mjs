import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const page = await readFile(
  new URL('../src/pages/admin/AdminJobTaxonomyPage.tsx', import.meta.url),
  'utf8',
)

test('admin position form requires an explicit level policy', () => {
  assert.match(page, /Cho phép tất cả cấp bậc/)
  assert.match(page, /setAllowedLevels\(checked \? ALL_JOB_LEVELS\.map/)
  assert.match(page, /industryCodes\.length === 0 \|\| allowedLevels\.length === 0/)
  assert.match(page, /Chưa cấu hình · đang cho phép tất cả/)
  assert.doesNotMatch(page, /Để trống nếu muốn cho phép tất cả/)
})
