import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const page = await readFile(
  new URL('../src/pages/admin/AdminJobTaxonomyPage.tsx', import.meta.url),
  'utf8',
)
const styles = await readFile(new URL('../src/index.css', import.meta.url), 'utf8')

test('taxonomy interactions use restrained motion without changing the layout contract', () => {
  assert.match(page, /taxonomy-dialog-backdrop/)
  assert.match(page, /taxonomy-dialog-panel/)
  assert.match(page, /taxonomy-content-enter/)
  assert.match(page, /btn-press/)
  assert.match(page, /group-hover:rotate-90/)
  assert.match(page, /hover:shadow-\[inset_3px_0_0_0_#1C1C1C\]/)
  assert.match(page, /previousIndustryFilterRect/)
  assert.match(page, /translate3d\(\$\{deltaX\}px, \$\{deltaY\}px, 0\)/)
  assert.match(page, /previousSearchBarHeight/)
  assert.match(page, /prefers-reduced-motion: reduce/)
  assert.match(styles, /@keyframes gjob-taxonomy-dialog-panel-enter/)
  assert.match(styles, /@keyframes gjob-taxonomy-content-enter/)
})

test('taxonomy motion respects the global reduced-motion preference', () => {
  assert.match(styles, /@media \(prefers-reduced-motion: reduce\)/)
  assert.match(styles, /animation-duration: 1ms !important/)
  assert.match(styles, /transition-duration: 1ms !important/)
})
