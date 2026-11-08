import { AlertCircle, ArrowLeft, ArrowRight, Building2, CalendarDays, Loader2, MapPin, UsersRound } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import QueryFetchFeedback from '../../components/feedback/QueryFetchFeedback'
import { useDataRefreshVersion } from '../../hooks/useDataRefreshVersion'
import { usePaginatedQuery } from '../../hooks/usePaginatedQuery'
import { useToast } from '../../hooks/useToast'
import { companyService } from '../../services/companyService'
import type { FollowedCompanyListItem, FollowedCompanyListResponse } from '../../types/company'
import { safeImageUrl } from '../../utils/publicUrl'

const PAGE_SIZE = 8

function FollowedCompaniesSkeleton() {
  return <div className="mt-6 grid gap-4 lg:grid-cols-2" aria-busy="true" aria-label="Đang tải công ty đang theo dõi">{Array.from({ length: 4 }, (_, index) => <div key={index} className="h-64 animate-pulse rounded-2xl bg-slate-200" />)}</div>
}

function formatFollowedAt(value: string) {
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? 'Chưa rõ thời gian' : new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium' }).format(parsed)
}

function CompanyLogo({ item }: { item: FollowedCompanyListItem }) {
  const logoUrl = safeImageUrl(item.company.logo_url)
  const [failed, setFailed] = useState(false)
  const initial = item.company.name.trim().charAt(0).toUpperCase() || 'G'
  return <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
    {logoUrl && !failed ? <img src={logoUrl} alt={`Logo ${item.company.name}`} className="h-full w-full object-contain p-1.5" onError={() => setFailed(true)} /> : <span className="flex h-full w-full items-center justify-center bg-teal-50 text-xl font-black text-[#31999b]" aria-label={`Logo mặc định ${item.company.name}`}>{initial}</span>}
  </div>
}

function FollowedCompanyCard({ item, removing, disabled, onUnfollow }: { item: FollowedCompanyListItem; removing: boolean; disabled: boolean; onUnfollow: (companyId: string) => void }) {
  const { company } = item
  return <article className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-premium-hover">
    <div className="flex items-start gap-4">
      <Link to={`/companies/${company.id}`} aria-label={`Xem trang công ty ${company.name}`}><CompanyLogo item={item} /></Link>
      <div className="min-w-0 flex-1">
        <Link to={`/companies/${company.id}`} className="line-clamp-2 text-lg font-bold leading-6 text-slate-950 transition-colors hover:text-[#31999b]">{company.name}</Link>
        <p className="mt-1 truncate text-sm text-slate-600">{company.industry || 'Chưa cập nhật ngành nghề'}</p>
      </div>
    </div>
    <dl className="mt-5 grid gap-2.5 text-sm text-slate-600 sm:grid-cols-2">
      <div className="flex min-w-0 items-center gap-2"><UsersRound size={16} className="shrink-0 text-[#49BBBD]" /><dt className="sr-only">Người theo dõi</dt><dd><strong className="text-slate-800">{item.follower_count.toLocaleString('vi-VN')}</strong> người theo dõi</dd></div>
      <div className="flex min-w-0 items-center gap-2"><Building2 size={16} className="shrink-0 text-[#49BBBD]" /><dt className="sr-only">Tin đang tuyển</dt><dd><strong className="text-slate-800">{item.active_job_count.toLocaleString('vi-VN')}</strong> tin đang tuyển</dd></div>
      {company.size !== null && <div className="flex min-w-0 items-center gap-2"><UsersRound size={16} className="shrink-0 text-slate-400" /><dt className="sr-only">Quy mô</dt><dd className="truncate">{company.size.toLocaleString('vi-VN')} nhân sự</dd></div>}
      {company.address && <div className="flex min-w-0 items-center gap-2"><MapPin size={16} className="shrink-0 text-slate-400" /><dt className="sr-only">Địa chỉ</dt><dd className="truncate">{company.address}</dd></div>}
    </dl>
    <p className="mt-4 inline-flex items-center gap-1.5 text-xs text-slate-500"><CalendarDays size={14} />Theo dõi từ {formatFollowedAt(item.followed_at)}</p>
    <div className="mt-auto flex flex-col gap-2 border-t border-slate-100 pt-4 sm:flex-row">
      <Link to={`/companies/${company.id}`} className="btn-press inline-flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-200 px-3 text-sm font-bold text-slate-700 hover:border-[#49BBBD] hover:text-[#31999b]">Xem trang công ty <ArrowRight size={15} /></Link>
      <button type="button" onClick={() => onUnfollow(company.id)} disabled={disabled} className="btn-press inline-flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-xl border border-rose-200 px-3 text-sm font-bold text-rose-700 hover:bg-rose-50 disabled:cursor-wait disabled:opacity-55">{removing && <Loader2 size={15} className="animate-spin" />}{removing ? 'Đang bỏ theo dõi' : 'Bỏ theo dõi'}</button>
    </div>
  </article>
}

export default function FollowedCompaniesPage() {
  const [params, setParams] = useSearchParams()
  const refreshVersion = useDataRefreshVersion()
  const queryKey = params.toString()
  const rawPage = Number(params.get('page') ?? '1')
  const page = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1
  const requestParams = useMemo(() => ({ page, page_size: PAGE_SIZE }), [page])
  const fetcher = useCallback((signal: AbortSignal) => companyService.getFollowedCompanies(requestParams, signal), [requestParams])
  const { data, error, isFetching, isInitialLoading, refetch, replaceData } = usePaginatedQuery<FollowedCompanyListResponse>({ queryKey, refreshKey: refreshVersion, fetcher })
  const toast = useToast()
  const [removingCompanyId, setRemovingCompanyId] = useState<string | null>(null)
  const [mutationError, setMutationError] = useState<string | null>(null)

  const setPage = useCallback((nextPage: number, replace = false) => setParams(nextPage <= 1 ? {} : { page: String(nextPage) }, { replace }), [setParams])

  useEffect(() => {
    if (!data || isFetching || data.total_pages === 0 || page <= data.total_pages) return
    void Promise.resolve().then(() => setPage(data.total_pages, true))
  }, [data, isFetching, page, setPage])

  const unfollow = async (companyId: string) => {
    if (!data || removingCompanyId || isFetching || data.page !== page) return
    const previous = data
    const nextItems = data.items.filter((item) => item.company.id !== companyId)
    const nextTotal = Math.max(0, data.total - 1)
    const nextTotalPages = nextTotal ? Math.ceil(nextTotal / data.page_size) : 0
    setRemovingCompanyId(companyId)
    setMutationError(null)
    replaceData({ ...data, items: nextItems, total: nextTotal, total_pages: nextTotalPages })
    try {
      await companyService.unfollow(companyId)
      toast.success('Đã bỏ theo dõi công ty.')
      if (nextItems.length === 0 && page > 1) setPage(page - 1)
      else refetch()
    } catch {
      replaceData(previous)
      setMutationError('Không thể bỏ theo dõi công ty. Thay đổi đã được hoàn tác, vui lòng thử lại.')
      toast.error('Không thể bỏ theo dõi công ty. Thay đổi đã được hoàn tác.')
    } finally {
      setRemovingCompanyId(null)
    }
  }

  const errorMessage = error ? 'Không thể tải danh sách công ty đang theo dõi. Vui lòng kiểm tra kết nối và thử lại.' : null

  return <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
    <header className="flex flex-col justify-between gap-5 border-b border-slate-200 pb-6 sm:flex-row sm:items-end">
      <div><Link to="/jobs" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition-colors hover:text-[#49BBBD]"><ArrowLeft size={16} />Tìm việc làm</Link><h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">Công ty đang theo dõi</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Theo dõi các công ty bạn quan tâm để dễ dàng quay lại xem thông tin và cơ hội tuyển dụng.</p></div>
      {data && <p className="text-sm text-slate-500"><strong className="tabular-nums text-slate-900">{data.total.toLocaleString('vi-VN')}</strong> công ty đang theo dõi</p>}
    </header>
    {data && <QueryFetchFeedback isFetching={isFetching} errorMessage={errorMessage} onRetry={refetch} />}
    {mutationError && <div role="alert" className="mt-5 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"><AlertCircle size={17} className="mt-0.5 shrink-0" />{mutationError}</div>}
    {isInitialLoading ? <FollowedCompaniesSkeleton /> : !data && errorMessage ? <section role="alert" className="mt-6 rounded-2xl bg-white px-6 py-12 text-center ring-1 ring-slate-200"><AlertCircle className="mx-auto text-red-600" size={32} /><h2 className="mt-4 text-lg font-bold text-slate-950">Không thể tải công ty đang theo dõi.</h2><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">{errorMessage}</p><button type="button" onClick={refetch} className="btn-press mt-5 rounded-xl bg-[#49BBBD] px-4 py-2.5 text-sm font-semibold text-white">Thử lại</button></section> : data?.items.length === 0 && data.total > 0 ? <div className="mt-6 flex min-h-48 items-center justify-center rounded-2xl bg-white text-sm font-medium text-slate-500 ring-1 ring-slate-200"><Loader2 size={17} className="mr-2 animate-spin text-[#49BBBD]" />Đang mở trang trước…</div> : data?.items.length === 0 ? <section className="mt-6 rounded-2xl bg-white px-6 py-16 text-center ring-1 ring-slate-200"><span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-[#49BBBD]"><Building2 size={27} /></span><h2 className="mt-5 text-xl font-bold text-slate-950">Bạn chưa theo dõi công ty nào</h2><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">Khi theo dõi một công ty, công ty đó sẽ xuất hiện tại đây để bạn tiện theo dõi.</p><Link to="/jobs" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#49BBBD] px-4 py-2.5 text-sm font-semibold text-white">Khám phá việc làm <ArrowRight size={16} /></Link></section> : data ? <><section className="mt-6 grid gap-4 lg:grid-cols-2" aria-label="Danh sách công ty đang theo dõi">{data.items.map((item) => <FollowedCompanyCard key={item.company.id} item={item} removing={removingCompanyId === item.company.id} disabled={Boolean(removingCompanyId) || isFetching || data.page !== page} onUnfollow={unfollow} />)}</section>{data.total_pages > 1 && <nav className="mt-8 flex items-center justify-between gap-4" aria-label="Phân trang công ty đang theo dõi"><button type="button" onClick={() => setPage(page - 1)} disabled={page <= 1 || Boolean(removingCompanyId)} className="inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-45"><ArrowLeft size={16} />Trước</button><span className="text-sm text-slate-600">Trang <strong className="tabular-nums text-slate-950">{data.page}</strong> / {data.total_pages}</span><button type="button" onClick={() => setPage(page + 1)} disabled={page >= data.total_pages || Boolean(removingCompanyId)} className="inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-45">Sau <ArrowRight size={16} /></button></nav>}</> : null}
  </main>
}
