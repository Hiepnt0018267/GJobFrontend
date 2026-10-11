import type { RecruiterApplicationListItem } from '../../types/recruiterApplication'
import { rankingPresentation } from '../../utils/recruiterRanking'

const tones = {
  ranked: 'bg-blue-50 text-blue-800 ring-blue-200',
  neutral: 'bg-slate-100 text-slate-700 ring-slate-200',
}

export default function RecruiterApplicationRanking({ application }: { application: RecruiterApplicationListItem }) {
  const { rankLabel, statusLabel, tone } = rankingPresentation(application)
  return <div className="flex min-w-0 flex-col items-start gap-1.5">
    {rankLabel && <span className="text-sm font-semibold tabular-nums text-blue-800">{rankLabel}</span>}
    <span className={`inline-flex max-w-full rounded-full px-2.5 py-1 text-xs font-medium leading-5 ring-1 ring-inset ${tones[tone]}`}>{statusLabel}</span>
  </div>
}
