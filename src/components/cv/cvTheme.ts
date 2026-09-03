import type { CSSProperties } from 'react'
import type { CVFontFamily, CVFontScale, CVHeadingStyle, CVSectionSpacing, CVTemplateLayoutKey, CVTemplateThemeConfig } from '../../types/cv'

const hexColor = /^#[0-9A-Fa-f]{6}$/

export const CV_THEME_OPTIONS = {
  fontFamilies: [
    { value: 'INTER', label: 'Inter' },
    { value: 'ARIAL', label: 'Arial' },
    { value: 'TIMES_NEW_ROMAN', label: 'Times New Roman' },
  ] as const,
  fontScales: [
    { value: 'SMALL', label: 'Nhỏ' },
    { value: 'NORMAL', label: 'Tiêu chuẩn' },
    { value: 'LARGE', label: 'Lớn' },
  ] as const,
  sectionSpacings: [
    { value: 'COMPACT', label: 'Gọn' },
    { value: 'NORMAL', label: 'Tiêu chuẩn' },
    { value: 'RELAXED', label: 'Thoáng' },
  ] as const,
  headingStyles: [
    { value: 'SOLID', label: 'Nét đậm' },
    { value: 'UNDERLINE', label: 'Gạch chân' },
    { value: 'MINIMAL', label: 'Tối giản' },
  ] as const,
}

export const CV_DEFAULT_THEMES: Record<CVTemplateLayoutKey, CVTemplateThemeConfig> = {
  MODERN: { primary_color: '#2563EB', font_family: 'INTER', font_scale: 'NORMAL', section_spacing: 'NORMAL', heading_style: 'SOLID' },
  CLASSIC: { primary_color: '#0F172A', font_family: 'INTER', font_scale: 'NORMAL', section_spacing: 'NORMAL', heading_style: 'UNDERLINE' },
  MINIMAL: { primary_color: '#334155', font_family: 'INTER', font_scale: 'NORMAL', section_spacing: 'COMPACT', heading_style: 'MINIMAL' },
}

const fontStacks: Record<CVFontFamily, string> = {
  INTER: 'Inter, system-ui, sans-serif',
  ARIAL: 'Arial, Helvetica, sans-serif',
  TIMES_NEW_ROMAN: '"Times New Roman", Times, serif',
}
const fontSizes: Record<CVFontScale, string> = { SMALL: '0.8125rem', NORMAL: '0.875rem', LARGE: '0.9375rem' }
const sectionSpacingClasses: Record<CVSectionSpacing, string> = { COMPACT: 'mt-5', NORMAL: 'mt-7', RELAXED: 'mt-9' }
const headingClasses: Record<CVHeadingStyle, string> = {
  SOLID: 'border-b-2 pb-1.5',
  UNDERLINE: 'border-b pb-1.5',
  MINIMAL: 'border-b border-slate-200 pb-1',
}

export type ResolvedCVTheme = CVTemplateThemeConfig & {
  fontStyle: CSSProperties
  sectionSpacingClass: string
  headingClass: string
}

const includes = <T extends string>(values: readonly T[], value: unknown): value is T => typeof value === 'string' && values.includes(value as T)

export function resolveCVTheme(layoutKey: CVTemplateLayoutKey, themeConfig?: Partial<CVTemplateThemeConfig> | null): ResolvedCVTheme {
  const fallback = CV_DEFAULT_THEMES[layoutKey]
  const primaryColor = themeConfig?.primary_color && hexColor.test(themeConfig.primary_color) ? themeConfig.primary_color.toUpperCase() : fallback.primary_color
  const fontFamily = includes(CV_THEME_OPTIONS.fontFamilies.map((item) => item.value), themeConfig?.font_family) ? themeConfig.font_family : fallback.font_family
  const fontScale = includes(CV_THEME_OPTIONS.fontScales.map((item) => item.value), themeConfig?.font_scale) ? themeConfig.font_scale : fallback.font_scale
  const sectionSpacing = includes(CV_THEME_OPTIONS.sectionSpacings.map((item) => item.value), themeConfig?.section_spacing) ? themeConfig.section_spacing : fallback.section_spacing
  const headingStyle = includes(CV_THEME_OPTIONS.headingStyles.map((item) => item.value), themeConfig?.heading_style) ? themeConfig.heading_style : fallback.heading_style
  return { primary_color: primaryColor, font_family: fontFamily, font_scale: fontScale, section_spacing: sectionSpacing, heading_style: headingStyle, fontStyle: { fontFamily: fontStacks[fontFamily], fontSize: fontSizes[fontScale] }, sectionSpacingClass: sectionSpacingClasses[sectionSpacing], headingClass: headingClasses[headingStyle] }
}
