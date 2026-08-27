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
    <button
      type="button"
      className="group bg-white rounded-xl border border-slate-200 p-5 flex flex-col items-center gap-3 text-center hover:border-blue-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      aria-label={`Xem việc làm ngành ${category.name}`}
    >
      <div className="flex items-center justify-center w-12 h-12 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-all duration-200">
        <Icon size={22} />
      </div>
      <div>
        <p className="font-semibold text-slate-800 text-sm leading-tight">{category.name}</p>
        <p className="text-xs text-slate-500 mt-1">{category.jobCount.toLocaleString('vi-VN')} việc làm</p>
      </div>
    </button>
  )
}
