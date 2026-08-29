import { MapPin, Search } from 'lucide-react'
import { useState } from 'react'

type JobSearchBarProps = { keyword: string; location: string; onSearch: (keyword: string, location: string) => void }

export default function JobSearchBar({ keyword, location, onSearch }: JobSearchBarProps) {
  const [draftKeyword, setDraftKeyword] = useState(keyword)
  const [draftLocation, setDraftLocation] = useState(location)

  return <form onSubmit={(event) => { event.preventDefault(); onSearch(draftKeyword.trim(), draftLocation.trim()) }} className="grid gap-3 rounded-2xl bg-white p-3 shadow-lg shadow-slate-900/5 sm:grid-cols-[1fr_1fr_auto] sm:p-4" role="search">
    <label className="flex min-w-0 items-center gap-3 rounded-xl bg-slate-50 px-4 py-3 ring-1 ring-slate-200 focus-within:ring-2 focus-within:ring-blue-500"><Search size={18} className="shrink-0 text-slate-400" aria-hidden="true" /><span className="sr-only">Từ khóa</span><input value={draftKeyword} onChange={(event) => setDraftKeyword(event.target.value)} className="min-w-0 flex-1 bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400" placeholder="Vị trí, kỹ năng hoặc công ty" /></label>
    <label className="flex min-w-0 items-center gap-3 rounded-xl bg-slate-50 px-4 py-3 ring-1 ring-slate-200 focus-within:ring-2 focus-within:ring-blue-500"><MapPin size={18} className="shrink-0 text-slate-400" aria-hidden="true" /><span className="sr-only">Địa điểm</span><input value={draftLocation} onChange={(event) => setDraftLocation(event.target.value)} className="min-w-0 flex-1 bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400" placeholder="Địa điểm làm việc" /></label>
    <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"><Search size={17} aria-hidden="true" />Tìm việc</button>
  </form>
}
