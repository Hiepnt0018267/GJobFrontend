import CVPreview from '../../cv/CVPreview'
import type { AdminAuditCVDetail } from '../../../types/adminAudit'
import type { CVCreateRequest } from '../../../types/cv'

type Props = { cv: AdminAuditCVDetail }

function toPreviewData(cv: AdminAuditCVDetail): CVCreateRequest {
  return {
    title: cv.title,
    template_id: cv.template_id,
    personal_info: cv.personal_info,
    career_objective: cv.career_objective,
    educations: cv.educations,
    experiences: cv.experiences,
    skills: cv.skills,
    projects: cv.projects,
    certificates: cv.certificates,
    languages: cv.languages,
  }
}

export default function AdminCVPreviewReadOnly({ cv }: Props) {
  return <CVPreview cv={toPreviewData(cv)} template={cv.template} className="overflow-hidden rounded-2xl" />
}
