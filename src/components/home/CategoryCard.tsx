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
    <article className="group flex w-full flex-col items-center gap-3 rounded-xl border border-slate-200 bg-white p-5 text-center transition-all duration-200 hover:border-blue-300 hover:shadow-md">
      <div className="flex items-center justify-center w-12 h-12 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-all duration-200">
        <Icon size={22} />
      </div>
      <div>
        <p className="font-semibold text-slate-800 text-sm leading-tight">{category.name}</p>
      </div>
    </article>
  )
}
