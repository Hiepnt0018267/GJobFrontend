import { useEffect, useState } from 'react'
import api from '../services/api'

export function usePrivateMediaUrl(endpoint: string | null, version: string | null | undefined) {
  const requestKey = endpoint ? `${endpoint}:${version ?? ''}` : null
  const [resource, setResource] = useState<{ key: string; url: string | null; failed: boolean }>({ key: '', url: null, failed: false })

  useEffect(() => {
    if (!endpoint || !requestKey) return
    const controller = new AbortController()
    let objectUrl: string | null = null
    api.get<Blob>(endpoint, { responseType: 'blob', signal: controller.signal })
      .then((response) => {
        objectUrl = URL.createObjectURL(response.data)
        setResource({ key: requestKey, url: objectUrl, failed: false })
      })
      .catch(() => {
        if (controller.signal.aborted) return
        setResource({ key: requestKey, url: null, failed: true })
      })
    return () => { controller.abort(); if (objectUrl) URL.revokeObjectURL(objectUrl) }
  }, [endpoint, requestKey])

  return requestKey === resource.key ? { url: resource.url, failed: resource.failed } : { url: null, failed: false }
}
