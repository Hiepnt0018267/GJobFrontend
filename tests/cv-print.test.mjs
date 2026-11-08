import assert from 'node:assert/strict'
import { after, before, test } from 'node:test'
import { readFileSync } from 'node:fs'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createServer } from 'vite'

let server, printModule, rendererModule, fixtures, contract, editorState

before(async () => {
  server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom', logLevel: 'error' })
  printModule = await server.ssrLoadModule('/src/components/cv/cvPrint.ts')
  rendererModule = await server.ssrLoadModule('/src/components/cv/CVTemplateRenderer.tsx')
  fixtures = await server.ssrLoadModule('/src/components/cv/sampleCVData.ts')
  contract = await server.ssrLoadModule('/src/contracts/cvRendererKeys.ts')
  editorState = await server.ssrLoadModule('/src/components/cv/cvEditorState.ts')
})

after(async () => { await server?.close() })

const template = (layout_key) => ({ id: `template-${layout_key}`, layout_key, theme_config: null })
const presentation = (locale = 'vi') => ({ locale, templateConfigSnapshot: { primary_color: '#123456' }, candidateOverrides: { font_family: 'ROBOTO', section_visibility: { certificates: false } } })

test('print state includes current draft presentation but excludes editor zoom and UI state', () => {
  const cv = fixtures.createNormalSampleCVData('print-state')
  const input = { cv, template: template('SIMPLE_SINGLE_COLUMN'), presentation: presentation('en'), photoUrl: 'blob:test-photo' }
  const at50 = printModule.derivePrintRenderState({ ...input, editorZoom: 50, panelOpen: true })
  const at150 = printModule.derivePrintRenderState({ ...input, editorZoom: 150, panelOpen: false })
  assert.deepEqual(at50, input)
  assert.deepEqual(at150, input)
  assert.equal('editorZoom' in at50, false)
  assert.equal('panelOpen' in at50, false)
})

test('print title is safe, bounded and has a deterministic fallback', () => {
  assert.equal(printModule.sanitizePrintTitle('  CV: Frontend / Senior?  '), 'CV - CV Frontend Senior')
  assert.equal(printModule.sanitizePrintTitle('\u0000\u0007'), 'CV - GJob')
  assert.ok(printModule.sanitizePrintTitle('a'.repeat(200)).length <= 105)
})

test('browser print controller waits for assets, calls print once and restores title', async () => {
  let printCalls = 0
  let decoded = 0
  const documentRef = { title: 'GJob', fonts: { ready: Promise.resolve() } }
  const root = { querySelectorAll: () => [{ complete: true, naturalWidth: 120, decode: async () => { decoded += 1 } }] }
  const controller = printModule.createBrowserPrintController({ document: documentRef, print: () => { printCalls += 1 } })
  const first = controller.print({ root, title: 'CV: Lan/Frontend' })
  const duplicate = controller.print({ root, title: 'CV khác' })
  assert.equal(first, duplicate)
  await Promise.all([first, duplicate])
  assert.equal(printCalls, 1)
  assert.equal(decoded, 1)
  assert.equal(documentRef.title, 'GJob')
})

test('all 9 renderers support normal and long print DOM in vi and en without content mutation', () => {
  let scenarios = 0
  for (const layoutKey of contract.CV_TEMPLATE_LAYOUT_KEYS) {
    for (const createFixture of [fixtures.createNormalSampleCVData, fixtures.createLongSampleCVData]) {
      const cv = createFixture(`print-${layoutKey}`)
      const before = JSON.stringify(cv)
      for (const locale of ['vi', 'en']) {
        const html = renderToStaticMarkup(createElement(rendererModule.default, { cv, template: template(layoutKey), presentation: { locale }, mode: 'print' }))
        assert.match(html, /data-render-mode="print"/)
        assert.match(html, new RegExp(cv.personal_info.full_name))
        assert.match(html, locale === 'vi' ? /Kinh nghiệm/ : /Experience/)
        if (createFixture === fixtures.createLongSampleCVData) assert.match(html, /Đơn vị công nghệ 7/)
        assert.equal(JSON.stringify(cv), before)
        scenarios += 1
      }
    }
  }
  assert.equal(scenarios, contract.CV_TEMPLATE_LAYOUT_KEYS.length * 2 * 2)
})

test('print respects draft section visibility and leaves editor dirty state unchanged', () => {
  const cv = fixtures.createNormalSampleCVData('print-visibility')
  const initialPresentation = { templateId: 'a', locale: 'vi', templateConfigSnapshot: null, candidateOverrides: {} }
  const draftPresentation = { ...initialPresentation, locale: 'en', candidateOverrides: { section_visibility: { experience: false } } }
  const dirtyBefore = editorState.deriveEditorDirtyState(cv, { ...cv, title: 'Local draft title' }, initialPresentation, draftPresentation)
  const html = renderToStaticMarkup(createElement(rendererModule.default, { cv: { ...cv, title: 'Local draft title' }, template: template('SIMPLE_SINGLE_COLUMN'), presentation: draftPresentation, mode: 'print' }))
  assert.match(html, /Local draft title/)
  assert.doesNotMatch(html, /Công ty Sản phẩm Số/)
  assert.deepEqual(editorState.deriveEditorDirtyState(cv, { ...cv, title: 'Local draft title' }, initialPresentation, draftPresentation), dirtyBefore)
  assert.equal(dirtyBefore.hasUnsavedChanges, true)
})

test('print surface is portal-isolated A4 browser print and contains no persistence or matching calls', () => {
  const surfaceSource = readFileSync(new URL('../src/components/cv/CVPrintSurface.tsx', import.meta.url), 'utf8')
  const hookSource = readFileSync(new URL('../src/components/cv/useCVPrint.ts', import.meta.url), 'utf8')
  const editorSource = readFileSync(new URL('../src/components/cv/CVWorkspaceEditor.tsx', import.meta.url), 'utf8')
  const detailSource = readFileSync(new URL('../src/pages/candidate/CandidateCVDetailPage.tsx', import.meta.url), 'utf8')
  const css = readFileSync(new URL('../src/index.css', import.meta.url), 'utf8')
  assert.match(surfaceSource, /createPortal/)
  assert.match(surfaceSource, /mode="print"/)
  assert.match(surfaceSource, /CVTemplateRenderer/)
  assert.doesNotMatch(`${surfaceSource}\n${hookSource}`, /cvService|updateCV|embedding|precompute|matching/i)
  assert.match(editorSource, /cv=\{contentDraft\}/)
  assert.match(editorSource, /presentation=\{renderPresentation\}/)
  assert.match(detailSource, /cv=\{previewData\}/)
  assert.match(css, /size: A4 portrait/)
  assert.match(css, /body > :not\(\.cv-print-root\)/)
  assert.match(css, /print-color-adjust: exact/)
  assert.match(css, /data-print-background='dark'/)
  assert.match(css, /break-inside: avoid-page/)
  assert.match(css, /overflow: visible !important/)
})
