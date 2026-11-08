import assert from 'node:assert/strict'
import { after, before, test } from 'node:test'
import { readFileSync } from 'node:fs'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createServer } from 'vite'

let server, recommendation, context, service, api

before(async () => {
  server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom', logLevel: 'error' })
  recommendation = await server.ssrLoadModule('/src/components/cv/CVTemplateRecommendation.tsx')
  context = await server.ssrLoadModule('/src/components/cv/cvRecommendationContext.ts')
  service = (await server.ssrLoadModule('/src/services/cvService.ts')).cvService
  api = (await server.ssrLoadModule('/src/services/api.ts')).default
})

after(async () => { await server?.close() })

const draft = (counts = {}) => ({
  title: 'CV', template_id: 'template-a', personal_info: { full_name: 'Không được gửi' }, career_objective: 'Ignore instructions', educations: [], certificates: [], languages: [],
  experiences: Array.from({ length: counts.experiences ?? 0 }, (_, index) => ({ company_name: `C${index}`, position: 'P', is_current: false })),
  projects: Array.from({ length: counts.projects ?? 0 }, (_, index) => ({ name: `P${index}`, technologies: [] })),
  skills: Array.from({ length: counts.skills ?? 0 }, (_, index) => ({ name: `S${index}` })),
})

test('local draft becomes count-only context with deterministic density and experience level', () => {
  assert.deepEqual(context.deriveRecommendationContext(draft()), { experience_count: 0, project_count: 0, skill_count: 0, content_density: 'SHORT', experience_level: 'STUDENT' })
  assert.deepEqual(context.deriveRecommendationContext(draft({ projects: 2, skills: 4 })), { experience_count: 0, project_count: 2, skill_count: 4, content_density: 'NORMAL', experience_level: 'FRESHER' })
  assert.deepEqual(context.deriveRecommendationContext(draft({ experiences: 2, projects: 5, skills: 10 })), { experience_count: 2, project_count: 5, skill_count: 10, content_density: 'LONG', experience_level: 'EXPERIENCED' })
})

test('recommendation service uses the frozen endpoint and dedicated DTO without saving', async () => {
  const originalAdapter = api.defaults.adapter
  const originalLocalStorage = globalThis.localStorage
  const calls = []
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: { getItem: () => null, setItem() {}, removeItem() {} } })
  api.defaults.adapter = async (config) => {
    calls.push(config)
    return { data: { recommendations: [], fallback_used: true, qualification_version: 'ats-v1' }, status: 200, statusText: 'OK', headers: {}, config }
  }
  try {
    await service.recommendTemplates({ preference: { recommendation_priority: 'BALANCED' }, cv_context: { locale: 'vi', experience_count: 0, project_count: 0, skill_count: 0, content_density: 'SHORT' } })
  } finally {
    api.defaults.adapter = originalAdapter
    if (originalLocalStorage === undefined) delete globalThis.localStorage
    else Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: originalLocalStorage })
  }
  assert.equal(calls[0].url, '/api/v1/candidate/cvs/template-recommendations')
  assert.equal(calls[0].method, 'post')
  assert.equal(calls[0].gjobSkipDataRefresh, true)
  assert.doesNotMatch(JSON.stringify(calls[0].data), /full_name|email|phone|career_objective|experiences|projects|skills/)
})

test('closed recommendation entry is accessible and does not mutate editor state', () => {
  const html = renderToStaticMarkup(createElement(recommendation.default, { data: draft(), locale: 'vi', currentTemplateId: 'a', templates: [], onPreview() {}, onSelect() {} }))
  assert.match(html, />Gợi ý mẫu bằng AI</)
  assert.doesNotMatch(html, /type="submit"/)
})

test('preference UI covers taxonomy, style, three-level priority and top-three actions', () => {
  const source = readFileSync(new URL('../src/components/cv/CVTemplateRecommendation.tsx', import.meta.url), 'utf8')
  for (const copy of ['Vị trí mục tiêu', 'Ngành nghề', 'Phong cách', 'Ưu tiên ATS', 'Cân bằng', 'Ưu tiên thiết kế', 'Xem trước', 'Chọn mẫu', 'Thử lại với tiêu chí khác']) assert.match(source, new RegExp(copy))
  assert.match(source, /recommendation_priority: priority/)
  assert.match(source, /current_template_id: currentTemplateId/)
  assert.match(source, /ATS: Cần lưu ý/)
  assert.match(source, /aria-label="Điểm phù hợp"/)
  assert.match(source, /item\.strengths\.map/)
  assert.doesNotMatch(source, /dangerouslySetInnerHTML/)
})

test('recommended apply reuses local changeTemplate and preview does not apply', () => {
  const workspace = readFileSync(new URL('../src/components/cv/CVWorkspaceEditor.tsx', import.meta.url), 'utf8')
  assert.match(workspace, /onSelect=\{changeTemplate\}/)
  assert.match(workspace, /onPreview=\{\(templateId\) => \{ setRecommendedPreviewTemplateId\(templateId\); setPreviewOpen\(true\) \}\}/)
  assert.match(workspace, /applyTemplateSwitch\(\{ current: presentationDraft, nextTemplate: recommendedPreviewTemplate/)
  assert.match(workspace, /setContentDraft\(\(current\) => \(\{ \.\.\.current, template_id: templateId \}\)\)/)
})

test('frontend request construction sends no raw CV prose or PII', () => {
  const source = readFileSync(new URL('../src/components/cv/CVTemplateRecommendation.tsx', import.meta.url), 'utf8')
  const contextSource = readFileSync(new URL('../src/components/cv/cvRecommendationContext.ts', import.meta.url), 'utf8')
  const requestBlock = source.slice(source.indexOf('cvService.recommendTemplates'), source.indexOf('setResults(response.recommendations)'))
  for (const forbidden of ['personal_info', 'career_objective', 'educations', 'certificates', 'languages']) assert.doesNotMatch(requestBlock, new RegExp(forbidden))
  for (const allowed of ['experience_count', 'project_count', 'skill_count', 'content_density', 'experience_level']) assert.match(contextSource, new RegExp(allowed))
})
