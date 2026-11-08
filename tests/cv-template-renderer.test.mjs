import assert from 'node:assert/strict'
import { after, before, test } from 'node:test'
import { readFileSync } from 'node:fs'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createServer } from 'vite'

let server, registry, rendererModule, fixtures, contract, themeModule

before(async () => {
  server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom', logLevel: 'error' })
  registry = await server.ssrLoadModule('/src/components/cv/cvTemplateRegistry.tsx')
  rendererModule = await server.ssrLoadModule('/src/components/cv/CVTemplateRenderer.tsx')
  fixtures = await server.ssrLoadModule('/src/components/cv/sampleCVData.ts')
  contract = await server.ssrLoadModule('/src/contracts/cvRendererKeys.ts')
  themeModule = await server.ssrLoadModule('/src/components/cv/cvTheme.ts')
})

after(async () => { await server?.close() })

const template = (layout_key) => ({ layout_key, theme_config: null })

test('frontend registry is complete, unique and synchronized with backend manifest', () => {
  const backendManifest = JSON.parse(readFileSync(new URL('../../GJobBackend/app/contracts/cv_renderer_keys.json', import.meta.url), 'utf8'))
  assert.deepEqual([...contract.CV_TEMPLATE_LAYOUT_KEYS], backendManifest)
  assert.deepEqual(Object.keys(registry.cvTemplateRenderers), backendManifest)
  assert.equal(new Set(backendManifest).size, 9)
  for (const key of backendManifest) assert.equal(typeof registry.getCVTemplateRenderer(key), 'function')
  assert.equal(registry.getCVTemplateRenderer('MY_CUSTOM_CV'), null)
})

test('all nine renderer defaults are synchronized with the backend contract', () => {
  const backendDefaults = JSON.parse(readFileSync(new URL('../../GJobBackend/app/contracts/cv_renderer_defaults.json', import.meta.url), 'utf8'))
  const frontendDefaults = JSON.parse(readFileSync(new URL('../src/contracts/cvRendererDefaults.json', import.meta.url), 'utf8'))
  assert.deepEqual(frontendDefaults, backendDefaults)
  assert.deepEqual(Object.keys(frontendDefaults), [...contract.CV_TEMPLATE_LAYOUT_KEYS])
})

test('all nine renderers handle normal, minimal and long shared fixtures', () => {
  const cases = [
    fixtures.createNormalSampleCVData,
    fixtures.createMinimalSampleCVData,
    fixtures.createLongSampleCVData,
  ]
  for (const key of contract.CV_TEMPLATE_LAYOUT_KEYS) {
    for (const createFixture of cases) {
      const cv = createFixture('template-test')
      const html = renderToStaticMarkup(createElement(rendererModule.default, { cv, template: template(key), mode: 'preview' }))
      assert.match(html, /data-cv-document="true"/)
      assert.match(html, new RegExp(cv.personal_info.full_name))
      assert.doesNotMatch(html, /John Doe|Robyn Kingsley/)
    }
  }
})

test('section visibility is presentation-only for every renderer', () => {
  const cv = fixtures.createNormalSampleCVData('template-test')
  const before = JSON.stringify(cv)
  for (const key of contract.CV_TEMPLATE_LAYOUT_KEYS) {
    const html = renderToStaticMarkup(createElement(rendererModule.default, {
      cv,
      template: template(key),
      presentation: { candidateOverrides: { section_visibility: { experience: false, education: false } } },
      mode: 'editor-preview',
    }))
    assert.doesNotMatch(html, /Công ty Sản phẩm Số/)
    assert.doesNotMatch(html, /Đại học Công nghệ/)
  }
  assert.equal(JSON.stringify(cv), before)
})

test('all renderers expose controlled inline fields without leaking editor controls to preview', () => {
  const noop = () => {}
  const editor = {
    experienceRowKeys: ['experience-1', 'experience-2', 'experience-3'],
    projectRowKeys: ['project-1', 'project-2', 'project-3'],
    onChoosePhoto: noop,
    onTitleChange: noop,
    onPersonalInfoChange: noop,
    onCareerObjectiveChange: noop,
    onEducationChange: noop,
    onAddEducation: noop,
    onDeleteEducation: noop,
    onExperienceChange: noop,
    onAddExperience: noop,
    onDeleteExperience: noop,
    onSkillChange: noop,
    onAddSkill: noop,
    onDeleteSkill: noop,
    onProjectChange: noop,
    onAddProject: noop,
    onDeleteProject: noop,
    onCertificateChange: noop,
    onAddCertificate: noop,
    onDeleteCertificate: noop,
    onLanguageChange: noop,
    onAddLanguage: noop,
    onDeleteLanguage: noop,
  }
  for (const key of contract.CV_TEMPLATE_LAYOUT_KEYS) {
    const cv = fixtures.createMinimalSampleCVData('template-test')
    const editorHtml = renderToStaticMarkup(createElement(rendererModule.default, { cv, template: template(key), mode: 'editor-preview', editor }))
    assert.match(editorHtml, /cv-inline-field/)
    assert.match(editorHtml, /aria-label="Họ và tên"/)
    assert.match(editorHtml, /aria-label="Tải ảnh CV"/)
    assert.match(editorHtml, /Thêm kinh nghiệm/)
    assert.match(editorHtml, /Thêm học vấn/)
    assert.match(editorHtml, /Thêm kỹ năng/)
    assert.match(editorHtml, /aria-label="Tên kỹ năng 1"/)
    assert.doesNotMatch(editorHtml, /Trình độ kỹ năng/)
    assert.doesNotMatch(editorHtml, /AI hỗ trợ/)
    assert.match(editorHtml, /Thêm dự án/)
    assert.match(editorHtml, /Thêm chứng chỉ/)
    assert.match(editorHtml, /Thêm ngôn ngữ/)

    const previewHtml = renderToStaticMarkup(createElement(rendererModule.default, { cv, template: template(key), mode: 'preview' }))
    assert.doesNotMatch(previewHtml, /cv-inline-field/)
    assert.doesNotMatch(previewHtml, /Thêm kinh nghiệm/)
    assert.doesNotMatch(previewHtml, /aria-label="Tải ảnh CV"/)
    assert.doesNotMatch(previewHtml, /Nâng cao|Advanced/)
  }
})

test('resolved presentation uses renderer defaults, then snapshot, then candidate overrides', () => {
  const snapshot = {
    primary_color: '#112233',
    font_family: 'ARIAL',
    default_section_visibility: { projects: false },
  }
  const overridden = themeModule.resolveCVPresentation('SIMPLE_SINGLE_COLUMN', snapshot, {
    primary_color: '#ABC',
    font_family: 'ROBOTO',
    section_visibility: { projects: true, certificates: false },
  })
  assert.equal(overridden.primary_color, '#AABBCC')
  assert.match(overridden.fontStyle.fontFamily, /Roboto/)
  assert.equal(overridden.sectionVisibility.projects, true)
  assert.equal(overridden.sectionVisibility.certificates, false)

  const inherited = themeModule.resolveCVPresentation('SIMPLE_SINGLE_COLUMN', snapshot, {})
  assert.equal(inherited.primary_color, '#112233')
  assert.match(inherited.fontStyle.fontFamily, /Arial/)
  assert.equal(inherited.sectionVisibility.projects, false)

  const fallback = themeModule.resolveCVPresentation('SIMPLE_SINGLE_COLUMN', null, {})
  assert.equal(fallback.primary_color, '#334155')
  assert.match(fallback.fontStyle.fontFamily, /Inter/)
})

test('candidate visual overrides reach the rendered document surface', () => {
  const cv = fixtures.createMinimalSampleCVData('template-test')
  const html = renderToStaticMarkup(createElement(rendererModule.default, {
    cv,
    template: template('SIMPLE_SINGLE_COLUMN'),
    presentation: { candidateOverrides: {
      primary_color: '#ABC',
      secondary_color: '#DEF',
      font_family: 'ROBOTO',
      line_spacing: 'RELAXED',
      section_spacing: 'COMPACT',
      heading_style: 'MINIMAL',
    } },
    mode: 'editor-preview',
  }))
  assert.match(html, /data-section-spacing="COMPACT"/)
  assert.match(html, /data-line-spacing="RELAXED"/)
  assert.match(html, /data-heading-style="MINIMAL"/)
  assert.match(html, /color:#DDEEFF/)
  assert.match(html, /font-family:Roboto/)
})

test('creative dark renderer overrides the shared white document surface', () => {
  const cv = fixtures.createLongSampleCVData('template-test')
  const html = renderToStaticMarkup(createElement(rendererModule.default, {
    cv,
    template: template('CREATIVE_DARK_COLUMNS'),
    mode: 'editor-preview',
  }))
  assert.match(html, /!bg-slate-950 !text-slate-100/)
  assert.match(html, new RegExp(cv.personal_info.full_name))
})

test('avatar handling covers valid, missing and broken-image fallback states', () => {
  const key = 'PROFESSIONAL_SIDEBAR'
  const withAvatar = fixtures.createNormalSampleCVData('template-test')
  withAvatar.personal_info.avatar_url = 'https://example.invalid/synthetic-avatar.png'
  const validHtml = renderToStaticMarkup(createElement(rendererModule.default, {
    cv: withAvatar,
    template: template(key),
    mode: 'preview',
  }))
  assert.match(validHtml, /synthetic-avatar\.png/)

  const withoutAvatar = fixtures.createMinimalSampleCVData('template-test')
  const missingHtml = renderToStaticMarkup(createElement(rendererModule.default, {
    cv: withoutAvatar,
    template: template(key),
    mode: 'preview',
  }))
  assert.match(missingHtml, /aria-label="Ảnh đại diện mặc định"/)
  assert.doesNotMatch(missingHtml, /<img/)

  const source = readFileSync(new URL('../src/components/cv/templates/CVStructuredLayout.tsx', import.meta.url), 'utf8')
  assert.match(source, /onError=\{\(\) => setFailedUrl\(url\)\}/)
  assert.match(source, /const image = !url \|\| failed/)
})

test('candidate editor uses local draft state and the registry-backed live preview', () => {
  const source = readFileSync(new URL('../src/components/cv/CVInlineEditor.tsx', import.meta.url), 'utf8')
  assert.match(source, /setData\(\(current\) => \(\{ \.\.\.current, \.\.\.changes \}\)\)/)
  assert.match(source, /mode="editor-preview"/)
  assert.match(source, /cv=\{data\}/)
  assert.match(source, /template=\{selectedTemplate\}/)
  assert.match(source, /candidateOverrides: current\.candidateOverrides\.section_visibility/)
  assert.match(source, /templateId === initialPresentation\.current\.templateId/)
  assert.match(source, /: nextTemplate\.theme_config \?\? null/)
  assert.match(source, /<CVDesignControls/)
  assert.doesNotMatch(source, /updateCVPresentation/)
})

test('reset is local and clears only candidate overrides', () => {
  const source = readFileSync(new URL('../src/components/cv/CVDesignControls.tsx', import.meta.url), 'utf8')
  assert.match(source, /onChange\(\{\}\)/)
  assert.doesNotMatch(source, /cvService|fetch\(|axios|templateConfigSnapshot/)
})

test('Candidate-facing styles are exactly the three product groups', async () => {
  const styles = await server.ssrLoadModule('/src/components/cv/cvTemplateStyles.ts')
  assert.deepEqual(styles.CV_TEMPLATE_STYLE_LABELS, {
    SIMPLE: 'Đơn giản',
    PROFESSIONAL: 'Chuyên nghiệp',
    IMPRESSIVE: 'Ấn tượng',
  })
})
