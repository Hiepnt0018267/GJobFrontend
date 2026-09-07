import axios from 'axios'
import { FileText, Loader2, Upload, X } from 'lucide-react'
import { useRef, useState } from 'react'
import { cvFileTypeLabel, formatFileSize, type CV } from '../../types/cv'

type Props = { onClose: () => void; onUpload: (title: string, file: File) => Promise<CV> }
const MAX_BYTES = 10 * 1024 * 1024

function uploadError(error: unknown): string {
  if (!axios.isAxiosError(error)) return 'Không thể tải CV lên. Vui lòng thử lại.'
  if (error.response?.status === 413) return 'File CV không được vượt quá 10 MB.'
  if (error.response?.status === 401) return 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.'
  if (error.response?.status === 403) return 'Bạn không có quyền tải CV lên.'
  const detail = typeof error.response?.data?.detail === 'string' ? error.response.data.detail : ''
  if (detail.includes('extension and declared content type')) return 'Trình duyệt gửi loại file không khớp với phần mở rộng PDF/DOCX. Hãy chọn lại file gốc.'
  if (detail.includes('PDF file is invalid')) return 'Nội dung file không phải PDF hợp lệ hoặc file đã bị hỏng. Hãy thử mở file trên máy rồi xuất/tải lại PDF.'
  if (detail.includes('DOCX file is invalid')) return 'Nội dung file DOCX không hợp lệ. Hãy xuất lại file từ Word rồi thử lại.'
  if (detail.includes('exceeds') || detail.includes('too large')) return 'File CV không được vượt quá 10 MB.'
  if (detail.includes('empty')) return 'File CV đang trống.'
  return 'File CV không hợp lệ hoặc không thể tải lên. Vui lòng kiểm tra lại và thử lại.'
}

export default function CVUploadDialog({ onClose, onUpload }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const choose = (next: File | undefined) => {
    setError(null)
    if (!next) return
    if (!/\.(pdf|docx)$/i.test(next.name)) { setError('Chỉ hỗ trợ file PDF hoặc DOCX.'); return }
    if (next.size > MAX_BYTES) { setError('File CV không được vượt quá 10 MB.'); return }
    setFile(next)
    if (!title.trim()) setTitle(next.name.replace(/\.[^.]+$/, ''))
  }
  const submit = async () => {
    if (!file || !title.trim() || uploading) return
    setUploading(true); setError(null)
    try { await onUpload(title.trim(), file); onClose() } catch (requestError: unknown) { setError(uploadError(requestError)) } finally { setUploading(false) }
  }
  return <div className="motion-backdrop fixed inset-0 z-[70] flex items-end bg-slate-950/45 sm:items-center sm:justify-center sm:p-5" onMouseDown={(event) => { if (event.target === event.currentTarget && !uploading) onClose() }}>
    <div role="dialog" aria-modal="true" aria-labelledby="upload-cv-title" className="motion-dialog w-full rounded-t-2xl bg-white shadow-2xl sm:max-w-lg sm:rounded-2xl">
      <header className="flex items-start justify-between border-b border-slate-100 px-5 py-5"><div><h2 id="upload-cv-title" className="text-lg font-bold text-slate-950">Tải CV lên</h2><p className="mt-1 text-sm text-slate-500">Hỗ trợ PDF và DOCX, tối đa 10 MB.</p></div><button type="button" disabled={uploading} onClick={onClose} aria-label="Đóng" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><X size={18} /></button></header>
      <div className="space-y-4 px-5 py-5"><label className="block text-sm font-semibold text-slate-800">Tên CV<input value={title} onChange={(event) => setTitle(event.target.value)} maxLength={255} className="input mt-2" placeholder="Ví dụ: CV Nguyễn Văn A" /></label>
        <input ref={inputRef} className="sr-only" type="file" accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={(event) => choose(event.target.files?.[0])} />
        <button type="button" onClick={() => inputRef.current?.click()} className="flex w-full items-center gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-left hover:border-blue-400 hover:bg-blue-50"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-blue-700 shadow-sm"><Upload size={19} /></span><span className="min-w-0"><span className="block font-semibold text-slate-900">{file ? file.name : 'Chọn file CV'}</span><span className="mt-0.5 block text-xs text-slate-500">{file ? `${cvFileTypeLabel(file.type)} · ${formatFileSize(file.size)}` : 'PDF hoặc DOCX'}</span></span></button>
        {error && <p role="alert" className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}</div>
      <footer className="flex flex-col-reverse gap-2 border-t border-slate-100 px-5 py-4 sm:flex-row sm:justify-end"><button type="button" disabled={uploading} onClick={onClose} className="rounded-lg px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100">Hủy</button><button type="button" disabled={!file || !title.trim() || uploading} onClick={() => void submit()} className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50">{uploading ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}{uploading ? 'Đang tải lên...' : 'Tải lên'}</button></footer>
    </div></div>
}
