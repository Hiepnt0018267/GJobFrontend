import assert from 'node:assert/strict'
import { after, before, test } from 'node:test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { createServer } from 'vite'

let server, recommendation, service, applicationService, api, navigation, JobCard, Page, CvAvailability, AuthContext, ToastContext

before(async () => {
  server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom', logLevel: 'error' })
  recommendation = await server.ssrLoadModule('/src/utils/jobRecommendation.ts')
  service = (await server.ssrLoadModule('/src/services/jobRecommendationService.ts')).jobRecommendationService
  applicationService = (await server.ssrLoadModule('/src/services/applicationService.ts')).applicationService
  api = (await server.ssrLoadModule('/src/services/api.ts')).default
  navigation = await server.ssrLoadModule('/src/config/candidateNavigation.ts')
  JobCard = (await server.ssrLoadModule('/src/components/job/JobCard.tsx')).default
  const pageModule = await server.ssrLoadModule('/src/pages/candidate/CandidateJobRecommendationsPage.tsx')
  Page = pageModule.default
  CvAvailability = pageModule.RecommendationCvAvailability
  AuthContext = (await server.ssrLoadModule('/src/contexts/AuthContext.tsx')).AuthContext
  ToastContext = (await server.ssrLoadModule('/src/contexts/toastContextValue.ts')).ToastContext
})

after(async () => { await server?.close() })

const snapshot = 'b'.repeat(32)

function job(id, title = `Việc làm ${id}`) {
  return {
    id,
    title,
    description: 'Mô tả công việc',
    company_name: 'Công ty thử nghiệm',
    company_logo_url: null,
    location: 'Hà Nội',
    salary_min: 20_000_000,
    salary_max: 30_000_000,
    employment_type: 'FULL_TIME',
    experience_level: 'MID',
    level: 'STAFF',
    experience_requirement: 'ONE_TO_THREE_YEARS',
    work_mode: 'HYBRID',
    industry: 'INFORMATION_TECHNOLOGY',
    vacancies: 2,
    salary_type: 'RANGE',
    salary_fixed: null,
    salary_currency: 'VND',
    skills: ['Python', 'PostgreSQL'],
    requirements: 'Yêu cầu',
    benefits: null,
    status: 'APPROVED',
    created_at: '2026-10-01T00:00:00Z',
    updated_at: '2026-10-01T00:00:00Z',
  }
}

const auth = {
  user: { id: 'candidate', email: 'candidate@example.com', full_name: 'Ứng viên', role: 'CANDIDATE', is_active: true, created_at: '2026-01-01T00:00:00Z' },
  token: 'test', isAuthenticated: true, loading: false,
  async login() {}, async register() { return { message: '', user: this.user } },
  logout() {}, async updateUser() {}, updateAuthenticatedUser() {},
}
const toast = { showToast() {}, success() {}, error() {}, info() {} }

function renderCards(items) {
  return renderToStaticMarkup(createElement(MemoryRouter, null,
    createElement(AuthContext.Provider, { value: auth },
      createElement(ToastContext.Provider, { value: toast },
        createElement('div', null, ...items.map((item) => createElement(JobCard, {
          key: item.id,
          job: item,
          recommendation: { rank: item.recommendation_rank, status: item.recommendation_status, reasons: item.reasons },
          returnTo: '/candidate/job-recommendations?page=1',
        })))))))
}

test('public query maps CV, filters and paging without exposing a snapshot', () => {
  const query = recommendation.candidateRecommendationQuery(new URLSearchParams(
    'cv_id=cv-1&search=Python&location=Hà+Nội&industry=INFORMATION_TECHNOLOGY&salary=20000000-30000000&page=2&page_size=18&ranking_snapshot=forbidden',
  ))
  assert.equal(query.cvId, 'cv-1')
  assert.equal(query.page, 2)
  assert.equal(query.pageSize, 18)
  assert.equal(query.request.cv_id, 'cv-1')
  assert.equal(query.request.search, 'Python')
  assert.equal(query.request.salary_min, 20_000_000)
  assert.equal(query.request.salary_max, 30_000_000)
  assert.equal(query.request.ranking_snapshot, undefined)
  assert.equal(query.needsPageReset, true)
})

test('filter and CV changes reset page while ordinary page navigation preserves public filters', () => {
  const current = new URLSearchParams('cv_id=cv-1&search=Python&page=3&page_size=18')
  const filtered = recommendation.updateCandidateRecommendationQuery(current, { location: 'Đà Nẵng' })
  assert.equal(filtered.has('page'), false)
  assert.equal(filtered.get('cv_id'), 'cv-1')
  assert.equal(filtered.get('search'), 'Python')
  const paged = recommendation.updateCandidateRecommendationQuery(filtered, { page: '2' }, false)
  assert.equal(paged.get('page'), '2')
  assert.equal(paged.get('location'), 'Đà Nẵng')
})

test('page identity is stable across pages but changes with CV or filters', () => {
  const first = recommendation.candidateRecommendationQuery(new URLSearchParams('cv_id=cv-1&search=Python&page=1'))
  const second = recommendation.candidateRecommendationQuery(new URLSearchParams('cv_id=cv-1&search=Python&page=2'))
  const otherCv = recommendation.candidateRecommendationQuery(new URLSearchParams('cv_id=cv-2&search=Python&page=2'))
  assert.equal(first.identity, second.identity)
  assert.notEqual(first.identity, otherCv.identity)
})

test('only stale snapshot errors are eligible for the one-shot recovery path', () => {
  const apiError = (status, detail) => ({ isAxiosError: true, response: { status, data: { detail } } })
  const stale = apiError(409, 'expired')
  const missingLaterSnapshot = apiError(422, 'Recommendation pages after page 1 require ranking_snapshot.')
  assert.equal(recommendation.shouldRecoverRecommendationSnapshot(stale, 'cv-1', null), true)
  assert.equal(recommendation.shouldRecoverRecommendationSnapshot(stale, 'cv-1', 'cv-1'), false)
  assert.equal(recommendation.shouldRecoverRecommendationSnapshot(missingLaterSnapshot, 'cv-1', null), true)
  assert.equal(recommendation.shouldRecoverRecommendationSnapshot(apiError(422, 'cv_id is invalid'), 'cv-1', null), false)
  assert.equal(recommendation.shouldRecoverRecommendationSnapshot(apiError(503, 'cache unavailable'), 'cv-1', null), false)
})

test('CV, filter, page-size or generation mismatch discards the in-memory snapshot', () => {
  const session = { identity: 'cv_id=cv-1&page_size=9', generation: 2, token: snapshot }
  assert.equal(recommendation.compatibleRecommendationSnapshot(session, session.identity, 2), snapshot)
  assert.equal(recommendation.compatibleRecommendationSnapshot(session, 'cv_id=cv-2&page_size=9', 2), undefined)
  assert.equal(recommendation.compatibleRecommendationSnapshot(session, 'cv_id=cv-1&page_size=18', 2), undefined)
  assert.equal(recommendation.compatibleRecommendationSnapshot(session, session.identity, 3), undefined)
})

test('late CV A response cannot replace the newer CV B response', async () => {
  let releaseA, releaseB
  const requestA = new Promise((resolve) => { releaseA = resolve })
  const requestB = new Promise((resolve) => { releaseB = resolve })
  let activeIdentity = 'cv-b|0|1|2'
  let visible = null
  const commit = (identity, value) => {
    if (recommendation.isCurrentRecommendationRequest(activeIdentity, identity)) visible = value
  }
  const settledA = requestA.then((value) => commit('cv-a|0|1|1', value))
  const settledB = requestB.then((value) => commit('cv-b|0|1|2', value))
  releaseB('CV B')
  await settledB
  assert.equal(visible, 'CV B')
  releaseA('CV A')
  await settledA
  assert.equal(visible, 'CV B')
  activeIdentity = 'cv-c|0|1|3'
  assert.equal(recommendation.isCurrentRecommendationRequest(activeIdentity, 'cv-b|0|1|2'), false)
})

test('service uses the frozen cache-only endpoint and forwards the internal snapshot', async () => {
  const original = api.get
  const calls = []
  api.get = async (path, config) => {
    calls.push({ path, config })
    return { data: { items: [], page: 2, page_size: 9, total: 0, total_pages: 0, ranking_snapshot: snapshot } }
  }
  try {
    await service.getRecommendations({ cv_id: 'cv-1', page: 2, page_size: 9, ranking_snapshot: snapshot })
    assert.equal(calls.length, 1)
    assert.equal(calls[0].path, '/api/v1/candidate/jobs/recommendations')
    assert.equal(calls[0].config.params.ranking_snapshot, snapshot)
    assert.equal(calls[0].config.params.page, 2)
  } finally {
    api.get = original
  }
})

test('service omits cv_id for backend auto-selection and sends an explicit selection unchanged', async () => {
  const original = api.get
  const calls = []
  api.get = async (_path, config) => {
    calls.push(config.params)
    return { data: { items: [], page: 1, page_size: 9, total: 0, total_pages: 0, ranking_snapshot: snapshot } }
  }
  try {
    await service.getRecommendations({ page: 1, page_size: 9 })
    await service.getRecommendations({ cv_id: 'cv-selected', page: 1, page_size: 9 })
    assert.equal('cv_id' in calls[0], false)
    assert.equal(calls[1].cv_id, 'cv-selected')
  } finally {
    api.get = original
  }
})

test('server order, all availability states and semantic reasons render without scores', () => {
  const items = [
    { ...job('3', 'Việc làm đứng trước'), recommendation_rank: 1, recommendation_status: 'ranked', reasons: [{ code: 'shared_skill', message: 'Có kỹ năng Python liên quan', evidence: ['Python'] }] },
    { ...job('1', 'Việc làm đang chuẩn bị'), recommendation_rank: null, recommendation_status: 'pending', reasons: [] },
    { ...job('2', 'Việc làm chưa sẵn sàng'), recommendation_rank: null, recommendation_status: 'unavailable', reasons: [] },
    { ...job('4', 'Việc làm lỗi tín hiệu'), recommendation_rank: null, recommendation_status: 'error', reasons: [] },
  ]
  const html = renderCards(items)
  assert.ok(html.indexOf('Việc làm đứng trước') < html.indexOf('Việc làm đang chuẩn bị'))
  for (const text of ['Xếp hạng #1', 'Được xếp hạng theo CV', 'Đang chuẩn bị dữ liệu xếp hạng', 'Chưa thể xếp hạng', 'Chưa thể xếp hạng lúc này', 'Có kỹ năng Python liên quan']) assert.ok(html.includes(text))
  for (const forbidden of ['90%', 'cosine', 'semantic_match_score', 'Ollama', 'BGE', 'Gemini']) assert.equal(html.includes(forbidden), false)
  assert.ok(html.includes('/jobs/3'))
})

test('reason rendering accepts zero, one, three and long backend messages without inventing fallback copy', () => {
  const reasons = [
    { code: 'shared_skill', message: 'Có kỹ năng Python liên quan', evidence: ['Python'] },
    { code: 'shared_skill', message: 'Có công nghệ PostgreSQL liên quan', evidence: ['PostgreSQL'] },
    { code: 'shared_skill', message: 'Thông tin nghề nghiệp trong CV có một chuỗi mô tả dài để kiểm tra khả năng xuống dòng tự nhiên trên thẻ việc làm ở màn hình hẹp.', evidence: ['Backend'] },
  ]
  const zero = renderCards([{ ...job('0'), recommendation_rank: 1, recommendation_status: 'ranked', reasons: [] }])
  assert.equal(zero.includes('Thông tin liên quan trong CV'), false)
  const one = renderCards([{ ...job('1'), recommendation_rank: 1, recommendation_status: 'ranked', reasons: reasons.slice(0, 1) }])
  assert.ok(one.includes(reasons[0].message))
  const three = renderCards([{ ...job('3'), recommendation_rank: 1, recommendation_status: 'ranked', reasons }])
  for (const reason of reasons) assert.ok(three.includes(reason.message))
  assert.equal(three.includes('làm tăng điểm'), false)
})

test('explicit unavailable CV and no usable CV have distinct backend-authoritative guidance', () => {
  const base = {
    items: [], page: 1, page_size: 9, total: 0, total_pages: 0,
    ranking_snapshot: snapshot, candidate_signal_status: 'unavailable',
    ranked_count: 0, pending_count: 0, unavailable_count: 0, error_count: 0,
  }
  const explicitHtml = renderToStaticMarkup(createElement(MemoryRouter, null,
    createElement(CvAvailability, { data: { ...base, selected_cv_id: 'cv-1' }, explicitCvId: 'cv-1' })))
  assert.ok(explicitHtml.includes('CV này chưa sẵn sàng để tạo gợi ý việc làm'))
  const automaticHtml = renderToStaticMarkup(createElement(MemoryRouter, null,
    createElement(CvAvailability, { data: { ...base, selected_cv_id: null }, explicitCvId: null })))
  assert.ok(automaticHtml.includes('Bạn cần một CV hợp lệ để nhận gợi ý việc làm'))
  assert.ok(explicitHtml.includes('/candidate/cvs'))
})

test('404 copy is ownership-neutral and unrelated errors do not leak provider details', () => {
  const apiError = (status, detail) => ({ isAxiosError: true, response: { status, data: { detail } } })
  assert.equal(recommendation.recommendationErrorMessage(apiError(404, 'foreign CV')), 'Không tìm thấy CV để sử dụng cho gợi ý việc làm.')
  assert.equal(recommendation.recommendationErrorMessage(apiError(503, 'Ollama cache key secret')), 'Danh sách gợi ý tạm thời chưa sẵn sàng. Bạn vẫn có thể xem tất cả việc làm.')
})

test('successful Apply emits the shared refresh signal used to invalidate recommendation sessions', async () => {
  const originalAdapter = api.defaults.adapter
  const originalWindow = globalThis.window
  const originalLocalStorage = globalThis.localStorage
  const eventTarget = new EventTarget()
  let refreshEvents = 0
  eventTarget.addEventListener('gjob:data-refresh', () => { refreshEvents += 1 })
  globalThis.window = eventTarget
  globalThis.localStorage = { getItem: () => null, setItem() {}, removeItem() {}, clear() {}, key: () => null, length: 0 }
  api.defaults.adapter = async (config) => ({
    data: { id: 'application-1', job_id: 'job-1', candidate_id: 'candidate', cv_id: 'cv-1', status: 'SUBMITTED', created_at: '2026-10-11T00:00:00Z', updated_at: '2026-10-11T00:00:00Z' },
    status: 201, statusText: 'Created', headers: {}, config,
  })
  try {
    const response = await applicationService.submitApplication('job-1', { cv_id: 'cv-1' })
    assert.equal(response.status, 'SUBMITTED')
    assert.equal(refreshEvents, 1)
  } finally {
    api.defaults.adapter = originalAdapter
    if (originalWindow === undefined) delete globalThis.window
    else globalThis.window = originalWindow
    if (originalLocalStorage === undefined) delete globalThis.localStorage
    else globalThis.localStorage = originalLocalStorage
  }
})

test('page presents an explicit CV selector and no client-side ranking claim', () => {
  const html = renderToStaticMarkup(createElement(MemoryRouter, { initialEntries: ['/candidate/job-recommendations?cv_id=cv-1'] },
    createElement(Routes, null, createElement(Route, { path: '/candidate/job-recommendations', element: createElement(Page) }))))
  assert.ok(html.includes('Gợi ý việc làm theo CV'))
  assert.ok(html.includes('id="recommendation-cv"'))
  assert.ok(html.includes('Ở chế độ tự động, hệ thống chọn một CV đang sẵn sàng'))
  assert.equal(html.includes('phù hợp nhất'), false)
  assert.equal(html.includes('AI chấm điểm'), false)
})

test('recommendation entry belongs to Tools, not jobs or account navigation', () => {
  const route = '/candidate/job-recommendations'
  assert.equal(navigation.candidateNavigationGroups.flatMap((group) => group.items).some((item) => item.to === route), false)
  assert.equal(navigation.candidateAccountItems.some((item) => item.to === route), false)
  assert.equal(navigation.candidateToolsGroup.label, 'Công cụ')
  assert.equal(navigation.candidateToolsGroup.items.filter((item) => item.to === route).length, 1)
})
