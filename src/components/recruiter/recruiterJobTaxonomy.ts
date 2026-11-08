import type { JobUpdateRequest, RecruiterJob } from '../../types/job'
import type { JobTaxonomyIndustry, JobTaxonomyItem } from '../../types/jobTaxonomy'

export function positionsForIndustry(
  industries: JobTaxonomyIndustry[],
  industryId: string,
): JobTaxonomyItem[] {
  return industries.find((industry) => industry.id === industryId)?.positions ?? []
}

export function nextSelectionAfterIndustryChange(
  industries: JobTaxonomyIndustry[],
  industryId: string,
  currentPositionId: string,
): { industryGroupId: string; jobPositionId: string } {
  const positionStillValid = positionsForIndustry(industries, industryId)
    .some((position) => position.id === currentPositionId)

  return {
    industryGroupId: industryId,
    jobPositionId: positionStillValid ? currentPositionId : '',
  }
}

export function titleAfterPositionChange(
  currentTitle: string,
  selectedPosition: JobTaxonomyItem | undefined,
  replaceAutoSuggestedTitle = false,
): string {
  if (replaceAutoSuggestedTitle && selectedPosition) {
    return selectedPosition.display_name
  }
  return currentTitle.trim() || selectedPosition?.display_name || currentTitle
}

export function omitUnchangedTaxonomy(
  payload: JobUpdateRequest,
  original: Pick<RecruiterJob, 'industry_group_id' | 'job_position_id'>,
): JobUpdateRequest {
  const update = { ...payload }
  if (update.industry_group_id === original.industry_group_id) {
    delete update.industry_group_id
  }
  if (update.job_position_id === original.job_position_id) {
    delete update.job_position_id
  }
  return update
}

export function filterAllowedLevels(
  allLevels: readonly (readonly [string, string])[] | readonly (readonly string[])[],
  allowedLevels?: string[],
): [string, string][] {
  if (!allowedLevels || allowedLevels.length === 0) {
    return allLevels.map((item) => [item[0], item[1]])
  }
  const allowedSet = new Set(allowedLevels)
  return allLevels
    .filter((item) => allowedSet.has(item[0]))
    .map((item) => [item[0], item[1]])
}

export function nextLevelAfterPositionChange(
  selectedPosition: JobTaxonomyItem | undefined,
  currentLevel: string,
): string {
  if (!selectedPosition?.allowed_levels || selectedPosition.allowed_levels.length === 0) {
    return currentLevel
  }

  const allowed = selectedPosition.allowed_levels
  if (!currentLevel) {
    return selectedPosition.default_level ?? ''
  }

  if (allowed.some((lvl) => lvl === currentLevel)) {
    return currentLevel
  }

  return selectedPosition.default_level ?? ''
}
