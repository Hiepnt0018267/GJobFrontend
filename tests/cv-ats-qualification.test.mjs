import assert from 'node:assert/strict'
import { after, before, test } from 'node:test'
import { readFileSync } from 'node:fs'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createServer } from 'vite'

let server, rendererModule, contract

before(async () => {
  server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom', logLevel: 'error' })
  rendererModule = await server.ssrLoadModule('/src/components/cv/CVTemplateRenderer.tsx')
  contract = await server.ssrLoadModule('/src/contracts/cvRendererKeys.ts')
})

after(async () => { await server?.close() })

const manifest = JSON.parse(readFileSync(new URL('../../GJobBackend/app/contracts/cv_renderer_ats_qualifications.json', import.meta.url), 'utf8'))
const template = (layout_key) => ({ layout_key, theme_config: null })
const deepFreeze = (value) => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.freeze(value)
    Object.values(value).forEach(deepFreeze)
  }
  return value
}
const decodeEntities = (value) => value
  .replaceAll('&amp;', '&').replaceAll('&lt;', '<').replaceAll('&gt;', '>')
  .replaceAll('&quot;', '"').replaceAll('&#x27;', "'").replaceAll('&#x2013;', '–')
const extractCVText = (html) => decodeEntities(html.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim()
const assertMarkerOrder = (text, markers) => {
  let cursor = -1
  for (const marker of markers) {
    const index = text.indexOf(marker, cursor + 1)
    assert.ok(index > cursor, `Expected ${marker} after position ${cursor}; text was: ${text}`)
    cursor = index
  }
}

const base = () => ({
  title: 'ATS_ROLE_TITLE', template_id: 'ats-template',
  personal_info: {
    full_name: 'ATS_NAME_ALPHA', email: 'ats.alpha@example.test', phone: '0900-ATS-ALPHA',
    address: 'ATS_LOCATION_ALPHA', avatar_url: null, linkedin_url: 'https://example.test/ats-linkedin',
    github_url: null, portfolio_url: null, date_of_birth: null,
  },
  career_objective: '', educations: [], experiences: [], skills: [], projects: [], certificates: [], languages: [],
})
const createMinimal = () => deepFreeze(base())
const createNormal = () => deepFreeze({
  ...base(), career_objective: 'ATS_OBJECTIVE_ALPHA',
  experiences: [{ company_name: 'ATS_EXP_COMPANY_ALPHA', position: 'ATS_EXP_ROLE_ALPHA', start_date: '2022-01', end_date: null, is_current: true, description: 'ATS_EXP_DESCRIPTION_ALPHA' }],
  educations: [{ school_name: 'ATS_EDU_SCHOOL_ALPHA', degree: 'ATS_EDU_DEGREE_ALPHA', field_of_study: 'ATS_EDU_MAJOR_ALPHA', start_date: '2018', end_date: '2022', is_current: false, description: 'ATS_EDU_DESCRIPTION_ALPHA' }],
  skills: [{ name: 'ATS_SKILL_ALPHA', level: 'EXPERT' }],
  projects: [{ name: 'ATS_PROJECT_ALPHA', role: 'ATS_PROJECT_ROLE_ALPHA', start_date: '2023', end_date: '2024', description: 'ATS_PROJECT_DESCRIPTION_ALPHA', technologies: ['ATS_TECH_ALPHA'], project_url: 'https://example.test/ats-project' }],
  certificates: [{ name: 'ATS_CERT_ALPHA', organization: 'ATS_CERT_ORG_ALPHA', issue_date: '2024', expiration_date: null, credential_url: 'https://example.test/ats-cert' }],
  languages: [{ name: 'ATS_LANGUAGE_ALPHA', proficiency: 'NATIVE' }],
})
const createLong = () => {
  const normal = structuredClone(createNormal())
  normal.experiences = Array.from({ length: 9 }, (_, index) => ({
    ...normal.experiences[0], company_name: index === 0 ? 'ATS_EXP_COMPANY_ALPHA' : `ATS_EXP_COMPANY_${index + 1}`,
    description: index === 8 ? 'ATS_LONG_TAIL_MARKER' : `ATS_LONG_DESCRIPTION_${index + 1} `.repeat(12),
  }))
  return deepFreeze(normal)
}

const fixtures = [createMinimal, createNormal, createLong]
const requiredNormalMarkers = [
  'ATS_NAME_ALPHA', 'ats.alpha@example.test', '0900-ATS-ALPHA', 'ATS_OBJECTIVE_ALPHA',
  'ATS_EXP_COMPANY_ALPHA', 'ATS_EXP_ROLE_ALPHA', 'ATS_EDU_SCHOOL_ALPHA', 'ATS_SKILL_ALPHA',
  'ATS_PROJECT_ALPHA', 'ATS_CERT_ALPHA', 'ATS_LANGUAGE_ALPHA',
]
const expectedOrder = {
  SIMPLE_SINGLE_COLUMN: ['ATS_NAME_ALPHA', 'ats.alpha@example.test', 'ATS_OBJECTIVE_ALPHA', 'ATS_EXP_ROLE_ALPHA', 'ATS_EXP_COMPANY_ALPHA', 'ATS_EDU_SCHOOL_ALPHA', 'ATS_PROJECT_ALPHA', 'ATS_SKILL_ALPHA', 'ATS_CERT_ALPHA', 'ATS_LANGUAGE_ALPHA'],
  PROFESSIONAL_SIDEBAR: ['ATS_NAME_ALPHA', 'ats.alpha@example.test', 'ATS_SKILL_ALPHA', 'ATS_EDU_SCHOOL_ALPHA', 'ATS_LANGUAGE_ALPHA', 'ATS_OBJECTIVE_ALPHA', 'ATS_EXP_ROLE_ALPHA', 'ATS_EXP_COMPANY_ALPHA', 'ATS_PROJECT_ALPHA', 'ATS_CERT_ALPHA'],
  PROFESSIONAL_CLEAN_RIGHT_SIDEBAR: ['ATS_NAME_ALPHA', 'ATS_OBJECTIVE_ALPHA', 'ATS_EXP_ROLE_ALPHA', 'ATS_EXP_COMPANY_ALPHA', 'ATS_PROJECT_ALPHA', 'ats.alpha@example.test', 'ATS_SKILL_ALPHA', 'ATS_EDU_SCHOOL_ALPHA', 'ATS_CERT_ALPHA', 'ATS_LANGUAGE_ALPHA'],
  CREATIVE_DARK_COLUMNS: ['ATS_NAME_ALPHA', 'ats.alpha@example.test', 'ATS_OBJECTIVE_ALPHA', 'ATS_SKILL_ALPHA', 'ATS_EDU_SCHOOL_ALPHA', 'ATS_LANGUAGE_ALPHA', 'ATS_EXP_ROLE_ALPHA', 'ATS_EXP_COMPANY_ALPHA', 'ATS_PROJECT_ALPHA', 'ATS_CERT_ALPHA'],
  FIGMA_A4_PROFILE_TIMELINE: ['ATS_NAME_ALPHA', 'ATS_OBJECTIVE_ALPHA', 'ats.alpha@example.test', 'ATS_EXP_ROLE_ALPHA', 'ATS_EXP_COMPANY_ALPHA', 'ATS_CERT_ALPHA', 'ATS_LANGUAGE_ALPHA', 'ATS_PROJECT_ALPHA', 'ATS_SKILL_ALPHA', 'ATS_EDU_SCHOOL_ALPHA'],
  FIGMA_PURPLE_PROFILE: ['ATS_NAME_ALPHA', 'ATS_OBJECTIVE_ALPHA', 'ats.alpha@example.test', 'ATS_LANGUAGE_ALPHA', 'ATS_EDU_SCHOOL_ALPHA', 'ATS_EXP_ROLE_ALPHA', 'ATS_EXP_COMPANY_ALPHA', 'ATS_SKILL_ALPHA', 'ATS_PROJECT_ALPHA', 'ATS_CERT_ALPHA'],
  FIGMA_CLEAN_SIDEBAR: ['ATS_NAME_ALPHA', 'ATS_OBJECTIVE_ALPHA', 'ATS_EXP_ROLE_ALPHA', 'ATS_EXP_COMPANY_ALPHA', 'ATS_PROJECT_ALPHA', 'ATS_CERT_ALPHA', 'ats.alpha@example.test', 'ATS_SKILL_ALPHA', 'ATS_EDU_SCHOOL_ALPHA', 'ATS_LANGUAGE_ALPHA'],
  FIGMA_MONOCHROME_PORTRAIT: ['ATS_OBJECTIVE_ALPHA', 'ATS_NAME_ALPHA', 'ats.alpha@example.test', 'ATS_SKILL_ALPHA', 'ATS_CERT_ALPHA', 'ATS_LANGUAGE_ALPHA', 'ATS_EXP_ROLE_ALPHA', 'ATS_EXP_COMPANY_ALPHA', 'ATS_PROJECT_ALPHA', 'ATS_EDU_SCHOOL_ALPHA'],
  FIGMA_EDITORIAL_PORTRAIT: ['ATS_NAME_ALPHA', 'ATS_OBJECTIVE_ALPHA', 'ATS_SKILL_ALPHA', 'ATS_EXP_ROLE_ALPHA', 'ATS_EXP_COMPANY_ALPHA', 'ATS_PROJECT_ALPHA', 'ats.alpha@example.test', 'ATS_EDU_SCHOOL_ALPHA', 'ATS_LANGUAGE_ALPHA', 'ATS_CERT_ALPHA'],
}

test('renderer qualification manifest is versioned, complete and fail-closed by contract', () => {
  assert.equal(manifest.qualification_version, 'ats-v1')
  assert.deepEqual(Object.keys(manifest.renderers), [...contract.CV_TEMPLATE_LAYOUT_KEYS])
  for (const key of contract.CV_TEMPLATE_LAYOUT_KEYS) {
    assert.match(manifest.renderers[key].status, /^(ATS_FRIENDLY|ATS_CAUTION|NOT_ATS_FRIENDLY)$/)
    assert.ok(manifest.renderers[key].evidence.length >= 40)
  }
})

test('54 core ATS scenarios preserve deterministic text, order, locale and immutable content', () => {
  let scenarios = 0
  for (const layoutKey of contract.CV_TEMPLATE_LAYOUT_KEYS) {
    for (const createFixture of fixtures) {
      for (const locale of ['vi', 'en']) {
        const cv = createFixture()
        const before = JSON.stringify(cv)
        const html = renderToStaticMarkup(createElement(rendererModule.default, { cv, template: template(layoutKey), presentation: { locale }, mode: 'print' }))
        const text = extractCVText(html)
        assert.match(html, /data-render-mode="print"/)
        assert.ok(text.includes('ATS_NAME_ALPHA'))
        assert.ok(text.includes('ats.alpha@example.test'))
        assert.ok(text.includes('0900-ATS-ALPHA'))
        if (createFixture !== createMinimal) {
          for (const marker of requiredNormalMarkers) assert.ok(text.includes(marker), `${layoutKey}/${locale} missing ${marker}`)
          assertMarkerOrder(text, expectedOrder[layoutKey])
          assert.ok(text.includes(locale === 'vi' ? 'Kinh nghiệm' : 'Experience'))
          assert.ok(text.includes(locale === 'vi' ? 'Kỹ năng' : 'Skills'))
          assert.ok(text.includes(locale === 'vi' ? 'Bản ngữ' : 'Native'))
        } else {
          assert.doesNotMatch(text, /Kinh nghiệm|Experience|Học vấn|Education|Kỹ năng|Skills/)
        }
        if (createFixture === createLong) assert.ok(text.includes('ATS_LONG_TAIL_MARKER'))
        assert.equal(JSON.stringify(cv), before)
        scenarios += 1
      }
    }
  }
  assert.equal(scenarios, contract.CV_TEMPLATE_LAYOUT_KEYS.length * fixtures.length * 2)
})

test('extension contracts cover hidden sections, avatar states, themes, missing contacts and links', () => {
  for (const layoutKey of contract.CV_TEMPLATE_LAYOUT_KEYS) {
    const normal = createNormal()
    const hiddenHtml = renderToStaticMarkup(createElement(rendererModule.default, {
      cv: normal, template: template(layoutKey),
      presentation: { locale: 'vi', candidateOverrides: { section_visibility: { experience: false } } }, mode: 'print',
    }))
    assert.doesNotMatch(extractCVText(hiddenHtml), /ATS_EXP_COMPANY_ALPHA|ATS_EXP_ROLE_ALPHA|ATS_EXP_DESCRIPTION_ALPHA/)

    const themedHtml = renderToStaticMarkup(createElement(rendererModule.default, {
      cv: normal, template: template(layoutKey), presentation: { locale: 'en', candidateOverrides: {
        primary_color: '#123456', secondary_color: '#654321', font_family: 'ROBOTO',
        heading_style: 'UNDERLINE', section_spacing: 'RELAXED', line_spacing: 'RELAXED',
      } }, mode: 'print',
    }))
    const themedText = extractCVText(themedHtml)
    for (const marker of requiredNormalMarkers) assert.ok(themedText.includes(marker))
    assertMarkerOrder(themedText, expectedOrder[layoutKey])

    const avatarCV = structuredClone(normal)
    avatarCV.personal_info.avatar_url = 'https://example.test/ats-avatar.png'
    const avatarHtml = renderToStaticMarkup(createElement(rendererModule.default, { cv: avatarCV, template: template(layoutKey), mode: 'print' }))
    assert.ok(extractCVText(avatarHtml).includes('ATS_EXP_COMPANY_ALPHA'))

    const noContactCV = structuredClone(normal)
    noContactCV.personal_info.email = null
    noContactCV.personal_info.phone = null
    const noContactText = extractCVText(renderToStaticMarkup(createElement(rendererModule.default, { cv: noContactCV, template: template(layoutKey), mode: 'print' })))
    assert.doesNotMatch(noContactText, /ats\.alpha@example\.test|0900-ATS-ALPHA|undefined|null/)
    assert.ok(noContactText.includes('https://example.test/ats-linkedin'))
  }
  const structuredSource = readFileSync(new URL('../src/components/cv/templates/CVStructuredLayout.tsx', import.meta.url), 'utf8')
  assert.match(structuredSource, /onError=\{\(\) => setFailedUrl\(url\)\}/)
})

test('candidate/admin ATS UX is metadata-driven and contains no manual ATS checkbox', () => {
  const candidate = readFileSync(new URL('../src/pages/candidate/CandidateCVTemplatesPage.tsx', import.meta.url), 'utf8')
  const badge = readFileSync(new URL('../src/components/cv/CVATSQualification.tsx', import.meta.url), 'utf8')
  const adminForm = readFileSync(new URL('../src/components/admin/cv-templates/AdminCVTemplateForm.tsx', import.meta.url), 'utf8')
  const service = readFileSync(new URL('../src/services/cvTemplateService.ts', import.meta.url), 'utf8')
  assert.match(candidate, /CandidateATSFriendlyBadge status=\{template\.ats_status\}/)
  assert.match(candidate, /ats_status: filters\.ats_friendly \? 'ATS_FRIENDLY' : undefined/)
  assert.match(badge, /status !== 'ATS_FRIENDLY'/)
  assert.match(badge, /không bảo đảm tương thích với mọi hệ thống ATS/)
  assert.match(service, /ats_status\?: CVATSStatus/)
  assert.doesNotMatch(adminForm, /ATS Friendly|ats_status.*set|set.*ats_status/i)
})

test('qualification statuses reflect measured DOM-order risk rather than template names', () => {
  for (const key of ['SIMPLE_SINGLE_COLUMN']) assert.equal(manifest.renderers[key].status, 'ATS_FRIENDLY')
  for (const key of [
    'PROFESSIONAL_SIDEBAR',
    'PROFESSIONAL_CLEAN_RIGHT_SIDEBAR',
    'CREATIVE_DARK_COLUMNS',
    'FIGMA_A4_PROFILE_TIMELINE',
    'FIGMA_PURPLE_PROFILE',
    'FIGMA_CLEAN_SIDEBAR',
    'FIGMA_MONOCHROME_PORTRAIT',
    'FIGMA_EDITORIAL_PORTRAIT',
  ]) assert.equal(manifest.renderers[key].status, 'ATS_CAUTION')
})
