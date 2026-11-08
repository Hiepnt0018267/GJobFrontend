import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const page = await readFile(
  new URL('../src/pages/admin/AdminJobTaxonomyPage.tsx', import.meta.url),
  'utf8',
)

test('admin taxonomy uses the neutral admin palette for controls and selections', () => {
  assert.doesNotMatch(page, /(?:teal|cyan|blue)-/)
  assert.doesNotMatch(page, /#49BBBD/i)
  assert.match(page, /bg-\[#1C1C1C\]/)
  assert.match(page, /focus:border-\[#1C1C1C\]/)
  assert.match(page, /focus:ring-black\/10/)
})
