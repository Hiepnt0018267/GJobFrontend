import { useRef, type MouseEvent, type ReactNode } from 'react'

type Props = {
  children: ReactNode
  className?: string
}

export default function SpotlightGrid({ children, className = '' }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (window.matchMedia('(pointer: coarse)').matches) return
    const container = containerRef.current
    if (!container) return

    const rect = container.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    container.style.setProperty('--spotlight-x', `${x}px`)
    container.style.setProperty('--spotlight-y', `${y}px`)
  }

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className={`relative group/spotlight ${className}`}
      style={{
        ['--spotlight-x' as string]: '-999px',
        ['--spotlight-y' as string]: '-999px',
      }}
    >
      {children}
    </div>
  )
}
