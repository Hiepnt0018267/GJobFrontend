import { preview } from 'vite'
import { chromium } from 'playwright-core'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import fs from 'node:fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const outputDir = path.resolve(__dirname, '../evaluation/results/feedback-zalo-qa')

fs.mkdirSync(outputDir, { recursive: true })

async function run() {
  const PORT = 4198
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

  // --- 1. Feedback Intent Modal Default ---
  console.log('Capturing feedback-intent-modal.png...')
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } })
  const page = await ctx.newPage()
  await initCandidateSession(page)
  await page.goto(`${serverUrl}`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(600)

  // Trigger feedback event
  await page.evaluate(() => {
    window.dispatchEvent(new CustomEvent('gjob:open-feedback'))
  })
  await page.waitForTimeout(400)
  await page.screenshot({ path: path.join(outputDir, '01-feedback-intent-modal.png') })

  // --- 2. Feedback Intent Modal with Expanded QR Code ---
  console.log('Capturing feedback-intent-modal-qr-expanded.png...')
  const qrButton = page.locator('button:has-text("Quét mã QR")')
  if (await qrButton.isVisible()) {
    await qrButton.click()
    await page.waitForTimeout(400)
    await page.screenshot({ path: path.join(outputDir, '02-feedback-intent-qr-expanded.png') })
  }

  // --- 3. Transition to Feedback Form Modal ---
  console.log('Capturing feedback-form-modal-with-privacy-note.png...')
  const feedbackOptionBtn = page.locator('button:has-text("Góp ý sản phẩm")')
  if (await feedbackOptionBtn.isVisible()) {
    await feedbackOptionBtn.click()
    await page.waitForTimeout(400)
    await page.screenshot({ path: path.join(outputDir, '03-feedback-form-privacy-note.png') })
  }

  // Close feedback form modal
  await page.keyboard.press('Escape')
  await page.waitForTimeout(300)

  // --- 4. Support Popover with Zalo & QR ---
  console.log('Capturing support-popover-zalo-dual-action.png...')
  const supportDockBtn = page.locator('#quick-dock-support')
  if (await supportDockBtn.isVisible()) {
    await supportDockBtn.click()
    await page.waitForTimeout(400)
    await page.screenshot({ path: path.join(outputDir, '04-support-popover.png') })

    // Expand Zalo QR inside Support Popover
    const popoverQrBtn = page.locator('button:has-text("Mã QR")')
    if (await popoverQrBtn.isVisible()) {
      await popoverQrBtn.click()
      await page.waitForTimeout(400)
      await page.screenshot({ path: path.join(outputDir, '05-support-popover-qr-expanded.png') })
    }
  }

  await browser.close()
  await previewServer.close()
  console.log('Visual QA capture completed successfully.')
}

run().catch((err) => {
  console.error('QA capture error:', err)
  process.exit(1)
})

