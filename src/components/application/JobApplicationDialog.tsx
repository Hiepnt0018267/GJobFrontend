import axios from 'axios'
import { AlertCircle, CheckCircle2, FilePlus2, Loader2, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { CVListItem } from '../../types/cv'
import { applicationService } from '../../services/applicationService'
import { cvService } from '../../services/cvService'

type Props = {
  jobId: string
  jobTitle: string
  companyName: string
  onClose: () => void
  onSuccess: (message: string) => void
  onCreateCV: () => void
}

type SubmissionError = {
  message: string
  marksAsApplied?: boolean
  reloadCVs?: boolean
}

const formatDate = (value: string) => new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium' }).format(new Date(value))

const getSubmissionError = (error: unknown): SubmissionError => {
  if (!axios.isAxiosError(error) || !error.response) return { message: 'Không thể kết nối tới máy chủ. Vui lòng thử lại.' }
  const detail = typeof error.response.data?.detail === 'string' ? error.response.data.detail : ''
  if (error.response.status === 409 && detail === 'You have already applied for this job.') return { message: 'Bạn đã ứng tuyển công việc này trước đó.', marksAsApplied: true }
  if (error.response.status === 409 && detail === 'This job is not accepting applications.') return { message: 'Tin tuyển dụng này hiện không còn nhận ứng tuyển.' }
  if (error.response.status === 404 && detail === 'CV not found.') return { message: 'CV đã chọn không còn tồn tại. Vui lòng chọn lại CV.', reloadCVs: true }
  if (error.response.status === 401) return { message: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.' }
  if (error.response.status === 403) return { message: 'Bạn không có quyền thực hiện thao tác này.' }
  return { message: 'Không thể gửi đơn ứng tuyển. Vui lòng thử lại.' }
}

export default function JobApplicationDialog({ jobId, jobTitle, companyName, onClose, onSuccess, onCreateCV }: Props) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const [cvs, setCvs] = useState<CVListItem[]>([])
  const [selectedCvId, setSelectedCvId] = useState<string | null>(null)
  const [isLoadingCVs, setIsLoadingCVs] = useState(true)
  const [cvLoadError, setCvLoadError] = useState<string | null>(null)
  const [applicationError, setApplicationError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [retryVersion, setRetryVersion] = useState(0)

  useEffect(() => {
    dialogRef.current?.focus()
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isSubmitting) onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isSubmitting, onClose])

  useEffect(() => {
    let active = true
    cvService.getCVs()
      .then((response) => {
        if (!active) return
        setCvs(response.items)
        setSelectedCvId(response.items.find((cv) => cv.is_default)?.id ?? null)
      })
      .catch(() => { if (active) setCvLoadError('Không thể tải danh sách CV. Vui lòng thử lại.') })
      .finally(() => { if (active) setIsLoadingCVs(false) })
    return () => { active = false }
  }, [retryVersion])

  const reloadCVs = (clearApplicationError = true) => {
    setIsLoadingCVs(true)
    setCvLoadError(null)
    if (clearApplicationError) setApplicationError(null)
    setRetryVersion((version) => version + 1)
  }

  const handleSubmitApplication = async () => {
    if (!selectedCvId || isSubmitting) return
    setApplicationError(null)
    setIsSubmitting(true)
    try {
      await applicationService.submitApplication(jobId, { cv_id: selectedCvId })
      onSuccess('Ứng tuyển thành công. Đơn ứng tuyển của bạn đã được gửi tới nhà tuyển dụng.')
    } catch (error: unknown) {
      const mapped = getSubmissionError(error)
      setApplicationError(mapped.message)
      if (mapped.reloadCVs) {
        setSelectedCvId(null)
        reloadCVs(false)
      }
      if (mapped.marksAsApplied) onSuccess(mapped.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const closeFromOverlay = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget && !isSubmitting) onClose()
  }

  return <div className="motion-backdrop fixed inset-0 z-[70] flex items-end bg-slate-950/45 p-0 sm:items-center sm:justify-center sm:p-5" role="presentation" onMouseDown={closeFromOverlay}><div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="application-dialog-title" tabIndex={-1} className="motion-dialog max-h-[92vh] w-full overflow-y-auto rounded-t-2xl bg-white shadow-2xl outline-none sm:max-w-xl sm:rounded-2xl"><header className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-5 sm:px-6"><div className="min-w-0"><h2 id="application-dialog-title" className="text-lg font-bold text-slate-950">Ứng tuyển vị trí</h2><p className="mt-1 truncate text-sm font-semibold text-blue-700">{jobTitle}</p><p className="mt-0.5 truncate text-sm text-slate-500">{companyName}</p></div><button type="button" disabled={isSubmitting} onClick={onClose} aria-label="Đóng hộp thoại ứng tuyển" className="shrink-0 rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"><X size={19} /></button></header><div className="px-5 py-5 sm:px-6">
    {applicationError && <div role="alert" className="mb-4 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"><AlertCircle size={17} className="mt-0.5 shrink-0" /><p>{applicationError}</p></div>}
    {isLoadingCVs && <div aria-label="Đang tải CV" className="space-y-3">{[0, 1].map((index) => <div key={index} className="h-20 animate-pulse rounded-xl bg-slate-100" />)}</div>}
    {!isLoadingCVs && cvLoadError && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"><p className="font-semibold">Chưa tải được CV</p><p className="mt-1">{cvLoadError}</p><button type="button" onClick={() => reloadCVs()} className="mt-3 font-semibold underline underline-offset-2">Thử lại</button></div>}
    {!isLoadingCVs && !cvLoadError && cvs.length === 0 && <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-5 py-9 text-center"><FilePlus2 className="mx-auto text-blue-600" size={30} /><h3 className="mt-3 font-bold text-slate-900">Bạn chưa có CV để ứng tuyển.</h3><p className="mt-2 text-sm leading-6 text-slate-600">Tạo CV trước khi gửi đơn ứng tuyển.</p><button type="button" onClick={onCreateCV} className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"><FilePlus2 size={16} />Tạo CV</button></div>}
    {!isLoadingCVs && !cvLoadError && cvs.length > 0 && <fieldset><legend className="text-sm font-semibold text-slate-900">Chọn CV để gửi</legend><p className="mt-1 text-xs leading-5 text-slate-500">Bạn có thể thay đổi CV được gửi cho vị trí này.</p><div className="mt-4 space-y-2">{cvs.map((cv) => <label key={cv.id} className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${selectedCvId === cv.id ? 'border-blue-500 bg-blue-50/60 ring-1 ring-blue-100' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`}><input type="radio" name="application-cv" value={cv.id} checked={selectedCvId === cv.id} onChange={() => { setSelectedCvId(cv.id); setApplicationError(null) }} className="mt-1 h-4 w-4 accent-blue-600" /><span className="min-w-0 flex-1"><span className="flex flex-wrap items-center gap-2"><span className="max-w-full truncate font-semibold text-slate-900">{cv.title}</span>{cv.is_default && <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-semibold text-blue-700">Mặc định</span>}</span><span className="mt-1 block text-xs text-slate-500">{cv.template.name} · Cập nhật {formatDate(cv.updated_at)}</span></span>{selectedCvId === cv.id && <CheckCircle2 className="mt-0.5 shrink-0 text-blue-600" size={18} aria-hidden="true" />}</label>)}</div></fieldset>}
  </div>{!isLoadingCVs && !cvLoadError && cvs.length > 0 && <footer className="sticky bottom-0 flex flex-col-reverse gap-2 border-t border-slate-100 bg-white px-5 py-4 sm:flex-row sm:justify-end sm:px-6"><button type="button" disabled={isSubmitting} onClick={onClose} className="rounded-lg px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-50">Đóng</button><button type="button" disabled={!selectedCvId || isSubmitting} onClick={() => void handleSubmitApplication()} className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">{isSubmitting && <Loader2 size={16} className="animate-spin" />}{isSubmitting ? 'Đang gửi...' : 'Xác nhận ứng tuyển'}</button></footer>}</div></div>
}
