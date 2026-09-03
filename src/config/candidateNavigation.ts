import { BriefcaseBusiness, FilePlus2, FileText, type LucideIcon } from 'lucide-react'

export type CandidateNavigationItem = {
  to: string
  label: string
  description: string
  icon: LucideIcon
}

export type CandidateNavigationGroup = {
  label: string
  items: CandidateNavigationItem[]
}

export const candidateNavigationGroups: CandidateNavigationGroup[] = [
  {
    label: 'Việc làm',
    items: [
      {
        to: '/jobs',
        label: 'Tìm việc làm',
        description: 'Khám phá các vị trí đang tuyển',
        icon: BriefcaseBusiness,
      },
      {
        to: '/candidate/applications',
        label: 'Việc làm đã ứng tuyển',
        description: 'Theo dõi từng đơn ứng tuyển',
        icon: FileText,
      },
    ],
  },
  {
    label: 'Tạo CV',
    items: [
      {
        to: '/candidate/cvs/templates',
        label: 'Tạo CV mới',
        description: 'Chọn mẫu và bắt đầu chỉnh sửa',
        icon: FilePlus2,
      },
      {
        to: '/candidate/cvs',
        label: 'CV của tôi',
        description: 'Quản lý các CV đã tạo',
        icon: FileText,
      },
    ],
  },
]

export const candidateAccountItems: CandidateNavigationItem[] = [
  {
    to: '/candidate/profile',
    label: 'Hồ sơ cá nhân',
    description: 'Cập nhật thông tin của bạn',
    icon: FileText,
  },
  {
    to: '/candidate/cvs',
    label: 'CV của tôi',
    description: 'Quản lý CV đã tạo',
    icon: FileText,
  },
  {
    to: '/candidate/applications',
    label: 'Đơn ứng tuyển',
    description: 'Theo dõi tiến trình ứng tuyển',
    icon: BriefcaseBusiness,
  },
]
