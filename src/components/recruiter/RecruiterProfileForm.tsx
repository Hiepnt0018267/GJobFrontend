import {
  AlertCircle,
  Building2,
  CheckCircle2,
  FileText,
  Globe2,
  ImageUp,
  Loader2,
  MapPin,
  Phone,
  Trash2,
  UserRound,
  Users,
} from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'
import type { ChangeEvent, FormEvent, ReactNode } from 'react'
import { recruiterService } from '../../services/recruiterService'
import type { RecruiterProfile, RecruiterProfileUpdate } from '../../types/recruiter'
import { recruiterErrorMessage } from '../../utils/apiError'
import { safeImageUrl } from '../../utils/publicUrl'

type Props = {
  profile: RecruiterProfile
  onSaved: (profile: RecruiterProfile) => void
  onCancel: () => void
}

type FieldProps = {
  label: string
  hint?: string
  icon: typeof UserRound
  children: ReactNode
}

const MAX_LOGO_SIZE = 5 * 1024 * 1024
const ACCEPTED_LOGO_TYPES = ['image/jpeg', 'image/png', 'image/webp']

function Field({ label, hint, icon: Icon, children }: FieldProps) {
  return (
    <label className="block">
      <span className="flex items-center gap-2 text-sm font-semibold text-slate-700">
        <Icon size={15} className="text-slate-400" />
        {label}
      </span>
      {children}
      {hint && <span className="mt-1 block text-xs text-slate-400">{hint}</span>}
    </label>
  )
}

const inputClass =
  'mt-2 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-[#1C1C1C] focus:ring-2 focus:ring-[#1C1C1C]/10 disabled:cursor-not-allowed disabled:bg-slate-50'

export default function RecruiterProfileForm({ profile, onSaved, onCancel }: Props) {
  const logoInputId = useId()
  const previewObjectUrl = useRef<string | null>(null)
  const [form, setForm] = useState({
    full_name: profile.full_name,
    phone: profile.phone ?? '',
    company_name: profile.company_name ?? '',
    company_website: profile.company_website ?? '',
    company_address: profile.company_address ?? '',
    industry: profile.industry ?? '',
    company_size: profile.company_size?.toString() ?? '',
    company_description: profile.company_description ?? '',
  })
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(() => safeImageUrl(profile.company_logo_url))
  const [removeExistingLogo, setRemoveExistingLogo] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(
    () => () => {
      if (previewObjectUrl.current) URL.revokeObjectURL(previewObjectUrl.current)
    },
    [],
  )

  const change = (key: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [key]: value }))
    setError(null)
    setSuccess(false)
  }

  function selectLogo(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    if (!ACCEPTED_LOGO_TYPES.includes(file.type)) {
      setError('Logo phải là ảnh JPG, PNG hoặc WEBP.')
      return
    }
    if (file.size > MAX_LOGO_SIZE) {
      setError('Dung lượng logo không được vượt quá 5 MB.')
      return
    }

    if (previewObjectUrl.current) URL.revokeObjectURL(previewObjectUrl.current)
    const nextPreview = URL.createObjectURL(file)
    previewObjectUrl.current = nextPreview
    setLogoFile(file)
    setLogoPreview(nextPreview)
    setRemoveExistingLogo(false)
    setError(null)
    setSuccess(false)
  }

  function removeLogo() {
    if (previewObjectUrl.current) {
      URL.revokeObjectURL(previewObjectUrl.current)
      previewObjectUrl.current = null
    }
    setLogoFile(null)
    setLogoPreview(null)
    setRemoveExistingLogo(Boolean(profile.company_logo_url))
    setError(null)
    setSuccess(false)
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!form.full_name.trim()) {
      setError('Họ và tên là bắt buộc.')
      return
    }

    const size = form.company_size.trim() ? Number(form.company_size) : null
    if (size !== null && (!Number.isInteger(size) || size < 1)) {
      setError('Quy mô công ty phải là số nguyên dương.')
      return
    }

    const emptyToNull = (value: string) => value.trim() || null
    const payload: RecruiterProfileUpdate = {
      full_name: form.full_name.trim(),
      phone: emptyToNull(form.phone),
      company_name: emptyToNull(form.company_name),
      company_website: emptyToNull(form.company_website),
      company_address: emptyToNull(form.company_address),
      industry: emptyToNull(form.industry),
      company_size: size,
      company_description: emptyToNull(form.company_description),
    }

    setSaving(true)
    setError(null)
    try {
      let updated = await recruiterService.updateMyRecruiterProfile(payload)
      if (logoFile) updated = await recruiterService.uploadCompanyLogo(logoFile)
      else if (removeExistingLogo) updated = await recruiterService.deleteCompanyLogo()
      setSuccess(true)
      onSaved(updated)
    } catch (requestError) {
      setError(recruiterErrorMessage(requestError))
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-7">
      <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
        <span className="font-semibold text-slate-700">Email đăng nhập:</span> {profile.email}
      </div>

      {success && (
        <div role="status" className="flex items-center gap-2 rounded-xl bg-slate-100 p-4 text-sm text-slate-800 ring-1 ring-slate-200">
          <CheckCircle2 size={17} />
          Cập nhật hồ sơ thành công.
        </div>
      )}
      {error && (
        <div role="alert" className="flex items-start gap-2 rounded-xl bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle size={17} className="mt-0.5 shrink-0" />
          {error}
        </div>
      )}

      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Họ và tên" icon={UserRound}>
          <input value={form.full_name} onChange={(event) => change('full_name', event.target.value)} className={inputClass} disabled={saving} autoComplete="name" required />
        </Field>
        <Field label="Số điện thoại" icon={Phone}>
          <input value={form.phone} onChange={(event) => change('phone', event.target.value)} className={inputClass} disabled={saving} autoComplete="tel" placeholder="0901 234 567" />
        </Field>
      </div>

      <div className="border-t border-slate-100 pt-7">
        <h2 className="text-base font-bold text-slate-900">Thông tin công ty</h2>
        <p className="mt-1 text-sm text-slate-500">Thông tin này sẽ xuất hiện trong hồ sơ nhà tuyển dụng.</p>

        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <Field label="Tên công ty" icon={Building2}>
            <input value={form.company_name} onChange={(event) => change('company_name', event.target.value)} className={inputClass} disabled={saving} placeholder="Tên doanh nghiệp" />
          </Field>
          <Field label="Website" icon={Globe2}>
            <input type="url" value={form.company_website} onChange={(event) => change('company_website', event.target.value)} className={inputClass} disabled={saving} placeholder="https://example.com" />
          </Field>
          <Field label="Địa chỉ công ty" icon={MapPin}>
            <input value={form.company_address} onChange={(event) => change('company_address', event.target.value)} className={inputClass} disabled={saving} autoComplete="street-address" placeholder="Tỉnh/Thành phố, Quốc gia" />
          </Field>
          <Field label="Ngành nghề" icon={Building2}>
            <input value={form.industry} onChange={(event) => change('industry', event.target.value)} className={inputClass} disabled={saving} placeholder="Công nghệ, Tài chính..." />
          </Field>
          <Field label="Quy mô công ty" icon={Users} hint="Số lượng nhân sự">
            <input type="number" min="1" value={form.company_size} onChange={(event) => change('company_size', event.target.value)} className={inputClass} disabled={saving} placeholder="Ví dụ: 50" />
          </Field>

          <div>
            <span className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <ImageUp size={15} className="text-slate-400" />
              Logo công ty
            </span>
            <div className="mt-2 flex h-[2.9375rem] items-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-2.5">
              <div className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-white">
                {logoPreview ? (
                  <img src={logoPreview} alt="Xem trước logo công ty" className="size-full object-contain p-1" />
                ) : (
                  <Building2 size={16} className="text-slate-300" />
                )}
              </div>
              <p className="min-w-0 flex-1 truncate text-xs font-medium text-slate-600">
                {logoFile?.name ?? (logoPreview ? 'Logo hiện tại' : 'Chưa có logo')}
              </p>
              <label htmlFor={logoInputId} className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-100">
                <ImageUp size={13} />
                {logoPreview ? 'Đổi' : 'Chọn ảnh'}
              </label>
              {logoPreview && (
                <button type="button" onClick={removeLogo} disabled={saving} aria-label="Xóa logo công ty" title="Xóa logo" className="inline-flex size-7 shrink-0 items-center justify-center rounded-lg text-red-600 transition hover:bg-red-50 disabled:opacity-50">
                  <Trash2 size={14} />
                </button>
              )}
            </div>
            <span className="mt-1 block text-xs text-slate-400">JPG, PNG, WEBP · tối đa 5 MB</span>
            <input id={logoInputId} type="file" accept="image/jpeg,image/png,image/webp" onChange={selectLogo} disabled={saving} className="sr-only" />
          </div>
        </div>

        <div className="mt-5">
          <Field label="Giới thiệu công ty" icon={FileText}>
            <textarea value={form.company_description} onChange={(event) => change('company_description', event.target.value)} className={`${inputClass} min-h-32 resize-y leading-relaxed`} disabled={saving} placeholder="Mô tả ngắn về doanh nghiệp, văn hóa và lĩnh vực hoạt động." />
          </Field>
        </div>
      </div>

      <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">
        <button type="button" onClick={onCancel} disabled={saving} className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50">
          Hủy
        </button>
        <button type="submit" disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1C1C1C] px-5 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60">
          {saving ? <><Loader2 size={16} className="animate-spin" />Đang lưu...</> : <><CheckCircle2 size={16} />Lưu thay đổi</>}
        </button>
      </div>
    </form>
  )
}
