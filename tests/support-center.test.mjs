import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

const popoverSource = readFileSync(new URL('../src/components/support/SupportPopover.tsx', import.meta.url), 'utf8')
const safetyGuideSource = readFileSync(new URL('../src/components/support/SafetyGuideModal.tsx', import.meta.url), 'utf8')
const faqSource = readFileSync(new URL('../src/components/support/SupportFAQAccordion.tsx', import.meta.url), 'utf8')
const configSource = readFileSync(new URL('../src/config/supportConfig.ts', import.meta.url), 'utf8')
const dockSource = readFileSync(new URL('../src/components/navigation/CandidateQuickDock.tsx', import.meta.url), 'utf8')

test('1. Click nút Hỗ trợ mở đúng Support Popover', () => {
  // CandidateQuickDock defines quick-dock-support button
  assert.match(dockSource, /id="quick-dock-support"/)
  assert.match(dockSource, /label="Hỗ trợ"/)
  // Toggles support popover state or fires onOpenSupport
  assert.match(dockSource, /const handleSupportClick\s*=\s*useCallback/)
  assert.match(dockSource, /setIsSupportOpen\(\(prev\)\s*=>\s*!prev\)/)
  // Mounts SupportPopover with isOpen and onClose
  assert.match(dockSource, /<SupportPopover[\s\S]*?isOpen=\{isSupportOpen\}[\s\S]*?onClose=\{/)
  // Also supports global custom event gjob:open-support
  assert.match(dockSource, /window\.addEventListener\('gjob:open-support', handleCustomOpen\)/)
})

test('2. Header popover hiển thị đúng logo, tiêu đề và mô tả', () => {
  // Logo or branding mark
  assert.match(popoverSource, /GJob/i)
  assert.match(popoverSource, /Trung tâm hỗ trợ GJob/)
  assert.match(popoverSource, /Chúng tôi luôn ghi nhận và hỗ trợ bạn/)
  // Anti-patterns avoided: no fake employee or fake advisor name
  assert.doesNotMatch(popoverSource, /nhân viên tư vấn/i)
  assert.doesNotMatch(popoverSource, /tư vấn viên/i)
  assert.doesNotMatch(popoverSource, /phản hồi trong 24\s*giờ/i)
})

test('3. Nút "Hướng dẫn tìm việc an toàn" điều hướng tới trang Help Center với category=safety', () => {
  assert.match(popoverSource, /Hướng dẫn tìm việc an toàn/)
  assert.match(popoverSource, /handleNavigateToHelp\('safety'\)/)
  assert.match(popoverSource, /navigate\(`\/help\?category=\$\{categorySlug\}`\)/)
})

test('4. Modal hướng dẫn an toàn độc lập có đủ 3 nhóm nội dung quan trọng và portaled an toàn', () => {
  // Group 1: Yêu cầu chuyển tiền / đặt cọc / phí
  assert.match(safetyGuideSource, /Cảnh giác với yêu cầu chuyển tiền/)
  assert.match(safetyGuideSource, /phí ứng tuyển|đặt cọc|nạp tiền/i)

  // Group 2: Bảo vệ tài khoản & thông tin cá nhân
  assert.match(safetyGuideSource, /Bảo vệ tài khoản & thông tin cá nhân/)
  assert.match(safetyGuideSource, /OTP|mật khẩu|CCCD/i)

  // Group 3: Kiểm tra nhà tuyển dụng
  assert.match(safetyGuideSource, /Kiểm tra nhà tuyển dụng/)
  assert.match(safetyGuideSource, /trang công ty|website|địa chỉ/i)

  // Portaled to document.body with z-[70]
  assert.match(safetyGuideSource, /createPortal/)
  assert.match(safetyGuideSource, /z-\[70\]/)
})

test('5. Danh sách câu hỏi thường gặp hiển thị 6 câu hỏi và mở/đóng đúng dạng accordion', () => {
  // Accordion buttons have proper aria attributes
  assert.match(faqSource, /aria-expanded=\{isOpen\}/)
  assert.match(faqSource, /aria-controls=\{panelId\}/)
  // State toggles between item id and null
  assert.match(faqSource, /setOpenId\(\(current\)\s*=>\s*\(current === id \? null : id\)\)/)
  // Exactly 6 FAQ items defined
  const faqIdMatches = faqSource.match(/id:\s*['"][^'"]+['"]/g) || []
  assert.equal(faqIdMatches.length, 6, 'Should define exactly 6 FAQ items')
})

test('6. Nội dung FAQ phản ánh đúng tính năng thực tế của GJob (CV, ứng tuyển, AI Matching, lưu việc làm/công ty, thông báo)', () => {
  // CV creation & templates
  assert.match(faqSource, /Làm sao để tạo CV trên GJob\?/)
  assert.match(faqSource, /mẫu CV theo|chuẩn A4/i)

  // CV download / print
  assert.match(faqSource, /Làm thế nào để tải CV về máy\?/)
  assert.match(faqSource, /Tải xuống PDF|In CV/i)

  // Job search & apply
  assert.match(faqSource, /Làm thế nào để tìm kiếm và ứng tuyển việc làm\?/)
  assert.match(faqSource, /bộ lọc theo ngành nghề|Ứng tuyển ngay/i)

  // AI Matching
  assert.match(faqSource, /AI Matching đánh giá độ phù hợp CV–JD như thế nào\?/)
  assert.match(faqSource, /độ phù hợp|kỹ năng|kinh nghiệm/i)

  // Saved Hub (Jobs & Companies)
  assert.match(faqSource, /Làm thế nào để lưu việc làm và theo dõi công ty\?/)
  assert.match(faqSource, /Việc làm đã lưu|Công ty đã theo dõi/i)

  // Notification management
  assert.match(faqSource, /Làm thế nào để nhận thông báo việc làm mới\?/)
  assert.match(faqSource, /chuông|thông báo/i)
})

test('7. Nút Chat Zalo chỉ render khi có URL hợp lệ; mở đúng URL với target="_blank" và rel="noopener noreferrer"', () => {
  // Config validates URL schema
  assert.match(configSource, /function validateSafeExternalUrl/)
  assert.match(configSource, /parsed\.protocol === 'https:'/)
  // Popover renders Zalo button
  assert.match(popoverSource, /Hỗ trợ qua Zalo/)
  assert.match(popoverSource, /target="_blank"/)
  assert.match(popoverSource, /rel="noopener noreferrer"/)
})

test('8. Nút Liên hệ GJob mở mailto gửi email trực tiếp', () => {
  assert.match(popoverSource, /Liên hệ GJob/)
  assert.match(popoverSource, /mailto:\$\{supportEmail\}/)
})

test('9. Click ra ngoài popover hoặc nhấn Escape thì popover tự đóng', () => {
  // Pointer down outside click handler
  assert.match(popoverSource, /document\.addEventListener\('pointerdown', handlePointerDown\)/)
  assert.match(popoverSource, /document\.removeEventListener\('pointerdown', handlePointerDown\)/)
  assert.match(popoverSource, /!popoverRef\.current\.contains\(target\)/)
  // Escape key handler
  assert.match(popoverSource, /event\.key === 'Escape'/)
  assert.match(popoverSource, /document\.addEventListener\('keydown', handleKeyDown\)/)
  assert.match(popoverSource, /document\.removeEventListener\('keydown', handleKeyDown\)/)
})

test('10. Popover dạng Quick Launcher siêu gọn nhẹ, hiển thị tốt trên desktop và mobile không che khuất control', () => {
  // Z-index layer
  assert.match(popoverSource, /z-50/)
  // Desktop floating width and mobile max-width responsiveness
  assert.match(popoverSource, /w-\[calc\(100vw-2rem\)\]/)
  assert.match(popoverSource, /role="dialog"/)
  assert.match(popoverSource, /aria-label="Trung tâm hỗ trợ GJob"/)
  // Compact height avoiding page overflow
  assert.match(popoverSource, /divide-y divide-slate-100/)
})

test('11. Nút "Các câu hỏi thường gặp" điều hướng tới chuyên mục cv của Help Center', () => {
  assert.match(popoverSource, /Các câu hỏi thường gặp/)
  assert.match(popoverSource, /handleNavigateToHelp\('cv'\)/)
  assert.doesNotMatch(popoverSource, /<QrCode/)
})
