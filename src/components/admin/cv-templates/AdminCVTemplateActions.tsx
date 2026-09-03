import { LoaderCircle, Sparkles, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminCVTemplateService } from '../../../services/adminCVTemplateService'
import type { AdminCVTemplate } from '../../../types/adminCVTemplate'
import { adminCVTemplateErrorMessage, getApiErrorStatus } from '../../../utils/apiError'

type Action = 'activate' | 'deactivate' | 'feature' | 'unfeature' | 'delete'

type Props = {
  template: AdminCVTemplate
  onUpdated: (template: AdminCVTemplate, action: Exclude<Action, 'delete'>) => void
  onDeleted?: () => void
  onConflict: (message: string) => void
}

const labels: Record<Action, string> = {
  activate: 'Kích hoạt',
  deactivate: 'Ngừng hoạt động',
  feature: 'Đánh dấu nổi bật',
  unfeature: 'Bỏ nổi bật',
  delete: 'Xóa mẫu CV',
}

export default function AdminCVTemplateActions({ template, onUpdated, onDeleted, onConflict }: Props) {
  const navigate = useNavigate()
  const [pending, setPending] = useState<Action | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const canDelete = template.usage_count === 0 || !template.is_active

  const execute = async () => {
    if (!pending || busy) return
    setBusy(true)
    setError(null)
    try {
      if (pending === 'delete') {
        await adminCVTemplateService.deleteAdminCVTemplate(template.id)
        setPending(null)
        if (onDeleted) onDeleted()
        else navigate('/admin/cv-templates', { replace: true })
        return
      }

      const updated = pending === 'activate'
        ? await adminCVTemplateService.activateAdminCVTemplate(template.id)
        : pending === 'deactivate'
          ? await adminCVTemplateService.deactivateAdminCVTemplate(template.id)
          : pending === 'feature'
            ? await adminCVTemplateService.featureAdminCVTemplate(template.id)
            : await adminCVTemplateService.unfeatureAdminCVTemplate(template.id)
      onUpdated(updated, pending)
      setPending(null)
    } catch (requestError: unknown) {
      setError(adminCVTemplateErrorMessage(requestError, 'action'))
      setPending(null)
      if (getApiErrorStatus(requestError) === 409) {
        onConflict(
          pending === 'delete'
            ? 'Mẫu CV này đã thay đổi. Dữ liệu mới đã được tải lại.'
            : 'Trạng thái mẫu CV đã thay đổi. Dữ liệu mới đã được tải lại.',
        )
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <div className="grid gap-2 sm:grid-cols-2">
        <button
          type="button"
          disabled={busy}
          onClick={() => setPending(template.is_active ? 'deactivate' : 'activate')}
          className={template.is_active
            ? 'rounded-xl border border-red-200 px-3 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-60'
            : 'rounded-xl bg-blue-600 px-3 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60'}
        >
          {template.is_active ? 'Ngừng hoạt động' : 'Kích hoạt'}
        </button>
        {template.is_active && (
          <button type="button" disabled={busy} onClick={() => setPending(template.is_featured ? 'unfeature' : 'feature')} className="inline-flex items-center justify-center gap-2 rounded-xl border border-amber-200 px-3 py-2.5 text-sm font-semibold text-amber-800 hover:bg-amber-50 disabled:opacity-60">
            <Sparkles size={16} />
            {template.is_featured ? 'Bỏ nổi bật' : 'Đánh dấu nổi bật'}
          </button>
        )}
        <button type="button" disabled={busy || !canDelete} onClick={() => setPending('delete')} className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 px-3 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50">
          <Trash2 size={16} />
          Xóa mẫu CV
        </button>
      </div>

      {!canDelete && <p className="mt-3 text-xs leading-5 text-slate-600">Mẫu này đang được dùng. Hãy ngừng hoạt động trước khi xóa để CV lịch sử vẫn được giữ nguyên.</p>}
      {error && <p role="alert" className="mt-3 text-sm font-medium text-red-700">{error}</p>}

      {pending && (
        <div className="fixed inset-0 z-50 flex items-end bg-slate-950/45 p-4 sm:items-center sm:justify-center">
          <section role="dialog" aria-modal="true" aria-labelledby="template-action-title" className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 id="template-action-title" className="text-lg font-bold text-slate-950">{labels[pending]}?</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {pending === 'delete'
                ? 'Mẫu sẽ bị xóa khỏi danh mục. Ứng viên không thể tạo CV mới hoặc đổi sang mẫu này, nhưng các CV đã tạo bằng mẫu này vẫn mở bình thường.'
                : pending === 'deactivate'
                  ? 'Mẫu CV sẽ không còn xuất hiện để ứng viên chọn cho CV mới, nhưng các CV hiện đang sử dụng mẫu này vẫn được giữ nguyên.'
                  : `Bạn có chắc muốn ${labels[pending].toLowerCase()}?`}
            </p>
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button type="button" disabled={busy} onClick={() => setPending(null)} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700">Hủy</button>
              <button type="button" disabled={busy} onClick={() => void execute()} className={`inline-flex justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white ${pending === 'deactivate' || pending === 'delete' ? 'bg-red-600' : 'bg-blue-600'}`}>
                {busy && <LoaderCircle size={16} className="animate-spin" />}
                {busy ? 'Đang cập nhật...' : labels[pending]}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  )
}
