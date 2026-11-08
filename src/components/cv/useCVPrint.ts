import { useCallback, useRef, useState, type RefObject } from 'react'
import { createBrowserPrintController } from './cvPrint'

export function useCVPrint({ rootRef, title }: { rootRef: RefObject<HTMLDivElement | null>; title: string }) {
  const controllerRef = useRef<ReturnType<typeof createBrowserPrintController> | null>(null)
  const [printing, setPrinting] = useState(false)
  const [printError, setPrintError] = useState<string | null>(null)

  const printCV = useCallback(async () => {
    if (printing) return
    const root = rootRef.current
    if (!root) { setPrintError('Chưa thể chuẩn bị bản in CV. Vui lòng thử lại.'); return }
    if (!controllerRef.current) controllerRef.current = createBrowserPrintController()
    setPrinting(true)
    setPrintError(null)
    try {
      await controllerRef.current.print({ root, title })
    } catch {
      setPrintError('Không thể mở hộp thoại in. Nội dung CV của bạn vẫn được giữ nguyên.')
    } finally {
      setPrinting(false)
    }
  }, [printing, rootRef, title])

  return { printCV, printing, printError }
}
