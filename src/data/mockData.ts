import type { Job, Category, Company } from '../types/job'

export const MOCK_JOBS: Job[] = [
  {
    id: '1',
    title: 'Senior Frontend Developer',
    company: 'Tech Solutions VN',
    location: 'Hà Nội',
    salary: '25 - 40 triệu',
    type: 'Full-time',
  },
  {
    id: '2',
    title: 'Backend Engineer (Python)',
    company: 'DataCore Systems',
    location: 'Hồ Chí Minh',
    salary: '20 - 35 triệu',
    type: 'Full-time',
  },
  {
    id: '3',
    title: 'Product Designer',
    company: 'Creative Studio',
    location: 'Đà Nẵng',
    salary: '15 - 25 triệu',
    type: 'Full-time',
  },
  {
    id: '4',
    title: 'React Native Engineer',
    company: 'MobileFirst',
    location: 'Remote',
    salary: '1.200$ - 2.000$',
    type: 'Full-time',
  },
  {
    id: '5',
    title: 'Digital Marketing Manager',
    company: 'GrowthLab',
    location: 'Hà Nội',
    salary: '18 - 28 triệu',
    type: 'Full-time',
  },
  {
    id: '6',
    title: 'DevOps / Cloud Engineer',
    company: 'InfraCloud VN',
    location: 'Hồ Chí Minh',
    salary: '30 - 50 triệu',
    type: 'Full-time',
  },
]

export const MOCK_CATEGORIES: Category[] = [
  { id: 'c1', name: 'Công nghệ thông tin', icon: 'Code2', jobCount: 1240 },
  { id: 'c2', name: 'Marketing', icon: 'Megaphone', jobCount: 358 },
  { id: 'c3', name: 'Kinh doanh', icon: 'Briefcase', jobCount: 512 },
  { id: 'c4', name: 'Thiết kế', icon: 'Palette', jobCount: 204 },
  { id: 'c5', name: 'Tài chính', icon: 'TrendingUp', jobCount: 289 },
  { id: 'c6', name: 'Nhân sự', icon: 'Users', jobCount: 176 },
  { id: 'c7', name: 'Kỹ thuật', icon: 'Wrench', jobCount: 433 },
  { id: 'c8', name: 'Logistics', icon: 'Truck', jobCount: 145 },
]

export const MOCK_COMPANIES: Company[] = [
  { id: 'co1', name: 'Tech Solutions VN', location: 'Hà Nội', jobCount: 24, initial: 'T' },
  { id: 'co2', name: 'DataCore Systems', location: 'Hồ Chí Minh', jobCount: 12, initial: 'D' },
  { id: 'co3', name: 'Creative Studio', location: 'Đà Nẵng', jobCount: 8, initial: 'C' },
  { id: 'co4', name: 'MobileFirst', location: 'Remote', jobCount: 31, initial: 'M' },
  { id: 'co5', name: 'GrowthLab', location: 'Hà Nội', jobCount: 7, initial: 'G' },
  { id: 'co6', name: 'InfraCloud VN', location: 'Hồ Chí Minh', jobCount: 16, initial: 'I' },
]
