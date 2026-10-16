import { X } from 'lucide-react'
import { Link } from 'react-router-dom'

type Scope = { key: string; label: string; value: string; to?: string }
type Props = { scopes: Scope[]; onClear: (key: string) => void }

export default function AdminAuditScope({ scopes, onClear }: Props) {
  if (scopes.length === 0) return null
  return (
    <div className="mt-4 flex flex-wrap items-center gap-2" aria-label="Phạm vi dữ liệu đang xem">
      <span className="text-sm font-medium text-slate-500">Đang xem:</span>
      {scopes.map((scope) => <span key={scope.key} className="inline-flex max-w-full items-center gap-1 rounded-full bg-black/[0.04] py-1 pl-2.5 pr-1 text-xs font-semibold text-[#1C1C1C] ring-1 ring-inset ring-black/[0.08]"><span className="truncate">{scope.label}{scope.to ? <Link to={scope.to} className="ml-1 underline decoration-slate-300 underline-offset-2 hover:text-black">{scope.value}</Link> : <span className="ml-1">{scope.value}</span>}</span><button type="button" onClick={() => onClear(scope.key)} aria-label={`Bỏ phạm vi ${scope.label}`} className="rounded-full p-1 text-[#1C1C1C] transition-colors hover:bg-black/[0.06] hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1C1C1C]"><X size={13} aria-hidden="true" /></button></span>)}
    </div>
  )
}
