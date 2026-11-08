import type { CVATSStatus, CVTemplateExperienceLevel, CVTemplateLayoutKey, CVTemplateStyle, CVTemplateThemeConfig } from './cv'

export type AdminCVTemplate = {
  id: string
  code: string
  name: string
  description: string | null
  layout_key: CVTemplateLayoutKey
  theme_config: CVTemplateThemeConfig
  thumbnail_url: string | null
  thumbnail_original_filename: string | null
  is_active: boolean
  is_featured: boolean
  sort_order: number
  created_at: string
  updated_at: string
  usage_count: number
  industry_groups: string[]
  job_positions: string[]
  experience_levels: CVTemplateExperienceLevel[]
  styles: CVTemplateStyle[]
  ats_status: CVATSStatus
  qualification_version: string
}

export type AdminCVTemplateListResponse = { items: AdminCVTemplate[]; page: number; page_size: number; total: number; total_pages: number }
export type AdminCVTemplateListParams = { search?: string; is_active?: boolean; is_featured?: boolean; style?: CVTemplateStyle; layout_key?: CVTemplateLayoutKey; ats_status?: CVATSStatus; industry_group?: string; page?: number; page_size?: number }
export type AdminCVTemplateCreateRequest = { code: string; name: string; description?: string | null; layout_key: CVTemplateLayoutKey; theme_config: CVTemplateThemeConfig; thumbnail_url?: string | null; is_active?: boolean; is_featured?: boolean; sort_order?: number; industry_groups: string[]; job_positions: string[]; experience_levels: CVTemplateExperienceLevel[]; styles: CVTemplateStyle[] }
export type AdminCVTemplateUpdateRequest = Partial<Pick<AdminCVTemplateCreateRequest, 'name' | 'description' | 'layout_key' | 'theme_config' | 'thumbnail_url' | 'sort_order' | 'industry_groups' | 'job_positions' | 'experience_levels' | 'styles'>>
