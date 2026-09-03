import type { CVCreateRequest } from '../../types/cv'
import CVTemplateRenderer, { type CVTemplateRenderable } from './CVTemplateRenderer'

type Props = {
  cv: CVCreateRequest
  template: CVTemplateRenderable
  className?: string
}

export default function CVPreview({ cv, template, className }: Props) {
  return <CVTemplateRenderer cv={cv} template={template} className={className} />
}
