import { ChevronDown, House, LogOut, Settings } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'

type Props = { name: string; email: string; open: boolean; compact?: boolean; idSuffix?: string; onOpen: () => void; onToggle: () => void; onClose: () => void; onNavigate?: () => void; onLogout: () => void }

export default function RecruiterAccountMenu({ name, email, open, compact = false, idSuffix = 'desktop', onOpen, onToggle, onClose, onNavigate, onLogout }: Props) {
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerId = `recruiter-account-trigger-${idSuffix}`
  const menuId = `recruiter-account-menu-${idSuffix}`

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => { if (rootRef.current && !rootRef.current.contains(event.target as Node)) onClose() }
    const handleKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose() }
    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => { document.removeEventListener('mousedown', handlePointerDown); document.removeEventListener('keydown', handleKeyDown) }
  }, [onClose])

  return (
    <div ref={rootRef} className="relative w-full" onMouseEnter={onOpen} onMouseLeave={onClose}>
      <button
        id={triggerId}
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={menuId}
        className={`flex min-h-12 w-full items-center rounded-xl border border-transparent transition-colors duration-150 hover:border-slate-200/80 hover:bg-slate-100/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1C1C1C] ${compact ? 'justify-center px-0' : 'gap-2.5 px-2.5'}`}
        title={compact ? name : undefined}
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1C1C1C] text-xs font-bold text-white shadow-2xs" aria-hidden="true">
          {name.charAt(0).toUpperCase()}
        </span>
        <span className={compact ? 'sr-only' : 'min-w-0 flex-1 text-left'}>
          <span className="block max-w-[120px] truncate text-sm font-semibold leading-tight text-slate-900">{name}</span>
          <span className="mt-0.5 inline-block rounded-full bg-black/[0.04] px-2 py-0.5 text-[10px] font-medium text-slate-600 ring-1 ring-inset ring-black/[0.06]">Nhà tuyển dụng</span>
        </span>
        {!compact && <ChevronDown size={15} className={open ? 'rotate-180 text-[#1C1C1C] transition-transform duration-200' : 'text-slate-400 transition-transform duration-200'} aria-hidden="true" />}
      </button>

      {open && (
        <div className={`absolute z-40 w-72 ${compact ? 'bottom-0 left-full pl-2' : 'bottom-full left-0 pb-2'}`}>
          <div
            id={menuId}
            role="menu"
            aria-labelledby={triggerId}
            className="motion-dropdown overflow-hidden rounded-2xl bg-white py-1.5 shadow-premium border border-slate-200/80 font-[Inter,sans-serif]"
          >
            <div className="border-b border-slate-100 bg-slate-50/50 px-4 py-3">
              <p className="truncate text-sm font-bold text-slate-950">{name}</p>
              <p className="mt-0.5 truncate text-xs text-slate-500">{email}</p>
            </div>
            <div className="p-1.5 space-y-0.5">
              <Link
                to="/recruiter/settings"
                role="menuitem"
                onClick={() => { onClose(); onNavigate?.() }}
                className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100/80 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#1C1C1C]"
              >
                <Settings size={16} className="text-slate-400" aria-hidden="true" />
                Cài đặt
              </Link>
              <Link
                to="/"
                role="menuitem"
                onClick={() => { onClose(); onNavigate?.() }}
                className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100/80 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#1C1C1C]"
              >
                <House size={16} className="text-slate-400" aria-hidden="true" />
                Về trang chủ
              </Link>
            </div>
            <div className="border-t border-slate-100 p-1.5">
              <button
                type="button"
                role="menuitem"
                onClick={onLogout}
                className="btn-press flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 hover:text-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-red-500"
              >
                <LogOut size={16} className="text-red-500" aria-hidden="true" />
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
