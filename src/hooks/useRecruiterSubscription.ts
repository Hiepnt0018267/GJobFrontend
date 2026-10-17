import { useCallback } from 'react'
import { subscriptionService } from '../services/subscriptionService'
import { useDataRefreshVersion } from './useDataRefreshVersion'
import { usePaginatedQuery } from './usePaginatedQuery'

export function useRecruiterSubscription() {
  const refreshVersion = useDataRefreshVersion()
  const fetcher = useCallback(
    (signal: AbortSignal) => subscriptionService.getMyRecruiterSubscription(signal),
    [],
  )
  return usePaginatedQuery({
    queryKey: 'recruiter-current-subscription',
    refreshKey: refreshVersion,
    fetcher,
  })
}
