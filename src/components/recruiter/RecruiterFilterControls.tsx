import { ChevronDown, RotateCcw } from 'lucide-react'

export type RecruiterFilterOption<T extends string = string> = {
  value: T
  label: string
}

export function RecruiterFilterPill<T extends string>({
  label,
  value,
  options,
  onChange,
  ariaLabel,
  allValue = 'ALL',
  disabled = false,
}: {
  label: string
  value: T
  options: ReadonlyArray<RecruiterFilterOption<T>> | Array<RecruiterFilterOption<T>>
  onChange: (value: T) => void
  ariaLabel: string
  allValue?: string
  disabled?: boolean
}) {
  const isSelected = value !== allValue && value !== ''
  const activeOption = options.find((opt) => opt.value === value)
  const displayLabel = isSelected && activeOption ? activeOption.label : label

  return (
    <div
      className={`group relative inline-flex h-9 items-center rounded-xl border text-xs transition-all duration-150 shadow-2xs ${
        disabled
          ? 'border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed opacity-60'
          : isSelected
          ? 'border-[#1C1C1C] bg-slate-100 text-slate-900 ring-1 ring-slate-900/10 font-semibold cursor-pointer'
          : 'border-slate-200/90 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50/70 cursor-pointer'
      }`}
    >
      <span className="pointer-events-none flex items-center gap-1.5 pl-3 pr-7 whitespace-nowrap max-w-[200px] truncate">
        {isSelected && (
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#1C1C1C]" aria-hidden="true" />
        )}
        <span className="truncate">{displayLabel}</span>
      </span>

      <ChevronDown
        size={13}
        className={`pointer-events-none absolute right-2.5 transition-colors ${
          disabled ? 'text-slate-300' : isSelected ? 'text-slate-900' : 'text-slate-400 group-hover:text-slate-600'
        }`}
        aria-hidden="true"
      />

      <select
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value as T)}
        aria-label={ariaLabel}
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0 text-xs disabled:cursor-not-allowed"
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

export function RecruiterFilterResetButton({
  onClick,
  count = 0,
  label = 'Đặt lại',
}: {
  onClick: () => void
  count?: number
  label?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50/70 px-2.5 text-xs font-semibold text-rose-600 shadow-2xs transition-all hover:bg-rose-100 hover:border-rose-300 active:scale-95 ml-auto sm:ml-0"
      title="Đặt lại toàn bộ bộ lọc"
    >
      <RotateCcw size={12} strokeWidth={2.2} />
      <span>{label}</span>
      {count > 0 && (
        <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-bold text-white">
          {count}
        </span>
      )}
    </button>
  )
}

