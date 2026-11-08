import { AlertCircle, ArrowLeft, ArrowRight, CheckCircle2, CreditCard, Plus, RefreshCw, Search, UsersRound, X } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { AdminFilterPill, AdminFilterResetButton } from '../../components/admin/AdminFilterControls'
import AdminRecruiterSubscriptionList from '../../components/subscription/AdminRecruiterSubscriptionList'
import RecruiterSubscriptionDialog from '../../components/subscription/RecruiterSubscriptionDialog'
import RevokeSubscriptionDialog from '../../components/subscription/RevokeSubscriptionDialog'
import SubscriptionPlanDialog from '../../components/subscription/SubscriptionPlanDialog'
import SubscriptionPlanGrid from '../../components/subscription/SubscriptionPlanGrid'
import { usePaginatedQuery } from '../../hooks/usePaginatedQuery'
import { subscriptionService } from '../../services/subscriptionService'
import type { AdminRecruiterSubscriptionItem, GrantSubscriptionRequest, PlanCreateRequest, PlanUpdateRequest, SubscriptionPlan } from '../../types/subscription'
import { subscriptionErrorMessage } from '../../utils/apiError'
import { notifyDataRefresh } from '../../utils/dataRefresh'

type View = 'plans' | 'recruiters'
type RecruiterAccountStatus = 'all' | 'active' | 'inactive'
type PlanDialogState = { mode: 'create' } | { mode: 'edit'; plan: SubscriptionPlan }

function PageFeedback({ message, onRetry }: { message: string; onRetry: () => void }) {
  return <section role="alert" className="mt-6 rounded-2xl bg-white px-6 py-12 text-center ring-1 ring-slate-200"><AlertCircle className="mx-auto text-red-600" size={32} /><h2 className="mt-4 text-lg font-semibold text-slate-950">Không thể tải dữ liệu</h2><p className="mx-auto mt-2 max-w-lg text-sm text-slate-500">{message}</p><button type="button" onClick={onRetry} className="btn-press mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white"><RefreshCw size={15} />Thử lại</button></section>
}

export default function AdminSubscriptionPlansPage() {
  const [view, setView] = useState<View>('plans')
  const [recruiterPage, setRecruiterPage] = useState(1)
  const [recruiterSearchInput, setRecruiterSearchInput] = useState('')
  const [recruiterSearch, setRecruiterSearch] = useState('')
  const [recruiterAccountStatus, setRecruiterAccountStatus] = useState<RecruiterAccountStatus>('all')
  const [recruiterPlanCode, setRecruiterPlanCode] = useState('')
  const [planDialog, setPlanDialog] = useState<PlanDialogState | null>(null)
  const [grantRecruiter, setGrantRecruiter] = useState<AdminRecruiterSubscriptionItem | null>(null)
  const [revokeRecruiter, setRevokeRecruiter] = useState<AdminRecruiterSubscriptionItem | null>(null)
  const [pending, setPending] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const fetchPlans = useCallback((signal: AbortSignal) => subscriptionService.getSubscriptionPlans({ page: 1, page_size: 100 }, signal), [])
  const plansQuery = usePaginatedQuery({ queryKey: 'subscription-plans', fetcher: fetchPlans })
  const fetchRecruiters = useCallback((signal: AbortSignal) => subscriptionService.getAdminRecruiters({
    page: recruiterPage,
    page_size: 12,
    search: recruiterSearch || undefined,
    is_active: recruiterAccountStatus === 'all' ? undefined : recruiterAccountStatus === 'active',
    plan_code: recruiterPlanCode || undefined,
  }, signal), [recruiterAccountStatus, recruiterPage, recruiterPlanCode, recruiterSearch])
  const recruitersQuery = usePaginatedQuery({
    queryKey: `subscription-recruiters:${recruiterPage}:${recruiterSearch}:${recruiterAccountStatus}:${recruiterPlanCode}`,
    fetcher: fetchRecruiters,
  })
  const plans = useMemo(() => plansQuery.data?.items ?? [], [plansQuery.data])
  const currentQuery = view === 'plans' ? plansQuery : recruitersQuery
  const hasRecruiterFilters = recruiterSearchInput.trim().length > 0 || recruiterAccountStatus !== 'all' || recruiterPlanCode !== ''

  const recruiterAccountStatusOptions = useMemo<Array<{ value: RecruiterAccountStatus; label: string }>>(
    () => [
      { value: 'all', label: 'Tất cả trạng thái' },
      { value: 'active', label: 'Đang hoạt động' },
      { value: 'inactive', label: 'Đã vô hiệu hóa' },
    ],
    []
  )
  const recruiterPlanOptions = useMemo(
    () => [
      { value: '', label: 'Tất cả gói' },
      ...plans.map((plan) => ({ value: plan.code, label: `${plan.name} (${plan.code})` })),
    ],
    [plans]
  )
  const activeRecruiterFilterCount = [
    recruiterAccountStatus !== 'all',
    recruiterPlanCode !== '',
  ].filter(Boolean).length

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setRecruiterSearch(recruiterSearchInput.trim())
      setRecruiterPage(1)
    }, 300)
    return () => window.clearTimeout(timer)
  }, [recruiterSearchInput])

  const resetRecruiterFilters = () => {
    setRecruiterSearchInput('')
    setRecruiterSearch('')
    setRecruiterAccountStatus('all')
    setRecruiterPlanCode('')
    setRecruiterPage(1)
  }

  const closeActions = () => {
    if (pending) return
    setPlanDialog(null); setGrantRecruiter(null); setRevokeRecruiter(null); setActionError(null)
  }
  const runAction = async (action: () => Promise<void>) => {
    if (pending) return
    setPending(true); setActionError(null); setNotice(null)
    try { await action() } finally { setPending(false) }
  }
  const createPlan = async (payload: PlanCreateRequest | PlanUpdateRequest) => runAction(async () => {
    try { await subscriptionService.createSubscriptionPlan(payload as PlanCreateRequest); plansQuery.refetch(); setPlanDialog(null); setNotice('Đã tạo gói dịch vụ.') }
    catch (error) { setActionError(subscriptionErrorMessage(error, 'plan')) }
  })
  const updatePlan = async (plan: SubscriptionPlan, payload: PlanCreateRequest | PlanUpdateRequest) => runAction(async () => {
    try { await subscriptionService.updateSubscriptionPlan(plan.id, payload as PlanUpdateRequest); plansQuery.refetch(); setPlanDialog(null); setNotice('Đã cập nhật gói dịch vụ.') }
    catch (error) { setActionError(subscriptionErrorMessage(error, 'plan')) }
  })
  const grant = async (recruiter: AdminRecruiterSubscriptionItem, payload: GrantSubscriptionRequest) => runAction(async () => {
    try {
      const response = await subscriptionService.grantOrChangeRecruiterSubscription(recruiter.id, payload)
      if (recruitersQuery.data) recruitersQuery.replaceData({ ...recruitersQuery.data, items: recruitersQuery.data.items.map((item) => item.id === recruiter.id ? { ...item, ...response } : item) })
      notifyDataRefresh()
      setGrantRecruiter(null); setNotice(`Đã cập nhật gói cho ${recruiter.full_name}.`)
    } catch (error) { setActionError(subscriptionErrorMessage(error, 'grant')) }
  })
  const revoke = async (recruiter: AdminRecruiterSubscriptionItem) => runAction(async () => {
    try {
      const response = await subscriptionService.revokeRecruiterSubscription(recruiter.id)
      if (recruitersQuery.data) recruitersQuery.replaceData({ ...recruitersQuery.data, items: recruitersQuery.data.items.map((item) => item.id === recruiter.id ? { ...item, ...response } : item) })
      notifyDataRefresh()
      setRevokeRecruiter(null); setNotice(`Đã thu hồi gói của ${recruiter.full_name}.`)
    } catch (error) { setActionError(subscriptionErrorMessage(error, 'revoke')) }
  })

  const openGrant = (recruiter: AdminRecruiterSubscriptionItem) => { setActionError(null); setGrantRecruiter(recruiter) }
  const openRevoke = (recruiter: AdminRecruiterSubscriptionItem) => { setActionError(null); setRevokeRecruiter(recruiter) }

  return <div className="min-h-screen bg-slate-50"><main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
    <header className="flex flex-col justify-between gap-5 border-b border-slate-200 pb-6 lg:flex-row lg:items-end"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Doanh thu & quyền truy cập</p><h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Gói dịch vụ nhà tuyển dụng</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Quản lý danh mục gói và quyền sử dụng của từng nhà tuyển dụng. Tài khoản không có đăng ký trả phí luôn dùng FREE mặc định.</p></div>{view === 'plans' && <button type="button" onClick={() => { setActionError(null); setPlanDialog({ mode: 'create' }) }} className="btn-press inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-black"><Plus size={17} />Tạo gói mới</button>}</header>

    <div className="mt-6 flex flex-wrap items-center justify-between gap-4"><div className="inline-flex rounded-xl bg-slate-200/70 p-1" role="tablist" aria-label="Khu vực quản lý gói"><button type="button" role="tab" aria-selected={view === 'plans'} onClick={() => setView('plans')} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition ${view === 'plans' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-600 hover:text-slate-950'}`}><CreditCard size={16} />Danh mục gói</button><button type="button" role="tab" aria-selected={view === 'recruiters'} onClick={() => setView('recruiters')} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition ${view === 'recruiters' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-600 hover:text-slate-950'}`}><UsersRound size={16} />Nhà tuyển dụng</button></div>{currentQuery.data && <span className="text-sm text-slate-500"><strong className="tabular-nums text-slate-950">{currentQuery.data.total}</strong> kết quả</span>}</div>
    <div aria-live="polite">{notice && <p className="mt-5 flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800 ring-1 ring-emerald-200"><CheckCircle2 size={17} />{notice}</p>}</div>

    {view === 'plans' && <section role="tabpanel" className="mt-6">
      {plansQuery.isInitialLoading ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{[1, 2, 3].map((key) => <div key={key} className="h-72 animate-pulse rounded-2xl bg-slate-200" />)}</div>
        : plansQuery.error && !plansQuery.data ? <PageFeedback message={subscriptionErrorMessage(plansQuery.error, 'list')} onRetry={plansQuery.refetch} />
          : plans.length === 0 ? <div className="rounded-2xl bg-white py-16 text-center ring-1 ring-slate-200"><CreditCard className="mx-auto text-slate-400" size={32} /><h2 className="mt-4 text-lg font-semibold">Chưa có gói dịch vụ</h2><p className="mt-2 text-sm text-slate-500">Tạo gói đầu tiên để bắt đầu quản lý.</p></div>
            : <><SubscriptionPlanGrid plans={plans} onEdit={(plan) => { setActionError(null); setPlanDialog({ mode: 'edit', plan }) }} />{plansQuery.error && <p className="mt-4 text-sm text-red-600">{subscriptionErrorMessage(plansQuery.error, 'list')}</p>}</>}
    </section>}

    {view === 'recruiters' && <section role="tabpanel" className="mt-6">
      <div className="mb-5 flex flex-wrap items-center gap-2 border-t border-slate-200 pt-5">
        {/* Compact Search Input */}
        <div className="relative min-w-[200px] flex-1 sm:max-w-xs md:max-w-sm">
          <span className="sr-only">Tìm theo tên hoặc email</span>
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
          <input
            type="search"
            value={recruiterSearchInput}
            onChange={(event) => setRecruiterSearchInput(event.target.value)}
            placeholder="Tìm nhà tuyển dụng, email..."
            className="h-9 w-full rounded-xl border border-slate-200/90 bg-white py-1.5 pl-8.5 pr-8 text-xs sm:text-sm text-slate-900 shadow-2xs placeholder:text-slate-400 outline-none transition-all duration-150 hover:border-slate-300 focus:border-[#1C1C1C] focus:ring-2 focus:ring-black/10"
          />
          {recruiterSearchInput && (
            <button
              type="button"
              aria-label="Xóa từ khóa tìm kiếm"
              onClick={() => { setRecruiterSearchInput(''); setRecruiterSearch(''); setRecruiterPage(1) }}
              className="absolute right-2 top-1/2 inline-flex -translate-y-1/2 rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
            >
              <X size={13} aria-hidden="true" />
            </button>
          )}
        </div>

        {/* Account Status Pill */}
        <AdminFilterPill
          label="Trạng thái"
          value={recruiterAccountStatus}
          options={recruiterAccountStatusOptions}
          onChange={(val) => { setRecruiterAccountStatus(val as RecruiterAccountStatus); setRecruiterPage(1) }}
          ariaLabel="Lọc theo trạng thái tài khoản"
          allValue="all"
        />

        {/* Plan Pill */}
        <AdminFilterPill
          label="Gói dịch vụ"
          value={recruiterPlanCode}
          options={recruiterPlanOptions}
          onChange={(val) => { setRecruiterPlanCode(val); setRecruiterPage(1) }}
          ariaLabel="Lọc theo gói hiện tại"
          allValue=""
        />

        {/* Quick Reset Button */}
        {hasRecruiterFilters && (
          <AdminFilterResetButton onClick={resetRecruiterFilters} count={activeRecruiterFilterCount} />
        )}
      </div>
      <div aria-busy={recruitersQuery.isFetching} className={`transition-opacity ${recruitersQuery.isFetching && recruitersQuery.data ? 'opacity-60' : 'opacity-100'}`}>
      {recruitersQuery.isInitialLoading ? <div className="space-y-3">{[1, 2, 3].map((key) => <div key={key} className="h-32 animate-pulse rounded-2xl bg-slate-200" />)}</div>
        : recruitersQuery.error && !recruitersQuery.data ? <PageFeedback message={subscriptionErrorMessage(recruitersQuery.error, 'list')} onRetry={recruitersQuery.refetch} />
          : recruitersQuery.data?.items.length === 0 ? <div className="rounded-2xl bg-white px-5 py-16 text-center ring-1 ring-slate-200"><UsersRound className="mx-auto text-slate-400" size={32} /><h2 className="mt-4 text-lg font-semibold">{hasRecruiterFilters ? 'Không tìm thấy nhà tuyển dụng phù hợp' : 'Chưa có nhà tuyển dụng'}</h2>{hasRecruiterFilters && <><p className="mt-2 text-sm text-slate-500">Thử từ khóa hoặc điều kiện lọc khác.</p><button type="button" onClick={resetRecruiterFilters} className="btn-press mt-5 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white">Xóa bộ lọc</button></>}</div>
            : <AdminRecruiterSubscriptionList recruiters={recruitersQuery.data?.items ?? []} onGrant={openGrant} onRevoke={openRevoke} />}
      </div>
      {recruitersQuery.error !== null && recruitersQuery.data && <p role="alert" className="mt-4 flex items-center justify-between gap-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200"><span>{subscriptionErrorMessage(recruitersQuery.error, 'list')}</span><button type="button" onClick={recruitersQuery.refetch} className="shrink-0 font-semibold underline">Thử lại</button></p>}
      {recruitersQuery.data && recruitersQuery.data.total_pages > 1 && <nav className="mt-7 flex items-center justify-between" aria-label="Phân trang nhà tuyển dụng"><button type="button" onClick={() => setRecruiterPage((page) => page - 1)} disabled={recruiterPage <= 1 || recruitersQuery.isFetching} className="btn-press inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold disabled:opacity-40"><ArrowLeft size={16} />Trước</button><span className="text-sm text-slate-500">Trang <strong className="text-slate-950">{recruitersQuery.data.page}</strong> / {recruitersQuery.data.total_pages}</span><button type="button" onClick={() => setRecruiterPage((page) => page + 1)} disabled={recruiterPage >= recruitersQuery.data.total_pages || recruitersQuery.isFetching} className="btn-press inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold disabled:opacity-40">Sau<ArrowRight size={16} /></button></nav>}
    </section>}
  </main>
  {planDialog?.mode === 'create' && <SubscriptionPlanDialog mode="create" pending={pending} requestError={actionError} onClose={closeActions} onSubmit={createPlan} />}
  {planDialog?.mode === 'edit' && <SubscriptionPlanDialog mode="edit" plan={planDialog.plan} pending={pending} requestError={actionError} onClose={closeActions} onSubmit={(payload) => updatePlan(planDialog.plan, payload)} />}
  {grantRecruiter && <RecruiterSubscriptionDialog recruiter={grantRecruiter} plans={plans} pending={pending} requestError={actionError} onClose={closeActions} onSubmit={(payload) => grant(grantRecruiter, payload)} />}
  {revokeRecruiter && <RevokeSubscriptionDialog recruiter={revokeRecruiter} pending={pending} requestError={actionError} onClose={closeActions} onConfirm={() => revoke(revokeRecruiter)} />}
  </div>
}
