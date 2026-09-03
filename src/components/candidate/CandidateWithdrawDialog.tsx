import { AlertTriangle, Loader2, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { candidateApplicationErrorMessage } from '../../utils/apiError'

type Props = {
  jobTitle: string
  onClose: () => void
  onConfirm: () => Promise<void>
}

export default function CandidateWithdrawDialog({ jobTitle, onClose, onConfirm }: Props) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    dialogRef.current?.focus()
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isSubmitting) onClose()
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
      setError(candidateApplicationErrorMessage(requestError, 'withdraw'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const closeFromOverlay = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget && !isSubmitting) onClose()
  }

  return <div className="motion-backdrop fixed inset-0 z-[70] flex items-end bg-slate-950/45 p-0 sm:items-center sm:justify-center sm:p-5" role="presentation" onMouseDown={closeFromOverlay}><div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="withdraw-dialog-title" tabIndex={-1} className="motion-dialog w-full rounded-t-2xl bg-white shadow-2xl outline-none sm:max-w-lg sm:rounded-2xl"><header className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-5 sm:px-6"><div className="flex min-w-0 gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-700"><AlertTriangle size={20} aria-hidden="true" /></span><div><h2 id="withdraw-dialog-title" className="text-lg font-bold text-slate-950">Rút đơn ứng tuyển</h2><p className="mt-1 break-words text-sm font-semibold text-slate-700">{jobTitle}</p></div></div><button type="button" disabled={isSubmitting} onClick={onClose} aria-label="Đóng xác nhận rút đơn" className="shrink-0 rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"><X size={19} /></button></header><div className="px-5 py-5 text-sm leading-6 text-slate-600 sm:px-6"><p>Bạn có chắc muốn rút đơn ứng tuyển này?</p><p className="mt-3 rounded-xl bg-amber-50 px-3.5 py-3 text-amber-950 ring-1 ring-amber-100">Bạn sẽ không thể ứng tuyển lại công việc này trong phiên bản hiện tại của hệ thống.</p>{error && <p role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-red-700">{error}</p>}</div><footer className="flex flex-col-reverse gap-2 border-t border-slate-100 px-5 py-4 sm:flex-row sm:justify-end sm:px-6"><button type="button" disabled={isSubmitting} onClick={onClose} className="rounded-lg px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-50">Hủy</button><button type="button" disabled={isSubmitting} onClick={() => void confirm()} className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50">{isSubmitting && <Loader2 size={16} className="animate-spin" aria-hidden="true" />}{isSubmitting ? 'Đang rút...' : 'Rút đơn ứng tuyển'}</button></footer></div></div>
}
