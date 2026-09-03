import { BriefcaseBusiness, ClipboardList, FileText, LayoutDashboard, PanelsTopLeft, UsersRound } from 'lucide-react'
import WorkspaceHeader, { type WorkspaceNavigationItem } from '../navigation/WorkspaceHeader'
import { useWorkspaceShell } from '../../layouts/workspaceShellContext'

const adminLinks: WorkspaceNavigationItem[] = [
  { to: '/admin', label: 'Tổng quan', icon: LayoutDashboard, end: true },
  { to: '/admin/jobs', label: 'Tin tuyển dụng', icon: BriefcaseBusiness },
  { to: '/admin/users', label: 'Người dùng', icon: UsersRound },
  { to: '/admin/cv-templates', label: 'Mẫu CV', icon: PanelsTopLeft },
  { to: '/admin/applications', label: 'Đơn ứng tuyển', icon: ClipboardList },
  { to: '/admin/cvs', label: 'CV ứng viên', icon: FileText },
]

export default function AdminHeader() {
  if (useWorkspaceShell()) return null
  return <WorkspaceHeader workspaceLabel="Khu vực quản trị" workspaceHome="/admin" navigationLabel="Điều hướng quản trị" links={adminLinks} />
}
