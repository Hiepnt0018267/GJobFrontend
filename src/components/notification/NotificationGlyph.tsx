import {
  BellRing,
  CircleAlert,
  FileCheck2,
  FileClock,
  FileX2,
  UserRoundCheck,
} from 'lucide-react'
import { notificationVisualCategory } from '../../utils/notification'

const categoryStyles = {
  neutral: 'bg-slate-100 text-slate-600',
  application: 'bg-blue-50 text-blue-700',
  status: 'bg-violet-50 text-violet-700',
  withdrawn: 'bg-amber-50 text-amber-700',
  approved: 'bg-emerald-50 text-emerald-700',
  rejected: 'bg-rose-50 text-rose-700',
} as const

export default function NotificationGlyph({ type, compact = false }: { type: string; compact?: boolean }) {
  const category = notificationVisualCategory(type)
  const Icon = category === 'application'
    ? UserRoundCheck
    : category === 'status'
      ? FileClock
      : category === 'withdrawn'
        ? FileX2
        : category === 'approved'
          ? FileCheck2
          : category === 'rejected'
            ? CircleAlert
            : BellRing

  return (
    <span
      data-notification-category={category}
      className={`flex shrink-0 items-center justify-center rounded-xl ${categoryStyles[category]} ${compact ? 'h-9 w-9' : 'h-11 w-11'}`}
      aria-hidden="true"
    >
      <Icon size={compact ? 17 : 20} strokeWidth={2} />
    </span>
  )
}
