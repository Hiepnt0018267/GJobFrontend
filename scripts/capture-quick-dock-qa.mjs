import { preview } from 'vite'
import { chromium } from 'playwright-core'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import fs from 'node:fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const outputDir = path.resolve(__dirname, '../evaluation/results/floating-quick-dock/screenshots')

fs.mkdirSync(outputDir, { recursive: true })

async function run() {
  console.log('Starting Vite preview server on port 4176...')
  const previewServer = await preview({
    root: path.resolve(__dirname, '..'),
    preview: { port: 4176, host: '127.0.0.1' },
  })
  const serverUrl = 'http://127.0.0.1:4176'

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

    // Mock API routes
    await page.route('**/api/v1/**', async (route) => {
      const url = route.request().url()

      if (url.includes('/api/v1/auth/me')) {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'candidate-123',
            email: 'candidate@gjob.vn',
            full_name: 'Trần Ứng Viên',
            role: 'CANDIDATE',
            is_active: true,
          }),
        })
      }

      if (url.includes('/api/v1/candidate/saved-jobs')) {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ items: [{ id: '1' }, { id: '2' }, { id: '3' }], total: 3, page: 1, page_size: 1, total_pages: 3 }),
        })
      }

      if (url.includes('/api/v1/candidate/followed-companies')) {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ items: [{ id: 'c1' }, { id: 'c2' }], total: 2, page: 1, page_size: 1, total_pages: 2 }),
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
      localStorage.setItem('gjob_token', 'candidate-token')
      localStorage.setItem('user', JSON.stringify({
        id: 'candidate-123',
        email: 'candidate@gjob.vn',
        full_name: 'Trần Ứng Viên',
        role: 'CANDIDATE',
        is_active: true,
      }))
    })

    // Navigate to /jobs to see the floating quick dock
    await page.goto(`${serverUrl}/jobs`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(600)

    // Scroll down > 300px to trigger the Scroll-to-top button
    await page.evaluate(() => window.scrollTo(0, 600))
    await page.waitForTimeout(600)

    await page.screenshot({
      path: path.join(outputDir, `quick-dock-${vp.name}-scrolled.png`),
      fullPage: false,
    })

    await context.close()
  }

  // Check Recruiter mode (dock should be absent)
  const recruiterContext = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const recruiterPage = await recruiterContext.newPage()
  await recruiterPage.route('**/api/v1/**', async (route) => {
    const url = route.request().url()
    if (url.includes('/api/v1/auth/me')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'recruiter-123',
          email: 'recruiter@company.com',
          full_name: 'HR Manager',
          role: 'RECRUITER',
          is_active: true,
        }),
      })
    }
    return route.fulfill({ status: 200, body: '{}' })
  })
  await recruiterPage.addInitScript(() => {
    localStorage.setItem('gjob_token', 'recruiter-token')
    localStorage.setItem('user', JSON.stringify({
      id: 'recruiter-123',
      email: 'recruiter@company.com',
      full_name: 'HR Manager',
      role: 'RECRUITER',
      is_active: true,
    }))
  })
  await recruiterPage.goto(`${serverUrl}/jobs`, { waitUntil: 'networkidle' })
  await recruiterPage.waitForTimeout(600)
  const dockExists = await recruiterPage.$('aside[aria-label="Thanh công cụ nhanh"]')
  console.log('Dock exists for Recruiter?', dockExists !== null)
  await recruiterPage.screenshot({
    path: path.join(outputDir, 'quick-dock-recruiter-hidden.png'),
    fullPage: false,
  })
  await recruiterContext.close()

  await browser.close()
  previewServer.httpServer.close()
  console.log('Floating Quick Dock Visual QA screenshots captured in:', outputDir)
}

run().catch((err) => {
  console.error('Visual QA error:', err)
  process.exit(1)
})

