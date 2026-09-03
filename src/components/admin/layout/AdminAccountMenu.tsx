import { ChevronDown, LogOut } from 'lucide-react'
import { useEffect, useRef } from 'react'

type Props = { name: string; email: string; open: boolean; onOpen: () => void; onToggle: () => void; onClose: () => void; onLogout: () => void }

export default function AdminAccountMenu({ name, email, open, onOpen, onToggle, onClose, onLogout }: Props) {
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => { if (rootRef.current && !rootRef.current.contains(event.target as Node)) onClose() }
    const handleKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose() }
    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => { document.removeEventListener('mousedown', handlePointerDown); document.removeEventListener('keydown', handleKeyDown) }
  }, [onClose])

  return <div ref={rootRef} className="relative" onMouseEnter={onOpen} onMouseLeave={onClose}>
    <button id="admin-account-trigger" type="button" onClick={onToggle} aria-expanded={open} aria-controls="admin-account-menu" className="flex items-center gap-2.5 rounded-xl border border-transparent px-3 py-1.5 transition-colors hover:border-slate-200 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white" aria-hidden="true">{name.charAt(0).toUpperCase()}</span>
      <span className="hidden text-left sm:block"><span className="block max-w-[120px] truncate text-sm font-semibold leading-tight text-slate-800">{name}</span><span className="text-[10px] font-medium text-red-700">Quản trị viên</span></span>
      <ChevronDown size={15} className={open ? 'rotate-180 text-blue-600 transition-transform' : 'text-slate-400 transition-transform'} aria-hidden="true" />
    </button>
    {open && <div className="absolute right-0 top-full z-40 w-72 pt-3"><div id="admin-account-menu" role="menu" aria-labelledby="admin-account-trigger" className="motion-dropdown overflow-hidden rounded-xl bg-white py-2 shadow-lg shadow-slate-900/10 ring-1 ring-slate-200"><div className="border-b border-slate-100 px-4 py-3"><p className="truncate text-sm font-semibold text-slate-950">{name}</p><p className="mt-0.5 truncate text-xs text-slate-500">{email}</p></div><button type="button" role="menuitem" onClick={onLogout} className="mt-2 flex w-full items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-red-700 transition-colors hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-red-500"><LogOut size={16} className="text-red-500" aria-hidden="true" />Đăng xuất</button></div></div>}
  </div>
}
