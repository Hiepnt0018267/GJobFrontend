import type { ReactNode } from 'react'
import type { CVTemplateLayoutKey } from '../../types/cv'
import ClassicCVTemplate from './templates/ClassicCVTemplate'
import MinimalCVTemplate from './templates/MinimalCVTemplate'
import ModernCVTemplate from './templates/ModernCVTemplate'
import type { CVTemplateComponentProps } from './templates/types'

type TemplateRenderer = (props: CVTemplateComponentProps) => ReactNode

export const cvTemplateRenderers: Record<CVTemplateLayoutKey, TemplateRenderer> = {
  MODERN: (props) => <ModernCVTemplate {...props} />,
  CLASSIC: (props) => <ClassicCVTemplate {...props} />,
  MINIMAL: (props) => <MinimalCVTemplate {...props} />,
}

export const getCVTemplateRenderer = (layoutKey: string) => cvTemplateRenderers[layoutKey as CVTemplateLayoutKey] ?? null
export const isSupportedCVTemplateLayout = (layoutKey: string): layoutKey is CVTemplateLayoutKey => Boolean(getCVTemplateRenderer(layoutKey))
