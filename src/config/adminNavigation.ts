import { BriefcaseBusiness, ClipboardList, FileText, LayoutDashboard, PanelsTopLeft, UsersRound, type LucideIcon } from 'lucide-react'

export type AdminNavigationItem = {
  label: string
  to: string
  icon: LucideIcon
  isActive: (pathname: string) => boolean
}

export type AdminNavigationGroup = {
  label: string
  items: AdminNavigationItem[]
}

const exact = (path: string) => (pathname: string) => pathname === path
const within = (path: string) => (pathname: string) => pathname === path || pathname.startsWith(`${path}/`)

export const adminNavigationGroups: AdminNavigationGroup[] = [
  { label: 'Tổng quan', items: [{ label: 'Tổng quan', to: '/admin', icon: LayoutDashboard, isActive: exact('/admin') }] },
  {
    label: 'Tuyển dụng',
    items: [
      { label: 'Tin tuyển dụng', to: '/admin/jobs', icon: BriefcaseBusiness, isActive: within('/admin/jobs') },
      { label: 'Đơn ứng tuyển', to: '/admin/applications', icon: ClipboardList, isActive: within('/admin/applications') },
    ],
  },
  {
    label: 'Người dùng',
    items: [
      { label: 'Người dùng', to: '/admin/users', icon: UsersRound, isActive: within('/admin/users') },
      { label: 'CV ứng viên', to: '/admin/cvs', icon: FileText, isActive: within('/admin/cvs') },
    ],
  },
  { label: 'Nội dung', items: [{ label: 'Mẫu CV', to: '/admin/cv-templates', icon: PanelsTopLeft, isActive: within('/admin/cv-templates') }] },
]

export type AdminPageMeta = { title: string; context: string }

const pageMeta: Array<{ matches: (pathname: string) => boolean; meta: AdminPageMeta }> = [
  { matches: exact('/admin'), meta: { title: 'Tổng quan hệ thống', context: 'Quản trị GJob' } },
  { matches: exact('/admin/jobs'), meta: { title: 'Tin tuyển dụng', context: 'Tuyển dụng' } },
  { matches: within('/admin/jobs'), meta: { title: 'Chi tiết tin tuyển dụng', context: 'Tuyển dụng' } },
  { matches: exact('/admin/applications'), meta: { title: 'Đơn ứng tuyển', context: 'Tuyển dụng' } },
  { matches: within('/admin/applications'), meta: { title: 'Chi tiết đơn ứng tuyển', context: 'Tuyển dụng' } },
  { matches: exact('/admin/users'), meta: { title: 'Người dùng', context: 'Người dùng' } },
  { matches: within('/admin/users'), meta: { title: 'Chi tiết người dùng', context: 'Người dùng' } },
  { matches: exact('/admin/cvs'), meta: { title: 'CV ứng viên', context: 'Người dùng' } },
  { matches: within('/admin/cvs'), meta: { title: 'Chi tiết CV ứng viên', context: 'Người dùng' } },
  { matches: exact('/admin/cv-templates/new'), meta: { title: 'Thêm mẫu CV', context: 'Nội dung' } },
  { matches: (pathname) => /^\/admin\/cv-templates\/[^/]+\/edit$/.test(pathname), meta: { title: 'Chỉnh sửa mẫu CV', context: 'Nội dung' } },
  { matches: exact('/admin/cv-templates'), meta: { title: 'Mẫu CV', context: 'Nội dung' } },
  { matches: within('/admin/cv-templates'), meta: { title: 'Chi tiết mẫu CV', context: 'Nội dung' } },
]

export function getAdminPageMeta(pathname: string): AdminPageMeta {
  return pageMeta.find(({ matches }) => matches(pathname))?.meta ?? { title: 'Quản trị GJob', context: 'Quản trị GJob' }
}
