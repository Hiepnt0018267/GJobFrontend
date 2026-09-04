import type { RecruiterApplicationStatus } from '../../types/recruiterApplication'
import { recruiterApplicationStatusLabels } from '../../utils/recruiterApplicationDisplay'

type Props = { status: RecruiterApplicationStatus }

const styles: Record<RecruiterApplicationStatus, string> = {
  SUBMITTED: 'bg-blue-50 text-blue-800 ring-blue-200',
  REVIEWING: 'bg-amber-50 text-amber-800 ring-amber-200',
  SHORTLISTED: 'bg-violet-50 text-violet-800 ring-violet-200',
  REJECTED: 'bg-red-50 text-red-800 ring-red-200',
  HIRED: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
  WITHDRAWN: 'bg-slate-100 text-slate-700 ring-slate-200',
}

export default function RecruiterApplicationStatusBadge({ status }: Props) {
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ring-1 ring-inset ${styles[status]}`}>{recruiterApplicationStatusLabels[status]}</span>
}
