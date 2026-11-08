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

  // Find floating widget container
  const widgetData = await page.evaluate(() => {
    // Find all fixed bottom right elements
    const fixedElements = Array.from(document.querySelectorAll('*')).filter(el => {
      const style = window.getComputedStyle(el)
      return style.position === 'fixed' && (parseInt(style.right) < 100 || style.right === '0px' || style.right.includes('%'))
    })

    return fixedElements.map(el => ({
      tagName: el.tagName,
      className: el.className,
      id: el.id,
      text: el.innerText ? el.innerText.substring(0, 200) : '',
      html: el.outerHTML ? el.outerHTML.substring(0, 300) : ''
    })).filter(x => x.text.includes('Góp ý') || x.text.includes('Hỗ trợ'))
  })

  console.log('Fixed Elements:', JSON.stringify(widgetData, null, 2))
  await browser.close()
}

run()

