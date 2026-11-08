import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

const pageSource = readFileSync(new URL('../src/pages/candidate/FollowedCompaniesPage.tsx', import.meta.url), 'utf8')
const serviceSource = readFileSync(new URL('../src/services/companyService.ts', import.meta.url), 'utf8')
const appSource = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')
const navigationSource = readFileSync(new URL('../src/config/candidateNavigation.ts', import.meta.url), 'utf8')
const protectedRouteSource = readFileSync(new URL('../src/routes/ProtectedRoute.tsx', import.meta.url), 'utf8')
const roleRouteSource = readFileSync(new URL('../src/routes/RoleRoute.tsx', import.meta.url), 'utf8')

test('followed-company API, candidate route and navigation are wired', () => {
  assert.match(serviceSource, /getFollowedCompanies/)
  assert.match(serviceSource, /'\/api\/v1\/candidate\/followed-companies'/)
  assert.match(appSource, /path="\/candidate\/followed-companies"/)
  assert.match(navigationSource, /to:\s*'\/candidate\/(?:saved\?tab=companies|followed-companies)',\s*label:\s*'Công ty đang theo dõi'/)
})

test('route is protected: candidate-only, guest redirected with returnTo, recruiter/admin blocked', () => {
  // App.tsx nests FollowedCompaniesPage inside candidate RoleRoute and ProtectedRoute
  assert.match(appSource, /<Route element={<RoleRoute allowedRoles=\{?\['CANDIDATE'\]\}? \/>}>[\s\S]*?<Route path="\/candidate\/followed-companies"/)
  // ProtectedRoute redirects guest to /login with state: { from: location }
  assert.match(protectedRouteSource, /to="\/login"\s+state=\{\{ from: location \}\}/)
  // RoleRoute redirects non-matching roles away from candidate routes
  assert.match(roleRouteSource, /allowedRoles\.includes\(user\.role\)/)
})

test('followed companies page handles card content, safe images, and company links', () => {
  // Safe image & fallback letter initial
  assert.match(pageSource, /safeImageUrl\(item\.company\.logo_url\)/)
  assert.match(pageSource, /item\.company\.name\.trim\(\)\.charAt\(0\)\.toUpperCase\(\)/)
  // Company details
  assert.match(pageSource, /company\.industry/)
  assert.match(pageSource, /company\.size/)
  assert.match(pageSource, /nhân sự/)
  assert.match(pageSource, /company\.address/)
  assert.match(pageSource, /follower_count\.toLocaleString\('vi-VN'\)/)
  assert.match(pageSource, /người theo dõi/)
  assert.match(pageSource, /active_job_count\.toLocaleString\('vi-VN'\)/)
  assert.match(pageSource, /tin đang tuyển/)
  assert.match(pageSource, /Theo dõi từ/)
  // Navigation links
  assert.match(pageSource, /to=\{`\/companies\/\$\{company\.id\}`\}/)
  assert.match(pageSource, /Xem trang công ty/)
  assert.match(pageSource, /Bỏ theo dõi/)
})

test('followed companies page handles loading skeleton, empty state, and error with retry', () => {
  assert.match(pageSource, /FollowedCompaniesSkeleton/)
  assert.match(pageSource, /aria-busy="true"/)
  assert.match(pageSource, /Bạn chưa theo dõi công ty nào/)
  assert.match(pageSource, /Không thể tải công ty đang theo dõi/)
  assert.match(pageSource, /Thử lại/)
  assert.match(pageSource, /onRetry=\{refetch\}/)
})

test('unfollow is optimistic, locked while pending, and rolls back after an API failure', () => {
  assert.match(pageSource, /const previous = data/)
  assert.match(pageSource, /replaceData\(\{ \.\.\.data, items: nextItems/)
  assert.match(pageSource, /await companyService\.unfollow\(companyId\)/)
  assert.match(pageSource, /replaceData\(previous\)/)
  assert.match(pageSource, /Boolean\(removingCompanyId\)/)
  assert.match(pageSource, /disabled=\{Boolean\(removingCompanyId\) \|\| isFetching/)
  assert.match(pageSource, /if \(nextItems\.length === 0 && page > 1\) setPage\(page - 1\)/)
  assert.match(pageSource, /toast\.success\('Đã bỏ theo dõi công ty\.'\)/)
  assert.match(pageSource, /toast\.error\('Không thể bỏ theo dõi công ty\. Thay đổi đã được hoàn tác\.'\)/)
})

test('pagination handles page navigation and boundary recovery', () => {
  assert.match(pageSource, /PAGE_SIZE = 8/)
  assert.match(pageSource, /setPage\(page - 1\)/)
  assert.match(pageSource, /setPage\(page \+ 1\)/)
  assert.match(pageSource, /page <= data\.total_pages/)
  assert.match(pageSource, /setPage\(data\.total_pages, true\)/)
})
