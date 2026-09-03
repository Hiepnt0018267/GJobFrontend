import { CheckCircle2, LoaderCircle, XCircle } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { adminJobService } from '../../../services/adminJobService'
import type { AdminJob } from '../../../types/adminJob'
import { adminJobErrorMessage, getApiErrorStatus } from '../../../utils/apiError'

type ModerationAction = 'approve' | 'reject'

type AdminJobModerationActionsProps = {
  job: AdminJob
  onUpdated: (job: AdminJob, action: ModerationAction) => void
  onConflict: () => void
}

type ConfirmationDialogProps = {
  action: ModerationAction
  isSubmitting: boolean
  onCancel: () => void
  onConfirm: () => void
}

function ConfirmationDialog({ action, isSubmitting, onCancel, onConfirm }: ConfirmationDialogProps) {
  const cancelButtonRef = useRef<HTMLButtonElement>(null)
  const isApprove = action === 'approve'
  const title = isApprove ? 'Phê duyệt tin tuyển dụng?' : 'Từ chối tin tuyển dụng?'
  const description = isApprove
    ? 'Tin tuyển dụng sẽ được công khai cho ứng viên sau khi phê duyệt.'
    : 'Tin tuyển dụng sẽ không được hiển thị công khai.'

  useEffect(() => {
    cancelButtonRef.current?.focus()
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isSubmitting) onCancel()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isSubmitting, onCancel])

  return (
    <div className="motion-backdrop fixed inset-0 z-50 flex items-end bg-slate-950/45 p-4 sm:items-center sm:justify-center" role="presentation">
      <section role="dialog" aria-modal="true" aria-labelledby="moderation-dialog-title" aria-describedby="moderation-dialog-description" className="motion-dialog w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h2 id="moderation-dialog-title" className="text-lg font-bold text-slate-950">{title}</h2>
        <p id="moderation-dialog-description" className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button ref={cancelButtonRef} type="button" onClick={onCancel} disabled={isSubmitting} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-60">Hủy</button>
          <button type="button" onClick={onConfirm} disabled={isSubmitting} className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${isApprove ? 'bg-blue-600 hover:bg-blue-700' : 'bg-red-600 hover:bg-red-700'}`}>
            {isSubmitting && <LoaderCircle size={16} className="animate-spin" aria-hidden="true" />}
            {isSubmitting ? (isApprove ? 'Đang phê duyệt...' : 'Đang từ chối...') : (isApprove ? 'Phê duyệt' : 'Từ chối')}
          </button>
        </div>
      </section>
    </div>
  )
}

export default function AdminJobModerationActions({ job, onUpdated, onConflict }: AdminJobModerationActionsProps) {
  const [pendingAction, setPendingAction] = useState<ModerationAction | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (job.status !== 'PENDING') {
    return <p className="text-sm leading-6 text-slate-500">Tin tuyển dụng này đang ở trạng thái chỉ đọc.</p>
  }

  const submitModeration = async () => {
    if (!pendingAction || isSubmitting) return
    setIsSubmitting(true)
    setError(null)
    try {
      const updatedJob = pendingAction === 'approve'
        ? await adminJobService.approveAdminJob(job.id)
        : await adminJobService.rejectAdminJob(job.id)
      onUpdated(updatedJob, pendingAction)
      setPendingAction(null)
    } catch (requestError: unknown) {
      if (getApiErrorStatus(requestError) === 409) {
        setError('Tin tuyển dụng đã được xử lý hoặc không còn ở trạng thái chờ duyệt.')
        setPendingAction(null)
        onConflict()
      } else {
        setError(adminJobErrorMessage(requestError, 'action'))
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div>
      <p className="text-sm leading-6 text-slate-600">Hãy kiểm tra nội dung trước khi đưa ra quyết định. Hành động này không chỉnh sửa nội dung tin.</p>
      {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 px-3.5 py-3 text-sm font-medium leading-6 text-red-800 ring-1 ring-red-100">{error}</p>}
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <button type="button" onClick={() => setPendingAction('approve')} disabled={isSubmitting} className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"><CheckCircle2 size={17} aria-hidden="true" />Phê duyệt</button>
        <button type="button" onClick={() => setPendingAction('reject')} disabled={isSubmitting} className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-700 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"><XCircle size={17} aria-hidden="true" />Từ chối</button>
      </div>
      {pendingAction && <ConfirmationDialog action={pendingAction} isSubmitting={isSubmitting} onCancel={() => { if (!isSubmitting) setPendingAction(null) }} onConfirm={() => void submitModeration()} />}
    </div>
  )
}
