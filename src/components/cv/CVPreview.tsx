import { useState } from 'react'
import type { CVCreateRequest, CVTemplate } from '../../types/cv'

type Props = { cv: CVCreateRequest; className?: string; template?: CVTemplate }

const title = (value: string) => <h2 className="mt-6 border-b border-slate-200 pb-1.5 text-xs font-bold tracking-[0.08em] text-slate-700">{value}</h2>

function Avatar({ url, name, template }: { url?: string | null; name?: string | null; template: CVTemplate }) {
  const [failed, setFailed] = useState(false)
  if (!url || failed) return null
  return <img src={url} alt={`Ảnh chân dung của ${name || 'ứng viên'}`} onError={() => setFailed(true)} className={`h-20 w-16 shrink-0 object-cover ${template === 'modern' ? 'rounded-lg' : 'rounded-sm'}`} />
}

export default function CVPreview({ cv, className = '', template = 'modern' }: Props) {
  const info = cv.personal_info
  const contacts = [info.email, info.phone, info.address].filter(Boolean)
  const appearance = 'font-sans'
  const header = template === 'classic' ? 'border-b border-slate-900 pb-5 text-center' : template === 'minimal' ? 'pb-5' : 'border-b-2 border-blue-600 pb-5'
  const heading = template === 'modern' ? 'text-blue-700' : 'text-slate-700'
  return <article className={`bg-white p-6 text-sm text-slate-700 shadow-sm ring-1 ring-slate-200 sm:p-8 ${appearance} ${className}`}>
    <header className={header}>
      <div className={`flex gap-4 ${template === 'classic' ? 'flex-col items-center' : 'items-start'}`}>
        <Avatar url={info.avatar_url} name={info.full_name} template={template} />
        <div className={template === 'classic' ? '' : 'min-w-0'}>
          <h1 className="text-2xl font-bold tracking-tight text-slate-950">{info.full_name || 'Họ và tên'}</h1>
          <p className="mt-2 text-xs text-slate-500">{contacts.join(' · ')}</p>
          <div className={`mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs ${template === 'modern' ? 'text-blue-700' : 'text-slate-600'}`}>{[info.linkedin_url, info.github_url, info.portfolio_url].filter(Boolean).map((url) => <span key={url} className="break-all">{url}</span>)}</div>
        </div>
      </div>
    </header>
    {cv.career_objective && <><h2 className={`mt-6 border-b border-slate-200 pb-1.5 text-xs font-bold tracking-[0.08em] ${heading}`}>MỤC TIÊU NGHỀ NGHIỆP</h2><p className="mt-3 whitespace-pre-wrap leading-6">{cv.career_objective}</p></>}
    {cv.experiences.length > 0 && <><>{title('KINH NGHIỆM')}</>{cv.experiences.map((item, i) => <div key={`${item.company_name}-${i}`} className="mt-3"><div className="flex justify-between gap-3"><strong>{item.position}</strong><span className="text-xs text-slate-500">{item.start_date || ''}{item.start_date && (item.end_date || item.is_current) ? ' – ' : ''}{item.is_current ? 'Hiện tại' : item.end_date || ''}</span></div><p className="text-xs font-medium text-blue-700">{item.company_name}</p>{item.description && <p className="mt-1 whitespace-pre-wrap text-xs leading-5">{item.description}</p>}</div>)}</>}
    {cv.educations.length > 0 && <><>{title('HỌC VẤN')}</>{cv.educations.map((item, i) => <div key={`${item.school_name}-${i}`} className="mt-3"><strong>{item.school_name}</strong><p className="text-xs text-slate-600">{[item.degree, item.field_of_study].filter(Boolean).join(' · ')}</p><p className="text-xs text-slate-500">{item.start_date || ''}{item.start_date && (item.end_date || item.is_current) ? ' – ' : ''}{item.is_current ? 'Hiện tại' : item.end_date || ''}</p>{item.description && <p className="mt-1 text-xs leading-5">{item.description}</p>}</div>)}</>}
    {cv.skills.length > 0 && <><>{title('KỸ NĂNG')}</><div className="mt-3 flex flex-wrap gap-2">{cv.skills.map((item, i) => <span key={`${item.name}-${i}`} className="rounded bg-slate-100 px-2 py-1 text-xs font-medium">{item.name}{item.level ? ` · ${item.level}` : ''}</span>)}</div></>}
    {cv.projects.length > 0 && <><>{title('DỰ ÁN')}</>{cv.projects.map((item, i) => <div key={`${item.name}-${i}`} className="mt-3"><strong>{item.name}</strong>{item.role && <span className="text-xs text-slate-500"> · {item.role}</span>}{item.description && <p className="mt-1 text-xs leading-5">{item.description}</p>}{item.technologies.length > 0 && <p className="mt-1 text-xs text-blue-700">{item.technologies.join(' · ')}</p>}</div>)}</>}
    {cv.certificates.length > 0 && <><>{title('CHỨNG CHỈ')}</>{cv.certificates.map((item, i) => <p key={`${item.name}-${i}`} className="mt-2 text-xs"><strong>{item.name}</strong>{item.organization ? ` · ${item.organization}` : ''}</p>)}</>}
    {cv.languages.length > 0 && <><>{title('NGOẠI NGỮ')}</><p className="mt-3 text-xs">{cv.languages.map((item) => `${item.name}${item.proficiency ? ` (${item.proficiency})` : ''}`).join(' · ')}</p></>}
  </article>
}
