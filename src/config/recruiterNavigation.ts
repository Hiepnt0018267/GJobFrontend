import { BriefcaseBusiness, Building2, LayoutDashboard, type LucideIcon } from 'lucide-react'

export type RecruiterNavigationItem = {
  label: string
  to: string
  icon: LucideIcon
  isActive: (pathname: string) => boolean
}

export type RecruiterNavigationGroup = {
  label: string
  items: RecruiterNavigationItem[]
}

const exact = (path: string) => (pathname: string) => pathname === path
const within = (path: string) => (pathname: string) => pathname === path || pathname.startsWith(`${path}/`)

export const recruiterNavigationGroups: RecruiterNavigationGroup[] = [
  { label: 'Tổng quan', items: [{ label: 'Tổng quan', to: '/recruiter', icon: LayoutDashboard, isActive: exact('/recruiter') }] },
  { label: 'Tuyển dụng', items: [{ label: 'Tin tuyển dụng', to: '/recruiter/jobs', icon: BriefcaseBusiness, isActive: within('/recruiter/jobs') }] },
  { label: 'Doanh nghiệp', items: [{ label: 'Hồ sơ công ty', to: '/recruiter/profile', icon: Building2, isActive: within('/recruiter/profile') }] },
]

export type RecruiterPageMeta = { title: string; context: string }

const pageMeta: Array<{ matches: (pathname: string) => boolean; meta: RecruiterPageMeta }> = [
  { matches: exact('/recruiter'), meta: { title: 'Tổng quan', context: 'Khu vực nhà tuyển dụng' } },
  { matches: exact('/recruiter/jobs/create'), meta: { title: 'Đăng tin tuyển dụng', context: 'Tuyển dụng' } },
  { matches: (pathname) => /^\/recruiter\/jobs\/[^/]+\/edit$/.test(pathname), meta: { title: 'Chỉnh sửa tin tuyển dụng', context: 'Tuyển dụng' } },
  { matches: exact('/recruiter/jobs'), meta: { title: 'Tin tuyển dụng', context: 'Tuyển dụng' } },
  { matches: within('/recruiter/jobs'), meta: { title: 'Chi tiết tin tuyển dụng', context: 'Tuyển dụng' } },
  { matches: exact('/recruiter/profile/edit'), meta: { title: 'Cập nhật hồ sơ công ty', context: 'Doanh nghiệp' } },
  { matches: within('/recruiter/profile'), meta: { title: 'Hồ sơ công ty', context: 'Doanh nghiệp' } },
]

export function getRecruiterPageMeta(pathname: string): RecruiterPageMeta {
  return pageMeta.find(({ matches }) => matches(pathname))?.meta ?? { title: 'Khu vực nhà tuyển dụng', context: 'GJob' }
}
