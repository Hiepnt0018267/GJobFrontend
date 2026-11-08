import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const formSource = await readFile(new URL('../src/components/recruiter/RecruiterProfileForm.tsx', import.meta.url), 'utf8')
const profileSource = await readFile(new URL('../src/pages/recruiter/RecruiterProfilePage.tsx', import.meta.url), 'utf8')
const editSource = await readFile(new URL('../src/pages/recruiter/RecruiterProfileEditPage.tsx', import.meta.url), 'utf8')

test('recruiter company profile explains which data is public and keeps personal data separate', () => {
  assert.match(formSource, /Hồ sơ công ty/)
  assert.match(formSource, /hiển thị công khai với ứng viên trên trang công ty/)
  assert.match(formSource, /Thông tin cá nhân/)
  assert.match(profileSource, /được hiển thị công khai với ứng viên/)
  assert.match(profileSource, /được quản lý tách biệt với hồ sơ công ty/)
})

test('profile and edit pages link to the public company page by recruiter profile id', () => {
  assert.match(profileSource, /to=\{`\/companies\/\$\{profile\.id\}`\}/)
  assert.match(editSource, /to=\{`\/companies\/\$\{profile\.id\}`\}/)
  assert.match(profileSource, /Xem trang công ty/)
  assert.match(editSource, /Xem trang công ty/)
})

test('company fields are trimmed and validated without changing the logo workflow', () => {
  assert.match(formSource, /const companyName = form\.company_name\.trim\(\)/)
  assert.match(formSource, /safeExternalUrl\(website\)/)
  assert.match(formSource, /size < 1 \|\| size > FIELD_LIMITS\.companySize/)
  assert.match(formSource, /maxLength=\{FIELD_LIMITS\.description\}/)
  assert.match(formSource, /recruiterService\.uploadCompanyLogo\(logoFile\)/)
  assert.match(formSource, /recruiterService\.deleteCompanyLogo\(\)/)
})

test('public website rendering reuses the safe URL helper', () => {
  assert.match(profileSource, /safeExternalUrl\(profile\.company_website\)/)
})
