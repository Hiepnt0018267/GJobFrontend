import assert from 'node:assert/strict'
import { after, before, test } from 'node:test'
import { readFileSync } from 'node:fs'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createServer } from 'vite'

let server, state, shell, thumbnail, panels

before(async () => {
  server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom', logLevel: 'error' })
  state = await server.ssrLoadModule('/src/components/cv/cvEditorState.ts')
  shell = await server.ssrLoadModule('/src/components/cv/CVEditorShell.tsx')
  thumbnail = await server.ssrLoadModule('/src/components/cv/CVTemplateThumbnail.tsx')
  panels = await server.ssrLoadModule('/src/components/cv/CVEditorPanels.tsx')
})

after(async () => { await server?.close() })

const content = (changes = {}) => ({ title: 'CV', template_id: 'a', personal_info: { full_name: 'Lan' }, career_objective: '', educations: [], experiences: [], skills: [], projects: [], certificates: [], languages: [], ...changes })
const presentation = (changes = {}) => ({ templateId: 'a', locale: 'vi', templateConfigSnapshot: null, candidateOverrides: {}, ...changes })

test('dirty state separates canonical content from presentation and ignores content template_id', () => {
  assert.deepEqual(state.deriveEditorDirtyState(content(), content({ template_id: 'b' }), presentation(), presentation()), { contentDirty: false, presentationDirty: false, hasUnsavedChanges: false })
  assert.deepEqual(state.deriveEditorDirtyState(content(), content({ title: 'CV mới' }), presentation(), presentation()), { contentDirty: true, presentationDirty: false, hasUnsavedChanges: true })
  assert.deepEqual(state.deriveEditorDirtyState(content(), content(), presentation(), presentation({ candidateOverrides: { font_family: 'ARIAL' } })), { contentDirty: false, presentationDirty: true, hasUnsavedChanges: true })
})

test('save routing covers no-op, content, presentation and combined paths', () => {
  assert.equal(state.deriveSaveRoute({ contentDirty: false, presentationDirty: false }), 'none')
  assert.equal(state.deriveSaveRoute({ contentDirty: true, presentationDirty: false }), 'content')
  assert.equal(state.deriveSaveRoute({ contentDirty: false, presentationDirty: true }), 'presentation')
  assert.equal(state.deriveSaveRoute({ contentDirty: true, presentationDirty: true }), 'combined')
})

test('save availability and status are deterministic', () => {
  assert.equal(state.canSave({ hasUnsavedChanges: false, saveState: 'IDLE' }), false)
  assert.equal(state.canSave({ hasUnsavedChanges: true, saveState: 'SAVING' }), false)
  assert.equal(state.canSave({ hasUnsavedChanges: true, saveState: 'IDLE' }), true)
  assert.equal(state.getSaveStatus('SAVING', true), 'Đang lưu...')
  assert.equal(state.getSaveStatus('ERROR', true), 'Lưu thất bại')
  assert.equal(state.getSaveStatus('IDLE', true), 'Có thay đổi chưa lưu')
  assert.equal(state.getSaveStatus('SAVED', false), 'Đã lưu')
})

test('fit zoom clamps narrow, normal and wide viewports to 50–150%', () => {
  assert.equal(state.computeFitZoom({ viewportWidth: 300, documentWidth: 794, horizontalPadding: 48 }), 50)
  assert.equal(state.computeFitZoom({ viewportWidth: 842, documentWidth: 794, horizontalPadding: 48 }), 100)
  assert.equal(state.computeFitZoom({ viewportWidth: 2000, documentWidth: 794, horizontalPadding: 48 }), 150)
})

test('new CV starts at manual 100% before the candidate adjusts zoom', () => {
  assert.deepEqual(state.getInitialZoomState(true), { zoomMode: 'MANUAL', zoomPercent: 100 })
  assert.deepEqual(state.getInitialZoomState(false), { zoomMode: 'FIT', zoomPercent: 100 })
})

test('template switching preserves section visibility and resets visual overrides', () => {
  const initial = presentation({ templateConfigSnapshot: { primary_color: '#111111' } })
  const current = presentation({ candidateOverrides: { primary_color: '#FF0000', font_family: 'ARIAL', section_visibility: { projects: false } } })
  const next = { id: 'b', name: 'Mẫu B', layout_key: 'SIMPLE_SINGLE_COLUMN', theme_config: { primary_color: '#222222' }, is_featured: false, sort_order: 2 }
  assert.deepEqual(state.applyTemplateSwitch({ current, nextTemplate: next, initial }), { templateId: 'b', locale: 'vi', templateConfigSnapshot: next.theme_config, candidateOverrides: { section_visibility: { projects: false } } })
})

test('section state derives from canonical data and presentation visibility', () => {
  assert.equal(state.deriveSectionState(true, true), 'VISIBLE_WITH_DATA')
  assert.equal(state.deriveSectionState(true, false), 'HIDDEN_WITH_DATA')
  assert.equal(state.deriveSectionState(false, true), 'VISIBLE_EMPTY')
  assert.equal(state.deriveSectionState(false, false), 'EMPTY')
})

test('editor shell exposes header, tool rail, context panel and canvas regions', () => {
  const header = createElement(shell.CVEditorHeader, { title: 'CV Lan', status: 'Đã lưu', saveState: 'SAVED', canSubmit: false, printing: false, onTitleChange() {}, onBack() {}, onPreview() {}, onPrint() {}, onSave() {}, previewButtonRef: { current: null } })
  const rail = createElement(shell.CVEditorToolRail, { activeTool: 'DESIGN', onSelect() {} })
  const panel = createElement(shell.CVEditorContextPanel, { title: 'Thiết kế & Font', description: 'Mô tả', onClose() {} }, 'Panel')
  const html = renderToStaticMarkup(createElement(shell.CVEditorWorkspace, { header, rail, panel, canvas: createElement('section', { 'data-testid': 'cv-editor-canvas' }, 'Canvas') }))
  assert.match(html, /data-testid="cv-editor-header"/)
  assert.match(html, /data-testid="cv-editor-tool-rail"/)
  assert.match(html, /data-testid="cv-editor-tool-rail"[^>]*lg:self-start/)
  assert.match(html, /data-testid="cv-editor-context-panel"/)
  assert.match(html, /data-testid="cv-editor-workspace-body"/)
  assert.match(html, /data-testid="cv-editor-canvas"/)
  assert.match(html, /aria-label="Đóng bảng Thiết kế &amp; Font"/)
  assert.match(html, /backdrop-blur-\[1px\]/)
  assert.match(html, />Xuất PDF</)
  assert.match(html, /aria-keyshortcuts="Control\+S Meta\+S"/)
  assert.match(html, /role="status"/)
  assert.match(html, /aria-pressed="true"[^>]*>.*Thiết kế &amp; Font/s)
  assert.doesNotMatch(html, />Nội dung</)
})

test('tool rail has no selected item while its context panel is closed', () => {
  const html = renderToStaticMarkup(createElement(shell.CVEditorToolRail, { activeTool: null, onSelect() {} }))
  assert.doesNotMatch(html, /aria-pressed="true"/)
  assert.equal((html.match(/aria-pressed="false"/g) ?? []).length, 5)
})

test('reference library is an editor panel with discovery controls and preview-only actions', () => {
  const template = {
    id: 'template-a', code: 'TEMPLATE_A', name: 'CV Backend chuyên nghiệp', description: 'Mẫu dành cho kỹ sư backend',
    layout_key: 'SIMPLE_SINGLE_COLUMN', thumbnail_url: '/media/cv-templates/backend.png', industries: [{ code: 'IT', display_name: 'Công nghệ Thông tin' }],
    job_positions: [{ code: 'BACKEND', display_name: 'Backend Developer' }], experience_levels: [], styles: ['PROFESSIONAL'],
    is_featured: true, sort_order: 1, ats_status: 'ATS_FRIENDLY', qualification_version: 'ats-v1',
  }
  const html = renderToStaticMarkup(createElement(panels.CVReferenceLibraryPanel, { templates: [template], onPreview() {} }))
  assert.match(html, /data-testid="cv-reference-library"/)
  assert.match(html, /Tìm theo ngành hoặc vị trí/)
  assert.match(html, /Công nghệ Thông tin/)
  assert.match(html, /Backend Developer/)
  assert.match(html, /Xem tham khảo/)
  assert.doesNotMatch(html, /Dùng mẫu/)
  assert.doesNotMatch(html, /Áp dụng/)
})

test('preview dialog can expose an explicit apply-template action', () => {
  const source = readFileSync(new URL('../src/components/cv/CVWorkspaceEditor.tsx', import.meta.url), 'utf8')
  assert.match(source, /actionLabel=\{libraryPreviewTemplate \? 'Sử dụng mẫu này vào CV'/)
  assert.match(source, /changeTemplate\(libraryPreviewTemplate\.id\); closePreview\(\)/)
  assert.match(source, /cv=\{createSampleCVData\(libraryPreviewTemplate\.id\)\}/)
})

test('template thumbnail resolves backend-relative media and keeps a broken-image fallback', () => {
  const html = renderToStaticMarkup(createElement(thumbnail.default, { name: 'Modern', url: '/media/cv-templates/modern.png' }))
  const source = readFileSync(new URL('../src/components/cv/CVTemplateThumbnail.tsx', import.meta.url), 'utf8')
  assert.match(html, /src="http:\/\/[^/]+\/media\/cv-templates\/modern\.png"/)
  assert.match(html, /Chưa có ảnh xem trước cho mẫu Modern/)
  assert.match(source, /resolveApiAssetUrl\(url\)/)
  assert.match(source, /onError=/)
})

test('workspace source keeps one draft owner and uses same renderer for canvas and preview', () => {
  const source = readFileSync(new URL('../src/components/cv/CVWorkspaceEditor.tsx', import.meta.url), 'utf8')
  assert.match(source, /const \[contentDraft, setContentDraft\]/)
  assert.match(source, /const \[presentationDraft, setPresentationDraft\]/)
  assert.match(source, /const renderer = <CVTemplateRenderer/)
  assert.match(source, /beforeunload/)
  assert.match(source, /document\.addEventListener\('click', protectInternalLink, true\)/)
  assert.match(source, /const \[panelOpen, setPanelOpen\] = useState\(false\)/)
  assert.match(source, /closePanelOnEscape/)
  assert.match(source, /key=\{activeTool\}/)
  assert.match(source, /editor=\{inlineEditor\}/)
  assert.match(source, /onChoosePhoto: \(\) => setShowAvatarDialog\(true\)/)
  assert.match(source, /onCareerObjectiveChange/)
  assert.match(source, /const previewRenderer[\s\S]*mode="preview"/)
  assert.doesNotMatch(source, /const previewRenderer[\s\S]*:\s*renderer/)
  assert.doesNotMatch(source, /Gợi ý viết CV/)
})

test('canvas is chrome-free and keeps TopCV-style zoom controls at the bottom right', () => {
  const source = readFileSync(new URL('../src/components/cv/CVEditorCanvas.tsx', import.meta.url), 'utf8')
  assert.doesNotMatch(source, />Khung CV</)
  assert.match(source, /absolute bottom-4 right-4/)
  assert.match(source, /px-6 pb-20 pt-0/)
  assert.match(source, /<ZoomOut/)
  assert.match(source, /<ZoomIn/)
  assert.doesNotMatch(source, /data-cv-editor-section/)
  assert.doesNotMatch(source, /Nhập trực tiếp trên CV để chỉnh sửa/)
})
