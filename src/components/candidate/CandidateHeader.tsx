import { FileText, LayoutDashboard, Search, UserRound } from 'lucide-react'
import WorkspaceHeader from '../navigation/WorkspaceHeader'

const links = [
  { to: '/jobs', label: 'Tìm việc làm', icon: Search },
  { to: '/candidate', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/candidate/profile', label: 'Hồ sơ', icon: UserRound },
  { to: '/candidate/cvs', label: 'CV của tôi', icon: FileText },
]

export default function CandidateHeader() {
  return <WorkspaceHeader workspaceLabel="Khu vực ứng viên" workspaceHome="/candidate" navigationLabel="Điều hướng ứng viên" links={links} />
}
