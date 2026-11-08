import type { CVATSStatus, CVTemplateLayoutKey, CVTemplateStyle } from '../../../types/cv'

export type TemplateBooleanFilter = 'ALL' | 'TRUE' | 'FALSE'
export type TemplateStyleFilter = 'ALL' | CVTemplateStyle
export type TemplateLayoutFilter = 'ALL' | CVTemplateLayoutKey
export type TemplateATSFilter = 'ALL' | CVATSStatus
export type TemplateIndustryFilter = 'ALL' | string

export const DEFAULT_INDUSTRY_OPTIONS: ReadonlyArray<{ value: string; label: string }> = [
  { value: 'ALL', label: 'Tất cả ngành nghề' },
  { value: 'IT_SOFTWARE', label: 'Công nghệ thông tin / Phần mềm' },
  { value: 'SALES_BUSINESS', label: 'Kinh doanh / Bán hàng' },
  { value: 'MARKETING', label: 'Marketing' },
  { value: 'ACCOUNTING_FINANCE', label: 'Kế toán / Tài chính' },
  { value: 'HR_ADMIN', label: 'Nhân sự / Hành chính' },
  { value: 'LOGISTICS_SUPPLY_CHAIN', label: 'Logistics / Chuỗi cung ứng' },
  { value: 'ENGINEERING', label: 'Kỹ thuật' },
  { value: 'DESIGN_CREATIVE', label: 'Thiết kế / Sáng tạo' },
] as const
