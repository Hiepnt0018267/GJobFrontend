import { Building2, ChevronDown, House, LogOut } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'

type Props = { name: string; email: string; open: boolean; onOpen: () => void; onToggle: () => void; onClose: () => void; onLogout: () => void }

export default function RecruiterAccountMenu({ name, email, open, onOpen, onToggle, onClose, onLogout }: Props) {
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => { if (rootRef.current && !rootRef.current.contains(event.target as Node)) onClose() }
    const handleKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose() }
    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => { document.removeEventListener('mousedown', handlePointerDown); document.removeEventListener('keydown', handleKeyDown) }
  }, [onClose])

  return <div ref={rootRef} className="relative" onMouseEnter={onOpen} onMouseLeave={onClose}>
    <button id="recruiter-account-trigger" type="button" onClick={onToggle} aria-expanded={open} aria-controls="recruiter-account-menu" className="flex items-center gap-2.5 rounded-xl border border-transparent px-3 py-1.5 transition-colors hover:border-slate-200 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white" aria-hidden="true">{name.charAt(0).toUpperCase()}</span>
      <span className="hidden text-left sm:block"><span className="block max-w-[120px] truncate text-sm font-semibold leading-tight text-slate-800">{name}</span><span className="text-[10px] font-medium text-violet-700">Nhà tuyển dụng</span></span>
      <ChevronDown size={15} className={open ? 'rotate-180 text-blue-600 transition-transform' : 'text-slate-400 transition-transform'} aria-hidden="true" />
    </button>
    {open && <div className="absolute right-0 top-full z-40 w-72 pt-3"><div id="recruiter-account-menu" role="menu" aria-labelledby="recruiter-account-trigger" className="motion-dropdown overflow-hidden rounded-xl bg-white py-2 shadow-lg shadow-slate-900/10 ring-1 ring-slate-200"><div className="border-b border-slate-100 px-4 py-3"><p className="truncate text-sm font-semibold text-slate-950">{name}</p><p className="mt-0.5 truncate text-xs text-slate-500">{email}</p></div><Link to="/recruiter/profile" role="menuitem" onClick={onClose} className="mt-1 flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500"><Building2 size={16} className="text-slate-400" aria-hidden="true" />Hồ sơ công ty</Link><Link to="/" role="menuitem" onClick={onClose} className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500"><House size={16} className="text-slate-400" aria-hidden="true" />Về trang chủ</Link><div className="my-2 border-t border-slate-100" /><button type="button" role="menuitem" onClick={onLogout} className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-red-700 transition-colors hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-red-500"><LogOut size={16} className="text-red-500" aria-hidden="true" />Đăng xuất</button></div></div>}
  </div>
}
