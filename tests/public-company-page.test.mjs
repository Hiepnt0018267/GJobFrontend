import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

const pageSource = readFileSync(new URL('../src/pages/companies/PublicCompanyPage.tsx', import.meta.url), 'utf8')
const serviceSource = readFileSync(new URL('../src/services/companyService.ts', import.meta.url), 'utf8')
const appSource = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')

test('public company route and API contracts are wired', () => {
  assert.match(appSource, /path="\/companies\/:companyId"/)
  assert.match(serviceSource, /\/api\/v1\/companies\/\$\{companyId\}/)
  assert.match(serviceSource, /\/api\/v1\/companies\/\$\{companyId\}\/jobs/)
  assert.match(serviceSource, /\/api\/v1\/candidate\/followed-companies\/\$\{companyId\}/)
})

test('company page keeps guest return path and limits follow to candidates', () => {
  assert.match(pageSource, /navigate\('\/login', \{ state: \{ from: location \} \}\)/)
  assert.match(pageSource, /user\?\.role === 'CANDIDATE'/)
  assert.match(pageSource, /user\.role !== 'CANDIDATE'/)
})

test('company page uses safe public URLs and renders no raw HTML', () => {
  assert.match(pageSource, /safeExternalUrl\(company\?\.website\)/)
  assert.match(pageSource, /safeImageUrl\(company\.logo_url\)/)
  assert.match(pageSource, /encodeURIComponent\(company\.address\)/)
  assert.doesNotMatch(pageSource, /dangerouslySetInnerHTML/)
})

test('follow interaction is optimistic and rolls back on failure', () => {
  assert.match(pageSource, /const previousStatus = followStatus/)
  assert.match(pageSource, /const previousCount = company\.follower_count/)
  assert.match(pageSource, /setFollowRecord\(previousStatus\)/)
  assert.match(pageSource, /follower_count: previousCount/)
  assert.match(pageSource, /disabled=\{followBusy\}/)
})

test('company page exposes overview, jobs, empty, error and pagination states', () => {
  assert.match(pageSource, />Tổng quan/)
  assert.match(pageSource, /Tin tuyển dụng/)
  assert.match(pageSource, /Chưa có tin tuyển dụng đang mở/)
  assert.match(pageSource, /Không tìm thấy công ty/)
  assert.match(pageSource, /aria-label="Phân trang việc làm của công ty"/)
})
