import React from 'react'
import * as LucideIcons from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Category } from '../../types/job'

interface CategoryCardProps {
  category: Category
  index?: number
}

type IconComponent = React.FC<{ size?: number; className?: string }>

const PASTEL_PALETTES = [
  { bg: 'bg-emerald-50/80', iconBg: 'bg-emerald-100/90 text-emerald-700', border: 'border-emerald-100/80', hover: 'hover:border-emerald-300' },
  { bg: 'bg-sky-50/80', iconBg: 'bg-sky-100/90 text-sky-700', border: 'border-sky-100/80', hover: 'hover:border-sky-300' },
  { bg: 'bg-amber-50/80', iconBg: 'bg-amber-100/90 text-amber-700', border: 'border-amber-100/80', hover: 'hover:border-amber-300' },
  { bg: 'bg-purple-50/80', iconBg: 'bg-purple-100/90 text-purple-700', border: 'border-purple-100/80', hover: 'hover:border-purple-300' },
  { bg: 'bg-rose-50/80', iconBg: 'bg-rose-100/90 text-rose-700', border: 'border-rose-100/80', hover: 'hover:border-rose-300' },
  { bg: 'bg-teal-50/80', iconBg: 'bg-teal-100/90 text-[#49BBBD]', border: 'border-teal-100/80', hover: 'hover:border-teal-300' },
  { bg: 'bg-indigo-50/80', iconBg: 'bg-indigo-100/90 text-indigo-700', border: 'border-indigo-100/80', hover: 'hover:border-indigo-300' },
  { bg: 'bg-orange-50/80', iconBg: 'bg-orange-100/90 text-orange-700', border: 'border-orange-100/80', hover: 'hover:border-orange-300' },
]

export default function CategoryCard({ category, index = 0 }: CategoryCardProps) {
  const IconMap = LucideIcons as unknown as Record<string, IconComponent>
  const Icon: IconComponent = IconMap[category.icon] ?? IconMap['Folder'] ?? LucideIcons.Folder

  const palette = PASTEL_PALETTES[index % PASTEL_PALETTES.length]

  return (
    <Link
      to={`/jobs?search=${encodeURIComponent(category.name)}`}
      className={`
        group flex flex-col items-center justify-between p-6 rounded-3xl border
        ${palette.bg} ${palette.border} ${palette.hover}
        shadow-xs hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300
        text-center min-h-[160px]
      `}
    >
      <div
        className={`
          flex h-14 w-14 items-center justify-center rounded-2xl
          ${palette.iconBg} shadow-sm group-hover:scale-110 group-hover:rotate-3
          transition-transform duration-300
        `}
      >
        <Icon size={24} aria-hidden="true" />
      </div>

      <div className="mt-3">
        <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-[#49BBBD] transition-colors">
          {category.name}
        </h3>
        {category.jobCount ? (
          <p className="mt-1 text-xs font-semibold text-slate-500">
            {category.jobCount.toLocaleString()} việc làm
          </p>
        ) : null}
      </div>
    </Link>
  )
}
