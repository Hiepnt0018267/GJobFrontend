import { existsSync } from 'node:fs'
import { chromium } from 'playwright-core'

const frontendUrl = process.env.GJOB_FRONTEND_URL || 'http://localhost:5173/admin/cv-templates'
const adminToken = process.env.GJOB_ADMIN_TOKEN
const timeoutMs = Number(process.env.GJOB_THUMBNAIL_TIMEOUT_MS || 30 * 60 * 1000)

if (!adminToken) {
  console.error('Thiếu GJOB_ADMIN_TOKEN. Hãy cung cấp access token của quản trị viên.')
  process.exit(1)
}

const chromeCandidates = [
  process.env.CHROME_PATH,
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
].filter(Boolean)
const chromePath = chromeCandidates.find((candidate) => existsSync(candidate))
if (!chromePath) {
  console.error('Không tìm thấy Chrome hoặc Edge. Có thể đặt đường dẫn bằng CHROME_PATH.')
  process.exit(1)
}

const browser = await chromium.launch({ executablePath: chromePath, headless: true })
let failure = null
try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } })
  await context.addInitScript((token) => localStorage.setItem('gjob_token', token), adminToken)
  const page = await context.newPage()
  await page.goto(frontendUrl, { waitUntil: 'domcontentloaded', timeout: 30_000 })

  const trigger = page.getByRole('button', { name: 'Tạo ảnh còn thiếu' })
  await trigger.waitFor({ state: 'visible', timeout: 30_000 })
  await trigger.click()
  console.log('Đã bắt đầu tạo thumbnail còn thiếu...')

  const deadline = Date.now() + timeoutMs
  let lastStatus = ''
  while (Date.now() < deadline) {
    const statusNode = page.locator('[role="alert"], [role="status"]').first()
    const status = await statusNode.isVisible().catch(() => false)
      ? (await statusNode.textContent() || '').trim().replace(/\s+/g, ' ')
      : ''
    if (status && status !== lastStatus) {
      console.log(status)
      lastStatus = status
    }
    if (status.includes('Không thể')) throw new Error(status)
    if (status.includes('Đã tạo')) break
    await page.waitForTimeout(750)
  }
  if (!lastStatus.includes('Đã tạo')) throw new Error('Quá thời gian chờ tạo thumbnail.')
  console.log('Hoàn tất:', lastStatus)
} catch (error) {
  failure = error
  console.error(error instanceof Error ? error.message : String(error))
} finally {
  await browser.close()
}

if (failure) process.exit(1)
