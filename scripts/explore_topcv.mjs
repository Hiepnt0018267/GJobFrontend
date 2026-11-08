import { chromium } from 'playwright-core'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import fs from 'node:fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const outputDir = 'C:\\Users\\LEGION\\.gemini\\antigravity\\brain\\fe5951fd-5ae6-4043-af5b-4dbb5195e71f\\scratch\\topcv_screenshots'
fs.mkdirSync(outputDir, { recursive: true })

async function run() {
  console.log('Launching Chrome...')
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
  })
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
  })
  const page = await context.newPage()
  
  console.log('Navigating to https://www.topcv.vn/viec-lam...')
  try {
    const res = await page.goto('https://www.topcv.vn/viec-lam', { waitUntil: 'domcontentloaded', timeout: 20000 })
    console.log('Status:', res.status())
    console.log('Page Title:', await page.title())
    await page.waitForTimeout(3000)
    
    // Screenshot whole page
    await page.screenshot({ path: path.join(outputDir, 'topcv-viec-lam-home.png') })
    console.log('Saved topcv-viec-lam-home.png')

    // Find floating dock buttons on bottom right
    const buttons = await page.evaluate(() => {
      const allButtons = Array.from(document.querySelectorAll('button, a, div[role="button"], span'))
      return allButtons
        .filter(el => {
          const text = el.innerText || ''
          return text.includes('Góp ý') || text.includes('Hỗ trợ') || text.includes('Việc làm đã lưu')
        })
        .map(el => ({
          tag: el.tagName,
          text: (el.innerText || '').trim(),
          className: el.className,
          id: el.id,
        }))
    })
    console.log('Found floating dock elements:', JSON.stringify(buttons, null, 2))

    // Look for Góp ý button and click
    const gopYBtn = page.locator('text="Góp ý"').first()
    if (await gopYBtn.isVisible()) {
      console.log('Clicking Góp ý button...')
      await gopYBtn.click()
      await page.waitForTimeout(1000)
      await page.screenshot({ path: path.join(outputDir, 'topcv-after-gopy-click.png') })
      console.log('Saved topcv-after-gopy-click.png')
    }

    // Look for Hỗ trợ button and click
    const hoTroBtn = page.locator('text="Hỗ trợ"').first()
    if (await hoTroBtn.isVisible()) {
      console.log('Clicking Hỗ trợ button...')
      await hoTroBtn.click()
      await page.waitForTimeout(1000)
      await page.screenshot({ path: path.join(outputDir, 'topcv-after-hotro-click.png') })
      console.log('Saved topcv-after-hotro-click.png')

      // Look for "Liên hệ TopCV" in popover
      const lienHeBtn = page.locator('text="Liên hệ TopCV"').first()
      if (await lienHeBtn.isVisible()) {
        console.log('Clicking Liên hệ TopCV...')
        await lienHeBtn.click()
        await page.waitForTimeout(1000)
        await page.screenshot({ path: path.join(outputDir, 'topcv-after-lienhe-click.png') })
        console.log('Saved topcv-after-lienhe-click.png')
      }
    }

    console.log('Exploration complete!')
  } catch (err) {
    console.error('Error during exploration:', err)
  } finally {
    await browser.close()
  }
}

run()

