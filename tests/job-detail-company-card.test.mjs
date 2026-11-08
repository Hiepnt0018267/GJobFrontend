import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { after, before, test } from 'node:test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { createServer } from 'vite'

let server
let CompanyInformationCard

const detailSource = readFileSync(new URL('../src/pages/jobs/JobDetailPage.tsx', import.meta.url), 'utf8')
const cardSource = readFileSync(new URL('../src/components/jobs/CompanyInformationCard.tsx', import.meta.url), 'utf8')

before(async () => {
  server = await createServer({
    server: { middlewareMode: true },
    appType: 'custom',
  })
  CompanyInformationCard = (await server.ssrLoadModule('/src/components/jobs/CompanyInformationCard.tsx')).default
})

after(async () => {
  if (server) await server.close()
})

test('1. Job with company.id links logo, name, and "Xem trang công ty" button to /companies/{company.id}', () => {
  const company = {
    id: 'comp-123-abc',
    name: 'Tập đoàn Công nghệ GJob',
    logo_url: 'https://example.com/logo.png',
    description: 'Công ty hàng đầu về công nghệ tuyển dụng.',
    website: 'https://gjob.vn',
    industry: 'Công nghệ thông tin',
    address: 'Hà Nội, Việt Nam',
    size: 250,
  }

  const html = renderToStaticMarkup(
    createElement(
      MemoryRouter,
      null,
      createElement(CompanyInformationCard, { company, fallbackName: 'Tên dự phòng' }),
    ),
  )

  // Must link to /companies/comp-123-abc
  assert.ok(html.includes('href="/companies/comp-123-abc"'))
  // Logo has link with accessible aria-label
  assert.match(html, /aria-label="Xem trang công ty Tập đoàn Công nghệ GJob"/)
  // Company name is inside link
  assert.match(html, /<a[^>]*href="\/companies\/comp-123-abc"[^>]*>Tập đoàn Công nghệ GJob<\/a>/)
  // "Xem trang công ty" button exists
  assert.ok(html.includes('Xem trang công ty'))
  // Renders company details
  assert.ok(html.includes('Công nghệ thông tin'))
  assert.ok(html.includes('Hà Nội, Việt Nam'))
  assert.ok(html.includes('250 nhân sự'))
  assert.ok(html.includes('https://gjob.vn') || html.includes('gjob.vn'))
  assert.ok(html.includes('Công ty hàng đầu về công nghệ tuyển dụng.'))
})

test('2. Legacy job with company = null displays fallbackName and omits company links and button', () => {
  const html = renderToStaticMarkup(
    createElement(
      MemoryRouter,
      null,
      createElement(CompanyInformationCard, { company: null, fallbackName: 'Công ty Cổ phần Alpha Legacy' }),
    ),
  )

  // Fallback name is rendered as plain text
  assert.ok(html.includes('Công ty Cổ phần Alpha Legacy'))
  // No "Xem trang công ty" button
  assert.equal(html.includes('Xem trang công ty'), false)
  // No broken company links
  assert.equal(html.includes('/companies/'), false)
  assert.equal(html.includes('undefined'), false)
  assert.equal(html.includes('null'), false)
  // Fallback notice when no details
  assert.ok(html.includes('Nhà tuyển dụng chưa cập nhật thêm thông tin doanh nghiệp.'))
})

test('3. CompanyInformationCard renders gracefully when optional fields (logo, website, description, details) are missing', () => {
  const minimalCompany = {
    id: 'comp-minimal-456',
    name: 'Công ty TNHH Tối Giản',
    logo_url: null,
    description: null,
    website: null,
    industry: null,
    address: null,
    size: null,
  }

  const html = renderToStaticMarkup(
    createElement(
      MemoryRouter,
      null,
      createElement(CompanyInformationCard, { company: minimalCompany, fallbackName: 'Tên phụ' }),
    ),
  )

  // Still links to /companies/comp-minimal-456
  assert.ok(html.includes('href="/companies/comp-minimal-456"'))
  assert.ok(html.includes('Công ty TNHH Tối Giản'))
  assert.ok(html.includes('Xem trang công ty'))
  // No broken image or website tag
  assert.equal(html.includes('<img'), false)
  assert.equal(html.includes('target="_blank"'), false)
})

test('4. JobDetailPage preserves Apply, Save Job, JD sections, breadcrumb and routing', () => {
  assert.match(detailSource, /<JobApplyAction job=\{job\} \/>/)
  assert.match(detailSource, /<SavedJobButton jobId=\{job\.id\} jobStatus=\{job\.status\} \/>/)
  assert.match(detailSource, /<CompanyInformationCard company=\{job\.company\} fallbackName=\{job\.company_name\} \/>/)
  assert.match(detailSource, /Mô tả công việc/)
  assert.match(detailSource, /Yêu cầu ứng viên/)
  assert.match(detailSource, /Quyền lợi & Đãi ngộ/)
  assert.match(detailSource, /aria-label="Breadcrumb"/)
  assert.match(detailSource, /id="job-apply"/)
})

test('5. Company card is responsive and adheres to GJob teal branding', () => {
  assert.match(cardSource, /bg-teal-50/)
  assert.match(cardSource, /#49BBBD/)
  assert.match(cardSource, /rounded-2xl/)
  assert.match(cardSource, /Xem trang công ty/)
})

