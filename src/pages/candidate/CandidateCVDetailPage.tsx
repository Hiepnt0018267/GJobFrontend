import { ArrowLeft, Pencil, Star, Trash2 } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useDataRefreshVersion } from '../../hooks/useDataRefreshVersion'
import CVPreview from '../../components/cv/CVPreview'
import { cvService } from '../../services/cvService'
import { cvToEditableData, type CV } from '../../types/cv'

export default function CandidateCVDetailPage() {
  const { id = '' } = useParams()
  const refreshVersion = useDataRefreshVersion()
  const navigate = useNavigate()
  const [cv, setCV] = useState<CV | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    let cancelled = false
    cvService.getCV(id).then((data) => { if (!cancelled) setCV(data) }).catch(() => { if (!cancelled) setError('Không thể tải CV này.') })
    return () => { cancelled = true }
  }, [id, refreshVersion])

  const remove = async () => {
    if (!cv || !window.confirm(cv.is_default ? 'Bạn có chắc muốn xoá CV mặc định này? Một CV khác sẽ được chọn nếu còn.' : 'Bạn có chắc muốn xoá CV này?')) return
    setBusy(true)
    try { await cvService.deleteCV(cv.id); navigate('/candidate/cvs') } catch { setError('Không thể xoá CV. Vui lòng thử lại.') } finally { setBusy(false) }
  }
  const setDefault = async () => {
    if (!cv) return
    setBusy(true)
    try { setCV(await cvService.setDefaultCV(cv.id)) } catch { setError('Không thể đặt CV mặc định.') } finally { setBusy(false) }
  }

  return <div className="min-h-screen bg-slate-50"><main className="mx-auto max-w-4xl px-4 py-8 sm:px-6"><Link to="/candidate/cvs" className="inline-flex items-center gap-1 text-sm font-semibold text-slate-600 hover:text-blue-700"><ArrowLeft size={16} />CV của tôi</Link>{error && <p role="alert" className="mt-5 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}{!cv && !error && <div className="mt-6 h-96 animate-pulse rounded-xl bg-slate-200" />}{cv && <><div className="mt-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><div className="flex items-center gap-2"><h1 className="text-2xl font-bold text-slate-950">{cv.title}</h1>{cv.is_default && <span className="rounded-full bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700">Mặc định</span>}</div><p className="mt-1 text-sm text-slate-600">Bản xem trước chỉ đọc · {cv.template.name}</p></div><div className="flex flex-wrap gap-2"><Link to={`/candidate/cvs/${cv.id}/edit`} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700"><Pencil size={15} />Chỉnh sửa</Link>{!cv.is_default && <button disabled={busy} onClick={() => void setDefault()} className="inline-flex items-center gap-2 rounded-lg border border-blue-200 px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50"><Star size={15} />Đặt mặc định</button>}<button disabled={busy} onClick={() => void remove()} className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"><Trash2 size={15} />Xoá</button></div></div><CVPreview cv={cvToEditableData(cv)} template={cv.template} className="mt-7 rounded-xl" /></>}</main></div>
}
