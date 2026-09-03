import type { CVTemplateSummary } from '../types/cv'

export function sortCVTemplates<T extends CVTemplateSummary>(templates: T[]): T[] {
  return [...templates].sort((left, right) => {
    if (left.is_featured !== right.is_featured) return Number(right.is_featured) - Number(left.is_featured)
    if (left.sort_order !== right.sort_order) return left.sort_order - right.sort_order
    return left.name.localeCompare(right.name, 'vi')
  })
}
