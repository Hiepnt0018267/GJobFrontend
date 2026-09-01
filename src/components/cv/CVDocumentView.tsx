import { useState } from 'react'
import type { CVCreateRequest, CVTemplateLayoutKey } from '../../types/cv'

type Props = { cv: CVCreateRequest; layoutKey: CVTemplateLayoutKey }

function Avatar({ url, name, rounded }: { url?: string | null; name?: string | null; rounded: boolean }) {
  const [failed, setFailed] = useState(false)
  if (!url || failed) return null
  return <img src={url} alt={`Ảnh chân dung của ${name || 'ứng viên'}`} onError={() => setFailed(true)} className={`h-20 w-16 shrink-0 object-cover ${rounded ? 'rounded-lg' : 'rounded-sm'}`} />
}

const sectionTitle = (value: string, accentClass: string) => <h2 className={`mt-6 border-b border-slate-200 pb-1.5 text-xs font-bold tracking-[0.08em] ${accentClass}`}>{value}</h2>

export default function CVDocumentView({ cv, layoutKey }: Props) {
  const info = cv.personal_info
  const contacts = [info.email, info.phone, info.address].filter(Boolean)
  const isClassic = layoutKey === 'CLASSIC'
  const isMinimal = layoutKey === 'MINIMAL'
  const accentClass = layoutKey === 'MODERN' ? 'text-blue-700' : 'text-slate-700'
  const headerClass = isClassic ? 'border-b border-slate-900 pb-5 text-center' : isMinimal ? 'pb-5' : 'border-b-2 border-blue-600 pb-5'

  return <>
    <header className={headerClass}><div className={`flex gap-4 ${isClassic ? 'flex-col items-center' : 'items-start'}`}><Avatar url={info.avatar_url} name={info.full_name} rounded={!isClassic} /><div className={isClassic ? '' : 'min-w-0'}><h1 className="text-2xl font-bold tracking-tight text-slate-950">{info.full_name || 'Họ và tên'}</h1><p className="mt-2 text-xs text-slate-500">{contacts.join(' · ')}</p><div className={`mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs ${layoutKey === 'MODERN' ? 'text-blue-700' : 'text-slate-600'}`}>{[info.linkedin_url, info.github_url, info.portfolio_url].filter(Boolean).map((url) => <span key={url} className="break-all">{url}</span>)}</div></div></div></header>
    {cv.career_objective && <><>{sectionTitle('MỤC TIÊU NGHỀ NGHIỆP', accentClass)}</><p className="mt-3 whitespace-pre-wrap leading-6">{cv.career_objective}</p></>}
    {cv.experiences.length > 0 && <><>{sectionTitle('KINH NGHIỆM', accentClass)}</>{cv.experiences.map((item, index) => <div key={`${item.company_name}-${index}`} className="mt-3"><div className="flex justify-between gap-3"><strong>{item.position}</strong><span className="text-xs text-slate-500">{item.start_date || ''}{item.start_date && (item.end_date || item.is_current) ? ' – ' : ''}{item.is_current ? 'Hiện tại' : item.end_date || ''}</span></div><p className="text-xs font-medium text-blue-700">{item.company_name}</p>{item.description && <p className="mt-1 whitespace-pre-wrap text-xs leading-5">{item.description}</p>}</div>)}</>}
    {cv.educations.length > 0 && <><>{sectionTitle('HỌC VẤN', accentClass)}</>{cv.educations.map((item, index) => <div key={`${item.school_name}-${index}`} className="mt-3"><strong>{item.school_name}</strong><p className="text-xs text-slate-600">{[item.degree, item.field_of_study].filter(Boolean).join(' · ')}</p><p className="text-xs text-slate-500">{item.start_date || ''}{item.start_date && (item.end_date || item.is_current) ? ' – ' : ''}{item.is_current ? 'Hiện tại' : item.end_date || ''}</p>{item.description && <p className="mt-1 text-xs leading-5">{item.description}</p>}</div>)}</>}
    {cv.skills.length > 0 && <><>{sectionTitle('KỸ NĂNG', accentClass)}</><div className="mt-3 flex flex-wrap gap-2">{cv.skills.map((item, index) => <span key={`${item.name}-${index}`} className="rounded bg-slate-100 px-2 py-1 text-xs font-medium">{item.name}{item.level ? ` · ${item.level}` : ''}</span>)}</div></>}
    {cv.projects.length > 0 && <><>{sectionTitle('DỰ ÁN', accentClass)}</>{cv.projects.map((item, index) => <div key={`${item.name}-${index}`} className="mt-3"><strong>{item.name}</strong>{item.role && <span className="text-xs text-slate-500"> · {item.role}</span>}{item.description && <p className="mt-1 text-xs leading-5">{item.description}</p>}{item.technologies.length > 0 && <p className="mt-1 text-xs text-blue-700">{item.technologies.join(' · ')}</p>}</div>)}</>}
    {cv.certificates.length > 0 && <><>{sectionTitle('CHỨNG CHỈ', accentClass)}</>{cv.certificates.map((item, index) => <p key={`${item.name}-${index}`} className="mt-2 text-xs"><strong>{item.name}</strong>{item.organization ? ` · ${item.organization}` : ''}</p>)}</>}
    {cv.languages.length > 0 && <><>{sectionTitle('NGOẠI NGỮ', accentClass)}</><p className="mt-3 text-xs">{cv.languages.map((item) => `${item.name}${item.proficiency ? ` (${item.proficiency})` : ''}`).join(' · ')}</p></>}
  </>
}
