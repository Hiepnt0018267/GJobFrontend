import { ArrowLeft, Check, FileText } from 'lucide-react'
import { Link } from 'react-router-dom'
import CandidateHeader from '../../components/candidate/CandidateHeader'
import CVPreview from '../../components/cv/CVPreview'
import { cvTemplateLabels, type CVTemplate, emptyCV } from '../../types/cv'

const templates: { key: CVTemplate; description: string }[] = [
  { key: 'modern', description: 'Sạch sẽ, có điểm nhấn nhẹ và phù hợp môi trường công nghệ, startup.' },
  { key: 'classic', description: 'Chuyên nghiệp, dựa trên typography, phù hợp môi trường doanh nghiệp.' },
  { key: 'minimal', description: 'Nhiều khoảng thở, tập trung hoàn toàn vào nội dung.' },
]
const sample = emptyCV({ full_name: 'Nguyễn Minh Anh', email: 'minhanh@example.com', phone: '0900 000 000' })
sample.title = 'CV Product Designer'; sample.career_objective = 'Tạo ra trải nghiệm rõ ràng và có ích cho người dùng.'; sample.skills = [{ name: 'Figma', level: 'ADVANCED' }, { name: 'Research', level: 'INTERMEDIATE' }]

export default function CandidateCVTemplatesPage() { return <div className="min-h-screen bg-slate-50"><CandidateHeader/><main className="mx-auto max-w-7xl px-4 py-8 sm:px-6"><Link to="/candidate/cvs" className="inline-flex items-center gap-1 text-sm font-semibold text-slate-600 hover:text-blue-700"><ArrowLeft size={16}/>CV của tôi</Link><h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-950">Chọn mẫu CV</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Mọi mẫu dùng cùng một dữ liệu CV. Bạn có thể xem trước nội dung trực tiếp trong editor.</p><div className="mt-8 grid gap-6 lg:grid-cols-3">{templates.map(({ key, description }) => <article key={key} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"><div className="h-80 overflow-hidden bg-slate-100 p-5"><CVPreview cv={sample} template={key} className="origin-top scale-[0.64] shadow-none" /></div><div className="p-5"><div className="flex items-center justify-between"><h2 className="font-bold text-slate-900">{cvTemplateLabels[key]}</h2>{key === 'modern' && <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700"><Check size={14}/>Đề xuất</span>}</div><p className="mt-2 min-h-12 text-sm leading-5 text-slate-600">{description}</p><Link to={`/candidate/cvs/create?template=${key}`} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"><FileText size={16}/>Chọn mẫu này</Link></div></article>)}</div></main></div> }
