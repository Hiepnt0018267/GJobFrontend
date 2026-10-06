import React from 'react'
import * as LucideIcons from 'lucide-react'
import type { Category } from '../../types/job'

interface CategoryCardProps {
  category: Category
}

type IconComponent = React.FC<{ size?: number; className?: string }>

export default function CategoryCard({ category }: CategoryCardProps) {
  const IconMap = LucideIcons as unknown as Record<string, IconComponent>
  const Icon: IconComponent = IconMap[category.icon] ?? IconMap['Folder']

  return (
    <article className="btn-press group flex w-full flex-col items-center gap-3.5 rounded-2xl border border-slate-200/80 bg-white p-5 text-center shadow-xs transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-1 hover:border-blue-300 hover:shadow-premium">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50/80 text-blue-600 ring-1 ring-blue-600/15 transition-all duration-200 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white group-hover:shadow-md group-hover:shadow-blue-600/25">
        <Icon size={20} aria-hidden="true" />
      </div>
      <div>
        <p className="text-sm font-bold leading-snug text-slate-900 transition-colors group-hover:text-blue-600">
          {category.name}
        </p>
      </div>
    </article>
  )
}
