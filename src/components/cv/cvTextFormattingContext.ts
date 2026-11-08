import { createContext, useContext } from 'react'
import type { CVFieldTextFormatting, CVTextFormatting } from '../../types/cv'

export type CVTextFormattingContextValue = {
  formatting?: CVTextFormatting
  editable: boolean
  updateField?: (fieldId: string, formatting?: CVFieldTextFormatting) => void
}

export const CVTextFormattingContext = createContext<CVTextFormattingContextValue>({ editable: false })

export function useCVTextFormatting(fieldId: string) {
  const context = useContext(CVTextFormattingContext)
  return { formatting: context.formatting?.fields[fieldId], editable: context.editable, updateFormatting: (value?: CVFieldTextFormatting) => context.updateField?.(fieldId, value) }
}
