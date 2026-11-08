import { preview } from 'vite'
import { chromium } from 'playwright-core'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import fs from 'node:fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const outputDir = path.resolve(__dirname, '../evaluation/results/floating-dock-qa/screenshots')

fs.mkdirSync(outputDir, { recursive: true })

async function run() {
  const PORT = 4195
  console.log(`Starting Vite preview server on port ${PORT}...`)
  const previewServer = await preview({
    root: path.resolve(__dirname, '..'),
    preview: { port: PORT, host: '127.0.0.1' },
  })
  const serverUrl = previewServer.resolvedUrls.local[0]

  console.log('Launching Chrome...')
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
  })

  const initCandidateSession = async (page) => {
    await page.addInitScript(() => {
      localStorage.setItem('gjob_token', 'mock-candidate-token')
      localStorage.setItem('user', JSON.stringify({
        id: 'candidate-qa-123',
        email: 'candidate@gjob.vn',
        full_name: 'Nguyễn Ứng Viên',
        role: 'CANDIDATE',
        is_active: true,
      }))
    })
  }

  const initAdminSession = async (page) => {
    await page.addInitScript(() => {
      localStorage.setItem('gjob_token', 'mock-admin-token')
      localStorage.setItem('user', JSON.stringify({
        id: 'admin-qa-123',
        email: 'admin@gjob.vn',
        full_name: 'Quản Trị Viên',
        role: 'ADMIN',
        is_active: true,
      }))
    })
  }

  // --- 1. Desktop 1440x900: Saved Hub ---
  console.log('Capturing saved-hub-desktop-1440.png...')
  const ctx1440 = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page1440 = await ctx1440.newPage()
  await initCandidateSession(page1440)
  await page1440.goto(`${serverUrl}candidate/saved?tab=jobs`, { waitUntil: 'networkidle' })
  await page1440.waitForTimeout(600)
  await page1440.screenshot({ path: path.join(outputDir, 'saved-hub-desktop-1440.png') })

  // --- 2. Desktop 1366x768: Saved Hub ---
  console.log('Capturing saved-hub-desktop-1366.png...')
  const ctx1366 = await browser.newContext({ viewport: { width: 1366, height: 768 } })
  const page1366 = await ctx1366.newPage()
  await initCandidateSession(page1366)
  await page1366.goto(`${serverUrl}candidate/saved?tab=jobs`, { waitUntil: 'networkidle' })
  await page1366.waitForTimeout(600)
  await page1366.screenshot({ path: path.join(outputDir, 'saved-hub-desktop-1366.png') })

  // --- 3. Tablet 768x1024: Saved Hub ---
  console.log('Capturing saved-hub-tablet-768.png...')
  const ctx768 = await browser.newContext({ viewport: { width: 768, height: 1024 } })
  const page768 = await ctx768.newPage()
  await initCandidateSession(page768)
  await page768.goto(`${serverUrl}candidate/saved?tab=jobs`, { waitUntil: 'networkidle' })
  await page768.waitForTimeout(600)
  await page768.screenshot({ path: path.join(outputDir, 'saved-hub-tablet-768.png') })

  // --- 4. Mobile 390x844: Saved Hub ---
  console.log('Capturing saved-hub-mobile-390.png...')
  const ctx390 = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true })
  const page390 = await ctx390.newPage()
  await initCandidateSession(page390)
  await page390.goto(`${serverUrl}candidate/saved?tab=jobs`, { waitUntil: 'networkidle' })
  await page390.waitForTimeout(600)
  await page390.screenshot({ path: path.join(outputDir, 'saved-hub-mobile-390.png') })

  // --- 5. Desktop 1440x900: Dock with Feedback Modal open ---
  console.log('Capturing feedback-modal-desktop-1440.png...')
  const feedbackPage = await ctx1440.newPage()
  await initCandidateSession(feedbackPage)
  await feedbackPage.goto(`${serverUrl}jobs`, { waitUntil: 'networkidle' })
  await feedbackPage.waitForTimeout(600)
  // Click feedback button
  const feedbackBtn = feedbackPage.locator('#quick-dock-feedback')
  if (await feedbackBtn.isVisible()) {
    await feedbackBtn.click()
    await feedbackPage.waitForTimeout(400)
  }
  await feedbackPage.screenshot({ path: path.join(outputDir, 'feedback-modal-desktop-1440.png') })

  // --- 6. Mobile 390x844: Feedback Modal ---
  console.log('Capturing feedback-modal-mobile-390.png...')
  const feedbackMobilePage = await ctx390.newPage()
  await initCandidateSession(feedbackMobilePage)
  await feedbackMobilePage.goto(`${serverUrl}jobs`, { waitUntil: 'networkidle' })
  await feedbackMobilePage.waitForTimeout(600)
  const feedbackMobileBtn = feedbackMobilePage.locator('#quick-dock-feedback')
  if (await feedbackMobileBtn.isVisible()) {
    await feedbackMobileBtn.click()
    await feedbackMobilePage.waitForTimeout(400)
  }
  await feedbackMobilePage.screenshot({ path: path.join(outputDir, 'feedback-modal-mobile-390.png') })

  // --- 7. Desktop 1440x900: Support Popover open ---
  console.log('Capturing support-popover-desktop-1440.png...')
  const supportPage = await ctx1440.newPage()
  await initCandidateSession(supportPage)
  await supportPage.goto(`${serverUrl}jobs`, { waitUntil: 'networkidle' })
  await supportPage.waitForTimeout(600)
  const supportBtn = supportPage.locator('#quick-dock-support')
  if (await supportBtn.isVisible()) {
    await supportBtn.click()
    await supportPage.waitForTimeout(400)
  }
  await supportPage.screenshot({ path: path.join(outputDir, 'support-popover-desktop-1440.png') })

  // --- 8. Mobile 390x844: Support Popover open ---
  console.log('Capturing support-popover-mobile-390.png...')
  const supportMobilePage = await ctx390.newPage()
  await initCandidateSession(supportMobilePage)
  await supportMobilePage.goto(`${serverUrl}jobs`, { waitUntil: 'networkidle' })
  await supportMobilePage.waitForTimeout(600)
  const supportMobileBtn = supportMobilePage.locator('#quick-dock-support')
  if (await supportMobileBtn.isVisible()) {
    await supportMobileBtn.click()
    await supportMobilePage.waitForTimeout(400)
  }
  await supportMobilePage.screenshot({ path: path.join(outputDir, 'support-popover-mobile-390.png') })

  // --- 9. Desktop 1440x900: Admin Feedbacks Management Page ---
  console.log('Capturing admin-feedbacks-desktop-1440.png...')
  const adminPage = await ctx1440.newPage()
  await initAdminSession(adminPage)
  await adminPage.goto(`${serverUrl}admin/feedbacks`, { waitUntil: 'networkidle' })
  await adminPage.waitForTimeout(600)
  await adminPage.screenshot({ path: path.join(outputDir, 'admin-feedbacks-desktop-1440.png') })

  console.log('All screenshots captured successfully!')
  await browser.close()
  await previewServer.close()
}

run().catch((err) => {
  console.error('Error during screenshot capture:', err)
  process.exit(1)
})

