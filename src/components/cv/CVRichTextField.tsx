import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import { createPortal } from 'react-dom'
import type { CVFontFamily, CVTextMarks } from '../../types/cv'
import { useCVTextFormatting } from './cvTextFormattingContext'
import { applyMarksToRange, CV_RICH_TEXT_FONTS, markStyle, selectionHasMark, validFieldFormatting } from './cvTextFormatting'

type SelectionState = { start: number; end: number; top: number; left: number; placement: 'above' | 'below' }
type Props = { value?: string | null; onChange: (value: string) => void; fieldId?: string; label: string; placeholder: string; className?: string; multiline?: boolean; rows?: number; type?: 'text' | 'email' | 'url'; maxLength?: number }

function selectionOffsets(root: HTMLElement): SelectionState | null {
  const selection = window.getSelection()
  if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return null
  const range = selection.getRangeAt(0)
  if (!root.contains(range.commonAncestorContainer)) return null
  const before = range.cloneRange()
  before.selectNodeContents(root)
  before.setEnd(range.startContainer, range.startOffset)
  const start = before.toString().length
  const end = start + range.toString().length
  if (end <= start) return null
  const rect = range.getBoundingClientRect()
  const placement = rect.top >= 64 ? 'above' : 'below'
  const horizontalInset = Math.min(220, window.innerWidth / 2)
  return {
    start,
    end,
    top: placement === 'above' ? rect.top - 8 : rect.bottom + 8,
    left: Math.min(window.innerWidth - horizontalInset, Math.max(horizontalInset, rect.left + rect.width / 2)),
    placement,
  }
}

function insertPlainText(text: string) {
  const selection = window.getSelection()
  if (!selection || selection.rangeCount === 0) return
  const range = selection.getRangeAt(0)
  range.deleteContents()
  const node = document.createTextNode(text)
  range.insertNode(node)
  range.setStartAfter(node)
  range.collapse(true)
  selection.removeAllRanges()
  selection.addRange(range)
}

function currentCaretOffset(root: HTMLElement): number | null {
  const selection = window.getSelection()
  if (!selection || selection.rangeCount === 0 || !selection.isCollapsed) return null
  const range = selection.getRangeAt(0)
  if (!root.contains(range.startContainer)) return null
  const before = range.cloneRange()
  before.selectNodeContents(root)
  before.setEnd(range.startContainer, range.startOffset)
  return before.toString().length
}

function restoreCaretOffset(root: HTMLElement, requestedOffset: number) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  let remaining = Math.max(0, requestedOffset)
  let node = walker.nextNode()
  while (node) {
    const length = node.textContent?.length ?? 0
    if (remaining <= length) {
      const range = document.createRange()
      range.setStart(node, remaining)
      range.collapse(true)
      const selection = window.getSelection()
      selection?.removeAllRanges()
      selection?.addRange(range)
      return
    }
    remaining -= length
    node = walker.nextNode()
  }

  const range = document.createRange()
  range.selectNodeContents(root)
  range.collapse(false)
  const selection = window.getSelection()
  selection?.removeAllRanges()
  selection?.addRange(range)
}

export default function CVRichTextField({ value = '', onChange, fieldId, label, placeholder, className = '', multiline = false, rows = 1, maxLength }: Props) {
  const text = value ?? ''
  const rootRef = useRef<HTMLDivElement>(null)
  const toolbarRef = useRef<HTMLDivElement>(null)
  const lastRenderRef = useRef('')
  const [selection, setSelection] = useState<SelectionState | null>(null)
  const { formatting, editable, updateFormatting } = useCVTextFormatting(fieldId ?? '')
  const activeFormatting = fieldId ? validFieldFormatting(text, formatting) : undefined
  const signature = JSON.stringify(activeFormatting?.spans ?? [{ text, marks: {} }])

  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root || (root.textContent === text && lastRenderRef.current === signature)) return
    const caretOffset = document.activeElement === root ? currentCaretOffset(root) : null
    root.replaceChildren()
    const spans = activeFormatting?.spans ?? [{ text, marks: {} }]
    for (const span of spans) {
      if (Object.keys(span.marks).length === 0) root.append(document.createTextNode(span.text))
      else {
        const element = document.createElement('span')
        Object.assign(element.style, markStyle(span.marks))
        element.textContent = span.text
        root.append(element)
      }
    }
    lastRenderRef.current = signature
    if (caretOffset !== null) restoreCaretOffset(root, caretOffset)
  }, [activeFormatting, signature, text])

  useEffect(() => {
    if (!selection) return
    const closeWhenClickingOutside = (event: PointerEvent) => {
      const target = event.target
      if (!(target instanceof Node)) return
      if (rootRef.current?.contains(target) || toolbarRef.current?.contains(target)) return
      setSelection(null)
    }
    document.addEventListener('pointerdown', closeWhenClickingOutside, true)
    return () => document.removeEventListener('pointerdown', closeWhenClickingOutside, true)
  }, [selection])

  const refreshSelection = () => window.requestAnimationFrame(() => setSelection(rootRef.current ? selectionOffsets(rootRef.current) : null))
  const apply = (patch: CVTextMarks | null) => {
    if (!selection || !fieldId) return
    updateFormatting(applyMarksToRange(text, activeFormatting, selection.start, selection.end, patch))
  }
  const toggle = (key: 'bold' | 'italic' | 'underline') => apply({ [key]: !selectionHasMark(text, activeFormatting, selection?.start ?? 0, selection?.end ?? 0, key) })
  const minHeight = multiline ? `${Math.max(1, rows) * 1.35}em` : undefined
  const toolbar = selection && editable && fieldId && typeof document !== 'undefined' ? createPortal(
    <div ref={toolbarRef} role="toolbar" aria-label={`Định dạng ${label}`} style={{ position: 'fixed', top: selection.top, left: selection.left, transform: selection.placement === 'above' ? 'translate(-50%, -100%)' : 'translateX(-50%)', maxWidth: 'calc(100vw - 16px)' }} className="z-[200] flex items-center gap-1 overflow-x-auto rounded-xl border border-slate-200 bg-white p-1.5 text-slate-700 shadow-2xl">
      <select aria-label="Cỡ chữ" defaultValue="13" onChange={(event) => apply({ font_size: Number(event.target.value) })} className="h-8 rounded-md border-0 bg-white px-2 text-xs font-semibold outline-none hover:bg-slate-50">{[10, 11, 12, 13, 14, 16, 18, 20].map((size) => <option key={size} value={size}>{size}px</option>)}</select>
      <span className="h-6 w-px bg-slate-200" />
      <select aria-label="Phông chữ" defaultValue="INTER" onChange={(event) => apply({ font_family: event.target.value as CVFontFamily })} className="h-8 max-w-32 rounded-md border-0 bg-white px-2 text-xs font-semibold outline-none hover:bg-slate-50">{CV_RICH_TEXT_FONTS.map((font) => <option key={font.value} value={font.value}>{font.label}</option>)}</select>
      <span className="h-6 w-px bg-slate-200" />
      <label className="grid h-8 w-8 cursor-pointer place-items-center rounded-md hover:bg-slate-50" title="Màu chữ"><input aria-label="Màu chữ" type="color" defaultValue="#15989B" onChange={(event) => apply({ color: event.target.value.toUpperCase() })} className="h-5 w-5 cursor-pointer rounded-full border-0 bg-transparent p-0" /></label>
      <span className="h-6 w-px bg-slate-200" />
      <button type="button" aria-label="In đậm" onClick={() => toggle('bold')} className="grid h-8 w-8 place-items-center rounded-md text-sm font-bold hover:bg-slate-100">B</button>
      <button type="button" aria-label="In nghiêng" onClick={() => toggle('italic')} className="grid h-8 w-8 place-items-center rounded-md text-sm italic hover:bg-slate-100">I</button>
      <button type="button" aria-label="Gạch chân" onClick={() => toggle('underline')} className="grid h-8 w-8 place-items-center rounded-md text-sm underline hover:bg-slate-100">U</button>
      <button type="button" aria-label="Xóa định dạng" title="Xóa định dạng" onClick={() => apply(null)} className="h-8 rounded-md px-2 text-[10px] font-semibold text-slate-500 hover:bg-slate-100">Xóa</button>
    </div>, document.body) : null

  const style: CSSProperties = { minHeight }
  return <div className="relative min-w-0"><div ref={rootRef} role="textbox" aria-label={label} aria-multiline={multiline} contentEditable={editable} suppressContentEditableWarning data-placeholder={placeholder} data-cv-rich-field={fieldId} style={style} className={`cv-inline-field cv-rich-text-field min-w-0 rounded-md border border-transparent bg-transparent px-1.5 py-1 text-inherit outline-none transition empty:before:text-current/45 hover:border-dashed hover:border-slate-300 hover:bg-white/10 focus:border-[#49BBBD] focus:bg-white/10 focus:ring-2 focus:ring-[#49BBBD]/15 ${multiline ? 'block w-full whitespace-pre-wrap leading-5' : 'w-full whitespace-nowrap'} ${className}`}
    onMouseUp={refreshSelection} onKeyUp={refreshSelection} onBlur={() => window.setTimeout(() => { const active = document.activeElement; if (!toolbarRef.current?.contains(active)) setSelection(null) }, 0)}
    onKeyDown={(event) => { if (!multiline && event.key === 'Enter') event.preventDefault() }}
    onPaste={(event) => { event.preventDefault(); insertPlainText(event.clipboardData.getData('text/plain').replace(!multiline ? /[\r\n]+/g : /\r/g, multiline ? '' : ' ')); rootRef.current?.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertFromPaste' })) }}
    onInput={(event) => { let next = event.currentTarget.innerText.replace(/\r/g, ''); if (!multiline) next = next.replace(/[\n]+/g, ' '); if (maxLength && next.length > maxLength) next = next.slice(0, maxLength); if (activeFormatting) updateFormatting(undefined); onChange(next) }} />{toolbar}</div>
}

export function CVFormattedText({ value = '', fieldId, className = '' }: { value?: string | null; fieldId: string; className?: string }) {
  const text = value ?? ''
  const { formatting } = useCVTextFormatting(fieldId)
  const valid = validFieldFormatting(text, formatting)
  return <span className={className}>{(valid?.spans ?? [{ text, marks: {} }]).map((span, index) => <span key={`${index}-${span.text.length}`} style={markStyle(span.marks)}>{span.text}</span>)}</span>
}
