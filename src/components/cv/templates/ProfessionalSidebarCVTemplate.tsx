import CVStructuredLayout from './CVStructuredLayout'
import type { CVTemplateComponentProps } from './types'

export default function ProfessionalSidebarCVTemplate(props: CVTemplateComponentProps) {
  return <CVStructuredLayout {...props} variant="left-sidebar" />
}
