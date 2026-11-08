import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

// Source files under audit
const dockSource = readFileSync(new URL('../src/components/navigation/CandidateQuickDock.tsx', import.meta.url), 'utf8')
const savedHubSource = readFileSync(new URL('../src/pages/candidate/SavedHubPage.tsx', import.meta.url), 'utf8')
const savedJobsTabSource = readFileSync(new URL('../src/components/candidate/saved/SavedJobsTab.tsx', import.meta.url), 'utf8')
const followedCompaniesTabSource = readFileSync(new URL('../src/components/candidate/saved/FollowedCompaniesTab.tsx', import.meta.url), 'utf8')
const layoutSource = readFileSync(new URL('../src/layouts/MainLayout.tsx', import.meta.url), 'utf8')
const feedbackModalSource = readFileSync(new URL('../src/components/feedback/FeedbackModal.tsx', import.meta.url), 'utf8')
const adminFeedbacksSource = readFileSync(new URL('../src/pages/admin/AdminFeedbacksPage.tsx', import.meta.url), 'utf8')
const supportPopoverSource = readFileSync(new URL('../src/components/support/SupportPopover.tsx', import.meta.url), 'utf8')
const safetyGuideSource = readFileSync(new URL('../src/components/support/SafetyGuideModal.tsx', import.meta.url), 'utf8')
const faqSource = readFileSync(new URL('../src/components/support/SupportFAQAccordion.tsx', import.meta.url), 'utf8')
const supportConfigSource = readFileSync(new URL('../src/config/supportConfig.ts', import.meta.url), 'utf8')
const feedbackTypesSource = readFileSync(new URL('../src/types/feedback.ts', import.meta.url), 'utf8')
const appSource = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')
const adminNavSource = readFileSync(new URL('../src/config/adminNavigation.ts', import.meta.url), 'utf8')
const intentModalSource = readFileSync(new URL('../src/components/feedback/FeedbackIntentModal.tsx', import.meta.url), 'utf8')

// ==========================================
// 1. KIỂM THỬ UNIFIED SAVED HUB
// ==========================================

test('1.1. Saved Hub mở đúng từ Dock, mặc định tab Jobs và đồng bộ URL ?tab=jobs / ?tab=companies', () => {
  // Dock bookmark button navigates to /candidate/saved?tab=jobs
  assert.match(dockSource, /navigate\('\/candidate\/saved\?tab=jobs'\)/)
  // Saved Hub defaults to tab 'jobs' when query param is missing or invalid
  assert.match(savedHubSource, /const activeTab:\s*SavedTabKey\s*=\s*rawTab\s*===\s*'companies'\s*\?\s*'companies'\s*:\s*'jobs'/)
  // Normalizes URL when query param is missing or invalid
  assert.match(savedHubSource, /next\.set\('tab',\s*'jobs'\)/)
  // Tab click updates URL search params
  assert.match(savedHubSource, /next\.set\('tab',\s*nextTab\)/)
})

test('1.2. Legacy routes tiếp tục hoạt động thông qua chuyển hướng sang Saved Hub', () => {
  // App.tsx contains redirects from /candidate/saved-jobs and /candidate/followed-companies
  assert.match(appSource, /path="\/candidate\/saved-jobs"[\s\S]*?LegacySavedRedirect targetTab="jobs"/)
  assert.match(appSource, /path="\/candidate\/followed-companies"[\s\S]*?LegacySavedRedirect targetTab="companies"/)
  // LegacySavedRedirect sets tab parameter and replaces URL
  assert.match(appSource, /function LegacySavedRedirect\(\{ targetTab \}/)
  assert.match(appSource, /params\.set\('tab',\s*targetTab\)/)
  assert.match(appSource, /<Navigate to=\{`\/candidate\/saved\?\$\{params\.toString\(\)\}`\} replace \/>/)
})

test('1.3. Hai tab có pagination, cache key và fetcher hoàn toàn độc lập', () => {
  // SavedJobsTab has own page state and fetcher
  assert.match(savedJobsTabSource, /const \[page,\s*setPage\]\s*=\s*useState\(1\)/)
  assert.match(savedJobsTabSource, /savedJobService\.getSavedJobs\(requestParams,\s*signal\)/)
  assert.match(savedJobsTabSource, /queryKey[\s\S]*?jobs-page/)

  // FollowedCompaniesTab has own page state and fetcher
  assert.match(followedCompaniesTabSource, /const \[page,\s*setPage\]\s*=\s*useState\(1\)/)
  assert.match(followedCompaniesTabSource, /companyService\.getFollowedCompanies\(requestParams,\s*signal\)/)
  assert.match(followedCompaniesTabSource, /queryKey[\s\S]*?companies-page/)
})

test('1.4. Bỏ lưu việc làm và bỏ theo dõi công ty chỉ cập nhật dữ liệu của tab tương ứng', () => {
  assert.match(savedJobsTabSource, /removeSavedJob/)
  assert.match(followedCompaniesTabSource, /const unfollow\s*=\s*async/)
  // SavedHub passes separate total callbacks
  assert.match(savedHubSource, /<SavedJobsTab[\s\S]*?onTotalChange=\{setJobsTotal\}/)
  assert.match(savedHubSource, /<FollowedCompaniesTab[\s\S]*?onTotalChange=\{setCompaniesTotal\}/)
})

// ==========================================
// 2. KIỂM THỬ FLOATING QUICK DOCK
// ==========================================

test('2.1. Phân quyền hiển thị Dock: Candidate và Guest được phép, Recruiter và Admin bị ẩn hoàn toàn', () => {
  assert.match(dockSource, /if\s*\(isAuthenticated\s*&&\s*user\?\.role\s*!==\s*'CANDIDATE'\)\s*\{\s*return null/)
})

test('2.2. Dock chỉ render một lần duy nhất tại MainLayout và bị ẩn trong trình soạn thảo CV', () => {
  assert.match(layoutSource, /!isCVEditor && <CandidateQuickDock \/>/)
  assert.match(dockSource, /const isCVEditor = location\.pathname === '\/candidate\/cvs\/create' \|\| \/\^\\\/candidate\\\/cvs\\\/\[\^\/\]\+\\\/edit\$\/\.test\(location\.pathname\)/)
  assert.match(dockSource, /if\s*\(isCVEditor\)\s*\{\s*return null/)
})

test('2.3. Guest click Bookmark được chuyển hướng tới trang đăng nhập và lưu returnTo', () => {
  assert.match(dockSource, /navigate\('\/login',[\s\S]*?from:[\s\S]*?pathname:\s*'\/candidate\/saved'[\s\S]*?search:\s*'\?tab=jobs'/)
})

test('2.4. Scroll-to-top xuất hiện khi scroll > 300px, dọn dẹp scroll listener khi unmount', () => {
  assert.match(dockSource, /setShowScrollTop\(window\.scrollY > 300\)/)
  assert.match(dockSource, /window\.addEventListener\('scroll', handleScroll/)
  assert.match(dockSource, /window\.removeEventListener\('scroll', handleScroll\)/)
})

test('2.5. Badge tổng hợp đúng: totalSavedCount = savedJobsCount + followedCompaniesCount', () => {
  assert.match(dockSource, /const jobsCount = savedJobs\?\.total \?\? 0/)
  assert.match(dockSource, /const companiesCount = followedCompanies\?\.total \?\? 0/)
  assert.match(dockSource, /setTotalSavedCount\(jobsCount \+ companiesCount\)/)
  assert.match(dockSource, /useDataRefreshVersion\(\)/)
})

// ==========================================
// 3. KIỂM THỬ FEEDBACK MODAL & API
// ==========================================

test('3.1. FeedbackModal có đầy đủ 6 chủ đề bắt buộc và hệ thống đánh giá 1-5 sao emoji', () => {
  assert.match(feedbackTypesSource, /'CV_TOOL'/)
  assert.match(feedbackTypesSource, /'AI_MATCHING'/)
  assert.match(feedbackTypesSource, /'JOB_SEARCH'/)
  assert.match(feedbackTypesSource, /'JOB_NOTIFICATION'/)
  assert.match(feedbackTypesSource, /'WEBSITE_UI_UX'/)
  assert.match(feedbackTypesSource, /'OTHER'/)

  assert.match(feedbackTypesSource, /Rất tệ/)
  assert.match(feedbackTypesSource, /Tệ/)
  assert.match(feedbackTypesSource, /Bình thường/)
  assert.match(feedbackTypesSource, /Tốt/)
  assert.match(feedbackTypesSource, /Tuyệt vời/)
})

test('3.2. FeedbackModal kiểm soát độ dài 1-1000 ký tự và hiển thị đếm ký tự thực tế', () => {
  assert.match(feedbackModalSource, /MAX_CONTENT_LENGTH\s*=\s*1000/)
  assert.match(feedbackModalSource, /\{content\.length\}\/\{MAX_CONTENT_LENGTH\}/)
  assert.match(feedbackModalSource, /Vui lòng nhập nội dung góp ý\./)
})

test('3.3. Khi submit thành công: thông báo Toast, reset form và đóng modal; khi lỗi giữ nguyên dữ liệu', () => {
  assert.match(feedbackModalSource, /await feedbackService\.submitFeedback/)
  assert.match(feedbackModalSource, /toast\.success\(/)
  assert.match(feedbackModalSource, /setContent\(''\)/)
  assert.match(feedbackModalSource, /onClose\(\)/)
  // Form submission failure does not close modal
  assert.doesNotMatch(feedbackModalSource, /catch[\s\S]*?onClose\(\)/)
})

test('3.4. Quản trị Admin: Giao diện lọc status/topic/rating, cập nhật trạng thái và route được bảo vệ', () => {
  assert.match(adminFeedbacksSource, /feedbackService\.getFeedbacksAdmin/)
  assert.match(adminFeedbacksSource, /feedbackService\.updateFeedbackStatusAdmin/)
  assert.match(appSource, /path="\/admin\/feedbacks"/)
  assert.match(adminNavSource, /to:\s*'\/admin\/feedbacks'/)
})

// ==========================================
// 4. KIỂM THỬ SUPPORT CENTER
// ==========================================

test('4.1. Nút Hỗ trợ trên Dock mở đúng SupportPopover, đóng khi nhấn Escape hoặc click ra ngoài', () => {
  assert.match(dockSource, /id="quick-dock-support"/)
  assert.match(dockSource, /<SupportPopover[\s\S]*?isOpen=\{isSupportOpen\}[\s\S]*?onClose=\{/)
  assert.match(supportPopoverSource, /event\.key === 'Escape'/)
  assert.match(supportPopoverSource, /handlePointerDown/)
})

test('4.2. Header Support Popover có logo GJob và định danh chính xác, không dùng nhân viên ảo', () => {
  assert.match(supportPopoverSource, /Trung tâm hỗ trợ GJob/)
  assert.match(supportPopoverSource, /Chúng tôi luôn ghi nhận và hỗ trợ bạn/)
  assert.doesNotMatch(supportPopoverSource, /nhân viên tư vấn/i)
  assert.doesNotMatch(supportPopoverSource, /tư vấn viên/i)
  assert.doesNotMatch(supportPopoverSource, /phản hồi trong 24\s*giờ/i)
})

test('4.3. Accordion FAQ có đủ 6 câu hỏi khớp với toàn bộ tính năng thực tế của GJob', () => {
  assert.match(faqSource, /Làm sao để tạo CV trên GJob\?/)
  assert.match(faqSource, /Làm thế nào để tải CV về máy\?/)
  assert.match(faqSource, /Làm thế nào để tìm kiếm và ứng tuyển việc làm\?/)
  assert.match(faqSource, /AI Matching đánh giá độ phù hợp CV–JD như thế nào\?/)
  assert.match(faqSource, /Làm thế nào để lưu việc làm và theo dõi công ty\?/)
  assert.match(faqSource, /Làm thế nào để nhận thông báo việc làm mới\?/)
})

test('4.4. Cẩm nang an toàn (Safety Guide Modal) có 3 nhóm nội dung bảo vệ ứng viên', () => {
  assert.match(safetyGuideSource, /Cảnh giác với yêu cầu chuyển tiền/)
  assert.match(safetyGuideSource, /Bảo vệ tài khoản & thông tin cá nhân/)
  assert.match(safetyGuideSource, /Kiểm tra nhà tuyển dụng/)
})

test('4.5. Kênh Zalo và hotline/email chỉ render khi có cấu hình biến môi trường an toàn', () => {
  assert.match(supportConfigSource, /validateSafeExternalUrl/)
  assert.match(supportConfigSource, /validateEmail/)
  assert.match(supportConfigSource, /validatePhone/)
  assert.match(supportPopoverSource, /target="_blank"/)
  assert.match(supportPopoverSource, /rel="noopener noreferrer"/)
})

// ==========================================
// 5. KIỂM THỬ RESPONSIVE & Z-INDEX
// ==========================================

test('5.1. Định vị và Z-Index không xung đột: Dock (z-40), Popover (z-50), Modal (z-50 / z-[70])', () => {
  // Dock uses z-40 and safe bottom margin
  assert.match(dockSource, /fixed bottom-20 right-4 sm:bottom-24 sm:right-6 z-40/)
  // Popover uses z-50
  assert.match(supportPopoverSource, /z-50/)
  // Feedback Modal uses z-[70] to sit above dock and popover
  assert.match(feedbackModalSource, /z-\[70\]/)
  // Safety Guide Modal uses modal z-50 with backdrop blur and scroll lock
  assert.match(safetyGuideSource, /z-50/)
  assert.match(safetyGuideSource, /document\.body\.style\.overflow = 'hidden'/)
})

test('5.2. Popover và Modal có max-height và cuộn nội dung, không bị tràn màn hình trên mobile', () => {
  assert.match(supportPopoverSource, /max-h-\[calc\(100vh-7rem\)\]/)
  assert.match(supportPopoverSource, /overflow-y-auto/)
  assert.match(feedbackModalSource, /max-h-\[90vh\]/)
  assert.match(safetyGuideSource, /max-h-\[90vh\]/)
})

// ==========================================
// 6. KIỂM THỬ TÍCH HỢP INTENT MODAL & ZALO DUAL-ACTION
// ==========================================

test('6.1. Click Góp ý từ Dock kích hoạt FeedbackIntentModal; chuyển tiếp form hoặc mở Zalo chat', () => {
  assert.match(dockSource, /window\.dispatchEvent\(new CustomEvent\('gjob:open-feedback'\)\)/)
  assert.match(layoutSource, /window\.addEventListener\('gjob:open-feedback', handleOpenFeedback\)/)
  assert.match(layoutSource, /<FeedbackIntentModal[\s\S]*?open=\{intentOpen\}/)
  assert.match(intentModalSource, /Góp ý sản phẩm/)
  assert.match(intentModalSource, /Chat Zalo để được hỗ trợ/)
  assert.match(intentModalSource, /Mở Zalo chat ngay/)
  assert.doesNotMatch(intentModalSource, /Quét mã QR/)
})

test('6.2. Toàn bộ thông tin hỗ trợ và cam kết phản hồi trung thực, an toàn và bảo mật cho ứng viên', () => {
  // Reassurance note is present in intent modal
  assert.match(intentModalSource, /Nhà tuyển dụng sẽ không đọc được nội dung này\./)
  // Reassurance note is present in feedback form modal
  assert.match(feedbackModalSource, /Nhà tuyển dụng không thể xem được phản hồi này\./)
  // Support Popover uses sincere thank-you message
  assert.match(supportPopoverSource, /Mọi ý kiến đóng góp và yêu cầu hỗ trợ của bạn đều được Ban quản trị tiếp nhận để nâng cấp và hoàn thiện sản phẩm\./)
  // No fake 1900 hotline or fake 24h SLA claims
  assert.doesNotMatch(intentModalSource, /1900\s*\d{4}/)
  assert.doesNotMatch(supportPopoverSource, /1900\s*\d{4}/)
  assert.doesNotMatch(intentModalSource, /24\s*giờ/i)
  assert.doesNotMatch(supportPopoverSource, /24\s*giờ/i)
})
