import { preview } from 'vite'
import { chromium } from 'playwright-core'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import fs from 'node:fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const outputDir = path.resolve(__dirname, '../evaluation/results/support-center/screenshots')

fs.mkdirSync(outputDir, { recursive: true })

async function run() {
  const PORT = 4187
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

  // Common setup
  const initCandidateSession = async (page) => {
    await page.addInitScript(() => {
      localStorage.setItem('gjob_token', 'mock-candidate-token')
      localStorage.setItem('user', JSON.stringify({
        id: 'candidate-123',
        email: 'candidate@gjob.vn',
        full_name: 'Trần Ứng Viên',
        role: 'CANDIDATE',
        is_active: true,
      }))
    })
  }

  // --- 1. Quick Launcher Popover on Desktop (1440x900) ---
  console.log('Capturing support-popover-launcher.png...')
  const desktopContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  })
  const desktopPage = await desktopContext.newPage()
  await initCandidateSession(desktopPage)

  await desktopPage.goto(`${serverUrl}jobs`, { waitUntil: 'networkidle' })
  await desktopPage.waitForTimeout(600)

  // Click the Support button on quick dock
  const supportButton = await desktopPage.$('#quick-dock-support')
  if (supportButton) {
    await supportButton.click()
    await desktopPage.waitForTimeout(400)
  }

  await desktopPage.screenshot({
    path: path.join(outputDir, 'support-popover-launcher.png'),
    fullPage: false,
  })
  await desktopContext.close()

  // --- 2. Help Center Page on Desktop (1440x900) with category=safety ---
  console.log('Capturing help-center-safety-desktop.png...')
  const helpContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  })
  const helpPage = await helpContext.newPage()
  await initCandidateSession(helpPage)

  await helpPage.goto(`${serverUrl}help?category=safety`, { waitUntil: 'networkidle' })
  await helpPage.waitForTimeout(600)

  // Click the first article accordion to expand it
  const firstAccordion = await helpPage.$('button[id^="help-trigger-"]')
  if (firstAccordion) {
    await firstAccordion.click()
    await helpPage.waitForTimeout(300)
  }

  await helpPage.screenshot({
    path: path.join(outputDir, 'help-center-safety-desktop.png'),
    fullPage: false,
  })

  // --- 3. Help Center Search View on Desktop ---
  console.log('Capturing help-center-search-desktop.png...')
  const searchInput = await helpPage.$('input[placeholder*="Tìm kiếm"]')
  if (searchInput) {
    await searchInput.fill('chuyển tiền')
    await helpPage.waitForTimeout(400)
  }

  await helpPage.screenshot({
    path: path.join(outputDir, 'help-center-search-desktop.png'),
    fullPage: false,
  })
  await helpContext.close()

  // --- 4. Mobile View (390x844) on /help ---
  console.log('Capturing help-center-mobile.png...')
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  })
  const mobilePage = await mobileContext.newPage()
  await initCandidateSession(mobilePage)

  await mobilePage.goto(`${serverUrl}help?category=cv`, { waitUntil: 'networkidle' })
  await mobilePage.waitForTimeout(600)

  await mobilePage.screenshot({
    path: path.join(outputDir, 'help-center-mobile.png'),
    fullPage: false,
  })
  await mobileContext.close()

  await browser.close()
  previewServer.httpServer.close()
  console.log('Help Center Phase 1 Visual QA screenshots successfully captured in:', outputDir)
}

run().catch((err) => {
  console.error('Visual QA error:', err)
  process.exit(1)
})

