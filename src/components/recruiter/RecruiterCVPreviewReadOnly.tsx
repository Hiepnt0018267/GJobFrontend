import CVPreview from '../cv/CVPreview'
import type { RecruiterApplicationDetail } from '../../types/recruiterApplication'
import type { CVCreateRequest } from '../../types/cv'

type Props = { cv: RecruiterApplicationDetail['cv'] }

function toPreviewData(cv: RecruiterApplicationDetail['cv']): CVCreateRequest {
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

export default function RecruiterCVPreviewReadOnly({ cv }: Props) {
  return <CVPreview cv={toPreviewData(cv)} template={cv.template} className="overflow-hidden rounded-2xl" />
}
