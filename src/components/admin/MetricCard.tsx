import { ArrowUpRight, type LucideIcon } from 'lucide-react'
import { Link } from 'react-router-dom'

type MetricCardProps = {
  title: string
  value: number
  description: string
  icon: LucideIcon
  surface: 'mist' | 'sky'
  to?: string
}

const surfaceClasses: Record<MetricCardProps['surface'], string> = {
  mist: 'bg-[#E5ECF6]',
  sky: 'bg-[#E3F5FF]',
}

const numberFormatter = new Intl.NumberFormat('vi-VN')

export default function MetricCard({ title, value, description, icon: Icon, surface, to }: MetricCardProps) {
  const content = (
    <>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-normal text-slate-600">{title}</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight tabular-nums text-[#1C1C1C] font-[Inter,sans-serif]">
            {numberFormatter.format(value)}
          </p>
          <p className="mt-1.5 text-xs leading-5 text-slate-500">{description}</p>
        </div>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-black/[0.04] bg-white text-[#1C1C1C] transition-transform duration-200 group-hover:scale-105" aria-hidden="true">
          <Icon size={17} strokeWidth={2} />
        </span>
      </div>
      {to && (
        <span className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-[#1C1C1C] transition-colors group-hover:text-black">
          Quản lý
          <ArrowUpRight size={15} aria-hidden="true" className="transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </span>
      )}
    </>
  )
  const className = `group block rounded-2xl p-5 sm:p-6 transition-all duration-150 ${surfaceClasses[surface]} ${
    to ? 'motion-card hover:-translate-y-0.5 hover:border-black/[0.08] hover:shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1C1C1C]' : ''
  }`
  return to ? <Link to={to} className={className} aria-label={`Quản lý ${title}`}>{content}</Link> : <article className={className}>{content}</article>
}
