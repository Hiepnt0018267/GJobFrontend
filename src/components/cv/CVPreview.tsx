import type { CVCreateRequest } from '../../types/cv'
import CVTemplateRenderer, { type CVTemplateRenderable } from './CVTemplateRenderer'
import type { CVRenderPresentation } from './templates/types'

type Props = {
  cv: CVCreateRequest
  template: CVTemplateRenderable
  className?: string
  photoUrl?: string | null
  presentation?: CVRenderPresentation
}

export default function CVPreview({ cv, template, className, photoUrl, presentation }: Props) {
  return <CVTemplateRenderer cv={cv} template={template} presentation={presentation} className={className} photoUrl={photoUrl} />
}
