import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

const cardSource = readFileSync(new URL('../src/components/job/JobCard.tsx', import.meta.url), 'utf8')
const previewSource = readFileSync(new URL('../src/components/job/JobQuickPreview.tsx', import.meta.url), 'utf8')
const detailSource = readFileSync(new URL('../src/pages/jobs/JobDetailPage.tsx', import.meta.url), 'utf8')

test('job card opens the quick preview through delayed desktop hover without a footer button', () => {
  assert.ok(cardSource.includes("window.matchMedia('(hover: hover) and (pointer: fine)')"))
  assert.ok(cardSource.includes('setTimeout(() => setPreviewOpen(true), 280)'))
  assert.ok(cardSource.includes('setTimeout(() => setPreviewOpen(false), 180)'))
  assert.ok(cardSource.includes('onMouseEnter={() => openPreview()}'))
  assert.ok(cardSource.includes('onMouseLeave={schedulePreviewClose}'))
  assert.equal(cardSource.includes('onClick={() => openPreview(false)}'), false)
  assert.equal(cardSource.includes('Xem nhanh'), false)
})

test('quick preview uses a portal, chooses the available side and becomes a mobile sheet', () => {
  assert.ok(previewSource.includes('createPortal(preview, document.body)'))
  assert.ok(previewSource.includes('availableRight >= width + PANEL_GAP'))
  assert.ok(previewSource.includes('rect.left - width - PANEL_GAP'))
  assert.ok(previewSource.includes("'fixed inset-x-0 bottom-0"))
  assert.ok(previewSource.includes('backdrop-blur-[2px]'))
  assert.ok(previewSource.includes("event.key === 'Escape'"))
  assert.ok(previewSource.includes('onMouseEnter={onEnter}'))
  assert.ok(previewSource.includes('onMouseLeave={onLeave}'))
})

test('quick preview exposes useful job context without requesting another API resource', () => {
  for (const content of ['Mô tả công việc', 'Yêu cầu nổi bật', 'Kỹ năng', 'Xem chi tiết', 'Ứng tuyển']) {
    assert.ok(previewSource.includes(content))
  }
  assert.equal(previewSource.includes('jobService.'), false)
  assert.ok(previewSource.includes('job.company_logo_url'))
  assert.ok(previewSource.includes('formatSalary(job)'))
})

test('apply shortcut lands on and reveals the application action', () => {
  assert.ok(previewSource.includes('to={`/jobs/${job.id}#apply`}'))
  assert.ok(detailSource.includes("location.hash !== '#apply'"))
  assert.ok(detailSource.includes("document.getElementById('job-apply')?.scrollIntoView"))
  assert.ok(detailSource.includes('id="job-apply"'))
})
