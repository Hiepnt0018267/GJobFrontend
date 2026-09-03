import { employmentLabel, experienceRequirementLabel, industryLabel, levelLabel, workModeLabel } from '../utils/jobDisplay'
import type { JobSortOption } from '../types/job'

export const SALARY_FILTER_VALUES = ['', '0-10000000', '10000000-20000000', '20000000-30000000', '30000000-50000000', '50000000-', 'NEGOTIABLE'] as const
export type SalaryFilter = (typeof SALARY_FILTER_VALUES)[number]

export const salaryFilterOptions: Array<{ value: SalaryFilter; label: string }> = [{ value: '', label: 'Tất cả mức lương' }, { value: '0-10000000', label: 'Dưới 10 triệu' }, { value: '10000000-20000000', label: '10 – 20 triệu' }, { value: '20000000-30000000', label: '20 – 30 triệu' }, { value: '30000000-50000000', label: '30 – 50 triệu' }, { value: '50000000-', label: 'Trên 50 triệu' }, { value: 'NEGOTIABLE', label: 'Thỏa thuận' }]
export const jobSortLabels: Record<JobSortOption, string> = { newest: 'Mới đăng', oldest: 'Cũ nhất', salary_high: 'Lương cao nhất', salary_low: 'Lương thấp nhất' }
export const salaryFilterLabel = (value: SalaryFilter) => salaryFilterOptions.find((option) => option.value === value)?.label ?? 'Tất cả mức lương'
export const jobFilterLabel = { employmentType: employmentLabel, industry: industryLabel, experienceRequirement: experienceRequirementLabel, level: levelLabel, workMode: workModeLabel, salary: salaryFilterLabel, sort: (value: JobSortOption) => jobSortLabels[value] }
