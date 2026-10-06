import { AlertCircle, CheckCircle2, ClipboardCheck, LoaderCircle, RefreshCw } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useBeforeUnload } from 'react-router-dom'
import { useDataRefreshVersion } from '../../../hooks/useDataRefreshVersion'
import { cvService } from '../../../services/cvService'
import type { CV, CVExtraction, UploadedCV } from '../../../types/cv'
import { cvExtractionError } from '../../../utils/apiError'
import CVAIReviewForm from './CVAIReviewForm'
import { createCVReviewDraft, toCVStructuredData, type CVReviewDraft } from './cvReviewDraft'

type Props = { cv: UploadedCV; onCVConfirmed: (cv: CV) => void; onDirtyChange?: (dirty: boolean) => void }
type ViewState = 'INITIAL_LOADING' | 'PROCESSING' | 'NEEDS_RETRY' | 'SUCCEEDED_REVIEW' | 'READY' | 'CONFIRMED'

const formatDateTime = (value: string) => new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))

function stateOf(extraction: CVExtraction | null, initialLoading: boolean, isMatchable: boolean, isVerified: boolean): ViewState {
  if (initialLoading) return 'INITIAL_LOADING'
  if (isVerified || extraction?.confirmed_at) return 'CONFIRMED'
  if (extraction?.status === 'SUCCEEDED' && extraction.result) return 'SUCCEEDED_REVIEW'
  if (isMatchable) return 'READY'
  if (extraction?.status === 'PROCESSING') return 'PROCESSING'
  return 'NEEDS_RETRY'
}

function failureMessage(extraction: CVExtraction): string {
  if (extraction.error_code === 'DOCUMENT_EXTRACTION_FAILED') return 'Không thể đọc nội dung CV. Vui lòng kiểm tra tệp và thử lại.'
  return 'Chưa thể xử lý CV lúc này. Bạn có thể thử lại.'
}

export default function CVAIReviewPanel({ cv, onCVConfirmed, onDirtyChange }: Props) {
  const refreshVersion = useDataRefreshVersion()
  const [extraction, setExtraction] = useState<CVExtraction | null>(null)
  const [draft, setDraft] = useState<CVReviewDraft | null>(null)
  const [pendingLatest, setPendingLatest] = useState<CVExtraction | null>(null)
  const [initialLoading, setInitialLoading] = useState(true)
  const [isFetching, setIsFetching] = useState(false)
  const [triggering, setTriggering] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const requestId = useRef(0)
  const extractionRef = useRef<CVExtraction | null>(null)
  const dirtyRef = useRef(false)
  const manualRequest = useRef<AbortController | null>(null)
  const mutationRequest = useRef<AbortController | null>(null)

  useEffect(() => { extractionRef.current = extraction }, [extraction])
  useEffect(() => () => { manualRequest.current?.abort(); mutationRequest.current?.abort() }, [])
  useBeforeUnload(useCallback((event) => {
    if (!dirtyRef.current) return
    event.preventDefault()
    event.returnValue = ''
  }, []))

  const applyExtraction = useCallback((next: CVExtraction | null) => {
    setExtraction(next)
    extractionRef.current = next
    setPendingLatest(null)
    if (next?.status === 'SUCCEEDED' && next.result && !next.confirmed_at) setDraft(createCVReviewDraft(next.result))
    else setDraft(null)
    dirtyRef.current = false
    onDirtyChange?.(false)
  }, [onDirtyChange])

  const loadLatest = useCallback(async (options: { force?: boolean; quiet?: boolean } = {}) => {
    manualRequest.current?.abort()
    const controller = new AbortController()
    manualRequest.current = controller
    const activeRequest = ++requestId.current
    if (!options.quiet) setIsFetching(true)
    try {
      const next = await cvService.getLatestExtraction(cv.id, controller.signal)
      if (activeRequest !== requestId.current) return
      const current = extractionRef.current
      if (!options.force && dirtyRef.current && current?.status === 'SUCCEEDED' && !current.confirmed_at) {
        if (next.id !== current.id || next.confirmed_at) {
          setPendingLatest(next)
          setMessage('Thông tin CV đã thay đổi ở nơi khác. Nội dung bạn đang sửa vẫn được giữ nguyên.')
        }
        return
      }
      applyExtraction(next)
      setMessage(null)
    } catch (error: unknown) {
      if (activeRequest !== requestId.current || controller.signal.aborted) return
      const mapped = cvExtractionError(error)
      if (mapped.kind === 'not-found') {
        if (!dirtyRef.current) applyExtraction(null)
        setMessage(null)
      } else {
        setMessage(mapped.message)
      }
    } finally {
      if (activeRequest === requestId.current) {
        setInitialLoading(false)
        setIsFetching(false)
      }
    }
  }, [applyExtraction, cv.id])

  useEffect(() => {
    const controller = new AbortController()
    const activeRequest = ++requestId.current
    void Promise.resolve()
      .then(() => {
        if (controller.signal.aborted || activeRequest !== requestId.current) return undefined
        setIsFetching(true)
        return cvService.getLatestExtraction(cv.id, controller.signal)
      })
      .then((next) => {
        if (!next || activeRequest !== requestId.current || controller.signal.aborted) return
        const current = extractionRef.current
        if (dirtyRef.current && current?.status === 'SUCCEEDED' && !current.confirmed_at) {
          if (next.id !== current.id || next.confirmed_at) {
            setPendingLatest(next)
            setMessage('Thông tin CV đã thay đổi ở nơi khác. Nội dung bạn đang sửa vẫn được giữ nguyên.')
          }
          return
        }
        applyExtraction(next)
        setMessage(null)
      })
      .catch((error: unknown) => {
        if (activeRequest !== requestId.current || controller.signal.aborted) return
        const mapped = cvExtractionError(error)
        if (mapped.kind === 'not-found') {
          if (!dirtyRef.current) applyExtraction(null)
          setMessage(null)
        } else setMessage(mapped.message)
      })
      .finally(() => {
        if (activeRequest === requestId.current && !controller.signal.aborted) {
          setInitialLoading(false)
          setIsFetching(false)
        }
      })
    return () => { controller.abort(); if (requestId.current === activeRequest) requestId.current += 1 }
  }, [applyExtraction, cv.id, refreshVersion])

  const trigger = async () => {
    if (triggering) return
    mutationRequest.current?.abort()
    const controller = new AbortController()
    mutationRequest.current = controller
    setTriggering(true); setMessage(null); setSubmitError(null)
    try {
      applyExtraction(await cvService.triggerExtraction(cv.id, controller.signal))
    } catch (error: unknown) {
      if (controller.signal.aborted) return
      setMessage(cvExtractionError(error).message)
      await loadLatest({ quiet: true })
    } finally { if (!controller.signal.aborted) { setTriggering(false); setInitialLoading(false) } }
  }

  const confirm = async () => {
    if (!draft || !extraction || confirming) return
    mutationRequest.current?.abort()
    const controller = new AbortController()
    mutationRequest.current = controller
    setConfirming(true); setSubmitError(null); setMessage(null)
    try {
      const response = await cvService.confirmExtraction(cv.id, extraction.id, toCVStructuredData(draft), controller.signal)
      onCVConfirmed(response.cv)
      dirtyRef.current = false
      onDirtyChange?.(false)
      setPendingLatest(null)
      setMessage(null)
      setSubmitError(null)
      setExtraction((current) => current ? { ...current, confirmed_at: response.confirmed_at } : current)
      setDraft(null)
    } catch (error: unknown) {
      if (controller.signal.aborted) return
      const mapped = cvExtractionError(error)
      setSubmitError(mapped.message)
      if (mapped.kind === 'conflict') await loadLatest({ quiet: true })
    } finally { if (!controller.signal.aborted) setConfirming(false) }
  }

  const acceptLatest = () => {
    if (dirtyRef.current && !window.confirm('Tải trạng thái mới sẽ bỏ các thay đổi chưa xác nhận. Bạn có muốn tiếp tục?')) return
    setMessage(null)
    if (pendingLatest) applyExtraction(pendingLatest)
    else void loadLatest({ force: true })
  }

  const updateDraft = (next: CVReviewDraft) => {
    dirtyRef.current = true
    onDirtyChange?.(true)
    setDraft(next)
    setSubmitError(null)
  }

  const viewState = stateOf(extraction, initialLoading, cv.is_matchable === true, cv.is_verified === true)
  const statusAnnouncement: Record<ViewState, string> = {
    INITIAL_LOADING: 'Đang tải trạng thái CV.',
    PROCESSING: 'CV đang được xử lý.',
    NEEDS_RETRY: 'CV cần được xử lý lại.',
    SUCCEEDED_REVIEW: 'CV đã sẵn sàng. Bạn có thể kiểm tra thông tin nếu muốn.',
    READY: 'CV đã sẵn sàng.',
    CONFIRMED: 'Thông tin CV đã được cập nhật.',
  }

  if (viewState === 'INITIAL_LOADING') return <section className="mt-7 overflow-hidden rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200" aria-label="Đang tải trạng thái CV" aria-busy="true"><span role="status" className="sr-only">{statusAnnouncement.INITIAL_LOADING}</span><div className="h-5 w-44 animate-pulse rounded bg-slate-200" /><div className="mt-4 h-20 animate-pulse rounded-xl bg-slate-100" /></section>

  return <section className="mt-7" aria-labelledby="cv-ai-heading">
    <span role="status" aria-live="polite" className="sr-only">{statusAnnouncement[viewState]}</span>
    <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
      <div className="max-w-3xl"><div className="flex items-center gap-2"><ClipboardCheck size={19} className="text-blue-600" aria-hidden="true" /><h2 id="cv-ai-heading" className="text-xl font-bold tracking-tight text-slate-950">Kiểm tra thông tin CV</h2></div><p className="mt-1 text-sm leading-6 text-slate-600">CV có thể sử dụng ngay khi xử lý thành công. Bạn có thể kiểm tra và chỉnh sửa thông tin nếu cần.</p></div>
      {isFetching && <span role="status" className="inline-flex items-center gap-2 text-xs font-medium text-slate-500"><LoaderCircle size={14} className="animate-spin" aria-hidden="true" />Đang cập nhật</span>}
    </div>

    {message && <div role="alert" className="motion-error mb-4 flex flex-col gap-3 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900 ring-1 ring-amber-100 sm:flex-row sm:items-center sm:justify-between"><span className="flex items-start gap-2"><AlertCircle size={17} className="mt-0.5 shrink-0" aria-hidden="true" />{message}</span>{pendingLatest && <button type="button" onClick={acceptLatest} className="inline-flex min-h-11 shrink-0 items-center font-semibold text-blue-700 underline decoration-blue-300 underline-offset-4">Tải trạng thái mới</button>}</div>}

    {viewState === 'PROCESSING' && <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8"><LoaderCircle size={28} className="animate-spin text-blue-600" aria-hidden="true" /><h3 className="mt-4 text-lg font-bold text-slate-950">Đang xử lý</h3><p className="mt-2 text-sm leading-6 text-slate-600">Quá trình này có thể mất một chút thời gian. Bạn có thể quay lại sau; tệp CV vẫn có thể dùng để ứng tuyển.</p><button type="button" disabled={isFetching} onClick={() => void loadLatest({ force: true })} className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-semibold text-blue-700 transition-colors hover:bg-blue-50 disabled:opacity-50"><RefreshCw size={16} aria-hidden="true" />Kiểm tra trạng thái</button></div>}

    {viewState === 'NEEDS_RETRY' && <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-red-100 sm:p-8"><AlertCircle size={28} className="text-red-500" aria-hidden="true" /><h3 className="mt-4 text-lg font-bold text-slate-950">Cần thử lại</h3><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{extraction?.status === 'FAILED' ? failureMessage(extraction) : 'CV chưa được xử lý hoàn tất. Bạn có thể thử lại.'}</p><p className="mt-2 text-xs leading-5 text-slate-500">Tệp CV vẫn được lưu và vẫn có thể dùng để ứng tuyển.</p><button type="button" disabled={triggering || isFetching} onClick={() => void trigger()} aria-label="Thử lại xử lý CV" className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-700 disabled:cursor-wait disabled:opacity-60"><RefreshCw size={17} aria-hidden="true" />{triggering ? 'Đang thử lại…' : 'Thử lại'}</button></div>}

    {viewState === 'READY' && <div className="rounded-2xl bg-emerald-50 p-6 ring-1 ring-emerald-100 sm:p-8"><CheckCircle2 size={30} className="text-emerald-600" aria-hidden="true" /><h3 className="mt-4 text-lg font-bold text-emerald-950">Sẵn sàng</h3><p className="mt-2 text-sm leading-6 text-emerald-900">CV đã sẵn sàng để sử dụng và so khớp với công việc.</p></div>}

    {viewState === 'CONFIRMED' && <div className="rounded-2xl bg-emerald-50 p-6 ring-1 ring-emerald-100 sm:p-8"><CheckCircle2 size={30} className="text-emerald-600" aria-hidden="true" /><h3 className="mt-4 text-lg font-bold text-emerald-950">Thông tin CV đã được cập nhật</h3><p className="mt-2 text-sm leading-6 text-emerald-900">Thông tin bạn đã kiểm tra được lưu thành công{extraction?.confirmed_at ? ` lúc ${formatDateTime(extraction.confirmed_at)}` : ''}.</p></div>}

    {viewState === 'SUCCEEDED_REVIEW' && draft && extraction && <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_18rem]">
      <div className="min-w-0"><CVAIReviewForm draft={draft} submitting={confirming} submitError={submitError} onChange={updateDraft} onSubmit={() => void confirm()} /></div>
      <aside className="order-first rounded-2xl bg-blue-50 p-5 ring-1 ring-blue-100 lg:sticky lg:top-24 lg:order-last" aria-label="Hướng dẫn kiểm tra CV">
        <h3 className="font-bold text-blue-950">Kiểm tra tùy chọn</h3><p className="mt-2 text-sm leading-6 text-blue-900">CV đã sẵn sàng để sử dụng. Bạn có thể đọc lại từng phần và sửa thông tin chưa chính xác.</p>
        <dl className="mt-5 grid grid-cols-2 gap-3 text-sm lg:grid-cols-1"><div><dt className="text-xs text-blue-700">Kinh nghiệm</dt><dd className="mt-0.5 font-bold tabular-nums text-blue-950">{draft.experiences.length}</dd></div><div><dt className="text-xs text-blue-700">Học vấn</dt><dd className="mt-0.5 font-bold tabular-nums text-blue-950">{draft.educations.length}</dd></div><div><dt className="text-xs text-blue-700">Kỹ năng</dt><dd className="mt-0.5 font-bold tabular-nums text-blue-950">{draft.skills.length}</dd></div><div><dt className="text-xs text-blue-700">Dự án</dt><dd className="mt-0.5 font-bold tabular-nums text-blue-950">{draft.projects.length}</dd></div></dl>
      </aside>
    </div>}
  </section>
}
