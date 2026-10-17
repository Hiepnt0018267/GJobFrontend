import { Loader2, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import type { AdminRecruiterSubscriptionItem, GrantSubscriptionRequest, SubscriptionPlan } from '../../types/subscription'
import { trapDialogFocus } from '../../utils/dialogFocus'
import { activePaidPlans, buildGrantPayload, formatVnd, planDisplayName, validGrantDateRange } from '../../utils/subscription'

type Props = {
  recruiter: AdminRecruiterSubscriptionItem
  plans: SubscriptionPlan[]
  pending: boolean
  requestError: string | null
  onClose: () => void
  onSubmit: (payload: GrantSubscriptionRequest) => Promise<void>
}

const inputClass = 'mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-3 focus:ring-slate-900/10 disabled:cursor-not-allowed disabled:bg-slate-100'

export default function RecruiterSubscriptionDialog({ recruiter, plans, pending, requestError, onClose, onSubmit }: Props) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const paidPlans = useMemo(() => activePaidPlans(plans), [plans])
  const [planId, setPlanId] = useState(() => paidPlans.find((plan) => plan.id === recruiter.effective_plan.id)?.id ?? paidPlans[0]?.id ?? '')
  const [startsAt, setStartsAt] = useState('')
  const [expiresAt, setExpiresAt] = useState('')
  const [validationError, setValidationError] = useState<string | null>(null)

  useEffect(() => { dialogRef.current?.focus() }, [])
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => { if (event.key === 'Escape' && !pending) onClose() }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [onClose, pending])

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (pending) return
    if (!planId) { setValidationError('Hiện chưa có gói trả phí đang hoạt động để cấp.'); return }
    if (!validGrantDateRange(startsAt, expiresAt)) { setValidationError('Thời điểm kết thúc phải sau thời điểm bắt đầu.'); return }
    try {
      await onSubmit(buildGrantPayload({ plan_id: planId, starts_at: startsAt, expires_at: expiresAt }))
    } catch (error) {
      if (error instanceof TypeError) setValidationError('Ngày giờ chưa đúng định dạng.')
    }
  }

  return (
    <div className="motion-backdrop fixed inset-0 z-[80] flex items-end bg-slate-950/45 sm:items-center sm:justify-center sm:p-5" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !pending) onClose() }}>
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="grant-subscription-title" tabIndex={-1} onKeyDown={trapDialogFocus} className="motion-dialog max-h-[92vh] w-full overflow-y-auto rounded-t-2xl bg-white shadow-2xl outline-none sm:max-w-xl sm:rounded-2xl">
        <header className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-5 sm:px-6">
          <div><h2 id="grant-subscription-title" className="text-lg font-semibold text-slate-950">Cấp hoặc đổi gói</h2><p className="mt-1 text-sm text-slate-500">{recruiter.full_name} · {recruiter.email}</p></div>
          <button type="button" disabled={pending} onClick={onClose} className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 disabled:opacity-50" aria-label="Đóng hộp thoại"><X size={19} /></button>
        </header>
        <form onSubmit={(event) => void submit(event)} aria-describedby={validationError || requestError ? 'grant-subscription-error' : undefined} className="space-y-5 px-5 py-6 sm:px-6">
          <label className="block text-sm font-medium text-slate-700">Gói trả phí
            <select value={planId} onChange={(event) => { setPlanId(event.target.value); setValidationError(null) }} disabled={pending || paidPlans.length === 0} className={inputClass} required>
              {paidPlans.length === 0 && <option value="">Không có gói đang hoạt động</option>}
              {paidPlans.map((plan) => <option key={plan.id} value={plan.id}>{planDisplayName(plan)} · {formatVnd(plan.price)}</option>)}
            </select>
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium text-slate-700">Bắt đầu <span className="font-normal text-slate-400">(tùy chọn)</span><input type="datetime-local" value={startsAt} onChange={(event) => { setStartsAt(event.target.value); setValidationError(null) }} disabled={pending} className={inputClass} /></label>
            <label className="block text-sm font-medium text-slate-700">Kết thúc <span className="font-normal text-slate-400">(tùy chọn)</span><input type="datetime-local" value={expiresAt} onChange={(event) => { setExpiresAt(event.target.value); setValidationError(null) }} disabled={pending} className={inputClass} /></label>
          </div>
          <p className="rounded-xl bg-slate-50 px-4 py-3 text-xs leading-5 text-slate-600 ring-1 ring-slate-200">Nếu để trống thời gian bắt đầu, hệ thống dùng thời điểm hiện tại. Nếu để trống thời gian kết thúc, hệ thống tính theo thời hạn của gói.</p>
          {(validationError || requestError) && <p id="grant-subscription-error" role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">{validationError || requestError}</p>}
          <footer className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end"><button type="button" disabled={pending} onClick={onClose} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-50">Hủy</button><button type="submit" disabled={pending || paidPlans.length === 0} className="btn-press inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white hover:bg-black disabled:cursor-not-allowed disabled:opacity-50">{pending && <Loader2 size={16} className="animate-spin" />}{pending ? 'Đang lưu…' : 'Xác nhận gói'}</button></footer>
        </form>
      </div>
    </div>
  )
}
