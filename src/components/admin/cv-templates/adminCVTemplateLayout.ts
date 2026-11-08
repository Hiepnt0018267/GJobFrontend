import type { CVTemplateLayoutKey } from '../../../types/cv'

export const layoutOptions: Array<{ value: CVTemplateLayoutKey; label: string; description: string }> = [
  { value: 'SIMPLE_SINGLE_COLUMN', label: 'Simple Single Column', description: 'Một cột sáng, rõ ràng' },
  { value: 'PROFESSIONAL_SIDEBAR', label: 'Professional Sidebar', description: 'Thanh thông tin bên trái' },
  { value: 'PROFESSIONAL_CLEAN_RIGHT_SIDEBAR', label: 'Professional Clean Right Sidebar', description: 'Nội dung chính trái, thông tin phải' },
  { value: 'CREATIVE_DARK_COLUMNS', label: 'Creative Dark Columns', description: 'Tối, bất đối xứng, nổi bật' },
  { value: 'FIGMA_A4_PROFILE_TIMELINE', label: 'Figma A4 Profile Timeline', description: 'Header hồ sơ trang trí, timeline kinh nghiệm và hai cột' },
  { value: 'FIGMA_CLEAN_SIDEBAR', label: 'Figma Clean Sidebar', description: 'Sidebar ảnh và liên hệ, nội dung sạch bên phải' },
  { value: 'FIGMA_PURPLE_PROFILE', label: 'Figma Purple Profile', description: 'Hai cột tím hồng, hồ sơ nổi bật và nội dung sáng' },
  { value: 'FIGMA_MONOCHROME_PORTRAIT', label: 'Figma Monochrome Portrait', description: 'Chân dung dọc, nền đen trắng và nội dung nghề nghiệp hai cột' },
  { value: 'FIGMA_EDITORIAL_PORTRAIT', label: 'Figma Editorial Portrait', description: 'Tên dọc, ảnh chân dung và sidebar hồng nhạt phong cách biên tập' },
]
