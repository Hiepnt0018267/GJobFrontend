import { ArrowLeft, Download, Eye, FileText, LoaderCircle, Pencil, Star, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useRef, useState, type MouseEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import CVAIReviewPanel from '../../components/cv/ai/CVAIReviewPanel'
import CVBuilderPreview from '../../components/cv/CVBuilderPreview'
import { useDataRefreshVersion } from '../../hooks/useDataRefreshVersion'
import { cvService } from '../../services/cvService'
import { cvFileTypeLabel, formatFileSize, isBuilderCV, isUploadedCV, type CV } from '../../types/cv'

export default function CandidateCVDetailPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const refreshVersion = useDataRefreshVersion()
  const [cv, setCV] = useState<CV | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [errorId, setErrorId] = useState('')
  const [isFetching, setIsFetching] = useState(true)
  const [busy, setBusy] = useState(false)
  const [reviewDirtyId, setReviewDirtyId] = useState<string | null>(null)
  const requestId = useRef(0)
  const routeId = useRef(id)
  const activeCV = cv?.id === id ? cv : null
  const activeError = errorId === id ? error : null
  const reviewDirty = reviewDirtyId === id

  const guardReviewNavigation = (event: MouseEvent<HTMLAnchorElement>) => {
    if (reviewDirty && !window.confirm('Bạn có thay đổi chưa xác nhận. Rời trang sẽ bỏ các thay đổi này.')) event.preventDefault()
  }
  const handleReviewDirtyChange = useCallback((dirty: boolean) => setReviewDirtyId(dirty ? id : null), [id])

  useEffect(() => { routeId.current = id }, [id])

  useEffect(() => {
    const controller = new AbortController()
    const activeRequest = ++requestId.current
    void Promise.resolve()
      .then(() => {
        if (controller.signal.aborted || activeRequest !== requestId.current) return undefined
        setIsFetching(true)
        return cvService.getCV(id, controller.signal)
      })
      .then((response) => {
        if (!response || activeRequest !== requestId.current || controller.signal.aborted) return
        setCV(response)
        setError(null)
        setErrorId('')
      })
      .catch((requestError: unknown) => {
        if (activeRequest !== requestId.current || controller.signal.aborted) return
        setError(requestError instanceof Error && requestError.name === 'CanceledError' ? null : 'Không thể tải dữ liệu CV mới nhất.')
        setErrorId(id)
      })
      .finally(() => {
        if (activeRequest === requestId.current && !controller.signal.aborted) setIsFetching(false)
      })
    return () => { controller.abort(); if (requestId.current === activeRequest) requestId.current += 1 }
  }, [id, refreshVersion])

  const remove = async () => {
    if (!activeCV || !window.confirm('Xóa CV này? Hành động này không thể hoàn tác.')) return
    const targetId = activeCV.id
    setBusy(true); setError(null)
    try { await cvService.deleteCV(targetId); if (routeId.current === targetId) navigate('/candidate/cvs') }
    catch { if (routeId.current === targetId) { setError('Không thể xóa CV vì CV này có thể đã được dùng để ứng tuyển.'); setErrorId(targetId) } }
    finally { setBusy(false) }
  }

  const setDefault = async () => {
    if (!activeCV) return
    const targetId = activeCV.id
    setBusy(true); setError(null)
    try { const updated = await cvService.setDefaultCV(targetId); if (routeId.current === targetId) setCV(updated) }
    catch { if (routeId.current === targetId) { setError('Không thể đặt CV mặc định.'); setErrorId(targetId) } }
    finally { setBusy(false) }
  }

  const download = async (view = false) => {
    if (!activeCV) return
    try {
      const response = await cvService.getCVFile(activeCV.id)
      const url = URL.createObjectURL(response.data)
      if (view && activeCV.mime_type === 'application/pdf') window.open(url, '_blank', 'noopener,noreferrer')
      else {
        const anchor = document.createElement('a')
        anchor.href = url
        anchor.download = activeCV.original_filename ?? activeCV.title
        anchor.click()
      }
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000)
    } catch { setError('Không thể mở file CV. Vui lòng thử lại.'); setErrorId(id) }
  }

  if (!activeCV && !activeError) return <div className="min-h-screen bg-slate-50" role="status" aria-busy="true"><span className="sr-only">Đang tải CV.</span><div className="mx-auto max-w-5xl px-4 py-8 sm:px-6"><div className="h-8 w-32 animate-pulse rounded bg-slate-200" /><div className="mt-6 h-52 animate-pulse rounded-2xl bg-slate-200" /></div></div>
  if (!activeCV) return <main className="min-h-screen bg-slate-50 px-4 py-8"><div role="alert" className="mx-auto max-w-4xl rounded-2xl bg-white p-7 text-center shadow-sm ring-1 ring-red-100"><h1 className="text-lg font-bold text-slate-950">Không thể mở CV</h1><p className="mt-2 text-sm text-red-700">{activeError ?? 'CV không còn tồn tại hoặc bạn không có quyền truy cập.'}</p><Link to="/candidate/cvs" className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white"><ArrowLeft size={16} aria-hidden="true" />CV của tôi</Link></div></main>

  const previewData = { title: activeCV.title, template_id: activeCV.template_id ?? '', personal_info: activeCV.personal_info, career_objective: activeCV.career_objective, educations: activeCV.educations, experiences: activeCV.experiences, skills: activeCV.skills, projects: activeCV.projects, certificates: activeCV.certificates, languages: activeCV.languages }

  return <div className="min-h-screen bg-slate-50"><main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
    <div className="flex items-center justify-between gap-4"><Link to="/candidate/cvs" onClick={guardReviewNavigation} className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-slate-600 transition-colors hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"><ArrowLeft size={16} aria-hidden="true" />CV của tôi</Link>{isFetching && <span role="status" className="inline-flex items-center gap-2 text-xs font-medium text-slate-500"><LoaderCircle size={14} className="animate-spin" aria-hidden="true" />Đang cập nhật</span>}</div>
    {activeError && <p role="alert" className="motion-error mt-5 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900 ring-1 ring-amber-100">{activeError} Nội dung hiện tại vẫn được giữ nguyên.</p>}

    <header className="mt-6 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-6">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
        <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h1 className="max-w-3xl break-words text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">{activeCV.title}</h1>{activeCV.is_default && <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">Mặc định</span>}</div><p className="mt-2 text-sm text-slate-600">{isBuilderCV(activeCV) ? `CV GJob · ${activeCV.template.name}` : `${cvFileTypeLabel(activeCV.mime_type)} · ${formatFileSize(activeCV.file_size)}`}</p></div>
        <div className="flex flex-wrap gap-2">{isBuilderCV(activeCV) ? <Link to={`/candidate/cvs/${activeCV.id}/edit`} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-blue-600 px-3.5 py-2 text-sm font-semibold text-white hover:bg-blue-700"><Pencil size={15} aria-hidden="true" />Chỉnh sửa</Link> : <><button type="button" onClick={() => void download(true)} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-blue-600 px-3.5 py-2 text-sm font-semibold text-white hover:bg-blue-700"><Eye size={15} aria-hidden="true" />Xem CV</button><button type="button" onClick={() => void download()} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"><Download size={15} aria-hidden="true" />Tải xuống</button></>}{!activeCV.is_default && <button type="button" disabled={busy} onClick={() => void setDefault()} className="inline-flex min-h-11 items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50 disabled:opacity-50"><Star size={15} aria-hidden="true" />Đặt mặc định</button>}<button type="button" disabled={busy} onClick={() => void remove()} className="inline-flex min-h-11 items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"><Trash2 size={15} aria-hidden="true" />Xóa</button></div>
      </div>
    </header>

    {isBuilderCV(activeCV) ? <CVBuilderPreview cv={previewData} template={activeCV.template} hasManagedPhoto={activeCV.has_managed_photo} photoEndpoint={`/api/v1/candidate/cvs/${activeCV.id}/photo`} photoVersion={activeCV.updated_at} className="mt-7 rounded-xl" /> : <>
      <section className="mt-5 flex items-start gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-6"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-blue-600"><FileText size={21} aria-hidden="true" /></span><div className="min-w-0"><h2 className="font-bold text-slate-950">Tệp CV đã tải lên</h2><p className="mt-1 break-words text-sm text-slate-600">{activeCV.original_filename}</p><p className="mt-2 text-xs text-slate-500">File gốc vẫn được giữ nguyên khi bạn phân tích hoặc xác nhận thông tin.</p></div></section>
      {isUploadedCV(activeCV) && <CVAIReviewPanel key={activeCV.id} cv={activeCV} onDirtyChange={handleReviewDirtyChange} onCVConfirmed={(updated) => { if (routeId.current === updated.id) setCV(updated) }} />}
    </>}
  </main></div>
}
