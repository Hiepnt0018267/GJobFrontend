import { Search, X, RotateCcw } from 'lucide-react'
import { useEffect, useRef } from 'react'

export type TemplateBooleanFilter = 'ALL' | 'TRUE' | 'FALSE'

type Props = {
  search: string
  active: TemplateBooleanFilter
  featured: TemplateBooleanFilter
  onSearchChange: (value: string) => void
  onActiveChange: (value: TemplateBooleanFilter) => void
  onFeaturedChange: (value: TemplateBooleanFilter) => void
}

const activeOptions = [
  { value: 'ALL', label: 'Tất cả trạng thái' },
  { value: 'TRUE', label: 'Đang hoạt động' },
  { value: 'FALSE', label: 'Ngừng hoạt động' },
] as const

const featuredOptions = [
  { value: 'ALL', label: 'Tất cả tiêu điểm' },
  { value: 'TRUE', label: 'Mẫu nổi bật' },
  { value: 'FALSE', label: 'Không nổi bật' },
] as const

export default function AdminCVTemplateFilters({
  search,
  active,
  featured,
  onSearchChange,
  onActiveChange,
  onFeaturedChange,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const timer = useRef<number | null>(null)

  useEffect(() => {
    if (inputRef.current && inputRef.current.value !== search) inputRef.current.value = search
  }, [search])

  useEffect(() => () => {
    if (timer.current !== null) window.clearTimeout(timer.current)
  }, [])

  const schedule = (value: string) => {
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

  const hasActiveFilters = Boolean(search || active !== 'ALL' || featured !== 'ALL')

  const handleReset = () => {
    clear()
    onActiveChange('ALL')
    onFeaturedChange('ALL')
  }

  return (
    <section className="mt-5 flex flex-wrap items-center gap-2.5" aria-label="Tìm kiếm và lọc mẫu CV">
      {/* Compact Search Input */}
      <label className="relative min-w-0 w-full sm:w-72 md:w-80">
        <span className="sr-only">Tìm mẫu CV</span>
        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
        <input
          ref={inputRef}
          defaultValue={search}
          onChange={(event) => schedule(event.target.value)}
          placeholder="Tìm mẫu CV..."
          className="h-10 w-full rounded-xl border border-slate-200/90 bg-white py-2 pl-9 pr-8 text-xs sm:text-sm text-slate-900 shadow-2xs placeholder:text-slate-400 outline-none transition-all duration-150 hover:border-slate-300 focus:border-[#1C1C1C] focus:ring-3 focus:ring-black/10"
        />
        <button
          type="button"
          onClick={clear}
          aria-label="Xóa từ khóa tìm kiếm"
          className="pointer-events-auto absolute right-2.5 top-1/2 inline-flex -translate-y-1/2 rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-200/70 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1C1C1C] peer-placeholder-shown:pointer-events-none peer-placeholder-shown:opacity-0"
        >
          <X size={14} aria-hidden="true" />
        </button>
      </label>

      {/* Active Status Select */}
      <label className="min-w-0 w-44 flex-1 sm:flex-initial">
        <span className="sr-only">Lọc trạng thái hoạt động</span>
        <select
          value={active}
          onChange={(event) => onActiveChange(event.target.value as TemplateBooleanFilter)}
          className="h-10 w-full rounded-xl border border-slate-200/90 bg-white shadow-2xs px-3 text-xs sm:text-sm font-medium text-slate-700 outline-none transition-all duration-150 hover:border-slate-300 focus:border-[#1C1C1C] focus:ring-3 focus:ring-black/10"
        >
          {activeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      {/* Featured Status Select */}
      <label className="min-w-0 w-44 flex-1 sm:flex-initial">
        <span className="sr-only">Lọc trạng thái nổi bật</span>
        <select
          value={featured}
          onChange={(event) => onFeaturedChange(event.target.value as TemplateBooleanFilter)}
          className="h-10 w-full rounded-xl border border-slate-200/90 bg-white shadow-2xs px-3 text-xs sm:text-sm font-medium text-slate-700 outline-none transition-all duration-150 hover:border-slate-300 focus:border-[#1C1C1C] focus:ring-3 focus:ring-black/10"
        >
          {featuredOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      {/* Quick Reset Button */}
      {hasActiveFilters && (
        <button
          type="button"
          onClick={handleReset}
          className="inline-flex items-center gap-1.5 h-10 px-3 text-xs font-semibold text-slate-500 hover:text-red-600 hover:bg-red-50/80 rounded-xl transition-colors border border-transparent hover:border-red-200/60 ml-auto sm:ml-0"
          title="Đặt lại toàn bộ bộ lọc"
        >
          <RotateCcw size={13} />
          <span>Xóa lọc</span>
        </button>
      )}
    </section>
  )
}
