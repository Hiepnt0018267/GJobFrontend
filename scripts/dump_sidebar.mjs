import { chromium } from 'playwright-core'

async function run() {
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
  })
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
  })
  const page = await context.newPage()
  await page.goto('https://www.topcv.vn/viec-lam', { waitUntil: 'domcontentloaded', timeout: 20000 })
  await page.waitForTimeout(3000)

  const sidebarHTML = await page.evaluate(() => {
    const el = document.getElementById('fixed-right-helper-sidebar')
    return el ? el.outerHTML : 'NOT_FOUND'
  })

  console.log('=== SIDEBAR HTML ===')
  console.log(sidebarHTML)

  await browser.close()
}

run()

