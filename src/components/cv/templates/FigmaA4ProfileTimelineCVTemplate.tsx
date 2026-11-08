import { useState, type ReactNode } from 'react'
import { Camera } from 'lucide-react'
import CVDocumentSurface from '../CVDocumentSurface'
import { CVFormattedText } from '../CVRichTextField'
import { CVInlineAddButton, CVInlineInput, CVInlineSelect, CVInlineTextarea } from '../CVInlineFields'
import CVInlineItemWrapper from '../CVInlineItemWrapper'
import CVInlineSkillsEditor from '../CVInlineSkillsEditor'
import CVSectionWrapper from '../CVSectionWrapper'
import { formatCVDateForDisplay, formatCVLanguageProficiency, getCVLabels } from '../cvLocale'
import type { CVLanguageProficiency } from '../../../types/cv'
import type { CVSectionKey, CVTemplateComponentProps } from './types'

type VisibilityKey = 'summary' | 'experience' | 'education' | 'skills' | 'projects' | 'certificates' | 'languages'

function Avatar({
  url,
  name,
  candidateLabel,
  portraitLabel,
  defaultAvatarLabel,
  onChoosePhoto,
}: {
  url?: string | null
  name?: string | null
  candidateLabel: string
  portraitLabel: string
  defaultAvatarLabel: string
  onChoosePhoto?: () => void
}) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null)
  const failed = Boolean(url && failedUrl === url)
  const initials = (name || candidateLabel)
    .split(/\s+/)
    .filter(Boolean)
    .slice(-2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()

  const image = !url || failed ? (
    <div
      aria-label={defaultAvatarLabel}
      className="flex h-28 w-28 items-center justify-center rounded-full bg-slate-100 text-2xl font-black text-slate-500 shadow-inner"
    >
      {initials}
    </div>
  ) : (
    <img
      src={url}
      alt={`${portraitLabel}: ${name || candidateLabel}`}
      onError={() => setFailedUrl(url)}
      className="h-28 w-28 rounded-full object-cover"
    />
  )

  if (!onChoosePhoto) return <div className="h-28 w-28 shrink-0">{image}</div>

  return (
    <button
      type="button"
      onClick={onChoosePhoto}
      aria-label="Tải ảnh CV"
      title="Bấm để tải ảnh CV"
      className="group relative h-28 w-28 shrink-0 overflow-hidden rounded-full outline-none ring-offset-2 transition hover:ring-2 hover:ring-[#8FCDF4] focus-visible:ring-2 focus-visible:ring-[#8FCDF4]"
    >
      {image}
      <span className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1 bg-slate-950/70 px-1 py-1.5 text-[9px] font-bold text-white opacity-0 transition group-hover:opacity-100">
        <Camera size={11} aria-hidden="true" />
        Tải ảnh
      </span>
    </button>
  )
}

function SectionHeading({ title }: { title: string }) {
  return (
    <h2 className="mb-3 text-base font-bold tracking-tight text-slate-900">
      {title}
    </h2>
  )
}

const dateText = (value: Parameters<typeof formatCVDateForDisplay>[0], locale: 'vi' | 'en') =>
  formatCVDateForDisplay(value, locale)

const dateRange = (
  startValue: Parameters<typeof formatCVDateForDisplay>[0],
  endValue: Parameters<typeof formatCVDateForDisplay>[0],
  locale: 'vi' | 'en',
  presentLabel: string,
  current?: boolean
) => [dateText(startValue, locale), current ? presentLabel : dateText(endValue, locale)].filter(Boolean).join(' – ')

export default function FigmaA4ProfileTimelineCVTemplate({
  cv,
  presentation,
  mode,
  theme,
  className = '',
  photoUrl,
  editor,
}: CVTemplateComponentProps) {
  const locale = presentation.locale
  const labels = getCVLabels(locale)
  const info = { ...cv.personal_info, avatar_url: photoUrl ?? cv.personal_info.avatar_url }
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

  const isVisible = (key: VisibilityKey) =>
    presentation.sectionVisibility?.[key] !== false && (editing || hasContent[key])

  // Typography for name: First name light, Last name bold uppercase
  const rawName = info.full_name || labels.fullName
  const nameParts = rawName.trim().split(/\s+/)
  const hasMultiple = nameParts.length > 1
  const firstPart = hasMultiple ? nameParts.slice(0, -1).join(' ') : ''
  const lastPart = hasMultiple ? nameParts[nameParts.length - 1] : rawName

  const identity = editing && editor ? (
    <div className="min-w-0 space-y-1">
      <CVInlineInput
        fieldId="personal.full_name"
        value={info.full_name}
        onChange={(full_name) => editor.onPersonalInfoChange({ full_name })}
        label="Họ và tên"
        placeholder={labels.fullName}
        className="text-3xl font-extrabold uppercase tracking-tight text-slate-950"
      />
      <div className="mt-1">
        <p className="text-sm font-normal text-[#4299E1]">
          {locale === 'en' ? "Hello there, I'm a" : 'Xin chào, tôi là'}
        </p>
        <CVInlineInput
          fieldId="title"
          value={cv.title}
          onChange={editor.onTitleChange}
          label="Vị trí ứng tuyển"
          placeholder={labels.professionalProfile}
          className="text-base font-extrabold text-slate-900 leading-snug"
        />
        {info.address && (
          <p className="mt-0.5 text-sm font-normal text-[#4299E1]">
            {locale === 'en' ? `Based in ${info.address}` : `sinh sống tại ${info.address}`}
          </p>
        )}
      </div>
    </div>
  ) : (
    <div>
      <h1 className="leading-tight">
        {/* Full canonical name for assistive tech, regex checks and deterministic ATS parsing */}
        <span className="sr-only">
          <CVFormattedText value={rawName} fieldId="personal.full_name" />
        </span>
        {/* Visual stylized split typography matching Florian Argaud Figma community design */}
        <span aria-hidden="true">
          {firstPart ? (
            <>
              <span className="block text-3xl font-light tracking-tight text-slate-800">{firstPart}</span>
              <span className="mt-0.5 block text-3xl font-extrabold uppercase tracking-wide text-slate-950">
                {lastPart}
              </span>
            </>
          ) : (
            <span className="block text-3xl font-extrabold uppercase tracking-tight text-slate-950">
              {rawName}
            </span>
          )}
        </span>
      </h1>
      <div aria-hidden="true" className="my-3.5 h-1.5 w-14 rounded-full bg-[#8FCDF4]" />
      <div className="mt-1">
        <p className="text-sm font-normal text-[#4299E1]">
          {locale === 'en' ? "Hello there, I'm a" : 'Xin chào, tôi là'}
        </p>
        <strong className="block text-base font-extrabold leading-snug text-slate-900">
          <CVFormattedText value={cv.title || labels.professionalProfile} fieldId="title" />
        </strong>
        {info.address && (
          <p className="mt-0.5 text-sm font-normal text-[#4299E1]">
            {locale === 'en' ? `Based in ${info.address}` : `sinh sống tại ${info.address}`}
          </p>
        )}
      </div>
    </div>
  )

  const contactEntries = [
    { value: info.email, fieldId: 'personal.email', placeholder: 'email@example.com' },
    { value: info.phone, fieldId: 'personal.phone', placeholder: '0900 000 000' },
    { value: info.portfolio_url, placeholder: 'Portfolio' },
    { value: info.linkedin_url, placeholder: 'LinkedIn' },
    { value: info.github_url, fieldId: 'personal.github', placeholder: 'GitHub' },
    { value: info.address, fieldId: 'personal.address', placeholder: 'Địa chỉ' },
  ].filter((entry) => Boolean(entry.value))

  const contacts = editing && editor ? (
    <div className="relative z-10 mt-4 flex w-full flex-col items-center gap-2">
      <div className="w-full max-w-[220px] rounded-full bg-[#8FCDF4] px-4 py-1 text-center shadow-md">
        <CVInlineInput
          fieldId="personal.email"
          type="email"
          value={info.email}
          onChange={(email) => editor.onPersonalInfoChange({ email })}
          label="Email"
          placeholder="Email"
          className="text-center text-xs font-semibold text-white placeholder:text-white/60"
        />
      </div>
      <div className="w-full max-w-[220px] rounded-full bg-[#FBD38D] px-4 py-1 text-center shadow-md">
        <CVInlineInput
          fieldId="personal.phone"
          value={info.phone}
          onChange={(phone) => editor.onPersonalInfoChange({ phone })}
          label="Số điện thoại"
          placeholder="Số điện thoại"
          className="text-center text-xs font-semibold text-white placeholder:text-white/60"
        />
      </div>
      <div className="w-full max-w-[220px] rounded-full bg-[#8FCDF4] px-4 py-1 text-center shadow-md">
        <CVInlineInput
          fieldId="personal.github"
          type="url"
          value={info.github_url}
          onChange={(github_url) => editor.onPersonalInfoChange({ github_url })}
          label="GitHub / Portfolio"
          placeholder="GitHub / Portfolio"
          className="text-center text-xs font-semibold text-white placeholder:text-white/60"
        />
      </div>
      <div className="w-full max-w-[220px] rounded-full bg-[#FBD38D] px-4 py-1 text-center shadow-md">
        <CVInlineInput
          fieldId="personal.address"
          value={info.address}
          onChange={(address) => editor.onPersonalInfoChange({ address })}
          label="Địa chỉ"
          placeholder="Địa chỉ"
          className="text-center text-xs font-semibold text-white placeholder:text-white/60"
        />
      </div>
    </div>
  ) : (
    <div className="relative z-10 mt-4 flex w-full flex-col items-center gap-2">
      {contactEntries.map((entry, index) => {
        const isPeach = index === 1 || index === 3
        const bgClass = isPeach
          ? 'bg-[#FBD38D] shadow-[#FBD38D]/30'
          : 'bg-[#8FCDF4] shadow-[#8FCDF4]/30'
        return (
          <div
            key={`${entry.value}-${index}`}
            className={`w-full max-w-[220px] rounded-full px-4 py-1.5 text-center text-xs font-semibold text-white shadow-md transition-transform ${bgClass}`}
          >
            <span className="block truncate">
              {entry.fieldId ? <CVFormattedText value={entry.value} fieldId={entry.fieldId} /> : entry.value}
            </span>
          </div>
        )
      })}
    </div>
  )

  const defaultOrder: CVSectionKey[] = [
    'summary',
    'experience',
    'certificates',
    'languages',
    'projects',
    'skills',
    'education',
  ]
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
    summary: isVisible('summary') ? (
      <section className="mt-4">
        <SectionHeading title={labels.objective} />
        {editing && editor ? (
          <CVInlineTextarea
            fieldId="summary"
            value={cv.career_objective}
            onChange={editor.onCareerObjectiveChange}
            label={labels.objective}
            placeholder={locale === 'en' ? 'Write your career objective' : 'Nhập mục tiêu nghề nghiệp'}
            rows={3}
            className="text-xs text-slate-600 leading-relaxed"
          />
        ) : cv.career_objective ? (
          <p className="whitespace-pre-wrap text-xs leading-relaxed text-slate-600">
            <CVFormattedText value={cv.career_objective} fieldId="summary" />
          </p>
        ) : null}
      </section>
    ) : null,

    experience: isVisible('experience') ? (
      <section className="mt-6">
        <SectionHeading title={labels.experience} />
        {editing && editor ? (
          <div className="space-y-4">
            {cv.experiences.map((item, index) => (
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
                  <CVInlineInput
                    fieldId={`experience.${index}.position`}
                    value={item.position}
                    onChange={(position) => editor.onExperienceChange(index, { position })}
                    label="Vị trí công việc"
                    placeholder="Vị trí công việc"
                    className="text-sm font-bold"
                  />
                  <CVInlineInput
                    fieldId={`experience.${index}.company`}
                    value={item.company_name}
                    onChange={(company_name) => editor.onExperienceChange(index, { company_name })}
                    label="Tên công ty"
                    placeholder="Tên công ty"
                    className="text-xs font-semibold"
                  />
                  <div className="grid grid-cols-2 gap-1">
                    <CVInlineInput
                      value={dateText(item.start_date, locale)}
                      onChange={(start_date) => editor.onExperienceChange(index, { start_date })}
                      label="Thời gian bắt đầu"
                      placeholder="Bắt đầu"
                      className="text-[10px]"
                    />
                    <CVInlineInput
                      value={dateText(item.end_date, locale)}
                      onChange={(end_date) => editor.onExperienceChange(index, { end_date, is_current: false })}
                      label="Thời gian kết thúc"
                      placeholder={labels.present}
                      className="text-[10px]"
                    />
                  </div>
                  <CVInlineTextarea
                    fieldId={`experience.${index}.description`}
                    value={item.description}
                    onChange={(description) => editor.onExperienceChange(index, { description })}
                    label="Mô tả kinh nghiệm"
                    placeholder="Mô tả kinh nghiệm"
                    rows={2}
                    className="text-xs"
                  />
                </div>
              </CVInlineItemWrapper>
            ))}
            <CVInlineAddButton onClick={editor.onAddExperience}>Thêm kinh nghiệm</CVInlineAddButton>
          </div>
        ) : (
          <div className="relative ml-2 space-y-6 border-l-2 border-[#8FCDF4] pl-5">
            {cv.experiences.map((item, index) => (
              <div key={`${item.company_name}-${index}`} className="relative break-inside-avoid">
                {/* Donut Node */}
                <div
                  aria-hidden="true"
                  className="absolute -left-[27px] top-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-[#8FCDF4] bg-white ring-2 ring-[#8FCDF4]/20"
                >
                  <div className="h-1.5 w-1.5 rounded-full bg-[#8FCDF4]" />
                </div>
                {/* Date */}
                <div className="text-xs font-semibold uppercase tracking-wide text-[#8FCDF4]">
                  {dateRange(item.start_date, item.end_date, locale, labels.present, item.is_current)}
                </div>
                {/* Position first for ATS domestic compliance */}
                <div className="mt-0.5 text-sm font-bold uppercase tracking-tight text-slate-900">
                  <CVFormattedText value={item.position} fieldId={`experience.${index}.position`} />
                </div>
                {/* Company Name */}
                <div className="mt-0.5 text-xs font-semibold text-slate-600">
                  <CVFormattedText value={item.company_name} fieldId={`experience.${index}.company`} />
                </div>
                {/* Description */}
                {item.description && (
                  <p className="mt-1 whitespace-pre-wrap text-xs leading-relaxed text-slate-600">
                    <CVFormattedText value={item.description} fieldId={`experience.${index}.description`} />
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    ) : null,

    certificates: isVisible('certificates') ? (
      <section className="mt-6">
        <SectionHeading title={labels.certificates} />
        {editing && editor ? (
          <div className="space-y-2">
            {cv.certificates.map((item, index) => (
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
                  <CVInlineInput
                    fieldId={`certificate.${index}.name`}
                    value={item.name}
                    onChange={(name) => editor.onCertificateChange(index, { name })}
                    label="Tên chứng chỉ"
                    placeholder="Tên chứng chỉ"
                    className="text-xs font-bold"
                  />
                  <CVInlineInput
                    fieldId={`certificate.${index}.organization`}
                    value={item.organization}
                    onChange={(organization) => editor.onCertificateChange(index, { organization })}
                    label="Tổ chức cấp"
                    placeholder="Tổ chức cấp"
                    className="text-[10px]"
                  />
                </div>
              </CVInlineItemWrapper>
            ))}
            <CVInlineAddButton onClick={editor.onAddCertificate}>Thêm chứng chỉ</CVInlineAddButton>
          </div>
        ) : (
          <div className="space-y-2">
            {cv.certificates.map((item, index) => (
              <div key={`${item.name}-${index}`} className="text-xs">
                <strong className="font-bold text-slate-900">
                  <CVFormattedText value={item.name} fieldId={`certificate.${index}.name`} />
                </strong>
                {item.organization && (
                  <span className="text-slate-600">
                    {' '}· <CVFormattedText value={item.organization} fieldId={`certificate.${index}.organization`} />
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    ) : null,

    languages: isVisible('languages') ? (
      <section className="mt-6">
        <SectionHeading title={labels.languages} />
        {editing && editor ? (
          <div className="space-y-2">
            {cv.languages.map((item, index) => (
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
                  <CVInlineInput
                    fieldId={`language.${index}.name`}
                    value={item.name}
                    onChange={(name) => editor.onLanguageChange(index, { name })}
                    label="Ngôn ngữ"
                    placeholder="Ngôn ngữ"
                    className="text-xs"
                  />
                  <CVInlineSelect
                    value={item.proficiency}
                    onChange={(event) =>
                      editor.onLanguageChange(index, {
                        proficiency: (event.target.value || null) as CVLanguageProficiency | null,
                      })
                    }
                    label="Trình độ"
                    className="text-[10px]"
                  >
                    <option value="">Trình độ</option>
                    <option value="BASIC">Cơ bản</option>
                    <option value="CONVERSATIONAL">Giao tiếp</option>
                    <option value="PROFESSIONAL">Chuyên nghiệp</option>
                    <option value="FLUENT">Thành thạo</option>
                    <option value="NATIVE">Bản ngữ</option>
                  </CVInlineSelect>
                </div>
              </CVInlineItemWrapper>
            ))}
            <CVInlineAddButton onClick={editor.onAddLanguage}>Thêm ngôn ngữ</CVInlineAddButton>
          </div>
        ) : (
          <div className="space-y-2">
            {cv.languages.map((item, index) => (
              <div key={`${item.name}-${index}`} className="text-xs">
                <strong className="font-bold uppercase text-slate-900">
                  <CVFormattedText value={item.name} fieldId={`language.${index}.name`} />
                </strong>
                {item.proficiency && (
                  <span className="text-slate-600">
                    {' '}- {formatCVLanguageProficiency(item.proficiency, locale)}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    ) : null,

    projects: isVisible('projects') ? (
      <section className="mt-6">
        <SectionHeading title={labels.projects} />
        {editing && editor ? (
          <div className="space-y-4">
            {cv.projects.map((item, index) => (
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
                  <CVInlineInput
                    fieldId={`project.${index}.name`}
                    value={item.name}
                    onChange={(name) => editor.onProjectChange(index, { name })}
                    label="Tên dự án"
                    placeholder="Tên dự án"
                    className="text-sm font-bold"
                  />
                  <CVInlineInput
                    fieldId={`project.${index}.role`}
                    value={item.role}
                    onChange={(role) => editor.onProjectChange(index, { role })}
                    label="Vai trò"
                    placeholder="Vai trò"
                    className="text-xs"
                  />
                  <CVInlineTextarea
                    fieldId={`project.${index}.description`}
                    value={item.description}
                    onChange={(description) => editor.onProjectChange(index, { description })}
                    label="Mô tả dự án"
                    placeholder="Mô tả dự án"
                    rows={2}
                    className="text-xs"
                  />
                  <CVInlineInput
                    value={item.technologies.join(', ')}
                    onChange={(value) =>
                      editor.onProjectChange(index, {
                        technologies: value
                          .split(',')
                          .map((entry) => entry.trim())
                          .filter(Boolean),
                      })
                    }
                    label="Công nghệ"
                    placeholder="React, FastAPI, PostgreSQL"
                    className="text-[10px]"
                  />
                </div>
              </CVInlineItemWrapper>
            ))}
            <CVInlineAddButton onClick={editor.onAddProject}>Thêm dự án</CVInlineAddButton>
          </div>
        ) : (
          <div className="space-y-4">
            {cv.projects.map((item, index) => (
              <div key={`${item.name}-${index}`} className="break-inside-avoid">
                <div className="flex flex-wrap items-baseline gap-1.5">
                  <strong className="text-sm font-bold text-slate-900">
                    <CVFormattedText value={item.name} fieldId={`project.${index}.name`} />
                  </strong>
                  {item.role && (
                    <span className="text-xs text-slate-500">
                      · <CVFormattedText value={item.role} fieldId={`project.${index}.role`} />
                    </span>
                  )}
                </div>
                {item.description && (
                  <p className="mt-1 whitespace-pre-wrap text-xs leading-relaxed text-slate-600">
                    <CVFormattedText value={item.description} fieldId={`project.${index}.description`} />
                  </p>
                )}
                {item.technologies.length > 0 && (
                  <p className="mt-1 text-[10px] font-semibold text-[#8FCDF4]">
                    {item.technologies.join(' · ')}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    ) : null,

    skills: isVisible('skills') ? (
      <section className="mt-6">
        <SectionHeading title={labels.skills} />
        {editing && editor ? (
          <CVInlineSkillsEditor
            skills={cv.skills}
            locale={locale}
            onChange={editor.onSkillChange}
            onAdd={editor.onAddSkill}
            onDelete={editor.onDeleteSkill}
            onMoveUp={editor.onMoveSkillUp}
            onMoveDown={editor.onMoveSkillDown}
            onReorder={editor.onReorderSkills}
          />
        ) : (
          <div className="flex flex-wrap gap-2">
            {cv.skills.map((item, index) => (
              <span
                key={`${item.name}-${index}`}
                className="rounded-full bg-[#BEE3F8]/50 px-3 py-1 text-xs font-semibold text-slate-800 shadow-xs"
              >
                <CVFormattedText value={item.name} fieldId={`skill.${index}.name`} />
              </span>
            ))}
          </div>
        )}
      </section>
    ) : null,

    education: isVisible('education') ? (
      <section className="mt-6">
        <SectionHeading title={labels.education} />
        {editing && editor ? (
          <div className="space-y-3">
            {cv.educations.map((item, index) => (
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
                  <CVInlineInput
                    fieldId={`education.${index}.school`}
                    value={item.school_name}
                    onChange={(school_name) => editor.onEducationChange(index, { school_name })}
                    label="Tên trường"
                    placeholder="Tên trường"
                    className="text-xs font-bold"
                  />
                  <CVInlineInput
                    fieldId={`education.${index}.degree`}
                    value={item.degree}
                    onChange={(degree) => editor.onEducationChange(index, { degree })}
                    label="Bằng cấp"
                    placeholder="Bằng cấp / Chuyên ngành"
                    className="text-xs"
                  />
                  <div className="grid grid-cols-2 gap-1">
                    <CVInlineInput
                      value={dateText(item.start_date, locale)}
                      onChange={(start_date) => editor.onEducationChange(index, { start_date })}
                      label="Bắt đầu học"
                      placeholder="Bắt đầu"
                      className="text-[10px]"
                    />
                    <CVInlineInput
                      value={dateText(item.end_date, locale)}
                      onChange={(end_date) => editor.onEducationChange(index, { end_date, is_current: false })}
                      label="Kết thúc học"
                      placeholder="Kết thúc"
                      className="text-[10px]"
                    />
                  </div>
                </div>
              </CVInlineItemWrapper>
            ))}
            <CVInlineAddButton onClick={editor.onAddEducation}>Thêm học vấn</CVInlineAddButton>
          </div>
        ) : (
          <div className="space-y-4">
            {cv.educations.map((item, index) => (
              <div key={`${item.school_name}-${index}`} className="break-inside-avoid">
                {/* Date */}
                <div className="text-xs font-semibold text-[#8FCDF4]">
                  {dateRange(item.start_date, item.end_date, locale, labels.present, item.is_current)}
                </div>
                {/* School Name */}
                <div className="mt-0.5 text-sm font-bold text-slate-900">
                  <CVFormattedText value={item.school_name} fieldId={`education.${index}.school`} />
                </div>
                {/* Degree & Major */}
                <div className="mt-0.5 text-xs text-slate-600">
                  <CVFormattedText value={item.degree} fieldId={`education.${index}.degree`} />
                  {item.field_of_study && <span> · {item.field_of_study}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    ) : null,
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

  const avatar = (
    <Avatar
      url={info.avatar_url}
      name={info.full_name}
      candidateLabel={labels.candidate}
      portraitLabel={labels.portrait}
      defaultAvatarLabel={labels.defaultAvatar}
      onChoosePhoto={editing && editor ? editor.onChoosePhoto : undefined}
    />
  )

  const leftKeys: CVSectionKey[] = ['experience', 'certificates', 'languages']
  const rightKeys: CVSectionKey[] = ['projects', 'skills', 'education']

  return (
    <CVDocumentSurface theme={theme} mode={mode} className={`relative overflow-hidden bg-white ${className}`}>
      {/* 1. Large soft pastel sky-blue curved background in top-right */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-8 -top-8 h-[290px] w-[46%] rounded-bl-[160px] bg-[#BEE3F8]/85"
      />

      {/* 2. Floating geometric confetti matching Florian Argaud Figma community design */}
      {/* Top right blue square */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-12 top-6 h-3.5 w-3.5 rotate-12 bg-[#4299E1]"
      />
      {/* Top center orange hollow circle */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-[43%] top-6 h-4 w-4 rounded-full border-2 border-[#ED8936]"
      />
      {/* Avatar upper left orange solid square */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-[41%] top-24 h-3 w-3 rotate-12 bg-[#ED8936]"
      />
      {/* Avatar lower left blue hollow circle */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-[35%] top-36 h-5 w-5 rounded-full border-2 border-[#63B3ED]"
      />
      {/* Right edge middle blue hollow circle */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-6 top-36 h-4 w-4 rounded-full border-2 border-[#63B3ED]"
      />
      {/* Right edge lower orange hollow circle */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-5 top-56 h-3.5 w-3.5 rounded-full border-2 border-[#ED8936]"
      />
      {/* Bottom left blue square */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-[28%] top-[252px] h-3 w-3 bg-[#4299E1]"
      />

      {/* 3. Header Grid: Left Bio / Identity & Right Avatar / Pill Contacts */}
      <header className="relative grid grid-cols-[54%_46%] items-start gap-8 px-10 pb-6 pt-10">
        <div className="min-w-0 flex flex-col justify-between">
          <div>{identity}</div>
          {/* Summary / Career Objective placed immediately after identity to respect DOM ATS order */}
          {renderGroup(['summary'])}
        </div>

        <div className="flex min-w-0 flex-col items-center">
          <div className="relative z-10 overflow-hidden rounded-full border-4 border-white bg-white shadow-xl">
            {avatar}
          </div>
          {contacts}
        </div>
      </header>

      {/* 4. Body Columns: Left Column (Experience & Timeline, Languages, Certificates) and Right Column (Projects, Skills, Education) */}
      <div className="relative grid grid-cols-[54%_46%] gap-8 px-10 pb-10">
        <main className="min-w-0">
          {renderGroup(leftKeys)}
        </main>
        <aside className="min-w-0">
          {renderGroup(rightKeys)}
        </aside>
      </div>
    </CVDocumentSurface>
  )
}
