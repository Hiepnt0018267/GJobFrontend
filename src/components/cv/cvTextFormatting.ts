import type { CVFieldTextFormatting, CVFontFamily, CVTextFormatting, CVTextMarks, CVTextSpan } from '../../types/cv'

export const CV_RICH_TEXT_FONTS: Array<{ value: CVFontFamily; label: string; css: string }> = [
  { value: 'INTER', label: 'Inter', css: 'Inter, system-ui, sans-serif' },
  { value: 'ROBOTO', label: 'Roboto', css: 'Roboto, Arial, sans-serif' },
  { value: 'ARIAL', label: 'Arial', css: 'Arial, sans-serif' },
  { value: 'TIMES_NEW_ROMAN', label: 'Times New Roman', css: '"Times New Roman", serif' },
]

export function formattingText(formatting?: CVFieldTextFormatting): string {
  return formatting?.spans.map((span) => span.text).join('') ?? ''
}

export function validFieldFormatting(value: string, formatting?: CVFieldTextFormatting): CVFieldTextFormatting | undefined {
  return formatting && formattingText(formatting) === value ? formatting : undefined
}

function cleanMarks(marks: CVTextMarks): CVTextMarks {
  return Object.fromEntries(Object.entries(marks).filter(([, value]) => value !== false && value != null)) as CVTextMarks
}

function sameMarks(left: CVTextMarks, right: CVTextMarks): boolean {
  return JSON.stringify(cleanMarks(left)) === JSON.stringify(cleanMarks(right))
}

function mergeSpans(spans: CVTextSpan[]): CVTextSpan[] {
  const merged: CVTextSpan[] = []
  for (const span of spans) {
    if (!span.text) continue
    const marks = cleanMarks(span.marks)
    const previous = merged.at(-1)
    if (previous && sameMarks(previous.marks, marks)) previous.text += span.text
    else merged.push({ text: span.text, marks })
  }
  return merged
}

export function applyMarksToRange(value: string, formatting: CVFieldTextFormatting | undefined, start: number, end: number, patch: CVTextMarks | null): CVFieldTextFormatting | undefined {
  if (start < 0 || end <= start || end > value.length) return validFieldFormatting(value, formatting)
  const source = validFieldFormatting(value, formatting)?.spans ?? [{ text: value, marks: {} }]
  const result: CVTextSpan[] = []
  let offset = 0
  for (const span of source) {
    const spanStart = offset
    const spanEnd = offset + span.text.length
    const selectedStart = Math.max(start, spanStart)
    const selectedEnd = Math.min(end, spanEnd)
    if (selectedStart >= selectedEnd) result.push(span)
    else {
      const before = span.text.slice(0, selectedStart - spanStart)
      const selected = span.text.slice(selectedStart - spanStart, selectedEnd - spanStart)
      const after = span.text.slice(selectedEnd - spanStart)
      if (before) result.push({ text: before, marks: span.marks })
      result.push({ text: selected, marks: patch === null ? {} : { ...span.marks, ...patch } })
      if (after) result.push({ text: after, marks: span.marks })
    }
    offset = spanEnd
  }
  const spans = mergeSpans(result)
  return spans.every((span) => Object.keys(span.marks).length === 0) ? undefined : { spans }
}

export function selectionHasMark(value: string, formatting: CVFieldTextFormatting | undefined, start: number, end: number, key: 'bold' | 'italic' | 'underline'): boolean {
  const source = validFieldFormatting(value, formatting)?.spans ?? [{ text: value, marks: {} }]
  let offset = 0
  let found = false
  for (const span of source) {
    const overlap = Math.max(start, offset) < Math.min(end, offset + span.text.length)
    if (overlap) {
      found = true
      if (span.marks[key] !== true) return false
    }
    offset += span.text.length
  }
  return found
}

export function markStyle(marks: CVTextMarks): React.CSSProperties {
  const font = CV_RICH_TEXT_FONTS.find((item) => item.value === marks.font_family)
  return {
    fontFamily: font?.css,
    fontSize: marks.font_size ? `${marks.font_size}px` : undefined,
    color: marks.color,
    fontWeight: marks.bold ? 700 : undefined,
    fontStyle: marks.italic ? 'italic' : undefined,
    textDecoration: marks.underline ? 'underline' : undefined,
  }
}

function remapIndexedFields(
  formatting: CVTextFormatting | undefined,
  prefix: string,
  mapIndex: (index: number) => number | null,
): CVTextFormatting | undefined {
  if (!formatting) return undefined
  const indexedField = new RegExp(`^${prefix}\\.(\\d+)\\.(.+)$`)
  const fields: CVTextFormatting['fields'] = {}

  for (const [fieldId, value] of Object.entries(formatting.fields)) {
    const match = fieldId.match(indexedField)
    if (!match) {
      fields[fieldId] = value
      continue
    }
    const nextIndex = mapIndex(Number(match[1]))
    if (nextIndex !== null) fields[`${prefix}.${nextIndex}.${match[2]}`] = value
  }

  return Object.keys(fields).length > 0 ? { version: 1, fields } : undefined
}

export function deleteIndexedTextFormatting(
  formatting: CVTextFormatting | undefined,
  prefix: string,
  deletedIndex: number,
): CVTextFormatting | undefined {
  if (deletedIndex < 0) return formatting
  return remapIndexedFields(formatting, prefix, (index) => {
    if (index === deletedIndex) return null
    return index > deletedIndex ? index - 1 : index
  })
}

export function reorderIndexedTextFormatting(
  formatting: CVTextFormatting | undefined,
  prefix: string,
  fromIndex: number,
  toIndex: number,
): CVTextFormatting | undefined {
  if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) return formatting
  return remapIndexedFields(formatting, prefix, (index) => {
    if (index === fromIndex) return toIndex
    if (fromIndex < toIndex && index > fromIndex && index <= toIndex) return index - 1
    if (toIndex < fromIndex && index >= toIndex && index < fromIndex) return index + 1
    return index
  })
}
