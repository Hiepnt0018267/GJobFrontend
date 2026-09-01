import type { CVCreateRequest, CVTemplateSummary } from '../../types/cv'
import CVTemplateRenderer from './CVTemplateRenderer'

type Props = {
  cv: CVCreateRequest
  template: CVTemplateSummary
  className?: string
}

export default function CVPreview({ cv, template, className }: Props) {
  return <CVTemplateRenderer cv={cv} template={template} className={className} />
}
