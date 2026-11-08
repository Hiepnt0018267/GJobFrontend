import { preview } from 'vite'
import { chromium } from 'playwright-core'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const outputDir = path.resolve(__dirname, '../../GJobBackend/evaluation/results/company-follow-and-notifications/screenshots')

async function run() {
  console.log('Starting Vite preview server...')
  const previewServer = await preview({
    root: path.resolve(__dirname, '..'),
    preview: { port: 4173, host: '127.0.0.1' },
  })
  const serverUrl = 'http://127.0.0.1:4173'

  console.log('Launching Chrome...')
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
  })

  const viewports = [
    { name: 'desktop-1440', width: 1440, height: 900, isMobile: false },
    { name: 'desktop-1366', width: 1366, height: 768, isMobile: false },
    { name: 'mobile-390', width: 390, height: 844, isMobile: true, hasTouch: true },
  ]

  for (const vp of viewports) {
    console.log(`Capturing viewport: ${vp.name}...`)
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      isMobile: vp.isMobile,
      hasTouch: vp.hasTouch,
    })

    const page = await context.newPage()

    // Mock API routes to display realistic synthetic data
    await page.route('**/api/v1/**', async (route) => {
      const url = route.request().url()
      const method = route.request().method()

      if (url.includes('/api/v1/auth/me')) {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: '11111111-2222-3333-4444-555555555555',
            email: 'candidate.demo@example.com',
            full_name: 'Nguyễn Văn A',
            role: 'CANDIDATE',
            is_active: true,
          }),
        })
      }

      if (url.includes('/api/v1/candidate/followed-companies')) {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            items: [
              {
                company: {
                  id: 'c1111111-1111-1111-1111-111111111111',
                  name: 'VNG Corporation',
                  logo_url: null,
                  description: 'Công ty công nghệ hàng đầu Việt Nam.',
                  website: 'https://vng.com.vn',
                  industry: 'Công nghệ thông tin',
                  address: 'Z06 Đường số 13, Tân Thuận Đông, Quận 7, TP.HCM',
                  size: 3500,
                },
                follower_count: 1420,
                active_job_count: 12,
                followed_at: '2026-10-15T08:00:00Z',
              },
              {
                company: {
                  id: 'c2222222-2222-2222-2222-222222222222',
                  name: 'FPT Software',
                  logo_url: null,
                  description: 'Tập đoàn chuyển đổi số và phát triển phần mềm toàn cầu.',
                  website: 'https://fpt-software.com',
                  industry: 'Công nghệ thông tin & Viễn thông',
                  address: 'Tòa nhà FPT Cầu Giấy, Duy Tân, Hà Nội',
                  size: 28000,
                },
                follower_count: 5890,
                active_job_count: 45,
                followed_at: '2026-10-20T14:30:00Z',
              },
            ],
            total: 2,
            page: 1,
            page_size: 8,
            total_pages: 1,
          }),
        })
      }

      if (url.includes('/api/v1/companies/c1111111-1111-1111-1111-111111111111/jobs')) {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            items: [
              {
                id: 'j1111111-1111-1111-1111-111111111111',
                title: 'Senior Backend Engineer (Python / FastAPI)',
                company_name: 'VNG Corporation',
                location: 'TP. Hồ Chí Minh',
                salary_type: 'RANGE',
                salary_min: 35000000,
                salary_max: 55000000,
                salary_currency: 'VND',
                employment_type: 'FULL_TIME',
                level: 'SENIOR',
                work_mode: 'HYBRID',
                created_at: '2026-11-01T09:00:00Z',
              },
              {
                id: 'j2222222-2222-2222-2222-222222222222',
                title: 'Data Platform Architect',
                company_name: 'VNG Corporation',
                location: 'Hà Nội & TP.HCM',
                salary_type: 'NEGOTIABLE',
                employment_type: 'FULL_TIME',
                level: 'LEAD',
                work_mode: 'HYBRID',
                created_at: '2026-11-02T10:00:00Z',
              },
            ],
            total: 2,
            page: 1,
            page_size: 6,
            total_pages: 1,
          }),
        })
      }

      if (url.includes('/api/v1/companies/c1111111-1111-1111-1111-111111111111')) {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'c1111111-1111-1111-1111-111111111111',
            name: 'VNG Corporation',
            logo_url: null,
            description: 'VNG là doanh nghiệp công nghệ hàng đầu tại Việt Nam và Đông Nam Á.',
            website: 'https://vng.com.vn',
            industry: 'Công nghệ thông tin',
            address: 'Z06 Đường số 13, Tân Thuận Đông, Quận 7, TP.HCM',
            size: 3500,
            active_job_count: 12,
            follower_count: 1420,
          }),
        })
      }

      if (url.includes('/api/v1/notifications/unread-count')) {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ unread_count: 2 }),
        })
      }

      if (url.includes('/api/v1/notifications')) {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            items: [
              {
                id: 'n1111111-1111-1111-1111-111111111111',
                type: 'COMPANY_NEW_JOB',
                title: 'VNG Corporation vừa có việc làm mới',
                message: 'VNG Corporation đang tuyển Senior Backend Engineer (Python / FastAPI). Xem thông tin và ứng tuyển ngay.',
                read_at: null,
                is_read: false,
                target_type: 'JOB',
                target_id: 'j1111111-1111-1111-1111-111111111111',
                created_at: '2026-11-06T08:30:00Z',
              },
              {
                id: 'n2222222-2222-2222-2222-222222222222',
                type: 'APPLICATION_STATUS_CHANGED',
                title: 'Hồ sơ đã vào danh sách ưu tiên',
                message: 'Hồ sơ của bạn đã được đưa vào danh sách ưu tiên cho vị trí Tech Lead.',
                read_at: null,
                is_read: false,
                target_type: 'APPLICATION',
                target_id: 'a1111111-1111-1111-1111-111111111111',
                created_at: '2026-11-05T15:20:00Z',
              },
            ],
            total: 2,
            page: 1,
            page_size: 20,
            total_pages: 1,
          }),
        })
      }

      return route.fulfill({ status: 200, body: '{}' })
    })

    // Setup candidate authentication state in localStorage before navigation
    await page.addInitScript(() => {
      localStorage.setItem('token', 'fake-jwt-token')
      localStorage.setItem('user', JSON.stringify({
        id: '11111111-2222-3333-4444-555555555555',
        email: 'candidate.demo@example.com',
        full_name: 'Nguyễn Văn A',
        role: 'CANDIDATE',
        is_active: true,
      }))
    })

    // 1. Followed Companies Page
    await page.goto(`${serverUrl}/candidate/followed-companies`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(1000)
    await page.screenshot({
      path: path.join(outputDir, `followed-companies-${vp.name}.png`),
      fullPage: true,
    })

    // 2. Public Company Page
    await page.goto(`${serverUrl}/companies/c1111111-1111-1111-1111-111111111111`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(1000)
    await page.screenshot({
      path: path.join(outputDir, `public-company-${vp.name}.png`),
      fullPage: true,
    })

    // 3. Notification Center Page
    await page.goto(`${serverUrl}/candidate/notifications`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(1000)
    await page.screenshot({
      path: path.join(outputDir, `notifications-${vp.name}.png`),
      fullPage: true,
    })

    await context.close()
  }

  await browser.close()
  previewServer.httpServer.close()
  console.log('Visual QA screenshots generated successfully in:', outputDir)
}

run().catch((err) => {
  console.error('Error generating Visual QA screenshots:', err)
  process.exit(1)
})

