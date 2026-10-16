import { useState, type ReactNode } from 'react'
import InteractiveDonutChart, {
  type DashboardChartItem as ChartItem,
  type DashboardChartNavigate as ChartNavigate,
} from '../dashboard/InteractiveDonutChart'
import type {
  AdminApplicationStats,
  AdminCVTemplateStats,
  AdminJobStats,
  AdminUserStats,
} from '../../types/adminDashboard'

type Selection = string | null

const numberFormatter = new Intl.NumberFormat('vi-VN')

const percentage = (value: number, total: number) => total > 0 ? (value / total) * 100 : 0

function ChartPanel({ title, description, children, className = '' }: {
  title: string
  description: string
  children: ReactNode
  className?: string
}) {
  return (
    <section className={`rounded-2xl border border-black/[0.04] bg-[#F7F9FB] p-5 sm:p-6 ${className}`} aria-label={title}>
      <header>
        <h2 className="text-sm font-semibold tracking-tight text-[#1C1C1C]">{title}</h2>
        <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
      </header>
      {children}
    </section>
  )
}

function StatusProgress({ active, inactive, total, onNavigate }: { active: number; inactive: number; total: number; onNavigate?: ChartNavigate }) {
  const [hovered, setHovered] = useState<'active' | 'inactive' | null>(null)
  const activeKey = hovered
  const activePercent = percentage(active, total)
  const inactivePercent = percentage(inactive, total)
  const selectedValue = activeKey === 'inactive' ? inactive : active
  const selectedPercent = activeKey === 'inactive' ? inactivePercent : activePercent
  const selectedLabel = activeKey === 'inactive' ? 'ngừng hoạt động' : 'đang hoạt động'

  return (
    <div className="mt-5 border-t border-black/[0.05] pt-4">
      <div className="flex items-center justify-between gap-4 text-xs">
        <span className="text-slate-500">Trạng thái tài khoản</span>
        <span className="font-medium tabular-nums text-[#1C1C1C]">
          {numberFormatter.format(selectedValue)} · {selectedPercent.toFixed(1)}% {selectedLabel}
        </span>
      </div>
      <div className="mt-2.5 flex h-2.5 overflow-hidden rounded-full bg-slate-200" role="group" aria-label="Chọn trạng thái tài khoản">
        <button
          type="button"
          data-target="/admin/users?is_active=true"
          tabIndex={active > 0 ? 0 : -1}
          aria-label={`${activePercent.toFixed(1)}% tài khoản đang hoạt động`}
          onMouseEnter={() => setHovered('active')}
          onMouseLeave={() => setHovered(null)}
          onFocus={() => setHovered('active')}
          onBlur={() => setHovered(null)}
          onClick={() => onNavigate?.('/admin/users?is_active=true')}
          className="h-full bg-[#1C1C1C] transition-[filter,opacity] hover:brightness-125 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white"
          style={{ width: `${activePercent}%`, opacity: activeKey === 'inactive' ? 0.25 : 1 }}
        />
        <button
          type="button"
          data-target="/admin/users?is_active=false"
          tabIndex={inactive > 0 ? 0 : -1}
          aria-label={`${inactivePercent.toFixed(1)}% tài khoản ngừng hoạt động`}
          onMouseEnter={() => setHovered('inactive')}
          onMouseLeave={() => setHovered(null)}
          onFocus={() => setHovered('inactive')}
          onBlur={() => setHovered(null)}
          onClick={() => onNavigate?.('/admin/users?is_active=false')}
          className="h-full bg-red-300 transition-[filter,opacity] hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white"
          style={{ width: `${inactivePercent}%`, opacity: activeKey === 'active' ? 0.25 : 1 }}
        />
      </div>
      <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Chi tiết trạng thái tài khoản">
        {[
          { key: 'active' as const, label: 'Đang hoạt động', value: active, color: '#1C1C1C', to: '/admin/users?is_active=true' },
          { key: 'inactive' as const, label: 'Ngừng hoạt động', value: inactive, color: '#FCA5A5', to: '/admin/users?is_active=false' },
        ].map((item) => (
          <button
            key={item.key}
            type="button"
            data-target={item.to}
            aria-label={`Mở danh sách tài khoản ${item.label.toLowerCase()}`}
            onMouseEnter={() => setHovered(item.key)}
            onMouseLeave={() => setHovered(null)}
            onFocus={() => setHovered(item.key)}
            onBlur={() => setHovered(null)}
            onClick={() => onNavigate?.(item.to)}
            className={`inline-flex items-center gap-2 rounded-lg px-2 py-1 text-[10px] text-slate-600 transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1C1C1C] ${activeKey === item.key ? 'bg-white shadow-xs' : ''}`}
          >
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} aria-hidden="true" />
            {item.label} <strong className="tabular-nums text-[#1C1C1C]">{numberFormatter.format(item.value)}</strong>
          </button>
        ))}
      </div>
    </div>
  )
}

export function AdminUserChart({ data, onNavigate }: { data: AdminUserStats; onNavigate?: ChartNavigate }) {
  const items: ChartItem[] = [
    { label: 'Ứng viên', value: data.candidates, color: '#1C1C1C', to: '/admin/users?role=CANDIDATE' },
    { label: 'Nhà tuyển dụng', value: data.recruiters, color: '#B1E3FF', to: '/admin/users?role=RECRUITER' },
    { label: 'Quản trị viên', value: data.admins, color: '#95A4FC', to: '/admin/users?role=ADMIN' },
  ]

  return (
    <ChartPanel title="Người dùng" description="Phân bổ tài khoản theo vai trò và trạng thái hoạt động.">
      <InteractiveDonutChart items={items} total={data.total} totalLabel="tài khoản" ariaLabel="Phân bổ người dùng theo vai trò" onNavigate={onNavigate} />
      <StatusProgress active={data.active} inactive={data.inactive} total={data.total} onNavigate={onNavigate} />
    </ChartPanel>
  )
}

export function AdminJobChart({ data, onNavigate }: { data: AdminJobStats; onNavigate?: ChartNavigate }) {
  const items: ChartItem[] = [
    { label: 'Đã duyệt', value: data.approved, color: '#1C1C1C', to: '/admin/jobs?status=APPROVED' },
    { label: 'Chờ duyệt', value: data.pending, color: '#B1E3FF', to: '/admin/jobs?status=PENDING' },
    { label: 'Đã đóng', value: data.closed, color: '#95A4FC', to: '/admin/jobs?status=CLOSED' },
    { label: 'Từ chối', value: data.rejected, color: '#C6C7F8', to: '/admin/jobs?status=REJECTED' },
  ]

  return (
    <ChartPanel title="Tin tuyển dụng" description="Phân bổ các tin theo trạng thái kiểm duyệt hiện tại.">
      <InteractiveDonutChart items={items} total={data.total} totalLabel="tin tuyển dụng" ariaLabel="Phân bổ trạng thái tin tuyển dụng" onNavigate={onNavigate} />
    </ChartPanel>
  )
}

export function AdminApplicationChart({ data, onNavigate }: { data: AdminApplicationStats; onNavigate?: ChartNavigate }) {
  const [hoveredLabel, setHoveredLabel] = useState<Selection>(null)
  const activeLabel = hoveredLabel
  const items: ChartItem[] = [
    { label: 'Đã gửi', value: data.submitted, color: '#1C1C1C', to: '/admin/applications?status=SUBMITTED' },
    { label: 'Đang xem xét', value: data.reviewing, color: '#B1E3FF', to: '/admin/applications?status=REVIEWING' },
    { label: 'Danh sách ngắn', value: data.shortlisted, color: '#95A4FC', to: '/admin/applications?status=SHORTLISTED' },
    { label: 'Đã tuyển', value: data.hired, color: '#A1E3CB', to: '/admin/applications?status=HIRED' },
    { label: 'Bị từ chối', value: data.rejected, color: '#F4B6B6', to: '/admin/applications?status=REJECTED' },
    { label: 'Đã rút', value: data.withdrawn, color: '#CBD5E1', to: '/admin/applications?status=WITHDRAWN' },
  ]
  const maximum = Math.max(...items.map((item) => item.value), 1)
  const activeItem = items.find((item) => item.label === activeLabel) ?? null

  return (
    <ChartPanel title="Đơn ứng tuyển" description="So sánh số lượng đơn ở từng bước trong quy trình tuyển dụng.">
      <div className="mt-5 flex min-h-12 items-center justify-between gap-4 rounded-xl bg-white px-4 py-3 text-xs" aria-live="polite">
        <span className="text-slate-500">{activeItem ? activeItem.label : 'Tổng số đơn'}</span>
        <strong className="text-sm font-semibold tabular-nums text-[#1C1C1C]">
          {numberFormatter.format(activeItem?.value ?? data.total)}
          {activeItem && <span className="ml-2 text-xs font-medium text-slate-400">{percentage(activeItem.value, data.total).toFixed(1)}%</span>}
        </strong>
      </div>
      <div className="mt-3 space-y-1.5" role="group" aria-label="Biểu đồ thanh trạng thái đơn ứng tuyển">
        {items.map((item) => {
          const share = percentage(item.value, data.total)
          const relativeWidth = item.value > 0 ? (item.value / maximum) * 100 : 0
          const isActive = activeLabel === item.label
          return (
            <button
              key={item.label}
              type="button"
              data-target={item.to}
              aria-label={`Mở ${item.value} đơn ${item.label.toLowerCase()}, chiếm ${share.toFixed(1)}%`}
              onMouseEnter={() => setHoveredLabel(item.label)}
              onMouseLeave={() => setHoveredLabel(null)}
              onFocus={() => setHoveredLabel(item.label)}
              onBlur={() => setHoveredLabel(null)}
              onClick={() => onNavigate?.(item.to)}
              className={`grid w-full grid-cols-[100px_minmax(0,1fr)_62px] items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1C1C1C] ${isActive ? 'bg-white shadow-xs' : 'hover:bg-white/70'}`}
            >
              <span className={`truncate transition-colors ${isActive ? 'font-medium text-[#1C1C1C]' : 'text-slate-600'}`}>{item.label}</span>
              <span className="h-2.5 overflow-hidden rounded-full bg-white shadow-[inset_0_0_0_1px_rgba(15,23,42,0.04)]" aria-hidden="true">
                <span
                  className="block h-full origin-left rounded-full transition-[width,filter,transform] duration-200"
                  style={{
                    width: `${relativeWidth}%`,
                    backgroundColor: item.color,
                    filter: activeLabel && !isActive ? 'saturate(0.35)' : 'none',
                    transform: isActive ? 'scaleY(1.45)' : 'scaleY(1)',
                  }}
                />
              </span>
              <span className="text-right tabular-nums">
                <strong className="font-medium text-[#1C1C1C]">{numberFormatter.format(item.value)}</strong>
                <span className="ml-1 text-[10px] text-slate-400">{share.toFixed(0)}%</span>
              </span>
            </button>
          )
        })}
      </div>
      <p className="mt-2 px-3 text-[10px] leading-4 text-slate-400">Nhấn một trạng thái để mở danh sách đơn tương ứng.</p>
    </ChartPanel>
  )
}

export function AdminTemplateChart({ data, onNavigate }: { data: AdminCVTemplateStats; onNavigate?: ChartNavigate }) {
  const [hoveredKey, setHoveredKey] = useState<'active' | 'inactive' | null>(null)
  const activeKey = hoveredKey
  const activePercent = percentage(data.active, data.total)
  const inactivePercent = percentage(data.inactive, data.total)
  const selectedValue = activeKey === 'inactive' ? data.inactive : activeKey === 'active' ? data.active : data.total
  const selectedPercent = activeKey === 'inactive' ? inactivePercent : activeKey === 'active' ? activePercent : null

  const templateItems = [
    { key: 'active' as const, label: 'Đang hoạt động', value: data.active, percent: activePercent, color: '#1C1C1C', to: '/admin/cv-templates?is_active=true' },
    { key: 'inactive' as const, label: 'Ngừng hoạt động', value: data.inactive, percent: inactivePercent, color: '#FCA5A5', to: '/admin/cv-templates?is_active=false' },
  ]

  return (
    <ChartPanel title="Mẫu CV" description="Tỷ lệ mẫu đang được mở cho ứng viên sử dụng." className="flex flex-col">
      <div className="mt-7 flex flex-1 flex-col justify-between">
        <div>
          <p className="text-4xl font-semibold tracking-tight tabular-nums text-[#1C1C1C]">{numberFormatter.format(selectedValue)}</p>
          <p className="mt-1 text-xs text-slate-500">
            {activeKey === 'active' ? 'Mẫu đang hoạt động' : activeKey === 'inactive' ? 'Mẫu ngừng hoạt động' : 'Tổng mẫu CV trong hệ thống'}
            {selectedPercent !== null && <span className="ml-2 font-medium tabular-nums text-[#1C1C1C]">{selectedPercent.toFixed(1)}%</span>}
          </p>
          <div className="mt-6 flex h-3 overflow-hidden rounded-full bg-slate-200" role="group" aria-label="Chọn trạng thái mẫu CV">
            {templateItems.map((item) => (
              <button
                key={item.key}
                type="button"
                data-target={item.to}
                tabIndex={item.value > 0 ? 0 : -1}
                aria-label={`${item.percent.toFixed(1)}% mẫu CV ${item.label.toLowerCase()}`}
                onMouseEnter={() => setHoveredKey(item.key)}
                onMouseLeave={() => setHoveredKey(null)}
                onFocus={() => setHoveredKey(item.key)}
                onBlur={() => setHoveredKey(null)}
                onClick={() => onNavigate?.(item.to)}
                className="h-full transition-[filter,opacity] hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white"
                style={{ width: `${item.percent}%`, backgroundColor: item.color, opacity: activeKey && activeKey !== item.key ? 0.25 : 1 }}
              />
            ))}
          </div>
        </div>

        <div className="mt-7 space-y-1 border-t border-black/[0.05] pt-4" role="group" aria-label="Chi tiết trạng thái mẫu CV">
          {templateItems.map((item) => {
            const isActive = activeKey === item.key
            return (
              <button
                key={item.key}
                type="button"
                data-target={item.to}
                aria-label={`Mở danh sách mẫu CV ${item.label.toLowerCase()}`}
                onMouseEnter={() => setHoveredKey(item.key)}
                onMouseLeave={() => setHoveredKey(null)}
                onFocus={() => setHoveredKey(item.key)}
                onBlur={() => setHoveredKey(null)}
                onClick={() => onNavigate?.(item.to)}
                className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left text-xs transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1C1C1C] ${isActive ? 'bg-white shadow-xs' : ''}`}
              >
                <span className="flex items-center gap-2 text-slate-600"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} aria-hidden="true" />{item.label}</span>
                <span className="font-medium tabular-nums text-[#1C1C1C]">{numberFormatter.format(item.value)} · {item.percent.toFixed(1)}%</span>
              </button>
            )
          })}
        </div>
      </div>
    </ChartPanel>
  )
}
