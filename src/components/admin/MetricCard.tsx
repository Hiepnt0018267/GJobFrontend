import type { LucideIcon } from 'lucide-react'

type MetricCardProps = {
  title: string
  value: number
  description: string
  icon: LucideIcon
  tone: 'blue' | 'violet' | 'emerald' | 'slate'
}

const toneClasses: Record<MetricCardProps['tone'], string> = {
  blue: 'bg-blue-50 text-blue-700',
  violet: 'bg-violet-50 text-violet-700',
  emerald: 'bg-emerald-50 text-emerald-700',
  slate: 'bg-slate-100 text-slate-700',
}

const numberFormatter = new Intl.NumberFormat('vi-VN')

export default function MetricCard({ title, value, description, icon: Icon, tone }: MetricCardProps) {
  return (
    <article className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-600">{title}</p>
          <p className="mt-3 text-3xl font-bold tracking-tight tabular-nums text-slate-950">{numberFormatter.format(value)}</p>
          <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
        </div>
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${toneClasses[tone]}`} aria-hidden="true">
          <Icon size={19} strokeWidth={2.1} />
        </span>
      </div>
    </article>
  )
}
