import { Download, Eye, FileText } from 'lucide-react'
import { useState } from 'react'
import CVBuilderPreview from '../cv/CVBuilderPreview'
import { recruiterApplicationService } from '../../services/recruiterApplicationService'
import type { RecruiterApplicationDetail } from '../../types/recruiterApplication'
import { cvFileTypeLabel, formatFileSize, type CVCreateRequest } from '../../types/cv'

type Props = { applicationId: string; cv: RecruiterApplicationDetail['cv'] }

function toPreviewData(cv: RecruiterApplicationDetail['cv']): CVCreateRequest {
  return { title: cv.title, template_id: cv.template_id ?? '', personal_info: cv.personal_info, career_objective: cv.career_objective, educations: cv.educations, experiences: cv.experiences, skills: cv.skills, projects: cv.projects, certificates: cv.certificates, languages: cv.languages }
}

export default function RecruiterCVPreviewReadOnly({ applicationId, cv }: Props) {
  const [downloading, setDownloading] = useState(false)
  const openFile = async (download: boolean) => {
    if (downloading) return
    setDownloading(true)
    try {
      const response = await recruiterApplicationService.getApplicationCVFile(applicationId)
      const url = URL.createObjectURL(response.data)
      if (download) {
        const link = document.createElement('a')
        link.href = url
        link.download = cv.original_filename || cv.title
        link.click()
      } else window.open(url, '_blank', 'noopener,noreferrer')
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000)
    } finally { setDownloading(false) }
  }

  if (cv.source_type === 'UPLOADED' || !cv.template) {
    return <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200"><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start"><div className="flex min-w-0 items-start gap-3"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700"><FileText size={21} aria-hidden="true" /></span><div className="min-w-0"><h3 className="break-words text-lg font-bold text-slate-950">CV tải lên</h3><p className="mt-1 break-words text-sm text-slate-600">{cv.original_filename || cv.title}</p><p className="mt-2 text-sm text-slate-500">{cvFileTypeLabel(cv.mime_type)} · {formatFileSize(cv.file_size)}</p><p className="mt-4 text-sm leading-6 text-slate-500">Ứng viên đã nộp tệp CV, không phải CV tạo theo mẫu GJob.</p></div></div><div className="flex shrink-0 flex-wrap gap-2"><button type="button" onClick={() => void openFile(false)} disabled={downloading} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"><Eye size={16} aria-hidden="true" />Xem tệp</button><button type="button" onClick={() => void openFile(true)} disabled={downloading} className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"><Download size={16} aria-hidden="true" />Tải xuống</button></div></div></section>
  }
  return <CVBuilderPreview cv={toPreviewData(cv)} template={cv.template} hasManagedPhoto={cv.has_managed_photo} photoEndpoint={`/api/v1/recruiters/applications/${applicationId}/cv-photo`} photoVersion={cv.updated_at} className="overflow-hidden rounded-2xl" />
}
