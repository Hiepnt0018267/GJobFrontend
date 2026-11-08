import assert from 'node:assert/strict'
import { after, before, test } from 'node:test'
import { readFileSync } from 'node:fs'
import { createServer } from 'vite'

let server, service, api

before(async () => {
  server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom', logLevel: 'error' })
  service = (await server.ssrLoadModule('/src/services/cvService.ts')).cvService
  api = (await server.ssrLoadModule('/src/services/api.ts')).default
})

after(async () => { await server?.close() })

test('CV service exposes separate content and presentation PATCH contracts', async () => {
  const originalAdapter = api.defaults.adapter
  const originalLocalStorage = globalThis.localStorage
  const calls = []
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: { getItem: () => null, setItem() {}, removeItem() {} } })
  api.defaults.adapter = async (config) => {
    calls.push(config)
    return { data: {}, status: 200, statusText: 'OK', headers: {}, config }
  }
  try {
    await service.updateCVContent('cv-1', { title: 'Content only' })
    await service.updateCVPresentation('cv-1', { template_id: 'template-2' })
  } finally {
    api.defaults.adapter = originalAdapter
    if (originalLocalStorage === undefined) delete globalThis.localStorage
    else Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: originalLocalStorage })
  }

  assert.deepEqual(calls.map(({ method, url, data }) => [method, url, JSON.parse(data)]), [
    ['patch', '/api/v1/candidate/cvs/cv-1/content', { title: 'Content only' }],
    ['patch', '/api/v1/candidate/cvs/cv-1/presentation', { template_id: 'template-2' }],
  ])
})

test('editor routes presentation-only saves to presentation and mixed saves to atomic legacy PATCH', () => {
  const source = readFileSync(new URL('../src/pages/candidate/CandidateCVEditPage.tsx', import.meta.url), 'utf8')
  assert.match(source, /saveRoute === 'combined'[\s\S]{0,140}updateCV\(id, \{ \.\.\.content, \.\.\.configPatch \}\)/)
  assert.match(source, /saveRoute === 'content'[\s\S]{0,100}updateCVContent\(id, content\)/)
  assert.match(source, /saveRoute === 'presentation'[\s\S]{0,100}updateCVPresentation\(id, configPatch\)/)
  assert.match(source, /const content = canonicalContent\(data\)/)
  assert.match(source, /const configPatch = buildExistingCVPresentationPatch\(cv\.presentation, presentationDraft\)/)
  assert.match(source, /const reconciled = await cvService\.getCV\(id\)/)
  assert.match(source, /setCV\(reconciled\)/)
  assert.match(source, /if \(!isBuilderCV\(cv\)\) return/)
  assert.doesNotMatch(source, /updateCVPresentation\(id, data\)/)
})

test('new CV creates first and patches locale only when the persisted presentation differs', () => {
  const source = readFileSync(new URL('../src/pages/candidate/CandidateCVCreatePage.tsx', import.meta.url), 'utf8')
  const createIndex = source.indexOf('await cvService.createCV(data)')
  const patchIndex = source.indexOf('await cvService.updateCVPresentation(cv.id, presentationPatch)')
  assert.ok(createIndex >= 0)
  assert.ok(patchIndex > createIndex)
  assert.match(source, /buildNewCVPresentationPatch\(cv\.presentation\.locale, presentationDraft\)/)
  assert.match(source, /if \(Object\.keys\(presentationPatch\)\.length\)/)
})

test('editor dirty state separates canonical content from the whole presentation draft', () => {
  const source = readFileSync(new URL('../src/components/cv/CVWorkspaceEditor.tsx', import.meta.url), 'utf8')
  assert.match(source, /deriveEditorDirtyState\(initialContentState, contentDraft, initialPresentationState, presentationDraft\)/)
  assert.match(source, /const \[contentDraft, setContentDraft\]/)
  assert.match(source, /const \[presentationDraft, setPresentationDraft\]/)
  assert.doesNotMatch(source, /updateCVPresentation/)
})
