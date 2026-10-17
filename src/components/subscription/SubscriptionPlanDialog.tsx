import { Loader2, LockKeyhole, X } from 'lucide-react'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import type { PlanCreateRequest, PlanUpdateRequest, SubscriptionPlan } from '../../types/subscription'
import { trapDialogFocus } from '../../utils/dialogFocus'
import {
  buildPlanCreatePayload,
  buildPlanUpdatePayload,
  createPlanFormValues,
  validatePlanForm,
  type PlanFormValues,
} from '../../utils/subscription'

type Props = {
  mode: 'create' | 'edit'
  plan?: SubscriptionPlan
  pending: boolean
  requestError: string | null
  onClose: () => void
  onSubmit: (payload: PlanCreateRequest | PlanUpdateRequest) => Promise<void>
}

const inputClass = 'mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-3 focus:ring-slate-900/10 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500'

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return <label className="block text-sm font-medium text-slate-700"><span>{label}</span>{hint && <span className="ml-1 text-xs font-normal text-slate-400">{hint}</span>}{children}</label>
}

export default function SubscriptionPlanDialog({ mode, plan, pending, requestError, onClose, onSubmit }: Props) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const [values, setValues] = useState<PlanFormValues>(() => createPlanFormValues(plan))
  const [validationError, setValidationError] = useState<string | null>(null)
  const isEdit = mode === 'edit'

  useEffect(() => { dialogRef.current?.focus() }, [])
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => { if (event.key === 'Escape' && !pending) onClose() }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [onClose, pending])

  const change = <K extends keyof PlanFormValues>(key: K, value: PlanFormValues[K]) => {
    setValues((current) => ({ ...current, [key]: value }))
    setValidationError(null)
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (pending) return
    const error = validatePlanForm(values, mode)
    if (error) { setValidationError(error); return }
    await onSubmit(isEdit ? buildPlanUpdatePayload(values) : buildPlanCreatePayload(values))
  }

  return (
    <div className="motion-backdrop fixed inset-0 z-[80] flex items-end bg-slate-950/45 p-0 sm:items-center sm:justify-center sm:p-5" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !pending) onClose() }}>
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="subscription-plan-dialog-title" tabIndex={-1} onKeyDown={trapDialogFocus} className="motion-dialog max-h-[92vh] w-full overflow-y-auto rounded-t-2xl bg-white shadow-2xl outline-none sm:max-w-2xl sm:rounded-2xl">
        <header className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-100 bg-white px-5 py-5 sm:px-6">
          <div><h2 id="subscription-plan-dialog-title" className="text-lg font-semibold text-slate-950">{isEdit ? 'Chỉnh sửa gói dịch vụ' : 'Tạo gói dịch vụ'}</h2><p className="mt-1 text-sm text-slate-500">{isEdit ? 'Cập nhật thông tin hiển thị, giá và trạng thái của gói.' : 'Thiết lập gói mới trong danh mục dành cho nhà tuyển dụng.'}</p></div>
          <button type="button" disabled={pending} onClick={onClose} className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 disabled:opacity-50" aria-label="Đóng hộp thoại"><X size={19} aria-hidden="true" /></button>
        </header>

        <form onSubmit={(event) => void submit(event)} aria-describedby={validationError || requestError ? 'subscription-plan-error' : undefined} className="px-5 py-6 sm:px-6">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Mã gói"><input value={values.code} onChange={(event) => change('code', event.target.value.toUpperCase())} disabled={pending || isEdit} className={inputClass} autoComplete="off" placeholder="PRO_MONTHLY" required />{isEdit && <span className="mt-1.5 inline-flex items-center gap-1 text-xs text-slate-400"><LockKeyhole size={12} />Không thể thay đổi sau khi tạo</span>}</Field>
            <Field label="Tên gói"><input value={values.name} onChange={(event) => change('name', event.target.value)} disabled={pending} className={inputClass} autoComplete="off" required /></Field>
            <Field label="Giá" hint="VND"><input value={values.price} onChange={(event) => change('price', event.target.value.replace(/\D/g, ''))} disabled={pending} inputMode="numeric" className={inputClass} placeholder="99000" required /></Field>
            <Field label="Đơn vị tiền tệ"><input value={values.currency} onChange={(event) => change('currency', event.target.value.toUpperCase())} disabled={pending || isEdit} className={inputClass} maxLength={3} required /></Field>
            <Field label="Chu kỳ"><select value={values.billing_period} onChange={(event) => change('billing_period', event.target.value as PlanFormValues['billing_period'])} disabled={pending || isEdit} className={inputClass}><option value="MONTHLY">Hàng tháng</option><option value="NONE">Không chu kỳ</option></select></Field>
            <Field label="Thời hạn" hint="ngày"><input value={values.duration_days} onChange={(event) => change('duration_days', event.target.value.replace(/\D/g, ''))} disabled={pending || isEdit} inputMode="numeric" className={inputClass} placeholder="Để trống nếu không thời hạn" /></Field>
          </div>

          <div className="mt-5">
            <Field label="Quyền lợi hiển thị" hint="mỗi dòng là một mục">
              <textarea value={values.description} onChange={(event) => change('description', event.target.value)} disabled={pending} className={`${inputClass} min-h-28 resize-y py-3 leading-6`} placeholder={'Ví dụ:\nĐăng tối đa 10 tin tuyển dụng\nƯu tiên hỗ trợ'} />
            </Field>
            <p className="mt-1.5 text-xs leading-5 text-slate-500">Nội dung được hiển thị trong danh sách quyền lợi của gói dành cho nhà tuyển dụng.</p>
          </div>

          <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
            <input type="checkbox" checked={values.is_active} onChange={(event) => change('is_active', event.target.checked)} disabled={pending} className="mt-0.5 h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900" />
            <span><span className="block text-sm font-semibold text-slate-900">Cho phép cấp mới</span><span className="mt-1 block text-xs leading-5 text-slate-500">Ngừng cho phép đăng ký mới. Các đăng ký hiện tại không bị hủy.</span></span>
          </label>

          {isEdit && <p className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-900 ring-1 ring-amber-200">Giá mới áp dụng cho các đăng ký hoặc giao dịch trong tương lai.</p>}
          {(validationError || requestError) && <p id="subscription-plan-error" role="alert" className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">{validationError || requestError}</p>}

          <footer className="mt-6 flex flex-col-reverse gap-2 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end"><button type="button" disabled={pending} onClick={onClose} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-50">Hủy</button><button type="submit" disabled={pending} className="btn-press inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white hover:bg-black disabled:cursor-not-allowed disabled:opacity-50">{pending && <Loader2 size={16} className="animate-spin" aria-hidden="true" />}{pending ? 'Đang lưu…' : isEdit ? 'Lưu thay đổi' : 'Tạo gói'}</button></footer>
        </form>
      </div>
    </div>
  )
}
