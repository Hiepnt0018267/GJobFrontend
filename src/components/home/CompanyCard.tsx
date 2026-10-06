import { MapPin } from 'lucide-react'
import type { Company } from '../../types/job'

interface CompanyCardProps {
  company: Company
}

export default function CompanyCard({ company }: CompanyCardProps) {
  return (
    <article className="btn-press group flex flex-col items-center gap-3.5 rounded-2xl border border-slate-200/80 bg-white p-5 text-center shadow-xs transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-1 hover:border-blue-300 hover:shadow-premium">
      {/* Logo Container with concentric radius */}
      <div
        className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 text-lg font-extrabold text-white shadow-sm ring-4 ring-slate-50 transition-transform duration-200 group-hover:scale-105"
        aria-hidden="true"
      >
        {company.initial}
      </div>

      <div className="min-w-0 w-full">
        <h3 className="truncate text-sm font-bold text-slate-900 transition-colors group-hover:text-blue-600">
          {company.name}
        </h3>
        <div className="mt-1 flex items-center justify-center gap-1 text-xs font-medium text-slate-500">
          <MapPin size={12} className="shrink-0 text-slate-400" aria-hidden="true" />
          <span className="truncate">{company.location}</span>
        </div>
      </div>
    </article>
  )
}
