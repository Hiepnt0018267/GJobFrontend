import type { CSSProperties, ReactNode } from 'react'
import type { ResolvedCVTheme } from './cvTheme'
import type { CVRendererMode } from './templates/types'

type Props = {
  children: ReactNode
  theme: ResolvedCVTheme
  mode: CVRendererMode
  className?: string
  printBackground?: 'dark'
}

export default function CVDocumentSurface({ children, theme, mode, className = '', printBackground }: Props) {
  const isClipped = className.includes('overflow-hidden')
  const overflowClass = isClipped ? 'overflow-hidden' : 'overflow-visible'
  const style: CSSProperties = {
    ...theme.fontStyle,
    color: theme.secondary_color,
    width: '210mm',
    minHeight: '297mm',
    maxWidth: '100%',
    ...(isClipped ? { overflow: 'hidden' } : {}),
  }
  return (
    <article
      data-cv-document
      data-render-mode={mode}
      data-print-background={printBackground}
      data-section-spacing={theme.section_spacing}
      data-line-spacing={theme.line_spacing}
      data-heading-style={theme.heading_style}
      style={style}
      className={`cv-document-surface cv-spacing-${theme.section_spacing.toLowerCase()} box-border ${overflowClass} bg-white text-slate-700 shadow-sm ring-1 ring-slate-200 print:w-[210mm] print:min-h-[297mm] print:max-w-none print:shadow-none print:ring-0 ${className}`}
    >
      {children}
    </article>
  )
}
