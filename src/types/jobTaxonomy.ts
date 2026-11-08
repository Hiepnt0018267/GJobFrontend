import type { JobLevel } from './job'

export type JobTaxonomyItem = {
  id: string
  code: string
  display_name: string
  allowed_levels?: JobLevel[]
  default_level?: JobLevel | null
}

export type JobTaxonomyIndustry = JobTaxonomyItem & {
  positions: JobTaxonomyItem[]
}

export type JobTaxonomyResponse = {
  industries: JobTaxonomyIndustry[]
}
