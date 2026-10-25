import gjobMark from '../../assets/brand/gjob-mark.png'
import gjobMarkMonochrome from '../../assets/brand/gjob-mark-minimal-monochrome.png'
import gjobWordmark from '../../assets/brand/gjob-wordmark.png'
import gjobWordmarkMonochrome from '../../assets/brand/gjob-wordmark-minimal-monochrome.png'

type GJobLogoProps = {
  variant?: 'wordmark' | 'mark'
  palette?: 'brand' | 'monochrome'
  className?: string
  decorative?: boolean
}

export default function GJobLogo({
  variant = 'wordmark',
  palette = 'brand',
  className = '',
  decorative = true,
}: GJobLogoProps) {
  const src = palette === 'monochrome'
    ? (variant === 'mark' ? gjobMarkMonochrome : gjobWordmarkMonochrome)
    : (variant === 'mark' ? gjobMark : gjobWordmark)

  return (
    <img
      src={src}
      alt={decorative ? '' : 'GJob'}
      aria-hidden={decorative || undefined}
      className={`block shrink-0 object-contain ${className}`}
      draggable={false}
    />
  )
}
