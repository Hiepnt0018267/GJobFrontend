import { CheckCircle2, LoaderCircle, ShieldAlert, XCircle } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { adminUserService } from '../../../services/adminUserService'
import type { AdminUserDetail } from '../../../types/adminUser'
import { adminUserErrorMessage, getApiErrorStatus } from '../../../utils/apiError'

type UserStatusAction = 'activate' | 'deactivate'

type AdminUserStatusActionsProps = {
  user: AdminUserDetail
  isCurrentUser: boolean
  onUpdated: (user: AdminUserDetail, action: UserStatusAction) => void
  onConflict: () => void
}

type ConfirmationDialogProps = {
  action: UserStatusAction
  isSubmitting: boolean
  onCancel: () => void
  onConfirm: () => void
}

function ConfirmationDialog({ action, isSubmitting, onCancel, onConfirm }: ConfirmationDialogProps) {
  const cancelButtonRef = useRef<HTMLButtonElement>(null)
  const isActivate = action === 'activate'
  const title = isActivate ? 'Kích hoạt tài khoản?' : 'Vô hiệu hóa tài khoản?'
  const description = isActivate
    ? 'Người dùng sẽ có thể tiếp tục truy cập các chức năng được phép trên hệ thống.'
    : 'Người dùng sẽ không thể tiếp tục truy cập các chức năng yêu cầu đăng nhập.'

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
      <section role="dialog" aria-modal="true" aria-labelledby="user-status-dialog-title" aria-describedby="user-status-dialog-description" className="motion-dialog w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h2 id="user-status-dialog-title" className="text-lg font-bold text-slate-950">{title}</h2>
        <p id="user-status-dialog-description" className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button ref={cancelButtonRef} type="button" onClick={onCancel} disabled={isSubmitting} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-60">Hủy</button>
          <button type="button" onClick={onConfirm} disabled={isSubmitting} className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${isActivate ? 'bg-blue-600 hover:bg-blue-700' : 'bg-red-600 hover:bg-red-700'}`}>
            {isSubmitting && <LoaderCircle size={16} className="animate-spin" aria-hidden="true" />}
            {isSubmitting ? (isActivate ? 'Đang kích hoạt...' : 'Đang vô hiệu hóa...') : (isActivate ? 'Kích hoạt' : 'Vô hiệu hóa')}
          </button>
        </div>
      </section>
    </div>
  )
}

export default function AdminUserStatusActions({ user, isCurrentUser, onUpdated, onConflict }: AdminUserStatusActionsProps) {
  const [pendingAction, setPendingAction] = useState<UserStatusAction | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const action: UserStatusAction = user.is_active ? 'deactivate' : 'activate'

  const submitStatusChange = async () => {
    if (!pendingAction || isSubmitting) return
    setIsSubmitting(true)
    setError(null)
    try {
      const updatedUser = pendingAction === 'activate'
        ? await adminUserService.activateAdminUser(user.id)
        : await adminUserService.deactivateAdminUser(user.id)
      onUpdated(updatedUser, pendingAction)
      setPendingAction(null)
    } catch (requestError: unknown) {
      if (getApiErrorStatus(requestError) === 409) {
        setError(adminUserErrorMessage(requestError, pendingAction))
        setPendingAction(null)
        onConflict()
      } else {
        setError(adminUserErrorMessage(requestError, pendingAction))
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isCurrentUser) {
    return <div className="rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-600 ring-1 ring-slate-200"><p className="flex items-start gap-2 font-semibold text-slate-800"><ShieldAlert size={17} className="mt-0.5 shrink-0 text-slate-500" aria-hidden="true" />Tài khoản của bạn</p><p className="mt-2">Bạn không thể vô hiệu hóa tài khoản của chính mình.</p></div>
  }

  return (
    <div>
      <p className="text-sm leading-6 text-slate-600">Thay đổi này chỉ cập nhật quyền truy cập tài khoản, không xóa dữ liệu người dùng.</p>
      {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 px-3.5 py-3 text-sm font-medium leading-6 text-red-800 ring-1 ring-red-100">{error}</p>}
      <button type="button" onClick={() => setPendingAction(action)} disabled={isSubmitting} className={`mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${action === 'activate' ? 'bg-blue-600 text-white hover:bg-blue-700' : 'border border-red-200 bg-white text-red-700 hover:bg-red-50'}`}>
        {action === 'activate' ? <CheckCircle2 size={17} aria-hidden="true" /> : <XCircle size={17} aria-hidden="true" />}
        {action === 'activate' ? 'Kích hoạt tài khoản' : 'Vô hiệu hóa tài khoản'}
      </button>
      {pendingAction && <ConfirmationDialog action={pendingAction} isSubmitting={isSubmitting} onCancel={() => { if (!isSubmitting) setPendingAction(null) }} onConfirm={() => void submitStatusChange()} />}
    </div>
  )
}
