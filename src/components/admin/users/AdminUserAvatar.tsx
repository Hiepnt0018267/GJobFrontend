import { useState } from 'react'
import { UserRound } from 'lucide-react'

type AdminUserAvatarProps = {
  name: string
  url: string | null
  size?: 'sm' | 'lg'
}

export default function AdminUserAvatar({ name, url, size = 'sm' }: AdminUserAvatarProps) {
  const [imageFailed, setImageFailed] = useState(false)
  const initial = name.trim().charAt(0).toUpperCase() || '?'
  const dimensions = size === 'lg' ? 'h-16 w-16 text-xl' : 'h-10 w-10 text-sm'
  const usableUrl = Boolean(url?.trim()) && !imageFailed

  return (
    <span className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-blue-100 font-bold text-blue-700 ${dimensions}`} aria-label={`Ảnh đại diện của ${name}`}>
      {usableUrl ? <img src={url ?? ''} alt="" onError={() => setImageFailed(true)} className="h-full w-full object-cover" /> : initial ? initial : <UserRound size={size === 'lg' ? 25 : 17} aria-hidden="true" />}
    </span>
  )
}
