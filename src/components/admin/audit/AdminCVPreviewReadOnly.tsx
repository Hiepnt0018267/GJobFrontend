import { FileText } from 'lucide-react'
import CVBuilderPreview from '../../cv/CVBuilderPreview'
import type { AdminAuditCVDetail } from '../../../types/adminAudit'
import { cvFileTypeLabel, formatFileSize, type CVCreateRequest } from '../../../types/cv'

type Props = { cv: AdminAuditCVDetail }

function toPreviewData(cv: AdminAuditCVDetail): CVCreateRequest {
  return { title: cv.title, template_id: cv.template_id ?? '', personal_info: cv.personal_info, career_objective: cv.career_objective, educations: cv.educations, experiences: cv.experiences, skills: cv.skills, projects: cv.projects, certificates: cv.certificates, languages: cv.languages }
}

export default function AdminCVPreviewReadOnly({ cv }: Props) {
  if (cv.source_type === 'UPLOADED' || !cv.template) {
    return <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200"><div className="flex items-start gap-3"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700"><FileText size={21} aria-hidden="true" /></span><div className="min-w-0"><h3 className="break-words text-lg font-bold text-slate-950">CV tải lên</h3><p className="mt-1 break-words text-sm leading-6 text-slate-600">{cv.original_filename || cv.title}</p><p className="mt-2 text-sm text-slate-500">{cvFileTypeLabel(cv.mime_type)} · {formatFileSize(cv.file_size)}</p><p className="mt-5 text-sm leading-6 text-slate-500">Đây là tệp CV ứng viên tải lên, không có mẫu GJob để hiển thị bản xem trực tiếp.</p></div></div></section>
  }

  return <CVBuilderPreview cv={toPreviewData(cv)} template={cv.template} hasManagedPhoto={cv.has_managed_photo} photoEndpoint={`/api/v1/admin/cvs/${cv.id}/photo`} photoVersion={cv.updated_at} className="overflow-hidden rounded-2xl" />
}
