import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { adminNavigationGroups } from '../../../config/adminNavigation'
import GJobLogo from '../../brand/GJobLogo'

type Props = { collapsed?: boolean; hoverExpanded?: boolean; onHoverChange?: (hovered: boolean) => void; onNavigate?: () => void; onToggleCollapse?: () => void; mobile?: boolean }

export default function AdminSidebar({ collapsed = false, hoverExpanded = false, onHoverChange, onNavigate, onToggleCollapse, mobile = false }: Props) {
  const { pathname } = useLocation()
  const compact = collapsed && !mobile
  const expanded = !compact || hoverExpanded
  const handleMouseEnter = () => { if (compact) onHoverChange?.(true) }
  const handleMouseLeave = () => { if (compact) onHoverChange?.(false) }

  return (
    <aside
      className={mobile ? 'flex h-full w-72 flex-col bg-white' : 'sticky top-0 hidden h-screen min-w-0 flex-col border-r border-slate-200/80 bg-white lg:flex'}
      aria-label="Điều hướng quản trị"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className={`flex h-[68px] items-center border-b border-slate-200/80 ${expanded ? 'px-5' : 'justify-center px-0'}`}>
        <Link
          to="/admin"
          onClick={onNavigate}
          className={`group flex min-w-0 items-center rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1C1C1C] ${expanded ? 'gap-3' : 'justify-center'}`}
          aria-label="GJob — Tổng quan"
          title={compact && !hoverExpanded ? 'GJob — Tổng quan' : undefined}
        >
          <GJobLogo palette="monochrome" variant={expanded ? 'wordmark' : 'mark'} className={expanded ? 'h-8 w-auto transition-transform duration-200 group-hover:scale-[1.03]' : 'h-9 w-9 transition-transform duration-200 group-hover:scale-105'} />
        </Link>
      </div>
      <nav className={`flex-1 overflow-y-auto py-5 ${expanded ? 'px-3' : 'px-2'}`} aria-label="Các khu vực quản trị">
        <div className={expanded ? 'space-y-6' : 'space-y-5'}>
          {adminNavigationGroups.map((group) => (
            <section key={group.label}>
              <p className={expanded ? 'px-3 text-xs font-normal text-slate-400 font-[Inter,sans-serif]' : 'sr-only'}>
                {group.label}
              </p>
              <div className={expanded ? 'mt-1.5 space-y-1' : 'space-y-2'}>
                {group.items.map(({ to, label, icon: Icon, isActive }) => {
                  const active = isActive(pathname)
                  const activeClass = 'bg-[#1C1C1C]/[0.05] text-[#1C1C1C] font-medium'
                  const inactiveClass = 'text-slate-600 hover:bg-[#1C1C1C]/[0.025] hover:text-[#1C1C1C]'

                  return (
                    <NavLink
                      key={to}
                      to={to}
                      onClick={onNavigate}
                      className={`group flex h-9.5 items-center rounded-xl text-sm transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1C1C1C] font-[Inter,sans-serif] ${expanded ? 'gap-3 px-3' : 'justify-center px-0'} ${active ? activeClass : inactiveClass}`}
                      aria-current={active ? 'page' : undefined}
                      aria-label={!expanded ? label : undefined}
                      title={!expanded ? label : undefined}
                    >
                      <Icon
                        size={17}
                        className={active ? 'text-[#1C1C1C] shrink-0' : 'text-slate-400 shrink-0 transition-colors group-hover:text-slate-600'}
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
            className={`flex h-10 w-full items-center rounded-xl text-sm font-medium text-slate-600 transition-colors duration-150 hover:bg-[#1C1C1C]/[0.03] hover:text-[#1C1C1C] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1C1C1C] ${expanded ? 'gap-3 px-3' : 'justify-center px-0'}`}
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
