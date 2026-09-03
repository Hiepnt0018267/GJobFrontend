import { AlertCircle, ArrowLeft, Check, FileText } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCallback, useEffect, useState } from 'react'
import { useDataRefreshVersion } from '../../hooks/useDataRefreshVersion'
import { isSupportedCVTemplateLayout } from '../../components/cv/cvTemplateRegistry'
import { cvTemplateService } from '../../services/cvTemplateService'
import type { CVTemplate } from '../../types/cv'

export default function CandidateCVTemplatesPage() {
  const refreshVersion = useDataRefreshVersion()
  const [templates, setTemplates] = useState<CVTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadTemplates = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setTemplates((await cvTemplateService.getCVTemplates()).items)
    } catch {
      setError('Không thể tải danh sách mẫu CV. Kiểm tra kết nối rồi thử lại.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void Promise.resolve().then(loadTemplates) }, [loadTemplates, refreshVersion])

  return <div className="min-h-screen bg-slate-50"><main className="mx-auto max-w-7xl px-4 py-8 sm:px-6"><Link to="/candidate/cvs" className="inline-flex items-center gap-1 text-sm font-semibold text-slate-600 hover:text-blue-700"><ArrowLeft size={16} />CV của tôi</Link><h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-950">Chọn mẫu CV</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Mọi mẫu dùng cùng một dữ liệu CV. Bạn có thể đổi mẫu khi đang chỉnh sửa mà không mất nội dung.</p>
    {loading && <div className="mt-8 grid gap-6 lg:grid-cols-3">{[0, 1, 2].map((index) => <div key={index} className="h-[488px] animate-pulse rounded-xl bg-slate-200" />)}</div>}
    {error && <div role="alert" className="mt-8 flex max-w-xl items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"><AlertCircle size={18} className="mt-0.5 shrink-0" /><div><p className="font-semibold">Chưa tải được mẫu CV</p><p className="mt-1">{error}</p><button type="button" onClick={() => void loadTemplates()} className="mt-3 font-semibold underline underline-offset-2">Thử lại</button></div></div>}
    {!loading && !error && templates.length === 0 && <div className="mt-8 rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center"><FileText className="mx-auto text-slate-400" size={32} /><h2 className="mt-4 font-bold text-slate-900">Chưa có mẫu CV khả dụng</h2><p className="mt-2 text-sm text-slate-600">Vui lòng quay lại sau hoặc liên hệ quản trị viên.</p></div>}
    {!loading && !error && templates.length > 0 && <div className="mt-8 grid gap-6 lg:grid-cols-3">{templates.map((template) => {
      const supported = isSupportedCVTemplateLayout(template.layout_key)
      return <article key={template.id} className="motion-card group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm hover:shadow-md"><div className="relative flex h-48 items-center justify-center overflow-hidden bg-slate-100"><FileText className="absolute text-slate-400" size={36} />{template.thumbnail_url && <img src={template.thumbnail_url} alt="" className="relative h-full w-full object-cover transition-transform duration-200 ease-out group-hover:scale-[1.01]" onError={(event) => { event.currentTarget.style.display = 'none' }} />}</div><div className="p-5"><div className="flex items-center justify-between gap-3"><div className="min-w-0"><h2 className="truncate font-bold text-slate-900">{template.name}</h2><p className="mt-1 text-xs font-semibold text-slate-500">{template.layout_key}</p></div>{template.is_featured && <span className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-blue-700"><Check size={14} />Đề xuất</span>}</div><p className="mt-2 min-h-12 text-sm leading-5 text-slate-600">{template.description || 'Mẫu CV được thiết kế để trình bày thông tin rõ ràng, chuyên nghiệp.'}</p>{supported ? <Link to={`/candidate/cvs/create?templateId=${encodeURIComponent(template.id)}`} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"><FileText size={16} />Sử dụng mẫu này</Link> : <button disabled className="mt-5 inline-flex w-full cursor-not-allowed items-center justify-center rounded-lg bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-500">Chưa hỗ trợ</button>}</div></article>
    })}</div>}
  </main></div>
}
