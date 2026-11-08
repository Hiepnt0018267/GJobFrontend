import { Check, ChevronDown, Search, X } from 'lucide-react'
import { useId, useMemo, useRef, useState, useEffect } from 'react'

type Option = {
  value: string
  label: string
}

type Props = {
  label: string
  description?: string
  values: string[]
  options: Option[]
  onChange: (values: string[]) => void
  placeholder?: string
  emptyMessage?: string
}

export default function AdminMultiSelect({
  label,
  description,
  values,
  options,
  onChange,
  placeholder = 'Tìm kiếm lựa chọn...',
  emptyMessage = 'Không tìm thấy kết quả phù hợp.',
}: Props) {
  const selectId = useId()
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)

  // Filter options based on search query
  const filteredOptions = useMemo(() => {
    if (!searchTerm.trim()) return options
    const query = searchTerm.toLowerCase().trim()
    return options.filter(
      (opt) =>
        opt.label.toLowerCase().includes(query) ||
        opt.value.toLowerCase().includes(query)
    )
  }, [options, searchTerm])

  // Get labels for selected values
  const selectedOptions = useMemo(() => {
    const map = new Map(options.map((opt) => [opt.value, opt.label]))
    return values.map((val) => ({
      value: val,
      label: map.get(val) ?? val,
    }))
  }, [options, values])

  const toggleValue = (value: string) => {
    if (values.includes(value)) {
      onChange(values.filter((v) => v !== value))
    } else {
      onChange([...values, value])
    }
  }

  const removeValue = (value: string, e: React.MouseEvent) => {
    e.stopPropagation()
    onChange(values.filter((v) => v !== value))
  }

  const clearAll = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange([])
  }

  const selectAll = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange(options.map((o) => o.value))
  }

  // Close on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick)
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
    }
  }, [isOpen])

  return (
    <div className="relative" ref={containerRef}>
      <div className="flex items-center justify-between gap-2">
        <label htmlFor={selectId} className="block text-sm font-semibold text-slate-800">
          {label}
          {values.length > 0 && (
            <span className="ml-2 inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
              {values.length} đã chọn
            </span>
          )}
        </label>
        {values.length > 0 && (
          <button
            type="button"
            onClick={clearAll}
            className="text-xs font-medium text-slate-500 hover:text-red-600 transition-colors"
          >
            Bỏ chọn tất cả
          </button>
        )}
      </div>

      {description && <p className="mt-1 text-xs text-slate-500">{description}</p>}

      {/* Main trigger box */}
      <div
        id={selectId}
        role="button"
        tabIndex={0}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            setIsOpen((prev) => !prev)
          }
        }}
        className={`mt-2 flex min-h-[46px] w-full cursor-pointer flex-wrap items-center gap-1.5 rounded-xl border bg-white px-3 py-2 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-slate-900/10 ${
          isOpen
            ? 'border-slate-900 ring-2 ring-slate-900/10'
            : 'border-slate-300 hover:border-slate-400'
        }`}
      >
        {selectedOptions.length === 0 ? (
          <span className="text-slate-400">Chọn {label.toLowerCase()}...</span>
        ) : (
          <div className="flex flex-wrap items-center gap-1.5">
            {selectedOptions.slice(0, 4).map((item) => (
              <span
                key={item.value}
                className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-1 text-xs font-medium text-slate-800 ring-1 ring-inset ring-slate-200/80"
              >
                <span className="max-w-[150px] truncate">{item.label}</span>
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(e) => removeValue(item.value, e)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') removeValue(item.value, e as unknown as React.MouseEvent)
                  }}
                  className="rounded p-0.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
                  title={`Bỏ chọn ${item.label}`}
                >
                  <X size={12} />
                </span>
              </span>
            ))}
            {selectedOptions.length > 4 && (
              <span className="rounded-lg bg-slate-200/80 px-2 py-1 text-xs font-semibold text-slate-700">
                +{selectedOptions.length - 4} khác
              </span>
            )}
          </div>
        )}

        <div className="ml-auto flex items-center pl-2 text-slate-400">
          <ChevronDown
            size={16}
            className={`transition-transform duration-200 ${isOpen ? 'rotate-180 text-slate-700' : ''}`}
          />
        </div>
      </div>

      {/* Dropdown panel */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full z-40 mt-1.5 rounded-xl border border-slate-200 bg-white p-3 shadow-xl ring-1 ring-black/5 animate-in fade-in-50 zoom-in-95 duration-100">
          {/* Search bar inside dropdown */}
          <div className="relative mb-2.5">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={placeholder}
              onClick={(e) => e.stopPropagation()}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-9 pr-3 text-xs text-slate-900 placeholder-slate-400 transition-colors focus:border-slate-400 focus:bg-white focus:outline-none"
              autoFocus
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Quick actions */}
          <div className="mb-2 flex items-center justify-between border-b border-slate-100 pb-2 text-[11px] text-slate-500">
            <span>
              {filteredOptions.length} lựa chọn {searchTerm && '(đã lọc)'}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={selectAll}
                className="font-medium text-[#1C1C1C] hover:underline"
              >
                Chọn hết
              </button>
              {values.length > 0 && (
                <>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={clearAll}
                    className="font-medium text-slate-500 hover:text-red-600"
                  >
                    Bỏ chọn
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Options list */}
          <div className="max-h-52 overflow-y-auto space-y-0.5 pr-1 text-sm">
            {filteredOptions.length === 0 ? (
              <div className="py-4 text-center text-xs text-slate-400">{emptyMessage}</div>
            ) : (
              filteredOptions.map((option) => {
                const isSelected = values.includes(option.value)
                return (
                  <div
                    key={option.value}
                    role="checkbox"
                    aria-checked={isSelected}
                    tabIndex={0}
                    onClick={() => toggleValue(option.value)}
                    onKeyDown={(e) => {
                      if (e.key === ' ' || e.key === 'Enter') {
                        e.preventDefault()
                        toggleValue(option.value)
                      }
                    }}
                    className={`flex cursor-pointer items-center justify-between rounded-lg px-2.5 py-1.5 text-xs transition-colors ${
                      isSelected
                        ? 'bg-slate-100/90 font-semibold text-slate-950'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="truncate pr-2">{option.label}</span>
                    <div
                      className={`grid h-4 w-4 shrink-0 place-items-center rounded border transition-colors ${
                        isSelected
                          ? 'border-[#1C1C1C] bg-[#1C1C1C] text-white'
                          : 'border-slate-300 bg-white'
                      }`}
                    >
                      {isSelected && <Check size={11} strokeWidth={3} />}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}
