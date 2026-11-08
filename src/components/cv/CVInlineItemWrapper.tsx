import { ArrowDown, ArrowUp, Move, Trash2 } from 'lucide-react'
import { useRef, useState, type DragEvent, type ReactNode } from 'react'

type Props = {
  index: number
  total: number
  collectionKey: string
  onMoveUp?: (index: number) => void
  onMoveDown?: (index: number) => void
  onDelete?: (index: number) => void
  onReorder?: (fromIndex: number, toIndex: number) => void
  deleteLabel?: string
  className?: string
  children: ReactNode
}

export default function CVInlineItemWrapper({
  index,
  total,
  collectionKey,
  onMoveUp,
  onMoveDown,
  onDelete,
  onReorder,
  deleteLabel = 'Xóa mục',
  className = '',
  children,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  const canMoveUp = index > 0
  const canMoveDown = index < total - 1

  const handleDragStart = (e: DragEvent<HTMLDivElement>) => {
    setIsDragging(true)
    e.dataTransfer.setData('text/item-collection', collectionKey)
    e.dataTransfer.setData('text/item-index', String(index))
    e.dataTransfer.effectAllowed = 'move'

    if (containerRef.current) {
      e.dataTransfer.setDragImage(containerRef.current, 20, 20)
    }
  }

  const handleDragEnd = () => {
    setIsDragging(false)
    setIsDragOver(false)
  }

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    // Chỉ nhận drag từ cùng một collection
    const dragType = e.dataTransfer.types.includes('text/item-collection')
    if (!dragType) return

    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (!isDragOver) setIsDragOver(true)
  }

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    if (containerRef.current && !containerRef.current.contains(e.relatedTarget as Node)) {
      setIsDragOver(false)
    }
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragOver(false)
    setIsDragging(false)

    const dragCollection = e.dataTransfer.getData('text/item-collection')
    const dragIndexStr = e.dataTransfer.getData('text/item-index')
    if (dragCollection !== collectionKey || !dragIndexStr) return

    const fromIndex = parseInt(dragIndexStr, 10)
    if (!isNaN(fromIndex) && fromIndex !== index && onReorder) {
      onReorder(fromIndex, index)
    }
  }

  return (
    <div
      ref={containerRef}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`group/item relative rounded-lg border p-2.5 transition-all duration-150 ${
        isDragging
          ? 'opacity-30 scale-[0.99] border-2 border-dashed border-slate-300'
          : isDragOver
          ? 'bg-[#49BBBD]/15 border-2 border-[#49BBBD] shadow-xs'
          : 'border-slate-200/80 hover:border-[#49BBBD]/50 hover:bg-teal-50/15'
      } ${className}`}
    >
      <div className="flex gap-2 items-start">
        {/* Nội dung item */}
        <div className="min-w-0 flex-1">{children}</div>

        {/* Thanh công cụ mini của từng item */}
        <div className="flex shrink-0 items-center gap-0.5 rounded-md bg-slate-100 p-0.5 shadow-2xs opacity-60 group-hover/item:opacity-100 transition-opacity">
          {/* Nút Drag Handle */}
          {onReorder && total > 1 && (
            <div
              draggable
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              title="Kéo thả để đổi vị trí"
              className="flex h-6 w-6 cursor-grab items-center justify-center rounded text-slate-400 hover:bg-white hover:text-slate-700 active:cursor-grabbing transition-colors"
            >
              <Move size={12} strokeWidth={2.2} />
            </div>
          )}

          {/* Nút Lên */}
          {onMoveUp && total > 1 && (
            <button
              type="button"
              disabled={!canMoveUp}
              onClick={() => onMoveUp(index)}
              title="Di chuyển lên trên"
              className="flex h-6 w-6 items-center justify-center rounded text-slate-500 hover:bg-white hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-30 transition-colors"
            >
              <ArrowUp size={12} strokeWidth={2.2} />
            </button>
          )}

          {/* Nút Xuống */}
          {onMoveDown && total > 1 && (
            <button
              type="button"
              disabled={!canMoveDown}
              onClick={() => onMoveDown(index)}
              title="Di chuyển xuống dưới"
              className="flex h-6 w-6 items-center justify-center rounded text-slate-500 hover:bg-white hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-30 transition-colors"
            >
              <ArrowDown size={12} strokeWidth={2.2} />
            </button>
          )}

          {/* Nút Xóa */}
          {onDelete && (
            <button
              type="button"
              onClick={() => onDelete(index)}
              title={deleteLabel}
              aria-label={deleteLabel}
              className="flex h-6 w-6 items-center justify-center rounded text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
            >
              <Trash2 size={12} strokeWidth={2.2} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

