import { LayoutDashboard } from 'lucide-react'
import WorkspaceHeader, { type WorkspaceNavigationItem } from '../navigation/WorkspaceHeader'

const adminLinks: WorkspaceNavigationItem[] = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
]

export default function AdminHeader() {
  return <WorkspaceHeader workspaceLabel="Khu vực quản trị" workspaceHome="/admin" navigationLabel="Điều hướng quản trị" links={adminLinks} />
}
