import {
  BadgeCheck,
  Bookmark,
  Building2,
  BriefcaseBusiness,
  Calculator,
  Code2,
  FilePlus2,
  FileText,
  ListOrdered,
  Megaphone,
  Settings,
  Sparkles,
  Upload,
  type LucideIcon,
} from 'lucide-react'

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
      {
        to: '/candidate/saved?tab=jobs',
        label: 'Việc làm đã lưu',
        description: 'Xem lại các cơ hội đang quan tâm',
        icon: Bookmark,
      },
    ],
  },
  {
    label: 'Tạo CV',
    items: [
      {
        to: '/candidate/cvs/templates/styles?style=SIMPLE',
        label: 'Mẫu CV đơn giản',
        description: 'Bố cục rõ ràng, dễ đọc',
        icon: FilePlus2,
      },
      {
        to: '/candidate/cvs/templates/styles?style=IMPRESSIVE',
        label: 'Mẫu CV ấn tượng',
        description: 'Thiết kế nổi bật và sáng tạo',
        icon: Sparkles,
      },
      {
        to: '/candidate/cvs/templates/styles?style=PROFESSIONAL',
        label: 'Mẫu CV chuyên nghiệp',
        description: 'Phù hợp môi trường chuyên nghiệp',
        icon: BadgeCheck,
      },
      {
        to: '/candidate/cvs',
        label: 'CV của tôi',
        description: 'Quản lý các CV đã tạo',
        icon: FileText,
      },
      {
        to: '/candidate/cvs?upload=1',
        label: 'Tải CV lên',
        description: 'Thêm CV PDF hoặc DOCX có sẵn',
        icon: Upload,
      },
    ],
  },
]

export const candidateCVStyleItems: CandidateNavigationItem[] = candidateNavigationGroups[1].items.slice(0, 3)

export const candidateCVPositionItems: CandidateNavigationItem[] = [
  {
    to: '/candidate/cvs/templates/positions?job_position=SALES_EXECUTIVE',
    label: 'Nhân viên kinh doanh',
    description: 'Mẫu CV dành cho Sales',
    icon: BriefcaseBusiness,
  },
  {
    to: '/candidate/cvs/templates/positions?job_position=BACKEND_DEVELOPER',
    label: 'Lập trình viên Backend',
    description: 'Mẫu CV dành cho công nghệ',
    icon: Code2,
  },
  {
    to: '/candidate/cvs/templates/positions?job_position=ACCOUNTANT',
    label: 'Kế toán viên',
    description: 'Mẫu CV dành cho kế toán',
    icon: Calculator,
  },
  {
    to: '/candidate/cvs/templates/positions?job_position=DIGITAL_MARKETING',
    label: 'Digital Marketing',
    description: 'Mẫu CV dành cho marketing',
    icon: Megaphone,
  },
]

export const candidateCVActionItems: CandidateNavigationItem[] = [
  candidateNavigationGroups[1].items[3],
  candidateNavigationGroups[1].items[4],
]

export const candidateToolsGroup: CandidateNavigationGroup = {
  label: 'Công cụ',
  items: [
    {
      to: '/candidate/job-recommendations',
      label: 'Gợi ý việc làm theo CV',
      description: 'Khám phá việc làm liên quan dựa trên CV đang dùng',
      icon: ListOrdered,
    },
  ],
}

export const candidateAccountItems: CandidateNavigationItem[] = [
  {
    to: '/candidate/settings',
    label: 'Cài đặt bảo mật',
    description: 'Đổi mật khẩu và bảo vệ tài khoản',
    icon: Settings,
  },
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
  {
    to: '/candidate/saved?tab=jobs',
    label: 'Việc làm đã lưu',
    description: 'Xem các vị trí bạn đã lưu',
    icon: Bookmark,
  },
  {
    to: '/candidate/saved?tab=companies',
    label: 'Công ty đang theo dõi',
    description: 'Xem các công ty bạn quan tâm',
    icon: Building2,
  },
]
