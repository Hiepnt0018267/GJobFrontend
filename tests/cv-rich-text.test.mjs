import assert from 'node:assert/strict'
import { after, before, test } from 'node:test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createServer } from 'vite'

let server, formatting, context, richText

before(async () => {
  server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom', logLevel: 'error' })
  formatting = await server.ssrLoadModule('/src/components/cv/cvTextFormatting.ts')
  context = await server.ssrLoadModule('/src/components/cv/CVTextFormattingProvider.tsx')
  richText = await server.ssrLoadModule('/src/components/cv/CVRichTextField.tsx')
})

after(async () => { await server?.close() })

test('selected formatting is split from canonical plain text and can be cleared', () => {
  const source = 'Phát triển backend an toàn'
  const marked = formatting.applyMarksToRange(source, undefined, 11, 18, { bold: true, color: '#15989B' })
  assert.equal(formatting.formattingText(marked), source)
  assert.deepEqual(marked.spans, [
    { text: 'Phát triển ', marks: {} },
    { text: 'backend', marks: { bold: true, color: '#15989B' } },
    { text: ' an toàn', marks: {} },
  ])
  assert.equal(formatting.applyMarksToRange(source, marked, 11, 18, null), undefined)
})

test('preview renders allowlisted marks without HTML injection', () => {
  const format = { version: 1, fields: { summary: { spans: [{ text: '<script>', marks: { bold: true, underline: true, font_size: 14 } }] } } }
  const html = renderToStaticMarkup(createElement(context.default, { formatting: format, editable: false }, createElement(richText.CVFormattedText, { value: '<script>', fieldId: 'summary' })))
  assert.match(html, /font-size:14px/)
  assert.match(html, /font-weight:700/)
  assert.match(html, /text-decoration:underline/)
  assert.match(html, /&lt;script&gt;/)
  assert.doesNotMatch(html, /<script>/)
})

test('stale formatting is ignored when canonical text changes', () => {
  const stale = { spans: [{ text: 'Old text', marks: { italic: true } }] }
  assert.equal(formatting.validFieldFormatting('New text', stale), undefined)
})

test('indexed formatting follows an item when it is reordered', () => {
  const source = {
    version: 1,
    fields: {
      'experience.0.position': { spans: [{ text: 'Backend', marks: { bold: true } }] },
      'experience.1.position': { spans: [{ text: 'Frontend', marks: { italic: true } }] },
      summary: { spans: [{ text: 'Summary', marks: { underline: true } }] },
    },
  }
  const moved = formatting.reorderIndexedTextFormatting(source, 'experience', 0, 1)
  assert.deepEqual(moved.fields['experience.1.position'], source.fields['experience.0.position'])
  assert.deepEqual(moved.fields['experience.0.position'], source.fields['experience.1.position'])
  assert.deepEqual(moved.fields.summary, source.fields.summary)
})

test('deleting an item removes its formatting and shifts later indexes', () => {
  const source = {
    version: 1,
    fields: {
      'skill.0.name': { spans: [{ text: 'Java', marks: { bold: true } }] },
      'skill.1.name': { spans: [{ text: 'Python', marks: { italic: true } }] },
      title: { spans: [{ text: 'Engineer', marks: { bold: true } }] },
    },
  }
  const next = formatting.deleteIndexedTextFormatting(source, 'skill', 0)
  assert.equal(next.fields['skill.1.name'], undefined)
  assert.deepEqual(next.fields['skill.0.name'], source.fields['skill.1.name'])
  assert.deepEqual(next.fields.title, source.fields.title)
})
