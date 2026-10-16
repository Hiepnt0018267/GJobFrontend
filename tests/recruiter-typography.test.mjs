import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const indexCss = await readFile(new URL('../src/index.css', import.meta.url), 'utf8')
const layoutSource = await readFile(new URL('../src/layouts/RecruiterLayout.tsx', import.meta.url), 'utf8')
const applicationListSource = await readFile(new URL('../src/components/recruiter/RecruiterApplicationList.tsx', import.meta.url), 'utf8')

test('recruiter workspace owns one Inter font token at its layout root', () => {
  assert.match(indexCss, /--font-recruiter:\s*'Inter'/)
  assert.match(layoutSource, /\bfont-recruiter\b/)
  assert.doesNotMatch(applicationListSource, /Plus[_ ]Jakarta/)
})
