import { Search, X } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { APPLICATION_STATUSES, type ApplicationStatus } from '../../types/application'
import { applicationStatusLabels } from '../../utils/applicationDisplay'

export type CandidateApplicationStatusFilter = ApplicationStatus | 'ALL'

type Props = {
  search: string
  status: CandidateApplicationStatusFilter
  onSearchChange: (value: string) => void
  onStatusChange: (value: CandidateApplicationStatusFilter) => void
}

export default function CandidateApplicationFilters({ search, status, onSearchChange, onStatusChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const timer = useRef<number | null>(null)

  useEffect(() => {
    if (inputRef.current && inputRef.current.value !== search) inputRef.current.value = search
  }, [search])
  useEffect(() => () => { if (timer.current !== null) window.clearTimeout(timer.current) }, [])

  const scheduleSearch = (value: string) => {
    if (timer.current !== null) window.clearTimeout(timer.current)
    const normalized = value.trim()
    if (normalized === search) return
    timer.current = window.setTimeout(() => {
      timer.current = null
      onSearchChange(normalized)
    }, 400)
  }

  const clear = () => {
    if (timer.current !== null) window.clearTimeout(timer.current)
    if (inputRef.current) inputRef.current.value = ''
    onSearchChange('')
  }

  return (
    <section className="mt-6 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:p-5" aria-label="Tìm kiếm và lọc đơn ứng tuyển">
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_240px]">
        <label className="relative block">
          <span className="sr-only">Tìm theo công việc hoặc công ty</span>
          <Search size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
          <input ref={inputRef} defaultValue={search} onChange={(event) => scheduleSearch(event.target.value)} placeholder="Tìm theo công việc hoặc công ty..." className="peer w-full rounded-xl border border-slate-300 py-3 pl-11 pr-11 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
          <button type="button" onClick={clear} aria-label="Xóa từ khóa tìm kiếm" className="pointer-events-auto absolute right-2.5 top-1/2 inline-flex -translate-y-1/2 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 peer-placeholder-shown:pointer-events-none peer-placeholder-shown:opacity-0"><X size={16} aria-hidden="true" /></button>
        </label>
        <label>
          <span className="sr-only">Lọc trạng thái đơn ứng tuyển</span>
          <select value={status} onChange={(event) => onStatusChange(event.target.value as CandidateApplicationStatusFilter)} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100">
            <option value="ALL">Tất cả trạng thái</option>
            {APPLICATION_STATUSES.map((item) => <option key={item} value={item}>{applicationStatusLabels[item]}</option>)}
          </select>
        </label>
      </div>
    </section>
  )
}
