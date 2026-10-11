import assert from 'node:assert/strict'
import { after, before, test } from 'node:test'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createServer } from 'vite'

let server, dateAdapter, draftAdapter, ReviewForm, errorMapper, service, api

before(async () => {
  server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom', logLevel: 'error' })
  dateAdapter = await server.ssrLoadModule('/src/utils/cvDate.ts')
  draftAdapter = await server.ssrLoadModule('/src/components/cv/ai/cvReviewDraft.ts')
  ReviewForm = (await server.ssrLoadModule('/src/components/cv/ai/CVAIReviewForm.tsx')).default
  errorMapper = await server.ssrLoadModule('/src/utils/apiError.ts')
  service = (await server.ssrLoadModule('/src/services/cvService.ts')).cvService
  api = (await server.ssrLoadModule('/src/services/api.ts')).default
})

after(async () => { await server?.close() })

const year = (value) => ({ year: value, month: null, day: null, precision: 'year' })
const month = (yearValue, monthValue) => ({ year: yearValue, month: monthValue, day: null, precision: 'month' })

function structuredResult() {
  return {
    personal_info: {}, career_objective: null,
    educations: [{ school_name: 'Trường mẫu', start_date: year(2022), end_date: month(2026, 5), is_current: false }],
    experiences: [{ company_name: 'Công ty mẫu', position: 'Thực tập sinh', start_date: { year: 2023, month: null, day: null, precision: 'ambiguous' }, end_date: { state: 'current' }, is_current: true }],
    skills: [{ name: 'TypeScript', level: null }],
    projects: [{ name: 'Dự án mẫu', start_date: '2024-02-29', end_date: year(2025), technologies: [] }],
    certificates: [{ name: 'Chứng chỉ mẫu', issue_date: year(2025), expiration_date: month(2026, 8) }],
    languages: [],
  }
}

test('date adapter formats every supported precision without inventing a day', () => {
  assert.equal(dateAdapter.formatCVDateForEditor(year(2022)), '2022')
  assert.equal(dateAdapter.formatCVDateForEditor(month(2022, 5)), '2022-05')
  assert.equal(dateAdapter.formatCVDateForEditor({ year: 2022, month: 5, day: 10, precision: 'day' }), '2022-05-10')
  assert.equal(dateAdapter.formatCVDateForEditor({ state: 'current' }), 'Hiện tại')
  assert.deepEqual(dateAdapter.parseCVDateFromEditor('2022'), year(2022))
  assert.deepEqual(dateAdapter.parseCVDateFromEditor('2022-05'), month(2022, 5))
  assert.equal(dateAdapter.parseCVDateFromEditor('2022-05-10'), '2022-05-10')
  assert.throws(() => dateAdapter.parseCVDateFromEditor('2022-02-30'), dateAdapter.CVDateValidationError)
})

test('unmodified partial, ambiguous and open-ended dates round-trip losslessly', () => {
  const input = structuredResult()
  const output = draftAdapter.toCVStructuredData(draftAdapter.createCVReviewDraft(input))
  assert.deepEqual(output.educations[0].start_date, input.educations[0].start_date)
  assert.deepEqual(output.educations[0].end_date, input.educations[0].end_date)
  assert.deepEqual(output.experiences[0].start_date, input.experiences[0].start_date)
  assert.deepEqual(output.experiences[0].end_date, { state: 'current' })
  assert.equal(output.projects[0].start_date, '2024-02-29')
  assert.notEqual(output.educations[0].start_date, '2022-01-01')
})

test('review form renders partial dates as editor text, never object coercion', () => {
  const errors = []
  const originalError = console.error
  console.error = (...args) => errors.push(args.join(' '))
  try {
    const markup = renderToStaticMarkup(React.createElement(ReviewForm, {
      draft: draftAdapter.createCVReviewDraft(structuredResult()),
      submitting: false,
      submitError: null,
      onChange() {},
      onSubmit() {},
    }))
    assert.equal(markup.includes('[object Object]'), false)
    assert.equal(markup.includes('value="2022"'), true)
    assert.equal(markup.includes('value="2026-05"'), true)
    assert.equal(markup.includes('value="Hiện tại"'), true)
    assert.equal(errors.some((entry) => entry.includes('does not conform')), false)
  } finally {
    console.error = originalError
  }
})

test('invalid editor date is reported at its exact form path', () => {
  const draft = draftAdapter.createCVReviewDraft(structuredResult())
  draft.projects[0].value.start_date = '2024-99'
  assert.deepEqual(draftAdapter.cvReviewDateErrors(draft), ['projects.0.start_date'])
  assert.throws(() => draftAdapter.toCVStructuredData(draft), dateAdapter.CVDateValidationError)
})

test('confirmation service sends the partial-date payload to the exact endpoint', async () => {
  const originalPost = api.post
  const payload = draftAdapter.toCVStructuredData(draftAdapter.createCVReviewDraft(structuredResult()))
  let call
  api.post = async (path, body, options) => {
    call = { path, body, options }
    return { data: { cv_id: 'cv', extraction_id: 'extraction', confirmed_at: '2026-10-11T00:00:00Z', cv: {} } }
  }
  try {
    await service.confirmExtraction('cv', 'extraction', payload)
    assert.equal(call.path, '/api/v1/candidate/cvs/cv/extractions/extraction/confirm')
    assert.deepEqual(call.body.educations[0].start_date, year(2022))
    assert.equal(call.options.signal, undefined)
  } finally {
    api.post = originalPost
  }
})

test('local conversion failures are never mislabeled as network failures', () => {
  const dateFailure = errorMapper.cvExtractionError(new dateAdapter.CVDateValidationError())
  const typeFailure = errorMapper.cvExtractionError(new TypeError('synthetic local conversion failure'))
  assert.equal(dateFailure.kind, 'invalid')
  assert.equal(typeFailure.kind, 'invalid')
  assert.equal(dateFailure.message.includes('ngày tháng'), true)
  assert.equal(/kết nối tới máy chủ/i.test(typeFailure.message), false)
})
