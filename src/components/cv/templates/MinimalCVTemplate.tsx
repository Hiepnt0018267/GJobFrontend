import CVDocumentView from '../CVDocumentView'
import type { CVTemplateComponentProps } from './types'

export default function MinimalCVTemplate({ data, mode, className = '', children }: CVTemplateComponentProps) {
  return <article className={`bg-white p-6 font-sans text-sm text-slate-700 shadow-sm ring-1 ring-slate-200 sm:p-8 ${className}`}>{mode === 'edit' ? children : <CVDocumentView cv={data} layoutKey="MINIMAL" />}</article>
}
