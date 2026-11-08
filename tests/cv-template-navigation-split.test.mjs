import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { extname, join, relative } from 'node:path'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'

const root = new URL('../src/', import.meta.url)
const rootPath = fileURLToPath(root)
const appSource = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')
const librarySource = readFileSync(new URL('../src/pages/candidate/CandidateCVTemplatesPage.tsx', import.meta.url), 'utf8')
const navigationSource = readFileSync(new URL('../src/config/candidateNavigation.ts', import.meta.url), 'utf8')

function sourceFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) return sourceFiles(path)
    return ['.ts', '.tsx'].includes(extname(entry.name)) ? [path] : []
  })
}

test('CV template discovery uses separate style and position routes with a safe legacy redirect', () => {
  assert.match(appSource, /path="\/candidate\/cvs\/templates\/styles"[\s\S]*?mode="styles"/)
  assert.match(appSource, /path="\/candidate\/cvs\/templates\/positions"[\s\S]*?mode="positions"/)
  assert.match(appSource, /function LegacyCVTemplateRedirect/)
  assert.match(appSource, /params\.has\('industry_group'\).*params\.has\('job_position'\)/)
  assert.match(appSource, /templates\/\$\{mode\}\$\{search\}/)
})

test('style and position catalogs expose different filter sets while sharing the renderer', () => {
  assert.match(librarySource, /mode === 'styles'/)
  assert.match(librarySource, /mode === 'positions'/)
  assert.match(librarySource, /Mẫu CV theo phong cách/)
  assert.match(librarySource, /Mẫu CV theo vị trí ứng tuyển/)
  assert.doesNotMatch(librarySource, /Loại thư viện mẫu CV/)
  assert.doesNotMatch(librarySource, /aria-current=/)
  assert.match(librarySource, /aria-label="Bộ lọc mẫu CV theo phong cách"/)
  assert.match(librarySource, /setFilter\('style'/)
  assert.match(librarySource, /Tuyển chọn.*mẫu CV tiếng Việt/)
  assert.match(librarySource, /styleDescriptions\[filters\.style\]/)
  assert.match(librarySource, /templates\.length\.toLocaleString\('vi-VN'\)/)
  assert.match(librarySource, /aria-label="Tìm mẫu CV theo vị trí"/)
  assert.match(librarySource, /Tìm kiếm mẫu CV theo vị trí của bạn/)
  assert.match(librarySource, /positionDirectory\.map/)
  assert.match(librarySource, /Khám phá theo ngành nghề/)
  assert.match(librarySource, /Mẫu CV tiêu biểu/)
  assert.match(librarySource, /template\.is_featured/)
  assert.match(librarySource, /aria-roledescription="carousel"/)
  assert.match(librarySource, /featuredCarouselItems/)
  assert.match(librarySource, /finishFeaturedTransition/)
  assert.match(librarySource, /window\.setInterval/)
  assert.match(librarySource, /aria-pressed=/)
  assert.match(librarySource, /PositionTemplateCard/)
  assert.match(librarySource, /templateByPosition/)
  assert.match(librarySource, /Xem thêm.*vị trí/)
  assert.match(librarySource, /Dùng mẫu/)
})

test('no source UI link points directly to the removed all-template page', () => {
  const exactLegacyLiteral = /(['"`])\/candidate\/cvs\/templates\1/
  for (const file of sourceFiles(rootPath)) {
    if (file === join(rootPath, 'App.tsx')) continue
    const source = readFileSync(file, 'utf8')
    assert.doesNotMatch(source, exactLegacyLiteral, relative(rootPath, file))
  }
  assert.doesNotMatch(navigationSource, /Tất cả mẫu CV/)
})
