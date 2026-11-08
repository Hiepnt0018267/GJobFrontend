import assert from 'node:assert/strict'
import { after, before, test } from 'node:test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createServer } from 'vite'

let server
let JobFilters
let candidateJobTaxonomy

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
      display_name: 'Marketing / Truyền thông',
      positions: [
        { id: 'pos-seo', code: 'SEO_SPECIALIST', display_name: 'Chuyên viên SEO' },
      ],
    },
  ],
}

before(async () => {
  server = await createServer({
    server: { middlewareMode: true },
    appType: 'custom',
    logLevel: 'error',
  })
  JobFilters = (await server.ssrLoadModule('/src/components/job/JobFilters.tsx')).default
  candidateJobTaxonomy = await server.ssrLoadModule('/src/utils/candidateJobTaxonomy.ts')
})

after(async () => {
  await server?.close()
})

test('1. JobFilters renders Ngành nghề and Vị trí selects', () => {
  const html = renderToStaticMarkup(
    createElement(JobFilters, {
      values: {
        employmentType: '',
        industry: '',
        industryGroup: '',
        jobPosition: '',
        experienceRequirement: '',
        level: '',
        workMode: '',
        salary: '',
        sort: 'newest',
      },
      taxonomy: MOCK_TAXONOMY,
      onChange() {},
      onClear() {},
    })
  )

  assert.match(html, /aria-label="Lọc theo ngành nghề"/)
  assert.match(html, /aria-label="Lọc theo vị trí"/)
  assert.match(html, /Công nghệ thông tin \/ Phần mềm/)
  assert.match(html, /Marketing \/ Truyền thông/)
})

test('2. When industry is not selected, position dropdown shows all positions', () => {
  const html = renderToStaticMarkup(
    createElement(JobFilters, {
      values: {
        employmentType: '',
        industry: '',
        industryGroup: '',
        jobPosition: '',
        experienceRequirement: '',
        level: '',
        workMode: '',
        salary: '',
        sort: 'newest',
      },
      taxonomy: MOCK_TAXONOMY,
      onChange() {},
      onClear() {},
    })
  )

  assert.match(html, /Lập trình viên Frontend/)
  assert.match(html, /Lập trình viên Backend/)
  assert.match(html, /Chuyên viên SEO/)
})

test('3. When industry is selected, position dropdown is scoped to that industry', () => {
  const html = renderToStaticMarkup(
    createElement(JobFilters, {
      values: {
        employmentType: '',
        industry: '',
        industryGroup: 'IT_SOFTWARE',
        jobPosition: '',
        experienceRequirement: '',
        level: '',
        workMode: '',
        salary: '',
        sort: 'newest',
      },
      taxonomy: MOCK_TAXONOMY,
      onChange() {},
      onClear() {},
    })
  )

  assert.match(html, /Lập trình viên Frontend/)
  assert.match(html, /Lập trình viên Backend/)
  assert.doesNotMatch(html, /Chuyên viên SEO/)
})

test('4. nextTaxonomyOnIndustryChange: switching to unrelated industry resets position', () => {
  const result = candidateJobTaxonomy.nextTaxonomyOnIndustryChange(
    MOCK_TAXONOMY.industries,
    'MARKETING',
    'FRONTEND_DEVELOPER'
  )
  assert.equal(result.industryGroup, 'MARKETING')
  assert.equal(result.jobPosition, '', 'Position should be cleared because it does not belong to MARKETING')
})

test('5. nextTaxonomyOnIndustryChange: clearing industry clears dependent position', () => {
  const result = candidateJobTaxonomy.nextTaxonomyOnIndustryChange(
    MOCK_TAXONOMY.industries,
    '',
    'FRONTEND_DEVELOPER'
  )
  assert.equal(result.industryGroup, '')
  assert.equal(result.jobPosition, '', 'Clearing industry should clear dependent position')
})

test('6. nextTaxonomyOnIndustryChange: switching within same industry retains position', () => {
  const result = candidateJobTaxonomy.nextTaxonomyOnIndustryChange(
    MOCK_TAXONOMY.industries,
    'IT_SOFTWARE',
    'FRONTEND_DEVELOPER'
  )
  assert.equal(result.industryGroup, 'IT_SOFTWARE')
  assert.equal(result.jobPosition, 'FRONTEND_DEVELOPER', 'Position should be retained')
})

test('7. Active count badge displays correct number when industry and position are filtered', () => {
  const html = renderToStaticMarkup(
    createElement(JobFilters, {
      values: {
        employmentType: '',
        industry: '',
        industryGroup: 'IT_SOFTWARE',
        jobPosition: 'FRONTEND_DEVELOPER',
        experienceRequirement: '',
        level: 'SENIOR',
        workMode: '',
        salary: '',
        sort: 'newest',
      },
      taxonomy: MOCK_TAXONOMY,
      onChange() {},
      onClear() {},
    })
  )

  // 3 filters active: industryGroup, jobPosition, level
  assert.match(html, />3</)
})

test('8. Backward compatibility: renders without taxonomy or with legacy industry values without error', () => {
  const html = renderToStaticMarkup(
    createElement(JobFilters, {
      values: {
        employmentType: 'FULL_TIME',
        industry: 'INFORMATION_TECHNOLOGY',
        experienceRequirement: '',
        level: '',
        workMode: '',
        salary: '',
        sort: 'newest',
      },
      onChange() {},
      onClear() {},
    })
  )

  assert.match(html, /Tất cả ngành nghề/)
  assert.match(html, /Tất cả vị trí/)
})

