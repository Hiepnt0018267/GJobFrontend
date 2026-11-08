import { ArrowDown, ArrowUp, Camera, ChevronRight, Plus, Trash2 } from 'lucide-react'
import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import type { CVCertificateItem, CVCreateRequest, CVEducationItem, CVExperienceItem, CVLanguageItem, CVProjectItem, CVSkillItem } from '../../types/cv'
import type { CVEditorContentSection } from './cvEditorState'

type CollectionKey = 'educations' | 'experiences' | 'skills' | 'projects' | 'certificates' | 'languages'
type Props = {
  data: CVCreateRequest
  activeSection: CVEditorContentSection
  sectionErrors: Record<string, string>
  avatarUrl: string | null
  hasAvatar: boolean
  photoUploading: boolean
  showAvatarEditor: boolean
  experienceRowKeys: string[]
  projectRowKeys: string[]
  onActiveSection: (value: CVEditorContentSection) => void
  onPatch: (changes: Partial<CVCreateRequest>) => void
  onPersonalInfo: (changes: Partial<CVCreateRequest['personal_info']>) => void
  onUpdateItem: <T,>(key: CollectionKey, index: number, changes: Partial<T>) => void
  onAddExperience: () => void
  onDeleteExperience: (index: number) => void
  onAddProject: () => void
  onDeleteProject: (index: number) => void
  onMoveItem?: (collection: CollectionKey, index: number, direction: 'UP' | 'DOWN') => void
  onToggleAvatarEditor: () => void
  onAvatarError: () => void
  onChoosePhoto: () => void
  onRemovePhoto: () => void
}

const inputClass = 'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#49BBBD] focus:ring-2 focus:ring-teal-100'
const sections: Array<{ key: CVEditorContentSection; label: string }> = [
  { key: 'personal', label: 'Thông tin cá nhân' },
  { key: 'summary', label: 'Mục tiêu nghề nghiệp' },
  { key: 'experience', label: 'Kinh nghiệm' },
  { key: 'education', label: 'Học vấn' },
  { key: 'skills', label: 'Kỹ năng' },
  { key: 'projects', label: 'Dự án' },
  { key: 'certificates', label: 'Chứng chỉ' },
  { key: 'languages', label: 'Ngôn ngữ' },
]
const removeAt = <T,>(items: T[], index: number) => items.filter((_, current) => current !== index)

export default function CVContentPanel(props: Props) {
  const activeRef = useRef<HTMLDivElement>(null)
  useEffect(() => { activeRef.current?.focus() }, [props.activeSection])
  const errorName: Record<CVEditorContentSection, string> = { personal: 'THÔNG TIN LIÊN HỆ', summary: 'MỤC TIÊU NGHỀ NGHIỆP', experience: 'KINH NGHIỆM LÀM VIỆC', education: 'HỌC VẤN', skills: 'KỸ NĂNG', projects: 'DỰ ÁN', certificates: 'CHỨNG CHỈ', languages: 'NGOẠI NGỮ' }
  const currentError = props.sectionErrors[errorName[props.activeSection]]
  return <div>
    <div className="grid grid-cols-2 gap-1.5">{sections.map((section) => <button key={section.key} type="button" aria-pressed={props.activeSection === section.key} onClick={() => props.onActiveSection(section.key)} className={`flex items-center justify-between rounded-lg px-2.5 py-2 text-left text-[11px] font-semibold ${props.activeSection === section.key ? 'bg-teal-50 text-[#49BBBD]' : 'text-slate-600 hover:bg-slate-50'}`}><span>{section.label}</span>{props.activeSection === section.key && <ChevronRight size={13} />}</button>)}</div>
    <div ref={activeRef} tabIndex={-1} className="mt-5 outline-none"><h3 className="text-sm font-bold text-slate-950">{sections.find((item) => item.key === props.activeSection)?.label}</h3>{currentError && <p role="alert" className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{currentError}</p>}<div className="mt-3">{renderSection(props)}</div></div>
  </div>
}

function renderSection(props: Props): ReactNode {
  const { data, activeSection, onPatch, onPersonalInfo, onUpdateItem } = props
  if (activeSection === 'personal') return <div className="space-y-3">
    <div className="flex items-center gap-3"><button type="button" onClick={props.onToggleAvatarEditor} aria-expanded={props.showAvatarEditor} className="grid h-20 w-16 shrink-0 place-items-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50 text-slate-400">{props.hasAvatar && props.avatarUrl ? <img src={props.avatarUrl} alt="Ảnh CV" onError={props.onAvatarError} className="h-full w-full object-cover" /> : <Camera size={20} />}</button><div><p className="text-xs font-semibold text-slate-700">Ảnh CV</p><p className="mt-1 text-[11px] leading-4 text-slate-500">JPG, PNG, WEBP · tối đa 5 MB.</p><div className="mt-2 flex gap-2"><button type="button" disabled={props.photoUploading} onClick={props.onChoosePhoto} className="text-xs font-bold text-[#49BBBD]">{props.hasAvatar ? 'Thay ảnh' : 'Tải ảnh'}</button>{props.hasAvatar && <button type="button" disabled={props.photoUploading} onClick={props.onRemovePhoto} className="text-xs font-bold text-red-600">Xoá</button>}</div></div></div>
    <Field label="Họ và tên"><input value={data.personal_info.full_name ?? ''} maxLength={255} onChange={(event) => onPersonalInfo({ full_name: event.target.value })} className={inputClass} /></Field>
    <Field label="Email"><input type="email" value={data.personal_info.email ?? ''} onChange={(event) => onPersonalInfo({ email: event.target.value })} className={inputClass} /></Field>
    <Field label="Số điện thoại"><input value={data.personal_info.phone ?? ''} maxLength={20} onChange={(event) => onPersonalInfo({ phone: event.target.value })} className={inputClass} /></Field>
    <Field label="Địa chỉ"><input value={data.personal_info.address ?? ''} maxLength={500} onChange={(event) => onPersonalInfo({ address: event.target.value })} className={inputClass} /></Field>
    <Field label="GitHub / Portfolio"><input type="url" value={data.personal_info.github_url ?? ''} onChange={(event) => onPersonalInfo({ github_url: event.target.value })} className={inputClass} /></Field>
  </div>
  if (activeSection === 'summary') return <textarea value={data.career_objective ?? ''} maxLength={5000} onChange={(event) => onPatch({ career_objective: event.target.value })} className={`${inputClass} min-h-40 resize-y`} placeholder="Mô tả mục tiêu nghề nghiệp" />
  if (activeSection === 'skills') return <ItemList items={data.skills} addLabel="Thêm kỹ năng" onAdd={() => onPatch({ skills: [...data.skills, { name: '', level: null }] })} onDelete={(index) => onPatch({ skills: removeAt(data.skills, index) })} onMoveUp={(index) => props.onMoveItem?.('skills', index, 'UP')} onMoveDown={(index) => props.onMoveItem?.('skills', index, 'DOWN')}>{(item, index) => <input value={item.name} maxLength={100} onChange={(event) => onUpdateItem<CVSkillItem>('skills', index, { name: event.target.value })} className={inputClass} placeholder="Tên kỹ năng" aria-label={`Tên kỹ năng ${index + 1}`} />}</ItemList>
  if (activeSection === 'education') return <ItemList items={data.educations} addLabel="Thêm học vấn" onAdd={() => onPatch({ educations: [...data.educations, { school_name: '', is_current: false }] })} onDelete={(index) => onPatch({ educations: removeAt(data.educations, index) })} onMoveUp={(index) => props.onMoveItem?.('educations', index, 'UP')} onMoveDown={(index) => props.onMoveItem?.('educations', index, 'DOWN')}>{(item, index) => <><input value={item.school_name} onChange={(event) => onUpdateItem<CVEducationItem>('educations', index, { school_name: event.target.value })} className={inputClass} placeholder="Trường học" /><input value={item.degree ?? ''} onChange={(event) => onUpdateItem<CVEducationItem>('educations', index, { degree: event.target.value })} className={inputClass} placeholder="Bằng cấp / Chuyên ngành" /></>}</ItemList>
  if (activeSection === 'experience') return <ItemList items={data.experiences} rowKeys={props.experienceRowKeys} addLabel="Thêm kinh nghiệm" onAdd={props.onAddExperience} onDelete={props.onDeleteExperience} onMoveUp={(index) => props.onMoveItem?.('experiences', index, 'UP')} onMoveDown={(index) => props.onMoveItem?.('experiences', index, 'DOWN')}>{(item, index) => <><input value={item.position} onChange={(event) => onUpdateItem<CVExperienceItem>('experiences', index, { position: event.target.value })} className={inputClass} placeholder="Vị trí" /><input value={item.company_name} onChange={(event) => onUpdateItem<CVExperienceItem>('experiences', index, { company_name: event.target.value })} className={inputClass} placeholder="Công ty" /><textarea value={item.description ?? ''} onChange={(event) => onUpdateItem<CVExperienceItem>('experiences', index, { description: event.target.value })} className={`${inputClass} min-h-24 resize-y`} placeholder="Mô tả công việc" /></>}</ItemList>
  if (activeSection === 'projects') return <ItemList items={data.projects} rowKeys={props.projectRowKeys} addLabel="Thêm dự án" onAdd={props.onAddProject} onDelete={props.onDeleteProject} onMoveUp={(index) => props.onMoveItem?.('projects', index, 'UP')} onMoveDown={(index) => props.onMoveItem?.('projects', index, 'DOWN')}>{(item, index) => <><input value={item.name} onChange={(event) => onUpdateItem<CVProjectItem>('projects', index, { name: event.target.value })} className={inputClass} placeholder="Tên dự án" /><textarea value={item.description ?? ''} onChange={(event) => onUpdateItem<CVProjectItem>('projects', index, { description: event.target.value })} className={`${inputClass} min-h-24 resize-y`} placeholder="Mô tả dự án" /></>}</ItemList>
  if (activeSection === 'certificates') return <ItemList items={data.certificates} addLabel="Thêm chứng chỉ" onAdd={() => onPatch({ certificates: [...data.certificates, { name: '' }] })} onDelete={(index) => onPatch({ certificates: removeAt(data.certificates, index) })} onMoveUp={(index) => props.onMoveItem?.('certificates', index, 'UP')} onMoveDown={(index) => props.onMoveItem?.('certificates', index, 'DOWN')}>{(item, index) => <input value={item.name} onChange={(event) => onUpdateItem<CVCertificateItem>('certificates', index, { name: event.target.value })} className={inputClass} placeholder="Tên chứng chỉ" />}</ItemList>
  return <ItemList items={data.languages} addLabel="Thêm ngôn ngữ" onAdd={() => onPatch({ languages: [...data.languages, { name: '', proficiency: null }] })} onDelete={(index) => onPatch({ languages: removeAt(data.languages, index) })} onMoveUp={(index) => props.onMoveItem?.('languages', index, 'UP')} onMoveDown={(index) => props.onMoveItem?.('languages', index, 'DOWN')}>{(item, index) => <><input value={item.name} onChange={(event) => onUpdateItem<CVLanguageItem>('languages', index, { name: event.target.value })} className={inputClass} placeholder="Ngôn ngữ" /><input value={item.proficiency ?? ''} onChange={(event) => onUpdateItem<CVLanguageItem>('languages', index, { proficiency: event.target.value as CVLanguageItem['proficiency'] })} className={inputClass} placeholder="Trình độ, ví dụ: Giao tiếp" /></>}</ItemList>
}

function Field({ label, children }: { label: string; children: ReactNode }) { return <label className="block text-xs font-semibold text-slate-700">{label}<span className="mt-1.5 block">{children}</span></label> }

function ItemList<T>({ items, rowKeys, addLabel, onAdd, onDelete, onMoveUp, onMoveDown, children }: { items: T[]; rowKeys?: string[]; addLabel: string; onAdd: () => void; onDelete: (index: number) => void; onMoveUp?: (index: number) => void; onMoveDown?: (index: number) => void; children: (item: T, index: number, rowKey: string) => ReactNode }) {
  return <div className="space-y-3">{items.map((item, index) => { const rowKey = rowKeys?.[index] ?? `row-${index}`; return <div key={rowKey} className="relative space-y-2 rounded-xl border border-slate-200 bg-slate-50/60 p-3 pt-9"><div className="absolute right-2 top-2 flex items-center gap-0.5">{onMoveUp && items.length > 1 && <button type="button" disabled={index === 0} onClick={() => onMoveUp(index)} title="Di chuyển lên" aria-label="Di chuyển lên" className="grid h-6 w-6 place-items-center rounded text-slate-400 hover:bg-slate-200 hover:text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed"><ArrowUp size={12} /></button>}{onMoveDown && items.length > 1 && <button type="button" disabled={index === items.length - 1} onClick={() => onMoveDown(index)} title="Di chuyển xuống" aria-label="Di chuyển xuống" className="grid h-6 w-6 place-items-center rounded text-slate-400 hover:bg-slate-200 hover:text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed"><ArrowDown size={12} /></button>}<button type="button" onClick={() => onDelete(index)} aria-label="Xoá mục" title="Xóa mục" className="grid h-6 w-6 place-items-center rounded text-slate-400 hover:bg-red-50 hover:text-red-600"><Trash2 size={13} /></button></div>{children(item, index, rowKey)}</div> })}<button type="button" onClick={onAdd} className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-[#49BBBD]/50 px-3 py-2.5 text-xs font-bold text-[#49BBBD] hover:bg-teal-50"><Plus size={15} />{addLabel}</button></div>
}
