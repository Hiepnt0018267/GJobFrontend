import { toBlob } from 'html-to-image'
import { CheckCircle2, ImagePlus, Loader2, Square } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import CVTemplateRenderer from '../../cv/CVTemplateRenderer'
import { createNormalSampleCVData } from '../../cv/sampleCVData'
import { adminCVTemplateService } from '../../../services/adminCVTemplateService'
import type { AdminCVTemplate } from '../../../types/adminCVTemplate'

const A4_WIDTH = 794
const A4_HEIGHT = 1123
const BATCH_SIZE = 100

type Progress = {
  completed: number
  failed: number
  total: number
  currentName: string | null
}

type Props = {
  onComplete: () => void
}

function filenameFor(template: AdminCVTemplate, mimeType: string): string {
  const safeCode = template.code.toLowerCase().replace(/[^a-z0-9_-]+/g, '-').replace(/^-+|-+$/g, '') || template.id
  return `${safeCode}.${mimeType === 'image/webp' ? 'webp' : 'png'}`
}

async function nextPaint(): Promise<void> {
  await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))
}

async function captureThumbnail(node: HTMLElement, template: AdminCVTemplate): Promise<File> {
  if ('fonts' in document) await document.fonts.ready
  await nextPaint()
  const blob = await toBlob(node, {
    width: A4_WIDTH,
    height: A4_HEIGHT,
    canvasWidth: A4_WIDTH,
    canvasHeight: A4_HEIGHT,
    backgroundColor: '#FFFFFF',
    cacheBust: true,
    pixelRatio: 1,
    quality: 0.88,
    skipAutoScale: true,
    type: 'image/webp',
  })
  if (!blob) throw new Error('Không thể xuất ảnh xem trước.')
  const mimeType = blob.type === 'image/webp' ? 'image/webp' : 'image/png'
  return new File([blob], filenameFor(template, mimeType), { type: mimeType })
}

async function loadTemplatesWithoutThumbnail(): Promise<AdminCVTemplate[]> {
  const first = await adminCVTemplateService.getAdminCVTemplates({ page: 1, page_size: BATCH_SIZE })
  const items = [...first.items]
  for (let page = 2; page <= first.total_pages; page += 1) {
    const response = await adminCVTemplateService.getAdminCVTemplates({ page, page_size: BATCH_SIZE })
    items.push(...response.items)
  }
  return items.filter((template) => !template.thumbnail_url)
}

export default function AdminCVTemplateThumbnailBatch({ onComplete }: Props) {
  const [renderTarget, setRenderTarget] = useState<AdminCVTemplate | null>(null)
  const [running, setRunning] = useState(false)
  const [finished, setFinished] = useState(false)
  const [progress, setProgress] = useState<Progress>({ completed: 0, failed: 0, total: 0, currentName: null })
  const [error, setError] = useState<string | null>(null)
  const renderRootRef = useRef<HTMLDivElement>(null)
  const renderReadyRef = useRef<((node: HTMLElement) => void) | null>(null)
  const cancelledRef = useRef(false)

  useEffect(() => {
    if (!renderTarget || !renderRootRef.current || !renderReadyRef.current) return
    let cancelled = false
    const resolveWhenReady = async () => {
      await nextPaint()
      if (!cancelled && renderRootRef.current && renderReadyRef.current) {
        const resolve = renderReadyRef.current
        renderReadyRef.current = null
        resolve(renderRootRef.current)
      }
    }
    void resolveWhenReady()
    return () => { cancelled = true }
  }, [renderTarget])

  const renderTemplate = useCallback((template: AdminCVTemplate) => new Promise<HTMLElement>((resolve) => {
    renderReadyRef.current = resolve
    setRenderTarget(template)
  }), [])

  const generateMissing = useCallback(async () => {
    if (running) return
    cancelledRef.current = false
    setRunning(true)
    setFinished(false)
    setError(null)
    setProgress({ completed: 0, failed: 0, total: 0, currentName: null })
    try {
      const templates = await loadTemplatesWithoutThumbnail()
      setProgress({ completed: 0, failed: 0, total: templates.length, currentName: null })
      if (templates.length === 0) {
        setFinished(true)
        return
      }
      let completed = 0
      let failed = 0
      for (const template of templates) {
        if (cancelledRef.current) break
        setProgress({ completed, failed, total: templates.length, currentName: template.name })
        try {
          const node = await renderTemplate(template)
          const file = await captureThumbnail(node, template)
          await adminCVTemplateService.uploadAdminCVTemplateThumbnail(template.id, file)
          completed += 1
        } catch {
          failed += 1
        }
        setProgress({ completed, failed, total: templates.length, currentName: null })
      }
      setFinished(!cancelledRef.current)
      onComplete()
    } catch {
      setError('Không thể tải danh sách mẫu CV để tạo ảnh. Vui lòng thử lại.')
    } finally {
      renderReadyRef.current = null
      setRenderTarget(null)
      setRunning(false)
    }
  }, [onComplete, renderTemplate, running])

  const processed = progress.completed + progress.failed
  const percent = progress.total > 0 ? Math.round((processed / progress.total) * 100) : 0

  return <>
    <div className="flex flex-col items-stretch gap-2 sm:items-end">
      <button
        type="button"
        disabled={running}
        onClick={() => void generateMissing()}
        className="btn-press inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-xs transition-colors hover:border-slate-300 hover:bg-slate-50 disabled:cursor-wait disabled:opacity-70"
      >
        {running ? <Loader2 size={17} className="animate-spin" /> : <ImagePlus size={17} />}
        {running ? `Đang tạo ${processed}/${progress.total}` : 'Tạo ảnh còn thiếu'}
      </button>
      {running && <button type="button" onClick={() => { cancelledRef.current = true }} className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900"><Square size={11} />Dừng sau mẫu hiện tại</button>}
    </div>

    {(running || finished || error) && <section role={error ? 'alert' : 'status'} aria-live="polite" className="fixed bottom-5 right-5 z-[90] w-[min(28rem,calc(100vw-2rem))] rounded-2xl border border-slate-200 bg-white px-4 py-3.5 shadow-xl">
      <div className="flex items-start gap-3">
        {finished && !error ? <CheckCircle2 className="mt-0.5 shrink-0 text-emerald-600" size={18} /> : <ImagePlus className="mt-0.5 shrink-0 text-slate-500" size={18} />}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-900">
            {error ?? (finished ? `Đã tạo ${progress.completed} ảnh xem trước${progress.failed ? `, ${progress.failed} mẫu lỗi` : ''}.` : `Đang tạo ảnh thật từ renderer CV${progress.currentName ? `: ${progress.currentName}` : '...'}`)}
          </p>
          {!error && progress.total > 0 && <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200"><div className="h-full rounded-full bg-[#49BBBD] transition-[width] duration-300" style={{ width: `${percent}%` }} /></div>}
          {!error && <p className="mt-1.5 text-xs text-slate-500">Ảnh được lưu dưới dạng WebP và gắn trực tiếp vào mẫu CV. Có thể chạy lại để xử lý các mẫu còn thiếu.</p>}
        </div>
      </div>
    </section>}

    {renderTarget && <div aria-hidden="true" className="pointer-events-none fixed left-[-10000px] top-0 z-[-1] overflow-hidden bg-white" style={{ width: A4_WIDTH, height: A4_HEIGHT }}>
      <div ref={renderRootRef} className="overflow-hidden bg-white" style={{ width: A4_WIDTH, height: A4_HEIGHT }}>
        <CVTemplateRenderer
          cv={createNormalSampleCVData(renderTarget.id)}
          template={renderTarget}
          presentation={{ locale: 'vi' }}
          mode="print"
        />
      </div>
    </div>}
  </>
}
