import { FileText } from 'lucide-react'
import { resolveApiAssetUrl } from '../../services/api'

type Props = {
  name: string
  url?: string | null
  className?: string
}

export default function CVTemplateThumbnail({ name, url, className = 'h-20 w-14' }: Props) {
  const imageUrl = resolveApiAssetUrl(url)

  return <div className={`relative grid shrink-0 place-items-center overflow-hidden rounded bg-white shadow-sm ring-1 ring-slate-200 ${className}`}>
    <FileText size={20} aria-hidden="true" className="text-slate-300" />
    <span className="sr-only">Chưa có ảnh xem trước cho mẫu {name}</span>
    {imageUrl && <img src={imageUrl} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" onError={(event) => { event.currentTarget.style.display = 'none' }} />}
  </div>
}
