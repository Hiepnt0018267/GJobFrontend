import type { ReactNode } from 'react'
import type { CVCreateRequest } from '../../../types/cv'

export type CVTemplateMode = 'view' | 'edit'

export type CVTemplateComponentProps = {
  data: CVCreateRequest
  mode: CVTemplateMode
  className?: string
  children?: ReactNode
}
