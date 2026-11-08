import assert from 'node:assert/strict'
import { after, before, test } from 'node:test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createServer } from 'vite'

let server
let RecruiterJobForm
let filterAllowedLevels
let nextLevelAfterPositionChange

const ALL_LEVELS = [
  ['INTERN', 'Thực tập sinh'],
  ['JUNIOR', 'Mới tốt nghiệp / Junior'],
  ['STAFF', 'Chuyên viên'],
  ['SENIOR', 'Chuyên viên cao cấp / Senior'],
  ['LEAD', 'Trưởng nhóm / Lead'],
  ['MANAGER', 'Quản lý'],
  ['DIRECTOR', 'Giám đốc'],
  ['EXECUTIVE', 'Lãnh đạo cấp cao'],
]

const MOCK_TAXONOMY = {
  industries: [
    {
      id: 'ind-it',
      code: 'IT_SOFTWARE',
      display_name: 'Công nghệ thông tin',
      positions: [
        {
          id: 'pos-intern',
          code: 'MARKETING_INTERN',
          display_name: 'Thực tập sinh Marketing',
          allowed_levels: ['INTERN'],
          default_level: 'INTERN',
        },
        {
          id: 'pos-director',
          code: 'SALES_DIRECTOR',
          display_name: 'Giám đốc kinh doanh',
          allowed_levels: ['DIRECTOR', 'EXECUTIVE'],
          default_level: 'DIRECTOR',
        },
        {
          id: 'pos-general',
          code: 'GENERAL_DEV',
          display_name: 'Lập trình viên nói chung',
          allowed_levels: [],
          default_level: null,
        },
      ],
    },
  ],
}

before(async () => {
  if (typeof globalThis.localStorage === 'undefined') {
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      value: { getItem: () => null, setItem() {}, removeItem() {} },
    })
  }
  server = await createServer({
    server: { middlewareMode: true },
    appType: 'custom',
    logLevel: 'error',
  })
  RecruiterJobForm = (
    await server.ssrLoadModule('/src/components/recruiter/RecruiterJobForm.tsx')
  ).default
  const helpers = await server.ssrLoadModule(
    '/src/components/recruiter/recruiterJobTaxonomy.ts'
  )
  filterAllowedLevels = helpers.filterAllowedLevels
  nextLevelAfterPositionChange = helpers.nextLevelAfterPositionChange
})

after(async () => {
  await server?.close()
})

test('filterAllowedLevels returns all levels when policy is empty', () => {
  const noPolicy = filterAllowedLevels(ALL_LEVELS, [])
  assert.equal(noPolicy.length, 8)
  assert.deepEqual(
    noPolicy.map(([k]) => k),
    ['INTERN', 'JUNIOR', 'STAFF', 'SENIOR', 'LEAD', 'MANAGER', 'DIRECTOR', 'EXECUTIVE']
  )

  const undefinedPolicy = filterAllowedLevels(ALL_LEVELS, undefined)
  assert.equal(undefinedPolicy.length, 8)
})

test('filterAllowedLevels filters levels when policy exists', () => {
  const filtered = filterAllowedLevels(ALL_LEVELS, ['INTERN', 'JUNIOR'])
  assert.equal(filtered.length, 2)
  assert.deepEqual(
    filtered.map(([k]) => k),
    ['INTERN', 'JUNIOR']
  )
})

test('nextLevelAfterPositionChange auto-suggests default_level when field is empty', () => {
  const position = {
    id: 'pos-intern',
    code: 'MARKETING_INTERN',
    display_name: 'Thực tập sinh Marketing',
    allowed_levels: ['INTERN'],
    default_level: 'INTERN',
  }
  const result = nextLevelAfterPositionChange(position, '')
  assert.equal(result, 'INTERN')
})

test('nextLevelAfterPositionChange does not overwrite existing valid choice', () => {
  const position = {
    id: 'pos-director',
    code: 'SALES_DIRECTOR',
    display_name: 'Giám đốc kinh doanh',
    allowed_levels: ['DIRECTOR', 'EXECUTIVE'],
    default_level: 'DIRECTOR',
  }
  // User had already selected EXECUTIVE; default_level is DIRECTOR. It must NOT overwrite EXECUTIVE!
  const result = nextLevelAfterPositionChange(position, 'EXECUTIVE')
  assert.equal(result, 'EXECUTIVE')
})

test('nextLevelAfterPositionChange resets invalid level to default_level', () => {
  const position = {
    id: 'pos-intern',
    code: 'MARKETING_INTERN',
    display_name: 'Thực tập sinh Marketing',
    allowed_levels: ['INTERN'],
    default_level: 'INTERN',
  }
  // User previously chose SENIOR, which is NOT allowed for Intern. Must reset to default_level.
  const result = nextLevelAfterPositionChange(position, 'SENIOR')
  assert.equal(result, 'INTERN')
})

test('nextLevelAfterPositionChange keeps user level when position has no policy', () => {
  const position = {
    id: 'pos-general',
    code: 'GENERAL_DEV',
    display_name: 'Lập trình viên nói chung',
    allowed_levels: [],
    default_level: null,
  }
  const result = nextLevelAfterPositionChange(position, 'SENIOR')
  assert.equal(result, 'SENIOR')
})

test('RecruiterJobForm only displays allowed levels when position has policy', () => {
  const jobWithInternPolicy = {
    id: 'job-1',
    recruiter_id: 'recruiter-1',
    title: 'Thực tập sinh Marketing',
    company_name: 'GJob Corp',
    description: 'Chi tiết tuyển thực tập sinh.',
    requirements: 'Không yêu cầu kinh nghiệm.',
    benefits: null,
    location: 'Hà Nội',
    employment_type: 'INTERNSHIP',
    experience_level: null,
    level: 'INTERN',
    experience_requirement: 'NO_EXPERIENCE',
    work_mode: 'ONSITE',
    industry: 'MARKETING_ADVERTISING',
    industry_group_id: 'ind-it',
    job_position_id: 'pos-intern',
    vacancies: 2,
    salary_type: 'NEGOTIABLE',
    salary_min: null,
    salary_max: null,
    salary_fixed: null,
    salary_currency: 'VND',
    skills: ['Marketing'],
    status: 'APPROVED',
    created_at: '2026-10-01T00:00:00Z',
    updated_at: '2026-10-01T00:00:00Z',
  }

  const html = renderToStaticMarkup(
    createElement(RecruiterJobForm, {
      initialJob: jobWithInternPolicy,
      submitting: false,
      serverError: null,
      submitLabel: 'Lưu thay đổi',
      onSubmit: async () => {},
      onCancel: () => {},
      taxonomy: MOCK_TAXONOMY,
    })
  )

  // Must contain INTERN option
  assert.match(html, /value="INTERN"/)
  // Must NOT contain SENIOR or EXECUTIVE options in the level select
  assert.doesNotMatch(html, /<option value="SENIOR"/)
  assert.doesNotMatch(html, /<option value="EXECUTIVE"/)
  assert.doesNotMatch(html, /<option value="DIRECTOR"/)
})

test('RecruiterJobForm displays all 8 levels when position has no policy', () => {
  const jobWithoutPolicy = {
    id: 'job-2',
    recruiter_id: 'recruiter-1',
    title: 'Lập trình viên nói chung',
    company_name: 'GJob Corp',
    description: 'Chi tiết tuyển dụng.',
    requirements: 'Kinh nghiệm lập trình.',
    benefits: null,
    location: 'Hà Nội',
    employment_type: 'FULL_TIME',
    experience_level: null,
    level: 'STAFF',
    experience_requirement: 'ONE_TO_THREE_YEARS',
    work_mode: 'HYBRID',
    industry: 'INFORMATION_TECHNOLOGY',
    industry_group_id: 'ind-it',
    job_position_id: 'pos-general',
    vacancies: 1,
    salary_type: 'NEGOTIABLE',
    salary_min: null,
    salary_max: null,
    salary_fixed: null,
    salary_currency: 'VND',
    skills: ['Python'],
    status: 'APPROVED',
    created_at: '2026-10-01T00:00:00Z',
    updated_at: '2026-10-01T00:00:00Z',
  }

  const html = renderToStaticMarkup(
    createElement(RecruiterJobForm, {
      initialJob: jobWithoutPolicy,
      submitting: false,
      serverError: null,
      submitLabel: 'Lưu thay đổi',
      onSubmit: async () => {},
      onCancel: () => {},
      taxonomy: MOCK_TAXONOMY,
    })
  )

  // Must contain all levels
  assert.match(html, /<option value="INTERN"/)
  assert.match(html, /<option value="JUNIOR"/)
  assert.match(html, /<option value="STAFF"/)
  assert.match(html, /<option value="SENIOR"/)
  assert.match(html, /<option value="LEAD"/)
  assert.match(html, /<option value="MANAGER"/)
  assert.match(html, /<option value="DIRECTOR"/)
  assert.match(html, /<option value="EXECUTIVE"/)
})

