import { ArrowUpRight, type LucideIcon } from 'lucide-react'
import { Link } from 'react-router-dom'

type MetricCardProps = {
  title: string
  value: number
  description: string
  icon: LucideIcon
  tone: 'blue' | 'violet' | 'emerald' | 'slate'
  to?: string
}

const toneClasses: Record<MetricCardProps['tone'], string> = {
  blue: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200/60',
  violet: 'bg-violet-50 text-violet-700 ring-1 ring-violet-200/60',
  emerald: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/60',
  slate: 'bg-slate-100 text-slate-700 ring-1 ring-slate-200/60',
}

const numberFormatter = new Intl.NumberFormat('vi-VN')

export default function MetricCard({ title, value, description, icon: Icon, tone, to }: MetricCardProps) {
  const content = (
    <>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-600">{title}</p>
          <p className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight tabular-nums text-slate-950 font-[Plus_Jakarta_Sans,sans-serif]">
            {numberFormatter.format(value)}
          </p>
          <p className="mt-1.5 text-xs leading-5 text-slate-500">{description}</p>
        </div>
        <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105 ${toneClasses[tone]}`} aria-hidden="true">
          <Icon size={20} strokeWidth={2.1} />
        </span>
      </div>
      {to && (
        <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-blue-700 transition-colors group-hover:text-blue-800">
          Quản lý
          <ArrowUpRight size={15} aria-hidden="true" className="transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </span>
      )}
    </>
  )
  const className = `group block rounded-2xl bg-white p-5 shadow-premium border border-slate-200/80 transition-all duration-200 ${
    to ? 'motion-card hover:-translate-y-0.5 hover:border-blue-200/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2' : ''
  }`
  return to ? <Link to={to} className={className} aria-label={`Quản lý ${title}`}>{content}</Link> : <article className={className}>{content}</article>
}
