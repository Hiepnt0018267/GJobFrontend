import { AlertCircle, ArrowLeft, ArrowRight, Building2, Loader2 } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import FollowedCompanyCard from '../../companies/FollowedCompanyCard'
import QueryFetchFeedback from '../../feedback/QueryFetchFeedback'
import { useDataRefreshVersion } from '../../../hooks/useDataRefreshVersion'
import { usePaginatedQuery } from '../../../hooks/usePaginatedQuery'
import { useToast } from '../../../hooks/useToast'
import { companyService } from '../../../services/companyService'
import type { FollowedCompanyListResponse } from '../../../types/company'

const PAGE_SIZE = 8

export function FollowedCompaniesSkeleton() {
  return (
    <div className="mt-6 grid gap-4 lg:grid-cols-2" aria-busy="true" aria-label="Đang tải công ty đang theo dõi">
      {Array.from({ length: 4 }, (_, index) => (
        <div key={index} className="h-64 animate-pulse rounded-2xl bg-slate-200" />
      ))}
    </div>
  )
}

type Props = {
  onTotalChange?: (total: number) => void
  userId?: string
}

export default function FollowedCompaniesTab({ onTotalChange, userId }: Props) {
  const refreshVersion = useDataRefreshVersion()
  const [page, setPage] = useState(1)
  const queryKey = useMemo(() => `companies-page-${page}-${userId ?? 'guest'}`, [page, userId])
  const refreshKey = useMemo(() => `${refreshVersion}-${userId ?? 'guest'}`, [refreshVersion, userId])
  const requestParams = useMemo(() => ({ page, page_size: PAGE_SIZE }), [page])
  const fetcher = useCallback((signal: AbortSignal) => companyService.getFollowedCompanies(requestParams, signal), [requestParams])

  const { data, error, isFetching, isInitialLoading, refetch, replaceData } = usePaginatedQuery<FollowedCompanyListResponse>({
    queryKey,
    refreshKey,
    fetcher,
  })

  const toast = useToast()
  const [removingCompanyId, setRemovingCompanyId] = useState<string | null>(null)
  const [mutationError, setMutationError] = useState<string | null>(null)

  useEffect(() => {
    if (typeof data?.total === 'number') {
      onTotalChange?.(data.total)
    }
  }, [data?.total, onTotalChange])

  useEffect(() => {
    if (!data || isFetching || data.total_pages === 0 || page <= data.total_pages) return
    const lastPage = data.total_pages
    void Promise.resolve().then(() => setPage(lastPage))
  }, [data, isFetching, page])

  const unfollow = async (companyId: string) => {
    if (!data || removingCompanyId || isFetching || data.page !== page) return
    const previous = data
    const nextItems = data.items.filter((item) => item.company.id !== companyId)
    const nextTotal = Math.max(0, data.total - 1)
    const nextTotalPages = nextTotal ? Math.ceil(nextTotal / data.page_size) : 0
    setRemovingCompanyId(companyId)
    setMutationError(null)
    replaceData({ ...data, items: nextItems, total: nextTotal, total_pages: nextTotalPages })
    onTotalChange?.(nextTotal)

    try {
      await companyService.unfollow(companyId)
      toast.success('Đã bỏ theo dõi công ty.')
      if (nextItems.length === 0 && page > 1) {
        setPage(page - 1)
      } else {
        refetch()
      }
    } catch {
      replaceData(previous)
      onTotalChange?.(previous.total)
      setMutationError('Không thể bỏ theo dõi công ty. Thay đổi đã được hoàn tác, vui lòng thử lại.')
      toast.error('Không thể bỏ theo dõi công ty. Thay đổi đã được hoàn tác.')
    } finally {
      setRemovingCompanyId(null)
    }
  }

  const errorMessage = error ? 'Không thể tải danh sách công ty đang theo dõi. Vui lòng kiểm tra kết nối và thử lại.' : null

  return (
    <div className="w-full">
      {data && <QueryFetchFeedback isFetching={isFetching} errorMessage={errorMessage} onRetry={refetch} />}
      {mutationError && (
        <div role="alert" className="mt-5 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <AlertCircle size={17} className="mt-0.5 shrink-0" />
          {mutationError}
        </div>
      )}

      {isInitialLoading ? (
        <FollowedCompaniesSkeleton />
      ) : !data && errorMessage ? (
        <section role="alert" className="mt-6 rounded-2xl bg-white px-6 py-12 text-center ring-1 ring-slate-200">
          <AlertCircle className="mx-auto text-red-600" size={32} />
          <h2 className="mt-4 text-lg font-bold text-slate-950">Không thể tải công ty đang theo dõi.</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">{errorMessage}</p>
          <button
            type="button"
            onClick={refetch}
            className="btn-press mt-5 rounded-xl bg-[#49BBBD] px-4 py-2.5 text-sm font-semibold text-white"
          >
            Thử lại
          </button>
        </section>
      ) : data?.items.length === 0 && data.total > 0 ? (
        <div className="mt-6 flex min-h-48 items-center justify-center rounded-2xl bg-white text-sm font-medium text-slate-500 ring-1 ring-slate-200">
          <Loader2 size={17} className="mr-2 animate-spin text-[#49BBBD]" />
          Đang mở trang trước…
        </div>
      ) : data?.items.length === 0 ? (
        <section className="mt-6 rounded-2xl bg-white px-6 py-16 text-center ring-1 ring-slate-200">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-[#49BBBD]">
            <Building2 size={27} />
          </span>
          <h2 className="mt-5 text-xl font-bold text-slate-950">Bạn chưa theo dõi công ty nào</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
            Khi theo dõi một công ty, công ty đó sẽ xuất hiện tại đây để bạn tiện theo dõi.
          </p>
          <Link to="/jobs" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#49BBBD] px-4 py-2.5 text-sm font-semibold text-white">
            Khám phá việc làm <ArrowRight size={16} />
          </Link>
        </section>
      ) : data ? (
        <>
          <section className="mt-6 grid gap-4 lg:grid-cols-2" aria-label="Danh sách công ty đang theo dõi">
            {data.items.map((item) => (
              <FollowedCompanyCard
                key={item.company.id}
                item={item}
                removing={removingCompanyId === item.company.id}
                disabled={Boolean(removingCompanyId) || isFetching || data.page !== page}
                onUnfollow={unfollow}
              />
            ))}
          </section>
          {data.total_pages > 1 && (
            <nav className="mt-8 flex items-center justify-between gap-4" aria-label="Phân trang công ty đang theo dõi">
              <button
                type="button"
                onClick={() => setPage(page - 1)}
                disabled={page <= 1 || Boolean(removingCompanyId)}
                className="inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-45"
              >
                <ArrowLeft size={16} />
                Trước
              </button>
              <span className="text-sm text-slate-600">
                Trang <strong className="tabular-nums text-slate-950">{data.page}</strong> / {data.total_pages}
              </span>
              <button
                type="button"
                onClick={() => setPage(page + 1)}
                disabled={page >= data.total_pages || Boolean(removingCompanyId)}
                className="inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-45"
              >
                Sau <ArrowRight size={16} />
              </button>
            </nav>
          )}
        </>
      ) : null}
    </div>
  )
}
