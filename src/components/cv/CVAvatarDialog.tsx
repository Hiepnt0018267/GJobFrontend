import { Upload, User, X } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'

// ─── Types ───────────────────────────────────────────────────────────────────

type Props = {
  currentUrl?: string | null
  onConfirm: (file: File) => void
  onRemove?: () => void
  onClose: () => void
}

type Rect = { x: number; y: number; w: number; h: number }

// Handle index: 0=TL 1=TC 2=TR 3=ML 4=MR 5=BL 6=BC 7=BR
type HandleIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7

const HANDLE_SIZE = 8
const MIN_CROP = 40
// Target aspect ratio 3:4 (portrait)
const ASPECT = 3 / 4

// ─── Helpers ─────────────────────────────────────────────────────────────────

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v))
}

/** Compute initial crop rect centered in canvas, respecting aspect ratio */
function initialCrop(imgW: number, imgH: number, canvasW: number, canvasH: number, scale: number): Rect {
  const dispW = imgW * scale
  const dispH = imgH * scale
  const offsetX = (canvasW - dispW) / 2
  const offsetY = (canvasH - dispH) / 2

  let w = dispW * 0.8
  let h = w / ASPECT
  if (h > dispH * 0.8) { h = dispH * 0.8; w = h * ASPECT }

  const x = offsetX + (dispW - w) / 2
  const y = offsetY + (dispH - h) / 2
  return { x, y, w, h }
}

/** Draw checkerboard on entire canvas */
function drawCheckerboard(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const size = 10
  for (let row = 0; row * size < h; row++) {
    for (let col = 0; col * size < w; col++) {
      ctx.fillStyle = (row + col) % 2 === 0 ? '#c8c8c8' : '#e8e8e8'
      ctx.fillRect(col * size, row * size, size, size)
    }
  }
}

/** Pixel positions of the 8 handles */
function getHandles(r: Rect): Array<{ cx: number; cy: number }> {
  const { x, y, w, h } = r
  return [
    { cx: x, cy: y },           // 0 TL
    { cx: x + w / 2, cy: y },   // 1 TC
    { cx: x + w, cy: y },       // 2 TR
    { cx: x, cy: y + h / 2 },   // 3 ML
    { cx: x + w, cy: y + h / 2 },// 4 MR
    { cx: x, cy: y + h },       // 5 BL
    { cx: x + w / 2, cy: y + h },// 6 BC
    { cx: x + w, cy: y + h },   // 7 BR
  ]
}

function hitHandle(handles: Array<{ cx: number; cy: number }>, mx: number, my: number): HandleIndex | null {
  for (let i = 0; i < handles.length; i++) {
    const { cx, cy } = handles[i]
    if (Math.abs(mx - cx) <= HANDLE_SIZE + 3 && Math.abs(my - cy) <= HANDLE_SIZE + 3)
      return i as HandleIndex
  }
  return null
}

function insideCrop(r: Rect, mx: number, my: number) {
  return mx >= r.x && mx <= r.x + r.w && my >= r.y && my <= r.y + r.h
}

/** Cursor style per handle */
const handleCursors: Record<HandleIndex, string> = {
  0: 'nw-resize', 1: 'n-resize',  2: 'ne-resize',
  3: 'w-resize',  4: 'e-resize',
  5: 'sw-resize', 6: 's-resize',  7: 'se-resize',
}

/** Crop rect → image-space rect (pixels on original image) */
function cropToImageRect(
  crop: Rect,
  canvasW: number, canvasH: number,
  imgW: number, imgH: number,
  scale: number,
): Rect {
  const dispW = imgW * scale
  const dispH = imgH * scale
  const offsetX = (canvasW - dispW) / 2
  const offsetY = (canvasH - dispH) / 2
  return {
    x: (crop.x - offsetX) / scale,
    y: (crop.y - offsetY) / scale,
    w: crop.w / scale,
    h: crop.h / scale,
  }
}

// ─── Cropper Canvas ───────────────────────────────────────────────────────────

const CANVAS_W = 320
const CANVAS_H = 300

function CropCanvas({
  img,
  onCropChange,
}: {
  img: HTMLImageElement
  onCropChange: (previewUrl: string) => void
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const cropRef = useRef<Rect>({ x: 0, y: 0, w: 0, h: 0 })
  const dragRef = useRef<{
    mode: 'move' | 'handle'
    handleIdx?: HandleIndex
    startX: number; startY: number
    startCrop: Rect
  } | null>(null)
  const rafRef = useRef<number>(0)

  // Compute scale to fit image inside canvas
  const scale = Math.min(CANVAS_W / img.naturalWidth, CANVAS_H / img.naturalHeight, 1)

  const drawFrame = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const { x, y, w, h } = cropRef.current
    const sc = scale
    const imgW = img.naturalWidth * sc
    const imgH = img.naturalHeight * sc
    const ox = (CANVAS_W - imgW) / 2
    const oy = (CANVAS_H - imgH) / 2

    // Background
    drawCheckerboard(ctx, CANVAS_W, CANVAS_H)

    // Image
    ctx.drawImage(img, ox, oy, imgW, imgH)

    // Dark overlay outside crop
    ctx.fillStyle = 'rgba(0,0,0,0.45)'
    ctx.fillRect(ox, oy, imgW, imgH)
    ctx.clearRect(x, y, w, h)
    // Re-draw image inside crop (clear reveals it)
    ctx.save()
    ctx.beginPath()
    ctx.rect(x, y, w, h)
    ctx.clip()
    ctx.drawImage(img, ox, oy, imgW, imgH)
    ctx.restore()

    // Crop border
    ctx.strokeStyle = '#49BBBD'
    ctx.lineWidth = 1.5
    ctx.strokeRect(x, y, w, h)

    // Grid lines (rule of thirds)
    ctx.strokeStyle = 'rgba(255,255,255,0.3)'
    ctx.lineWidth = 0.8
    for (let i = 1; i < 3; i++) {
      ctx.beginPath(); ctx.moveTo(x + w * i / 3, y); ctx.lineTo(x + w * i / 3, y + h); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(x, y + h * i / 3); ctx.lineTo(x + w, y + h * i / 3); ctx.stroke()
    }

    // Handles
    const handles = getHandles(cropRef.current)
    handles.forEach(({ cx, cy }) => {
      ctx.fillStyle = '#fff'
      ctx.beginPath()
      ctx.arc(cx, cy, HANDLE_SIZE / 2 + 1, 0, Math.PI * 2)
      ctx.fill()
      ctx.strokeStyle = '#49BBBD'
      ctx.lineWidth = 1.5
      ctx.stroke()
    })

    // Dimension label
    const ir = cropToImageRect(cropRef.current, CANVAS_W, CANVAS_H, img.naturalWidth, img.naturalHeight, sc)
    const label = `${Math.round(ir.w)} × ${Math.round(ir.h)}`
    ctx.font = 'bold 11px system-ui'
    const tw = ctx.measureText(label).width
    const lx = x + 6, ly = y + 6
    ctx.fillStyle = 'rgba(0,0,0,0.65)'
    ctx.fillRect(lx - 3, ly - 11, tw + 6, 16)
    ctx.fillStyle = '#4ade80'
    ctx.fillText(label, lx, ly)
  }, [img, scale])

  const updatePreview = useCallback(() => {
    const sc = scale
    const ir = cropToImageRect(cropRef.current, CANVAS_W, CANVAS_H, img.naturalWidth, img.naturalHeight, sc)
    const off = document.createElement('canvas')
    const w = Math.max(1, Math.round(ir.w))
    const h = Math.max(1, Math.round(ir.h))
    off.width = w; off.height = h
    const ctx = off.getContext('2d')!
    ctx.drawImage(img, Math.round(ir.x), Math.round(ir.y), w, h, 0, 0, w, h)
    onCropChange(off.toDataURL('image/jpeg', 0.85))
  }, [img, onCropChange, scale])

  useEffect(() => {
    cropRef.current = initialCrop(img.naturalWidth, img.naturalHeight, CANVAS_W, CANVAS_H, scale)
    drawFrame()
    updatePreview()
  }, [drawFrame, img, scale, updatePreview])

  const scheduleDraw = useCallback(() => {
    cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(() => { drawFrame(); updatePreview() })
  }, [drawFrame, updatePreview])

  // ── Constrain crop to image bounds ──
  const constrainCrop = useCallback((r: Rect): Rect => {
    const sc = scale
    const imgW = img.naturalWidth * sc
    const imgH = img.naturalHeight * sc
    const ox = (CANVAS_W - imgW) / 2
    const oy = (CANVAS_H - imgH) / 2
    let { x, y, w, h } = r
    w = clamp(w, MIN_CROP, imgW)
    h = clamp(h, MIN_CROP, imgH)
    x = clamp(x, ox, ox + imgW - w)
    y = clamp(y, oy, oy + imgH - h)
    return { x, y, w, h }
  }, [img, scale])

  // ── Mouse events ──
  const getPos = (e: React.MouseEvent<HTMLCanvasElement> | MouseEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect()
    return { mx: e.clientX - rect.left, my: e.clientY - rect.top }
  }

  const onMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const { mx, my } = getPos(e)
    const handles = getHandles(cropRef.current)
    const hi = hitHandle(handles, mx, my)
    if (hi !== null) {
      dragRef.current = { mode: 'handle', handleIdx: hi, startX: mx, startY: my, startCrop: { ...cropRef.current } }
    } else if (insideCrop(cropRef.current, mx, my)) {
      dragRef.current = { mode: 'move', startX: mx, startY: my, startCrop: { ...cropRef.current } }
    }
  }, [])

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const canvas = canvasRef.current; if (!canvas || !dragRef.current) return
      const rect = canvas.getBoundingClientRect()
      const mx = e.clientX - rect.left, my = e.clientY - rect.top
      const { mode, handleIdx, startX, startY, startCrop: s } = dragRef.current
      const dx = mx - startX, dy = my - startY

      if (mode === 'move') {
        cropRef.current = constrainCrop({ ...s, x: s.x + dx, y: s.y + dy })
      } else if (mode === 'handle' && handleIdx !== undefined) {
        const { x, y, w, h } = s
        const sc = scale
        const imgW = img.naturalWidth * sc, imgH = img.naturalHeight * sc
        const ox = (CANVAS_W - imgW) / 2, oy = (CANVAS_H - imgH) / 2

        switch (handleIdx) {
          case 0: { // TL – lock BR
            const newW = clamp(w - dx, MIN_CROP, s.x + s.w - ox)
            const newH = clamp(h - dy, MIN_CROP, s.y + s.h - oy)
            cropRef.current = constrainCrop({ x: s.x + s.w - newW, y: s.y + s.h - newH, w: newW, h: newH }); break
          }
          case 1: { // TC – lock bottom
            const newH = clamp(h - dy, MIN_CROP, s.y + s.h - oy)
            cropRef.current = constrainCrop({ x, y: s.y + s.h - newH, w, h: newH }); break
          }
          case 2: { // TR – lock BL
            const newW = clamp(w + dx, MIN_CROP, ox + imgW - s.x)
            const newH = clamp(h - dy, MIN_CROP, s.y + s.h - oy)
            cropRef.current = constrainCrop({ x, y: s.y + s.h - newH, w: newW, h: newH }); break
          }
          case 3: { // ML – lock right
            const newW = clamp(w - dx, MIN_CROP, s.x + s.w - ox)
            cropRef.current = constrainCrop({ x: s.x + s.w - newW, y, w: newW, h }); break
          }
          case 4: { // MR – lock left
            cropRef.current = constrainCrop({ x, y, w: clamp(w + dx, MIN_CROP, ox + imgW - s.x), h }); break
          }
          case 5: { // BL – lock TR
            const newW = clamp(w - dx, MIN_CROP, s.x + s.w - ox)
            const newH = clamp(h + dy, MIN_CROP, oy + imgH - s.y)
            cropRef.current = constrainCrop({ x: s.x + s.w - newW, y, w: newW, h: newH }); break
          }
          case 6: { // BC – lock top
            cropRef.current = constrainCrop({ x, y, w, h: clamp(h + dy, MIN_CROP, oy + imgH - s.y) }); break
          }
          case 7: { // BR – lock TL
            cropRef.current = constrainCrop({ x, y, w: clamp(w + dx, MIN_CROP, ox + imgW - s.x), h: clamp(h + dy, MIN_CROP, oy + imgH - s.y) }); break
          }
        }
      }
      scheduleDraw()
    }
    const onUp = () => { dragRef.current = null }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
  }, [constrainCrop, img, scale, scheduleDraw])

  // Cursor
  const onMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return
    const { mx, my } = getPos(e)
    const handles = getHandles(cropRef.current)
    const hi = hitHandle(handles, mx, my)
    if (hi !== null) canvasRef.current.style.cursor = handleCursors[hi]
    else if (insideCrop(cropRef.current, mx, my)) canvasRef.current.style.cursor = 'move'
    else canvasRef.current.style.cursor = 'default'
  }, [])

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_W}
      height={CANVAS_H}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      className="rounded-lg"
      style={{ display: 'block', width: CANVAS_W, height: CANVAS_H }}
    />
  )
}

// ─── Main Dialog ──────────────────────────────────────────────────────────────

const ACCEPT = ['image/jpeg', 'image/png', 'image/webp']
const MAX_BYTES = 5 * 1024 * 1024

export default function CVAvatarDialog({ currentUrl, onConfirm, onRemove, onClose }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const changeInputRef = useRef<HTMLInputElement>(null)
  const [loadedImg, setLoadedImg] = useState<HTMLImageElement | null>(null)
  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)
  const [removed, setRemoved] = useState(false)


  useEffect(() => {
    if (currentUrl) {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => { setLoadedImg(img) }
      img.onerror = () => { /* ignore – user can upload new */ }
      img.src = currentUrl
    }
  }, [currentUrl])

  const handleFile = useCallback((file: File | undefined) => {
    if (!file) return
    setError(null)
    if (!ACCEPT.includes(file.type)) { setError('Chỉ hỗ trợ ảnh JPG, PNG hoặc WEBP.'); return }
    if (file.size > MAX_BYTES) { setError('Dung lượng ảnh không được vượt quá 5 MB.'); return }
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => { setLoadedImg(img) }
    img.src = url
  }, [])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0])
  }, [handleFile])

  // We pass a stable onCropChange callback
  const handleCropChange = useCallback((dataUrl: string) => {
    setPreviewDataUrl(dataUrl)
  }, [])

  const confirm = async () => {
    if (!loadedImg) { onClose(); return }
    // Re-create crop from current state via canvas export
    // The CropCanvas manages its own cropRef internally, so we export via hidden canvas
    // We re-use previewDataUrl to create a blob
    if (!previewDataUrl) { onClose(); return }
    const res = await fetch(previewDataUrl)
    const blob = await res.blob()
    const file = new File([blob], 'avatar.jpg', { type: 'image/jpeg' })
    onConfirm(file)
    onClose()
  }

  const handleBackdrop = (e: React.MouseEvent) => { if (e.target === e.currentTarget) onClose() }

  const effectiveCurrentUrl = removed ? null : currentUrl
  const hasImage = Boolean(loadedImg)

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/50 p-4"
      onMouseDown={handleBackdrop}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="avatar-dialog-title"
        className="w-full max-w-[680px] rounded-2xl bg-white shadow-2xl"
      >
        {/* Header */}
        <header className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 id="avatar-dialog-title" className="text-base font-bold text-slate-900">
            Cập nhật ảnh đại diện
          </h2>
          <button type="button" onClick={onClose} aria-label="Đóng"
            className="grid h-8 w-8 place-items-center rounded-lg text-slate-500 hover:bg-slate-100">
            <X size={18} />
          </button>
        </header>

        {/* Body */}
        <div className="grid grid-cols-2 gap-6 px-6 py-5">

          {/* ── Left: upload / crop ── */}
          <div>
            <p className="mb-3 text-center text-sm font-semibold text-slate-600">Ảnh gốc</p>

            {/* Always-mounted file input */}
            <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp"
              className="sr-only" onChange={(e) => handleFile(e.target.files?.[0])} />

            {hasImage && loadedImg ? (
              /* Crop canvas */
              <div className="flex justify-center">
                <CropCanvas img={loadedImg} onCropChange={handleCropChange} />
              </div>
            ) : (
              /* Drop zone */
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                onDrop={onDrop}
                onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
                onDragLeave={() => setDragging(false)}
                aria-label="Chọn hoặc kéo thả ảnh"
                className={`flex h-[300px] w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed transition
                  ${dragging ? 'border-[#49BBBD] bg-teal-50' : 'border-slate-300 bg-slate-50 hover:border-[#49BBBD] hover:bg-teal-50/50'}`}
              >
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-200 text-slate-400">
                  <Upload size={26} />
                </span>
                <span className="text-center text-sm leading-5 text-slate-500">
                  Click hoặc kéo thả ảnh để tải lên
                </span>
              </button>
            )}

            <p className="mt-2 text-[11px] leading-4 text-slate-500">
              Ảnh tải lên có dung lượng không quá 5 MB. Hỗ trợ JPG, PNG, WEBP.
            </p>
            {error && (
              <p role="alert" className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>
            )}
          </div>

          {/* ── Right: preview ── */}
          <div>
            <p className="mb-3 text-center text-sm font-semibold text-slate-600">Ảnh hiển thị trên CV</p>
            <div className="flex h-[300px] items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50">
              {previewDataUrl || (effectiveCurrentUrl && !loadedImg) ? (
                <img
                  src={previewDataUrl ?? effectiveCurrentUrl ?? undefined}
                  alt="Ảnh hiển thị trên CV"
                  className="h-44 w-32 rounded-md object-cover shadow-md"
                />
              ) : hasImage ? (
                <img
                  src={previewDataUrl ?? undefined}
                  alt="Ảnh hiển thị trên CV"
                  className="h-44 w-32 rounded-md object-cover shadow-md"
                />
              ) : (
                <div className="flex h-44 w-32 flex-col items-center justify-center rounded-md bg-slate-200 text-slate-400">
                  <User size={40} strokeWidth={1.5} />
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="mt-3 flex items-center justify-center gap-2">
              {/* Hidden input for "Đổi ảnh" when crop canvas is showing */}
              <input ref={changeInputRef} type="file" accept="image/jpeg,image/png,image/webp"
                className="sr-only" onChange={(e) => handleFile(e.target.files?.[0])} />
              <button
                type="button"
                onClick={() => (hasImage ? changeInputRef : inputRef).current?.click()}
                className="rounded-md border border-[#49BBBD] bg-teal-50 px-2.5 py-1 text-[11px] font-semibold text-[#49BBBD] hover:bg-teal-100"
              >
                Đổi ảnh
              </button>
              {(hasImage || effectiveCurrentUrl) && onRemove && (
                <button
                  type="button"
                  onClick={() => {
                    onRemove()
                    setLoadedImg(null)
                    setPreviewDataUrl(null)
                    setError(null)
                    setRemoved(true)
                  }}
                  className="rounded-md border border-red-200 bg-red-50 px-2.5 py-1 text-[11px] font-semibold text-red-500 hover:bg-red-100"
                >
                  Xóa ảnh
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="flex items-center justify-end gap-3 border-t border-slate-100 px-6 py-4">
          <button type="button" onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">
            Đóng lại
          </button>
          <button
            type="button"
            onClick={() => void confirm()}
            disabled={!hasImage}
            className="rounded-lg bg-[#49BBBD] px-5 py-2 text-sm font-semibold text-white hover:bg-[#3aa8aa] active:bg-[#2f9597] disabled:opacity-40"
          >
            Hoàn tất
          </button>
        </footer>
      </div>
    </div>
  )
}
