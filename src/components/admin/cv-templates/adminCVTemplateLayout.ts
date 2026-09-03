import type { CVTemplateLayoutKey } from '../../../types/cv'

export const layoutOptions: Array<{ value: CVTemplateLayoutKey; label: string; description: string }> = [
  { value: 'MODERN', label: 'Modern', description: 'Hiện đại' },
  { value: 'CLASSIC', label: 'Classic', description: 'Truyền thống' },
  { value: 'MINIMAL', label: 'Minimal', description: 'Tối giản' },
]
