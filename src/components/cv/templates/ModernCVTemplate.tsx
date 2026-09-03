import CVDocumentView from '../CVDocumentView'
import type { CVTemplateComponentProps } from './types'

export default function ModernCVTemplate({ data, mode, theme, className = '', children }: CVTemplateComponentProps) {
  return <article style={theme.fontStyle} className={`bg-white p-6 text-slate-700 shadow-sm ring-1 ring-slate-200 sm:p-8 ${className}`}>{mode === 'edit' ? children : <CVDocumentView cv={data} layoutKey="MODERN" theme={theme} />}</article>
}
