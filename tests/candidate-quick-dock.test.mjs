import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

const dockSource = readFileSync(new URL('../src/components/navigation/CandidateQuickDock.tsx', import.meta.url), 'utf8')
const layoutSource = readFileSync(new URL('../src/layouts/MainLayout.tsx', import.meta.url), 'utf8')

test('1. Dock chỉ xuất hiện đúng role: Candidate và Guest hiển thị, Recruiter và Admin bị ẩn', () => {
  // Check role guard in dock component
  assert.match(dockSource, /if\s*\(isAuthenticated\s*&&\s*user\?\.role\s*!==\s*'CANDIDATE'\)\s*\{\s*return null/)
  // Check main layout mounts CandidateQuickDock
  assert.match(layoutSource, /<CandidateQuickDock \/>/)
})

test('2. Không render trùng khi điều hướng: mount một lần duy nhất tại MainLayout và ẩn trong CV editor', () => {
  assert.match(layoutSource, /!isCVEditor && <CandidateQuickDock \/>/)
  assert.match(dockSource, /const isCVEditor = location\.pathname === '\/candidate\/cvs\/create' \|\| \/\^\\\/candidate\\\/cvs\\\/\[\^\/\]\+\\\/edit\$\/\.test\(location\.pathname\)/)
  assert.match(dockSource, /if\s*\(isCVEditor\)\s*\{\s*return null/)
})

test('3. Bookmark mở đúng Saved Hub: mặc định vào tab Việc làm đã lưu', () => {
  assert.match(dockSource, /navigate\('\/candidate\/saved\?tab=jobs'\)/)
  assert.match(dockSource, /id="quick-dock-bookmark"/)
  assert.match(dockSource, /label="Mục đã lưu"/)
})

test('4. Guest được chuyển tới login và lưu returnTo về Saved Hub', () => {
  assert.match(dockSource, /navigate\('\/login',[\s\S]*?from:[\s\S]*?pathname:\s*'\/candidate\/saved'[\s\S]*?search:\s*'\?tab=jobs'/)
})

test('5. Badge tổng chính xác: totalCount = savedJobsCount + followedCompaniesCount', () => {
  assert.match(dockSource, /savedJobService\.getSavedJobs\(\{ page: 1, page_size: 1 \}/)
  assert.match(dockSource, /companyService\.getFollowedCompanies\(\{ page: 1, page_size: 1 \}/)
  assert.match(dockSource, /const jobsCount = savedJobs\?\.total \?\? 0/)
  assert.match(dockSource, /const companiesCount = followedCompanies\?\.total \?\? 0/)
  assert.match(dockSource, /setTotalSavedCount\(jobsCount \+ companiesCount\)/)
})

test('6. Badge cập nhật sau thao tác lưu/bỏ lưu và theo dõi/bỏ theo dõi', () => {
  assert.match(dockSource, /useDataRefreshVersion\(\)/)
  assert.match(dockSource, /\[isCandidate, user\?\.id, refreshVersion\]/)
})

test('7. Góp ý gọi đúng callback mở modal hoặc phát custom event', () => {
  assert.match(dockSource, /id="quick-dock-feedback"/)
  assert.match(dockSource, /label="Góp ý"/)
  assert.match(dockSource, /onOpenFeedback\(\)/)
  assert.match(dockSource, /new CustomEvent\('gjob:open-feedback'\)/)
})

test('8. Hỗ trợ gọi đúng callback mở popover hoặc phát custom event', () => {
  assert.match(dockSource, /id="quick-dock-support"/)
  assert.match(dockSource, /label="Hỗ trợ"/)
  assert.match(dockSource, /onOpenSupport\(\)/)
  assert.match(dockSource, /new CustomEvent\('gjob:open-support'\)/)
})

test('9 & 10. Scroll-to-top xuất hiện đúng ngưỡng (> 300px) và cleanup listener khi unmount', () => {
  assert.match(dockSource, /window\.scrollY > 300/)
  assert.match(dockSource, /window\.addEventListener\('scroll', handleScroll/)
  assert.match(dockSource, /window\.removeEventListener\('scroll', handleScroll\)/)
  assert.match(dockSource, /window\.scrollTo\(\{\s*top:\s*0,\s*behavior:\s*'smooth'\s*\}\)/)
  assert.match(dockSource, /id="quick-dock-scroll-top"/)
})

test('11. Định vị responsive và không che nút Apply', () => {
  // Uses fixed positioning in bottom right with z-40 and proper margin/padding
  assert.match(dockSource, /fixed bottom-20 right-4 sm:bottom-24 sm:right-6 z-40/)
  assert.match(dockSource, /aria-label="Thanh công cụ nhanh"/)
  // All buttons have accessible labels and keyboard focus states
  assert.match(dockSource, /focus-visible:ring-2 focus-visible:ring-\[#49BBBD\]/)
  assert.match(dockSource, /role="tooltip"/)
})
