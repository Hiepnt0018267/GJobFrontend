import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const page = await readFile(
  new URL('../src/pages/admin/AdminJobTaxonomyPage.tsx', import.meta.url),
  'utf8',
)

test('taxonomy position metadata uses one balanced control height', () => {
  assert.match(page, /h-8 max-w-\[190px\]/)
  assert.match(page, /inline-flex h-8 items-center justify-center gap-2/)
  assert.match(page, /inline-flex h-8 min-w-\[4\.75rem\]/)
  assert.match(page, /inline-flex h-8 min-w-\[5\.75rem\]/)
  assert.match(page, /inline-flex h-8 min-w-\[4\.5rem\]/)
})

test('taxonomy position metadata columns share centered vertical alignment', () => {
  assert.match(page, /text-center align-middle text-slate-600/)
  assert.match(page, /text-center align-middle font-semibold tabular-nums/)
  assert.match(page, /text-center align-middle/)
})
