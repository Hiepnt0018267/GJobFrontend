import { ZoomIn, ZoomOut } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import type { CVEditorZoomMode } from './cvEditorState'

const A4_WIDTH = 794

export default function CVEditorCanvas({ children, zoomPercent, zoomMode, onViewportWidth, onZoomChange, onFit }: { children: ReactNode; zoomPercent: number; zoomMode: CVEditorZoomMode; onViewportWidth: (width: number) => void; onZoomChange: (zoom: number) => void; onFit: () => void }) {
  const viewportRef = useRef<HTMLDivElement>(null)
  const documentRef = useRef<HTMLDivElement>(null)
  const [documentHeight, setDocumentHeight] = useState(1123)
  const scale = zoomPercent / 100

  useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return
    const observer = new ResizeObserver(([entry]) => onViewportWidth(entry.contentRect.width))
    observer.observe(viewport)
    onViewportWidth(viewport.getBoundingClientRect().width)
    return () => observer.disconnect()
  }, [onViewportWidth])

  useEffect(() => {
    const documentNode = documentRef.current
    if (!documentNode) return
    const update = () => setDocumentHeight(Math.max(1123, documentNode.scrollHeight))
    const observer = new ResizeObserver(update)
    observer.observe(documentNode)
    update()
    return () => observer.disconnect()
  }, [children])

  const steps = [50, 75, 100, 125, 150]
  const moveZoom = (direction: -1 | 1) => {
    const next = direction > 0 ? steps.find((value) => value > zoomPercent) : [...steps].reverse().find((value) => value < zoomPercent)
    onZoomChange(next ?? (direction > 0 ? 150 : 50))
  }

  return <section data-testid="cv-editor-canvas" aria-label="Khung CV" className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-slate-100">
        <div ref={viewportRef} className="min-h-0 flex-1 overflow-auto px-6 pb-20 pt-0 sm:px-8 sm:pb-24" data-testid="cv-canvas-viewport">
      <div className="mx-auto" style={{ width: A4_WIDTH * scale, height: documentHeight * scale }}>
        <div
          ref={documentRef}
          style={{ width: A4_WIDTH, transform: `scale(${scale})`, transformOrigin: 'top left' }}
          className="shadow-2xl"
          data-testid="cv-interactive-document"
        >{children}</div>
      </div>
    </div>
    <div aria-label="Thu phóng CV" className="absolute bottom-4 right-4 z-20 flex items-center gap-1 rounded-full border border-slate-200 bg-white p-1.5 shadow-lg">
      <button type="button" onClick={() => moveZoom(-1)} className="grid h-9 w-9 place-items-center rounded-full text-slate-600 transition hover:bg-slate-100 hover:text-slate-950" aria-label="Thu nhỏ"><ZoomOut size={18} /></button>
      <button type="button" aria-pressed={zoomMode === 'FIT'} onClick={onFit} className={`min-w-[62px] rounded-full px-2 py-2 text-sm font-semibold tabular-nums transition ${zoomMode === 'FIT' ? 'bg-teal-50 text-[#49BBBD]' : 'text-slate-700 hover:bg-slate-100'}`} aria-label="Vừa khung">{zoomPercent}%</button>
      <button type="button" onClick={() => moveZoom(1)} className="grid h-9 w-9 place-items-center rounded-full text-slate-600 transition hover:bg-slate-100 hover:text-slate-950" aria-label="Phóng to"><ZoomIn size={18} /></button>
    </div>
  </section>
}
