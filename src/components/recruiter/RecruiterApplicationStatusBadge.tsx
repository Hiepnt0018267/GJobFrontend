import type { RecruiterApplicationStatus } from '../../types/recruiterApplication'
import { recruiterApplicationStatusLabels } from '../../utils/recruiterApplicationDisplay'

type Props = { status: RecruiterApplicationStatus }

const styles: Record<RecruiterApplicationStatus, string> = {
  SUBMITTED: 'bg-slate-100 text-[#1C1C1C] ring-black/[0.08]',
  REVIEWING: 'bg-amber-50 text-amber-800 ring-amber-200',
  SHORTLISTED: 'bg-slate-100 text-slate-900 ring-slate-200/80',
  REJECTED: 'bg-red-50 text-red-800 ring-red-200',
  HIRED: 'bg-[#1C1C1C] text-white ring-black/10',
  WITHDRAWN: 'bg-slate-100 text-slate-700 ring-slate-200',
}

export default function RecruiterApplicationStatusBadge({ status }: Props) {
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ring-1 ring-inset ${styles[status]}`}>{recruiterApplicationStatusLabels[status]}</span>
}
