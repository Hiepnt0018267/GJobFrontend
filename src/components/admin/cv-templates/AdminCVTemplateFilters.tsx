import { ChevronDown, RotateCcw, Search, X } from 'lucide-react'
import { useEffect, useMemo, useRef } from 'react'
import {
  DEFAULT_INDUSTRY_OPTIONS,
  type TemplateATSFilter,
  type TemplateBooleanFilter,
  type TemplateLayoutFilter,
  type TemplateStyleFilter,
} from './adminCVTemplateFilterTypes'
import { layoutOptions } from './adminCVTemplateLayout'

type Props = {
  search: string
  active: TemplateBooleanFilter
  featured: TemplateBooleanFilter
  style: TemplateStyleFilter
  layout: TemplateLayoutFilter
  atsStatus: TemplateATSFilter
  industry?: string
  industryOptions?: ReadonlyArray<{ value: string; label: string }> | Array<{ value: string; label: string }>
  onSearchChange: (value: string) => void
  onActiveChange: (value: TemplateBooleanFilter) => void
  onFeaturedChange: (value: TemplateBooleanFilter) => void
  onStyleChange: (value: TemplateStyleFilter) => void
  onLayoutChange: (value: TemplateLayoutFilter) => void
  onATSStatusChange: (value: TemplateATSFilter) => void
  onIndustryChange?: (value: string) => void
  onReset?: () => void
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

const styleOptions: Array<{ value: TemplateStyleFilter; label: string }> = [
  { value: 'ALL', label: 'Tất cả phong cách' },
  { value: 'SIMPLE', label: 'Đơn giản' },
  { value: 'IMPRESSIVE', label: 'Ấn tượng' },
  { value: 'PROFESSIONAL', label: 'Chuyên nghiệp' },
]

const atsOptions: Array<{ value: TemplateATSFilter; label: string }> = [
  { value: 'ALL', label: 'Tất cả ATS' },
  { value: 'ATS_FRIENDLY', label: 'Thân thiện ATS' },
  { value: 'ATS_CAUTION', label: 'ATS cần lưu ý' },
  { value: 'NOT_ATS_FRIENDLY', label: 'Không thân thiện ATS' },
  { value: 'UNREVIEWED', label: 'ATS chưa đánh giá' },
]

function FilterPill<T extends string>({
  label,
  value,
  options,
  onChange,
  ariaLabel,
}: {
  label: string
  value: T
  options: ReadonlyArray<{ value: T; label: string }> | Array<{ value: T; label: string }>
  onChange: (value: T) => void
  ariaLabel: string
}) {
  const isSelected = value !== 'ALL'
  const selectedOption = options.find((opt) => opt.value === value)
  const displayLabel = isSelected ? (selectedOption?.label ?? label) : label

  return (
    <div
      className={`group relative inline-flex h-9 items-center rounded-xl border text-xs font-medium shadow-2xs transition-all duration-150 ${
        isSelected
          ? 'border-[#1C1C1C] bg-slate-100 text-slate-900 ring-1 ring-slate-900/10 font-semibold'
          : 'border-slate-200/90 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50/70'
      }`}
    >
      <span className="pointer-events-none flex items-center gap-1.5 pl-3 pr-7 whitespace-nowrap max-w-[170px] truncate">
        {isSelected && (
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#1C1C1C]" aria-hidden="true" />
        )}
        <span className="truncate">{displayLabel}</span>
      </span>

      <ChevronDown
        size={13}
        className={`pointer-events-none absolute right-2.5 transition-colors ${
          isSelected ? 'text-slate-900' : 'text-slate-400 group-hover:text-slate-600'
        }`}
        aria-hidden="true"
      />

      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        aria-label={ariaLabel}
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0 text-xs"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value} className="bg-white text-slate-900">
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}

export default function AdminCVTemplateFilters({
  search,
  active,
  featured,
  style,
  layout,
  atsStatus,
  industry = 'ALL',
  industryOptions,
  onSearchChange,
  onActiveChange,
  onFeaturedChange,
  onStyleChange,
  onLayoutChange,
  onATSStatusChange,
  onIndustryChange,
  onReset,
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

  const layoutOptionsWithAll = useMemo(
    () => [{ value: 'ALL' as TemplateLayoutFilter, label: 'Tất cả bố cục' }, ...layoutOptions],
    []
  )

  const resolvedIndustryOptions = useMemo(
    () => (industryOptions && industryOptions.length > 0 ? industryOptions : DEFAULT_INDUSTRY_OPTIONS),
    [industryOptions]
  )

  const activeFilterCount = [
    active !== 'ALL',
    featured !== 'ALL',
    style !== 'ALL',
    layout !== 'ALL',
    atsStatus !== 'ALL',
    Boolean(industry && industry !== 'ALL'),
  ].filter(Boolean).length

  const hasActiveFilters = Boolean(search || activeFilterCount > 0)

  const handleReset = () => {
    if (timer.current !== null) window.clearTimeout(timer.current)
    if (inputRef.current) inputRef.current.value = ''
    if (onReset) {
      onReset()
    } else {
      onSearchChange('')
      onActiveChange('ALL')
      onFeaturedChange('ALL')
      onStyleChange('ALL')
      onLayoutChange('ALL')
      onATSStatusChange('ALL')
      onIndustryChange?.('ALL')
    }
  }

  return (
    <section className="mt-5 flex flex-wrap items-center gap-2" aria-label="Tìm kiếm và lọc mẫu CV">
      {/* Compact Search Input */}
      <div className="relative min-w-[200px] flex-1 sm:max-w-xs md:max-w-sm">
        <span className="sr-only">Tìm mẫu CV</span>
        <Search
          size={15}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          aria-hidden="true"
        />
        <input
          ref={inputRef}
          defaultValue={search}
          onChange={(event) => schedule(event.target.value)}
          placeholder="Tìm mẫu CV..."
          className="h-9 w-full rounded-xl border border-slate-200/90 bg-white py-1.5 pl-8.5 pr-8 text-xs sm:text-sm text-slate-900 shadow-2xs placeholder:text-slate-400 outline-none transition-all duration-150 hover:border-slate-300 focus:border-[#1C1C1C] focus:ring-2 focus:ring-black/10"
        />
        {search && (
          <button
            type="button"
            onClick={clear}
            aria-label="Xóa từ khóa tìm kiếm"
            className="absolute right-2 top-1/2 inline-flex -translate-y-1/2 rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={13} aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Pill: Ngành nghề */}
      {onIndustryChange && (
        <FilterPill
          label="Ngành nghề"
          value={industry}
          options={resolvedIndustryOptions}
          onChange={onIndustryChange}
          ariaLabel="Lọc theo ngành nghề"
        />
      )}

      {/* Pill: Trạng thái */}
      <FilterPill
        label="Trạng thái"
        value={active}
        options={activeOptions}
        onChange={onActiveChange}
        ariaLabel="Lọc trạng thái hoạt động"
      />

      {/* Pill: Tiêu điểm */}
      <FilterPill
        label="Tiêu điểm"
        value={featured}
        options={featuredOptions}
        onChange={onFeaturedChange}
        ariaLabel="Lọc trạng thái nổi bật"
      />

      {/* Pill: Phong cách */}
      <FilterPill
        label="Phong cách"
        value={style}
        options={styleOptions}
        onChange={onStyleChange}
        ariaLabel="Lọc phong cách mẫu CV"
      />

      {/* Pill: Bố cục */}
      <FilterPill
        label="Bố cục"
        value={layout}
        options={layoutOptionsWithAll}
        onChange={onLayoutChange}
        ariaLabel="Lọc renderer hoặc bố cục"
      />

      {/* Pill: Chuẩn ATS */}
      <FilterPill
        label="Chuẩn ATS"
        value={atsStatus}
        options={atsOptions}
        onChange={onATSStatusChange}
        ariaLabel="Lọc trạng thái ATS"
      />

      {/* Quick Reset Button */}
      {hasActiveFilters && (
        <button
          type="button"
          onClick={handleReset}
          className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50/70 px-2.5 text-xs font-semibold text-rose-600 shadow-2xs transition-all hover:bg-rose-100 hover:border-rose-300 active:scale-95"
          title="Đặt lại toàn bộ bộ lọc"
        >
          <RotateCcw size={12} strokeWidth={2.2} />
          <span>Đặt lại</span>
          {activeFilterCount > 0 && (
            <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-bold text-white">
              {activeFilterCount}
            </span>
          )}
        </button>
      )}
    </section>
  )
}
