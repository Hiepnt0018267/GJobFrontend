import { Link } from 'react-router-dom'
import { MapPin, DollarSign, Briefcase, ArrowRight } from 'lucide-react'
import type { Job } from '../../types/job'

interface JobCardProps {
  job: Job
}

export default function JobCard({ job }: JobCardProps) {
  return (
    <article className="group bg-white rounded-xl border border-slate-200 p-5 flex flex-col gap-4 hover:border-blue-300 hover:shadow-md transition-all duration-200">
      {/* Header */}
      <div>
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-semibold text-slate-900 text-base leading-snug group-hover:text-blue-600 transition-colors">
            {job.title}
          </h3>
          <span className="shrink-0 text-xs font-medium bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full">
            {job.type}
          </span>
        </div>
        <p className="text-sm font-medium text-blue-600">{job.company}</p>
      </div>

      {/* Meta */}
      <ul className="flex flex-col gap-1.5">
        <li className="flex items-center gap-1.5 text-sm text-slate-500">
          <MapPin size={14} className="shrink-0 text-slate-400" />
          {job.location}
        </li>
        <li className="flex items-center gap-1.5 text-sm text-slate-500">
          <DollarSign size={14} className="shrink-0 text-slate-400" />
          {job.salary}
        </li>
        <li className="flex items-center gap-1.5 text-sm text-slate-500">
          <Briefcase size={14} className="shrink-0 text-slate-400" />
          {job.type}
        </li>
      </ul>

      {/* Action */}
      <div className="mt-auto pt-2 border-t border-slate-100">
        <Link
          to={`/jobs/${job.id}`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors focus:outline-none focus:underline"
        >
          Xem chi tiết
          <ArrowRight size={14} />
        </Link>
      </div>
    </article>
  )
}
