import assert from 'node:assert/strict'
import { after, before, test } from 'node:test'
import { readFileSync } from 'node:fs'
import { createServer } from 'vite'

let server, service, adminService, api

before(async () => {
  server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom', logLevel: 'error' })
  service = (await server.ssrLoadModule('/src/services/cvTemplateService.ts')).cvTemplateService
  adminService = (await server.ssrLoadModule('/src/services/adminCVTemplateService.ts')).adminCVTemplateService
  api = (await server.ssrLoadModule('/src/services/api.ts')).default
})

after(async () => { await server?.close() })

test('catalog service preserves the endpoint and sends taxonomy plus read-only ATS qualification filter', async () => {
  const originalAdapter = api.defaults.adapter
  const originalLocalStorage = globalThis.localStorage
  const calls = []
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: { getItem: () => null, setItem() {}, removeItem() {} } })
  api.defaults.adapter = async (config) => {
    calls.push(config)
    return { data: config.url.endsWith('taxonomy') ? { industries: [], experience_levels: [], styles: [] } : { items: [] }, status: 200, statusText: 'OK', headers: {}, config }
  }
  try {
    await service.getCVTemplates({ industry_group: 'IT_SOFTWARE', job_position: 'BACKEND_DEVELOPER', experience_level: 'JUNIOR', style: 'IMPRESSIVE', ats_status: 'ATS_FRIENDLY' })
    await service.getCVTemplateTaxonomy()
  } finally {
    api.defaults.adapter = originalAdapter
    if (originalLocalStorage === undefined) delete globalThis.localStorage
    else Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: originalLocalStorage })
  }
  assert.equal(calls[0].url, '/api/v1/cv-templates')
  assert.deepEqual(calls[0].params, { industry_group: 'IT_SOFTWARE', job_position: 'BACKEND_DEVELOPER', experience_level: 'JUNIOR', style: 'IMPRESSIVE', ats_status: 'ATS_FRIENDLY' })
  assert.equal(calls[1].url, '/api/v1/cv-template-taxonomy')
})

test('library exposes discovery filters, narrowing, clearing and the exact filtered empty state', () => {
  const source = readFileSync(new URL('../src/pages/candidate/CandidateCVTemplatesPage.tsx', import.meta.url), 'utf8')
  for (const label of ['ngành nghề', 'vị trí', 'Phong cách', 'Thân thiện ATS', 'Xóa bộ lọc']) assert.match(source, new RegExp(label, 'i'))
  assert.doesNotMatch(source, /FilterSelect label="Kinh nghiệm"/)
  assert.match(source, /const positionDirectory = useMemo/)
  assert.match(source, /industry\.code === filters\.industry_group/)
  assert.doesNotMatch(source, /setFilter\('job_position'[^\n]*industry_group/)
  assert.match(source, /Không tìm thấy mẫu CV phù hợp với bộ lọc hiện tại\./)
  assert.match(source, /ats_status: filters\.ats_friendly \? 'ATS_FRIENDLY' : undefined/)
  assert.doesNotMatch(source, /Ngôn ngữ/)
})

test('preview is deterministic, synthetic, portal-based and offers an explicit create action', () => {
  const source = readFileSync(new URL('../src/pages/candidate/CandidateCVTemplatesPage.tsx', import.meta.url), 'utf8')
  assert.match(source, /createSampleCVData\(template\.id\)/)
  assert.match(source, /function LiveTemplateThumbnail/)
  assert.match(source, /new IntersectionObserver/)
  assert.match(source, /new ResizeObserver/)
  assert.match(source, /template\.thumbnail_url && !imageFailed/)
  assert.match(source, /function TemplatePreviewDialog/)
  assert.match(source, /role="dialog"/)
  assert.match(source, /createPortal\([\s\S]*document\.body,\s*\)/)
  assert.match(source, /document\.body\.style\.overflow = 'hidden'/)
  assert.match(source, /z-\[110\]/)
  assert.match(source, /Bạn muốn tạo CV từ\?/) 
  assert.match(source, /Tạo CV mới với mẫu này/)
  assert.match(source, /group-hover:translate-y-0[^"\n]*group-hover:opacity-100/)
  assert.doesNotMatch(source, /cvService|updateCV|PATCH|candidate\/cvs\/.*presentation/)
})

test('large role catalog bounds rendered cards in the library and editor switcher', () => {
  const library = readFileSync(new URL('../src/pages/candidate/CandidateCVTemplatesPage.tsx', import.meta.url), 'utf8')
  const switcher = readFileSync(new URL('../src/components/cv/CVEditorPanels.tsx', import.meta.url), 'utf8')
  assert.match(library, /const pageSize = 24/)
  assert.match(library, /visibleTemplates\.map/)
  assert.match(library, /aria-label="Phân trang mẫu CV"/)
  assert.match(switcher, /const \[visibleCount, setVisibleCount\] = useState\(24\)/)
  assert.match(switcher, /items\.slice\(0, visibleCount\)/)
  assert.match(switcher, /Hiển thị thêm/)
})

test('admin form assigns taxonomy while keeping code immutable after creation', () => {
  const source = readFileSync(new URL('../src/components/admin/cv-templates/AdminCVTemplateForm.tsx', import.meta.url), 'utf8')
  assert.match(source, /disabled=\{mode === 'edit'\}/)
  assert.match(source, /industry_groups: industryGroups/)
  assert.match(source, /job_positions: jobPositions/)
  assert.match(source, /experience_levels: experienceLevels/)
  assert.match(source, /styles/)
  assert.match(source, /getCVTemplateTaxonomy/)
})

test('admin catalog sends style, layout and ATS filters server-side and renders management metadata', async () => {
  const originalAdapter = api.defaults.adapter
  const originalLocalStorage = globalThis.localStorage
  const calls = []
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: { getItem: () => null, setItem() {}, removeItem() {} } })
  api.defaults.adapter = async (config) => {
    calls.push(config)
    return { data: { items: [], page: 1, page_size: 10, total: 0, total_pages: 0 }, status: 200, statusText: 'OK', headers: {}, config }
  }
  try {
    await adminService.getAdminCVTemplates({ style: 'PROFESSIONAL', layout_key: 'PROFESSIONAL_SIDEBAR', ats_status: 'ATS_CAUTION', page: 1, page_size: 10 })
  } finally {
    api.defaults.adapter = originalAdapter
    if (originalLocalStorage === undefined) delete globalThis.localStorage
    else Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: originalLocalStorage })
  }
  assert.equal(calls[0].url, '/api/v1/admin/cv-templates')
  assert.deepEqual(calls[0].params, { style: 'PROFESSIONAL', layout_key: 'PROFESSIONAL_SIDEBAR', ats_status: 'ATS_CAUTION', page: 1, page_size: 10 })

  const page = readFileSync(new URL('../src/pages/admin/AdminCVTemplatesPage.tsx', import.meta.url), 'utf8')
  const filters = readFileSync(new URL('../src/components/admin/cv-templates/AdminCVTemplateFilters.tsx', import.meta.url), 'utf8')
  assert.match(page, /template\.styles/)
  assert.match(page, /style: style === 'ALL' \? undefined : style/)
  assert.match(page, /layout_key: layout === 'ALL' \? undefined : layout/)
  assert.match(page, /ats_status: atsStatus === 'ALL' \? undefined : atsStatus/)
  assert.match(page, /industry_group: industry === 'ALL' \? undefined : industry/)
  assert.match(page, /aspect-\[210\/297\]/)
  assert.match(page, /lg:grid-cols-3/)
  assert.match(page, /object-contain/)
  assert.doesNotMatch(page, /Thông tin mẫu/)
  assert.match(filters, /Tất cả bố cục/)
  assert.match(filters, /Tất cả ATS/)
  for (const styleLabel of ['Tất cả phong cách', 'Đơn giản', 'Ấn tượng', 'Chuyên nghiệp']) assert.match(filters, new RegExp(styleLabel))
})

test('admin can generate and persist missing CV thumbnails from the real renderer', () => {
  const page = readFileSync(new URL('../src/pages/admin/AdminCVTemplatesPage.tsx', import.meta.url), 'utf8')
  const batch = readFileSync(new URL('../src/components/admin/cv-templates/AdminCVTemplateThumbnailBatch.tsx', import.meta.url), 'utf8')
  const script = readFileSync(new URL('../scripts/generate-cv-template-thumbnails.mjs', import.meta.url), 'utf8')
  assert.doesNotMatch(page, /AdminCVTemplateThumbnailBatch/)
  assert.match(batch, /toBlob/)
  assert.match(batch, /type: 'image\/webp'/)
  assert.match(batch, /createNormalSampleCVData\(renderTarget\.id\)/)
  assert.match(batch, /CVTemplateRenderer/)
  assert.match(batch, /items\.filter\(\(template\) => !template\.thumbnail_url\)/)
  assert.match(batch, /uploadAdminCVTemplateThumbnail\(template\.id, file\)/)
  assert.match(batch, /page_size: BATCH_SIZE/)
  assert.match(script, /GJOB_ADMIN_TOKEN/)
  assert.match(script, /playwright-core/)
})

test('admin form protects unsaved drafts and thumbnail selection stays local until save', () => {
  const form = readFileSync(new URL('../src/components/admin/cv-templates/AdminCVTemplateForm.tsx', import.meta.url), 'utf8')
  const editPage = readFileSync(new URL('../src/pages/admin/AdminCVTemplateEditPage.tsx', import.meta.url), 'utf8')
  assert.match(form, /initialFormSignature/)
  assert.match(form, /beforeunload/)
  assert.match(form, /protectInternalNavigation/)
  assert.doesNotMatch(form, /onThumbnailSelected/)
  assert.match(editPage, /updateAdminCVTemplate[\s\S]*uploadAdminCVTemplateThumbnail/)
  assert.doesNotMatch(editPage, /handleThumbnailSelected/)
})

test('admin template detail keeps the template name readable on the dark hero', () => {
  const detailPage = readFileSync(
    new URL('../src/pages/admin/AdminCVTemplateDetailPage.tsx', import.meta.url),
    'utf8'
  )
  assert.match(
    detailPage,
    /<h1 className="mt-4 text-2xl font-bold tracking-tight text-white sm:text-3xl">/
  )
})
