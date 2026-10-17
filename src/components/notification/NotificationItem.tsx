import { ArrowUpRight, LoaderCircle } from 'lucide-react'
import type { NotificationItem as NotificationItemType } from '../../types/notification'
import { formatNotificationTimestamp } from '../../utils/notification'
import NotificationGlyph from './NotificationGlyph'

type Props = {
  item: NotificationItemType
  compact?: boolean
  pending?: boolean
  actionable?: boolean
  onSelect?: (item: NotificationItemType) => void
}

export default function NotificationItem({ item, compact = false, pending = false, actionable = false, onSelect }: Props) {
  const content = (
    <>
      <NotificationGlyph type={item.type} compact={compact} />
      <span className="min-w-0 flex-1">
        <span className="flex items-start gap-2">
          <span className={`min-w-0 flex-1 break-words font-bold text-slate-950 ${compact ? 'text-sm leading-5' : 'text-[15px] leading-6'}`}>
            {item.title}
          </span>
          {!item.is_read && (
            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#49BBBD] ring-4 ring-[#49BBBD]/15" aria-label="Chưa đọc" />
          )}
        </span>
        <span className={`mt-1 block break-words text-slate-600 ${compact ? 'line-clamp-2 text-xs leading-5' : 'text-sm leading-6'}`}>
          {item.message}
        </span>
        <span className="mt-2 flex items-center gap-2 text-[11px] font-medium text-slate-400">
          <time dateTime={item.created_at}>{formatNotificationTimestamp(item.created_at)}</time>
          {actionable && <ArrowUpRight size={13} aria-hidden="true" />}
          {pending && <LoaderCircle size={13} className="animate-spin text-[#49BBBD]" aria-label="Đang cập nhật" />}
        </span>
      </span>
    </>
  )

  const className = `flex w-full items-start gap-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#49BBBD] ${compact ? 'px-4 py-3.5' : 'rounded-2xl px-4 py-4 sm:px-5'} ${item.is_read ? 'bg-white hover:bg-slate-50/80' : 'bg-[#49BBBD]/6 hover:bg-[#49BBBD]/10'}`

  if (onSelect) {
    return (
      <button type="button" disabled={pending} onClick={() => onSelect(item)} className={`${className} disabled:cursor-wait disabled:opacity-70`}>
        {content}
      </button>
    )
  }

  return <article className={className}>{content}</article>
}
