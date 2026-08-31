import { BriefcaseBusiness, LayoutDashboard, UserRound } from 'lucide-react'
import WorkspaceHeader from '../navigation/WorkspaceHeader'

const links = [
  { to: '/recruiter', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/recruiter/profile', label: 'Hồ sơ', icon: UserRound },
  { to: '/recruiter/jobs', label: 'Tin tuyển dụng', icon: BriefcaseBusiness },
]

export default function RecruiterHeader() {
  return <WorkspaceHeader workspaceLabel="Khu vực nhà tuyển dụng" workspaceHome="/recruiter" navigationLabel="Điều hướng nhà tuyển dụng" links={links} />
}
