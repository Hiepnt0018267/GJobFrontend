import type { CSSProperties } from 'react'
import rendererDefaults from '../../contracts/cvRendererDefaults.json'
import type { CVCandidatePresentationOverrides, CVFontFamily, CVFontScale, CVHeadingStyle, CVLineSpacing, CVSectionSpacing, CVSectionVisibility, CVTemplateLayoutKey, CVTemplateThemeConfig } from '../../types/cv'

const normalizeHexColor = (value: string | null | undefined): string | null => {
  if (!value || !/^#(?:[0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(value)) return null
  const normalized = value.toUpperCase()
  return normalized.length === 4 ? `#${[...normalized.slice(1)].map((character) => character.repeat(2)).join('')}` : normalized
}

export const CV_THEME_OPTIONS = {
  fontFamilies: [
    { value: 'INTER', label: 'Inter' },
    { value: 'ROBOTO', label: 'Roboto' },
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
  lineSpacings: [
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

export const CV_DEFAULT_THEMES = rendererDefaults as Record<CVTemplateLayoutKey, CVTemplateThemeConfig>

const fontStacks: Record<CVFontFamily, string> = {
  INTER: 'Inter, system-ui, sans-serif',
  ROBOTO: 'Roboto, Arial, sans-serif',
  ARIAL: 'Arial, Helvetica, sans-serif',
  TIMES_NEW_ROMAN: '"Times New Roman", Times, serif',
}
const fontSizes: Record<CVFontScale, string> = { SMALL: '0.8125rem', NORMAL: '0.875rem', LARGE: '0.9375rem' }
const lineHeights: Record<CVLineSpacing, number> = { COMPACT: 1.35, NORMAL: 1.55, RELAXED: 1.8 }
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
  sectionVisibility: CVSectionVisibility
}

const includes = <T extends string>(values: readonly T[], value: unknown): value is T => typeof value === 'string' && values.includes(value as T)

export function resolveCVPresentation(layoutKey: CVTemplateLayoutKey, themeConfig?: Partial<CVTemplateThemeConfig> | null, candidateOverrides?: CVCandidatePresentationOverrides | null): ResolvedCVTheme {
  const fallback = CV_DEFAULT_THEMES[layoutKey]
  const primaryCandidate = candidateOverrides?.primary_color ?? themeConfig?.primary_color
  const secondaryCandidate = candidateOverrides?.secondary_color ?? themeConfig?.secondary_color
  const primaryColor = normalizeHexColor(primaryCandidate) ?? fallback.primary_color
  const secondaryColor = normalizeHexColor(secondaryCandidate) ?? fallback.secondary_color
  const fontCandidate = candidateOverrides?.font_family ?? themeConfig?.font_family
  const scaleCandidate = candidateOverrides?.font_scale ?? themeConfig?.font_scale
  const sectionSpacingCandidate = candidateOverrides?.section_spacing ?? themeConfig?.section_spacing
  const lineSpacingCandidate = candidateOverrides?.line_spacing ?? themeConfig?.line_spacing
  const headingCandidate = candidateOverrides?.heading_style ?? themeConfig?.heading_style
  const fontFamily = includes(CV_THEME_OPTIONS.fontFamilies.map((item) => item.value), fontCandidate) ? fontCandidate : fallback.font_family
  const fontScale = includes(CV_THEME_OPTIONS.fontScales.map((item) => item.value), scaleCandidate) ? scaleCandidate : fallback.font_scale
  const sectionSpacing = includes(CV_THEME_OPTIONS.sectionSpacings.map((item) => item.value), sectionSpacingCandidate) ? sectionSpacingCandidate : fallback.section_spacing
  const lineSpacing = includes(CV_THEME_OPTIONS.lineSpacings.map((item) => item.value), lineSpacingCandidate) ? lineSpacingCandidate : fallback.line_spacing
  const headingStyle = includes(CV_THEME_OPTIONS.headingStyles.map((item) => item.value), headingCandidate) ? headingCandidate : fallback.heading_style
  const sectionVisibility = { ...fallback.default_section_visibility, ...themeConfig?.default_section_visibility, ...candidateOverrides?.section_visibility }
  return { primary_color: primaryColor, secondary_color: secondaryColor, font_family: fontFamily, font_scale: fontScale, section_spacing: sectionSpacing, line_spacing: lineSpacing, heading_style: headingStyle, default_section_visibility: { ...fallback.default_section_visibility, ...themeConfig?.default_section_visibility }, sectionVisibility, fontStyle: { fontFamily: fontStacks[fontFamily], fontSize: fontSizes[fontScale], lineHeight: lineHeights[lineSpacing] }, sectionSpacingClass: sectionSpacingClasses[sectionSpacing], headingClass: headingClasses[headingStyle] }
}

export const resolveCVTheme = resolveCVPresentation
