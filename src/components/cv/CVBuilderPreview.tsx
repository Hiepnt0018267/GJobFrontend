import CVPreview from './CVPreview'
import { usePrivateMediaUrl } from '../../hooks/usePrivateMediaUrl'
import type { BuilderCV, CVCreateRequest } from '../../types/cv'
import type { CVTemplateRenderable } from './CVTemplateRenderer'
import type { CVRenderPresentation } from './templates/types'

type Props = { cv: BuilderCV | CVCreateRequest; template: CVTemplateRenderable; presentation?: CVRenderPresentation; photoEndpoint?: string | null; photoVersion?: string | null; hasManagedPhoto?: boolean; className?: string }

export default function CVBuilderPreview({ cv, template, presentation, photoEndpoint, photoVersion, hasManagedPhoto = false, className }: Props) {
  const { url } = usePrivateMediaUrl(hasManagedPhoto ? photoEndpoint ?? null : null, photoVersion)
  return <CVPreview cv={cv} template={template} presentation={presentation} className={className} photoUrl={url} />
}
