import CVPreview from './CVPreview'
import { usePrivateMediaUrl } from '../../hooks/usePrivateMediaUrl'
import type { BuilderCV, CVCreateRequest } from '../../types/cv'
import type { CVTemplateRenderable } from './CVTemplateRenderer'

type Props = { cv: BuilderCV | CVCreateRequest; template: CVTemplateRenderable; photoEndpoint?: string | null; photoVersion?: string | null; hasManagedPhoto?: boolean; className?: string }

export default function CVBuilderPreview({ cv, template, photoEndpoint, photoVersion, hasManagedPhoto = false, className }: Props) {
  const { url } = usePrivateMediaUrl(hasManagedPhoto ? photoEndpoint ?? null : null, photoVersion)
  return <CVPreview cv={cv} template={template} className={className} photoUrl={url} />
}
