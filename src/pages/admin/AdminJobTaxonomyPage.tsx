import { useEffect, useLayoutEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import {
  AlertCircle,
  BriefcaseBusiness,
  ChevronDown,
  ChevronUp,
  FileText,
  FolderTree,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  X,
} from 'lucide-react'
import { AdminFilterPill, AdminFilterResetButton } from '../../components/admin/AdminFilterControls'
import AdminViewportPortal from '../../components/admin/AdminViewportPortal'
import { adminJobTaxonomyService } from '../../services/adminJobTaxonomyService'
import type {
  AdminJobTaxonomy,
  AdminTaxonomyIndustry,
  AdminTaxonomyPosition,
} from '../../types/adminJobTaxonomy'
import type { JobLevel } from '../../types/job'
import { getApiErrorCode, getApiErrorStatus } from '../../utils/apiError'

const ALL_JOB_LEVELS: [JobLevel, string][] = [
  ['INTERN', 'Thực tập sinh (Intern)'],
  ['JUNIOR', 'Mới tốt nghiệp / Junior'],
  ['STAFF', 'Chuyên viên (Staff)'],
  ['SENIOR', 'Chuyên viên cao cấp (Senior)'],
  ['LEAD', 'Trưởng nhóm (Lead)'],
  ['MANAGER', 'Quản lý (Manager)'],
  ['DIRECTOR', 'Giám đốc (Director)'],
  ['EXECUTIVE', 'Lãnh đạo cấp cao (Executive)'],
]

type DialogState =
  | { type: 'industry'; item?: AdminTaxonomyIndustry }
  | { type: 'position'; item?: AdminTaxonomyPosition }
  | null

type IndustryStatusFilter = 'ALL' | 'ACTIVE' | 'INACTIVE'
type PositionStatusFilter = IndustryStatusFilter

const POSITION_PAGE_SIZE = 20
const INITIAL_VISIBLE_INDUSTRIES_COUNT = 6
const STATUS_FILTER_OPTIONS: Array<{ value: IndustryStatusFilter; label: string }> = [
  { value: 'ALL', label: 'Tất cả trạng thái' },
  { value: 'ACTIVE', label: 'Đang dùng' },
  { value: 'INACTIVE', label: 'Tạm ẩn' },
]

const EMPTY_TAXONOMY: AdminJobTaxonomy = { industries: [], positions: [] }

function errorMessage(error: unknown): string {
  const status = getApiErrorStatus(error)
  const code = getApiErrorCode(error)
  if (status === null) return 'Không thể kết nối tới máy chủ.'
  if (status === 401) return 'Phiên đăng nhập đã hết hạn.'
  if (status === 403) return 'Bạn không có quyền quản lý danh mục nghề nghiệp.'
  if (status === 409 || code === 'TAXONOMY_CODE_EXISTS') return 'Mã danh mục đã tồn tại.'
  if (code === 'POSITION_LEVEL_POLICY_REQUIRED') return 'Hãy chọn ít nhất một cấp bậc hoặc bật “Cho phép tất cả cấp bậc”.'
  if (status === 422) return 'Dữ liệu chưa hợp lệ. Hãy kiểm tra mã và ngành nghề đã chọn.'
  return status >= 500 ? 'Máy chủ đang gặp sự cố.' : 'Không thể hoàn tất thao tác.'
}

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-flex h-8 min-w-[5.75rem] items-center justify-center gap-1.5 rounded-xl border px-3 text-[11px] font-semibold ${
        active
          ? 'border-emerald-200/80 bg-emerald-50 text-emerald-800'
          : 'border-slate-200 bg-slate-100 text-slate-500'
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${active ? 'bg-emerald-500' : 'bg-slate-400'}`} />
      {active ? 'Đang dùng' : 'Tạm ẩn'}
    </span>
  )
}

function TaxonomyDialog({
  state,
  industries,
  busy,
  error,
  onClose,
  onSubmit,
}: {
  state: Exclude<DialogState, null>
  industries: AdminTaxonomyIndustry[]
  busy: boolean
  error: string
  onClose: () => void
  onSubmit: (payload: {
    code?: string
    display_name: string
    sort_order: number
    is_active?: boolean
    industry_codes?: string[]
    allowed_levels?: JobLevel[]
    default_level?: JobLevel | null
  }) => Promise<void>
}) {
  const editing = Boolean(state.item)
  const [code, setCode] = useState(state.item?.code ?? '')
  const [name, setName] = useState(state.item?.display_name ?? '')
  const [sortOrder, setSortOrder] = useState(state.item?.sort_order ?? 0)
  const [active, setActive] = useState(state.item?.is_active ?? true)
  const [industryCodes, setIndustryCodes] = useState<string[]>(
    state.type === 'position' ? state.item?.industry_codes ?? [] : []
  )
  const [allowedLevels, setAllowedLevels] = useState<JobLevel[]>(
    state.type === 'position' ? state.item?.allowed_levels ?? [] : []
  )
  const [defaultLevel, setDefaultLevel] = useState<JobLevel | ''>(
    state.type === 'position' ? state.item?.default_level ?? '' : ''
  )
  const allLevelsSelected = allowedLevels.length === ALL_JOB_LEVELS.length

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !busy) onClose()
    }
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [busy, onClose])

  const toggleAllowedLevel = (level: JobLevel) => {
    setAllowedLevels((current) => {
      const next = current.includes(level)
        ? current.filter((l) => l !== level)
        : [...current, level]
      if (defaultLevel && !next.includes(defaultLevel as JobLevel)) {
        setDefaultLevel('')
      }
      return next
    })
  }

  const toggleAllLevels = (checked: boolean) => {
    setAllowedLevels(checked ? ALL_JOB_LEVELS.map(([level]) => level) : [])
    if (!checked) setDefaultLevel('')
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    await onSubmit({
      ...(editing ? {} : { code: code.trim().toUpperCase().replace(/\s+/g, '_') }),
      display_name: name.trim(),
      sort_order: sortOrder,
      ...(editing ? { is_active: active } : {}),
      ...(state.type === 'position'
        ? {
            industry_codes: industryCodes,
            allowed_levels: allowedLevels,
            default_level: defaultLevel ? (defaultLevel as JobLevel) : null,
          }
        : {}),
    })
  }

  return (
    <AdminViewportPortal>
      <div
        className="taxonomy-dialog-backdrop fixed inset-0 z-[100] flex min-h-dvh items-center justify-center overflow-y-auto overscroll-contain bg-slate-950/45 p-4 backdrop-blur-sm"
        role="presentation"
        onMouseDown={(event) => {
          if (event.target === event.currentTarget && !busy) onClose()
        }}
      >
        <section
          role="dialog"
          aria-modal="true"
          aria-labelledby="taxonomy-dialog-title"
          className={`taxonomy-dialog-panel flex max-h-[calc(100dvh-2rem)] w-full flex-col overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-slate-900/10 ${
            state.type === 'position' ? 'max-w-3xl' : 'max-w-lg'
          }`}
        >
          <header className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#1C1C1C]">
                Danh mục nghề nghiệp
              </p>
              <h2 id="taxonomy-dialog-title" className="mt-1 text-xl font-bold text-slate-950">
                {editing ? 'Chỉnh sửa' : 'Thêm'} {state.type === 'industry' ? 'ngành nghề' : 'vị trí'}
              </h2>
            </div>
            <button
              type="button"
              aria-label="Đóng"
              disabled={busy}
              onClick={onClose}
              className="btn-press rounded-xl p-2 text-slate-400 transition-colors duration-150 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
            >
              <X size={19} />
            </button>
          </header>
          <form onSubmit={(event) => void submit(event)} className="flex-1 space-y-5 overflow-y-auto overflow-x-hidden p-5">
            {!editing && (
              <label className="block text-sm font-semibold text-slate-700">
                Mã ổn định
                <input
                  value={code}
                  onChange={(event) => setCode(event.target.value)}
                  required
                  minLength={2}
                  maxLength={64}
                  placeholder={state.type === 'industry' ? 'INFORMATION_TECHNOLOGY' : 'BACKEND_DEVELOPER'}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 font-mono text-sm uppercase outline-none transition focus:border-[#1C1C1C] focus:ring-2 focus:ring-black/10"
                />
                <span className="mt-1.5 block text-xs font-normal text-slate-500">
                  Mã được cố định sau khi tạo để bảo vệ các liên kết dữ liệu.
                </span>
              </label>
            )}
            <label className="block text-sm font-semibold text-slate-700">
              Tên hiển thị
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
                maxLength={255}
                placeholder={state.type === 'industry' ? 'Công nghệ thông tin' : 'Lập trình viên Backend'}
                className="mt-2 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition focus:border-[#1C1C1C] focus:ring-2 focus:ring-black/10"
              />
            </label>
            <label className="block text-sm font-semibold text-slate-700">
              Thứ tự hiển thị
              <input
                type="number"
                min={0}
                max={100000}
                value={sortOrder}
                onChange={(event) => setSortOrder(Number(event.target.value))}
                className="mt-2 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition focus:border-[#1C1C1C] focus:ring-2 focus:ring-black/10"
              />
            </label>
            {state.type === 'position' && (
              <fieldset>
                <legend className="text-sm font-semibold text-slate-700">Thuộc ngành nghề</legend>
                <div className="mt-2 max-h-40 space-y-1 overflow-y-auto rounded-xl border border-slate-200 p-2">
                  {industries.map((industry) => (
                    <label
                      key={industry.code}
                      className="flex cursor-pointer items-center gap-3 rounded-lg px-2.5 py-2 text-sm transition-colors duration-150 hover:bg-slate-50"
                    >
                      <input
                        type="checkbox"
                        checked={industryCodes.includes(industry.code)}
                        onChange={(event) =>
                          setIndustryCodes((current) =>
                            event.target.checked
                              ? [...current, industry.code]
                              : current.filter((codeValue) => codeValue !== industry.code)
                          )
                        }
                        className="h-4 w-4 rounded border-slate-300 accent-[#1C1C1C]"
                      />
                      <span className="min-w-0 flex-1 truncate text-slate-700">{industry.display_name}</span>
                      {!industry.is_active && <span className="text-xs text-slate-400">Tạm ẩn</span>}
                    </label>
                  ))}
                </div>
              </fieldset>
            )}
            {state.type === 'position' && (
              <fieldset>
                <legend className="text-sm font-semibold text-slate-700">Cấp bậc cho phép (Policy)</legend>
                <p className="mt-0.5 text-xs text-slate-500">
                  Bắt buộc chọn các cấp bậc phù hợp để ngăn nhà tuyển dụng tạo tổ hợp sai.
                </p>
                <label className="mt-2 flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 transition-colors duration-150 hover:border-slate-300 hover:bg-slate-100/80">
                  <span>
                    <span className="block text-sm font-semibold text-slate-800">Cho phép tất cả cấp bậc</span>
                    <span className="mt-0.5 block text-xs text-slate-500">Chọn rõ cả 8 cấp bậc thay vì để chính sách trống.</span>
                  </span>
                  <input
                    type="checkbox"
                    checked={allLevelsSelected}
                    onChange={(event) => toggleAllLevels(event.target.checked)}
                    className="h-5 w-5 shrink-0 rounded border-slate-300 accent-[#1C1C1C]"
                  />
                </label>
                <div className="mt-2 grid grid-cols-2 gap-1.5 rounded-xl border border-slate-200 p-2.5">
                  {ALL_JOB_LEVELS.map(([level, label]) => (
                    <label key={level} className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-xs transition-colors duration-150 hover:bg-slate-50">
                      <input
                        type="checkbox"
                        checked={allowedLevels.includes(level)}
                        onChange={() => toggleAllowedLevel(level)}
                        className="h-4 w-4 rounded border-slate-300 accent-[#1C1C1C]"
                      />
                      <span className="truncate text-slate-700">{label}</span>
                    </label>
                  ))}
                </div>
                {allowedLevels.length === 0 && (
                  <p className="mt-2 text-xs font-semibold text-amber-700">Hãy chọn ít nhất một cấp bậc hoặc bật “Cho phép tất cả cấp bậc”.</p>
                )}
              </fieldset>
            )}
            {state.type === 'position' && (
              <label className="block text-sm font-semibold text-slate-700">
                Cấp bậc mặc định (Gợi ý)
                <select
                  value={defaultLevel}
                  onChange={(e) => setDefaultLevel(e.target.value as JobLevel | '')}
                  disabled={allowedLevels.length === 0}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-[#1C1C1C] focus:ring-2 focus:ring-black/10 disabled:bg-slate-100 disabled:text-slate-400"
                >
                  <option value="">-- Không chọn cấp bậc mặc định --</option>
                  {ALL_JOB_LEVELS.filter(([level]) => allowedLevels.includes(level)).map(([level, label]) => (
                    <option key={level} value={level}>
                      {label}
                    </option>
                  ))}
                </select>
                <span className="mt-1.5 block text-xs font-normal text-slate-500">
                  {allowedLevels.length === 0
                    ? 'Hãy chọn ít nhất một cấp bậc cho phép để cấu hình cấp bậc mặc định.'
                    : 'Chỉ dùng để gợi ý khi trường cấp bậc đang trống; không tự ghi đè lựa chọn của người dùng.'}
                </span>
              </label>
            )}
            {state.type === 'position' && editing && Boolean(state.item?.incompatible_jobs_count) && (
              <div role="alert" className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-xs text-amber-900">
                <AlertCircle size={16} className="mt-0.5 shrink-0 text-amber-600" />
                <div>
                  <strong className="font-semibold">Cảnh báo tin tuyển dụng cũ:</strong> Đang có {state.item?.incompatible_jobs_count} tin tuyển dụng đã đăng có cấp bậc không thuộc danh sách cho phép mới. Hệ thống không tự sửa tin cũ.
                </div>
              </div>
            )}
            {editing && (
              <label className="flex items-center justify-between gap-4 rounded-xl bg-slate-50 px-4 py-3">
                <span>
                  <span className="block text-sm font-semibold text-slate-800">Cho phép sử dụng</span>
                  <span className="mt-0.5 block text-xs text-slate-500">Tắt để ẩn khỏi lựa chọn mới, dữ liệu cũ vẫn được giữ.</span>
                </span>
                <input type="checkbox" checked={active} onChange={(event) => setActive(event.target.checked)} className="h-5 w-5 accent-[#1C1C1C]" />
              </label>
            )}
            {error && <p role="alert" className="taxonomy-content-enter rounded-xl bg-rose-50 px-3.5 py-3 text-sm font-medium text-rose-700">{error}</p>}
            <footer className="flex justify-end gap-3 border-t border-slate-100 pt-4">
              <button
                type="button"
                disabled={busy}
                onClick={onClose}
                className="btn-press rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors duration-150 hover:bg-slate-50 disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={busy || !name.trim() || (!editing && !code.trim()) || (state.type === 'position' && (industryCodes.length === 0 || allowedLevels.length === 0))}
                className="btn-press inline-flex items-center gap-2 rounded-xl bg-[#1C1C1C] px-4 py-2.5 text-sm font-semibold text-white transition-[background-color,box-shadow,transform] duration-150 hover:bg-black hover:shadow-md disabled:cursor-not-allowed disabled:opacity-45"
              >
                {busy && <RefreshCw size={15} className="animate-spin" />}
                {editing ? 'Lưu thay đổi' : 'Tạo danh mục'}
              </button>
            </footer>
          </form>
        </section>
      </div>
    </AdminViewportPortal>
  )
}

export default function AdminJobTaxonomyPage() {
  const [data, setData] = useState<AdminJobTaxonomy>(EMPTY_TAXONOMY)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [actionError, setActionError] = useState('')
  const [busy, setBusy] = useState(false)
  const [search, setSearch] = useState('')
  const [industrySearch, setIndustrySearch] = useState('')
  const [industrySearchExpanded, setIndustrySearchExpanded] = useState(false)
  const industrySearchCollapseTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const industrySearchBarRef = useRef<HTMLDivElement>(null)
  const industryFilterControlsRef = useRef<HTMLDivElement>(null)
  const previousIndustrySearchBarHeight = useRef<number | null>(null)
  const previousIndustryFilterRect = useRef<DOMRect | null>(null)
  const [industryStatus, setIndustryStatus] = useState<IndustryStatusFilter>('ALL')
  const [positionStatus, setPositionStatus] = useState<PositionStatusFilter>('ALL')
  const [selectedIndustry, setSelectedIndustry] = useState<string>('ALL')
  const [positionPage, setPositionPage] = useState(1)
  const [dialog, setDialog] = useState<DialogState>(null)
  const [showAllIndustries, setShowAllIndustries] = useState(false)

  const load = async (signal?: AbortSignal) => {
    setLoading(true)
    setLoadError('')
    try {
      setData(await adminJobTaxonomyService.getTaxonomy(signal))
    } catch (error) {
      if (!signal?.aborted) setLoadError(errorMessage(error))
    } finally {
      if (!signal?.aborted) setLoading(false)
    }
  }

  useEffect(() => {
    const controller = new AbortController()
    adminJobTaxonomyService
      .getTaxonomy(controller.signal)
      .then((value) => setData(value))
      .catch((error: unknown) => {
        if (!controller.signal.aborted) setLoadError(errorMessage(error))
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })
    return () => controller.abort()
  }, [])

  useEffect(() => () => {
    if (industrySearchCollapseTimer.current) clearTimeout(industrySearchCollapseTimer.current)
  }, [])

  const openIndustrySearch = () => {
    if (industrySearchCollapseTimer.current) clearTimeout(industrySearchCollapseTimer.current)
    setIndustrySearchExpanded(true)
  }

  const closeIndustrySearch = () => {
    if (industrySearch) return
    if (industrySearchCollapseTimer.current) clearTimeout(industrySearchCollapseTimer.current)
    industrySearchCollapseTimer.current = setTimeout(() => setIndustrySearchExpanded(false), 180)
  }

  const normalizedSearch = search.trim().toLocaleLowerCase('vi')
  const normalizedIndustrySearch = industrySearch.trim().toLocaleLowerCase('vi')
  const filteredIndustries = useMemo(
    () =>
      data.industries.filter((industry) => {
        const matchesSearch =
          !normalizedIndustrySearch ||
          `${industry.display_name} ${industry.code}`
            .toLocaleLowerCase('vi')
            .includes(normalizedIndustrySearch)
        const matchesStatus =
          industryStatus === 'ALL' ||
          (industryStatus === 'ACTIVE' ? industry.is_active : !industry.is_active)
        return matchesSearch && matchesStatus
      }),
    [data.industries, industryStatus, normalizedIndustrySearch]
  )

  const isSelectedBeyondTop = useMemo(() => {
    if (selectedIndustry === 'ALL') return false
    const idx = filteredIndustries.findIndex((ind) => ind.code === selectedIndustry)
    return idx >= INITIAL_VISIBLE_INDUSTRIES_COUNT
  }, [filteredIndustries, selectedIndustry])

  const shouldShowAllIndustries = Boolean(
    showAllIndustries ||
    industrySearch.trim() ||
    industryStatus !== 'ALL' ||
    isSelectedBeyondTop ||
    filteredIndustries.length <= INITIAL_VISIBLE_INDUSTRIES_COUNT
  )

  const displayedIndustries = shouldShowAllIndustries
    ? filteredIndustries
    : filteredIndustries.slice(0, INITIAL_VISIBLE_INDUSTRIES_COUNT)

  const filteredPositions = useMemo(
    () =>
      data.positions.filter((position) => {
        const matchesIndustry =
          selectedIndustry === 'ALL' || position.industry_codes.includes(selectedIndustry)
        const matchesSearch =
          !normalizedSearch ||
          `${position.display_name} ${position.code}`
            .toLocaleLowerCase('vi')
            .includes(normalizedSearch)
        const matchesStatus =
          positionStatus === 'ALL' ||
          (positionStatus === 'ACTIVE' ? position.is_active : !position.is_active)
        return matchesIndustry && matchesSearch && matchesStatus
      }),
    [data.positions, normalizedSearch, positionStatus, selectedIndustry]
  )

  const activeIndustries = data.industries.filter((item) => item.is_active).length
  const activePositions = data.positions.filter((item) => item.is_active).length
  const positionsWithTemplates = data.positions.filter((item) => item.template_usage_count > 0).length
  const industryNames = useMemo(
    () => new Map(data.industries.map((industry) => [industry.code, industry.display_name])),
    [data.industries]
  )
  const totalPositionPages = Math.max(1, Math.ceil(filteredPositions.length / POSITION_PAGE_SIZE))
  const currentPositionPage = Math.min(positionPage, totalPositionPages)
  const paginatedPositions = filteredPositions.slice(
    (currentPositionPage - 1) * POSITION_PAGE_SIZE,
    currentPositionPage * POSITION_PAGE_SIZE
  )
  const industryFilterCount = industryStatus === 'ALL' ? 0 : 1
  const hasIndustryFilters = Boolean(industrySearch || industryFilterCount > 0)
  const isIndustrySearchOpen = industrySearchExpanded || Boolean(industrySearch)
  const positionFilterCount = [positionStatus !== 'ALL', selectedIndustry !== 'ALL'].filter(Boolean).length
  const hasPositionFilters = Boolean(search || positionFilterCount > 0)

  useLayoutEffect(() => {
    const searchBar = industrySearchBarRef.current
    const filterControls = industryFilterControlsRef.current
    if (!searchBar || !filterControls) return

    const nextSearchBarHeight = searchBar.getBoundingClientRect().height
    const nextFilterRect = filterControls.getBoundingClientRect()
    const previousSearchBarHeight = previousIndustrySearchBarHeight.current
    const previousFilterRect = previousIndustryFilterRect.current

    previousIndustrySearchBarHeight.current = nextSearchBarHeight
    previousIndustryFilterRect.current = nextFilterRect

    if (
      previousSearchBarHeight === null ||
      previousFilterRect === null ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return
    }

    const animations: Animation[] = []
    const deltaX = previousFilterRect.left - nextFilterRect.left
    const deltaY = previousFilterRect.top - nextFilterRect.top

    if (Math.abs(deltaX) > 0.5 || Math.abs(deltaY) > 0.5) {
      animations.push(
        filterControls.animate(
          [
            { transform: `translate3d(${deltaX}px, ${deltaY}px, 0)` },
            { transform: 'translate3d(0, 0, 0)' },
          ],
          { duration: 260, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' }
        )
      )
    }

    if (Math.abs(previousSearchBarHeight - nextSearchBarHeight) > 0.5) {
      animations.push(
        searchBar.animate(
          [
            { height: `${previousSearchBarHeight}px`, overflow: 'hidden' },
            { height: `${nextSearchBarHeight}px`, overflow: 'hidden' },
          ],
          { duration: 260, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' }
        )
      )
    }

    return () => animations.forEach((animation) => animation.cancel())
  }, [hasIndustryFilters, isIndustrySearchOpen])

  const submitDialog = async (payload: {
    code?: string
    display_name: string
    sort_order: number
    is_active?: boolean
    industry_codes?: string[]
    allowed_levels?: JobLevel[]
    default_level?: JobLevel | null
  }) => {
    if (!dialog) return
    setBusy(true)
    setActionError('')
    try {
      if (dialog.type === 'industry') {
        if (dialog.item) await adminJobTaxonomyService.updateIndustry(dialog.item.id, payload)
        else
          await adminJobTaxonomyService.createIndustry({
            code: payload.code!,
            display_name: payload.display_name,
            sort_order: payload.sort_order,
          })
      } else if (dialog.item) {
        await adminJobTaxonomyService.updatePosition(dialog.item.id, payload)
      } else {
        await adminJobTaxonomyService.createPosition({
          code: payload.code!,
          display_name: payload.display_name,
          sort_order: payload.sort_order,
          industry_codes: payload.industry_codes ?? [],
          allowed_levels: payload.allowed_levels,
          default_level: payload.default_level,
        })
      }
      setDialog(null)
      await load()
    } catch (error) {
      setActionError(errorMessage(error))
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="mx-auto w-full max-w-[1500px] px-4 py-7 sm:px-6 lg:px-8">
      {/* Header */}
      <header className="border-b border-slate-200 pb-6">
        <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
          Danh mục nghề nghiệp
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Quản lý ngành nghề và các vị trí công việc dùng cho tuyển dụng, tìm kiếm việc làm và mẫu CV.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-2.5 text-xs" aria-label="Tổng quan danh mục">
          <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200/90 bg-white px-3 py-1.5 shadow-2xs transition-[border-color,box-shadow,transform] duration-150 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-sm">
            <span className="flex h-5 w-5 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
              <FolderTree size={12} />
            </span>
            <span className="text-slate-600">
              <strong className="text-xs font-bold tabular-nums text-slate-900">
                {activeIndustries.toLocaleString('vi-VN')}
              </strong>{' '}
              ngành đang dùng
            </span>
          </div>
          <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200/90 bg-white px-3 py-1.5 shadow-2xs transition-[border-color,box-shadow,transform] duration-150 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-sm">
            <span className="flex h-5 w-5 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
              <BriefcaseBusiness size={12} />
            </span>
            <span className="text-slate-600">
              <strong className="text-xs font-bold tabular-nums text-slate-900">
                {activePositions.toLocaleString('vi-VN')}
              </strong>{' '}
              vị trí đang dùng
            </span>
          </div>
          <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200/90 bg-white px-3 py-1.5 text-slate-600 shadow-2xs transition-[border-color,box-shadow,transform] duration-150 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-sm">
            <span className="flex h-5 w-5 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
              <FileText size={12} />
            </span>
            <span>
              <strong className="text-xs font-bold tabular-nums text-slate-900">
                {positionsWithTemplates.toLocaleString('vi-VN')}
              </strong>{' '}
              vị trí đã có mẫu CV
            </span>
          </div>
        </div>
      </header>

      {/* Alert Notices */}
      {data.job_stats && (data.job_stats.unmapped_jobs > 0 || data.job_stats.inactive_reference_jobs > 0) && (
        <section className="taxonomy-content-enter mt-5 grid gap-3 lg:grid-cols-2" aria-label="Dữ liệu cần xử lý">
          {data.job_stats.unmapped_jobs > 0 && (
            <div className="flex items-start gap-3 rounded-2xl border border-amber-200/80 bg-amber-50/70 p-3.5 text-xs text-amber-900 shadow-2xs">
              <AlertCircle size={16} className="mt-0.5 shrink-0 text-amber-600" />
              <p>
                <strong className="font-semibold text-amber-950">
                  {data.job_stats.unmapped_jobs.toLocaleString('vi-VN')} tin tuyển dụng cũ
                </strong>{' '}
                chưa được gán ngành nghề và vị trí chuyên môn.
              </p>
            </div>
          )}
          {data.job_stats.inactive_reference_jobs > 0 && (
            <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 p-3.5 text-xs text-slate-700 shadow-2xs">
              <AlertCircle size={16} className="mt-0.5 shrink-0 text-slate-500" />
              <p>
                <strong className="font-semibold text-slate-950">
                  {data.job_stats.inactive_reference_jobs.toLocaleString('vi-VN')} tin tuyển dụng
                </strong>{' '}
                đang liên kết với danh mục đã tạm ẩn.
              </p>
            </div>
          )}
        </section>
      )}

      {loadError && (
        <section
          role="alert"
          className="taxonomy-content-enter mt-5 flex items-center justify-between gap-4 rounded-xl bg-rose-50 p-4 text-rose-700"
        >
          <span className="flex items-center gap-2 text-sm font-semibold">
            <AlertCircle size={18} />
            {loadError}
          </span>
          <button
            type="button"
            onClick={() => void load()}
            className="btn-press rounded-lg bg-white px-3 py-2 text-sm font-semibold shadow-sm transition-shadow duration-150 hover:shadow-md"
          >
            Thử lại
          </button>
        </section>
      )}

      {/* Main Split-Pane Layout with Separate Cards */}
      <section className="mt-6 grid grid-cols-1 items-start gap-6 lg:grid-cols-[21rem_minmax(0,1fr)]">
        {/* Left Sidebar: Ngành nghề (Independent Card, Sticky, Auto Height) */}
        <aside className="h-fit overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs lg:sticky lg:top-6">
          <div className="flex items-center justify-between border-b border-slate-200/90 bg-slate-50/60 px-4 py-4">
            <div>
              <h2 className="text-sm font-bold text-slate-950">Ngành nghề</h2>
              <p className="mt-0.5 text-xs text-slate-500">Chọn ngành để lọc vị trí</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setActionError('')
                setDialog({ type: 'industry' })
              }}
              aria-label="Thêm ngành nghề"
              className="btn-press group inline-flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-2xs transition-[background-color,border-color,box-shadow,transform] duration-150 hover:border-slate-300 hover:bg-slate-100 hover:shadow-sm"
              title="Thêm ngành nghề mới"
            >
              <Plus size={15} className="transition-transform duration-150 group-hover:rotate-90" />
            </button>
          </div>

          {/* Search & Filter Bar */}
          <div
            ref={industrySearchBarRef}
            className="flex flex-wrap items-center gap-2 border-b border-slate-200/90 bg-slate-50/30 p-3"
          >
            <label
              className={`relative block transition-[width,flex-basis] duration-200 ease-out ${
                isIndustrySearchOpen ? 'w-full basis-full' : 'w-[9.75rem] flex-none'
              }`}
            >
              <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={industrySearch}
                onFocus={openIndustrySearch}
                onBlur={closeIndustrySearch}
                onChange={(event) => setIndustrySearch(event.target.value)}
                placeholder={isIndustrySearchOpen ? 'Tìm ngành hoặc mã...' : 'Tìm ngành...'}
                aria-label="Tìm kiếm ngành nghề"
                className="h-9 w-full rounded-xl border border-slate-200/90 bg-white py-1.5 pl-8.5 pr-8 text-xs text-slate-900 shadow-2xs outline-none transition-all duration-150 placeholder:text-slate-400 hover:border-slate-300 focus:border-[#1C1C1C] focus:ring-2 focus:ring-black/10"
              />
              {industrySearch && (
                <button
                  type="button"
                  onClick={() => {
                    setIndustrySearch('')
                    setIndustrySearchExpanded(false)
                  }}
                  aria-label="Xóa tìm kiếm ngành nghề"
                  className="taxonomy-content-enter absolute right-2 top-1/2 inline-flex -translate-y-1/2 rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                >
                  <X size={12} />
                </button>
              )}
            </label>
            <div ref={industryFilterControlsRef} className="flex min-w-0 flex-wrap items-center gap-2 will-change-transform">
              <AdminFilterPill
                label="Trạng thái"
                value={industryStatus}
                options={STATUS_FILTER_OPTIONS}
                onChange={(value) => {
                  setIndustryStatus(value)
                  setSelectedIndustry('ALL')
                  setPositionPage(1)
                }}
                ariaLabel="Lọc trạng thái ngành nghề"
              />
              {hasIndustryFilters && (
                <AdminFilterResetButton
                  onClick={() => {
                    setIndustrySearch('')
                    setIndustrySearchExpanded(false)
                    setIndustryStatus('ALL')
                    setSelectedIndustry('ALL')
                    setPositionPage(1)
                  }}
                  count={industryFilterCount}
                />
              )}
            </div>
          </div>

          {/* Industry List */}
          <div className="max-h-[580px] overflow-y-auto p-2 scrollbar-thin">
            {/* All Industries Option */}
            <button
              type="button"
              onClick={() => {
                setSelectedIndustry('ALL')
                setPositionPage(1)
              }}
              className={`btn-press mb-1.5 flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-xs transition-[background-color,border-color,color,box-shadow,transform] duration-150 ${
                selectedIndustry === 'ALL'
                  ? 'border border-[#1C1C1C] bg-[#1C1C1C] font-bold text-white shadow-sm'
                  : 'border border-transparent text-slate-700 hover:border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span className="flex items-center gap-2">
                {selectedIndustry === 'ALL' && (
                  <span className="h-1.5 w-1.5 rounded-full bg-white/70" aria-hidden="true" />
                )}
                <span>Tất cả ngành</span>
              </span>
              <span
                className={`rounded-full px-2 py-0.5 text-[11px] font-bold tabular-nums ${
                  selectedIndustry === 'ALL'
                    ? 'bg-white/15 text-white'
                    : 'bg-slate-200/70 text-slate-600'
                }`}
              >
                {data.positions.length}
              </span>
            </button>

            {/* Displayed Industry Items */}
            {displayedIndustries.map((industry) => {
              const isSelected = selectedIndustry === industry.code
              return (
                <div
                  key={industry.id}
                  className={`group mb-1.5 flex items-center rounded-xl transition-[background-color,border-color,box-shadow,transform] duration-150 ${
                    isSelected
                      ? 'border border-[#1C1C1C] bg-[#1C1C1C] shadow-sm'
                      : 'border border-transparent hover:border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedIndustry(industry.code)
                      setPositionPage(1)
                    }}
                    className="btn-press min-w-0 flex-1 px-3 py-2.5 text-left"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex min-w-0 items-center gap-1.5">
                        {isSelected && (
                          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-white/70" aria-hidden="true" />
                        )}
                        <span
                          className={`truncate text-xs ${
                            isSelected ? 'font-bold text-white' : 'font-semibold text-slate-800'
                          }`}
                        >
                          {industry.display_name}
                        </span>
                      </span>
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold tabular-nums ${
                          isSelected ? 'bg-white/15 text-white' : 'bg-slate-200/60 text-slate-600'
                        }`}
                      >
                        {industry.position_count}
                      </span>
                    </div>
                    <div className={`mt-1 flex items-center gap-2 text-[11px] ${isSelected ? 'text-white/60' : 'text-slate-400'}`}>
                      <span className="truncate font-mono">{industry.code}</span>
                      {!industry.is_active && (
                        <span className="shrink-0 rounded-full bg-slate-200 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500">
                          Tạm ẩn
                        </span>
                      )}
                    </div>
                  </button>
                  <button
                    type="button"
                    aria-label={`Sửa ${industry.display_name}`}
                    onClick={() => {
                      setActionError('')
                      setDialog({ type: 'industry', item: industry })
                    }}
                    className={`mr-2 rounded-lg p-1.5 opacity-0 shadow-2xs transition focus:opacity-100 group-hover:opacity-100 ${
                      isSelected
                        ? 'text-white/60 hover:bg-white/10 hover:text-white'
                        : 'text-slate-400 hover:bg-slate-100 hover:text-slate-800'
                    }`}
                    title={`Chỉnh sửa ${industry.display_name}`}
                  >
                    <Pencil size={13} />
                  </button>
                </div>
              )
            })}

            {/* Toggle Expand / Collapse Button */}
            {!shouldShowAllIndustries && filteredIndustries.length > INITIAL_VISIBLE_INDUSTRIES_COUNT && (
              <button
                type="button"
                onClick={() => setShowAllIndustries(true)}
                className="btn-press taxonomy-content-enter mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-slate-300 bg-slate-50/70 py-2.5 text-xs font-semibold text-slate-600 transition-[background-color,border-color,color,transform] duration-150 hover:border-slate-400 hover:bg-slate-100 hover:text-slate-950"
              >
                <span>Xem thêm ({filteredIndustries.length - INITIAL_VISIBLE_INDUSTRIES_COUNT} ngành khác)</span>
                <ChevronDown size={14} />
              </button>
            )}

            {showAllIndustries &&
              !industrySearch.trim() &&
              industryStatus === 'ALL' &&
              !isSelectedBeyondTop &&
              filteredIndustries.length > INITIAL_VISIBLE_INDUSTRIES_COUNT && (
                <button
                  type="button"
                  onClick={() => setShowAllIndustries(false)}
                  className="btn-press taxonomy-content-enter mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50/70 py-2 text-xs font-semibold text-slate-600 shadow-2xs transition-[background-color,color,transform] duration-150 hover:bg-slate-100 hover:text-slate-900"
                >
                  <span>Thu gọn danh sách</span>
                  <ChevronUp size={14} />
                </button>
              )}

            {filteredIndustries.length === 0 && (
              <div className="taxonomy-content-enter px-4 py-8 text-center">
                <Search size={20} className="mx-auto text-slate-300" />
                <p className="mt-3 text-sm font-semibold text-slate-600">Không có ngành nghề phù hợp</p>
                <button
                  type="button"
                  onClick={() => {
                    setIndustrySearch('')
                    setIndustryStatus('ALL')
                  }}
                  className="mt-2 text-xs font-bold text-[#1C1C1C] hover:underline"
                >
                  Xóa bộ lọc
                </button>
              </div>
            )}
          </div>
        </aside>

        {/* Right Pane: Vị trí công việc (Independent Card) */}
        <div className="min-w-0 overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs">
          <div className="border-b border-slate-200/90 px-4 py-4 sm:px-5">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-slate-950 sm:text-base">Vị trí công việc</h2>
                  {selectedIndustry !== 'ALL' && (
                    <span className="taxonomy-content-enter rounded-full border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
                      {industryNames.get(selectedIndustry) ?? selectedIndustry}
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-slate-500">
                  {filteredPositions.length.toLocaleString('vi-VN')} kết quả
                  {selectedIndustry !== 'ALL' ? ' trong ngành đã chọn' : ''}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <label className="relative min-w-[200px] flex-1 sm:w-64 sm:flex-none">
                  <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    value={search}
                    onChange={(event) => {
                      setSearch(event.target.value)
                      setPositionPage(1)
                    }}
                    placeholder="Tìm tên hoặc mã vị trí..."
                    className="h-9 w-full rounded-xl border border-slate-200/90 bg-white py-1.5 pl-8.5 pr-8 text-xs text-slate-900 shadow-2xs outline-none transition-all duration-150 placeholder:text-slate-400 hover:border-slate-300 focus:border-[#1C1C1C] focus:ring-2 focus:ring-black/10"
                  />
                  {search && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearch('')
                        setPositionPage(1)
                      }}
                      aria-label="Xóa tìm kiếm vị trí"
                      className="taxonomy-content-enter absolute right-2 top-1/2 inline-flex -translate-y-1/2 rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                    >
                      <X size={12} />
                    </button>
                  )}
                </label>
                <AdminFilterPill
                  label="Trạng thái"
                  value={positionStatus}
                  options={STATUS_FILTER_OPTIONS}
                  onChange={(value) => {
                    setPositionStatus(value)
                    setPositionPage(1)
                  }}
                  ariaLabel="Lọc trạng thái vị trí"
                />
                {hasPositionFilters && (
                  <AdminFilterResetButton
                    onClick={() => {
                      setSearch('')
                      setPositionStatus('ALL')
                      setSelectedIndustry('ALL')
                      setPositionPage(1)
                    }}
                    count={positionFilterCount}
                  />
                )}
                <button
                  type="button"
                  onClick={() => {
                    setActionError('')
                    setDialog({ type: 'position' })
                  }}
                  disabled={data.industries.length === 0}
                  className="btn-press group inline-flex h-9 items-center justify-center gap-1.5 rounded-xl bg-[#1C1C1C] px-3.5 text-xs font-semibold text-white shadow-xs transition-[background-color,box-shadow,transform] duration-150 hover:bg-black hover:shadow-md disabled:opacity-45"
                >
                  <Plus size={15} className="transition-transform duration-150 group-hover:rotate-90" />
                  <span>Thêm vị trí</span>
                </button>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="space-y-2 p-5" aria-busy="true">
              {[1, 2, 3, 4, 5].map((item) => (
                <div key={item} className="h-16 animate-pulse rounded-xl bg-slate-100" />
              ))}
            </div>
          ) : filteredPositions.length === 0 ? (
            <div className="taxonomy-content-enter flex min-h-80 flex-col items-center justify-center px-6 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <Search size={25} />
              </span>
              <h3 className="mt-4 font-bold text-slate-900">Không tìm thấy vị trí phù hợp</h3>
              <p className="mt-1 text-sm text-slate-500">Hãy đổi từ khóa, trạng thái hoặc ngành nghề đang chọn.</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[880px] border-collapse text-left">
                  <thead className="bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100">
                    <tr>
                      <th className="px-5 py-3">Vị trí</th>
                      <th className="w-56 px-4 py-3">Ngành liên kết</th>
                      <th className="w-44 px-4 py-3 text-center">Cấp bậc</th>
                      <th className="w-28 px-4 py-3 text-center">Mẫu CV</th>
                      <th className="w-32 px-4 py-3 text-center">Trạng thái</th>
                      <th className="w-24 px-4 py-3">
                        <span className="sr-only">Thao tác</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody
                    key={`${selectedIndustry}-${positionStatus}-${currentPositionPage}`}
                    className="taxonomy-content-enter divide-y divide-slate-100 text-xs"
                  >
                    {paginatedPositions.map((position) => (
                      <tr key={position.id} className="group transition-[background-color,box-shadow] duration-150 hover:bg-slate-50/70 hover:shadow-[inset_3px_0_0_0_#1C1C1C]">
                        <td className="px-5 py-3.5">
                          <div className="flex items-start gap-3">
                            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 shadow-2xs transition-transform duration-150 group-hover:scale-105">
                              <BriefcaseBusiness size={15} />
                            </span>
                            <div className="min-w-0">
                              <p className="font-semibold text-slate-950 text-xs sm:text-sm">
                                {position.display_name}
                              </p>
                              <p className="mt-0.5 font-mono text-[11px] text-slate-400">{position.code}</p>
                              {Boolean(position.incompatible_jobs_count) && (
                                <span className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700">
                                  <AlertCircle size={12} /> {position.incompatible_jobs_count} tin cũ lệch cấp bậc
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="max-w-64 px-4 py-3.5 align-middle">
                          <div className="flex flex-wrap items-center gap-1.5">
                            {position.industry_codes.length > 0 ? (
                              position.industry_codes.map((code) => (
                                <span
                                  key={code}
                                  className="inline-flex h-8 max-w-[190px] items-center truncate rounded-xl border border-slate-200 bg-slate-100 px-2.5 text-[11px] font-medium text-slate-700"
                                  title={industryNames.get(code) ?? code}
                                >
                                  {industryNames.get(code) ?? code}
                                </span>
                              ))
                            ) : (
                              <span className="text-slate-400 italic">Chưa liên kết</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-center align-middle text-slate-600">
                          {position.allowed_levels && position.allowed_levels.length > 0 ? (
                            <span className="inline-flex h-8 items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-slate-200 bg-slate-100 px-2.5 text-[11px] font-semibold text-slate-700">
                              <span>
                                {position.allowed_levels.length === ALL_JOB_LEVELS.length
                                  ? 'Tất cả 8 cấp bậc'
                                  : `${position.allowed_levels.length} cấp bậc`}
                              </span>
                              {position.default_level && (
                                <>
                                  <span className="h-3.5 w-px bg-slate-300" aria-hidden="true" />
                                  <span className="text-[10px] font-bold text-slate-500">
                                    {position.default_level}
                                  </span>
                                </>
                              )}
                            </span>
                          ) : (
                            <span
                              className="inline-flex min-h-8 items-center justify-center rounded-xl border border-amber-200 bg-amber-50 px-2.5 text-[10px] font-semibold leading-tight text-amber-700"
                              title="Dữ liệu cũ chưa có chính sách cấp bậc rõ ràng"
                              aria-label="Chưa cấu hình · đang cho phép tất cả"
                            >
                              Chưa cấu hình
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-center align-middle font-semibold tabular-nums">
                          <span
                            className={`inline-flex h-8 min-w-[4.75rem] items-center justify-center gap-1.5 rounded-xl border px-2.5 text-[11px] font-bold ${
                              position.template_usage_count > 0
                                ? 'border-slate-200 bg-slate-100 text-slate-700'
                                : 'border-slate-200 bg-white text-slate-400'
                            }`}
                          >
                            <FileText size={13} />
                            {position.template_usage_count} mẫu
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-center align-middle">
                          <StatusBadge active={position.is_active} />
                        </td>
                        <td className="px-4 py-3.5 text-center align-middle">
                          <button
                            type="button"
                            onClick={() => {
                              setActionError('')
                              setDialog({ type: 'position', item: position })
                            }}
                            className="btn-press inline-flex h-8 min-w-[4.5rem] items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 shadow-2xs transition-[background-color,border-color,box-shadow,transform] duration-150 hover:border-slate-300 hover:bg-slate-50 hover:shadow-sm"
                          >
                            <Pencil size={12} />
                            <span>Sửa</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <footer className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
                <p>
                  Hiển thị{' '}
                  <strong className="text-slate-900">
                    {(currentPositionPage - 1) * POSITION_PAGE_SIZE + 1}–
                    {Math.min(currentPositionPage * POSITION_PAGE_SIZE, filteredPositions.length)}
                  </strong>{' '}
                  trong {filteredPositions.length.toLocaleString('vi-VN')} vị trí
                </p>
                {totalPositionPages > 1 && (
                  <nav className="flex items-center gap-2" aria-label="Phân trang vị trí">
                    <button
                      type="button"
                      onClick={() => setPositionPage((page) => Math.max(1, page - 1))}
                      disabled={currentPositionPage === 1}
                      className="btn-press rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-semibold text-slate-700 shadow-2xs transition-[background-color,border-color,transform] duration-150 hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Trước
                    </button>
                    <span className="px-2 tabular-nums">
                      {currentPositionPage}/{totalPositionPages}
                    </span>
                    <button
                      type="button"
                      onClick={() => setPositionPage((page) => Math.min(totalPositionPages, page + 1))}
                      disabled={currentPositionPage === totalPositionPages}
                      className="btn-press rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-semibold text-slate-700 shadow-2xs transition-[background-color,border-color,transform] duration-150 hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Sau
                    </button>
                  </nav>
                )}
              </footer>
            </>
          )}
        </div>
      </section>

      {/* Edit/Create Dialog */}
      {dialog && (
        <TaxonomyDialog
          key={`${dialog.type}-${dialog.item?.id ?? 'new'}`}
          state={dialog}
          industries={data.industries}
          busy={busy}
          error={actionError}
          onClose={() => {
            if (!busy) setDialog(null)
          }}
          onSubmit={submitDialog}
        />
      )}
    </main>
  )
}
