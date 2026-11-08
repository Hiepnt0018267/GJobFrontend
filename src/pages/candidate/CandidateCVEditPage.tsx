import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import CVWorkspaceEditor from '../../components/cv/CVWorkspaceEditor'
import { buildExistingCVPresentationPatch, deriveSaveRoute } from '../../components/cv/cvEditorState'
import { isSupportedCVTemplateLayout } from '../../components/cv/cvTemplateRegistry'
import { cvService } from '../../services/cvService'
import { cvTemplateService } from '../../services/cvTemplateService'
import { cvToEditableData, isBuilderCV, type CV, type CVCreateRequest, type CVTemplate } from '../../types/cv'

const canonicalContent = ({ template_id: ignoredTemplateId, ...content }: CVCreateRequest): Omit<CVCreateRequest, 'template_id'> => {
  void ignoredTemplateId
  return content
}

export default function CandidateCVEditPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const [cv, setCV] = useState<CV | null>(null)
  const [templates, setTemplates] = useState<CVTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let cancelled = false
    Promise.all([cvService.getCV(id), cvTemplateService.getCVTemplates()])
      .then(([currentCV, catalog]) => {
        if (!cancelled) {
          setCV(currentCV)
          setTemplates(catalog.items)
        }
      })
      .catch(() => {
        if (!cancelled) setLoadError('Không thể tải CV hoặc danh sách mẫu. Hãy thử lại.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [id])

  if (loading) return <div className="min-h-screen bg-slate-50"><div className="mx-auto mt-7 h-96 max-w-4xl animate-pulse rounded-xl bg-slate-200" /></div>
  if (loadError || !cv) return <div className="min-h-screen bg-slate-50"><p role="alert" className="mx-auto mt-4 max-w-4xl rounded-lg bg-red-50 p-3 text-sm text-red-700">{loadError || 'Không thể tải CV này.'}</p></div>
  if (!isBuilderCV(cv)) return <div className="min-h-screen bg-slate-50"><div className="mx-auto mt-6 max-w-4xl rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200"><h1 className="text-xl font-bold text-slate-950">CV tải lên không chỉnh sửa trực tiếp được</h1><button type="button" onClick={() => navigate(`/candidate/cvs/${id}`)} className="mt-5 rounded-xl bg-[#49BBBD] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#49BBBD]/90 active:bg-[#49BBBD]/80">Quay lại CV</button></div></div>
  if (!isSupportedCVTemplateLayout(cv.template.layout_key)) return <p role="alert" className="m-8 text-amber-800">Mẫu CV này chưa được hỗ trợ chỉnh sửa.</p>

  return <><CVWorkspaceEditor
    initial={cvToEditableData(cv)}
    currentTemplate={cv.template}
    templates={templates}
    cvId={cv.id}
    hasManagedPhoto={cv.has_managed_photo}
    photoVersion={cv.updated_at}
    onPhotoUpdated={setCV}
    presentation={{
      locale: cv.presentation.locale,
      templateConfigSnapshot: cv.presentation.template_config_snapshot,
      candidateOverrides: cv.presentation.candidate_overrides,
    }}
    submitLabel="Lưu thay đổi"
    submitting={submitting}
    onCancel={() => navigate(`/candidate/cvs/${id}`)}
    onLibrary={() => navigate('/candidate/cvs')}
    onSave={async (data, presentationDraft) => {
      setSubmitting(true)
      setSaveError(null)
      try {
        const content = canonicalContent(data)
        const currentContent = canonicalContent(cvToEditableData(cv))
        const contentChanged = JSON.stringify(content) !== JSON.stringify(currentContent)
        const configPatch = buildExistingCVPresentationPatch(cv.presentation, presentationDraft)
        const presentationChanged = Object.keys(configPatch).length > 0
        const saveRoute = deriveSaveRoute({ contentDirty: contentChanged, presentationDirty: presentationChanged })

        if (saveRoute === 'combined') {
          await cvService.updateCV(id, { ...content, ...configPatch })
        } else if (saveRoute === 'content') {
          await cvService.updateCVContent(id, content)
        } else if (saveRoute === 'presentation') {
          await cvService.updateCVPresentation(id, configPatch)
        }
        const reconciled = await cvService.getCV(id)
        setCV(reconciled)
        return reconciled
      } catch (requestError) {
        setSaveError('Không thể lưu CV. Nội dung bạn đang chỉnh sửa vẫn được giữ.')
        throw requestError
      } finally {
        setSubmitting(false)
      }
    }}
  />{saveError && <p role="alert" className="fixed bottom-4 right-4 z-[120] max-w-sm rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white shadow-xl">{saveError}</p>}</>
}
