import type { CVCreateRequest, CVTemplateExperienceLevel } from '../../types/cv'

export function deriveRecommendationContext(data: CVCreateRequest) {
  const total = data.experiences.length + data.projects.length + data.skills.length
  const content_density = total <= 5 ? 'SHORT' : total <= 15 ? 'NORMAL' : 'LONG'
  let experience_level: CVTemplateExperienceLevel
  if (data.experiences.length >= 2) experience_level = 'EXPERIENCED'
  else if (data.experiences.length === 1) experience_level = 'JUNIOR'
  else if (data.projects.length || data.skills.length) experience_level = 'FRESHER'
  else experience_level = 'STUDENT'
  return { experience_count: data.experiences.length, project_count: data.projects.length, skill_count: data.skills.length, content_density, experience_level } as const
}
