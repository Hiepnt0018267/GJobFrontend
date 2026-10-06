import { Briefcase, ChevronDown, Clock, DollarSign, Eye, GraduationCap, Layers, SlidersHorizontal, X } from 'lucide-react'
import { useId, useState } from 'react'
import { jobSortLabels, salaryFilterOptions, type SalaryFilter } from '../../config/jobSearchFilters'
import { EMPLOYMENT_TYPES, EXPERIENCE_REQUIREMENTS, INDUSTRIES, JOB_LEVELS, JOB_SORT_OPTIONS, WORK_MODES } from '../../types/job'
import type { EmploymentType, ExperienceRequirement, Industry, JobLevel, JobSortOption, WorkMode } from '../../types/job'
import { employmentLabel, experienceRequirementLabel, industryLabel, levelLabel, workModeLabel } from '../../utils/jobDisplay'

export type JobFilterValues = {
  employmentType: EmploymentType | ''
  industry: Industry | ''
  experienceRequirement: ExperienceRequirement | ''
  level: JobLevel | ''
  workMode: WorkMode | ''
  salary: SalaryFilter
  sort: JobSortOption
}

type Props = {
  values: JobFilterValues
  onChange: (values: JobFilterValues) => void
  onClear: () => void
}

const selectFieldClass =
  'w-full appearance-none rounded-xl border border-slate-200/90 bg-white py-2.5 pl-9 pr-8 text-xs font-semibold text-slate-800 shadow-xs outline-none transition-colors hover:border-blue-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100'

function Controls({
  values,
  onChange,
  sidebar = false,
}: Pick<Props, 'values' | 'onChange'> & { sidebar?: boolean }) {
  const update = <K extends keyof JobFilterValues>(key: K, value: JobFilterValues[K]) =>
    onChange({ ...values, [key]: value })

  return (
    <div className={sidebar ? 'space-y-4' : 'grid gap-4 sm:grid-cols-2'}>
      {/* 1-Click Toggle for Work Mode */}
      <div>
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Hình thức làm việc</span>
          {values.workMode && (
            <button
              type="button"
              onClick={() => update('workMode', '')}
              className="text-[11px] font-semibold text-blue-600 hover:underline"
            >
              Mặc định
            </button>
          )}
        </div>
        <div className="mt-2 grid grid-cols-2 gap-1.5">
          <button
            type="button"
            onClick={() => update('workMode', '')}
            className={`btn-press rounded-xl px-2.5 py-2 text-center text-xs font-bold transition-all ${
              values.workMode === ''
                ? 'bg-blue-600 text-white shadow-xs'
                : 'border border-slate-200/80 bg-slate-50/70 text-slate-700 hover:bg-slate-100'
            }`}
          >
            Tất cả
          </button>
          {WORK_MODES.map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => update('workMode', mode)}
              className={`btn-press rounded-xl px-2.5 py-2 text-center text-xs font-bold transition-all ${
                values.workMode === mode
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'border border-slate-200/80 bg-slate-50/70 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {workModeLabel(mode)}
            </button>
          ))}
        </div>
      </div>

      {/* Mức lương */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">Mức lương</label>
        <div className="relative mt-1.5">
          <DollarSign size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <select
            aria-label="Lọc theo mức lương"
            value={values.salary}
            onChange={(event) => update('salary', event.target.value as SalaryFilter)}
            className={selectFieldClass}
          >
            {salaryFilterOptions.map(({ value, label }) => (
              <option key={value || 'all'} value={value}>
                {label}
              </option>
            ))}
          </select>
          <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
        </div>
      </div>

      {/* Ngành nghề */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">Ngành nghề</label>
        <div className="relative mt-1.5">
          <Briefcase size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <select
            aria-label="Lọc theo ngành nghề"
            value={values.industry}
            onChange={(event) => update('industry', event.target.value as Industry | '')}
            className={selectFieldClass}
          >
            <option value="">Tất cả ngành nghề</option>
            {INDUSTRIES.map((val) => (
              <option key={val} value={val}>
                {industryLabel(val)}
              </option>
            ))}
          </select>
          <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
        </div>
      </div>

      {/* Cấp bậc */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">Cấp bậc</label>
        <div className="relative mt-1.5">
          <GraduationCap size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <select
            aria-label="Lọc theo cấp bậc"
            value={values.level}
            onChange={(event) => update('level', event.target.value as JobLevel | '')}
            className={selectFieldClass}
          >
            <option value="">Tất cả cấp bậc</option>
            {JOB_LEVELS.map((val) => (
              <option key={val} value={val}>
                {levelLabel(val)}
              </option>
            ))}
          </select>
          <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
        </div>
      </div>

      {/* Kinh nghiệm */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">Kinh nghiệm</label>
        <div className="relative mt-1.5">
          <Clock size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <select
            aria-label="Lọc theo kinh nghiệm"
            value={values.experienceRequirement}
            onChange={(event) => update('experienceRequirement', event.target.value as ExperienceRequirement | '')}
            className={selectFieldClass}
          >
            <option value="">Tất cả kinh nghiệm</option>
            {EXPERIENCE_REQUIREMENTS.map((val) => (
              <option key={val} value={val}>
                {experienceRequirementLabel(val)}
              </option>
            ))}
          </select>
          <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
        </div>
      </div>

      {/* Loại hợp đồng */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">Loại hợp đồng</label>
        <div className="relative mt-1.5">
          <Layers size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <select
            aria-label="Lọc theo loại hợp đồng"
            value={values.employmentType}
            onChange={(event) => update('employmentType', event.target.value as EmploymentType | '')}
            className={selectFieldClass}
          >
            <option value="">Tất cả loại việc</option>
            {EMPLOYMENT_TYPES.map((val) => (
              <option key={val} value={val}>
                {employmentLabel(val)}
              </option>
            ))}
          </select>
          <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
        </div>
      </div>

      {/* Sắp xếp (Dành cho Mobile Sheet hoặc Sidebar Fallback) */}
      {!sidebar && (
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">Sắp xếp theo</label>
          <div className="relative mt-1.5">
            <Eye size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <select
              aria-label="Sắp xếp kết quả"
              value={values.sort}
              onChange={(event) => update('sort', event.target.value as JobSortOption)}
              className={selectFieldClass}
            >
              {JOB_SORT_OPTIONS.map((val) => (
                <option key={val} value={val}>
                  {jobSortLabels[val]}
                </option>
              ))}
            </select>
            <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>
        </div>
      )}
    </div>
  )
}

export default function JobFilters({ values, onChange, onClear }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const headingId = useId()
  const activeCount = Object.entries(values).filter(
    ([key, value]) => (key !== 'sort' && value !== '') || (key === 'sort' && value !== 'newest')
  ).length
  const hasFilters = activeCount > 0

  return (
    <>
      <section
        className="sticky top-20 hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-premium lg:block"
        aria-labelledby={headingId}
      >
        <div className="mb-4 flex items-center justify-between gap-4 border-b border-slate-100 pb-3.5">
          <div className="flex items-center gap-2 text-slate-900">
            <SlidersHorizontal size={17} className="text-blue-600" aria-hidden="true" />
            <h2 id={headingId} className="text-sm font-bold tracking-tight">
              Bộ lọc việc làm
            </h2>
            {hasFilters && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
                {activeCount}
              </span>
            )}
          </div>
          {hasFilters && (
            <button
              type="button"
              onClick={onClear}
              className="btn-press inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold text-slate-500 transition-colors hover:bg-slate-100 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            >
              <X size={13} aria-hidden="true" />
              Xóa tất cả
            </button>
          )}
        </div>
        <Controls values={values} onChange={onChange} sidebar />
      </section>

      {/* Mobile Open Filter Trigger */}
      <section className="lg:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className={`btn-press inline-flex min-h-[44px] items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-bold shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
            hasFilters
              ? 'border-blue-300 bg-blue-50 text-blue-700'
              : 'border-slate-300 bg-white text-slate-800 hover:bg-slate-50'
          }`}
        >
          <SlidersHorizontal size={16} aria-hidden="true" />
          <span>Bộ lọc</span>
          {hasFilters && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
              {activeCount}
            </span>
          )}
        </button>
      </section>

      {/* Mobile Filter Drawer / Sheet */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end bg-slate-950/50 backdrop-blur-xs p-3 sm:items-center sm:justify-center"
          role="presentation"
        >
          <button
            type="button"
            className="absolute inset-0 cursor-default"
            aria-label="Đóng bộ lọc"
            onClick={() => setMobileOpen(false)}
          />
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby={`${headingId}-mobile`}
            className="motion-dialog relative max-h-[min(46rem,calc(100dvh-2rem))] w-full max-w-lg overflow-y-auto rounded-3xl border border-slate-200/80 bg-white p-6 shadow-2xl"
          >
            <div className="mb-5 flex items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h2 id={`${headingId}-mobile`} className="text-base font-extrabold text-slate-900">
                  Bộ lọc việc làm
                </h2>
                <p className="mt-0.5 text-xs text-slate-500">Tùy chỉnh tiêu chí để tìm cơ hội phù hợp nhất</p>
              </div>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="btn-press flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                aria-label="Đóng bộ lọc"
              >
                <X size={20} aria-hidden="true" />
              </button>
            </div>

            <Controls values={values} onChange={onChange} />

            <div className="mt-6 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => {
                  onClear()
                  setMobileOpen(false)
                }}
                className="btn-press rounded-xl px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Xóa bộ lọc
              </button>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="btn-press inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-blue-700"
              >
                Xem kết quả
              </button>
            </div>
          </section>
        </div>
      )}
    </>
  )
}
