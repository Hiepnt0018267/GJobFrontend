import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import { HELP_CATEGORIES, searchHelpArticles } from '../src/data/helpCenterData.ts'

const helpPageSource = readFileSync(new URL('../src/pages/help/HelpCenterPage.tsx', import.meta.url), 'utf8')
const appSource = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')
const routeModuleSource = readFileSync(new URL('../src/config/candidateRouteModules.ts', import.meta.url), 'utf8')

test('1. Kho dữ liệu Help Center định nghĩa đủ 10 chuyên mục chuẩn TopCV/GJob', () => {
  const categoryIds = HELP_CATEGORIES.map((c) => c.id)
  assert.ok(categoryIds.includes('account'), 'Thiếu chuyên mục account')
  assert.ok(categoryIds.includes('upgrade'), 'Thiếu chuyên mục upgrade')
  assert.ok(categoryIds.includes('privacy'), 'Thiếu chuyên mục privacy')
  assert.ok(categoryIds.includes('job-search'), 'Thiếu chuyên mục job-search')
  assert.ok(categoryIds.includes('safety'), 'Thiếu chuyên mục safety')
  assert.ok(categoryIds.includes('cv'), 'Thiếu chuyên mục cv')
  assert.ok(categoryIds.includes('ai-matching'), 'Thiếu chuyên mục ai-matching')
  assert.ok(categoryIds.includes('saved-hub'), 'Thiếu chuyên mục saved-hub')
  assert.ok(categoryIds.includes('group'), 'Thiếu chuyên mục group')
  assert.ok(categoryIds.includes('contact'), 'Thiếu chuyên mục contact')
  assert.equal(HELP_CATEGORIES.length, 10)
})

test('2. Chuyên mục Tìm việc an toàn (safety) có đầy đủ 7 câu hỏi cảnh báo thiết yếu chuẩn TopCV', () => {
  const safetyCategory = HELP_CATEGORIES.find((c) => c.id === 'safety')
  assert.ok(safetyCategory, 'Không tìm thấy chuyên mục safety')
  assert.equal(safetyCategory.badgeText, 'Khuyên đọc')
  assert.equal(safetyCategory.articles.length, 7, 'Phải có đúng 7 câu hỏi an toàn')

  const articleTitles = safetyCategory.articles.map((a) => a.title).join(' ')
  assert.match(articleTitles, /Ứng tuyển an toàn như thế nào\?/i)
  assert.match(articleTitles, /Báo cáo tin đăng tuyển/i)
  assert.match(articleTitles, /dấu hiệu của tin đăng bất thường/i)
  assert.match(articleTitles, /dấu hiệu của tin đăng|dấu hiệu bất thường/i)
  assert.match(articleTitles, /bị lừa đảo/i)
  assert.match(articleTitles, /phòng chống lừa đảo/i)
  assert.match(articleTitles, /mạo danh/i)

  // Verify rich content covers transfer money / OTP / scam detection
  const fullContent = safetyCategory.articles.map((a) => a.content + ' ' + (a.bullets?.join(' ') || '')).join(' ')
  assert.match(fullContent, /chuyển tiền|đặt cọc|lệ phí/i)
  assert.match(fullContent, /mật khẩu|otp/i)
  assert.match(fullContent, /giấy phép|mã số thuế|doanh nghiệp/i)
})

test('3. Hàm searchHelpArticles lọc chính xác bài viết theo từ khóa', () => {
  const cvResults = searchHelpArticles('tạo cv')
  assert.ok(cvResults.length > 0, 'Tìm kiếm từ khóa "tạo cv" phải có kết quả')
  assert.ok(cvResults.some((r) => r.article.title.includes('tạo CV') || r.article.title.includes('Tạo CV')))

  const matchingResults = searchHelpArticles('matching')
  assert.ok(matchingResults.length > 0, 'Tìm kiếm từ khóa "matching" phải có kết quả')

  const scamResults = searchHelpArticles('chuyển tiền')
  assert.ok(scamResults.length > 0, 'Tìm kiếm từ khóa "chuyển tiền" phải có kết quả')

  const emptyResults = searchHelpArticles('từ khóa hoàn toàn không tồn tại 12345')
  assert.equal(emptyResults.length, 0)
})

test('4. HelpCenterPage có bố cục 2 cột với sidebar chuyên mục và thanh tìm kiếm tối giản', () => {
  assert.match(helpPageSource, /grid grid-cols-12/)
  assert.match(helpPageSource, /lg:col-span-4 xl:col-span-3/)
  assert.match(helpPageSource, /lg:col-span-8 xl:col-span-9/)
  assert.match(helpPageSource, /placeholder="Tìm kiếm câu hỏi\.\.\."/)
  assert.match(helpPageSource, /Chuyên mục/)
})

test('5. HelpCenterPage hỗ trợ deep-linking URL thông qua query params category và q', () => {
  assert.match(helpPageSource, /useSearchParams/)
  assert.match(helpPageSource, /searchParams\.get\('category'\)/)
  assert.match(helpPageSource, /searchParams\.get\('q'\)/)
  assert.match(helpPageSource, /handleSelectCategory/)
  assert.match(helpPageSource, /handleSearchChange/)
})

test('6. HelpCenterPage hỗ trợ xem câu hỏi dạng Accordion với các hướng dẫn chi tiết', () => {
  assert.match(helpPageSource, /function ArticleAccordionItem/)
  assert.match(helpPageSource, /aria-expanded=/)
  assert.match(helpPageSource, /aria-controls=/)
  assert.match(helpPageSource, /article\.bullets/)
  assert.match(helpPageSource, /article\.actionLink/)
})

test('7. HelpCenterPage hỗ trợ điều hướng trên thiết bị di động (Mobile horizontal tabs)', () => {
  assert.match(helpPageSource, /lg:hidden/)
  assert.match(helpPageSource, /overflow-x-auto/)
})

test('8. Tuyến đường /help được đăng ký đầy đủ trong App.tsx và candidateRouteModules.ts', () => {
  assert.match(appSource, /path="\/help"/)
  assert.match(appSource, /element=\{<HelpCenterPage \/>\}/)
  assert.match(routeModuleSource, /help:\s*\(\)\s*=>\s*import\('\.\.\/pages\/help\/HelpCenterPage'\)/)
})
