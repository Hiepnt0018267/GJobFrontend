import { MapPin, Briefcase } from 'lucide-react'
import type { Company } from '../../types/job'

interface CompanyCardProps {
  company: Company
}

export default function CompanyCard({ company }: CompanyCardProps) {
  return (
    <div className="group bg-white rounded-xl border border-slate-200 p-5 flex flex-col items-center gap-3 text-center hover:border-blue-300 hover:shadow-md transition-all duration-200">
      {/* Logo Placeholder */}
      <div
        className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-xl font-bold shadow-sm"
        aria-hidden="true"
      >
        {company.initial}
      </div>

      <div>
        <h3 className="font-semibold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">
          {company.name}
        </h3>
        <div className="flex items-center justify-center gap-1 mt-1 text-xs text-slate-500">
          <MapPin size={12} />
          {company.location}
        </div>
      </div>

      <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
        <Briefcase size={12} />
        {company.jobCount} việc đang tuyển
      </div>
    </div>
  )
}
