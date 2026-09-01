import axios from 'axios'
import { AlertCircle, ArrowLeft, BriefcaseBusiness, CalendarDays, MapPin, RefreshCw, Wallet } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import JobApplyAction from '../../components/application/JobApplyAction'
import { jobService } from '../../services/jobService'
import type { Job } from '../../types/job'
import { employmentLabel, experienceLabel, formatSalary, postedDate } from '../../utils/jobDisplay'

function errorMessage(error: unknown): string {
  if (!axios.isAxiosError(error) || !error.response) return 'Không thể kết nối tới máy chủ.'
  return error.response.status === 404 ? 'Không tìm thấy việc làm.' : error.response.status === 401 ? 'Phiên đăng nhập không hợp lệ.' : error.response.status === 403 ? 'Bạn không có quyền thực hiện thao tác này.' : error.response.status === 422 ? 'Thông tin việc làm không hợp lệ.' : error.response.status >= 500 ? 'Máy chủ đang gặp sự cố. Vui lòng thử lại.' : 'Không thể tải chi tiết việc làm. Vui lòng thử lại.'
}

function DetailSkeleton() {
  return <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6"><div className="h-5 w-44 animate-pulse rounded bg-slate-200" /><div className="mt-6 h-64 animate-pulse rounded-2xl bg-slate-200" /><div className="mt-6 h-56 animate-pulse rounded-2xl bg-slate-200" /></div>
}

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [job, setJob] = useState<Job | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [reload, setReload] = useState(0)

  useEffect(() => {
    if (!id) return
    let active = true
    jobService.getJobById(id)
      .then((response) => { if (active) setJob(response) })
      .catch((requestError: unknown) => { if (active) setError(errorMessage(requestError)) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [id, reload])

  const retry = () => {
    setLoading(true)
    setError(null)
    setReload((value) => value + 1)
  }

  if (!id) return <div className="min-h-screen bg-slate-50" />
  if (loading) return <div className="min-h-screen bg-slate-50"><DetailSkeleton /></div>
  if (error || !job) return <div className="min-h-screen bg-slate-50"><div className="mx-auto max-w-xl px-4 py-20 text-center"><AlertCircle className="mx-auto text-red-500" size={36} /><h1 className="mt-4 text-xl font-semibold text-slate-900">Không thể hiển thị việc làm</h1><p className="mt-2 text-sm text-slate-500">{error ?? 'Không tìm thấy việc làm.'}</p><div className="mt-6 flex justify-center gap-3"><Link to="/jobs" className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"><ArrowLeft size={16} />Danh sách việc làm</Link><button type="button" onClick={retry} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"><RefreshCw size={16} />Thử lại</button></div></div></div>

  return <div className="min-h-screen bg-slate-50"><div className="border-b border-slate-200 bg-white"><div className="mx-auto max-w-6xl px-4 py-5 sm:px-6 lg:px-8"><nav className="flex items-center gap-2 text-sm text-slate-500" aria-label="Breadcrumb"><Link to="/" className="hover:text-blue-600">Trang chủ</Link><span>/</span><Link to="/jobs" className="hover:text-blue-600">Việc làm</Link><span>/</span><span className="truncate text-slate-700" aria-current="page">{job.title}</span></nav></div></div><main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8"><Link to="/jobs" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-blue-600"><ArrowLeft size={16} />Quay lại danh sách</Link><div className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]"><article className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8"><div className="flex flex-col justify-between gap-5 sm:flex-row"><div className="min-w-0"><h1 className="break-words text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{job.title}</h1><p className="mt-2 break-words text-base font-semibold text-blue-600">{job.company_name}</p></div><span className="h-fit w-fit shrink-0 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700">{employmentLabel(job.employment_type)}</span></div><div className="mt-7 grid gap-3 border-y border-slate-100 py-5 text-sm text-slate-600 sm:grid-cols-2"><p className="flex items-center gap-2"><MapPin size={17} className="shrink-0 text-slate-400" />{job.location ?? 'Linh hoạt'}</p><p className="flex items-center gap-2"><Wallet size={17} className="shrink-0 text-slate-400" />{formatSalary(job)}</p><p className="flex items-center gap-2"><BriefcaseBusiness size={17} className="shrink-0 text-slate-400" />{experienceLabel(job.experience_level)}</p><p className="flex items-center gap-2"><CalendarDays size={17} className="shrink-0 text-slate-400" />{postedDate(job.created_at)}</p></div>{job.skills && job.skills.length > 0 && <section className="mt-7"><h2 className="text-lg font-semibold text-slate-900">Kỹ năng</h2><div className="mt-3 flex flex-wrap gap-2">{job.skills.map((skill) => <span key={skill} className="rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700">{skill}</span>)}</div></section>}<section className="mt-8"><h2 className="text-lg font-semibold text-slate-900">Mô tả công việc</h2><p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-600">{job.description}</p></section>{job.requirements && <section className="mt-8"><h2 className="text-lg font-semibold text-slate-900">Yêu cầu</h2><p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-600">{job.requirements}</p></section>}{job.benefits && <section className="mt-8"><h2 className="text-lg font-semibold text-slate-900">Quyền lợi</h2><p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-600">{job.benefits}</p></section>}</article><JobApplyAction job={job} /></div></main></div>
}
