import type { EmploymentType, ExperienceLevel, Industry, Job, JobLevel, WorkMode } from '../types/job'

const employmentLabels: Record<EmploymentType, string> = { FULL_TIME: 'Toàn thời gian', PART_TIME: 'Bán thời gian', CONTRACT: 'Hợp đồng', INTERNSHIP: 'Thực tập', FREELANCE: 'Tự do' }
const experienceLabels: Record<ExperienceLevel, string> = { ENTRY: 'Mới bắt đầu', MID: 'Trung cấp', SENIOR: 'Cao cấp', LEAD: 'Trưởng nhóm', MANAGER: 'Quản lý' }
const industryLabels: Record<Industry, string> = { INFORMATION_TECHNOLOGY: 'Công nghệ thông tin', FINANCE_BANKING: 'Tài chính – Ngân hàng', MARKETING_ADVERTISING: 'Marketing – Quảng cáo', SALES: 'Kinh doanh – Bán hàng', HUMAN_RESOURCES: 'Nhân sự', EDUCATION: 'Giáo dục', HEALTHCARE: 'Y tế', MANUFACTURING: 'Sản xuất', LOGISTICS: 'Logistics', OTHER: 'Khác' }
const levelLabels: Record<JobLevel, string> = { INTERN: 'Thực tập sinh', JUNIOR: 'Junior', STAFF: 'Nhân viên', SENIOR: 'Senior', LEAD: 'Lead', MANAGER: 'Quản lý' }
const workModeLabels: Record<WorkMode, string> = { ONSITE: 'Tại văn phòng', HYBRID: 'Hybrid', REMOTE: 'Từ xa' }
export const employmentLabel = (value: EmploymentType | null) => value ? employmentLabels[value] : 'Không xác định'
export const experienceLabel = (value: ExperienceLevel | null) => value ? experienceLabels[value] : 'Không yêu cầu'
export const industryLabel = (value: Industry | null) => value ? industryLabels[value] : 'Chưa phân loại'
export const levelLabel = (value: JobLevel | null) => value ? levelLabels[value] : 'Không yêu cầu'
export const workModeLabel = (value: WorkMode | null) => value ? workModeLabels[value] : 'Chưa xác định'
export function formatSalary(job: Job): string { const formatter = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: job.salary_currency || 'VND', maximumFractionDigits: 0 }); if (job.salary_type === 'FIXED' && job.salary_fixed !== null) return formatter.format(job.salary_fixed); if (job.salary_type === 'NEGOTIABLE' || (job.salary_min === null && job.salary_max === null)) return 'Thỏa thuận'; if (job.salary_min === null) return `Tối đa ${formatter.format(job.salary_max ?? 0)}`; if (job.salary_max === null) return `Từ ${formatter.format(job.salary_min)}`; return `${formatter.format(job.salary_min)} – ${formatter.format(job.salary_max)}` }
export function postedDate(date: string): string { const days = Math.floor((Date.now() - new Date(date).getTime()) / 86_400_000); return days <= 0 ? 'Đăng hôm nay' : days === 1 ? 'Đăng hôm qua' : `Đăng ${days} ngày trước` }
