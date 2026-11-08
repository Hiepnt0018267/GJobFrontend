import { preview } from 'vite'
import { chromium } from 'playwright-core'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import fs from 'node:fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const outputDir = path.resolve(__dirname, '../evaluation/results/unified-saved-hub/screenshots')

fs.mkdirSync(outputDir, { recursive: true })

async function run() {
  console.log('Starting Vite preview server...')
  const previewServer = await preview({
    root: path.resolve(__dirname, '..'),
    preview: { port: 4175, host: '127.0.0.1' },
  })
  const serverUrl = 'http://127.0.0.1:4175'

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

    // Mock API routes for Saved Jobs and Followed Companies
    await page.route('**/api/v1/**', async (route) => {
      const url = route.request().url()

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

      if (url.includes('/api/v1/candidate/saved-jobs')) {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            items: [
              {
                id: 'sj1',
                job_id: 'j1',
                saved_at: '2026-11-04T10:00:00Z',
                job: {
                  id: 'j1',
                  title: 'Senior Frontend Engineer (React / TypeScript)',
                  company_name: 'GJob Technology',
                  company_logo_url: null,
                  location: 'Hà Nội',
                  salary_type: 'RANGE',
                  salary_min: 30000000,
                  salary_max: 50000000,
                  salary_currency: 'VND',
                  employment_type: 'FULL_TIME',
                  level: 'SENIOR',
                  work_mode: 'HYBRID',
                  status: 'APPROVED',
                  created_at: '2026-11-01T08:00:00Z',
                },
              },
              {
                id: 'sj2',
                job_id: 'j2',
                saved_at: '2026-11-05T14:20:00Z',
                job: {
                  id: 'j2',
                  title: 'AI Full-Stack Developer',
                  company_name: 'VNG Corporation',
                  company_logo_url: null,
                  location: 'TP. Hồ Chí Minh',
                  salary_type: 'NEGOTIABLE',
                  employment_type: 'FULL_TIME',
                  level: 'MIDDLE',
                  work_mode: 'HYBRID',
                  status: 'APPROVED',
                  created_at: '2026-11-02T09:30:00Z',
                },
              },
            ],
            total: 2,
            page: 1,
            page_size: 8,
            total_pages: 1,
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
                  id: 'c1',
                  name: 'VNG Corporation',
                  logo_url: null,
                  description: 'Tập đoàn công nghệ hàng đầu Việt Nam.',
                  website: 'https://vng.com.vn',
                  industry: 'Công nghệ thông tin',
                  address: 'Z06 Đường số 13, Quận 7, TP.HCM',
                  size: 3500,
                },
                follower_count: 1420,
                active_job_count: 12,
                followed_at: '2026-10-15T08:00:00Z',
              },
              {
                company: {
                  id: 'c2',
                  name: 'FPT Software',
                  logo_url: null,
                  description: 'Tập đoàn phần mềm toàn cầu.',
                  website: 'https://fpt-software.com',
                  industry: 'Công nghệ thông tin & Viễn thông',
                  address: 'Tòa nhà FPT, Cầu Giấy, Hà Nội',
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

      if (url.includes('/api/v1/notifications')) {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ unread_count: 0, items: [], total: 0 }),
        })
      }

      return route.fulfill({ status: 200, body: '{}' })
    })

    await page.addInitScript(() => {
      localStorage.setItem('gjob_token', 'fake-jwt-token')
      localStorage.setItem('token', 'fake-jwt-token')
      localStorage.setItem('user', JSON.stringify({
        id: '11111111-2222-3333-4444-555555555555',
        email: 'candidate.demo@example.com',
        full_name: 'Nguyễn Văn A',
        role: 'CANDIDATE',
        is_active: true,
      }))
    })

    // 1. Saved Hub - Jobs Tab
    await page.goto(`${serverUrl}/candidate/saved?tab=jobs`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(1000)
    await page.screenshot({
      path: path.join(outputDir, `saved-hub-jobs-${vp.name}.png`),
      fullPage: true,
    })

    // 2. Saved Hub - Companies Tab
    await page.goto(`${serverUrl}/candidate/saved?tab=companies`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(1000)
    await page.screenshot({
      path: path.join(outputDir, `saved-hub-companies-${vp.name}.png`),
      fullPage: true,
    })

    await context.close()
  }

  // 3. Test Legacy Redirects on desktop
  const redirectContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  })
  const redirectPage = await redirectContext.newPage()

  await redirectPage.route('**/api/v1/**', async (route) => {
    const url = route.request().url()
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
    return route.fulfill({ status: 200, body: JSON.stringify({ items: [], total: 0, page: 1, page_size: 8, total_pages: 0 }) })
  })

  await redirectPage.addInitScript(() => {
    localStorage.setItem('gjob_token', 'fake-jwt-token')
    localStorage.setItem('token', 'fake-jwt-token')
    localStorage.setItem('user', JSON.stringify({
      id: '11111111-2222-3333-4444-555555555555',
      email: 'candidate.demo@example.com',
      full_name: 'Nguyễn Văn A',
      role: 'CANDIDATE',
      is_active: true,
    }))
  })

  // Navigate to legacy /candidate/saved-jobs
  await redirectPage.goto(`${serverUrl}/candidate/saved-jobs`, { waitUntil: 'networkidle' })
  await redirectPage.waitForTimeout(800)
  console.log('Legacy saved-jobs redirected to:', redirectPage.url())
  await redirectPage.screenshot({
    path: path.join(outputDir, `legacy-redirect-saved-jobs.png`),
    fullPage: true,
  })

  // Navigate to legacy /candidate/followed-companies
  await redirectPage.goto(`${serverUrl}/candidate/followed-companies`, { waitUntil: 'networkidle' })
  await redirectPage.waitForTimeout(800)
  console.log('Legacy followed-companies redirected to:', redirectPage.url())
  await redirectPage.screenshot({
    path: path.join(outputDir, `legacy-redirect-followed-companies.png`),
    fullPage: true,
  })

  await redirectContext.close()
  await browser.close()
  previewServer.httpServer.close()
  console.log('Saved Hub Visual QA screenshots captured in:', outputDir)
}

run().catch((err) => {
  console.error('Visual QA error:', err)
  process.exit(1)
})
