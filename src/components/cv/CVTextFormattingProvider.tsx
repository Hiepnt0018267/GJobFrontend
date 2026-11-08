import type { ReactNode } from 'react'
import { CVTextFormattingContext, type CVTextFormattingContextValue } from './cvTextFormattingContext'

export default function CVTextFormattingProvider({ formatting, editable, updateField, children }: CVTextFormattingContextValue & { children: ReactNode }) {
  return <CVTextFormattingContext.Provider value={{ formatting, editable, updateField }}>{children}</CVTextFormattingContext.Provider>
}
