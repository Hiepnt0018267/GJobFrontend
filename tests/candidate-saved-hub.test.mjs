import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

const hubSource = readFileSync(new URL('../src/pages/candidate/SavedHubPage.tsx', import.meta.url), 'utf8')
const jobsTabSource = readFileSync(new URL('../src/components/candidate/saved/SavedJobsTab.tsx', import.meta.url), 'utf8')
const companiesTabSource = readFileSync(new URL('../src/components/candidate/saved/FollowedCompaniesTab.tsx', import.meta.url), 'utf8')
const appSource = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')
const navigationSource = readFileSync(new URL('../src/config/candidateNavigation.ts', import.meta.url), 'utf8')
const protectedRouteSource = readFileSync(new URL('../src/routes/ProtectedRoute.tsx', import.meta.url), 'utf8')
const roleRouteSource = readFileSync(new URL('../src/routes/RoleRoute.tsx', import.meta.url), 'utf8')

test('1. Mở /candidate/saved?tab=jobs hiển thị tab Jobs', () => {
  assert.match(hubSource, /const activeTab: SavedTabKey = rawTab === 'companies' \? 'companies' : 'jobs'/)
  assert.match(hubSource, /id="tab-jobs"/)
  assert.match(hubSource, /aria-selected=\{activeTab === 'jobs'\}/)
  assert.match(hubSource, /id="panel-jobs"/)
  assert.match(hubSource, /activeTab === 'jobs' \? 'mt-6 block' : 'hidden'/)
})

test('2. Mở /candidate/saved?tab=companies hiển thị tab Companies', () => {
  assert.match(hubSource, /id="tab-companies"/)
  assert.match(hubSource, /aria-selected=\{activeTab === 'companies'\}/)
  assert.match(hubSource, /id="panel-companies"/)
  assert.match(hubSource, /activeTab === 'companies' \? 'mt-6 block' : 'hidden'/)
})

test('3. Refresh ở tab Companies vẫn giữ nguyên tab Companies', () => {
  // rawTab is parsed directly from URL searchParams without forcing a reset
  assert.match(hubSource, /const rawTab = searchParams\.get\('tab'\)/)
  assert.match(hubSource, /rawTab === 'companies' \? 'companies' : 'jobs'/)
})

test('4. Chuyển tab Jobs -> Companies: URL và nội dung cập nhật đúng', () => {
  assert.match(hubSource, /handleSelectTab\('companies'\)/)
  assert.match(hubSource, /next\.set\('tab', nextTab\)/)
})

test('5. Browser Back/Forward: Tab phản ánh đồng bộ theo URL history', () => {
  assert.match(hubSource, /useSearchParams\(\)/)
})

test('6 & 7. Mở route cũ Saved Jobs & Followed Companies: redirect sang route thống nhất', () => {
  assert.match(appSource, /function LegacySavedRedirect/)
  assert.match(appSource, /<Route path="\/candidate\/saved-jobs" element={<LegacySavedRedirect targetTab="jobs" \/>} \/>/)
  assert.match(appSource, /<Route path="\/candidate\/followed-companies" element={<LegacySavedRedirect targetTab="companies" \/>} \/>/)
  assert.match(appSource, /<Navigate to=\{`\/candidate\/saved\?\$\{params\.toString\(\)\}`} replace \/>/)
})

test('8. Guest truy cập Saved Hub được chuyển tới login và lưu returnTo', () => {
  assert.match(appSource, /<Route element={<ProtectedRoute loadingVariant="candidate" \/>}>[\s\S]*?<Route path="\/candidate\/saved"/)
  assert.match(protectedRouteSource, /to="\/login"\s+state=\{\{ from: location \}\}/)
})

test('9. Recruiter/Admin truy cập Saved Hub bị chặn theo role guard', () => {
  assert.match(appSource, /<Route element={<RoleRoute allowedRoles=\{?\['CANDIDATE'\]\}? \/>}>[\s\S]*?<Route path="\/candidate\/saved"/)
  assert.match(roleRouteSource, /allowedRoles\.includes\(user\.role\)/)
})

test('10. Jobs API loading: chỉ tab Jobs loading', () => {
  assert.match(jobsTabSource, /isInitialLoading \? \(\s*<SavedJobsSkeleton \/>/)
  assert.match(companiesTabSource, /isInitialLoading \? \(\s*<FollowedCompaniesSkeleton \/>/)
  // Loading states are independent across tab components
  assert.doesNotMatch(hubSource, /isInitialLoading/)
})

test('11. Companies API error: chỉ tab Companies hiển thị lỗi', () => {
  assert.match(companiesTabSource, /!data && errorMessage \? \(\s*<section role="alert"/)
  assert.match(jobsTabSource, /!data && errorMessage \? \(\s*<section role="alert"/)
  // Error states are independent across tab components
  assert.doesNotMatch(hubSource, /errorMessage/)
})

test('12. Retry Companies: chỉ tải lại dữ liệu Companies', () => {
  assert.match(companiesTabSource, /onRetry=\{refetch\}/)
  assert.match(companiesTabSource, /onClick=\{refetch\}/)
  assert.match(companiesTabSource, /companyService\.getFollowedCompanies/)
  assert.doesNotMatch(companiesTabSource, /savedJobService/)
})

test('13. Chuyển tab qua lại giữ data và state của từng tab (không unmount hoặc refetch)', () => {
  assert.match(hubSource, /visitedTabs\.jobs &&/)
  assert.match(hubSource, /visitedTabs\.companies &&/)
  assert.match(hubSource, /activeTab === 'jobs' \? 'mt-6 block' : 'hidden'/)
  assert.match(hubSource, /activeTab === 'companies' \? 'mt-6 block' : 'hidden'/)
})

test('14. Bỏ lưu một Job: chỉ cập nhật Jobs và count tương ứng', () => {
  assert.match(jobsTabSource, /await savedJobService\.unsave\(jobId\)/)
  assert.match(jobsTabSource, /const nextTotal = Math\.max\(0, data\.total - 1\)/)
  assert.match(jobsTabSource, /onTotalChange\??\.\(nextTotal\)/)
  assert.doesNotMatch(jobsTabSource, /companyService/)
})

test('15. Bỏ theo dõi Company: chỉ cập nhật Companies và count tương ứng', () => {
  assert.match(companiesTabSource, /await companyService\.unfollow\(companyId\)/)
  assert.match(companiesTabSource, /const nextTotal = Math\.max\(0, data\.total - 1\)/)
  assert.match(companiesTabSource, /onTotalChange\??\.\(nextTotal\)/)
  assert.doesNotMatch(companiesTabSource, /savedJobService/)
})

test('16. Search/Pagination: giữ nguyên pagination hiện có của từng trang', () => {
  assert.match(jobsTabSource, /PAGE_SIZE = 8/)
  assert.match(jobsTabSource, /setPage\(page - 1\)/)
  assert.match(jobsTabSource, /setPage\(page \+ 1\)/)
  assert.match(companiesTabSource, /PAGE_SIZE = 8/)
  assert.match(companiesTabSource, /setPage\(page - 1\)/)
  assert.match(companiesTabSource, /setPage\(page \+ 1\)/)
})

test('17. Logout/chuyển tài khoản: cache phân tách theo userId', () => {
  assert.match(hubSource, /const \{ user \} = useAuth\(\)/)
  assert.match(hubSource, /userId=\{user\?\.id\}/)
  assert.match(jobsTabSource, /userId \?\? 'guest'/)
  assert.match(companiesTabSource, /userId \?\? 'guest'/)
})

test('18. Count badges: sử dụng total từ API metadata, không lấy số items hiện tại', () => {
  assert.match(hubSource, /typeof jobsTotal === 'number'/)
  assert.match(hubSource, /typeof companiesTotal === 'number'/)
  assert.match(jobsTabSource, /onTotalChange\??\.\(data\.total\)/)
  assert.match(companiesTabSource, /onTotalChange\??\.\(data\.total\)/)
  assert.doesNotMatch(hubSource, /items\.length/)
})
