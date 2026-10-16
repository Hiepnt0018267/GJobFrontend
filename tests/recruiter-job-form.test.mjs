import assert from 'node:assert/strict'
import { after, before, test } from 'node:test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createServer } from 'vite'

let server
let RecruiterJobForm

before(async () => {
  server = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' })
  RecruiterJobForm = (await server.ssrLoadModule('/src/components/recruiter/RecruiterJobForm.tsx')).default
})

after(async () => { await server?.close() })

test('recruiter job edit form renders employment and work-mode options', () => {
  const initialJob = {
    id: 'job-1',
    recruiter_id: 'recruiter-1',
    title: 'Frontend Engineer',
    company_name: 'GJob',
    description: 'Build accessible interfaces.',
    requirements: 'React and TypeScript.',
    benefits: null,
    location: 'Hà Nội',
    employment_type: 'FULL_TIME',
    experience_level: null,
    level: 'SENIOR',
    experience_requirement: 'THREE_TO_FIVE_YEARS',
    work_mode: 'HYBRID',
    industry: 'INFORMATION_TECHNOLOGY',
    vacancies: 2,
    salary_type: 'NEGOTIABLE',
    salary_min: null,
    salary_max: null,
    salary_fixed: null,
    salary_currency: 'VND',
    skills: ['React'],
    status: 'APPROVED',
    created_at: '2026-10-01T00:00:00Z',
    updated_at: '2026-10-01T00:00:00Z',
  }

  const html = renderToStaticMarkup(createElement(RecruiterJobForm, {
    initialJob,
    submitting: false,
    serverError: null,
    submitLabel: 'Lưu thay đổi',
    onSubmit: async () => {},
    onCancel: () => {},
  }))

  assert.match(html, /value="FULL_TIME" selected=""/)
  assert.match(html, /value="HYBRID" selected=""/)
  assert.match(html, />Toàn thời gian</)
  assert.match(html, />Kết hợp</)
})
