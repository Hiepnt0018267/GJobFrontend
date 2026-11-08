import assert from 'node:assert/strict'
import { after, before, test } from 'node:test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createServer } from 'vite'

let server, localeModule, rendererModule, fixtures, contract, editorState

before(async () => {
  server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom', logLevel: 'error' })
  localeModule = await server.ssrLoadModule('/src/components/cv/cvLocale.ts')
  rendererModule = await server.ssrLoadModule('/src/components/cv/CVTemplateRenderer.tsx')
  fixtures = await server.ssrLoadModule('/src/components/cv/sampleCVData.ts')
  contract = await server.ssrLoadModule('/src/contracts/cvRendererKeys.ts')
  editorState = await server.ssrLoadModule('/src/components/cv/cvEditorState.ts')
})

after(async () => { await server?.close() })

const template = (layout_key) => ({ layout_key, theme_config: null })

function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value
  Object.freeze(value)
  for (const child of Object.values(value)) deepFreeze(child)
  return value
}

const presentation = (changes = {}) => ({ templateId: 'a', locale: 'vi', templateConfigSnapshot: null, candidateOverrides: {}, ...changes })
const content = () => ({ title: 'CV', template_id: 'a', personal_info: { full_name: 'Lan' }, career_objective: '', educations: [], experiences: [], skills: [], projects: [], certificates: [], languages: [] })

test('central labels and presentation formatters support vi, en and deterministic fallback', () => {
  assert.equal(localeModule.getCVLabels('vi').objective, 'Mục tiêu nghề nghiệp')
  assert.equal(localeModule.getCVLabels('en').objective, 'Career Objective')
  assert.equal(localeModule.getCVLabels('invalid').present, 'Hiện tại')
  assert.equal(localeModule.formatCVLanguageProficiency('NATIVE', 'vi'), 'Bản ngữ')
  assert.equal(localeModule.formatCVLanguageProficiency('NATIVE', 'en'), 'Native')
  assert.equal(localeModule.formatCVLanguageProficiency('Candidate wording', 'en'), 'Candidate wording')
  assert.equal(localeModule.formatCVSkillLevel('ADVANCED', 'vi'), 'Nâng cao')
  assert.equal(localeModule.formatCVSkillLevel('ADVANCED', 'en'), 'Advanced')
  assert.equal(localeModule.formatCVSkillLevel('Custom', 'en'), 'Custom')
  assert.equal(localeModule.formatCVDateForDisplay('2024-01', 'vi'), '01/2024')
  assert.equal(localeModule.formatCVDateForDisplay('2024-01', 'en'), 'Jan 2024')
  assert.equal(localeModule.formatCVDateForDisplay({ state: 'current' }, 'en'), 'Present')
  assert.equal(localeModule.formatCVDateForDisplay('Spring 2024', 'en'), 'Spring 2024')
})

test('locale dirty state is presentation-only and round-trips to clean', () => {
  const initial = presentation()
  const english = presentation({ locale: 'en' })
  assert.deepEqual(editorState.deriveEditorDirtyState(content(), content(), initial, english), { contentDirty: false, presentationDirty: true, hasUnsavedChanges: true })
  assert.deepEqual(editorState.deriveEditorDirtyState(content(), content(), initial, presentation({ locale: 'vi' })), { contentDirty: false, presentationDirty: false, hasUnsavedChanges: false })
})

test('template switching preserves the selected locale', () => {
  const initial = presentation()
  const current = presentation({ locale: 'en', candidateOverrides: { primary_color: '#FF0000', section_visibility: { projects: false } } })
  const next = { id: 'b', name: 'Mẫu B', layout_key: 'SIMPLE_SINGLE_COLUMN', theme_config: null, is_featured: false, sort_order: 2 }
  const switched = editorState.applyTemplateSwitch({ current, nextTemplate: next, initial })
  assert.equal(switched.locale, 'en')
  assert.deepEqual(switched.candidateOverrides, { section_visibility: { projects: false } })
})

test('existing CV locale-only save uses a presentation patch and reset keeps locale', () => {
  const current = { template_id: 'a', locale: 'vi', candidate_overrides: {}, template_config_snapshot: {}, presentation_version: 1 }
  assert.deepEqual(editorState.buildExistingCVPresentationPatch(current, presentation({ locale: 'en' })), { locale: 'en' })
  const customized = { ...current, locale: 'en', candidate_overrides: { primary_color: '#112233' } }
  assert.deepEqual(editorState.buildExistingCVPresentationPatch(customized, presentation({ locale: 'en' })), { reset_overrides: true })
})

test('new CV skips the default vi patch and adds en only after create state exists', () => {
  assert.deepEqual(editorState.buildNewCVPresentationPatch('vi', presentation({ locale: 'vi' })), {})
  assert.deepEqual(editorState.buildNewCVPresentationPatch('vi', presentation({ locale: 'en' })), { locale: 'en' })
  assert.deepEqual(editorState.buildNewCVPresentationPatch('vi', presentation({ locale: 'en', candidateOverrides: { font_family: 'ROBOTO' } })), { font_family: 'ROBOTO', locale: 'en' })
})

test('all 9 renderers × 3 deep-frozen fixtures × 2 locales render without mutating Candidate content', () => {
  const cases = [fixtures.createNormalSampleCVData, fixtures.createMinimalSampleCVData, fixtures.createLongSampleCVData]
  let combinations = 0
  for (const key of contract.CV_TEMPLATE_LAYOUT_KEYS) {
    for (const createFixture of cases) {
      const cv = deepFreeze(createFixture('locale-matrix'))
      const canonicalBefore = JSON.stringify(cv)
      for (const locale of ['vi', 'en']) {
        const html = renderToStaticMarkup(createElement(rendererModule.default, { cv, template: template(key), presentation: { locale }, mode: 'preview' }))
        assert.match(html, /data-cv-document="true"/)
        assert.match(html, new RegExp(cv.personal_info.full_name))
        assert.equal(JSON.stringify(cv), canonicalBefore)
        combinations += 1
      }
    }
  }
  assert.equal(combinations, contract.CV_TEMPLATE_LAYOUT_KEYS.length * cases.length * 2)
})

test('the same Candidate content gets localized headings, dates and visible system enum labels only', () => {
  const cv = deepFreeze(fixtures.createNormalSampleCVData('locale-content'))
  const canonicalBefore = JSON.stringify(cv)
  for (const key of contract.CV_TEMPLATE_LAYOUT_KEYS) {
    const vi = renderToStaticMarkup(createElement(rendererModule.default, { cv, template: template(key), presentation: { locale: 'vi' }, mode: 'preview' }))
    const en = renderToStaticMarkup(createElement(rendererModule.default, { cv, template: template(key), presentation: { locale: 'en' }, mode: 'preview' }))
    assert.match(vi, /Mục tiêu nghề nghiệp/)
    assert.match(vi, /Kinh nghiệm/)
    assert.match(vi, /Hiện tại/)
    assert.match(vi, /Bản ngữ/)
    assert.match(en, /Career Objective/)
    assert.match(en, /Experience/)
    assert.match(en, /Present/)
    assert.match(en, /Native/)
    for (const candidateText of ['Xây dựng sản phẩm số hữu ích', 'Công ty Sản phẩm Số', 'React', 'Tiếng Việt']) {
      assert.match(vi, new RegExp(candidateText))
      assert.match(en, new RegExp(candidateText))
    }
  }
  assert.equal(JSON.stringify(cv), canonicalBefore)
})

test('empty sections never render a localized heading', () => {
  const cv = deepFreeze(fixtures.createMinimalSampleCVData('locale-empty'))
  for (const key of contract.CV_TEMPLATE_LAYOUT_KEYS) {
    const vi = renderToStaticMarkup(createElement(rendererModule.default, { cv, template: template(key), presentation: { locale: 'vi' }, mode: 'preview' }))
    const en = renderToStaticMarkup(createElement(rendererModule.default, { cv, template: template(key), presentation: { locale: 'en' }, mode: 'preview' }))
    assert.doesNotMatch(vi, />Chứng chỉ</)
    assert.doesNotMatch(en, />Certificates</)
    assert.doesNotMatch(vi, />Ngôn ngữ</)
    assert.doesNotMatch(en, />Languages</)
  }
})
