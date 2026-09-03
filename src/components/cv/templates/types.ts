import type { ReactNode } from 'react'
import type { CVCreateRequest } from '../../../types/cv'
import type { ResolvedCVTheme } from '../cvTheme'

export type CVTemplateMode = 'view' | 'edit'

export type CVTemplateComponentProps = {
  data: CVCreateRequest
  mode: CVTemplateMode
  theme: ResolvedCVTheme
  className?: string
  children?: ReactNode
}
