import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

const modalSource = readFileSync(new URL('../src/components/feedback/FeedbackModal.tsx', import.meta.url), 'utf8')
const adminFeedbacksSource = readFileSync(new URL('../src/pages/admin/AdminFeedbacksPage.tsx', import.meta.url), 'utf8')
const serviceSource = readFileSync(new URL('../src/services/feedbackService.ts', import.meta.url), 'utf8')
const typesSource = readFileSync(new URL('../src/types/feedback.ts', import.meta.url), 'utf8')
const appSource = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')
const navSource = readFileSync(new URL('../src/config/adminNavigation.ts', import.meta.url), 'utf8')
const routeSource = readFileSync(new URL('../src/config/workspaceRouteModules.ts', import.meta.url), 'utf8')
const intentModalSource = readFileSync(new URL('../src/components/feedback/FeedbackIntentModal.tsx', import.meta.url), 'utf8')
const layoutSource = readFileSync(new URL('../src/layouts/MainLayout.tsx', import.meta.url), 'utf8')

test('1. FeedbackModal có đầy đủ 6 chủ đề bắt buộc và nhãn tiếng Việt', () => {
  assert.match(typesSource, /'CV_TOOL'/)
  assert.match(typesSource, /'AI_MATCHING'/)
  assert.match(typesSource, /'JOB_SEARCH'/)
  assert.match(typesSource, /'JOB_NOTIFICATION'/)
  assert.match(typesSource, /'WEBSITE_UI_UX'/)
  assert.match(typesSource, /'OTHER'/)

  assert.match(typesSource, /Công cụ tạo CV/)
  assert.match(typesSource, /Tính năng AI Matching/)
  assert.match(typesSource, /Tìm kiếm và lọc việc làm/)
  assert.match(typesSource, /Thông báo việc làm/)
  assert.match(typesSource, /Giao diện \/ Trải nghiệm web/)
  assert.match(typesSource, /Khác/)
})

test('2. FeedbackModal hỗ trợ đánh giá từ 1 đến 5 với biểu tượng emoji và nhãn chuẩn', () => {
  assert.match(typesSource, /value:\s*1,[\s\S]*?label:\s*'Rất tệ'/)
  assert.match(typesSource, /value:\s*2,[\s\S]*?label:\s*'Tệ'/)
  assert.match(typesSource, /value:\s*3,[\s\S]*?label:\s*'Bình thường'/)
  assert.match(typesSource, /value:\s*4,[\s\S]*?label:\s*'Tốt'/)
  assert.match(typesSource, /value:\s*5,[\s\S]*?label:\s*'Tuyệt vời'/)
})

test('3. FeedbackModal có validation textarea, đếm ký tự 0/1000 và giới hạn MAX_CONTENT_LENGTH', () => {
  assert.match(modalSource, /MAX_CONTENT_LENGTH\s*=\s*1000/)
  assert.match(modalSource, /\{content\.length\}\/\{MAX_CONTENT_LENGTH\}/)
  assert.match(modalSource, /Vui lòng nhập nội dung góp ý\./)
  assert.match(modalSource, /Nội dung tối đa \$\{MAX_CONTENT_LENGTH\} ký tự\./)
})

test('4. FeedbackModal xử lý submit thành công: thông báo toast, reset form và đóng modal', () => {
  assert.match(modalSource, /await feedbackService\.submitFeedback/)
  assert.match(modalSource, /toast\.success\(/)
  assert.match(modalSource, /setContent\(''\)/)
  assert.match(modalSource, /onClose\(\)/)
})

test('5. FeedbackModal xử lý lỗi submit: giữ nguyên nội dung nhập và hiển thị lỗi, không đóng modal', () => {
  assert.match(modalSource, /setError\(typeof detail === 'string' \? detail/)
  assert.match(modalSource, /role="alert"/)
  assert.doesNotMatch(modalSource, /catch[\s\S]*?onClose\(\)/)
})

test('6. FeedbackService cung cấp đầy đủ API cho cả người dùng và Admin', () => {
  assert.match(serviceSource, /submitFeedback:\s*async\s*\(\s*payload:\s*FeedbackCreatePayload\)/)
  assert.match(serviceSource, /getFeedbacksAdmin:\s*async\s*\([\s\S]*?params:\s*FeedbackListParams/)
  assert.match(serviceSource, /getFeedbackDetailAdmin:\s*async\s*\([\s\S]*?feedbackId:\s*string/)
  assert.match(serviceSource, /updateFeedbackStatusAdmin:\s*async\s*\([\s\S]*?feedbackId:\s*string[\s\S]*?status:\s*FeedbackStatus/)
})

test('7. AdminFeedbacksPage có bộ lọc theo status, topic, rating và từ khóa tìm kiếm', () => {
  assert.match(adminFeedbacksSource, /statusFilter/)
  assert.match(adminFeedbacksSource, /topicFilter/)
  assert.match(adminFeedbacksSource, /ratingFilter/)
  assert.match(adminFeedbacksSource, /feedbackService\.getFeedbacksAdmin/)
})

test('8. AdminFeedbacksPage hỗ trợ cập nhật trạng thái (NEW -> IN_REVIEW -> RESOLVED)', () => {
  assert.match(adminFeedbacksSource, /feedbackService\.updateFeedbackStatusAdmin/)
  assert.match(adminFeedbacksSource, /'NEW'/)
  assert.match(adminFeedbacksSource, /'IN_REVIEW'/)
  assert.match(adminFeedbacksSource, /'RESOLVED'/)
  assert.match(typesSource, /FEEDBACK_STATUS_LABELS/)
})

test('9. Admin Navigation và Router được đăng ký đường dẫn /admin/feedbacks', () => {
  assert.match(appSource, /path="\/admin\/feedbacks"/)
  assert.match(routeSource, /adminFeedbacks:\s*\(\)\s*=>\s*import\('\.\.\/pages\/admin\/AdminFeedbacksPage'\)/)
  assert.match(navSource, /to:\s*'\/admin\/feedbacks'/)
  assert.match(navSource, /label:\s*'Góp ý sản phẩm'/)
})

test('10. FeedbackIntentModal cung cấp lựa chọn phân luồng Góp ý vs Chat Zalo hỗ trợ', () => {
  // Modal title and options
  assert.match(intentModalSource, /Bạn muốn\?/)
  assert.match(intentModalSource, /Góp ý sản phẩm/)
  assert.match(intentModalSource, /Chat Zalo để được hỗ trợ/)

  // Direct link to Zalo chat
  assert.match(intentModalSource, /Mở Zalo chat ngay/)
  assert.doesNotMatch(intentModalSource, /Quét mã QR/)
  assert.match(intentModalSource, /target="_blank"/)
  assert.match(intentModalSource, /rel="noopener noreferrer"/)
})

test('11. Cả FeedbackIntentModal và FeedbackModal hiển thị cam kết quyền riêng tư đúng với hệ thống (Nhà tuyển dụng không đọc được)', () => {
  // Intent modal privacy reassurance
  assert.match(intentModalSource, /Bạn đang gửi góp ý\/yêu cầu hỗ trợ tới Ban quản trị GJob\. Nhà tuyển dụng sẽ không đọc được nội dung này\./)

  // Feedback modal privacy reassurance
  assert.match(modalSource, /Góp ý của bạn được bảo mật và chỉ gửi tới Ban quản trị GJob\. Nhà tuyển dụng không thể xem được phản hồi này\./)

  // Anti-patterns avoided: no fake commitments
  assert.doesNotMatch(intentModalSource, /cam kết phản hồi trong 24/i)
  assert.doesNotMatch(modalSource, /cam kết phản hồi trong 24/i)
  assert.doesNotMatch(intentModalSource, /1900\s*\d{4}/)
  assert.doesNotMatch(modalSource, /1900\s*\d{4}/)
})

test('12. MainLayout tích hợp FeedbackIntentModal khi nhận sự kiện gjob:open-feedback và mở FeedbackModal khi người dùng chọn', () => {
  assert.match(layoutSource, /import FeedbackIntentModal from '\.\.\/components\/feedback\/FeedbackIntentModal'/)
  assert.match(layoutSource, /const \[intentOpen, setIntentOpen\] = useState\(false\)/)
  assert.match(layoutSource, /const handleOpenFeedback = \(\) => setIntentOpen\(true\)/)
  assert.match(layoutSource, /<FeedbackIntentModal[\s\S]*?open=\{intentOpen\}[\s\S]*?onSelectFeedback=\{\(\) => setFeedbackOpen\(true\)\}/)
  assert.match(layoutSource, /<FeedbackModal open=\{feedbackOpen\} onClose=\{\(\) => setFeedbackOpen\(false\)\} \/>/)
})

test('13. FeedbackDetailDialog trong AdminFeedbacksPage được portaled an toàn qua AdminViewportPortal để chống tràn và kẹt modal', () => {
  const freshAdminSource = readFileSync(new URL('../src/pages/admin/AdminFeedbacksPage.tsx', import.meta.url), 'utf8')
  assert.match(freshAdminSource, /import AdminViewportPortal from '\.\.\/\.\.\/components\/admin\/AdminViewportPortal'/)
  assert.match(freshAdminSource, /<AdminViewportPortal>/)
  assert.match(freshAdminSource, /<\/AdminViewportPortal>/)
  assert.match(freshAdminSource, /z-\[100\]/)
  assert.match(freshAdminSource, /max-h-\[calc\(100vh-3rem\)\]/)
})

test('14. Hệ thống thông báo Admin hỗ trợ phân loại FEEDBACK_RECEIVED và deep-link trực tiếp tới modal chi tiết', async () => {
  const { notificationVisualCategory, getNotificationTargetPath } = await import('../src/utils/notification.ts')
  const bellSource = readFileSync(new URL('../src/components/notification/NotificationBell.tsx', import.meta.url), 'utf8')
  const freshAdminPageSource = readFileSync(new URL('../src/pages/admin/AdminFeedbacksPage.tsx', import.meta.url), 'utf8')

  // Notification type category mapping
  assert.equal(notificationVisualCategory('FEEDBACK_RECEIVED'), 'feedback')

  // Target path routing
  const mockId = '12345678-1234-4123-8123-123456789abc'
  assert.equal(
    getNotificationTargetPath({ role: 'ADMIN', targetType: 'FEEDBACK', targetId: mockId }),
    `/admin/feedbacks?id=${mockId}`
  )
  assert.equal(
    getNotificationTargetPath({ role: 'ADMIN', notificationType: 'FEEDBACK_RECEIVED', targetType: null, targetId: null }),
    '/admin/feedbacks'
  )
  // Not exposed to Candidate or Recruiter
  assert.equal(
    getNotificationTargetPath({ role: 'CANDIDATE', targetType: 'FEEDBACK', targetId: mockId }),
    null
  )
  assert.equal(
    getNotificationTargetPath({ role: 'RECRUITER', targetType: 'FEEDBACK', targetId: mockId }),
    null
  )

  // NotificationBell loads admin feedbacks when admin is active
  assert.match(bellSource, /feedbackService[\s\S]*?getFeedbacksAdmin/)
  assert.match(bellSource, /FEEDBACK_RECEIVED/)
  assert.match(bellSource, /setAdminFeedbackItems/)

  // AdminFeedbacksPage supports ?id= auto-opening
  assert.match(freshAdminPageSource, /params\.get\('id'\)/)
  assert.match(freshAdminPageSource, /feedbackService[\s\S]*?getFeedbackDetailAdmin/)
})

test('15. AdminFeedbacksPage quản lý dismissedIdRef để chống race-condition mở lại khi đóng modal, và NotificationBell lưu trữ persistent read IDs', () => {
  const freshAdminPageSource = readFileSync(new URL('../src/pages/admin/AdminFeedbacksPage.tsx', import.meta.url), 'utf8')
  const bellSource = readFileSync(new URL('../src/components/notification/NotificationBell.tsx', import.meta.url), 'utf8')

  // dismissedIdRef prevents re-opening loop
  assert.match(freshAdminPageSource, /const dismissedIdRef = useRef<string \| null>\(null\)/)
  assert.match(freshAdminPageSource, /if \(dismissedIdRef\.current === targetId\) return/)
  assert.match(freshAdminPageSource, /dismissedIdRef\.current = currentTargetId/)

  // NotificationBell persists read IDs to localStorage and plays sound on new unread arrival
  assert.match(bellSource, /STORAGE_KEY_READ_FEEDBACKS = 'gjob_admin_read_feedback_ids'/)
  assert.match(bellSource, /saveStoredReadFeedbackId/)
  assert.match(bellSource, /playNotificationSound/)
})
