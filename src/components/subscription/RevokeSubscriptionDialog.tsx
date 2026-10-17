import { AlertTriangle, Loader2, X } from 'lucide-react'
import { useEffect, useRef } from 'react'
import type { AdminRecruiterSubscriptionItem } from '../../types/subscription'
import { trapDialogFocus } from '../../utils/dialogFocus'
import { planDisplayName } from '../../utils/subscription'

type Props = { recruiter: AdminRecruiterSubscriptionItem; pending: boolean; requestError: string | null; onClose: () => void; onConfirm: () => Promise<void> }

export default function RevokeSubscriptionDialog({ recruiter, pending, requestError, onClose, onConfirm }: Props) {
  const dialogRef = useRef<HTMLDivElement>(null)
  useEffect(() => { dialogRef.current?.focus() }, [])
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => { if (event.key === 'Escape' && !pending) onClose() }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [onClose, pending])
  return <div className="motion-backdrop fixed inset-0 z-[80] flex items-end bg-slate-950/45 sm:items-center sm:justify-center sm:p-5" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !pending) onClose() }}><div ref={dialogRef} role="alertdialog" aria-modal="true" aria-labelledby="revoke-title" tabIndex={-1} onKeyDown={trapDialogFocus} className="motion-dialog w-full rounded-t-2xl bg-white p-5 shadow-2xl outline-none sm:max-w-md sm:rounded-2xl sm:p-6"><div className="flex items-start justify-between gap-4"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600 ring-1 ring-red-100"><AlertTriangle size={21} /></span><button type="button" disabled={pending} onClick={onClose} className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 disabled:opacity-50" aria-label="Đóng"><X size={18} /></button></div><h2 id="revoke-title" className="mt-5 text-lg font-semibold text-slate-950">Thu hồi gói {planDisplayName(recruiter.effective_plan)}?</h2><p className="mt-2 text-sm leading-6 text-slate-600">{recruiter.full_name} sẽ trở về gói FREE mặc định. Hành động này không xóa tài khoản nhà tuyển dụng.</p>{requestError && <p role="alert" className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">{requestError}</p>}<footer className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><button type="button" disabled={pending} onClick={onClose} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-50">Giữ nguyên</button><button type="button" disabled={pending} onClick={() => void onConfirm()} className="btn-press inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50">{pending && <Loader2 size={16} className="animate-spin" />}{pending ? 'Đang thu hồi…' : 'Thu hồi gói'}</button></footer></div></div>
}
