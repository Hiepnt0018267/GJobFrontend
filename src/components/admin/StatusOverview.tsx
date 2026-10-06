export type StatusMetric = {
  label: string
  value: number
  tone?: 'default' | 'pending' | 'success' | 'danger'
}

type StatusOverviewProps = {
  title: string
  description: string
  metrics: StatusMetric[]
  columns?: 2 | 3
}

const toneClasses: Record<NonNullable<StatusMetric['tone']>, string> = {
  default: 'bg-slate-100 text-slate-700 ring-slate-200/60',
  pending: 'bg-amber-50 text-amber-800 ring-amber-200/60',
  success: 'bg-emerald-50 text-emerald-800 ring-emerald-200/60',
  danger: 'bg-red-50 text-red-800 ring-red-200/60',
}

const numberFormatter = new Intl.NumberFormat('vi-VN')

export default function StatusOverview({ title, description, metrics, columns = 2 }: StatusOverviewProps) {
  const gridColumns = columns === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2'

  return (
    <section className="rounded-2xl bg-white p-5 shadow-premium border border-slate-200/80 sm:p-6" aria-label={title}>
      <div>
        <h2 className="text-lg font-bold tracking-tight text-slate-950 font-[Plus_Jakarta_Sans,sans-serif]">{title}</h2>
        <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
      </div>
      <dl className={`mt-5 grid gap-3 ${gridColumns}`}>
        {metrics.map(({ label, value, tone = 'default' }) => (
          <div key={label} className="flex items-center justify-between gap-3 rounded-xl bg-slate-50/80 border border-slate-100/80 px-3.5 py-3 transition-colors hover:bg-slate-100/60">
            <dt className="text-sm font-medium text-slate-600">{label}</dt>
            <dd className={`rounded-lg px-2.5 py-1 text-sm font-bold tabular-nums ring-1 ring-inset font-[Plus_Jakarta_Sans,sans-serif] ${toneClasses[tone]}`}>
              {numberFormatter.format(value)}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
