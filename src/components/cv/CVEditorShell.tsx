import { ArrowLeft, Eye, FileDown, FolderOpen, LayoutPanelLeft, Loader2, Palette, PlusSquare, Save, Shapes, X } from 'lucide-react'
import { useEffect, useRef } from 'react'
import type { ReactNode, RefObject } from 'react'
import { createPortal } from 'react-dom'
import { trapDialogFocus } from '../../utils/dialogFocus'
import type { CVEditorSaveState, CVEditorTool } from './cvEditorState'

const tools: Array<{ key: CVEditorTool; label: string; icon: typeof Palette }> = [
  { key: 'DESIGN', label: 'Thiết kế & Font', icon: Palette },
  { key: 'ADD_SECTION', label: 'Thêm mục', icon: PlusSquare },
  { key: 'LAYOUT', label: 'Bố cục', icon: LayoutPanelLeft },
  { key: 'TEMPLATE', label: 'Đổi mẫu CV', icon: Shapes },
  { key: 'LIBRARY', label: 'Thư viện CV', icon: FolderOpen },
]

export function CVEditorHeader({ title, status, saveState, canSubmit, printing, onTitleChange, onBack, onPreview, onPrint, onSave, previewButtonRef }: { title: string; status: string; saveState: CVEditorSaveState; canSubmit: boolean; printing: boolean; onTitleChange: (value: string) => void; onBack: () => void; onPreview: () => void; onPrint: () => void; onSave: () => void; previewButtonRef: RefObject<HTMLButtonElement | null> }) {
  const statusTone = saveState === 'ERROR'
    ? 'border-red-200 bg-red-50 text-red-700'
    : saveState === 'SAVING'
      ? 'border-slate-200 bg-slate-50 text-slate-600'
      : canSubmit
        ? 'border-amber-200 bg-amber-50 text-amber-700'
        : 'border-emerald-200 bg-emerald-50 text-emerald-700'
  const statusDot = saveState === 'ERROR' ? 'bg-red-500' : saveState === 'SAVING' ? 'bg-slate-400' : canSubmit ? 'bg-amber-500' : 'bg-emerald-500'
  return <header data-testid="cv-editor-header" className="z-40 flex h-16 shrink-0 items-center gap-3 border-b border-slate-200 bg-white px-3 sm:px-5">
    <button type="button" onClick={onBack} title="Quay lại thư viện CV" className="inline-flex h-10 items-center gap-1.5 rounded-xl px-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-950"><ArrowLeft size={18} /><span className="hidden sm:inline">Quay lại</span></button>
    <span className="h-7 w-px bg-slate-200" aria-hidden="true" />
    <input value={title} onChange={(event) => onTitleChange(event.target.value)} maxLength={255} aria-label="Tên CV" className="min-w-0 max-w-md flex-1 rounded-lg border border-transparent bg-transparent px-2 py-1.5 text-sm font-bold text-slate-950 outline-none hover:border-slate-200 focus:border-[#49BBBD] focus:bg-white" placeholder="Tên CV" />
    <div className="ml-auto flex shrink-0 items-center gap-3">
      <span role="status" className={`hidden items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold md:inline-flex ${statusTone}`}><span aria-hidden="true" className={`h-2 w-2 rounded-full ${statusDot} ${saveState === 'SAVING' ? 'animate-pulse' : ''}`} />{status}</span>
      <button ref={previewButtonRef} type="button" onClick={onPreview} title="Xem trước toàn bộ CV" className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"><Eye size={17} /><span className="hidden sm:inline">Xem trước</span></button>
      <button type="button" onClick={onPrint} disabled={printing} title="Xuất CV thành PDF" className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-wait disabled:opacity-60">{printing ? <Loader2 size={17} className="animate-spin" /> : <FileDown size={17} />}<span className="hidden sm:inline">{printing ? 'Đang chuẩn bị' : 'Xuất PDF'}</span></button>
      <button type="button" onClick={onSave} disabled={!canSubmit} title="Lưu CV (Ctrl+S)" aria-keyshortcuts="Control+S Meta+S" className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#49BBBD] px-3.5 text-sm font-semibold text-white shadow-sm hover:bg-[#3ba8aa] disabled:cursor-not-allowed disabled:opacity-50">{saveState === 'SAVING' ? <Loader2 size={17} className="animate-spin" /> : <Save size={17} />}<span>{saveState === 'SAVING' ? 'Đang lưu' : 'Lưu'}</span></button>
    </div>
  </header>
}

export function CVEditorToolRail({ activeTool, onSelect }: { activeTool: CVEditorTool | null; onSelect: (tool: CVEditorTool) => void }) {
  return <nav data-testid="cv-editor-tool-rail" aria-label="Công cụ chỉnh sửa CV" className="flex shrink-0 gap-1 overflow-x-auto rounded-xl border border-slate-200 bg-white p-2 shadow-sm lg:w-20 lg:self-start lg:flex-col lg:overflow-x-hidden lg:overflow-y-auto xl:w-[190px]">
    {tools.map(({ key, label, icon: Icon }) => {
      const selected = key === activeTool
      return <button key={key} type="button" aria-label={label} title={label} aria-pressed={selected} onClick={() => onSelect(key)} className={`group flex min-w-[72px] flex-col items-center justify-center gap-1 rounded-lg px-1 py-2 text-[11px] font-semibold leading-tight transition lg:min-h-[64px] lg:w-full lg:min-w-0 xl:min-h-[52px] xl:flex-row xl:justify-start xl:gap-3 xl:px-4 xl:text-sm ${selected ? 'bg-teal-50 text-[#49BBBD] ring-1 ring-teal-100' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'}`}><Icon size={19} className="shrink-0" aria-hidden="true" /><span className="text-center xl:text-left">{label}</span></button>
    })}
  </nav>
}

export function CVEditorContextPanel({ title, description, children, onClose }: { title: string; description: string; children: ReactNode; onClose?: () => void }) {
  return <>{onClose && <button type="button" onClick={onClose} aria-label={`Đóng bảng ${title}`} className="absolute inset-0 z-20 bg-slate-950/20 backdrop-blur-[1px] lg:hidden" />}<aside data-testid="cv-editor-context-panel" className="absolute inset-x-0 top-0 z-30 max-h-[75%] min-h-0 w-full shrink-0 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-lg lg:static lg:max-h-none lg:w-[340px] lg:shadow-sm xl:w-[400px]">
    <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-100 bg-white px-5 py-4"><div><h2 className="text-base font-bold text-slate-950">{title}</h2>{description && <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>}</div>{onClose && <button type="button" onClick={onClose} aria-label={`Đóng bảng ${title}`} className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-900"><X size={17} /></button>}</div>
    <div className="p-4">{children}</div>
  </aside></>
}

export function CVEditorWorkspace({ header, rail, panel, canvas }: { header: ReactNode; rail: ReactNode; panel: ReactNode; canvas: ReactNode }) {
  return <div data-testid="cv-editor-shell" className="flex h-full min-h-0 flex-col overflow-hidden bg-slate-100">{header}<div data-testid="cv-editor-workspace-body" className="flex min-h-0 flex-1 flex-col gap-2 p-2 lg:flex-row lg:gap-3 lg:p-3">{rail}<div className="relative flex min-h-0 min-w-0 flex-1 lg:gap-3">{panel}{canvas}</div></div></div>
}

export function CVPreviewDialog({ children, onClose, title = 'Xem trước CV', description = 'Bản xem trước gồm cả thay đổi chưa lưu.', actionLabel, onAction }: { children: ReactNode; onClose: () => void; title?: string; description?: string; actionLabel?: string; onAction?: () => void }) {
  const dialogRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    dialogRef.current?.focus()
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose() }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [onClose])
  return createPortal(<div className="fixed inset-0 z-[100] bg-slate-950/75 backdrop-blur-sm" role="presentation"><div ref={dialogRef} role="dialog" aria-modal="true" aria-label={title} tabIndex={-1} onKeyDown={trapDialogFocus} className="flex h-full flex-col outline-none"><div className="flex min-h-16 shrink-0 items-center justify-between gap-4 border-b border-white/10 bg-slate-950/70 px-5 py-2 text-white"><div className="min-w-0"><p className="truncate font-bold">{title}</p><p className="line-clamp-1 text-xs text-slate-300">{description}</p></div><div className="flex shrink-0 items-center gap-2">{actionLabel && onAction && <button type="button" onClick={onAction} className="hidden h-10 items-center rounded-xl bg-[#49BBBD] px-4 text-sm font-bold text-white shadow-sm transition hover:bg-[#3ba8aa] sm:inline-flex">{actionLabel}</button>}<button type="button" onClick={onClose} className="inline-flex h-10 w-10 items-center justify-center rounded-xl hover:bg-white/10" aria-label="Đóng xem trước"><X size={22} /></button></div></div><div className="min-h-0 flex-1 overflow-auto p-6 sm:p-10">{children}</div>{actionLabel && onAction && <div className="shrink-0 border-t border-white/10 bg-slate-950/85 p-3 sm:hidden"><button type="button" onClick={onAction} className="h-11 w-full rounded-xl bg-[#49BBBD] px-4 text-sm font-bold text-white">{actionLabel}</button></div>}</div></div>, document.body)
}

export function UnsavedChangesDialog({ onStay, onLeave }: { onStay: () => void; onLeave: () => void }) {
  const dialogRef = useRef<HTMLDivElement>(null)
  useEffect(() => { dialogRef.current?.focus() }, [])
  return <div className="fixed inset-0 z-[110] grid place-items-center bg-slate-950/50 px-4" role="presentation"><div ref={dialogRef} role="alertdialog" aria-modal="true" aria-labelledby="unsaved-title" tabIndex={-1} onKeyDown={trapDialogFocus} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl outline-none"><h2 id="unsaved-title" className="text-lg font-bold text-slate-950">Bạn có thay đổi chưa lưu</h2><p className="mt-2 text-sm leading-6 text-slate-600">Nếu rời khỏi trình chỉnh sửa, các thay đổi này sẽ bị mất.</p><div className="mt-6 flex justify-end gap-2"><button type="button" onClick={onStay} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100">Tiếp tục chỉnh sửa</button><button type="button" onClick={onLeave} className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700">Rời đi</button></div></div></div>
}
