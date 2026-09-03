import { X } from 'lucide-react'
import AdminSidebar from './AdminSidebar'

type Props = { open: boolean; onClose: () => void }

export default function AdminMobileDrawer({ open, onClose }: Props) {
  if (!open) return null

  return <div className="motion-backdrop fixed inset-0 z-50 bg-slate-950/40 lg:hidden" role="presentation" onMouseDown={onClose}><aside id="admin-mobile-drawer" role="dialog" aria-modal="true" aria-label="Điều hướng quản trị" className="motion-drawer relative h-full w-72" onMouseDown={(event) => event.stopPropagation()}><button type="button" onClick={onClose} className="absolute right-3 top-3 z-10 rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"><X size={19} aria-hidden="true" /><span className="sr-only">Đóng điều hướng</span></button><AdminSidebar mobile onNavigate={onClose} /></aside></div>
}
