import { PanelLeftClose, PanelLeftOpen, Zap } from 'lucide-react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { adminNavigationGroups } from '../../../config/adminNavigation'

type Props = { collapsed?: boolean; hoverExpanded?: boolean; onHoverChange?: (hovered: boolean) => void; onNavigate?: () => void; onToggleCollapse?: () => void; mobile?: boolean }

export default function AdminSidebar({ collapsed = false, hoverExpanded = false, onHoverChange, onNavigate, onToggleCollapse, mobile = false }: Props) {
  const { pathname } = useLocation()
  const compact = collapsed && !mobile
  const expanded = !compact || hoverExpanded
  const handleMouseEnter = () => { if (compact) onHoverChange?.(true) }
  const handleMouseLeave = () => { if (compact) onHoverChange?.(false) }

  return <aside className={mobile ? 'flex h-full w-72 flex-col bg-white' : 'sticky top-0 hidden h-screen min-w-0 flex-col border-r border-slate-200 bg-white lg:flex'} aria-label="Điều hướng quản trị" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
    <div className={`flex h-[68px] items-center border-b border-slate-200 ${expanded ? 'px-5' : 'justify-center px-0'}`}>
      <Link to="/admin" onClick={onNavigate} className={`flex min-w-0 items-center rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${expanded ? 'gap-3' : 'justify-center'}`} aria-label="GJob — Tổng quan" title={compact && !hoverExpanded ? 'GJob — Tổng quan' : undefined}>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white"><Zap size={18} strokeWidth={2.5} aria-hidden="true" /></span>
        <span className={expanded ? 'min-w-0' : 'sr-only'}><span className="block text-base font-bold leading-5 text-slate-950">GJob</span><span className="mt-0.5 block text-xs font-medium text-slate-500">Khu vực quản trị</span></span>
      </Link>
    </div>
    <nav className={`flex-1 overflow-y-auto py-5 ${expanded ? 'px-3' : 'px-2'}`} aria-label="Các khu vực quản trị">
      <div className={expanded ? 'space-y-6' : 'space-y-5'}>{adminNavigationGroups.map((group) => <section key={group.label}><p className={expanded ? 'px-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400' : 'sr-only'}>{group.label}</p><div className={expanded ? 'mt-2 space-y-1' : 'space-y-2'}>{group.items.map(({ to, label, icon: Icon, isActive }) => {
        const active = isActive(pathname)
        return <NavLink key={to} to={to} onClick={onNavigate} className={`group flex h-10 items-center rounded-lg text-sm font-semibold transition-[background-color,color,transform] duration-[var(--motion-feedback)] ease-[var(--ease-gjob)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${expanded ? 'gap-3 px-3' : 'justify-center px-0'} ${active ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:translate-x-px hover:bg-slate-50 hover:text-slate-900'}`} aria-current={active ? 'page' : undefined} aria-label={!expanded ? label : undefined} title={!expanded ? label : undefined}><Icon size={17} className={active ? 'text-blue-600' : 'text-slate-400 transition-colors group-hover:text-slate-600'} aria-hidden="true" /><span className={expanded ? undefined : 'sr-only'}>{label}</span></NavLink>
      })}</div></section>)}</div>
    </nav>
    {!mobile && <div className={`border-t border-slate-200 py-3 ${expanded ? 'px-3' : 'px-2'}`}><button type="button" onClick={onToggleCollapse} className={`flex h-10 w-full items-center rounded-lg text-sm font-semibold text-slate-600 transition-[background-color,color] duration-[var(--motion-feedback)] ease-[var(--ease-gjob)] hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${expanded ? 'gap-3 px-3' : 'justify-center px-0'}`} aria-label={compact ? 'Mở rộng thanh điều hướng' : 'Thu gọn thanh điều hướng'} title={!expanded ? 'Mở rộng thanh điều hướng' : undefined}>{compact ? <PanelLeftOpen size={18} aria-hidden="true" /> : <><PanelLeftClose size={18} aria-hidden="true" /><span>Thu gọn</span></>}</button></div>}
  </aside>
}
