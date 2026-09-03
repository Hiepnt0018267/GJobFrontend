import { useState } from 'react'
import type { CVCreateRequest, CVTemplateLayoutKey } from '../../types/cv'
import type { ResolvedCVTheme } from './cvTheme'

type Props = { cv: CVCreateRequest; layoutKey: CVTemplateLayoutKey; theme: ResolvedCVTheme }

function Avatar({ url, name, rounded }: { url?: string | null; name?: string | null; rounded: boolean }) {
  const [failed, setFailed] = useState(false)
  if (!url || failed) return null
  return <img src={url} alt={`Ảnh chân dung của ${name || 'ứng viên'}`} onError={() => setFailed(true)} className={`h-20 w-16 shrink-0 object-cover ${rounded ? 'rounded-lg' : 'rounded-sm'}`} />
}

const sectionTitle = (value: string, theme: ResolvedCVTheme) => <h2 style={{ color: theme.primary_color, borderColor: theme.primary_color }} className={`${theme.sectionSpacingClass} ${theme.headingClass} text-xs font-bold tracking-[0.08em]`}>{value}</h2>

export default function CVDocumentView({ cv, layoutKey, theme }: Props) {
  const info = cv.personal_info
  const contacts = [info.email, info.phone, info.address].filter(Boolean)
  const isClassic = layoutKey === 'CLASSIC'
  const isMinimal = layoutKey === 'MINIMAL'
  const headerClass = isClassic ? 'border-b border-slate-900 pb-5 text-center' : isMinimal ? 'pb-5' : 'border-b-2 border-blue-600 pb-5'

  return <>
    <header style={isMinimal ? undefined : { borderColor: theme.primary_color }} className={headerClass}><div className={`flex gap-4 ${isClassic ? 'flex-col items-center' : 'items-start'}`}><Avatar url={info.avatar_url} name={info.full_name} rounded={!isClassic} /><div className={isClassic ? '' : 'min-w-0'}><h1 className="text-2xl font-bold tracking-tight text-slate-950">{info.full_name || 'Họ và tên'}</h1><p className="mt-2 text-xs text-slate-500">{contacts.join(' · ')}</p><div style={{ color: theme.primary_color }} className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs">{[info.linkedin_url, info.github_url, info.portfolio_url].filter(Boolean).map((url) => <span key={url} className="break-all">{url}</span>)}</div></div></div></header>
    {cv.career_objective && <><>{sectionTitle('MỤC TIÊU NGHỀ NGHIỆP', theme)}</><p className="mt-3 whitespace-pre-wrap leading-6">{cv.career_objective}</p></>}
    {cv.experiences.length > 0 && <><>{sectionTitle('KINH NGHIỆM', theme)}</>{cv.experiences.map((item, index) => <div key={`${item.company_name}-${index}`} className="mt-3"><div className="flex justify-between gap-3"><strong>{item.position}</strong><span className="text-xs text-slate-500">{item.start_date || ''}{item.start_date && (item.end_date || item.is_current) ? ' – ' : ''}{item.is_current ? 'Hiện tại' : item.end_date || ''}</span></div><p style={{ color: theme.primary_color }} className="text-xs font-medium">{item.company_name}</p>{item.description && <p className="mt-1 whitespace-pre-wrap text-xs leading-5">{item.description}</p>}</div>)}</>}
    {cv.educations.length > 0 && <><>{sectionTitle('HỌC VẤN', theme)}</>{cv.educations.map((item, index) => <div key={`${item.school_name}-${index}`} className="mt-3"><strong>{item.school_name}</strong><p className="text-xs text-slate-600">{[item.degree, item.field_of_study].filter(Boolean).join(' · ')}</p><p className="text-xs text-slate-500">{item.start_date || ''}{item.start_date && (item.end_date || item.is_current) ? ' – ' : ''}{item.is_current ? 'Hiện tại' : item.end_date || ''}</p>{item.description && <p className="mt-1 text-xs leading-5">{item.description}</p>}</div>)}</>}
    {cv.skills.length > 0 && <><>{sectionTitle('KỸ NĂNG', theme)}</><div className="mt-3 flex flex-wrap gap-2">{cv.skills.map((item, index) => <span key={`${item.name}-${index}`} className="rounded bg-slate-100 px-2 py-1 text-xs font-medium">{item.name}{item.level ? ` · ${item.level}` : ''}</span>)}</div></>}
    {cv.projects.length > 0 && <><>{sectionTitle('DỰ ÁN', theme)}</>{cv.projects.map((item, index) => <div key={`${item.name}-${index}`} className="mt-3"><strong>{item.name}</strong>{item.role && <span className="text-xs text-slate-500"> · {item.role}</span>}{item.description && <p className="mt-1 text-xs leading-5">{item.description}</p>}{item.technologies.length > 0 && <p style={{ color: theme.primary_color }} className="mt-1 text-xs">{item.technologies.join(' · ')}</p>}</div>)}</>}
    {cv.certificates.length > 0 && <><>{sectionTitle('CHỨNG CHỈ', theme)}</>{cv.certificates.map((item, index) => <p key={`${item.name}-${index}`} className="mt-2 text-xs"><strong>{item.name}</strong>{item.organization ? ` · ${item.organization}` : ''}</p>)}</>}
    {cv.languages.length > 0 && <><>{sectionTitle('NGOẠI NGỮ', theme)}</><p className="mt-3 text-xs">{cv.languages.map((item) => `${item.name}${item.proficiency ? ` (${item.proficiency})` : ''}`).join(' · ')}</p></>}
  </>
}
