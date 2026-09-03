import { AlertCircle, Loader2 } from 'lucide-react'

type Props = {
  isFetching: boolean
  errorMessage: string | null
  onRetry: () => void
}

/** A compact, non-blocking status for a list that already has usable data. */
export default function QueryFetchFeedback({ isFetching, errorMessage, onRetry }: Props) {
  if (isFetching) {
    return <div className="mt-4 min-h-9"><p role="status" aria-live="polite" className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500"><Loader2 size={14} className="animate-spin text-blue-600" aria-hidden="true" />Đang cập nhật…</p></div>
  }

  if (!errorMessage) return <div className="mt-4 min-h-9" aria-hidden="true" />

  return <div role="status" aria-live="polite" className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-sm text-amber-900"><AlertCircle size={16} className="shrink-0 text-amber-700" aria-hidden="true" /><span>Không thể cập nhật dữ liệu mới nhất. {errorMessage}</span><button type="button" onClick={onRetry} className="font-semibold underline underline-offset-2 hover:text-amber-950">Thử lại</button></div>
}
