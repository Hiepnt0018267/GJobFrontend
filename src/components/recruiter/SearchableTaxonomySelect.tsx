import { Check, ChevronDown, LoaderCircle, Search } from 'lucide-react'
import { useEffect, useId, useMemo, useRef, useState } from 'react'

export type TaxonomySelectOption = {
  id: string
  label: string
  inactive?: boolean
}

type Props = {
  label: string
  value: string
  options: TaxonomySelectOption[]
  onChange: (value: string) => void
  disabled?: boolean
  loading?: boolean
  searchPlaceholder: string
  selectPlaceholder: string
  emptyMessage: string
  readOnly?: boolean
}

const triggerClass =
  'mt-2 flex min-h-11 w-full items-center justify-between gap-3 rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-left text-sm text-slate-900 outline-none transition hover:border-slate-400 focus:border-[#1C1C1C] focus:ring-2 focus:ring-[#1C1C1C]/10 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-500'

export default function SearchableTaxonomySelect({
  label,
  value,
  options,
  onChange,
  disabled = false,
  loading = false,
  searchPlaceholder,
  selectPlaceholder,
  emptyMessage,
  readOnly = false,
}: Props) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const rootRef = useRef<HTMLFieldSetElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const listboxId = useId()

  const visibleOptions = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase('vi')
    if (!normalized) return options
    return options.filter((option) => option.label.toLocaleLowerCase('vi').includes(normalized))
  }, [options, query])

  const selected = options.find((option) => option.id === value)
  const unavailable = disabled || loading

  useEffect(() => {
    if (!open) return

    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
        setQuery('')
      }
    }
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
        setQuery('')
      }
    }

    document.addEventListener('pointerdown', closeOnOutsideClick)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsideClick)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [open])

  useEffect(() => {
    if (open) searchRef.current?.focus()
  }, [open])

  const choose = (option: TaxonomySelectOption) => {
    if (option.inactive) return
    onChange(option.id)
    setOpen(false)
    setQuery('')
  }

  if (readOnly || selected?.inactive) {
    return (
      <fieldset className="min-w-0" disabled>
        <legend className="text-sm font-semibold text-slate-700">{label}</legend>
        <div className="mt-2 flex min-h-11 items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm">
          <span className="truncate font-medium text-slate-800">{selected?.label || 'Chưa cập nhật'}</span>
          <span className="ml-3 shrink-0 rounded-full bg-slate-200 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
            Đã tạm ẩn
          </span>
        </div>
        <span className="mt-1.5 block text-xs font-normal text-slate-500">
          Danh mục này đã tạm ẩn và không thể thay đổi.
        </span>
      </fieldset>
    )
  }

  return (
    <fieldset ref={rootRef} className="relative min-w-0">
      <legend className="text-sm font-semibold text-slate-700">{label}</legend>
      <button
        type="button"
        role="combobox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-haspopup="listbox"
        disabled={unavailable}
        onClick={() => setOpen((current) => !current)}
        className={triggerClass}
      >
        <span className={`truncate ${selected ? 'font-medium text-slate-900' : 'text-slate-500'}`}>
          {loading ? 'Đang tải danh mục...' : selected?.label || selectPlaceholder}
        </span>
        {loading ? (
          <LoaderCircle size={17} className="shrink-0 animate-spin text-slate-400" />
        ) : (
          <ChevronDown
            size={17}
            className={`shrink-0 text-slate-500 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          />
        )}
      </button>

      {open && !unavailable && (
        <div className="absolute left-0 right-0 z-30 mt-2 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl shadow-slate-900/10">
          <div className="border-b border-slate-100 p-2.5">
            <label className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 focus-within:border-[#1C1C1C] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#1C1C1C]/10">
              <Search size={16} className="shrink-0 text-slate-400" aria-hidden="true" />
              <input
                ref={searchRef}
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={searchPlaceholder}
                aria-label={searchPlaceholder}
                className="min-w-0 flex-1 bg-transparent py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400"
              />
            </label>
          </div>

          <div id={listboxId} role="listbox" aria-label={label} className="max-h-64 overflow-y-auto p-1.5">
            {visibleOptions.length > 0 ? (
              visibleOptions.map((option) => {
                const isSelected = option.id === value
                return (
                  <button
                    key={option.id}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    disabled={option.inactive}
                    onClick={() => choose(option)}
                    className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition ${
                      isSelected
                        ? 'bg-slate-900 font-semibold text-white'
                        : 'text-slate-700 hover:bg-slate-100'
                    } disabled:cursor-not-allowed disabled:opacity-50`}
                  >
                    <span>{option.label}</span>
                    {isSelected && <Check size={16} className="shrink-0" aria-hidden="true" />}
                  </button>
                )
              })
            ) : (
              <div className="px-3 py-7 text-center text-sm text-slate-500">{emptyMessage}</div>
            )}
          </div>
        </div>
      )}

      <select
        value={value}
        onChange={() => undefined}
        tabIndex={-1}
        aria-hidden="true"
        className="sr-only"
      >
        <option value="">{selectPlaceholder}</option>
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>
    </fieldset>
  )
}
