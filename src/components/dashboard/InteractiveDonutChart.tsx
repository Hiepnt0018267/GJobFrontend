import { useState } from 'react'

export type DashboardChartItem = {
  label: string
  value: number
  color: string
  to: string
}

export type DashboardChartNavigate = (to: string) => void

const numberFormatter = new Intl.NumberFormat('vi-VN')
const percentage = (value: number, total: number) => total > 0 ? (value / total) * 100 : 0

export default function InteractiveDonutChart({ items, total, totalLabel, ariaLabel, onNavigate }: {
  items: DashboardChartItem[]
  total: number
  totalLabel: string
  ariaLabel: string
  onNavigate?: DashboardChartNavigate
}) {
  const [hoveredLabel, setHoveredLabel] = useState<string | null>(null)
  const activeItem = items.find((item) => item.label === hoveredLabel) ?? null
  const activeItems = items.filter((item) => item.value > 0)
  const radius = 48
  const circumference = 2 * Math.PI * radius
  const gap = activeItems.length > 1 ? 2.5 : 0
  const available = Math.max(0, circumference - activeItems.length * gap)
  const slices = activeItems.map((item, index) => {
    const startOffset = activeItems.slice(0, index).reduce((sum, previous) => {
      const previousLength = total > 0 ? (previous.value / total) * available : 0
      return sum + previousLength + gap
    }, 0)
    const length = total > 0 ? (item.value / total) * available : 0
    const midpoint = -90 + ((startOffset + length / 2) / circumference) * 360
    const midpointRadians = midpoint * Math.PI / 180
    return {
      ...item,
      dashArray: `${length} ${circumference - length}`,
      dashOffset: -startOffset,
      tooltipX: 80 + Math.cos(midpointRadians) * 67,
      tooltipY: 80 + Math.sin(midpointRadians) * 67,
    }
  })
  const activeSlice = slices.find((slice) => slice.label === hoveredLabel) ?? null

  return (
    <div className="mt-6 grid gap-6 sm:grid-cols-[160px_minmax(0,1fr)] sm:items-center">
      <div className="relative mx-auto flex h-40 w-40 items-center justify-center" role="img" aria-label={ariaLabel}>
        <svg viewBox="0 0 160 160" className="h-40 w-40 -rotate-90 overflow-visible" aria-hidden="true">
          <circle cx="80" cy="80" r={radius} fill="none" stroke="#E5ECF6" strokeWidth="22" />
          {activeItems.length === 1 ? (
            <circle
              cx="80"
              cy="80"
              r={radius}
              fill="none"
              stroke={activeItems[0].color}
              data-target={activeItems[0].to}
              strokeWidth={hoveredLabel === activeItems[0].label ? 27 : 22}
              className="cursor-pointer transition-[opacity,stroke-width] duration-200"
              opacity={hoveredLabel && hoveredLabel !== activeItems[0].label ? 0.22 : 1}
              onMouseEnter={() => setHoveredLabel(activeItems[0].label)}
              onMouseLeave={() => setHoveredLabel(null)}
              onClick={() => onNavigate?.(activeItems[0].to)}
            />
          ) : slices.map((slice) => {
            const isActive = hoveredLabel === slice.label
            const isDimmed = Boolean(hoveredLabel && !isActive)
            return (
              <circle
                key={slice.label}
                cx="80"
                cy="80"
                r={radius}
                fill="none"
                stroke={slice.color}
                data-target={slice.to}
                strokeWidth={isActive ? 27 : 22}
                strokeDasharray={slice.dashArray}
                strokeDashoffset={slice.dashOffset}
                strokeLinecap="butt"
                opacity={isDimmed ? 0.22 : 1}
                className="cursor-pointer transition-[opacity,stroke-width] duration-200"
                onMouseEnter={() => setHoveredLabel(slice.label)}
                onMouseLeave={() => setHoveredLabel(null)}
                onClick={() => onNavigate?.(slice.to)}
              />
            )
          })}
        </svg>
        {activeSlice && (
          <span
            role="tooltip"
            className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-1/2 rounded-lg bg-[#1C1C1C] px-2 py-1 text-[11px] font-semibold tabular-nums text-white shadow-lg"
            style={{ left: `${activeSlice.tooltipX}px`, top: `${activeSlice.tooltipY}px` }}
          >
            {percentage(activeSlice.value, total).toFixed(1)}%
          </span>
        )}
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-8 text-center">
          <strong className="text-2xl font-semibold tabular-nums text-[#1C1C1C]">
            {numberFormatter.format(activeItem?.value ?? total)}
          </strong>
          <span className="mt-0.5 max-w-20 text-[10px] leading-4 text-slate-500">
            {activeItem?.label ?? totalLabel}
          </span>
          {activeItem && (
            <span className="mt-0.5 text-[10px] font-medium tabular-nums text-[#1C1C1C]">
              {percentage(activeItem.value, total).toFixed(1)}%
            </span>
          )}
        </div>
      </div>

      <div>
        <div className="space-y-1" role="group" aria-label={`Bộ lọc ${ariaLabel.toLowerCase()}`}>
          {items.map((item) => {
            const isActive = hoveredLabel === item.label
            return (
              <button
                key={item.label}
                type="button"
                data-target={item.to}
                aria-label={`Mở danh sách ${item.label.toLowerCase()}`}
                onMouseEnter={() => setHoveredLabel(item.label)}
                onMouseLeave={() => setHoveredLabel(null)}
                onFocus={() => setHoveredLabel(item.label)}
                onBlur={() => setHoveredLabel(null)}
                onClick={() => onNavigate?.(item.to)}
                className={`flex w-full items-center justify-between gap-4 rounded-xl px-3 py-2 text-left text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1C1C1C] focus-visible:ring-offset-2 ${isActive ? 'bg-white shadow-xs' : 'hover:bg-white/70'}`}
              >
                <span className="flex min-w-0 items-center gap-2.5 text-slate-600">
                  <span className={`h-2.5 w-2.5 shrink-0 rounded-full transition-transform ${isActive ? 'scale-125' : ''}`} style={{ backgroundColor: item.color }} aria-hidden="true" />
                  <span className="truncate">{item.label}</span>
                </span>
                <span className="flex shrink-0 items-center gap-3 tabular-nums">
                  <span className="text-slate-400">{numberFormatter.format(item.value)}</span>
                  <span className="w-11 text-right font-medium text-[#1C1C1C]">{percentage(item.value, total).toFixed(1)}%</span>
                </span>
              </button>
            )
          })}
        </div>
        <p className="mt-2 px-3 text-[10px] leading-4 text-slate-400">Di chuột để xem tỷ lệ, nhấn để mở danh sách tương ứng.</p>
      </div>
    </div>
  )
}
