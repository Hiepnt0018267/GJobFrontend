import { Camera } from 'lucide-react'
import { useState, type CSSProperties, type ReactNode } from 'react'
import monochromeFabricBackground from '../../../assets/cv/monochrome-fabric-background.png'
import type { CVLanguageProficiency } from '../../../types/cv'
import CVDocumentSurface from '../CVDocumentSurface'
import { CVInlineAddButton, CVInlineInput, CVInlineSelect, CVInlineTextarea } from '../CVInlineFields'
import { formatCVDateForDisplay, formatCVLanguageProficiency, getCVLabels } from '../cvLocale'
import type { CVTemplateComponentProps } from './types'
import CVSectionWrapper, { type CVSectionKey } from '../CVSectionWrapper'
import CVInlineItemWrapper from '../CVInlineItemWrapper'
import CVInlineSkillsEditor from '../CVInlineSkillsEditor'
import { CVFormattedText } from '../CVRichTextField'

export type StructuredVariant =
  | 'simple'
  | 'left-sidebar'
  | 'right-sidebar'
  | 'dark-columns'
  | 'figma-a4-profile-timeline'
  | 'figma-purple-profile'
  | 'figma-clean-sidebar'
  | 'figma-monochrome-portrait'
  | 'figma-editorial-portrait'
type Props = CVTemplateComponentProps & { variant: StructuredVariant }
type VisibilityKey = 'summary' | 'experience' | 'education' | 'skills' | 'projects' | 'certificates' | 'languages'

function Avatar({ url, name, dark = false, candidateLabel, portraitLabel, defaultAvatarLabel, onChoosePhoto }: { url?: string | null; name?: string | null; dark?: boolean; candidateLabel: string; portraitLabel: string; defaultAvatarLabel: string; onChoosePhoto?: () => void }) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null)
  const failed = Boolean(url && failedUrl === url)
  const initials = (name || candidateLabel).split(/\s+/).filter(Boolean).slice(-2).map((part) => part[0]).join('').toUpperCase()
  const image = !url || failed
    ? <div aria-label={defaultAvatarLabel} className={`flex h-24 w-20 items-center justify-center rounded-xl text-xl font-black ${dark ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-500'}`}>{initials}</div>
    : <img src={url} alt={`${portraitLabel}: ${name || candidateLabel}`} onError={() => setFailedUrl(url)} className="h-24 w-20 rounded-xl object-cover" />
  if (!onChoosePhoto) return <div className="h-24 w-20 shrink-0">{image}</div>
  return <button type="button" onClick={onChoosePhoto} aria-label="Tải ảnh CV" title="Bấm để tải ảnh CV" className="group relative h-24 w-20 shrink-0 overflow-hidden rounded-xl outline-none ring-offset-2 transition hover:ring-2 hover:ring-[#49BBBD] focus-visible:ring-2 focus-visible:ring-[#49BBBD]">
    {image}
    <span className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1 bg-slate-950/70 px-1 py-1.5 text-[9px] font-bold text-white opacity-90 transition group-hover:opacity-100"><Camera size={11} aria-hidden="true" />Tải ảnh</span>
  </button>
}

function Section({ title, accent, dark = false, children }: { title: string; accent: string; dark?: boolean; children: ReactNode }) {
  return <section className="mt-6"><div className="flex items-center justify-between gap-2 border-b pb-1.5" style={{ borderColor: dark ? 'rgb(255 255 255 / 0.25)' : accent }}><h2 style={{ color: dark ? '#FFFFFF' : accent }} className="text-[11px] font-black uppercase tracking-[0.18em]">{title}</h2></div><div className="mt-3">{children}</div></section>
}

const dateText = (value: Parameters<typeof formatCVDateForDisplay>[0], locale: 'vi' | 'en') => formatCVDateForDisplay(value, locale)
const dateRange = (startValue: Parameters<typeof formatCVDateForDisplay>[0], endValue: Parameters<typeof formatCVDateForDisplay>[0], locale: 'vi' | 'en', presentLabel: string, current?: boolean) => [dateText(startValue, locale), current ? presentLabel : dateText(endValue, locale)].filter(Boolean).join(' – ')

export default function CVStructuredLayout({ cv, presentation, mode, theme, className = '', photoUrl, variant, editor }: Props) {
  const locale = presentation.locale
  const labels = getCVLabels(locale)
  const info = { ...cv.personal_info, avatar_url: photoUrl ?? cv.personal_info.avatar_url }
  const dark = variant === 'dark-columns' || variant === 'figma-monochrome-portrait'
  const editing = mode === 'editor-preview' && Boolean(editor)
  const hasContent: Record<VisibilityKey, boolean> = {
    summary: Boolean(cv.career_objective),
    experience: cv.experiences.length > 0,
    education: cv.educations.length > 0,
    skills: cv.skills.length > 0,
    projects: cv.projects.length > 0,
    certificates: cv.certificates.length > 0,
    languages: cv.languages.length > 0,
  }
  const isVisible = (key: VisibilityKey) => presentation.sectionVisibility?.[key] !== false && (editing || hasContent[key])

  const identity = editing && editor ? <div className="min-w-0 space-y-1">
    <CVInlineInput fieldId="personal.full_name" value={info.full_name} onChange={(full_name) => editor.onPersonalInfoChange({ full_name })} label="Họ và tên" placeholder={labels.fullName} className={`text-3xl font-black tracking-tight ${dark ? 'text-white' : 'text-slate-950'}`} />
    <CVInlineInput fieldId="title" value={cv.title} onChange={editor.onTitleChange} label="Vị trí ứng tuyển" placeholder={labels.professionalProfile} className="text-xs font-bold uppercase tracking-[0.14em]" />
  </div> : <><h1 className={`text-3xl font-black tracking-tight ${dark ? 'text-white' : 'text-slate-950'}`}><CVFormattedText value={info.full_name || labels.fullName} fieldId="personal.full_name" /></h1><p style={{ color: dark ? '#CBD5E1' : theme.primary_color }} className="mt-1 text-xs font-bold uppercase tracking-[0.14em]"><CVFormattedText value={cv.title || labels.professionalProfile} fieldId="title" /></p></>

  const contactEntries = [
    { value: info.email, fieldId: 'personal.email' },
    { value: info.phone, fieldId: 'personal.phone' },
    { value: info.address, fieldId: 'personal.address' },
    { value: info.linkedin_url },
    { value: info.github_url, fieldId: 'personal.github' },
    { value: info.portfolio_url },
  ].filter((entry) => Boolean(entry.value))
  const contacts = editing && editor ? <div className="mt-4 space-y-1 text-[10px] leading-4">
    <CVInlineInput fieldId="personal.email" type="email" value={info.email} onChange={(email) => editor.onPersonalInfoChange({ email })} label="Email" placeholder="Email" />
    <CVInlineInput fieldId="personal.phone" value={info.phone} onChange={(phone) => editor.onPersonalInfoChange({ phone })} label="Số điện thoại" placeholder="Số điện thoại" />
    <CVInlineInput fieldId="personal.address" value={info.address} onChange={(address) => editor.onPersonalInfoChange({ address })} label="Địa chỉ" placeholder="Địa chỉ" />
    <CVInlineInput fieldId="personal.github" type="url" value={info.github_url} onChange={(github_url) => editor.onPersonalInfoChange({ github_url })} label="GitHub hoặc Portfolio" placeholder="GitHub / Portfolio" />
  </div> : <div className={`mt-4 space-y-1 text-[10px] leading-4 ${dark ? 'text-slate-300' : 'text-slate-600'}`}>{contactEntries.map((entry, index) => <p key={`${entry.value}-${index}`} className="break-all">{entry.fieldId ? <CVFormattedText value={entry.value} fieldId={entry.fieldId} /> : entry.value}</p>)}</div>

  const defaultOrder: CVSectionKey[] = variant === 'simple'
    ? ['summary', 'experience', 'education', 'projects', 'skills', 'certificates', 'languages']
    : variant === 'figma-purple-profile'
      ? ['summary', 'languages', 'education', 'experience', 'skills', 'projects', 'certificates']
      : variant === 'figma-monochrome-portrait'
        ? ['summary', 'skills', 'education', 'certificates', 'languages', 'experience', 'projects']
      : ['summary', 'experience', 'projects', 'skills', 'education', 'certificates', 'languages']
  const order = editor?.sectionOrder && editor.sectionOrder.length > 0 ? editor.sectionOrder : defaultOrder

  const sectionTitles: Record<CVSectionKey, string> = {
    summary: labels.objective,
    experience: labels.experience,
    education: labels.education,
    skills: labels.skills,
    projects: labels.projects,
    certificates: labels.certificates,
    languages: labels.languages,
  }

  const sectionsContent: Record<CVSectionKey, ReactNode> = {
    summary: isVisible('summary') ? <Section title={labels.objective} accent={theme.primary_color} dark={dark}>{editing && editor ? <CVInlineTextarea fieldId="summary" value={cv.career_objective} onChange={editor.onCareerObjectiveChange} label={labels.objective} placeholder={locale === 'en' ? 'Write your career objective' : 'Nhập mục tiêu nghề nghiệp'} rows={3} className="text-xs" /> : cv.career_objective ? <p className="whitespace-pre-wrap text-xs leading-5"><CVFormattedText value={cv.career_objective} fieldId="summary" /></p> : null}</Section> : null,
    experience: isVisible('experience') ? <Section title={labels.experience} accent={theme.primary_color} dark={dark}>{editing && editor ? <div className="space-y-4">{cv.experiences.map((item, index) => (
      <CVInlineItemWrapper
        key={index}
        index={index}
        total={cv.experiences.length}
        collectionKey="experiences"
        onMoveUp={editor.onMoveExperienceUp}
        onMoveDown={editor.onMoveExperienceDown}
        onDelete={editor.onDeleteExperience}
        onReorder={editor.onReorderExperiences}
        deleteLabel="Xóa kinh nghiệm"
        className="break-inside-avoid"
      >
        <div className="space-y-1">
          <CVInlineInput fieldId={`experience.${index}.position`} value={item.position} onChange={(position) => editor.onExperienceChange(index, { position })} label="Vị trí công việc" placeholder="Vị trí công việc" className="text-sm font-bold" />
          <CVInlineInput fieldId={`experience.${index}.company`} value={item.company_name} onChange={(company_name) => editor.onExperienceChange(index, { company_name })} label="Tên công ty" placeholder="Tên công ty" className="text-xs font-semibold" />
          <div className="grid grid-cols-2 gap-1">
            <CVInlineInput value={dateText(item.start_date, locale)} onChange={(start_date) => editor.onExperienceChange(index, { start_date })} label="Thời gian bắt đầu" placeholder="Bắt đầu" className="text-[10px]" />
            <CVInlineInput value={dateText(item.end_date, locale)} onChange={(end_date) => editor.onExperienceChange(index, { end_date, is_current: false })} label="Thời gian kết thúc" placeholder={labels.present} className="text-[10px]" />
          </div>
          <CVInlineTextarea fieldId={`experience.${index}.description`} value={item.description} onChange={(description) => editor.onExperienceChange(index, { description })} label="Mô tả kinh nghiệm" placeholder="Mô tả kinh nghiệm" rows={2} className="text-xs" />
        </div>
      </CVInlineItemWrapper>
    ))}<CVInlineAddButton onClick={editor.onAddExperience}>Thêm kinh nghiệm</CVInlineAddButton></div> : <div className="space-y-4">{cv.experiences.map((item, index) => <div key={`${item.company_name}-${index}`} className="break-inside-avoid"><div className="flex flex-wrap items-baseline justify-between gap-x-3"><strong className="text-sm"><CVFormattedText value={item.position} fieldId={`experience.${index}.position`} /></strong><span className={`text-[10px] tabular-nums ${dark ? 'text-slate-300' : 'text-slate-500'}`}>{dateRange(item.start_date, item.end_date, locale, labels.present, item.is_current)}</span></div><p style={{ color: dark ? '#F8FAFC' : theme.primary_color }} className="mt-0.5 text-xs font-semibold"><CVFormattedText value={item.company_name} fieldId={`experience.${index}.company`} /></p>{item.description && <p className={`mt-1.5 whitespace-pre-wrap text-xs leading-5 ${dark ? 'text-slate-200' : 'text-slate-600'}`}><CVFormattedText value={item.description} fieldId={`experience.${index}.description`} /></p>}</div>)}</div>}</Section> : null,
    education: isVisible('education') ? <Section title={labels.education} accent={theme.primary_color} dark={dark}>{editing && editor ? <div className="space-y-3">{cv.educations.map((item, index) => (
      <CVInlineItemWrapper
        key={index}
        index={index}
        total={cv.educations.length}
        collectionKey="educations"
        onMoveUp={editor.onMoveEducationUp}
        onMoveDown={editor.onMoveEducationDown}
        onDelete={editor.onDeleteEducation}
        onReorder={editor.onReorderEducations}
        deleteLabel="Xóa học vấn"
      >
        <div className="space-y-1">
          <CVInlineInput fieldId={`education.${index}.school`} value={item.school_name} onChange={(school_name) => editor.onEducationChange(index, { school_name })} label="Tên trường" placeholder="Tên trường" className="text-xs font-bold" />
          <CVInlineInput fieldId={`education.${index}.degree`} value={item.degree} onChange={(degree) => editor.onEducationChange(index, { degree })} label="Bằng cấp" placeholder="Bằng cấp / Chuyên ngành" className="text-xs" />
          <div className="grid grid-cols-2 gap-1">
            <CVInlineInput value={dateText(item.start_date, locale)} onChange={(start_date) => editor.onEducationChange(index, { start_date })} label="Bắt đầu học" placeholder="Bắt đầu" className="text-[10px]" />
            <CVInlineInput value={dateText(item.end_date, locale)} onChange={(end_date) => editor.onEducationChange(index, { end_date, is_current: false })} label="Kết thúc học" placeholder="Kết thúc" className="text-[10px]" />
          </div>
        </div>
      </CVInlineItemWrapper>
    ))}<CVInlineAddButton onClick={editor.onAddEducation}>Thêm học vấn</CVInlineAddButton></div> : <div className="space-y-3">{cv.educations.map((item, index) => <div key={`${item.school_name}-${index}`} className="break-inside-avoid"><strong className="text-xs"><CVFormattedText value={item.school_name} fieldId={`education.${index}.school`} /></strong><p className={`text-xs ${dark ? 'text-slate-300' : 'text-slate-600'}`}><CVFormattedText value={item.degree} fieldId={`education.${index}.degree`} />{item.field_of_study ? ` · ${item.field_of_study}` : ''}</p><p className={`text-[10px] ${dark ? 'text-slate-400' : 'text-slate-500'}`}>{dateRange(item.start_date, item.end_date, locale, labels.present, item.is_current)}</p></div>)}</div>}</Section> : null,
    skills: isVisible('skills') ? <Section title={labels.skills} accent={theme.primary_color} dark={dark}>{editing && editor ? <CVInlineSkillsEditor skills={cv.skills} locale={locale} onChange={editor.onSkillChange} onAdd={editor.onAddSkill} onDelete={editor.onDeleteSkill} onMoveUp={editor.onMoveSkillUp} onMoveDown={editor.onMoveSkillDown} onReorder={editor.onReorderSkills} /> : <div className="flex flex-wrap gap-1.5">{cv.skills.map((item, index) => <span key={`${item.name}-${index}`} className={`rounded-md px-2 py-1 text-[10px] font-semibold ${dark ? 'bg-white/10 text-slate-100' : 'bg-slate-100 text-slate-700'}`}><CVFormattedText value={item.name} fieldId={`skill.${index}.name`} /></span>)}</div>}</Section> : null,
    projects: isVisible('projects') ? <Section title={labels.projects} accent={theme.primary_color} dark={dark}>{editing && editor ? <div className="space-y-4">{cv.projects.map((item, index) => (
      <CVInlineItemWrapper
        key={index}
        index={index}
        total={cv.projects.length}
        collectionKey="projects"
        onMoveUp={editor.onMoveProjectUp}
        onMoveDown={editor.onMoveProjectDown}
        onDelete={editor.onDeleteProject}
        onReorder={editor.onReorderProjects}
        deleteLabel="Xóa dự án"
      >
        <div className="space-y-1">
          <CVInlineInput fieldId={`project.${index}.name`} value={item.name} onChange={(name) => editor.onProjectChange(index, { name })} label="Tên dự án" placeholder="Tên dự án" className="text-sm font-bold" />
          <CVInlineInput fieldId={`project.${index}.role`} value={item.role} onChange={(role) => editor.onProjectChange(index, { role })} label="Vai trò" placeholder="Vai trò" className="text-xs" />
          <CVInlineTextarea fieldId={`project.${index}.description`} value={item.description} onChange={(description) => editor.onProjectChange(index, { description })} label="Mô tả dự án" placeholder="Mô tả dự án" rows={2} className="text-xs" />
          <CVInlineInput value={item.technologies.join(', ')} onChange={(value) => editor.onProjectChange(index, { technologies: value.split(',').map((entry) => entry.trim()).filter(Boolean) })} label="Công nghệ" placeholder="React, FastAPI, PostgreSQL" className="text-[10px]" />
        </div>
      </CVInlineItemWrapper>
    ))}<CVInlineAddButton onClick={editor.onAddProject}>Thêm dự án</CVInlineAddButton></div> : <div className="space-y-4">{cv.projects.map((item, index) => <div key={`${item.name}-${index}`}><strong className="text-sm"><CVFormattedText value={item.name} fieldId={`project.${index}.name`} /></strong>{item.role && <span className="text-xs text-slate-500"> · <CVFormattedText value={item.role} fieldId={`project.${index}.role`} /></span>}{item.description && <p className="mt-1 whitespace-pre-wrap text-xs leading-5"><CVFormattedText value={item.description} fieldId={`project.${index}.description`} /></p>}{item.technologies.length > 0 && <p className="mt-1 text-[10px] font-semibold">{item.technologies.join(' · ')}</p>}</div>)}</div>}</Section> : null,
    certificates: isVisible('certificates') ? <Section title={labels.certificates} accent={theme.primary_color} dark={dark}>{editing && editor ? <div className="space-y-2">{cv.certificates.map((item, index) => (
      <CVInlineItemWrapper
        key={index}
        index={index}
        total={cv.certificates.length}
        collectionKey="certificates"
        onMoveUp={editor.onMoveCertificateUp}
        onMoveDown={editor.onMoveCertificateDown}
        onDelete={editor.onDeleteCertificate}
        onReorder={editor.onReorderCertificates}
        deleteLabel="Xóa chứng chỉ"
      >
        <div className="space-y-1">
          <CVInlineInput fieldId={`certificate.${index}.name`} value={item.name} onChange={(name) => editor.onCertificateChange(index, { name })} label="Tên chứng chỉ" placeholder="Tên chứng chỉ" className="text-xs font-bold" />
          <CVInlineInput fieldId={`certificate.${index}.organization`} value={item.organization} onChange={(organization) => editor.onCertificateChange(index, { organization })} label="Tổ chức cấp" placeholder="Tổ chức cấp" className="text-[10px]" />
        </div>
      </CVInlineItemWrapper>
    ))}<CVInlineAddButton onClick={editor.onAddCertificate}>Thêm chứng chỉ</CVInlineAddButton></div> : <div className="space-y-2">{cv.certificates.map((item, index) => <p key={`${item.name}-${index}`} className="text-xs"><strong><CVFormattedText value={item.name} fieldId={`certificate.${index}.name`} /></strong>{item.organization ? <> · <CVFormattedText value={item.organization} fieldId={`certificate.${index}.organization`} /></> : ''}</p>)}</div>}</Section> : null,
    languages: isVisible('languages') ? <Section title={labels.languages} accent={theme.primary_color} dark={dark}>{editing && editor ? <div className="space-y-2">{cv.languages.map((item, index) => (
      <CVInlineItemWrapper
        key={index}
        index={index}
        total={cv.languages.length}
        collectionKey="languages"
        onMoveUp={editor.onMoveLanguageUp}
        onMoveDown={editor.onMoveLanguageDown}
        onDelete={editor.onDeleteLanguage}
        onReorder={editor.onReorderLanguages}
        deleteLabel="Xóa ngôn ngữ"
      >
        <div className="grid min-w-0 flex-1 grid-cols-[1fr_1.1fr] gap-1">
          <CVInlineInput fieldId={`language.${index}.name`} value={item.name} onChange={(name) => editor.onLanguageChange(index, { name })} label="Ngôn ngữ" placeholder="Ngôn ngữ" className="text-xs" />
          <CVInlineSelect value={item.proficiency} onChange={(event) => editor.onLanguageChange(index, { proficiency: (event.target.value || null) as CVLanguageProficiency | null })} label="Trình độ" className="text-[10px]">
            <option value="">Trình độ</option>
            <option value="BASIC">Cơ bản</option>
            <option value="CONVERSATIONAL">Giao tiếp</option>
            <option value="PROFESSIONAL">Chuyên nghiệp</option>
            <option value="FLUENT">Thành thạo</option>
            <option value="NATIVE">Bản ngữ</option>
          </CVInlineSelect>
        </div>
      </CVInlineItemWrapper>
    ))}<CVInlineAddButton onClick={editor.onAddLanguage}>Thêm ngôn ngữ</CVInlineAddButton></div> : <div className="space-y-1">{cv.languages.map((item, index) => <p key={`${item.name}-${index}`} className="text-xs"><CVFormattedText value={item.name} fieldId={`language.${index}.name`} />{item.proficiency ? ` · ${formatCVLanguageProficiency(item.proficiency, locale)}` : ''}</p>)}</div>}</Section> : null,
  }

  const renderGroup = (keys: CVSectionKey[]) => {
    const active = order.filter((key) => keys.includes(key) && isVisible(key))
    return active.map((key, index) => {
      const content = sectionsContent[key]
      if (!content) return null
      return (
        <CVSectionWrapper
          key={key}
          sectionKey={key}
          title={sectionTitles[key]}
          editing={editing}
          canMoveUp={index > 0}
          canMoveDown={index < active.length - 1}
          onMoveUp={editor?.onMoveSectionUp}
          onMoveDown={editor?.onMoveSectionDown}
          onRemove={editor?.onRemoveSection}
          onReorder={editor?.onReorderSections}
        >
          {content}
        </CVSectionWrapper>
      )
    })
  }

  const avatar = <Avatar url={info.avatar_url} name={info.full_name} dark={dark} candidateLabel={labels.candidate} portraitLabel={labels.portrait} defaultAvatarLabel={labels.defaultAvatar} onChoosePhoto={editing && editor ? editor.onChoosePhoto : undefined} />

  if (variant === 'simple') {
    return (
      <CVDocumentSurface theme={theme} mode={mode} className={`p-[16mm] ${className}`}>
        <header className="flex items-start justify-between gap-6 border-b-2 pb-6" style={{ borderColor: theme.primary_color }}>
          <div className="min-w-0 flex-1">{identity}{contacts}</div>
          {avatar}
        </header>
        <main>{renderGroup(defaultOrder)}</main>
      </CVDocumentSurface>
    )
  }

  if (variant === 'left-sidebar') {
    const asideKeys: CVSectionKey[] = ['skills', 'education', 'languages']
    const mainKeys: CVSectionKey[] = ['summary', 'experience', 'projects', 'certificates']
    return (
      <CVDocumentSurface theme={theme} mode={mode} className={className}>
        <div className="grid min-h-[297mm] grid-cols-[35%_65%]">
          <aside style={{ backgroundColor: theme.primary_color }} className="px-7 py-10 text-white [&_h1]:!text-white [&_h2]:!border-white/30 [&_h2]:!text-white [&_p]:!text-slate-100 [&_span]:!text-slate-800 [&_strong]:!text-white">
            {avatar}
            <div className="mt-6">{identity}</div>
            {contacts}
            {renderGroup(asideKeys)}
          </aside>
          <main className="px-9 py-10">{renderGroup(mainKeys)}</main>
        </div>
      </CVDocumentSurface>
    )
  }

  if (variant === 'right-sidebar') {
    const mainKeys: CVSectionKey[] = ['summary', 'experience', 'projects']
    const asideKeys: CVSectionKey[] = ['skills', 'education', 'certificates', 'languages']
    return (
      <CVDocumentSurface theme={theme} mode={mode} className={`p-[14mm] ${className}`}>
        <header className="flex items-start justify-between gap-6 border-b pb-6" style={{ borderColor: theme.primary_color }}>
          <div className="min-w-0 flex-1">{identity}</div>
          {avatar}
        </header>
        <div className="grid grid-cols-[68%_32%] gap-8">
          <main>{renderGroup(mainKeys)}</main>
          <aside className="border-l border-slate-200 pl-6">
            {contacts}
            {renderGroup(asideKeys)}
          </aside>
        </div>
      </CVDocumentSurface>
    )
  }

  if (variant === 'figma-purple-profile') {
    const mainKeys: CVSectionKey[] = ['education', 'experience', 'skills', 'projects', 'certificates']
    return (
      <CVDocumentSurface theme={theme} mode={mode} className={`overflow-hidden ${className}`}>
        <div className="grid min-h-[297mm] grid-cols-[35%_65%]">
          <aside
            className="relative px-7 py-9 text-white [&_h1]:!text-white [&_input]:!text-white [&_p]:!text-white [&_section]:text-white [&_section_h2]:!text-white [&_section_span]:!text-white [&_section>div:first-child]:!border-white/50"
            style={{ background: `linear-gradient(180deg, ${theme.secondary_color} 0%, ${theme.primary_color} 100%)` }}
          >
            <div className="text-center [&_h1]:break-words [&_h1]:!text-2xl">{identity}</div>
            <div className="my-7 flex justify-center">
              <div className="overflow-hidden rounded-full border-4 border-white bg-white shadow-xl [&>button]:!h-28 [&>button]:!w-28 [&>button]:!rounded-full [&>div]:!h-28 [&>div]:!w-28 [&_div]:!h-28 [&_div]:!w-28 [&_div]:!rounded-full [&_img]:!h-28 [&_img]:!w-28 [&_img]:!rounded-full">
                {avatar}
              </div>
            </div>
            <div className="rounded-2xl border border-white/60 bg-white/10 px-4 pb-4 backdrop-blur-sm">{renderGroup(['summary'])}</div>
            <div className="mt-6 rounded-2xl bg-white/15 px-4 pb-4 pt-1 shadow-sm">{contacts}</div>
            <div className="mt-6 rounded-2xl border border-white/40 bg-white/10 px-4 pb-4">{renderGroup(['languages'])}</div>
          </aside>
          <main
            className="min-w-0 bg-white px-9 py-10 [&_section>div:first-child]:w-fit [&_section>div:first-child]:min-w-36 [&_section>div:first-child]:rounded-full [&_section>div:first-child]:border-0 [&_section>div:first-child]:px-5 [&_section>div:first-child]:py-2 [&_section_h2]:!text-white"
            style={{ '--purple-profile-accent': theme.primary_color } as CSSProperties}
          >
            <div className="mb-5 h-1 w-full rounded-full" style={{ backgroundColor: theme.primary_color }} />
            <div className="[&_section>div:first-child]:bg-[var(--purple-profile-accent)]">
              {renderGroup(mainKeys)}
            </div>
          </main>
        </div>
      </CVDocumentSurface>
    )
  }

  if (variant === 'figma-a4-profile-timeline') {
    const leftKeys: CVSectionKey[] = ['experience', 'certificates', 'languages']
    const rightKeys: CVSectionKey[] = ['education', 'skills', 'projects']
    return (
      <CVDocumentSurface theme={theme} mode={mode} className={`relative overflow-hidden ${className}`}>
        {/* Soft geometric corner decor - strictly clipped by A4 document boundary */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-8 -top-10 h-64 w-80 rounded-bl-[120px] opacity-15"
          style={{ backgroundColor: theme.primary_color }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-24 top-7 h-3 w-3 rotate-12 rounded-xs opacity-90 shadow-xs"
          style={{ backgroundColor: '#F6B94C' }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-10 top-32 h-2.5 w-2.5 rounded-full opacity-60"
          style={{ backgroundColor: theme.primary_color }}
        />

        {/* Header with aligned 58% / 42% grid */}
        <header className="relative grid grid-cols-[58%_42%] items-start gap-8 px-10 pb-6 pt-10">
          <div className="min-w-0 flex flex-col justify-between">
            <div>
              <div className="inline-block border-b-4 pb-2.5" style={{ borderColor: theme.primary_color }}>
                {identity}
              </div>
            </div>
            <div className="mt-3 [&_section]:!mt-3">
              {renderGroup(['summary'])}
            </div>
          </div>
          <div className="flex min-w-0 flex-col items-center">
            <div
              className="overflow-hidden rounded-full bg-white p-1 shadow-md ring-2 ring-offset-2 [&>button]:!h-24 [&>button]:!w-24 [&>button]:!rounded-full [&_div]:!h-24 [&_div]:!w-24 [&_div]:!rounded-full [&_img]:!h-24 [&_img]:!w-24 [&_img]:!rounded-full"
              style={{ borderColor: theme.primary_color }}
            >
              {avatar}
            </div>
            <div className="mt-3 w-full rounded-xl border border-slate-200/90 bg-white/95 px-4 py-3 shadow-xs ring-1 ring-slate-100 [&>div]:!mt-0">
              {contacts}
            </div>
          </div>
        </header>

        {/* Body grid aligned with header (58% / 42% gap-8 px-10) */}
        <div className="relative grid grid-cols-[58%_42%] gap-8 px-10 pb-10">
          <main
            style={{ '--figma-profile-accent': theme.primary_color } as CSSProperties}
            className="relative border-r border-slate-200 pr-8"
          >
            {/* Elegant vertical timeline track & nodes */}
            <div className="relative before:absolute before:left-2 before:top-4 before:bottom-2 before:w-[2px] before:bg-slate-200/90 [&_section]:relative [&_section]:pl-7 [&_section]:before:absolute [&_section]:before:left-[3px] [&_section]:before:top-2 [&_section]:before:h-3 [&_section]:before:w-3 [&_section]:before:rounded-full [&_section]:before:border-2 [&_section]:before:border-white [&_section]:before:bg-[var(--figma-profile-accent)] [&_section]:before:ring-2 [&_section]:before:ring-[var(--figma-profile-accent)]/25">
              {renderGroup(leftKeys)}
            </div>
          </main>
          <aside className="min-w-0">
            {renderGroup(rightKeys)}
          </aside>
        </div>
      </CVDocumentSurface>
    )
  }

  if (variant === 'figma-clean-sidebar') {
    const mainKeys: CVSectionKey[] = ['summary', 'experience', 'projects', 'certificates']
    const asideKeys: CVSectionKey[] = ['skills', 'education', 'languages']
    return (
      <CVDocumentSurface theme={theme} mode={mode} className={className}>
        <div className="grid min-h-[297mm] grid-cols-[34%_66%]">
          <main className="col-start-2 row-start-1 px-10 py-12">
            <header className="border-b-2 pb-6" style={{ borderColor: theme.primary_color }}>
              {identity}
            </header>
            {renderGroup(mainKeys)}
          </main>
          <aside className="col-start-1 row-start-1 border-r border-slate-200 bg-zinc-50 px-7 py-10">
            <div className="flex justify-center [&>button]:!h-32 [&>button]:!w-28 [&>div]:!h-32 [&>div]:!w-28 [&_img]:!h-32 [&_img]:!w-28">
              {avatar}
            </div>
            <div className="mt-6 border-y border-zinc-300 py-4">{contacts}</div>
            {renderGroup(asideKeys)}
          </aside>
        </div>
      </CVDocumentSurface>
    )
  }

  if (variant === 'figma-monochrome-portrait') {
    const profession = cv.title || (locale === 'en' ? 'Profession' : 'Chuyên môn')
    const softwareLabel = locale === 'en' ? 'Software Proficiencies' : 'Kỹ năng chuyên môn'
    const profileContacts = [
      { value: info.full_name, fieldId: 'personal.full_name' },
      { value: info.phone, fieldId: 'personal.phone' },
      { value: info.email, fieldId: 'personal.email' },
      { value: info.address, fieldId: 'personal.address' },
      { value: info.linkedin_url, fieldId: undefined },
      { value: info.github_url, fieldId: 'personal.github' },
      { value: info.portfolio_url, fieldId: undefined },
    ].filter((entry) => Boolean(entry.value))

    return (
      <CVDocumentSurface theme={theme} mode={mode} printBackground="dark" className={`overflow-hidden !bg-zinc-950 !text-white ${className}`}>
        <div
          className="relative min-h-[297mm] overflow-hidden px-7 pb-8 pt-7"
          style={{
            backgroundImage: `linear-gradient(180deg, rgb(0 0 0 / 0.08) 0%, rgb(0 0 0 / 0.48) 48%, rgb(0 0 0 / 0.78) 100%), url(${monochromeFabricBackground})`,
            backgroundPosition: 'center',
            backgroundSize: 'cover',
          }}
        >
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_72%_8%,rgb(255_255_255_/_0.22),transparent_34%)]" />
          <div aria-hidden="true" className="pointer-events-none absolute left-[30%] right-0 top-0 h-[155px] bg-gradient-to-b from-white/75 via-white/50 to-white/10" />

          <header className="relative z-10 grid min-h-[350px] grid-cols-[30%_70%] items-start gap-5">
            <div className="relative flex h-[350px] items-start justify-center overflow-visible">
              <div className="relative h-[350px] w-full overflow-hidden border border-white/20 bg-zinc-800 shadow-2xl [&>button]:!h-[350px] [&>button]:!w-full [&>button]:!rounded-none [&>div]:!h-[350px] [&>div]:!w-full [&>div]:!rounded-none [&_div]:!h-full [&_div]:!w-full [&_div]:!rounded-none [&_img]:!h-[350px] [&_img]:!w-full [&_img]:!rounded-none [&_img]:!object-cover [&_img]:!object-top">
                {avatar}
              </div>
              <div className="absolute -left-3 top-7 z-20 flex h-14 w-14 items-center justify-center rounded-full bg-white text-[28px] font-black leading-none text-amber-400 shadow-xl ring-1 ring-black/5" aria-hidden="true">✎</div>
            </div>

            <div className="min-w-0 px-3 pt-9">
              {editing && editor
                ? <CVInlineInput fieldId="title" value={cv.title} onChange={editor.onTitleChange} label="Vị trí ứng tuyển" placeholder={profession} className="text-[42px] font-black leading-none tracking-tight text-black" />
                : <h1 className="break-words text-[44px] font-black leading-none tracking-tight text-black"><CVFormattedText value={profession} fieldId="title" /></h1>}

              <div className="mt-4 max-w-[92%] text-[10px] leading-[1.65] text-zinc-900">
                <span className="sr-only">{labels.objective}</span>
                {editing && editor
                  ? <CVInlineTextarea fieldId="summary" value={cv.career_objective} onChange={editor.onCareerObjectiveChange} label={labels.objective} placeholder={locale === 'en' ? 'Introduce your professional profile' : 'Giới thiệu ngắn về hồ sơ nghề nghiệp'} rows={3} className="text-[10px]" />
                  : cv.career_objective ? <p className="whitespace-pre-wrap"><CVFormattedText value={cv.career_objective} fieldId="summary" /></p> : null}
              </div>

              <div className="mt-5 rounded-[24px] border border-white/45 bg-black/60 px-5 py-4 text-white shadow-[inset_0_1px_0_rgb(255_255_255_/_0.18),0_12px_35px_rgb(0_0_0_/_0.28)] backdrop-blur-sm">
                {editing && editor ? (
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                    <CVInlineInput fieldId="personal.full_name" value={info.full_name} onChange={(full_name) => editor.onPersonalInfoChange({ full_name })} label={labels.fullName} placeholder={labels.fullName} className="text-[10px] text-white" />
                    <CVInlineInput fieldId="personal.phone" value={info.phone} onChange={(phone) => editor.onPersonalInfoChange({ phone })} label="Số điện thoại" placeholder="Số điện thoại" className="text-[10px] text-white" />
                    <CVInlineInput fieldId="personal.email" type="email" value={info.email} onChange={(email) => editor.onPersonalInfoChange({ email })} label="Email" placeholder="Email" className="text-[10px] text-white" />
                    <CVInlineInput fieldId="personal.address" value={info.address} onChange={(address) => editor.onPersonalInfoChange({ address })} label="Địa chỉ" placeholder="Địa chỉ" className="text-[10px] text-white" />
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-[9px] leading-4 text-zinc-100">
                    {profileContacts.map((entry, index) => <p key={`${entry.value}-${index}`} className="min-w-0 truncate">{entry.fieldId ? <CVFormattedText value={entry.value} fieldId={entry.fieldId} /> : entry.value}</p>)}
                  </div>
                )}
              </div>

              {isVisible('skills') && (
                <div className="mt-5 text-zinc-100">
                  <h2 className="text-[11px] font-black tracking-[0.08em]">{labels.skills}</h2>
                  <div className="mt-2 grid grid-cols-4 gap-x-4 gap-y-2 text-[8px] leading-3">
                    {cv.skills.slice(0, 12).map((item, index) => <p key={`${item.name}-${index}`} className="before:mr-1.5 before:content-['•']"><CVFormattedText value={item.name} fieldId={`skill.${index}.name`} /></p>)}
                  </div>
                </div>
              )}
            </div>
          </header>

          <div className="relative z-10 mt-6 grid grid-cols-[45%_55%] items-start gap-3">
            <aside className="space-y-3">
              {isVisible('skills') && (
                <section className="rounded-[26px] border border-white/40 bg-black/55 px-5 py-5 shadow-[inset_0_1px_0_rgb(255_255_255_/_0.18),0_14px_30px_rgb(0_0_0_/_0.22)] backdrop-blur-sm">
                  <h2 className="text-center text-[11px] font-black tracking-[0.12em] text-white">{softwareLabel}</h2>
                  {editing && editor ? (
                    <div className="mt-4"><CVInlineSkillsEditor skills={cv.skills} locale={locale} onChange={editor.onSkillChange} onAdd={editor.onAddSkill} onDelete={editor.onDeleteSkill} onMoveUp={editor.onMoveSkillUp} onMoveDown={editor.onMoveSkillDown} onReorder={editor.onReorderSkills} /></div>
                  ) : (
                    <div className="mt-4 grid grid-cols-4 gap-3">
                      {cv.skills.slice(0, 8).map((item, index) => (
                        <div key={`${item.name}-${index}`} className="min-w-0 text-center">
                          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl border border-white/35 bg-black/65 text-[11px] font-black uppercase text-white shadow-inner">{item.name.trim().slice(0, 2)}</div>
                          <p className="mt-1.5 truncate text-[7px] text-zinc-300"><CVFormattedText value={item.name} fieldId={`skill.${index}.name`} /></p>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              )}

              {isVisible('certificates') && (
                <section className="rounded-[26px] border border-white/40 bg-black/55 px-5 pb-5 pt-1 shadow-[inset_0_1px_0_rgb(255_255_255_/_0.18),0_14px_30px_rgb(0_0_0_/_0.22)] backdrop-blur-sm [&_section]:!mt-4 [&_section>div:first-child]:justify-center [&_section>div:first-child]:!border-0 [&_section_h2]:!text-center [&_section_h2]:!tracking-[0.12em]">
                  {renderGroup(['certificates'])}
                </section>
              )}

              {isVisible('languages') && (
                <section className="rounded-[26px] border border-white/40 bg-black/55 px-5 pb-5 pt-1 shadow-[inset_0_1px_0_rgb(255_255_255_/_0.18),0_14px_30px_rgb(0_0_0_/_0.22)] backdrop-blur-sm [&_section]:!mt-4 [&_section>div:first-child]:justify-center [&_section>div:first-child]:!border-0 [&_section_h2]:!text-center [&_section_h2]:!tracking-[0.12em]">
                  {renderGroup(['languages'])}
                </section>
              )}
            </aside>

            <main className="min-h-[540px] rounded-tl-[28px] bg-black/90 px-6 pb-7 pt-1 shadow-2xl ring-1 ring-white/10 [&_section]:!mt-5 [&_section_h2]:!tracking-[0.12em]">
              {renderGroup(['experience'])}
              {renderGroup(['projects'])}
              {renderGroup(['education'])}
            </main>
          </div>
        </div>
      </CVDocumentSurface>
    )
  }

  if (variant === 'figma-editorial-portrait') {
    const aboutLabel = labels.objective
    const workLabel = locale === 'en' ? 'Work' : 'Kinh nghiệm'
    const expertiseLabel = locale === 'en' ? 'Expertise' : 'Chuyên môn'
    const expertise = Array.from(new Set(
      cv.projects.flatMap((project) => [project.role, ...project.technologies]).filter((value): value is string => Boolean(value)),
    )).slice(0, 8)

    return (
      <CVDocumentSurface theme={theme} mode={mode} className={'overflow-hidden ' + className}>
        <div className="grid min-h-[297mm] grid-cols-[62%_38%] bg-white text-[#231F20]">
          <main className="min-w-0 px-8 pb-9 pt-7">
            <header className="grid grid-cols-[minmax(0,1fr)_168px] items-center gap-5">
              <div className="flex min-w-0 items-center pr-2">
                <div className="w-full break-words text-[28px] font-black uppercase leading-[1.08] tracking-[0.06em] text-[#231F20]">
                  {editing && editor
                    ? <CVInlineInput fieldId="personal.full_name" value={info.full_name} onChange={(full_name) => editor.onPersonalInfoChange({ full_name })} label={labels.fullName} placeholder={labels.fullName} className="text-[28px] font-black uppercase leading-[1.08] text-[#231F20]" />
                    : <CVFormattedText value={info.full_name || labels.fullName} fieldId="personal.full_name" />}
                </div>
              </div>
              <div className="relative flex justify-center">
                <div className="h-[245px] w-[168px] overflow-hidden bg-stone-100 shadow-sm [&>button]:!h-[245px] [&>button]:!w-[168px] [&>button]:!rounded-none [&>div]:!h-[245px] [&>div]:!w-[168px] [&>div]:!rounded-none [&_div]:!h-full [&_div]:!w-full [&_div]:!rounded-none [&_img]:!h-[245px] [&_img]:!w-[168px] [&_img]:!rounded-none [&_img]:!object-cover [&_img]:!object-top">
                  {avatar}
                </div>
                <div className="absolute -bottom-2 right-[9%] flex h-12 w-12 items-center justify-center rounded-full border-2 border-dashed border-stone-800 bg-white text-[24px] font-black leading-none text-amber-400 shadow-md" aria-hidden="true">✎</div>
              </div>
            </header>

            {isVisible('summary') && (
              <section className="mt-5 border-2 px-3 py-2.5" style={{ borderColor: theme.primary_color }}>
                <h2 className="text-[10px] font-extrabold uppercase tracking-[0.1em]">{aboutLabel}</h2>
                {editing && editor
                  ? <div className="mt-1 space-y-1">
                      <CVInlineInput fieldId="title" value={cv.title} onChange={editor.onTitleChange} label="Vị trí ứng tuyển" placeholder={labels.professionalProfile} className="text-[10px] font-bold" />
                      <CVInlineTextarea fieldId="summary" value={cv.career_objective} onChange={editor.onCareerObjectiveChange} label={labels.objective} placeholder={locale === 'en' ? 'Introduce your professional profile' : 'Giới thiệu ngắn về hồ sơ nghề nghiệp'} rows={3} className="text-[9px] leading-[1.55]" />
                    </div>
                  : <div className="mt-1 text-[9px] leading-[1.55]">
                      {cv.title && <p className="font-bold"><CVFormattedText value={cv.title} fieldId="title" /></p>}
                      {cv.career_objective && <p className="mt-1 whitespace-pre-wrap"><CVFormattedText value={cv.career_objective} fieldId="summary" /></p>}
                    </div>}
              </section>
            )}

            {isVisible('skills') && (
              <section className="mt-4">
                <h2 className="text-[12px] font-extrabold tracking-[0.03em]">{labels.skills}</h2>
                {editing && editor ? (
                  <div className="mt-2"><CVInlineSkillsEditor skills={cv.skills} locale={locale} onChange={editor.onSkillChange} onAdd={editor.onAddSkill} onDelete={editor.onDeleteSkill} onMoveUp={editor.onMoveSkillUp} onMoveDown={editor.onMoveSkillDown} onReorder={editor.onReorderSkills} /></div>
                ) : (
                  <div className="mt-2 grid grid-cols-2 gap-x-5 gap-y-1.5">
                    {cv.skills.slice(0, 8).map((item, index) => (
                      <div key={item.name + '-' + index} className="flex min-w-0 items-center gap-2 text-[9px] font-medium">
                        <span className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-sm text-[8px] font-black text-white" style={{ backgroundColor: index % 2 === 0 ? '#139CA4' : '#D95F83' }}>{item.name.trim().slice(0, 1).toUpperCase()}</span>
                        <span className="truncate"><CVFormattedText value={item.name} fieldId={'skill.' + index + '.name'} /></span>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

            {(isVisible('experience') || isVisible('projects')) && (
              <section className="mt-5">
                <h2 className="text-[13px] font-extrabold tracking-[0.03em]">{workLabel}</h2>
                <div className="[&_section]:!mt-3.5 [&_section>div:first-child]:hidden [&_section_strong]:!text-[10px] [&_section_strong]:!font-bold [&_section_p]:!text-[9px] [&_section_p]:!leading-[1.55] [&_section_span]:!text-[8px]">
                  {renderGroup(['experience'])}
                  {renderGroup(['projects'])}
                </div>
              </section>
            )}
          </main>

          <aside className="relative min-w-0 overflow-hidden px-7 pb-9 pt-[98px]" style={{ backgroundColor: theme.primary_color }}>
            <div className="absolute -right-11 -top-14 h-32 w-32 rounded-full border-[7px] border-[#231F20] bg-[#F8F3EE] shadow-xl" aria-hidden="true">
              <div className="m-2 h-[calc(100%_-_16px)] rounded-full bg-[#C99A45] shadow-inner ring-2 ring-stone-700/30" />
            </div>

            <section className="text-[9px] font-medium leading-[1.55] text-[#231F20] [&>div]:!mt-0 [&>div]:space-y-2.5 [&_p]:!text-[9px] [&_p]:relative [&_p]:pl-3.5 [&_p]:before:absolute [&_p]:before:left-0 [&_p]:before:top-[0.5em] [&_p]:before:h-1 [&_p]:before:w-1 [&_p]:before:bg-[#231F20]">
              {contacts}
            </section>

            {isVisible('education') && (
              <section className="mt-9 [&_section]:!mt-0 [&_section>div:first-child]:!border-0 [&_section_h2]:!text-[11px] [&_section_h2]:!font-extrabold [&_section_h2]:!tracking-[0.06em] [&_section_h2]:!text-[#231F20] [&_section_p]:!text-[9px] [&_section_p]:!leading-[1.5] [&_section_strong]:!text-[9px]">
                {renderGroup(['education'])}
              </section>
            )}

            {isVisible('skills') && (
              <section className="mt-10">
                <h2 className="text-[11px] font-extrabold tracking-[0.06em]">{labels.skills}</h2>
                <div className="mt-3 grid grid-cols-2 gap-x-5 gap-y-2.5 text-[9px] leading-[1.45]">
                  {cv.skills.slice(0, 10).map((item, index) => <p key={item.name + '-' + index} className="before:mr-1.5 before:content-['•']"><CVFormattedText value={item.name} fieldId={'skill.' + index + '.name'} /></p>)}
                </div>
              </section>
            )}

            {(editing || expertise.length > 0) && isVisible('projects') && (
              <section className="mt-10">
                <h2 className="text-[11px] font-extrabold tracking-[0.06em]">{expertiseLabel}</h2>
                <div className="mt-3 grid grid-cols-2 gap-x-5 gap-y-2.5 text-[9px] leading-[1.45]">
                  {expertise.map((item) => <p key={item} className="before:mr-1.5 before:content-['•']">{item}</p>)}
                  {editing && expertise.length === 0 && <p className="col-span-2 opacity-60">{locale === 'en' ? 'Add project roles or technologies' : 'Thêm vai trò hoặc công nghệ trong dự án'}</p>}
                </div>
              </section>
            )}

            {isVisible('languages') && (
              <section className="mt-10 [&_section]:!mt-0 [&_section>div:first-child]:!border-0 [&_section_h2]:!text-[11px] [&_section_h2]:!font-extrabold [&_section_h2]:!tracking-[0.06em] [&_section_h2]:!text-[#231F20] [&_section_p]:!text-[9px] [&_section_p]:!leading-[1.5]">
                {renderGroup(['languages'])}
              </section>
            )}

            {isVisible('certificates') && (
              <section className="mt-10 [&_section]:!mt-0 [&_section>div:first-child]:!border-0 [&_section_h2]:!text-[11px] [&_section_h2]:!font-extrabold [&_section_h2]:!tracking-[0.06em] [&_section_h2]:!text-[#231F20] [&_section_p]:!text-[9px] [&_section_p]:!leading-[1.5] [&_section_strong]:!text-[9px]">
                {renderGroup(['certificates'])}
              </section>
            )}
          </aside>
        </div>
      </CVDocumentSurface>
    )
  }

  // dark-columns
  const asideKeys: CVSectionKey[] = ['summary', 'skills', 'education', 'languages']
  const mainKeys: CVSectionKey[] = ['experience', 'projects', 'certificates']
  return (
    <CVDocumentSurface theme={theme} mode={mode} printBackground="dark" className={`!bg-slate-950 !text-slate-100 ${className}`}>
      <header className="grid grid-cols-[1fr_auto] items-end gap-8 border-b border-white/15 px-10 py-10">
        <div>{identity}{contacts}</div>
        {avatar}
      </header>
      <div className="grid grid-cols-[38%_62%]">
        <aside className="bg-slate-900 px-8 py-8">{renderGroup(asideKeys)}</aside>
        <main className="px-9 py-8">{renderGroup(mainKeys)}</main>
      </div>
    </CVDocumentSurface>
  )
}
