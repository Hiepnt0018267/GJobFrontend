import { preview } from 'vite'
import { chromium } from 'playwright-core'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import fs from 'node:fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const outputDir = path.resolve(__dirname, '../evaluation/results/support-center/screenshots')

fs.mkdirSync(outputDir, { recursive: true })

async function run() {
  const PORT = 4184
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

  // --- 1. Desktop: Support Popover Default View ---
  console.log('Capturing support-popover-desktop.png...')
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
    await desktopPage.waitForTimeout(500)
  }

  await desktopPage.screenshot({
    path: path.join(outputDir, 'support-popover-desktop.png'),
    fullPage: false,
  })

  // --- 2. Desktop: FAQ Expanded View ---
  console.log('Capturing support-faq-expanded.png...')
  // Click FAQ 1 (Tạo CV) and FAQ 4 (AI Matching)
  const faq1Trigger = await desktopPage.$('#faq-trigger-create-cv')
  if (faq1Trigger) {
    await faq1Trigger.click()
    await desktopPage.waitForTimeout(300)
  }

  await desktopPage.screenshot({
    path: path.join(outputDir, 'support-faq-expanded.png'),
    fullPage: false,
  })

  // --- 3. Desktop: Safety Guide Modal ---
  console.log('Capturing safety-guide-modal.png...')
  const safetyButton = await desktopPage.$('button:has-text("Hướng dẫn tìm việc an toàn")')
  if (safetyButton) {
    await safetyButton.click()
    await desktopPage.waitForTimeout(500)
  }

  await desktopPage.screenshot({
    path: path.join(outputDir, 'safety-guide-modal.png'),
    fullPage: false,
  })
  await desktopContext.close()

  // --- 4. Mobile Viewport (390x844): Mobile Popover ---
  console.log('Capturing support-popover-mobile.png...')
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  })
  const mobilePage = await mobileContext.newPage()
  await initCandidateSession(mobilePage)

  await mobilePage.goto(`${serverUrl}jobs`, { waitUntil: 'networkidle' })
  await mobilePage.waitForTimeout(600)

  const mobileSupportBtn = await mobilePage.$('#quick-dock-support')
  if (mobileSupportBtn) {
    await mobileSupportBtn.click()
    await mobilePage.waitForTimeout(500)
  }

  await mobilePage.screenshot({
    path: path.join(outputDir, 'support-popover-mobile.png'),
    fullPage: false,
  })
  await mobileContext.close()

  await browser.close()
  previewServer.httpServer.close()
  console.log('Support Center QA screenshots successfully generated in:', outputDir)
}

run().catch((err) => {
  console.error('Visual QA error:', err)
  process.exit(1)
})
