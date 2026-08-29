import type { EmploymentType, ExperienceLevel, Job } from '../types/job'

const employmentLabels: Record<EmploymentType, string> = { FULL_TIME: 'Toàn thời gian', PART_TIME: 'Bán thời gian', CONTRACT: 'Hợp đồng', INTERNSHIP: 'Thực tập', FREELANCE: 'Tự do' }
const experienceLabels: Record<ExperienceLevel, string> = { ENTRY: 'Mới bắt đầu', MID: 'Trung cấp', SENIOR: 'Cao cấp', LEAD: 'Trưởng nhóm', MANAGER: 'Quản lý' }
export const employmentLabel = (value: EmploymentType | null) => value ? employmentLabels[value] : 'Không xác định'
export const experienceLabel = (value: ExperienceLevel | null) => value ? experienceLabels[value] : 'Không yêu cầu'
export function formatSalary(job: Job): string { const formatter = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }); if (job.salary_min === null && job.salary_max === null) return 'Thỏa thuận'; if (job.salary_min === null) return `Tối đa ${formatter.format(job.salary_max ?? 0)}`; if (job.salary_max === null) return `Từ ${formatter.format(job.salary_min)}`; return `${formatter.format(job.salary_min)} – ${formatter.format(job.salary_max)}` }
export function postedDate(date: string): string { const days = Math.floor((Date.now() - new Date(date).getTime()) / 86_400_000); return days <= 0 ? 'Đăng hôm nay' : days === 1 ? 'Đăng hôm qua' : `Đăng ${days} ngày trước` }
