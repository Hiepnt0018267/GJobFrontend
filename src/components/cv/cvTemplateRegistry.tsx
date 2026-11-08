import type { ReactNode } from 'react'
import type { CVTemplateLayoutKey } from '../../types/cv'
import SimpleSingleColumnCVTemplate from './templates/SimpleSingleColumnCVTemplate'
import ProfessionalSidebarCVTemplate from './templates/ProfessionalSidebarCVTemplate'
import ProfessionalCleanRightSidebarCVTemplate from './templates/ProfessionalCleanRightSidebarCVTemplate'
import CreativeDarkColumnsCVTemplate from './templates/CreativeDarkColumnsCVTemplate'
import FigmaA4ProfileTimelineCVTemplate from './templates/FigmaA4ProfileTimelineCVTemplate'
import FigmaPurpleProfileCVTemplate from './templates/FigmaPurpleProfileCVTemplate'
import FigmaCleanSidebarCVTemplate from './templates/FigmaCleanSidebarCVTemplate'
import FigmaMonochromePortraitCVTemplate from './templates/FigmaMonochromePortraitCVTemplate'
import FigmaEditorialPortraitCVTemplate from './templates/FigmaEditorialPortraitCVTemplate'
import type { CVTemplateComponentProps } from './templates/types'

type TemplateRenderer = (props: CVTemplateComponentProps) => ReactNode

export const cvTemplateRenderers: Record<CVTemplateLayoutKey, TemplateRenderer> = {
  SIMPLE_SINGLE_COLUMN: (props) => <SimpleSingleColumnCVTemplate {...props} />,
  PROFESSIONAL_SIDEBAR: (props) => <ProfessionalSidebarCVTemplate {...props} />,
  PROFESSIONAL_CLEAN_RIGHT_SIDEBAR: (props) => <ProfessionalCleanRightSidebarCVTemplate {...props} />,
  CREATIVE_DARK_COLUMNS: (props) => <CreativeDarkColumnsCVTemplate {...props} />,
  FIGMA_A4_PROFILE_TIMELINE: (props) => <FigmaA4ProfileTimelineCVTemplate {...props} />,
  FIGMA_PURPLE_PROFILE: (props) => <FigmaPurpleProfileCVTemplate {...props} />,
  FIGMA_CLEAN_SIDEBAR: (props) => <FigmaCleanSidebarCVTemplate {...props} />,
  FIGMA_MONOCHROME_PORTRAIT: (props) => <FigmaMonochromePortraitCVTemplate {...props} />,
  FIGMA_EDITORIAL_PORTRAIT: (props) => <FigmaEditorialPortraitCVTemplate {...props} />,
}

export const getCVTemplateRenderer = (layoutKey: string) => cvTemplateRenderers[layoutKey as CVTemplateLayoutKey] ?? null
export const isSupportedCVTemplateLayout = (layoutKey: string): layoutKey is CVTemplateLayoutKey => Boolean(getCVTemplateRenderer(layoutKey))
