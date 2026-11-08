import assert from 'node:assert/strict'
import { after, before, test } from 'node:test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createServer } from 'vite'

let server
let RecruiterJobForm
let jobTaxonomyService
let nextSelectionAfterIndustryChange
let titleAfterPositionChange
let omitUnchangedTaxonomy
let api

const MOCK_TAXONOMY = {
  industries: [
    {
      id: 'ind-it',
      code: 'IT_SOFTWARE',
      display_name: 'Công nghệ thông tin / Phần mềm',
      positions: [
        { id: 'pos-fe', code: 'FRONTEND_DEVELOPER', display_name: 'Lập trình viên Frontend' },
        { id: 'pos-be', code: 'BACKEND_DEVELOPER', display_name: 'Lập trình viên Backend' },
      ],
    },
    {
      id: 'ind-mkt',
      code: 'MARKETING',
      display_name: 'Marketing',
      positions: [
        { id: 'pos-seo', code: 'SEO_SPECIALIST', display_name: 'Chuyên viên SEO' },
      ],
    },
  ],
}

const BASE_JOB = {
  id: 'job-1',
  recruiter_id: 'recruiter-1',
  title: 'Kỹ sư phần mềm',
  company_name: 'GJob Corp',
  description: 'Mô tả công việc chi tiết.',
  requirements: 'Yêu cầu kỹ năng.',
  benefits: 'Quyền lợi hấp dẫn.',
  location: 'Hà Nội',
  employment_type: 'FULL_TIME',
  experience_level: null,
  level: 'SENIOR',
  experience_requirement: 'THREE_TO_FIVE_YEARS',
  work_mode: 'HYBRID',
  industry: 'INFORMATION_TECHNOLOGY',
  industry_group_id: null,
  job_position_id: null,
  vacancies: 1,
  salary_type: 'NEGOTIABLE',
  salary_min: null,
  salary_max: null,
  salary_fixed: null,
  salary_currency: 'VND',
  skills: ['React', 'TypeScript'],
  status: 'APPROVED',
  created_at: '2026-10-01T00:00:00Z',
  updated_at: '2026-10-01T00:00:00Z',
}

before(async () => {
  if (typeof globalThis.localStorage === 'undefined') {
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      value: { getItem: () => null, setItem() {}, removeItem() {} },
    })
  }
  server = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' })
  RecruiterJobForm = (await server.ssrLoadModule('/src/components/recruiter/RecruiterJobForm.tsx')).default
  jobTaxonomyService = (await server.ssrLoadModule('/src/services/jobTaxonomyService.ts')).jobTaxonomyService
  api = (await server.ssrLoadModule('/src/services/api.ts')).default
  const helpers = await server.ssrLoadModule('/src/components/recruiter/recruiterJobTaxonomy.ts')
  nextSelectionAfterIndustryChange = helpers.nextSelectionAfterIndustryChange
  titleAfterPositionChange = helpers.titleAfterPositionChange
  omitUnchangedTaxonomy = helpers.omitUnchangedTaxonomy
})

after(async () => {
  await server?.close()
})

test('1. Load active taxonomy: service hits /api/v1/job-taxonomy', async () => {
  const originalAdapter = api.defaults.adapter
  const calls = []
  api.defaults.adapter = async (config) => {
    calls.push(config)
    return { data: MOCK_TAXONOMY, status: 200, statusText: 'OK', headers: {}, config }
  }

  try {
    const data = await jobTaxonomyService.getActive()
    assert.equal(calls.length, 1)
    assert.equal(calls[0].url, '/api/v1/job-taxonomy')
    assert.equal(data.industries.length, 2)
  } finally {
    api.defaults.adapter = originalAdapter
  }
})

test('2. UI flow matches: Ngành nghề -> Vị trí -> Cấp bậc -> Kinh nghiệm -> Tiêu đề tin', () => {
  const html = renderToStaticMarkup(
    createElement(RecruiterJobForm, {
      initialJob: BASE_JOB,
      taxonomy: MOCK_TAXONOMY,
      submitting: false,
      serverError: null,
      submitLabel: 'Lưu thay đổi',
      onSubmit: async () => {},
      onCancel: () => {},
    })
  )

  const industryIdx = html.indexOf('Ngành nghề')
  const positionIdx = html.indexOf('Vị trí chuyên môn')
  const levelIdx = html.indexOf('Cấp bậc')
  const expIdx = html.indexOf('Kinh nghiệm')
  const titleIdx = html.indexOf('Tiêu đề công việc *')

  assert.ok(industryIdx > -1, 'Ngành nghề field rendered')
  assert.ok(positionIdx > industryIdx, 'Vị trí comes after Ngành nghề')
  assert.ok(levelIdx > positionIdx, 'Cấp bậc comes after Vị trí')
  assert.ok(expIdx > levelIdx, 'Kinh nghiệm comes after Cấp bậc')
  assert.ok(titleIdx > expIdx, 'Tiêu đề tin comes after Kinh nghiệm')
})

test('2b. Taxonomy fields use one searchable combobox instead of separate search and select controls', () => {
  const html = renderToStaticMarkup(
    createElement(RecruiterJobForm, {
      initialJob: { ...BASE_JOB, industry_group_id: 'ind-it', job_position_id: 'pos-fe' },
      taxonomy: MOCK_TAXONOMY,
      submitting: false,
      serverError: null,
      submitLabel: 'Lưu thay đổi',
      onSubmit: async () => {},
      onCancel: () => {},
    })
  )

  assert.equal((html.match(/role="combobox"/g) ?? []).length, 2)
  assert.equal((html.match(/type="search"/g) ?? []).length, 0, 'Search inputs only render inside an open combobox')
  assert.match(html, /Vị trí chuyên môn/)
  assert.doesNotMatch(html, /Vị trí chuyên môn thuộc ngành/)
})

test('3. Position select is disabled when no industry is selected', () => {
  const html = renderToStaticMarkup(
    createElement(RecruiterJobForm, {
      initialJob: { ...BASE_JOB, industry_group_id: null, job_position_id: null },
      taxonomy: MOCK_TAXONOMY,
      submitting: false,
      serverError: null,
      submitLabel: 'Đăng tin',
      onSubmit: async () => {},
      onCancel: () => {},
    })
  )

  assert.match(html, /Vui lòng chọn ngành nghề trước/)
})

test('4. Cascading: Only positions belonging to selected industry are rendered', () => {
  const html = renderToStaticMarkup(
    createElement(RecruiterJobForm, {
      initialJob: { ...BASE_JOB, industry_group_id: 'ind-it', job_position_id: null },
      taxonomy: MOCK_TAXONOMY,
      submitting: false,
      serverError: null,
      submitLabel: 'Đăng tin',
      onSubmit: async () => {},
      onCancel: () => {},
    })
  )

  // ind-it has FRONTEND and BACKEND, but NOT SEO
  assert.match(html, /Lập trình viên Frontend/)
  assert.match(html, /Lập trình viên Backend/)
  assert.doesNotMatch(html, /Chuyên viên SEO/)
})

test('5. Cascading logic: changing industry resets invalid position without modifying title or content', () => {
  // If moving from IT to Marketing, pos-fe is no longer valid
  const result1 = nextSelectionAfterIndustryChange(MOCK_TAXONOMY.industries, 'ind-mkt', 'pos-fe')
  assert.equal(result1.industryGroupId, 'ind-mkt')
  assert.equal(result1.jobPositionId, '', 'Position should be reset when switching to industry that does not contain it')

  // If moving within same industry, pos-fe remains valid
  const result2 = nextSelectionAfterIndustryChange(MOCK_TAXONOMY.industries, 'ind-it', 'pos-fe')
  assert.equal(result2.industryGroupId, 'ind-it')
  assert.equal(result2.jobPositionId, 'pos-fe', 'Position should be preserved if valid in the new industry')
})

test('6. Position selection: suggests title if title is empty, does NOT overwrite entered title', () => {
  const selectedPos = { id: 'pos-fe', code: 'FRONTEND_DEVELOPER', display_name: 'Lập trình viên Frontend' }

  // Case A: Title is empty -> auto-fills position name
  const titleA = titleAfterPositionChange('', selectedPos)
  assert.equal(titleA, 'Lập trình viên Frontend')

  const titleAWhitespace = titleAfterPositionChange('   ', selectedPos)
  assert.equal(titleAWhitespace, 'Lập trình viên Frontend')

  // Case B: Title already entered by user -> preserved exactly
  const titleB = titleAfterPositionChange('Senior React Developer', selectedPos)
  assert.equal(titleB, 'Senior React Developer', 'Existing user-entered title must NOT be overwritten')

  const nextPos = { id: 'pos-be', code: 'BACKEND_DEVELOPER', display_name: 'Lập trình viên Backend' }
  const titleC = titleAfterPositionChange('Lập trình viên Frontend', nextPos, true)
  assert.equal(titleC, 'Lập trình viên Backend', 'An auto-suggested title must follow the next position')

  const titleD = titleAfterPositionChange('Senior React Developer', nextPos, false)
  assert.equal(titleD, 'Senior React Developer', 'A manually edited title must remain unchanged')
})

test('7. Old job with null taxonomy can still be edited without errors', () => {
  const legacyJob = {
    ...BASE_JOB,
    industry_group_id: null,
    job_position_id: null,
    industry_group_taxonomy: null,
    job_position_taxonomy: null,
  }

  const html = renderToStaticMarkup(
    createElement(RecruiterJobForm, {
      initialJob: legacyJob,
      taxonomy: MOCK_TAXONOMY,
      submitting: false,
      serverError: null,
      submitLabel: 'Lưu thay đổi',
      onSubmit: async () => {},
      onCancel: () => {},
    })
  )

  assert.match(html, /Kỹ sư phần mềm/)
  assert.match(html, /GJob Corp/)
  assert.match(html, /Mô tả công việc chi tiết\./)
})

test('8. Inactive item on old job is displayed read-only with label "Đã tạm ẩn"', () => {
  const jobWithInactive = {
    ...BASE_JOB,
    industry_group_id: 'ind-old',
    job_position_id: 'pos-old',
    industry_group_taxonomy: {
      id: 'ind-old',
      code: 'OLD_IND',
      display_name: 'Ngành nghề cũ',
      is_active: false,
    },
    job_position_taxonomy: {
      id: 'pos-old',
      code: 'OLD_POS',
      display_name: 'Vị trí cũ',
      is_active: false,
    },
  }

  const html = renderToStaticMarkup(
    createElement(RecruiterJobForm, {
      initialJob: jobWithInactive,
      taxonomy: MOCK_TAXONOMY,
      submitting: false,
      serverError: null,
      submitLabel: 'Lưu thay đổi',
      onSubmit: async () => {},
      onCancel: () => {},
    })
  )

  assert.match(html, /Ngành nghề cũ/)
  assert.match(html, /Vị trí cũ/)
  assert.match(html, /Đã tạm ẩn/)
})

test('9. omitUnchangedTaxonomy prevents sending unmodified taxonomy on old job updates', () => {
  const original = {
    industry_group_id: 'ind-it',
    job_position_id: 'pos-fe',
  }

  // If user only updated title, taxonomy fields are untouched and omitted from payload
  const payload1 = {
    title: 'Senior Frontend Tech Lead',
    industry_group_id: 'ind-it',
    job_position_id: 'pos-fe',
  }
  const stripped1 = omitUnchangedTaxonomy(payload1, original)
  assert.equal(stripped1.title, 'Senior Frontend Tech Lead')
  assert.equal(stripped1.industry_group_id, undefined)
  assert.equal(stripped1.job_position_id, undefined)

  // If user updated position, only modified field is sent
  const payload2 = {
    title: 'Senior Backend Tech Lead',
    industry_group_id: 'ind-it',
    job_position_id: 'pos-be',
  }
  const stripped2 = omitUnchangedTaxonomy(payload2, original)
  assert.equal(stripped2.job_position_id, 'pos-be')
  assert.equal(stripped2.industry_group_id, undefined)
})

test('10. Matching safety: taxonomy change does not mutate JD description, requirements, or skills', () => {
  const originalDescription = 'Mô tả công việc giữ nguyên.'
  const originalRequirements = 'Yêu cầu kỹ năng giữ nguyên.'
  const originalSkills = ['React', 'Node.js']

  const job = {
    ...BASE_JOB,
    description: originalDescription,
    requirements: originalRequirements,
    skills: originalSkills,
  }

  const html = renderToStaticMarkup(
    createElement(RecruiterJobForm, {
      initialJob: job,
      taxonomy: MOCK_TAXONOMY,
      submitting: false,
      serverError: null,
      submitLabel: 'Lưu thay đổi',
      onSubmit: async () => {},
      onCancel: () => {},
    })
  )

  assert.match(html, /Mô tả công việc giữ nguyên\./)
  assert.match(html, /Yêu cầu kỹ năng giữ nguyên\./)
  assert.match(html, /React, Node\.js/)
})
