import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const formSource = await readFile(new URL('../src/components/recruiter/RecruiterProfileForm.tsx', import.meta.url), 'utf8')
const serviceSource = await readFile(new URL('../src/services/recruiterService.ts', import.meta.url), 'utf8')
const profileSource = await readFile(new URL('../src/pages/recruiter/RecruiterProfilePage.tsx', import.meta.url), 'utf8')

test('company logo uses a bounded image picker instead of a URL field', () => {
  assert.match(formSource, /type="file"/)
  assert.match(formSource, /accept="image\/jpeg,image\/png,image\/webp"/)
  assert.match(formSource, /MAX_LOGO_SIZE = 5 \* 1024 \* 1024/)
  assert.doesNotMatch(formSource, /URL logo công ty/)
  assert.match(formSource, /URL\.createObjectURL\(file\)/)
})

test('logo upload and removal call the dedicated recruiter endpoints', () => {
  assert.match(serviceSource, /api\.post<RecruiterProfile>\('\/api\/v1\/recruiters\/me\/logo', payload/)
  assert.match(serviceSource, /api\.delete<RecruiterProfile>\('\/api\/v1\/recruiters\/me\/logo'/)
  assert.match(formSource, /recruiterService\.uploadCompanyLogo\(logoFile\)/)
  assert.match(formSource, /recruiterService\.deleteCompanyLogo\(\)/)
})

test('backend-relative logo URLs are resolved before rendering', () => {
  assert.match(profileSource, /safeImageUrl\(profile\.company_logo_url\)/)
})
