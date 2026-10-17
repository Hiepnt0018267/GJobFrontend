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
  application: 'bg-[#49BBBD]/12 text-[#49BBBD]',
  status: 'bg-[#49BBBD]/12 text-[#49BBBD]',
  withdrawn: 'bg-amber-50 text-amber-700',
  approved: 'bg-[#49BBBD]/12 text-[#49BBBD]',
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
