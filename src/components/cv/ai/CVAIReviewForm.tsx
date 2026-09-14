import { Plus, Trash2 } from 'lucide-react'
import { useId, type FormEvent, type ReactNode } from 'react'
import type {
  CVCertificateItem,
  CVEducationItem,
  CVExperienceItem,
  CVPersonalInfo,
  CVProjectItem,
  CVSkillItem,
} from '../../../types/cv'
import { newReviewRow, type CVReviewDraft, type ReviewLanguageItem, type ReviewRow } from './cvReviewDraft'

type Props = {
  draft: CVReviewDraft
  submitting: boolean
  submitError: string | null
  onChange: (draft: CVReviewDraft) => void
  onSubmit: () => void
}

const fieldClass = 'mt-1.5 w-full rounded-xl bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 ring-1 ring-inset ring-slate-200 outline-none transition-[background-color,box-shadow] duration-[var(--motion-feedback)] ease-[var(--ease-gjob)] placeholder:text-slate-400 hover:bg-white focus:bg-white focus:ring-2 focus:ring-inset focus:ring-blue-500 disabled:cursor-not-allowed disabled:text-slate-400'
const labelClass = 'text-xs font-semibold text-slate-600'

function Field({ label, children, className = '', required = false }: { label: string; children: ReactNode; className?: string; required?: boolean }) {
  return <label className={`${labelClass} ${className}`}>{label}{required && <span className="ml-1 text-red-600" aria-hidden="true">*</span>}{required && <span className="sr-only"> (bắt buộc)</span>}{children}</label>
}

function EmptyHint({ label }: { label: string }) {
  return <p className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-500">Chưa phát hiện {label.toLowerCase()} trong CV.</p>
}

function Section({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  const headingId = useId()
  return <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-6" aria-labelledby={headingId}>
    <div className="mb-5">
      <h3 id={headingId} className="text-base font-bold tracking-tight text-slate-950">{title}</h3>
      <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
    </div>
    {children}
  </section>
}

function ItemCard({ label, onRemove, children }: { label: string; onRemove: () => void; children: ReactNode }) {
  return <article className="relative rounded-xl bg-slate-50 p-4 ring-1 ring-inset ring-slate-200">
    <button type="button" onClick={onRemove} aria-label={`Xóa ${label}`} className="absolute right-3 top-3 inline-flex h-11 w-11 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500">
      <Trash2 size={16} aria-hidden="true" />
    </button>
    <div className="pr-12">{children}</div>
  </article>
}

function AddButton({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return <button type="button" onClick={onClick} className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-semibold text-blue-700 transition-colors hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
    <Plus size={16} aria-hidden="true" />{children}
  </button>
}

const updateRow = <T,>(rows: ReviewRow<T>[], key: string, changes: Partial<T>): ReviewRow<T>[] => rows.map((row) => row.key === key ? { ...row, value: { ...row.value, ...changes } } : row)
const removeRow = <T,>(rows: ReviewRow<T>[], key: string): ReviewRow<T>[] => rows.filter((row) => row.key !== key)

export default function CVAIReviewForm({ draft, submitting, submitError, onChange, onSubmit }: Props) {
  const changePersonalInfo = (changes: Partial<CVPersonalInfo>) => onChange({ ...draft, personal_info: { ...draft.personal_info, ...changes } })
  const submit = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); onSubmit() }

  return <form onSubmit={submit} className="space-y-4" noValidate={false}>
    <Section title="Thông tin cá nhân" description="Kiểm tra kỹ thông tin liên hệ vì dữ liệu này sẽ được dùng trong hồ sơ của bạn.">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Họ và tên"><input className={fieldClass} value={draft.personal_info.full_name ?? ''} maxLength={255} onChange={(event) => changePersonalInfo({ full_name: event.target.value })} /></Field>
        <Field label="Email"><input className={fieldClass} type="email" value={draft.personal_info.email ?? ''} onChange={(event) => changePersonalInfo({ email: event.target.value })} /></Field>
        <Field label="Số điện thoại"><input className={fieldClass} value={draft.personal_info.phone ?? ''} maxLength={20} onChange={(event) => changePersonalInfo({ phone: event.target.value })} /></Field>
        <Field label="Ngày sinh"><input className={fieldClass} type="date" value={draft.personal_info.date_of_birth ?? ''} onChange={(event) => changePersonalInfo({ date_of_birth: event.target.value })} /></Field>
        <Field label="Địa chỉ" className="sm:col-span-2"><input className={fieldClass} value={draft.personal_info.address ?? ''} maxLength={500} onChange={(event) => changePersonalInfo({ address: event.target.value })} /></Field>
        <Field label="LinkedIn"><input className={fieldClass} type="url" value={draft.personal_info.linkedin_url ?? ''} placeholder="https://linkedin.com/in/..." onChange={(event) => changePersonalInfo({ linkedin_url: event.target.value })} /></Field>
        <Field label="GitHub"><input className={fieldClass} type="url" value={draft.personal_info.github_url ?? ''} placeholder="https://github.com/..." onChange={(event) => changePersonalInfo({ github_url: event.target.value })} /></Field>
        <Field label="Portfolio" className="sm:col-span-2"><input className={fieldClass} type="url" value={draft.personal_info.portfolio_url ?? ''} placeholder="https://..." onChange={(event) => changePersonalInfo({ portfolio_url: event.target.value })} /></Field>
      </div>
    </Section>

    <Section title="Mục tiêu nghề nghiệp" description="Điều chỉnh nội dung để thể hiện đúng định hướng của bạn.">
      <Field label="Mục tiêu"><textarea className={`${fieldClass} min-h-32 resize-y leading-6`} value={draft.career_objective} maxLength={5000} onChange={(event) => onChange({ ...draft, career_objective: event.target.value })} /></Field>
    </Section>

    <Section title="Học vấn" description="Bổ sung trường học, bằng cấp và thời gian nếu AI nhận diện còn thiếu.">
      <div className="space-y-3">{draft.educations.length === 0 && <EmptyHint label="học vấn" />}{draft.educations.map(({ key, value }, index) => <ItemCard key={key} label={`học vấn ${index + 1}`} onRemove={() => onChange({ ...draft, educations: removeRow(draft.educations, key) })}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Trường học" required><input required className={fieldClass} value={value.school_name} maxLength={255} onChange={(event) => onChange({ ...draft, educations: updateRow<CVEducationItem>(draft.educations, key, { school_name: event.target.value }) })} /></Field>
          <Field label="Bằng cấp"><input className={fieldClass} value={value.degree ?? ''} maxLength={255} onChange={(event) => onChange({ ...draft, educations: updateRow<CVEducationItem>(draft.educations, key, { degree: event.target.value }) })} /></Field>
          <Field label="Chuyên ngành" className="sm:col-span-2"><input className={fieldClass} value={value.field_of_study ?? ''} maxLength={255} onChange={(event) => onChange({ ...draft, educations: updateRow<CVEducationItem>(draft.educations, key, { field_of_study: event.target.value }) })} /></Field>
          <Field label="Bắt đầu"><input className={fieldClass} type="date" value={value.start_date ?? ''} onChange={(event) => onChange({ ...draft, educations: updateRow<CVEducationItem>(draft.educations, key, { start_date: event.target.value }) })} /></Field>
          <Field label="Kết thúc"><input className={fieldClass} type="date" min={value.start_date ?? undefined} disabled={value.is_current} value={value.is_current ? '' : value.end_date ?? ''} onChange={(event) => onChange({ ...draft, educations: updateRow<CVEducationItem>(draft.educations, key, { end_date: event.target.value }) })} /></Field>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700 sm:col-span-2"><input type="checkbox" checked={value.is_current} onChange={(event) => onChange({ ...draft, educations: updateRow<CVEducationItem>(draft.educations, key, { is_current: event.target.checked }) })} className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />Đang theo học</label>
          <Field label="Mô tả" className="sm:col-span-2"><textarea className={`${fieldClass} min-h-24 resize-y leading-6`} value={value.description ?? ''} maxLength={5000} onChange={(event) => onChange({ ...draft, educations: updateRow<CVEducationItem>(draft.educations, key, { description: event.target.value }) })} /></Field>
        </div>
      </ItemCard>)}</div>
      <AddButton onClick={() => onChange({ ...draft, educations: [...draft.educations, newReviewRow({ school_name: '', is_current: false })] })}>Thêm học vấn</AddButton>
    </Section>

    <Section title="Kinh nghiệm" description="Mỗi mục cần có công ty và vị trí để có thể xác nhận.">
      <div className="space-y-3">{draft.experiences.length === 0 && <EmptyHint label="kinh nghiệm" />}{draft.experiences.map(({ key, value }, index) => <ItemCard key={key} label={`kinh nghiệm ${index + 1}`} onRemove={() => onChange({ ...draft, experiences: removeRow(draft.experiences, key) })}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Vị trí" required><input required className={fieldClass} value={value.position} maxLength={255} onChange={(event) => onChange({ ...draft, experiences: updateRow<CVExperienceItem>(draft.experiences, key, { position: event.target.value }) })} /></Field>
          <Field label="Công ty" required><input required className={fieldClass} value={value.company_name} maxLength={255} onChange={(event) => onChange({ ...draft, experiences: updateRow<CVExperienceItem>(draft.experiences, key, { company_name: event.target.value }) })} /></Field>
          <Field label="Bắt đầu"><input className={fieldClass} type="date" value={value.start_date ?? ''} onChange={(event) => onChange({ ...draft, experiences: updateRow<CVExperienceItem>(draft.experiences, key, { start_date: event.target.value }) })} /></Field>
          <Field label="Kết thúc"><input className={fieldClass} type="date" min={value.start_date ?? undefined} disabled={value.is_current} value={value.is_current ? '' : value.end_date ?? ''} onChange={(event) => onChange({ ...draft, experiences: updateRow<CVExperienceItem>(draft.experiences, key, { end_date: event.target.value }) })} /></Field>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700 sm:col-span-2"><input type="checkbox" checked={value.is_current} onChange={(event) => onChange({ ...draft, experiences: updateRow<CVExperienceItem>(draft.experiences, key, { is_current: event.target.checked }) })} className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />Đang làm việc tại đây</label>
          <Field label="Mô tả công việc" className="sm:col-span-2"><textarea className={`${fieldClass} min-h-28 resize-y leading-6`} value={value.description ?? ''} maxLength={10000} onChange={(event) => onChange({ ...draft, experiences: updateRow<CVExperienceItem>(draft.experiences, key, { description: event.target.value }) })} /></Field>
        </div>
      </ItemCard>)}</div>
      <AddButton onClick={() => onChange({ ...draft, experiences: [...draft.experiences, newReviewRow({ company_name: '', position: '', is_current: false })] })}>Thêm kinh nghiệm</AddButton>
    </Section>

    <Section title="Kỹ năng" description="Giữ mỗi kỹ năng thành một mục riêng để hồ sơ dễ đọc.">
      <div className="space-y-3">{draft.skills.length === 0 && <EmptyHint label="kỹ năng" />}{draft.skills.map(({ key, value }, index) => <ItemCard key={key} label={`kỹ năng ${index + 1}`} onRemove={() => onChange({ ...draft, skills: removeRow(draft.skills, key) })}>
        <Field label="Tên kỹ năng" required><input required className={fieldClass} value={value.name} maxLength={100} onChange={(event) => onChange({ ...draft, skills: updateRow<CVSkillItem>(draft.skills, key, { name: event.target.value }) })} /></Field>
      </ItemCard>)}</div>
      <AddButton onClick={() => onChange({ ...draft, skills: [...draft.skills, newReviewRow({ name: '', level: null })] })}>Thêm kỹ năng</AddButton>
    </Section>

    <Section title="Dự án" description="Kiểm tra vai trò, công nghệ và liên kết của từng dự án.">
      <div className="space-y-3">{draft.projects.length === 0 && <EmptyHint label="dự án" />}{draft.projects.map(({ key, value }, index) => <ItemCard key={key} label={`dự án ${index + 1}`} onRemove={() => onChange({ ...draft, projects: removeRow(draft.projects, key) })}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Tên dự án" required><input required className={fieldClass} value={value.name} maxLength={255} onChange={(event) => onChange({ ...draft, projects: updateRow<CVProjectItem>(draft.projects, key, { name: event.target.value }) })} /></Field>
          <Field label="Vai trò"><input className={fieldClass} value={value.role ?? ''} maxLength={255} onChange={(event) => onChange({ ...draft, projects: updateRow<CVProjectItem>(draft.projects, key, { role: event.target.value }) })} /></Field>
          <Field label="Bắt đầu"><input className={fieldClass} type="date" value={value.start_date ?? ''} onChange={(event) => onChange({ ...draft, projects: updateRow<CVProjectItem>(draft.projects, key, { start_date: event.target.value }) })} /></Field>
          <Field label="Kết thúc"><input className={fieldClass} type="date" min={value.start_date ?? undefined} value={value.end_date ?? ''} onChange={(event) => onChange({ ...draft, projects: updateRow<CVProjectItem>(draft.projects, key, { end_date: event.target.value }) })} /></Field>
          <Field label="Công nghệ" className="sm:col-span-2"><textarea className={`${fieldClass} min-h-20 resize-y leading-6`} value={value.technologies.join('\n')} placeholder="Mỗi công nghệ một dòng" onChange={(event) => onChange({ ...draft, projects: updateRow<CVProjectItem>(draft.projects, key, { technologies: event.target.value.split('\n') }) })} /></Field>
          <Field label="Liên kết dự án" className="sm:col-span-2"><input className={fieldClass} type="url" value={value.project_url ?? ''} placeholder="https://..." onChange={(event) => onChange({ ...draft, projects: updateRow<CVProjectItem>(draft.projects, key, { project_url: event.target.value }) })} /></Field>
          <Field label="Mô tả" className="sm:col-span-2"><textarea className={`${fieldClass} min-h-28 resize-y leading-6`} value={value.description ?? ''} maxLength={10000} onChange={(event) => onChange({ ...draft, projects: updateRow<CVProjectItem>(draft.projects, key, { description: event.target.value }) })} /></Field>
        </div>
      </ItemCard>)}</div>
      <AddButton onClick={() => onChange({ ...draft, projects: [...draft.projects, newReviewRow({ name: '', technologies: [] })] })}>Thêm dự án</AddButton>
    </Section>

    <Section title="Chứng chỉ" description="Bổ sung tổ chức cấp và thời hạn nếu cần.">
      <div className="space-y-3">{draft.certificates.length === 0 && <EmptyHint label="chứng chỉ" />}{draft.certificates.map(({ key, value }, index) => <ItemCard key={key} label={`chứng chỉ ${index + 1}`} onRemove={() => onChange({ ...draft, certificates: removeRow(draft.certificates, key) })}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Tên chứng chỉ" required><input required className={fieldClass} value={value.name} maxLength={255} onChange={(event) => onChange({ ...draft, certificates: updateRow<CVCertificateItem>(draft.certificates, key, { name: event.target.value }) })} /></Field>
          <Field label="Tổ chức cấp"><input className={fieldClass} value={value.organization ?? ''} maxLength={255} onChange={(event) => onChange({ ...draft, certificates: updateRow<CVCertificateItem>(draft.certificates, key, { organization: event.target.value }) })} /></Field>
          <Field label="Ngày cấp"><input className={fieldClass} type="date" value={value.issue_date ?? ''} onChange={(event) => onChange({ ...draft, certificates: updateRow<CVCertificateItem>(draft.certificates, key, { issue_date: event.target.value }) })} /></Field>
          <Field label="Ngày hết hạn"><input className={fieldClass} type="date" min={value.issue_date ?? undefined} value={value.expiration_date ?? ''} onChange={(event) => onChange({ ...draft, certificates: updateRow<CVCertificateItem>(draft.certificates, key, { expiration_date: event.target.value }) })} /></Field>
          <Field label="Liên kết xác thực" className="sm:col-span-2"><input className={fieldClass} type="url" value={value.credential_url ?? ''} placeholder="https://..." onChange={(event) => onChange({ ...draft, certificates: updateRow<CVCertificateItem>(draft.certificates, key, { credential_url: event.target.value }) })} /></Field>
        </div>
      </ItemCard>)}</div>
      <AddButton onClick={() => onChange({ ...draft, certificates: [...draft.certificates, newReviewRow({ name: '' })] })}>Thêm chứng chỉ</AddButton>
    </Section>

    <Section title="Ngoại ngữ" description="Bạn có thể nhập trình độ theo cách quen thuộc; hệ thống sẽ chuẩn hóa khi xác nhận.">
      <datalist id="cv-language-levels"><option value="Cơ bản" /><option value="Giao tiếp" /><option value="Chuyên nghiệp" /><option value="Thành thạo" /><option value="Bản ngữ" /></datalist>
      <div className="space-y-3">{draft.languages.length === 0 && <EmptyHint label="ngoại ngữ" />}{draft.languages.map(({ key, value }, index) => <ItemCard key={key} label={`ngoại ngữ ${index + 1}`} onRemove={() => onChange({ ...draft, languages: removeRow(draft.languages, key) })}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Ngôn ngữ" required><input required className={fieldClass} value={value.name} maxLength={100} onChange={(event) => onChange({ ...draft, languages: updateRow<ReviewLanguageItem>(draft.languages, key, { name: event.target.value }) })} /></Field>
          <Field label="Trình độ"><input className={fieldClass} list="cv-language-levels" pattern="BASIC|CONVERSATIONAL|PROFESSIONAL|FLUENT|NATIVE|Cơ bản|Giao tiếp|Chuyên nghiệp|Thành thạo|Bản ngữ" title="Nhập Cơ bản, Giao tiếp, Chuyên nghiệp, Thành thạo hoặc Bản ngữ" value={value.proficiency ?? ''} placeholder="Ví dụ: Giao tiếp" onChange={(event) => onChange({ ...draft, languages: updateRow<ReviewLanguageItem>(draft.languages, key, { proficiency: event.target.value }) })} /></Field>
        </div>
      </ItemCard>)}</div>
      <AddButton onClick={() => onChange({ ...draft, languages: [...draft.languages, newReviewRow({ name: '', proficiency: null })] })}>Thêm ngoại ngữ</AddButton>
    </Section>

    <section className="rounded-2xl bg-slate-950 p-5 text-white shadow-lg shadow-slate-950/10 sm:flex sm:items-center sm:justify-between sm:gap-6 sm:p-6">
      <div><h3 className="font-bold">Sẵn sàng áp dụng thông tin?</h3><p className="mt-1 max-w-xl text-sm leading-6 text-slate-300">Dữ liệu bạn đã kiểm tra sẽ trở thành thông tin có cấu trúc chính thức của CV này.</p></div>
      <button type="submit" disabled={submitting} className="mt-4 inline-flex min-h-11 w-full shrink-0 items-center justify-center rounded-xl bg-blue-500 px-5 py-2.5 text-sm font-bold text-white transition-[background-color,transform] duration-[var(--motion-feedback)] ease-[var(--ease-gjob)] hover:bg-blue-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:cursor-wait disabled:opacity-60 sm:mt-0 sm:w-auto">
        {submitting ? 'Đang áp dụng…' : 'Xác nhận và áp dụng'}
      </button>
    </section>
    {submitError && <p role="alert" className="motion-error rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-800 ring-1 ring-red-100">{submitError}</p>}
  </form>
}
