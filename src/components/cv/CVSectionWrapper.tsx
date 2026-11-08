import { ArrowDown, ArrowUp, Hand, Move } from 'lucide-react'
import { useRef, useState, type DragEvent, type ReactNode } from 'react'

export type CVSectionKey = 'summary' | 'experience' | 'education' | 'skills' | 'projects' | 'certificates' | 'languages'

type Props = {
  sectionKey: CVSectionKey
  title?: string
  editing?: boolean
  canMoveUp?: boolean
  canMoveDown?: boolean
  onMoveUp?: (key: CVSectionKey) => void
  onMoveDown?: (key: CVSectionKey) => void
  onRemove?: (key: CVSectionKey) => void
  onReorder?: (draggedKey: CVSectionKey, targetKey: CVSectionKey) => void
  children: ReactNode
}

export default function CVSectionWrapper({
  sectionKey,
  title,
  editing = false,
  canMoveUp = true,
  canMoveDown = true,
  onMoveUp,
  onMoveDown,
  onRemove,
  onReorder,
  children,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  if (!editing) {
    return <>{children}</>
  }

  const handleDragStart = (e: DragEvent<HTMLDivElement>) => {
    setIsDragging(true)
    e.dataTransfer.setData('text/plain', sectionKey)
    e.dataTransfer.effectAllowed = 'move'

    // Tạo ghost image mượt mà của cả khối section
    if (containerRef.current) {
      e.dataTransfer.setDragImage(containerRef.current, 20, 20)
    }
  }

  const handleDragEnd = () => {
    setIsDragging(false)
    setIsDragOver(false)
  }

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (!isDragOver) {
      setIsDragOver(true)
    }
  }

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    // Chỉ xóa isDragOver khi con trỏ thật sự rời khỏi container
    if (containerRef.current && !containerRef.current.contains(e.relatedTarget as Node)) {
      setIsDragOver(false)
    }
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragOver(false)
    setIsDragging(false)

    const draggedKey = e.dataTransfer.getData('text/plain') as CVSectionKey
    if (draggedKey && draggedKey !== sectionKey && onReorder) {
      onReorder(draggedKey, sectionKey)
    }
  }

  return (
    <div
      ref={containerRef}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`group relative rounded-md p-2 -m-2 transition-all duration-150 ease-out ${
        isDragging
          ? 'opacity-25 scale-[0.99] border-2 border-dashed border-slate-300'
          : isDragOver
          ? 'bg-[#49BBBD]/25 border-2 border-[#49BBBD] shadow-sm'
          : 'border border-transparent hover:border-slate-300/80 hover:bg-slate-50/30'
      }`}
    >
      {/* Badge / Pill nổi bật khi vừa chạm vào (chuẩn màu thương hiệu GJob #49BBBD) */}
      {isDragOver && (
        <div className="absolute -left-3 top-2 z-40 flex items-center gap-1.5 rounded-md bg-[#49BBBD] px-2.5 py-1 text-xs font-bold text-white shadow-md pointer-events-none transition-all">
          <Hand size={13} className="stroke-[2.5]" />
          <span>{title || sectionKey}</span>
        </div>
      )}

      {/* Floating Toolbar góc trên bên trái - Chuẩn TopCV */}
      <div className="absolute -top-3 left-2 z-30 flex items-center gap-0.5 rounded-[4px] bg-[#6c757d] p-[2px] shadow-md transition-all duration-150 opacity-0 pointer-events-none -translate-y-1 group-hover:opacity-100 group-hover:pointer-events-auto group-hover:translate-y-0">
        {/* Nút Drag Handle */}
        <div
          draggable
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          title="Kéo thả để di chuyển mục"
          className="flex h-5 w-5 cursor-grab items-center justify-center rounded-[2px] bg-slate-600 text-white transition-colors hover:bg-slate-700 active:cursor-grabbing"
        >
          <Move size={11} strokeWidth={2.5} />
        </div>

        {/* Nút Lên */}
        <button
          type="button"
          disabled={!canMoveUp}
          onClick={() => onMoveUp?.(sectionKey)}
          title="Di chuyển lên trên"
          className="flex h-5 w-5 items-center justify-center rounded-[2px] bg-slate-600 text-white transition-colors hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ArrowUp size={11} strokeWidth={2.5} />
        </button>

        {/* Nút Xuống */}
        <button
          type="button"
          disabled={!canMoveDown}
          onClick={() => onMoveDown?.(sectionKey)}
          title="Di chuyển xuống dưới"
          className="flex h-5 w-5 items-center justify-center rounded-[2px] bg-slate-600 text-white transition-colors hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ArrowDown size={11} strokeWidth={2.5} />
        </button>

        {/* Nút Xóa (Màu đỏ giống TopCV) */}
        <button
          type="button"
          onClick={() => onRemove?.(sectionKey)}
          title={`Xóa mục ${title || ''}`}
          className="ml-0.5 flex h-5 items-center justify-center rounded-[2px] bg-[#dc3545] px-2 text-[11px] font-semibold text-white transition-colors hover:bg-red-700 active:scale-95"
        >
          Xóa
        </button>
      </div>

      {children}
    </div>
  )
}
