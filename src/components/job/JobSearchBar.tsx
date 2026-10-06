import { MapPin, Search, X } from 'lucide-react'
import { useState } from 'react'

type JobSearchBarProps = {
  keyword: string
  location: string
  onSearch: (keyword: string, location: string) => void
}

export default function JobSearchBar({ keyword, location, onSearch }: JobSearchBarProps) {
  const [draftKeyword, setDraftKeyword] = useState(keyword)
  const [draftLocation, setDraftLocation] = useState(location)

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        onSearch(draftKeyword.trim(), draftLocation.trim())
      }}
      className="grid gap-2.5 rounded-2xl border border-slate-200/80 bg-white p-2.5 shadow-premium sm:grid-cols-[1.5fr_1fr_auto] sm:p-3"
      role="search"
      aria-label="Tìm kiếm việc làm"
    >
      <div className="flex min-w-0 items-center gap-2.5 rounded-xl bg-slate-50 px-3.5 py-2.5 transition-colors focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500/20">
        <Search size={17} className="shrink-0 text-slate-400" aria-hidden="true" />
        <span className="sr-only">Từ khóa tìm kiếm</span>
        <input
          value={draftKeyword}
          onChange={(event) => setDraftKeyword(event.target.value)}
          className="min-w-0 flex-1 bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400"
          placeholder="Vị trí, kỹ năng hoặc công ty..."
        />
        {draftKeyword && (
          <button
            type="button"
            onClick={() => setDraftKeyword('')}
            className="btn-press flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-500 hover:bg-slate-300 hover:text-slate-700"
            aria-label="Xóa từ khóa"
          >
            <X size={12} aria-hidden="true" />
          </button>
        )}
      </div>

      <div className="flex min-w-0 items-center gap-2.5 rounded-xl bg-slate-50 px-3.5 py-2.5 transition-colors focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500/20">
        <MapPin size={17} className="shrink-0 text-slate-400" aria-hidden="true" />
        <span className="sr-only">Địa điểm làm việc</span>
        <input
          value={draftLocation}
          onChange={(event) => setDraftLocation(event.target.value)}
          className="min-w-0 flex-1 bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400"
          placeholder="Hà Nội, TP.HCM, Toàn quốc..."
        />
        {draftLocation && (
          <button
            type="button"
            onClick={() => setDraftLocation('')}
            className="btn-press flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-500 hover:bg-slate-300 hover:text-slate-700"
            aria-label="Xóa địa điểm"
          >
            <X size={12} aria-hidden="true" />
          </button>
        )}
      </div>

      <button
        type="submit"
        className="btn-press inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
      >
        <Search size={16} aria-hidden="true" />
        Tìm việc
      </button>
    </form>
  )
}
