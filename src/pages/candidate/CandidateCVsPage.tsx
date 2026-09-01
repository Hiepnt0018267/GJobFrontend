import { AlertCircle, Eye, FilePlus2, FileText, Pencil, Star, Trash2, Upload } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCallback, useEffect, useState } from 'react'
import type { CVListItem } from '../../types/cv'
import { cvService } from '../../services/cvService'
import CandidateHeader from '../../components/candidate/CandidateHeader'

const formatDate = (value: string) => new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium' }).format(new Date(value))

export default function CandidateCVsPage() {
  const [items, setItems] = useState<CVListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try { setItems((await cvService.getCVs()).items) } catch { setError('Không thể tải danh sách CV. Hãy thử lại.') } finally { setLoading(false) }
  }, [])

  useEffect(() => {
    let cancelled = false
    cvService.getCVs()
      .then((response) => { if (!cancelled) setItems(response.items) })
      .catch(() => { if (!cancelled) setError('Không thể tải danh sách CV. Hãy thử lại.') })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])
  const setDefault = async (id: string) => { setBusy(id); try { await cvService.setDefaultCV(id); await load() } catch { setError('Không thể đặt CV mặc định. Hãy thử lại.') } finally { setBusy(null) } }
  const remove = async (item: CVListItem) => { if (!window.confirm(item.is_default ? 'Bạn có chắc muốn xoá CV mặc định này? Một CV khác sẽ được chọn nếu còn.' : 'Bạn có chắc muốn xoá CV này?')) return; setBusy(item.id); try { await cvService.deleteCV(item.id); await load() } catch { setError('Không thể xoá CV. Hãy thử lại.') } finally { setBusy(null) } }

  return <div className="min-h-screen bg-slate-50"><CandidateHeader /><main className="mx-auto max-w-6xl px-4 py-8 sm:px-6"><div><h1 className="text-2xl font-bold tracking-tight text-slate-950">CV của tôi</h1><p className="mt-2 text-sm text-slate-600">Tạo và quản lý CV phục vụ quá trình tìm việc.</p></div><section className="mt-7 grid gap-4 md:grid-cols-2"><article className="rounded-xl border border-blue-200 bg-white p-6"><FilePlus2 className="text-blue-600" size={24} /><h2 className="mt-4 font-bold text-slate-950">Tạo CV online</h2><p className="mt-2 text-sm leading-6 text-slate-600">Chọn mẫu CV và chỉnh sửa trực tiếp trên mẫu.</p><Link to="/candidate/cvs/templates" className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">Chọn mẫu CV</Link></article><article className="rounded-xl border border-slate-200 bg-white p-6"><div className="flex items-center justify-between"><Upload className="text-slate-400" size={24} /><span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">Sắp có</span></div><h2 className="mt-4 font-bold text-slate-950">Tải CV có sẵn</h2><p className="mt-2 text-sm leading-6 text-slate-600">Tải CV PDF/DOCX để GJob hỗ trợ trích xuất nội dung.</p><button disabled className="mt-5 inline-flex cursor-not-allowed items-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-400">Tính năng đang phát triển</button></article></section>
    {loading && <div className="mt-9 grid gap-4 md:grid-cols-2">{[0, 1].map((index) => <div key={index} className="h-44 animate-pulse rounded-xl bg-slate-200" />)}</div>}
    {error && <div role="alert" className="mt-9 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"><AlertCircle size={18} className="mt-0.5 shrink-0" /><div><p className="font-semibold">Chưa tải được danh sách CV</p><p className="mt-1">{error}</p><button type="button" onClick={() => void load()} className="mt-3 font-semibold underline underline-offset-2">Thử lại</button></div></div>}
    {!loading && !error && <section className="mt-9"><h2 className="text-lg font-bold text-slate-900">CV đã tạo</h2>{items.length === 0 && <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center"><FileText className="mx-auto text-blue-600" size={34} /><h3 className="mt-4 font-bold text-slate-900">Bạn chưa tạo CV nào.</h3><Link to="/candidate/cvs/templates" className="mt-6 inline-flex rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">Chọn mẫu CV</Link></div>}{items.length > 0 && <div className="mt-4 grid gap-4 md:grid-cols-2">{items.map((item) => <article key={item.id} className={`rounded-xl border bg-white p-5 ${item.is_default ? 'border-blue-200 ring-1 ring-blue-100' : 'border-slate-200'}`}><div className="flex items-start justify-between gap-3"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h3 className="truncate font-bold text-slate-900">{item.title}</h3>{item.is_default && <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700"><Star size={12} fill="currentColor" />Mặc định</span>}</div><p className="mt-2 text-xs text-slate-500">{item.template.name} · Cập nhật {formatDate(item.updated_at)}</p></div><FileText className="shrink-0 text-slate-300" /></div><div className="mt-6 flex flex-wrap gap-2"><Link to={`/candidate/cvs/${item.id}`} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"><Eye size={14} />Xem</Link><Link to={`/candidate/cvs/${item.id}/edit`} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"><Pencil size={14} />Chỉnh sửa</Link>{!item.is_default && <button disabled={busy === item.id} onClick={() => void setDefault(item.id)} className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-50 disabled:opacity-50"><Star size={14} />Đặt mặc định</button>}<button disabled={busy === item.id} onClick={() => void remove(item)} className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"><Trash2 size={14} />Xoá</button></div></article>)}</div>}</section>}
  </main></div>
}
