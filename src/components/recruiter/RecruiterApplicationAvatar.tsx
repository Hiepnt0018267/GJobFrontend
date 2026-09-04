type Props = {
  name: string
  url: string | null
  size?: 'sm' | 'lg'
}

export default function RecruiterApplicationAvatar({ name, url, size = 'sm' }: Props) {
  const initial = name.trim().charAt(0).toUpperCase() || '?'
  const sizeClass = size === 'lg' ? 'h-11 w-11 text-base' : 'h-9 w-9 text-sm'
  if (url) return <img src={url} alt={`Ảnh đại diện của ${name}`} className={`${sizeClass} shrink-0 rounded-full object-cover ring-1 ring-slate-200`} />
  return <span aria-hidden="true" className={`flex ${sizeClass} shrink-0 items-center justify-center rounded-full bg-blue-50 font-bold text-blue-700 ring-1 ring-blue-100`}>{initial}</span>
}
