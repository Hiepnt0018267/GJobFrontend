import type { CVCreateRequest } from '../../types/cv'
import CVTemplateRenderer, { type CVTemplateRenderable } from './CVTemplateRenderer'

type Props = {
  cv: CVCreateRequest
  template: CVTemplateRenderable
  className?: string
  photoUrl?: string | null
}

export default function CVPreview({ cv, template, className, photoUrl }: Props) {
  return <CVTemplateRenderer cv={cv} template={template} className={className} photoUrl={photoUrl} />
}
