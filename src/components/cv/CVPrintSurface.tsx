import { createPortal } from 'react-dom'
import type { RefObject } from 'react'
import type { CVCreateRequest } from '../../types/cv'
import CVTemplateRenderer, { type CVTemplateRenderable } from './CVTemplateRenderer'
import { derivePrintRenderState } from './cvPrint'
import type { CVRenderPresentation } from './templates/types'

type Props = {
  cv: CVCreateRequest
  template: CVTemplateRenderable
  presentation: CVRenderPresentation
  photoUrl?: string | null
  rootRef: RefObject<HTMLDivElement | null>
}

export default function CVPrintSurface({ cv, template, presentation, photoUrl = null, rootRef }: Props) {
  if (typeof document === 'undefined') return null
  const state = derivePrintRenderState({ cv, template, presentation, photoUrl })
  return createPortal(
    <div ref={rootRef} className="cv-print-root" data-cv-print-root aria-hidden="true">
      <CVTemplateRenderer cv={state.cv} template={state.template} presentation={state.presentation} photoUrl={state.photoUrl} mode="print" />
    </div>,
    document.body,
  )
}
