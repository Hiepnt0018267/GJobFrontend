import { PanelLeftClose, PanelLeftOpen, Zap } from 'lucide-react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { recruiterNavigationGroups } from '../../../config/recruiterNavigation'

type Props = { collapsed?: boolean; hoverExpanded?: boolean; onHoverChange?: (hovered: boolean) => void; onNavigate?: () => void; onToggleCollapse?: () => void; mobile?: boolean }

export default function RecruiterSidebar({ collapsed = false, hoverExpanded = false, onHoverChange, onNavigate, onToggleCollapse, mobile = false }: Props) {
  const { pathname } = useLocation()
  const compact = collapsed && !mobile
  const expanded = !compact || hoverExpanded
  const handleMouseEnter = () => { if (compact) onHoverChange?.(true) }
  const handleMouseLeave = () => { if (compact) onHoverChange?.(false) }

  return (
    <aside
      className={mobile ? 'flex h-full w-72 flex-col bg-white' : 'sticky top-0 hidden h-screen min-w-0 flex-col border-r border-slate-200/80 bg-white lg:flex'}
      aria-label="Điều hướng nhà tuyển dụng"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className={`flex h-[68px] items-center border-b border-slate-200/80 ${expanded ? 'px-5' : 'justify-center px-0'}`}>
        <Link
          to="/recruiter"
          onClick={onNavigate}
          className={`group flex min-w-0 items-center rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${expanded ? 'gap-3' : 'justify-center'}`}
          aria-label="GJob — Tổng quan tuyển dụng"
          title={compact && !hoverExpanded ? 'GJob — Tổng quan tuyển dụng' : undefined}
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-sm shadow-blue-500/25 transition-transform duration-200 group-hover:scale-105">
            <Zap className="h-4.5 w-4.5 fill-white/20 text-white" strokeWidth={2.4} aria-hidden="true" />
          </span>
          <span className={expanded ? 'min-w-0' : 'sr-only'}>
            <span className="block text-base font-bold leading-5 tracking-tight text-slate-950 font-[Plus_Jakarta_Sans,sans-serif]">GJob</span>
            <span className="mt-0.5 block text-xs font-medium text-slate-500">Khu vực nhà tuyển dụng</span>
          </span>
        </Link>
      </div>
      <nav className={`flex-1 overflow-y-auto py-5 ${expanded ? 'px-3' : 'px-2'}`} aria-label="Các khu vực nhà tuyển dụng">
        <div className={expanded ? 'space-y-6' : 'space-y-5'}>
          {recruiterNavigationGroups.map((group) => (
            <section key={group.label}>
              <p className={expanded ? 'px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400' : 'sr-only'}>
                {group.label}
              </p>
              <div className={expanded ? 'mt-2 space-y-1' : 'space-y-2'}>
                {group.items.map(({ to, label, icon: Icon, isActive }) => {
                  const active = isActive(pathname)
                  const activeClass = expanded
                    ? 'bg-blue-50/80 text-blue-700 font-semibold border-l-2 border-blue-600 pl-[10px]'
                    : 'bg-blue-50 text-blue-700 font-semibold'
                  const inactiveClass = 'text-slate-600 hover:bg-slate-100/70 hover:text-slate-900'

                  return (
                    <NavLink
                      key={to}
                      to={to}
                      onClick={onNavigate}
                      className={`group flex h-10 items-center rounded-xl text-sm font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${expanded ? 'gap-3 px-3' : 'justify-center px-0'} ${active ? activeClass : inactiveClass}`}
                      aria-current={active ? 'page' : undefined}
                      aria-label={!expanded ? label : undefined}
                      title={!expanded ? label : undefined}
                    >
                      <Icon
                        size={17}
                        className={active ? 'text-blue-600 shrink-0' : 'text-slate-400 shrink-0 transition-colors group-hover:text-slate-600'}
                        aria-hidden="true"
                      />
                      <span className={expanded ? undefined : 'sr-only'}>{label}</span>
                    </NavLink>
                  )
                })}
              </div>
            </section>
          ))}
        </div>
      </nav>
      {!mobile && (
        <div className={`border-t border-slate-200/80 py-3 ${expanded ? 'px-3' : 'px-2'}`}>
          <button
            type="button"
            onClick={onToggleCollapse}
            className={`flex h-10 w-full items-center rounded-xl text-sm font-semibold text-slate-600 transition-colors duration-150 hover:bg-slate-100/80 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${expanded ? 'gap-3 px-3' : 'justify-center px-0'}`}
            aria-label={compact ? 'Mở rộng thanh điều hướng' : 'Thu gọn thanh điều hướng'}
            title={!expanded ? 'Mở rộng thanh điều hướng' : undefined}
          >
            {compact ? (
              <PanelLeftOpen size={18} aria-hidden="true" />
            ) : (
              <>
                <PanelLeftClose size={18} aria-hidden="true" />
                <span>Thu gọn</span>
              </>
            )}
          </button>
        </div>
      )}
    </aside>
  )
}
