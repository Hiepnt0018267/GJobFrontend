import { AlertCircle, Eye, FilePlus2, FileText, LoaderCircle, Pencil, RefreshCw, Star, Trash2, Upload } from 'lucide-react'
import { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import CVUploadDialog from '../../components/cv/CVUploadDialog'
import { useDataRefreshVersion } from '../../hooks/useDataRefreshVersion'
import { usePaginatedQuery } from '../../hooks/usePaginatedQuery'
import { cvService } from '../../services/cvService'
import { cvFileTypeLabel, cvSourceLabel, formatFileSize, isBuilderCV, type CV, type CVListItem, type CVListResponse } from '../../types/cv'
import { notifyDataRefresh } from '../../utils/dataRefresh'
import { cvExtractionError } from '../../utils/apiError'

const formatDate = (value: string) => new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium' }).format(new Date(value))

const uploadedCVStatus = (cv: CVListItem): { label: string; className: string } => {
  if (cv.is_verified) return { label: 'Đã xác nhận', className: 'bg-emerald-50 text-emerald-700' }
  if (cv.is_matchable) return { label: 'Sẵn sàng so khớp', className: 'bg-emerald-50 text-emerald-700' }
  if (cv.extraction_status === 'PROCESSING') return { label: 'Đang xử lý', className: 'bg-amber-50 text-amber-700' }
  if (cv.extraction_error_code === 'AI_RATE_LIMITED') return { label: 'Tạm giới hạn xử lý', className: 'bg-amber-50 text-amber-800' }
  if (cv.extraction_status === 'FAILED') return { label: 'Xử lý thất bại', className: 'bg-red-50 text-red-700' }
  return { label: 'Chưa xử lý', className: 'bg-slate-100 text-slate-600' }
}

export default function CandidateCVsPage() {
  const refreshVersion = useDataRefreshVersion()
  const [busy, setBusy] = useState<string | null>(null)
  const [extractionBusy, setExtractionBusy] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [noticeTone, setNoticeTone] = useState<'success' | 'info' | 'error'>('success')
  const [uploadOpen, setUploadOpen] = useState(false)
  const { data, error, isInitialLoading, isFetching, refetch, replaceData } = usePaginatedQuery<CVListResponse>({ queryKey: 'candidate-cvs', refreshKey: refreshVersion, fetcher: useCallback(() => cvService.getCVs(), []) })
  const items = data?.items ?? []
  const replace = (updated: CV) => replaceData({ items: items.map((item) => item.id === updated.id ? updated : { ...item, is_default: updated.is_default }), total: data?.total ?? items.length })
  const processExtraction = async (id: string, updateExisting = true) => {
    if (extractionBusy !== null) return
    setExtractionBusy(id)
    if (updateExisting) {
      replaceData({
        items: items.map((item) => item.id === id ? { ...item, extraction_status: 'PROCESSING', extraction_error_code: null } : item),
        total: data?.total ?? items.length,
      })
    }
    try {
      const result = await cvService.triggerExtraction(id)
      setNoticeTone(result.status === 'SUCCEEDED' ? 'success' : 'info')
      setNotice(result.status === 'SUCCEEDED'
        ? 'CV đã sẵn sàng để so khớp. Bạn có thể kiểm tra dữ liệu AI bất cứ lúc nào.'
        : 'CV đang được hệ thống xử lý.')
    } catch (error: unknown) {
      const mapped = cvExtractionError(error)
      setNoticeTone(mapped.kind === 'rate-limit' ? 'info' : 'error')
      setNotice(`CV vẫn được lưu an toàn. ${mapped.message}`)
    } finally {
      setExtractionBusy(null)
      refetch()
      notifyDataRefresh({ local: false })
    }
  }
  const upload = async (title: string, file: File) => {
    const created = await cvService.uploadCV(title, file)
    replaceData({
      items: [{ ...created, extraction_status: 'PROCESSING', extraction_error_code: null, is_matchable: false, is_verified: false }, ...items],
      total: items.length + 1,
    })
    setNoticeTone('info')
    setNotice('CV đã được tải lên. Hệ thống đang xử lý dữ liệu để hỗ trợ so khớp.')
    notifyDataRefresh({ local: false })
    void processExtraction(created.id, false)
    return created
  }
  const setDefault = async (id: string) => { setBusy(id); try { replace(await cvService.setDefaultCV(id)); notifyDataRefresh({ local: false }) } catch { setNoticeTone('error'); setNotice('Không thể đặt CV mặc định. Vui lòng thử lại.') } finally { setBusy(null) } }
  const remove = async (item: CVListItem) => { if (!window.confirm('Xóa CV này? Hành động này sẽ xóa tệp CV khỏi tài khoản của bạn.')) return; setBusy(item.id); try { await cvService.deleteCV(item.id); refetch(); notifyDataRefresh({ local: false }) } catch { setNoticeTone('error'); setNotice('Không thể xóa CV vì CV này có thể đã được dùng để ứng tuyển.') } finally { setBusy(null) } }

  return <div className="min-h-screen bg-slate-50"><main className="mx-auto max-w-6xl px-4 py-8 sm:px-6"><header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><h1 className="text-2xl font-bold tracking-tight text-slate-950">CV của tôi</h1><p className="mt-2 text-sm text-slate-600">Tạo CV trên GJob hoặc tải lên CV PDF/DOCX có sẵn.</p></div><div className="flex flex-wrap gap-2"><Link to="/candidate/cvs/templates" className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"><FilePlus2 size={16} />Tạo CV</Link><button type="button" disabled={extractionBusy !== null} onClick={() => setUploadOpen(true)} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-wait disabled:opacity-60">{extractionBusy ? <LoaderCircle size={16} className="animate-spin" /> : <Upload size={16} />}{extractionBusy ? 'Đang xử lý CV' : 'Tải CV lên'}</button></div></header>{notice && <p role="status" className={`mt-5 rounded-xl px-4 py-3 text-sm font-medium ${noticeTone === 'success' ? 'bg-emerald-50 text-emerald-800' : noticeTone === 'error' ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-800'}`}>{notice}</p>}{isInitialLoading && <div className="mt-8 grid gap-4 md:grid-cols-2">{[0, 1].map((index) => <div key={index} className="h-48 animate-pulse rounded-2xl bg-slate-200" />)}</div>}{Boolean(error) && data && <div className="mt-5 flex items-center gap-3 rounded-xl bg-amber-50 p-3 text-sm text-amber-800"><AlertCircle size={17} />Không thể cập nhật danh sách CV mới nhất.<button type="button" onClick={refetch} className="font-semibold underline">Thử lại</button></div>}{!isInitialLoading && !data && <div role="alert" className="mt-8 rounded-xl bg-red-50 p-4 text-sm text-red-700">Không thể tải danh sách CV. <button type="button" onClick={refetch} className="font-semibold underline">Thử lại</button></div>}{data && <section className="mt-8"><div className="flex items-center justify-between"><h2 className="text-lg font-bold text-slate-900">CV của bạn</h2>{isFetching && <span className="text-xs text-slate-500">Đang cập nhật…</span>}</div>{items.length === 0 ? <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center"><FileText className="mx-auto text-blue-600" size={34} /><h3 className="mt-4 font-bold text-slate-900">Bạn chưa có CV nào.</h3><p className="mx-auto mt-2 max-w-md text-sm text-slate-600">Bạn có thể tạo CV trực tiếp trên GJob hoặc tải lên CV có sẵn.</p></div> : <div className="mt-4 grid gap-4 md:grid-cols-2">{items.map((item) => <article key={item.id} className={`motion-card rounded-2xl bg-white p-5 ${item.is_default ? 'ring-2 ring-blue-200' : 'ring-1 ring-slate-200'}`}><div className="flex items-start justify-between gap-3"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h3 className="truncate font-bold text-slate-900">{item.title}</h3><span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">{cvSourceLabel(item)}</span>{item.is_default && <span className="rounded-full bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700">Mặc định</span>}{!isBuilderCV(item) && <span className={`rounded-full px-2 py-1 text-xs font-semibold ${uploadedCVStatus(item).className}`}>{uploadedCVStatus(item).label}</span>}</div>{isBuilderCV(item) ? <p className="mt-2 truncate text-xs text-slate-500">{item.template.name} · Cập nhật {formatDate(item.updated_at)}</p> : <p className="mt-2 truncate text-xs text-slate-500" title={item.original_filename}>{item.original_filename} · {cvFileTypeLabel(item.mime_type)} · {formatFileSize(item.file_size)}</p>}</div><FileText className="shrink-0 text-blue-600" /></div><div className="mt-5 flex flex-wrap gap-2 border-t border-slate-100 pt-4"><Link to={`/candidate/cvs/${item.id}`} className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-2.5 py-1.5 text-xs font-semibold text-blue-700"><Eye size={14} />Xem</Link>{isBuilderCV(item) && <Link to={`/candidate/cvs/${item.id}/edit`} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-700"><Pencil size={14} />Chỉnh sửa</Link>}{!isBuilderCV(item) && item.extraction_error_code === 'AI_RATE_LIMITED' && !item.is_matchable && <button type="button" disabled={extractionBusy !== null} onClick={() => void processExtraction(item.id)} className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-amber-800 hover:bg-amber-50 disabled:cursor-wait disabled:opacity-50"><RefreshCw size={14} />{extractionBusy === item.id ? 'Đang thử lại…' : 'Thử xử lý lại'}</button>}{!item.is_default && <button disabled={busy === item.id} onClick={() => void setDefault(item.id)} className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-blue-700 disabled:opacity-50"><Star size={14} />Đặt mặc định</button>}<button disabled={busy === item.id} onClick={() => void remove(item)} className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-red-600 disabled:opacity-50"><Trash2 size={14} />Xóa</button></div></article>)}</div>}</section>}{uploadOpen && <CVUploadDialog onClose={() => setUploadOpen(false)} onUpload={upload} />}</main></div>
}
