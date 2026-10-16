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
    <section className="rounded-2xl bg-[#F7F9FB] p-5 border border-black/[0.04] sm:p-6" aria-label={title}>
      <div>
        <h2 className="text-sm font-semibold tracking-tight text-[#1C1C1C] font-[Inter,sans-serif]">{title}</h2>
        <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
      </div>
      <dl className={`mt-5 grid gap-3 ${gridColumns}`}>
        {metrics.map(({ label, value, tone = 'default' }) => (
          <div key={label} className="flex items-center justify-between gap-3 rounded-xl bg-white border border-black/[0.04] px-3.5 py-3 transition-colors hover:border-black/[0.08]">
            <dt className="text-xs font-normal text-slate-600">{label}</dt>
            <dd className={`rounded-lg px-2.5 py-1 text-xs font-semibold tabular-nums ring-1 ring-inset font-[Inter,sans-serif] ${toneClasses[tone]}`}>
              {numberFormatter.format(value)}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
