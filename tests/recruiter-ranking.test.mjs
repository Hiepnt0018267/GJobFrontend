import assert from 'node:assert/strict'
import { after, before, test } from 'node:test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { createServer } from 'vite'

let server, ranking, List, Filters, service, api, RankingDialog, RankingResults, Page, dialogFocus
before(async () => {
  server = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' })
  ranking = await server.ssrLoadModule('/src/utils/recruiterRanking.ts')
  List = (await server.ssrLoadModule('/src/components/recruiter/RecruiterApplicationList.tsx')).default
  Filters = (await server.ssrLoadModule('/src/components/recruiter/RecruiterApplicationFilters.tsx')).default
  service = (await server.ssrLoadModule('/src/services/recruiterApplicationService.ts')).recruiterApplicationService
  api = (await server.ssrLoadModule('/src/services/api.ts')).default
  RankingDialog = (await server.ssrLoadModule('/src/components/recruiter/RecruiterRankingDialog.tsx')).default
  RankingResults = (await server.ssrLoadModule('/src/components/recruiter/RecruiterRankingResults.tsx')).default
  Page = (await server.ssrLoadModule('/src/pages/recruiter/RecruiterApplicationsPage.tsx')).default
  dialogFocus = await server.ssrLoadModule('/src/utils/dialogFocus.ts')
})
after(async () => { await server?.close() })

const token = 'a'.repeat(32)
function application(id, ranking_status, ai_rank = null, score = null) {
  return { id, candidate_id: id, job_id: 'job', cv_id: id, status: 'SUBMITTED',
    created_at: '2026-10-07T01:00:00Z', updated_at: '2026-10-07T01:00:00Z',
    candidate: { id, full_name: `Ứng viên mẫu ${id}`, email: `sample${id}@example.com`, avatar_url: null },
    job: { id: 'job', title: 'Backend Engineer', company_name: 'Công ty thử nghiệm', status: 'APPROVED' },
    cv: { id, title: 'CV thử nghiệm', source_type: 'BUILDER', template: { name: 'CV Builder' }, mime_type: null, file_size: null },
    ranking_status, ai_rank, semantic_match_score: score }
}
const renderList = (items, showRanking) => renderToStaticMarkup(createElement(MemoryRouter, null,
  createElement(List, { applications: items, returnTo: '/recruiter/applications?sort=ai_match', showRanking })))

test('default request preserves legacy sorting and sends no AI options', () => {
  const q = ranking.recruiterRankingQuery(new URLSearchParams('page=2&status=SUBMITTED'), 10)
  assert.equal(q.sort, 'newest'); assert.equal(q.page, 2)
  assert.equal('sort' in q.request, false); assert.equal('ranking_snapshot' in q.request, false)
})

test('AI request uses exact sort and normalizes unsupported deep pages', () => {
  const q = ranking.recruiterRankingQuery(new URLSearchParams('sort=ai_match&page=3&search=Python'), 10)
  assert.equal(q.request.sort, 'ai_match'); assert.equal(q.request.page, 1); assert.equal(q.needsReset, true)
  assert.equal(q.request.search, 'Python')
})

test('page navigation preserves filters and the backend snapshot', () => {
  const current = new URLSearchParams('sort=ai_match&search=Python&status=SUBMITTED&job_id=job')
  const next = ranking.updateRecruiterListQuery(current, { page: '2' }, false, token)
  const q = ranking.recruiterRankingQuery(next, 10)
  assert.equal(q.request.page, 2); assert.equal(q.request.ranking_snapshot, token)
  assert.equal(q.request.search, 'Python'); assert.equal(q.request.status, 'SUBMITTED'); assert.equal(q.request.job_id, 'job')
  assert.equal(current.has('ranking_snapshot'), false)
})

test('page-one history replacement retains the same snapshot on browser Back', () => {
  const initial = new URLSearchParams('sort=ai_match&status=SUBMITTED')
  const pageOneEntry = ranking.updateRecruiterListQuery(initial, {}, false, token)
  const pageTwoEntry = ranking.updateRecruiterListQuery(pageOneEntry, { page: '2' }, false, token)
  const history = [pageOneEntry, pageTwoEntry]
  history.pop()
  const back = ranking.recruiterRankingQuery(history[0], 10)
  assert.equal(back.request.page, 1); assert.equal(back.request.ranking_snapshot, token)
  assert.equal(back.request.status, 'SUBMITTED')
})

test('sort, status, search and job changes clear page and snapshot', () => {
  for (const updates of [{ sort: null }, { sort: 'ai_match' }, { status: 'REVIEWING' }, { search: 'SQL' }, { job_id: 'other' }]) {
    const next = ranking.updateRecruiterListQuery(new URLSearchParams(`sort=ai_match&page=3&ranking_snapshot=${token}`), updates)
    assert.equal(next.has('page'), false); assert.equal(next.has('ranking_snapshot'), false)
  }
})

test('invalid or default-mode snapshot is never sent to backend', () => {
  for (const query of ['sort=ai_match&page=2&ranking_snapshot=broken', `ranking_snapshot=${token}`]) {
    assert.equal(ranking.recruiterRankingQuery(new URLSearchParams(query), 10).request.ranking_snapshot, undefined)
  }
})

test('all availability states render, null/zero/raw cosine never become percentages', () => {
  const items = [application('1', 'ranked', 2, .73), application('2', 'pending'), application('3', 'unavailable'), application('4', 'error'), application('5', 'ranked', 3, 0)]
  const html = renderList(items, true)
  for (const id of ['1','2','3','4','5']) assert.ok(html.includes(`Ứng viên mẫu ${id}`))
  for (const text of ['Xếp hạng AI #2', 'Đã xếp hạng', 'Đang chờ xếp hạng', 'Chưa có dữ liệu AI', 'AI tạm thời không khả dụng']) assert.ok(html.includes(text))
  assert.equal(html.includes('73%'), false); assert.equal(html.includes('0 điểm'), false)
  assert.ok(html.includes('/recruiter/applications/2'))
})

test('render order is backend order, and default mode hides AI metadata', () => {
  const items = [application('3', 'pending'), application('1', 'ranked', 1, .9), application('2', 'ranked', 2, .1)]
  const html = renderList(items, true)
  assert.ok(html.indexOf('Ứng viên mẫu 3') < html.indexOf('Ứng viên mẫu 1'))
  assert.ok(html.indexOf('Ứng viên mẫu 1') < html.indexOf('Ứng viên mẫu 2'))
  assert.equal(renderList(items, false).includes('Xếp hạng AI'), false)
})

test('legacy response with absent ranking fields remains visible', () => {
  const item = application('1', undefined)
  delete item.ai_rank; delete item.ranking_status; delete item.semantic_match_score
  assert.ok(renderList([item], false).includes('Ứng viên mẫu 1'))
  assert.ok(renderList([item], true).includes('Chưa có thông tin xếp hạng'))
})

test('filters no longer expose a simultaneous AI dropdown', () => {
  const html = renderToStaticMarkup(createElement(Filters, { search: '', status: 'ALL', jobs: [], jobsLoading: false,
    showJobFilter: false, showRankingSort: true, sort: 'newest', onSearchChange() {}, onStatusChange() {}, onJobChange() {}, onSortChange() {} }))
  assert.equal(html.includes('Sắp xếp ứng viên'), false); assert.equal(html.includes('AI match'), false)
})

test('global directory ignores AI deep links even when filtered by job; ordinary filters/page survive', () => {
  const params = new URLSearchParams(`job_id=job&sort=ai_match&ranking_snapshot=${token}&ai_top_n=1&page=2&status=SUBMITTED&search=Python`)
  const q = ranking.recruiterRankingQuery(params, 10, false)
  assert.equal(q.ai, false); assert.equal(q.sort, 'newest'); assert.equal(q.page, 2)
  assert.equal(q.snapshot, undefined); assert.equal(q.request.sort, undefined)
  assert.equal(q.request.ranking_snapshot, undefined); assert.equal(q.needsReset, true)
  assert.equal(q.request.job_id, 'job'); assert.equal(q.request.search, 'Python')
  const normalized = ranking.recruiterListScopeQuery(params, false)
  for (const key of ['sort', 'ranking_snapshot', 'ai_top_n']) assert.equal(normalized.has(key), false)
  assert.equal(normalized.get('page'), '2'); assert.equal(normalized.get('status'), 'SUBMITTED')
  assert.equal(params.get('sort'), 'ai_match')
})

test('global filters do not expose AI sort; job-scoped modal confirmation enables it', () => {
  const props = { search: '', status: 'ALL', jobs: [], jobsLoading: false, showJobFilter: true,
    showRankingSort: false, sort: 'newest', onSearchChange() {}, onStatusChange() {}, onJobChange() {}, onSortChange() {} }
  const globalHtml = renderToStaticMarkup(createElement(Filters, props))
  assert.equal(globalHtml.includes('AI match'), false); assert.equal(globalHtml.includes('Sắp xếp ứng viên'), false)
  assert.ok(globalHtml.includes('Lọc theo tin tuyển dụng'))
  const initial = ranking.recruiterRankingQuery(new URLSearchParams(), 10, true)
  assert.equal(initial.ai, false)
  const selected = ranking.updateRecruiterListQuery(new URLSearchParams(), { sort: 'ai_match' })
  assert.equal(ranking.recruiterRankingQuery(selected, 10, true).request.sort, 'ai_match')
  assert.equal(ranking.rankingActionQuery(new URLSearchParams(), 'all').get('ranking_mode'), 'all')
})

test('job-scoped page has explicit action button but does not request AI by default', () => {
  const renderPage = (path) => renderToStaticMarkup(createElement(MemoryRouter, { initialEntries: [path] },
    createElement(Routes, null, createElement(Route, { path: '/recruiter/jobs/:jobId/applications', element: createElement(Page) }),
      createElement(Route, { path: '/recruiter/applications', element: createElement(Page) }))))
  assert.ok(renderPage('/recruiter/jobs/job/applications').includes('Xếp hạng AI'))
  assert.equal(renderPage('/recruiter/applications').includes('Xếp hạng AI'), false)
  assert.equal(ranking.recruiterRankingQuery(new URLSearchParams(), 10, true).ai, false)
})

test('dialog options/default10 and invalid N validation', () => {
  const html = renderToStaticMarkup(createElement(RankingDialog, { initialMode: 'top_n', onClose() {}, onConfirm() {} }))
  for (const text of ['Xếp hạng ứng viên bằng AI', 'Xếp hạng tất cả ứng viên', 'Lấy Top N ứng viên', 'Hủy', 'Xem kết quả', 'value="10"']) assert.ok(html.includes(text))
  assert.ok(html.includes('aria-labelledby="ranking-dialog-title"'))
  for (const value of ['0', '-1', '1.5', '', 'NaN', 'Infinity']) assert.equal(ranking.validRankingTopN(value), false)
  assert.equal(ranking.validRankingTopN('10'), true)
  const invalid = renderToStaticMarkup(createElement(RankingDialog, { initialMode: 'top_n', initialTopN: 0, onClose() {}, onConfirm() {} }))
  assert.ok(invalid.includes('disabled=""'))
})

test('dialog Tab/ShiftTab wrap at boundaries, ordinary keys do not intercept', () => {
  const original = globalThis.document
  const focused = []; let prevented = 0
  const first = { focus: () => focused.push('first') }, last = { focus: () => focused.push('last') }
  const base = { currentTarget: { querySelectorAll: () => [first,last] }, preventDefault: () => prevented++ }
  try {
    globalThis.document = { activeElement: last }
    dialogFocus.trapDialogFocus({ ...base, key: 'Tab', shiftKey: false })
    globalThis.document.activeElement = first
    dialogFocus.trapDialogFocus({ ...base, key: 'Tab', shiftKey: true })
    dialogFocus.trapDialogFocus({ ...base, key: 'Enter', shiftKey: false })
    assert.deepEqual(focused, ['first','last']); assert.equal(prevented,2)
  } finally { if (original === undefined) delete globalThis.document; else globalThis.document = original }
})

test('all/topN action query, mode changes, filter changes and return normal', () => {
  const old = new URLSearchParams(`sort=ai_match&ranking_mode=top_n&top_n=10&page=3&ranking_snapshot=${token}&status=SUBMITTED`)
  const top = ranking.rankingActionQuery(old, 'top_n', 5)
  const q = ranking.recruiterRankingQuery(top, 10, true)
  assert.equal(q.request.ranking_mode, 'top_n'); assert.equal(q.request.top_n, 5)
  assert.equal(q.page, 1); assert.equal(q.snapshot, undefined)
  const all = ranking.rankingActionQuery(old, 'all')
  assert.equal(ranking.recruiterRankingQuery(all, 10, true).request.top_n, undefined)
  const filter = ranking.updateRecruiterListQuery(old, { search: 'Python' })
  assert.equal(filter.get('top_n'), '10'); assert.equal(filter.get('ranking_mode'), 'top_n')
  assert.equal(filter.has('page'), false); assert.equal(filter.has('ranking_snapshot'), false)
  const backEntry = ranking.updateRecruiterListQuery(top, { page: '2' }, false, token)
  assert.equal(ranking.recruiterRankingQuery(backEntry, 10, true).request.ranking_snapshot, token)
  assert.equal(backEntry.get('top_n'), '5')
  const normal = ranking.updateRecruiterListQuery(old, { sort: null })
  for (const key of ['sort', 'ranking_mode', 'top_n', 'ranking_snapshot', 'page']) assert.equal(normal.has(key), false)
  assert.equal(normal.get('status'), 'SUBMITTED')
})

test('result groups retain all missing states, no padding/fake ranks/client sorting', () => {
  const items = [application('3', 'ranked', 1, .9), application('1', 'ranked', 2, .8), application('2', 'ranked', 3, .7),
    application('4', 'pending'), application('5', 'unavailable'), application('6', 'error')]
  const data = { items, ranking_mode: 'top_n', requested_top_n: 10, ranked_available_count: 3, returned_ranked_count: 3, unranked_count: 3 }
  const html = renderToStaticMarkup(createElement(MemoryRouter, null, createElement(RankingResults, { data, returnTo: '/recruiter/jobs/job/applications?sort=ai_match' })))
  assert.ok(html.includes('Top 10 theo xếp hạng AI')); assert.ok(html.includes('Chưa thể xếp hạng (3)'))
  assert.equal(html.includes('phù hợp nhất'), false)
  assert.ok(html.indexOf('Ứng viên mẫu 3') < html.indexOf('Ứng viên mẫu 1'))
  for (const id of ['1','2','3','4','5','6']) assert.ok(html.includes(`Ứng viên mẫu ${id}`))
  assert.equal(html.includes('Xếp hạng AI #4'), false); assert.equal(html.includes('90%'), false)
  const eight = { ...data, items: [...Array.from({length:8}, (_,i)=>application(String(i+10),'ranked',i+1,.8)), ...Array.from({length:4}, (_,i)=>application(String(i+20),'pending'))], returned_ranked_count:8, ranked_available_count:8, unranked_count:4 }
  const fewerHtml=renderToStaticMarkup(createElement(MemoryRouter,null,createElement(RankingResults,{data:eight,returnTo:'/'})))
  assert.ok(fewerHtml.includes('Chưa thể xếp hạng (4)'));assert.equal(fewerHtml.includes('Xếp hạng AI #9'),false)
})

test('both API endpoints send exact ranking params, preserve token and do GET only', async () => {
  const original = api.get; const calls = []
  api.get = async (path, config) => { calls.push({ path, params: config.params }); return { data: { items: [], ranking_snapshot: token } } }
  try {
    const params = ranking.recruiterRankingQuery(new URLSearchParams(`sort=ai_match&page=2&ranking_snapshot=${token}`), 10).request
    assert.equal((await service.getApplications(params)).ranking_snapshot, token)
    await service.getApplicationsByJob('job', params)
    assert.equal(calls[0].path, '/api/v1/recruiters/applications')
    assert.equal(calls[1].path, '/api/v1/recruiters/jobs/job/applications')
    assert.ok(calls.every(c => c.params.sort === 'ai_match' && c.params.ranking_snapshot === token && c.params.page === 2))
  } finally { api.get = original }
})
