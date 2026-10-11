import { X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { ApplicantRankingMode } from '../../types/recruiterApplication'
import { validRankingTopN } from '../../utils/recruiterRanking'
import { trapDialogFocus } from '../../utils/dialogFocus'

type Props = { initialMode?: ApplicantRankingMode; initialTopN?: number; onClose: () => void; onConfirm: (mode: ApplicantRankingMode, topN: number) => void }

/** Operate: reuse incumbent dialog motion/surface; native top layer owns focus/inertness. */
export default function RecruiterRankingDialog({ initialMode = 'all', initialTopN = 10, onClose, onConfirm }: Props) {
  const ref = useRef<HTMLDialogElement>(null)
  const [mode, setMode] = useState(initialMode)
  const [topN, setTopN] = useState(String(initialTopN))
  const valid = mode === 'all' || validRankingTopN(topN)
  useEffect(() => {
    const dialog = ref.current
    const previous = document.activeElement as HTMLElement | null
    dialog?.showModal()
    return () => { dialog?.close(); previous?.focus() }
  }, [])

  return <dialog ref={ref} aria-labelledby="ranking-dialog-title" aria-describedby="ranking-dialog-description"
    onKeyDown={trapDialogFocus}
    onCancel={(event) => { event.preventDefault(); onClose() }}
    onClick={(event) => { if (event.target === event.currentTarget) onClose() }}
    className="motion-dialog fixed inset-0 m-auto max-h-[calc(100dvh_-_2rem)] w-[calc(100%_-_2rem)] max-w-lg overflow-y-auto rounded-2xl bg-white p-0 text-slate-900 shadow-premium backdrop:bg-slate-950/45">
    <form onSubmit={(event) => { event.preventDefault(); if (valid) onConfirm(mode, Number(topN)) }}>
      <header className="flex items-start justify-between gap-4 px-5 pt-6 sm:px-6">
        <h2 id="ranking-dialog-title" className="text-xl font-bold tracking-tight text-slate-950">Xếp hạng ứng viên bằng AI</h2>
        <button type="button" onClick={onClose} aria-label="Đóng hộp thoại xếp hạng" className="-mt-2 inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"><X size={20} strokeWidth={1.5} aria-hidden="true" /></button>
      </header>
      <div className="px-5 pb-6 pt-3 sm:px-6">
        <p id="ranking-dialog-description" className="text-sm leading-6 text-slate-600">Chọn phạm vi kết quả. Ứng viên chưa có tín hiệu AI vẫn được giữ trong nhóm riêng để bạn xem xét.</p>
        <fieldset className="mt-5 space-y-3">
          <legend className="sr-only">Phạm vi xếp hạng</legend>
          <label className="flex min-h-14 cursor-pointer items-center gap-3 rounded-xl bg-slate-50 px-4 py-3 text-sm font-semibold has-[:checked]:bg-blue-50 has-[:checked]:text-blue-800">
            <input type="radio" name="ranking-mode" value="all" checked={mode === 'all'} onChange={() => setMode('all')} className="h-4 w-4 accent-blue-600" />Xếp hạng tất cả ứng viên
          </label>
          <label className="flex min-h-14 cursor-pointer items-center gap-3 rounded-xl bg-slate-50 px-4 py-3 text-sm font-semibold has-[:checked]:bg-blue-50 has-[:checked]:text-blue-800">
            <input type="radio" name="ranking-mode" value="top_n" checked={mode === 'top_n'} onChange={() => setMode('top_n')} className="h-4 w-4 accent-blue-600" />Lấy Top N ứng viên
          </label>
        </fieldset>
        {mode === 'top_n' && <div className="mt-4">
          <label htmlFor="ranking-top-n" className="block text-sm font-semibold text-slate-700">Số ứng viên cần xem (N)</label>
          <input id="ranking-top-n" type="number" min="1" step="1" value={topN} onChange={(event) => setTopN(event.target.value)} aria-invalid={!valid} aria-describedby="ranking-n-help"
            className="mt-2 min-h-11 w-full rounded-xl bg-white px-3.5 py-3 text-base tabular-nums ring-1 ring-slate-300 outline-none focus:ring-2 focus:ring-blue-600" />
          <p id="ranking-n-help" className={`mt-2 text-sm leading-6 ${valid ? 'text-slate-600' : 'text-red-700'}`}>{valid ? 'N là số nguyên dương. Nếu chưa đủ N người đã xếp hạng, kết quả chỉ gồm số hiện có.' : 'Nhập một số nguyên dương, ví dụ 10.'}</p>
        </div>}
        <p className="mt-4 text-xs leading-5 text-slate-600">Top N theo thứ tự AI, không phải N người đạt chuẩn tuyển dụng.</p>
      </div>
      <footer className="flex justify-end gap-3 bg-slate-50 px-5 py-4 sm:px-6">
        <button type="button" onClick={onClose} className="min-h-11 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600">Hủy</button>
        <button type="submit" disabled={!valid} className="min-h-11 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-[background-color,transform] duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-blue-700 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">Xem kết quả</button>
      </footer>
    </form>
  </dialog>
}
