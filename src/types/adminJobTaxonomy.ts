import type { JobLevel } from './job'

export type AdminTaxonomyIndustry = {
  id: string
  code: string
  display_name: string
  is_active: boolean
  sort_order: number
  position_count: number
  template_usage_count: number
}

export type AdminTaxonomyPosition = {
  id: string
  code: string
  display_name: string
  is_active: boolean
  sort_order: number
  industry_codes: string[]
  template_usage_count: number
  allowed_levels?: JobLevel[]
  default_level?: JobLevel | null
  incompatible_jobs_count?: number
}

export type AdminTaxonomyJobStats = {
  total_jobs: number
  mapped_jobs: number
  unmapped_jobs: number
  inactive_reference_jobs: number
}

export type AdminJobTaxonomy = {
  industries: AdminTaxonomyIndustry[]
  positions: AdminTaxonomyPosition[]
  job_stats?: AdminTaxonomyJobStats
}

export type AdminIndustryCreate = Pick<AdminTaxonomyIndustry, 'code' | 'display_name' | 'sort_order'>
export type AdminIndustryUpdate = Partial<Pick<AdminTaxonomyIndustry, 'display_name' | 'is_active' | 'sort_order'>>
export type AdminPositionCreate = Pick<AdminTaxonomyPosition, 'code' | 'display_name' | 'sort_order' | 'industry_codes'> & {
  allowed_levels?: JobLevel[]
  default_level?: JobLevel | null
}
export type AdminPositionUpdate = Partial<
  Pick<
    AdminTaxonomyPosition,
    'display_name' | 'is_active' | 'sort_order' | 'industry_codes' | 'allowed_levels' | 'default_level'
  >
>
