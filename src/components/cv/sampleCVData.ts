import { emptyCV } from '../../types/cv'

export const createSampleCVData = (templateId: string) => ({
  ...emptyCV(templateId, { full_name: 'Nguyễn Văn An', email: 'nguyenvanan@example.com', phone: '0900 000 000', address: 'Hà Nội' }),
  title: 'CV Software Engineer',
  career_objective: 'Phát triển sản phẩm hữu ích với trải nghiệm rõ ràng và công nghệ đáng tin cậy.',
  experiences: [{ company_name: 'GJob', position: 'Software Engineer', is_current: true, description: 'Xây dựng các tính năng web hướng tới người dùng.' }],
  educations: [{ school_name: 'Đại học Công nghệ', degree: 'Kỹ sư Công nghệ thông tin', is_current: false }],
  skills: [{ name: 'React', level: 'ADVANCED' as const }, { name: 'TypeScript', level: 'ADVANCED' as const }, { name: 'FastAPI', level: 'INTERMEDIATE' as const }],
})
