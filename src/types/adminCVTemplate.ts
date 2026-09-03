import type { CVTemplateLayoutKey, CVTemplateThemeConfig } from './cv'

export type AdminCVTemplate = {
  id: string
  name: string
  description: string | null
  layout_key: CVTemplateLayoutKey
  theme_config: CVTemplateThemeConfig
  thumbnail_url: string | null
  is_active: boolean
  is_featured: boolean
  sort_order: number
  created_at: string
  updated_at: string
  usage_count: number
}

export type AdminCVTemplateListResponse = { items: AdminCVTemplate[]; page: number; page_size: number; total: number; total_pages: number }
export type AdminCVTemplateListParams = { search?: string; is_active?: boolean; is_featured?: boolean; page?: number; page_size?: number }
export type AdminCVTemplateCreateRequest = { name: string; description?: string | null; layout_key: CVTemplateLayoutKey; theme_config: CVTemplateThemeConfig; thumbnail_url?: string | null; is_active?: boolean; is_featured?: boolean; sort_order?: number }
export type AdminCVTemplateUpdateRequest = Partial<Pick<AdminCVTemplateCreateRequest, 'name' | 'description' | 'layout_key' | 'theme_config' | 'thumbnail_url' | 'sort_order'>>
