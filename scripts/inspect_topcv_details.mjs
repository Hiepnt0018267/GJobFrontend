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

  // 1. Inspect "Góp ý" modal
  const gopYBtn = page.locator('.fixed-product-comment__text').first()
  if (await gopYBtn.isVisible()) {
    await gopYBtn.click()
    await page.waitForTimeout(1000)
    const modalData = await page.evaluate(() => {
      // Find open modals or dialogs
      const modals = document.querySelectorAll('.modal, div[role="dialog"], .fade.in, .show, [class*="modal"]')
      return Array.from(modals)
        .filter(m => m.offsetParent !== null || window.getComputedStyle(m).display !== 'none')
        .map(m => ({
          className: m.className,
          id: m.id,
          innerText: m.innerText,
          links: Array.from(m.querySelectorAll('a')).map(a => ({ href: a.href, text: a.innerText })),
          buttons: Array.from(m.querySelectorAll('button')).map(b => b.innerText)
        }))
    })
    console.log('=== GOP Y MODAL DATA ===')
    console.log(JSON.stringify(modalData, null, 2))
  }

  // Reload to clean state
  await page.reload({ waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(2000)

  // 2. Inspect "Hỗ trợ" popover and "Liên hệ TopCV"
  const hoTroBtn = page.locator('text="Hỗ trợ"').first()
  if (await hoTroBtn.isVisible()) {
    await hoTroBtn.click()
    await page.waitForTimeout(1000)
    const popoverData = await page.evaluate(() => {
      const popovers = document.querySelectorAll('[class*="popover"], [class*="support"], [class*="menu"]')
      return Array.from(popovers)
        .filter(p => p.innerText && (p.innerText.includes('Ms. Hương') || p.innerText.includes('Liên hệ') || p.innerText.includes('Zalo')))
        .map(p => ({
          className: p.className,
          innerText: p.innerText,
          links: Array.from(p.querySelectorAll('a')).map(a => ({ href: a.href, text: a.innerText }))
        }))
    })
    console.log('=== HO TRO POPOVER DATA ===')
    console.log(JSON.stringify(popoverData, null, 2))

    // Click "Liên hệ TopCV"
    const lienHeBtn = page.locator('text="Liên hệ TopCV"').first()
    if (await lienHeBtn.isVisible()) {
      await lienHeBtn.click()
      await page.waitForTimeout(1000)
      const contactModalData = await page.evaluate(() => {
        const modals = document.querySelectorAll('.modal, div[role="dialog"], .fade.in, .show, [class*="modal"]')
        return Array.from(modals)
          .filter(m => m.offsetParent !== null && m.innerText && m.innerText.includes('Tổng đài hỗ trợ'))
          .map(m => ({
            className: m.className,
            innerText: m.innerText,
            links: Array.from(m.querySelectorAll('a')).map(a => ({ href: a.href, text: a.innerText }))
          }))
      })
      console.log('=== LIEN HE MODAL DATA ===')
      console.log(JSON.stringify(contactModalData, null, 2))
    }
  }

  await browser.close()
}

run()

