import { AlertTriangle, CheckCircle2, Loader2, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { RecruiterApplicationAction } from '../../utils/recruiterApplicationDisplay'
import { recruiterApplicationErrorMessage } from '../../utils/apiError'

type Props = {
  action: Extract<RecruiterApplicationAction, 'reject' | 'hire'>
  candidateName: string
  onClose: () => void
  onConfirm: () => Promise<void>
}

export default function RecruiterApplicationActionDialog({ action, candidateName, onClose, onConfirm }: Props) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const isReject = action === 'reject'

  useEffect(() => {
    dialogRef.current?.focus()
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isSubmitting) { onClose(); return }
      if (event.key !== 'Tab') return
      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>('button:not(:disabled), [href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])')
      if (!focusable?.length) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [isSubmitting, onClose])

  const confirm = async () => {
    if (isSubmitting) return
    setError(null)
    setIsSubmitting(true)
    try {
      await onConfirm()
      onClose()
    } catch (requestError: unknown) {
      setError(recruiterApplicationErrorMessage(requestError, 'action'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const closeFromOverlay = (event: React.MouseEvent<HTMLDivElement>) => { if (event.target === event.currentTarget && !isSubmitting) onClose() }
  const title = isReject ? 'Từ chối ứng viên' : 'Xác nhận tuyển ứng viên'
  const confirmLabel = isReject ? 'Xác nhận từ chối' : 'Xác nhận tuyển'

  return <div className="motion-backdrop fixed inset-0 z-[70] flex items-end bg-slate-950/45 p-0 sm:items-center sm:justify-center sm:p-5" role="presentation" onMouseDown={closeFromOverlay}><div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="recruiter-action-dialog-title" tabIndex={-1} className="motion-dialog w-full rounded-t-2xl bg-white shadow-2xl outline-none sm:max-w-lg sm:rounded-2xl"><header className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-5 sm:px-6"><div className="flex min-w-0 gap-3"><span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${isReject ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>{isReject ? <AlertTriangle size={20} aria-hidden="true" /> : <CheckCircle2 size={20} aria-hidden="true" />}</span><div><h2 id="recruiter-action-dialog-title" className="text-lg font-bold text-slate-950">{title}</h2><p className="mt-1 break-words text-sm font-semibold text-slate-700">{candidateName}</p></div></div><button type="button" disabled={isSubmitting} onClick={onClose} aria-label="Đóng hộp thoại xác nhận" className="shrink-0 rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"><X size={19} /></button></header><div className="px-5 py-5 text-sm leading-6 text-slate-600 sm:px-6"><p>{isReject ? 'Bạn có chắc muốn từ chối ứng viên này?' : 'Sau khi xác nhận, trạng thái sẽ chuyển sang Đã tuyển.'}</p>{error && <p role="alert" className="motion-error mt-4 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-red-700">{error}</p>}</div><footer className="flex flex-col-reverse gap-2 border-t border-slate-100 px-5 py-4 sm:flex-row sm:justify-end sm:px-6"><button type="button" disabled={isSubmitting} onClick={onClose} className="rounded-lg px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-50">Hủy</button><button type="button" disabled={isSubmitting} onClick={() => void confirm()} className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50 ${isReject ? 'bg-red-600 hover:bg-red-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}>{isSubmitting && <Loader2 size={16} className="animate-spin" aria-hidden="true" />}{isSubmitting ? 'Đang cập nhật…' : confirmLabel}</button></footer></div></div>
}
