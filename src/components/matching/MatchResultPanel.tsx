import { AlertCircle, Check, CircleDot, Clock3, RefreshCw, SearchX } from 'lucide-react'
import type { BaselineMatchComponent, MatchExplanation, MatchedSkillEvidence, SemanticMatchComponent } from '../../types/matching'

type Props = {
  baseline: BaselineMatchComponent
  semantic: SemanticMatchComponent
  computedAt: string
  isFetching: boolean
  onRetry: () => void
}

const numberFormat = new Intl.NumberFormat('vi-VN', { minimumFractionDigits: 2, maximumFractionDigits: 3 })
const scoreFormat = new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 1 })
const dateFormat = new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium', timeStyle: 'short' })

function SkillList({ title, items, tone }: { title: string; items: string[]; tone: 'matched' | 'missing' }) {
  if (items.length === 0) return null
  const classes = tone === 'matched'
    ? 'bg-emerald-50 text-emerald-800 ring-emerald-200'
    : 'bg-amber-50 text-amber-900 ring-amber-200'

  return <div>
    <h4 className="text-sm font-semibold text-slate-800">{title}</h4>
    <ul className="mt-2 flex flex-wrap gap-2" aria-label={title}>
      {items.map((item) => <li key={item} className={`max-w-full break-words rounded-lg px-2.5 py-1.5 text-xs font-semibold ring-1 ${classes}`}>{item}</li>)}
    </ul>
  </div>
}

function ExplanationList({ title, items }: { title: string; items: MatchExplanation[] }) {
  if (items.length === 0) return null
  return <div>
    <h4 className="text-sm font-semibold text-slate-800">{title}</h4>
    <ul className="mt-2 space-y-2 text-sm leading-6 text-slate-600">
      {items.map((item, index) => <li key={`${item.code}-${index}`} className="flex gap-2">
        <CircleDot size={15} className="mt-1.5 shrink-0 text-slate-400" aria-hidden="true" />
        <span>
          {item.message}
          {item.evidence.length > 0 && <span className="mt-0.5 block text-xs text-slate-500">Dữ liệu: {item.evidence.join(', ')}</span>}
        </span>
      </li>)}
    </ul>
  </div>
}

function SkillEvidenceList({ items }: { items: MatchedSkillEvidence[] }) {
  if (items.length === 0) return null
  return <div>
    <h4 className="text-sm font-semibold text-slate-800">Nguồn kỹ năng đối chiếu</h4>
    <ul className="mt-2 grid gap-2 sm:grid-cols-2">
      {items.map((item) => <li key={`${item.normalized_name}-${item.sources.join('-')}`} className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">
        <span className="font-semibold text-slate-900">{item.skill}</span>
        <span className="mt-0.5 block text-xs text-slate-500">{item.sources.map((source) => source === 'CV_SKILL' ? 'Mục kỹ năng trong CV' : 'Công nghệ trong dự án').join(' · ')}</span>
      </li>)}
    </ul>
  </div>
}

function BaselineSection({ baseline }: { baseline: BaselineMatchComponent }) {
  if (baseline.status === 'INSUFFICIENT_SIGNALS' || !baseline.result) {
    return <section aria-labelledby="baseline-title" className="min-w-0 rounded-xl bg-slate-50 p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <SearchX size={20} className="mt-0.5 shrink-0 text-slate-500" aria-hidden="true" />
        <div>
          <h3 id="baseline-title" className="font-bold text-slate-900">Độ bao phủ kỹ năng</h3>
          <p className="mt-1 text-sm leading-6 text-slate-600">Chưa đủ dữ liệu kỹ năng có cấu trúc để tính chỉ số này.</p>
        </div>
      </div>
    </section>
  }

  const result = baseline.result
  const skills = result.components.skills
  const score = Math.min(100, Math.max(0, result.overall_score))

  return <section aria-labelledby="baseline-title" className="min-w-0">
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h3 id="baseline-title" className="text-base font-bold text-slate-950">Độ bao phủ kỹ năng</h3>
        <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600">So sánh các kỹ năng có cấu trúc trong CV với yêu cầu kỹ năng của công việc.</p>
      </div>
      <span className="tabular-nums text-3xl font-bold tracking-tight text-blue-700">{scoreFormat.format(score)}<span className="ml-1 text-base font-semibold text-slate-500">/ 100</span></span>
    </div>
    <progress aria-label="Độ bao phủ kỹ năng" value={score} max={100} className="mt-4 h-2 w-full overflow-hidden rounded-full accent-blue-600" />

    <div className="mt-6 space-y-5">
      <SkillList title="Kỹ năng tìm thấy trong CV" items={skills.matched_skills} tone="matched" />
      <SkillList title="Kỹ năng chưa tìm thấy trong dữ liệu CV" items={skills.missing_skills} tone="missing" />
      <SkillEvidenceList items={skills.evidence} />
      <ExplanationList title="Điểm mạnh từ dữ liệu" items={result.strengths} />
      <ExplanationList title="Khoảng trống cần xem lại" items={result.gaps} />
    </div>
  </section>
}

function SemanticSection({ semantic, isFetching, onRetry }: { semantic: SemanticMatchComponent; isFetching: boolean; onRetry: () => void }) {
  if (semantic.status === 'UNAVAILABLE' || !semantic.result) {
    return <section aria-labelledby="semantic-title" className="rounded-xl bg-amber-50 p-4 ring-1 ring-amber-200 sm:p-5">
      <div className="flex items-start gap-3">
        <AlertCircle size={20} className="mt-0.5 shrink-0 text-amber-700" aria-hidden="true" />
        <div>
          <h3 id="semantic-title" className="font-bold text-amber-950">Tương đồng ngữ nghĩa</h3>
          <p className="mt-1 text-sm leading-6 text-amber-900">Tạm thời chưa thể tính tương đồng nội dung giữa CV và mô tả công việc. Kết quả kỹ năng bên cạnh vẫn có giá trị độc lập.</p>
          <button type="button" onClick={onRetry} disabled={isFetching} className="mt-3 inline-flex min-h-11 items-center gap-1.5 rounded-lg px-2 text-sm font-semibold text-amber-950 underline decoration-amber-400 underline-offset-4 disabled:cursor-wait disabled:opacity-60">
            <RefreshCw size={15} className={isFetching ? 'animate-spin' : ''} aria-hidden="true" />{isFetching ? 'Đang thử lại…' : 'Thử lại'}
          </button>
        </div>
      </div>
    </section>
  }

  return <section aria-labelledby="semantic-title" className="rounded-xl bg-blue-50 p-4 sm:p-5">
    <h3 id="semantic-title" className="text-base font-bold text-slate-950">Tương đồng ngữ nghĩa</h3>
    <p className="mt-3 tabular-nums text-4xl font-bold tracking-tight text-blue-700">{numberFormat.format(semantic.result.semantic_similarity)}</p>
    <p className="mt-3 text-sm leading-6 text-slate-600">Chỉ số thô trên thang từ -1 đến 1, đo mức tương đồng nội dung giữa CV và mô tả công việc. Đây không phải xác suất được tuyển.</p>
  </section>
}

export default function MatchResultPanel({ baseline, semantic, computedAt, isFetching, onRetry }: Props) {
  return <div className="mt-6 border-t border-slate-200 pt-6">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
        <Clock3 size={15} aria-hidden="true" />
        <span>Phân tích lúc {dateFormat.format(new Date(computedAt))}</span>
      </div>
      {isFetching && <span role="status" aria-live="polite" className="inline-flex items-center gap-2 text-xs font-semibold text-blue-700"><RefreshCw size={14} className="animate-spin" aria-hidden="true" />Đang cập nhật phân tích…</span>}
    </div>

    <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(16rem,5fr)]">
      <BaselineSection baseline={baseline} />
      <SemanticSection semantic={semantic} isFetching={isFetching} onRetry={onRetry} />
    </div>

    <p className="mt-5 flex items-start gap-2 text-xs leading-5 text-slate-500">
      <Check size={15} className="mt-0.5 shrink-0 text-slate-400" aria-hidden="true" />
      Hai tín hiệu được trình bày độc lập để bạn tự đối chiếu; GJob không dùng chúng làm kết luận tuyển dụng.
    </p>
  </div>
}
