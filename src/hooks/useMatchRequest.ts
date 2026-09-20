import axios from 'axios'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { CVJobMatchResponse } from '../types/matching'

type MatchContextToken = { key: string }
type MatchSnapshot = { token: MatchContextToken; result: CVJobMatchResponse }
type MatchErrorSnapshot = { token: MatchContextToken; error: unknown }

export function useMatchRequest(
  contextKey: string,
  request: (signal: AbortSignal) => Promise<CVJobMatchResponse>,
) {
  const [snapshot, setSnapshot] = useState<MatchSnapshot | null>(null)
  const [errorSnapshot, setErrorSnapshot] = useState<MatchErrorSnapshot | null>(null)
  const [fetchingToken, setFetchingToken] = useState<MatchContextToken | null>(null)
  const contextToken = useMemo<MatchContextToken>(() => ({ key: contextKey }), [contextKey])
  const controllerRef = useRef<AbortController | null>(null)
  const controllerKeyRef = useRef<string | null>(null)
  const requestIdRef = useRef(0)

  useEffect(() => {
    controllerRef.current?.abort()
    controllerRef.current = null
    controllerKeyRef.current = null
    requestIdRef.current += 1

    return () => controllerRef.current?.abort()
  }, [contextKey])

  const run = useCallback(async () => {
    if (!contextKey || controllerKeyRef.current === contextKey) return

    controllerRef.current?.abort()

    const controller = new AbortController()
    const requestId = ++requestIdRef.current
    controllerRef.current = controller
    controllerKeyRef.current = contextKey
    setErrorSnapshot(null)
    setFetchingToken(contextToken)

    try {
      const result = await request(controller.signal)
      if (!controller.signal.aborted && requestId === requestIdRef.current) {
        setSnapshot({ token: contextToken, result })
      }
    } catch (requestError: unknown) {
      if (!controller.signal.aborted && requestId === requestIdRef.current && !axios.isCancel(requestError)) {
        setErrorSnapshot({ token: contextToken, error: requestError })
      }
    } finally {
      if (requestId === requestIdRef.current) {
        controllerRef.current = null
        controllerKeyRef.current = null
        if (!controller.signal.aborted) setFetchingToken(null)
      }
    }
  }, [contextKey, contextToken, request])

  return {
    result: snapshot?.token === contextToken ? snapshot.result : null,
    error: errorSnapshot?.token === contextToken ? errorSnapshot.error : null,
    isFetching: fetchingToken === contextToken,
    run,
  }
}
