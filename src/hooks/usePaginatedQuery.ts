import { useCallback, useEffect, useRef, useState } from 'react'

type QueryFetcher<T> = (signal: AbortSignal) => Promise<T>

type UsePaginatedQueryOptions<T> = {
  queryKey: string
  refreshKey?: string | number
  fetcher: QueryFetcher<T>
}

type PaginatedQueryState<T> = {
  data: T | null
  error: unknown | null
  isFetching: boolean
  isInitialLoading: boolean
  refetch: () => void
}

function isAbortedRequest(error: unknown): boolean {
  return error instanceof DOMException
    ? error.name === 'AbortError'
    : typeof error === 'object' && error !== null && 'code' in error && error.code === 'ERR_CANCELED'
}

/**
 * Keeps the last successful response visible while a new query is fetching.
 * The request key is owned by the page so it can reflect only real API params.
 */
export function usePaginatedQuery<T>({ queryKey, refreshKey, fetcher }: UsePaginatedQueryOptions<T>): PaginatedQueryState<T> {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<unknown | null>(null)
  const [isFetching, setIsFetching] = useState(true)
  const [refreshVersion, setRefreshVersion] = useState(0)
  const requestId = useRef(0)

  useEffect(() => {
    const controller = new AbortController()
    const activeRequestId = ++requestId.current

    void Promise.resolve()
      .then(() => {
        if (controller.signal.aborted || activeRequestId !== requestId.current) return undefined
        setIsFetching(true)
        setError(null)
        return fetcher(controller.signal)
      })
      .then((response) => {
        if (response !== undefined && activeRequestId === requestId.current && !controller.signal.aborted) setData(response)
      })
      .catch((requestError: unknown) => {
        if (activeRequestId === requestId.current && !controller.signal.aborted && !isAbortedRequest(requestError)) setError(requestError)
      })
      .finally(() => {
        if (activeRequestId === requestId.current && !controller.signal.aborted) setIsFetching(false)
      })

    return () => {
      controller.abort()
      if (requestId.current === activeRequestId) requestId.current += 1
    }
  }, [fetcher, queryKey, refreshKey, refreshVersion])

  const refetch = useCallback(() => setRefreshVersion((version) => version + 1), [])

  return {
    data,
    error,
    isFetching,
    isInitialLoading: data === null && isFetching,
    refetch,
  }
}
