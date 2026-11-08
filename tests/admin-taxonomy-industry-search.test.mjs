import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const page = await readFile(
  new URL('../src/pages/admin/AdminJobTaxonomyPage.tsx', import.meta.url),
  'utf8',
)

test('industry search stays compact beside status and expands while in use', () => {
  assert.match(page, /const isIndustrySearchOpen = industrySearchExpanded \|\| Boolean\(industrySearch\)/)
  assert.match(page, /isIndustrySearchOpen \? 'w-full basis-full' : 'w-\[9\.75rem\] flex-none'/)
  assert.match(page, /onFocus=\{openIndustrySearch\}/)
  assert.match(page, /onBlur=\{closeIndustrySearch\}/)
  assert.match(page, /setIndustrySearchExpanded\(false\)/)
})
