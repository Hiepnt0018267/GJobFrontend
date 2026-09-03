import { useState, useEffect, useRef } from 'react'
import {
  Loader2, CheckCircle2, AlertCircle, Phone,
  MapPin, FileText, User as UserIcon, Mail,
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import type { User, UpdateProfileRequest } from '../../types/auth'
import axios from 'axios'

// ─── Error mapping ─────────────────────────────────────────────────────────────
function mapError(err: unknown): string {
  if (!axios.isAxiosError(err)) return 'Đã xảy ra lỗi không xác định. Vui lòng thử lại.'
  const status = err.response?.status
  switch (status) {
    case 400: return 'Thông tin nhập vào không hợp lệ.'
    case 401: return 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.'
    case 403: return 'Bạn không có quyền thực hiện thao tác này.'
    case 404: return 'Không tìm thấy tài khoản.'
    case 409: return 'Thông tin đã tồn tại. Vui lòng kiểm tra lại.'
    case 422: return 'Thông tin nhập vào không đúng định dạng.'
    case 500:
    case 502:
    case 503: return 'Máy chủ đang gặp sự cố. Vui lòng thử lại sau.'
    default:
      if (!err.response) return 'Không thể kết nối đến máy chủ. Kiểm tra kết nối mạng của bạn.'
      return 'Cập nhật thất bại. Vui lòng thử lại.'
  }
}

// ─── Phone validation ──────────────────────────────────────────────────────────
function isValidPhone(value: string): boolean {
  // Vietnamese phone: 10 digits, starts with 0; or international +84...
  return /^(\+84|0)[0-9]{9}$/.test(value.replace(/\s/g, ''))
}

// ─── Bio max length ────────────────────────────────────────────────────────────
const BIO_MAX = 500

// ─── Avatar initials ───────────────────────────────────────────────────────────
function Initials({ name }: { name: string }) {
  const parts = name.trim().split(/\s+/)
  const text = parts.length >= 2
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : name.charAt(0).toUpperCase()
  return (
    <div
      className="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold shrink-0 select-none"
      style={{ background: 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)' }}
      aria-hidden="true"
    >
      {text}
    </div>
  )
}

// ─── Field wrapper ─────────────────────────────────────────────────────────────
function Field({
  id, label, icon: Icon, required, error, children,
}: {
  id: string
  label: string
  icon: React.ElementType
  required?: boolean
  error?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label htmlFor={id} className="flex items-center gap-1.5 text-sm font-medium text-slate-700 mb-1.5">
        <Icon size={14} className="text-slate-400" />
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error && (
        <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
          <AlertCircle size={11} />
          {error}
        </p>
      )}
    </div>
  )
}

// ─── Input style ──────────────────────────────────────────────────────────────
function inputClass(hasError?: boolean, disabled?: boolean) {
  return [
    'w-full px-4 py-3 rounded-xl border text-sm text-slate-900 outline-none transition-all duration-200',
    'placeholder:text-slate-400',
    disabled
      ? 'bg-slate-100 text-slate-500 cursor-not-allowed border-slate-200'
      : hasError
        ? 'border-red-400 bg-white focus:ring-2 focus:ring-red-400 focus:border-red-400'
        : 'border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
  ].join(' ')
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface ProfileFormProps {
  initialData: User
  onCancel?: () => void
  onSuccess?: () => void
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function ProfileForm({ initialData, onCancel, onSuccess }: ProfileFormProps) {
  const { updateUser } = useAuth()

  const [fullName, setFullName] = useState(initialData.full_name)
  const [phone,    setPhone]    = useState(initialData.phone    ?? '')
  const [address,  setAddress]  = useState(initialData.address  ?? '')
  const [bio,      setBio]      = useState(initialData.bio      ?? '')

  const [saving,   setSaving]   = useState(false)
  const [success,  setSuccess]  = useState(false)
  const [error,    setError]    = useState<string | null>(null)
  const successTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Reset form when parent provides new initialData (e.g. after profile update syncs)
  useEffect(() => {
    // Wrap in Promise so setState is not called synchronously inside effect body
    Promise.resolve(initialData).then((d) => {
      setFullName(d.full_name)
      setPhone(d.phone    ?? '')
      setAddress(d.address  ?? '')
      setBio(d.bio      ?? '')
    })
  }, [initialData])

  // Auto-dismiss success banner
  useEffect(() => {
    if (success) {
      successTimer.current = setTimeout(() => setSuccess(false), 4000)
    }
    return () => {
      if (successTimer.current) clearTimeout(successTimer.current)
    }
  }, [success])

  // ── Validation ────────────────────────────────────────────────────────────
  const nameError    = fullName.trim() === '' ? 'Họ và tên là bắt buộc.' : undefined
  const phoneError   = phone.trim() && !isValidPhone(phone)
    ? 'Số điện thoại không hợp lệ (ví dụ: 0901234567 hoặc +84901234567).'
    : undefined
  const bioError     = bio.length > BIO_MAX ? `Giới thiệu tối đa ${BIO_MAX} ký tự.` : undefined
  const canSave      = !saving && !nameError && !phoneError && !bioError && fullName.trim() !== ''

  // ── Submit ────────────────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSave) return

    setError(null)
    setSaving(true)

    const payload: UpdateProfileRequest = {
      full_name: fullName.trim(),
      phone:     phone.trim()   || null,
      address:   address.trim() || null,
      bio:       bio.trim()     || null,
    }

    try {
      await updateUser(payload)
      setSuccess(true)
      if (onSuccess) {
        onSuccess()
      }
    } catch (err) {
      setError(mapError(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <form id="profile-form" onSubmit={handleSubmit} noValidate>
      {/* ── Avatar + basic info ── */}
      <div className="flex items-center gap-5 mb-8">
        <Initials name={fullName || initialData.full_name} />
        <div>
          <p className="text-base font-semibold text-slate-900">{fullName || initialData.full_name}</p>
          <p className="text-sm text-slate-500 mt-0.5">{initialData.email}</p>
          <p className="text-xs text-slate-400 mt-1">
            Thành viên từ {new Date(initialData.created_at).toLocaleDateString('vi-VN', { year: 'numeric', month: 'long' })}
          </p>
        </div>
      </div>

      {/* ── Success banner ── */}
      {success && (
        <div
          role="status"
          className="motion-error flex items-center gap-3 p-4 mb-6 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-700"
        >
          <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
          <span>Cập nhật thông tin thành công.</span>
        </div>
      )}

      {/* ── Error banner ── */}
      {error && (
        <div
          role="alert"
          className="motion-error flex items-start gap-3 p-4 mb-6 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700"
        >
          <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="space-y-5">
        {/* Full name */}
        <Field id="profile-full-name" label="Họ và tên" icon={UserIcon} required error={nameError}>
          <input
            id="profile-full-name"
            type="text"
            autoComplete="name"
            value={fullName}
            onChange={(e) => { setFullName(e.target.value); setError(null) }}
            placeholder="Nguyễn Văn A"
            className={inputClass(!!nameError, saving)}
            disabled={saving}
            required
          />
        </Field>

        {/* Email — readonly */}
        <Field id="profile-email" label="Email" icon={Mail}>
          <input
            id="profile-email"
            type="email"
            value={initialData.email}
            readOnly
            disabled
            className={inputClass(false, true)}
            aria-readonly="true"
          />
          <p className="mt-1 text-xs text-slate-400">Email không thể thay đổi.</p>
        </Field>

        {/* Phone */}
        <Field id="profile-phone" label="Số điện thoại" icon={Phone} error={phoneError}>
          <input
            id="profile-phone"
            type="tel"
            autoComplete="tel"
            value={phone}
            onChange={(e) => { setPhone(e.target.value); setError(null) }}
            placeholder="0901 234 567"
            className={inputClass(!!phoneError, saving)}
            disabled={saving}
          />
        </Field>

        {/* Address */}
        <Field id="profile-address" label="Địa chỉ" icon={MapPin}>
          <input
            id="profile-address"
            type="text"
            autoComplete="street-address"
            value={address}
            onChange={(e) => { setAddress(e.target.value); setError(null) }}
            placeholder="123 Đường ABC, Quận 1, TP.HCM"
            className={inputClass(false, saving)}
            disabled={saving}
          />
        </Field>

        {/* Bio */}
        <Field id="profile-bio" label="Giới thiệu bản thân" icon={FileText} error={bioError}>
          <div className="relative">
            <textarea
              id="profile-bio"
              rows={4}
              value={bio}
              onChange={(e) => { setBio(e.target.value); setError(null) }}
              placeholder="Mô tả ngắn về bản thân, kinh nghiệm, mong muốn nghề nghiệp..."
              className={[inputClass(!!bioError, saving), 'resize-none leading-relaxed'].join(' ')}
              disabled={saving}
              maxLength={BIO_MAX + 50} // soft limit via JS, not hard cut
            />
            <span
              className={`absolute bottom-3 right-3 text-xs font-medium tabular-nums ${
                bio.length > BIO_MAX ? 'text-red-500' : 'text-slate-400'
              }`}
            >
              {bio.length}/{BIO_MAX}
            </span>
          </div>
        </Field>
      </div>

      {/* ── Actions ── */}
      <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-slate-100">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            Hủy
          </button>
        )}
        <button
          id="profile-save-btn"
          type="submit"
          disabled={!canSave}
          className="
            inline-flex items-center gap-2 px-6 py-2.5
            rounded-xl text-sm font-semibold text-white
            bg-blue-600 hover:bg-blue-700 active:bg-blue-800
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
            shadow-sm shadow-blue-600/20
          "
        >
          {saving ? (
            <>
              <Loader2 size={15} className="animate-spin" />
              Đang lưu...
            </>
          ) : (
            <>
              <CheckCircle2 size={15} />
              Lưu thay đổi
            </>
          )}
        </button>
      </div>

      {/* Keyframe for success banner */}
      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </form>
  )
}
