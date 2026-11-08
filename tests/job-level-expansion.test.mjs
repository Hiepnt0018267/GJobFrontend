import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { after, before, test } from 'node:test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createServer } from 'vite'


let server
let jobTypes
let jobDisplay
let JobFilters


before(async () => {
  server = await createServer({
    server: { middlewareMode: true },
    appType: 'custom',
    logLevel: 'error',
  })
  jobTypes = await server.ssrLoadModule('/src/types/job.ts')
  jobDisplay = await server.ssrLoadModule('/src/utils/jobDisplay.ts')
  JobFilters = (await server.ssrLoadModule('/src/components/job/JobFilters.tsx')).default
})


after(async () => { await server?.close() })


test('leadership job levels expose stable Vietnamese labels', () => {
  assert.deepEqual(
    jobTypes.JOB_LEVELS,
    ['INTERN', 'JUNIOR', 'STAFF', 'SENIOR', 'LEAD', 'MANAGER', 'DIRECTOR', 'EXECUTIVE'],
  )
  assert.equal(jobDisplay.levelLabel('DIRECTOR'), 'Giám đốc')
  assert.equal(jobDisplay.levelLabel('EXECUTIVE'), 'Lãnh đạo cấp cao')
})


test('job level filter renders director and executive choices', () => {
  const html = renderToStaticMarkup(createElement(JobFilters, {
    values: {
      location: '',
      workMode: '',
      salary: '',
      industry: '',
      level: '',
      experienceRequirement: '',
      employmentType: '',
      sort: 'newest',
    },
    onChange() {},
    onClear() {},
  }))

  assert.match(html, /value="DIRECTOR">Giám đốc</)
  assert.match(html, /value="EXECUTIVE">Lãnh đạo cấp cao</)
})


test('public job detail formats Job.level instead of the legacy experience level', () => {
  const source = readFileSync(
    new URL('../src/pages/jobs/JobDetailPage.tsx', import.meta.url),
    'utf8',
  )
  assert.match(source, /levelLabel\(job\.level\)/)
  assert.doesNotMatch(source, /experienceLabel\(job\.experience_level\)/)
})
