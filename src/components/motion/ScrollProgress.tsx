import { useEffect, useState } from 'react'

export default function ScrollProgress() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let ticking = false
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const total = document.documentElement.scrollHeight - window.innerHeight
          const current = window.scrollY
          setProgress(total > 0 ? Math.min(Math.max(current / total, 0), 1) : 0)
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed top-0 left-0 right-0 z-[100] h-[2.5px] bg-transparent"
    >
      <div
        className="h-full bg-gradient-to-r from-teal-400 via-[#49BBBD] to-cyan-300 shadow-[0_0_10px_rgba(73,187,189,0.8)] transition-transform duration-75 ease-out"
        style={{
          transform: `scaleX(${progress})`,
          transformOrigin: 'left',
        }}
      />
    </div>
  )
}
