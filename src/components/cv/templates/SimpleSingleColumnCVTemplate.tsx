import CVStructuredLayout from './CVStructuredLayout'
import type { CVTemplateComponentProps } from './types'

export default function SimpleSingleColumnCVTemplate(props: CVTemplateComponentProps) {
  return <CVStructuredLayout {...props} variant="simple" />
}
