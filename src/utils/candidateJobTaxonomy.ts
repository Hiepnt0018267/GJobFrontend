import type { JobTaxonomyIndustry, JobTaxonomyItem } from '../types/jobTaxonomy'

export function positionsForIndustryGroup(
  industries: JobTaxonomyIndustry[],
  industryCode: string,
): JobTaxonomyItem[] {
  if (!industryCode) return []
  return industries.find((industry) => industry.code === industryCode)?.positions ?? []
}

export function allTaxonomyPositions(
  industries: JobTaxonomyIndustry[],
): JobTaxonomyItem[] {
  const seen = new Set<string>()
  const result: JobTaxonomyItem[] = []
  for (const industry of industries) {
    for (const pos of industry.positions) {
      if (!seen.has(pos.code)) {
        seen.add(pos.code)
        result.push(pos)
      }
    }
  }
  return result
}

export function nextTaxonomyOnIndustryChange(
  industries: JobTaxonomyIndustry[],
  nextIndustryCode: string,
  currentPositionCode: string,
): { industryGroup: string; jobPosition: string } {
  if (!nextIndustryCode) {
    return {
      industryGroup: '',
      jobPosition: '',
    }
  }

  const positions = positionsForIndustryGroup(industries, nextIndustryCode)
  const positionStillValid = positions.some(
    (position) => position.code === currentPositionCode,
  )

  return {
    industryGroup: nextIndustryCode,
    jobPosition: positionStillValid ? currentPositionCode : '',
  }
}

