import { emptyCV, type CVCreateRequest } from '../../types/cv'

export const createNormalSampleCVData = (templateId = 'preview-template'): CVCreateRequest => ({
  ...emptyCV(templateId, {
    full_name: 'Minh Anh Nguyễn', email: 'minhanh@example.test', phone: '0900 000 000', address: 'Hà Nội',
    linkedin_url: 'https://example.test/minhanh', github_url: 'https://example.test/minhanh-code',
  }),
  title: 'Kỹ sư phần mềm',
  career_objective: 'Xây dựng sản phẩm số hữu ích với trải nghiệm rõ ràng, hiệu năng ổn định và chất lượng kỹ thuật có thể đo lường.',
  experiences: [
    { company_name: 'Công ty Sản phẩm Số', position: 'Kỹ sư phần mềm', start_date: '2023-01', is_current: true, description: 'Phát triển tính năng web, phối hợp cùng nhóm sản phẩm và cải thiện độ tin cậy của hệ thống.' },
    { company_name: 'Phòng thí nghiệm Công nghệ', position: 'Thực tập sinh', start_date: '2022-03', end_date: '2022-12', is_current: false, description: 'Xây dựng giao diện nội bộ và viết kiểm thử hồi quy.' },
  ],
  educations: [{ school_name: 'Đại học Công nghệ', degree: 'Kỹ sư', field_of_study: 'Công nghệ thông tin', start_date: '2018', end_date: '2022', is_current: false }],
  skills: [{ name: 'React', level: 'ADVANCED' }, { name: 'TypeScript', level: 'ADVANCED' }, { name: 'FastAPI', level: 'INTERMEDIATE' }],
  projects: [{ name: 'Nền tảng nghề nghiệp', role: 'Full-stack Developer', description: 'Thiết kế luồng tạo hồ sơ và tìm kiếm cơ hội phù hợp.', technologies: ['React', 'FastAPI', 'PostgreSQL'] }],
  certificates: [{ name: 'Cloud Fundamentals', organization: 'Example Institute', issue_date: '2024' }],
  languages: [{ name: 'Tiếng Việt', proficiency: 'NATIVE' }, { name: 'Tiếng Anh', proficiency: 'PROFESSIONAL' }],
})

export const createMinimalSampleCVData = (templateId = 'preview-template'): CVCreateRequest => ({
  ...emptyCV(templateId, { full_name: 'An Trần', email: 'an@example.test' }),
  title: 'CV tối giản',
  career_objective: 'Tìm kiếm môi trường làm việc chú trọng chất lượng sản phẩm.',
  experiences: [{ company_name: 'Studio Sản phẩm', position: 'Cộng tác viên', is_current: true, description: 'Hỗ trợ xây dựng giao diện.' }],
  skills: [{ name: 'Giao tiếp', level: null }],
})

export const createLongSampleCVData = (templateId = 'preview-template'): CVCreateRequest => {
  const normal = createNormalSampleCVData(templateId)
  const paragraph = 'Phân tích yêu cầu, triển khai giải pháp, đo lường kết quả và phối hợp liên phòng ban. Tài liệu hóa quyết định kỹ thuật để hệ thống dễ vận hành và mở rộng.'
  return {
    ...normal,
    career_objective: `${normal.career_objective} ${paragraph} ${paragraph}`,
    experiences: Array.from({ length: 7 }, (_, index) => ({ company_name: `Đơn vị công nghệ ${index + 1}`, position: index < 2 ? 'Kỹ sư phần mềm chính' : 'Kỹ sư phần mềm', start_date: `${2017 + index}`, end_date: index === 6 ? undefined : `${2018 + index}`, is_current: index === 6, description: `${paragraph}\n${paragraph}` })),
    skills: Array.from({ length: 18 }, (_, index) => ({ name: `Kỹ năng ${index + 1}`, level: index % 2 ? 'INTERMEDIATE' as const : 'ADVANCED' as const })),
    projects: Array.from({ length: 5 }, (_, index) => ({ name: `Dự án sản phẩm ${index + 1}`, role: 'Kỹ sư phát triển', description: paragraph, technologies: ['React', 'TypeScript', 'PostgreSQL'] })),
    certificates: Array.from({ length: 4 }, (_, index) => ({ name: `Chứng chỉ chuyên môn ${index + 1}`, organization: 'Example Institute', issue_date: `${2020 + index}` })),
  }
}

export const createSampleCVData = createNormalSampleCVData
