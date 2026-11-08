import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import CVAvatarDialog from './CVAvatarDialog'
import { useNavigate } from 'react-router-dom'
import type { CV, CVCreateRequest, CVFieldTextFormatting, CVLanguageProficiency, CVSectionVisibility, CVTemplate, CVTemplateSummary, CVTemplateThemeConfig, CVTextFormatting } from '../../types/cv'
import { cvToEditableData, isBuilderCV } from '../../types/cv'
import { cvService } from '../../services/cvService'
import { usePrivateMediaUrl } from '../../hooks/usePrivateMediaUrl'
import CVTemplateRenderer from './CVTemplateRenderer'
import CVPrintSurface from './CVPrintSurface'
import { sortCVTemplates } from '../../utils/cvTemplateSort'
import type { CVInlineEditorBindings, CVRenderPresentation, CVSectionKey } from './templates/types'
import CVDesignControls from './CVDesignControls'
import CVContentPanel from './CVContentPanel'
import CVEditorCanvas from './CVEditorCanvas'
import { CVAddSectionPanel, CVLayoutPanel, CVReferenceLibraryPanel, CVTemplateSwitchPanel } from './CVEditorPanels'
import { CVEditorContextPanel, CVEditorHeader, CVEditorToolRail, CVEditorWorkspace, CVPreviewDialog, UnsavedChangesDialog } from './CVEditorShell'
import { applyTemplateSwitch, canSave, computeFitZoom, deriveEditorDirtyState, deriveSaveRoute, getInitialZoomState, getSaveStatus, type CVEditorContentSection, type CVEditorPresentationDraft, type CVEditorSaveState, type CVEditorTool, type CVEditorZoomMode } from './cvEditorState'
import { useCVPrint } from './useCVPrint'
import { createCVClientRowKey, createCVClientRowKeys, reconcileCVClientRowKeys } from './cvClientRowKeys'
import { useToast } from '../../hooks/useToast'
import { deleteIndexedTextFormatting, reorderIndexedTextFormatting } from './cvTextFormatting'
import { createSampleCVData } from './sampleCVData'

export type { CVEditorPresentationDraft } from './cvEditorState'

type Props = {
  initial: CVCreateRequest
  currentTemplate: CVTemplateSummary
  templates: CVTemplateSummary[]
  submitLabel: string
  submitting: boolean
  onSave: (data: CVCreateRequest, presentation: CVEditorPresentationDraft, pendingPhoto?: File) => Promise<CV | null>
  onCancel: () => void
  onLibrary?: () => void
  cvId?: string
  hasManagedPhoto?: boolean
  photoVersion?: string | null
  onPhotoUpdated?: (cv: CV) => void
  presentation?: CVRenderPresentation
}

const isHttpUrl = (value: string) => { try { const parsed = new URL(value); return parsed.protocol === 'http:' || parsed.protocol === 'https:' } catch { return false } }
const normalizeLanguageProficiency = (value: string | null | undefined): CVLanguageProficiency | null => {
  const normalized = value?.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replaceAll('đ', 'd').trim().toLowerCase()
  const aliases: Record<string, CVLanguageProficiency> = { basic: 'BASIC', 'co ban': 'BASIC', conversational: 'CONVERSATIONAL', 'giao tiep': 'CONVERSATIONAL', professional: 'PROFESSIONAL', 'chuyen nghiep': 'PROFESSIONAL', fluent: 'FLUENT', 'thanh thao': 'FLUENT', native: 'NATIVE', 'ban ngu': 'NATIVE' }
  return normalized ? aliases[normalized] ?? null : null
}
const SECTION_LABELS: Record<CVSectionKey, string> = {
  summary: 'Mục tiêu nghề nghiệp',
  experience: 'Kinh nghiệm làm việc',
  education: 'Học vấn',
  skills: 'Kỹ năng',
  projects: 'Dự án',
  certificates: 'Chứng chỉ',
  languages: 'Ngoại ngữ',
}
const TEXT_FORMATTING_PREFIX = {
  experiences: 'experience',
  educations: 'education',
  skills: 'skill',
  projects: 'project',
  certificates: 'certificate',
  languages: 'language',
} as const

export default function CVWorkspaceEditor({ initial, currentTemplate, templates, submitting, onSave, onCancel, cvId, hasManagedPhoto = false, photoVersion, onPhotoUpdated, presentation = {} }: Props) {
  const navigate = useNavigate()
  const { info: showToastInfo } = useToast()
  const [initialContentState, setInitialContentState] = useState(initial)
  const [initialPresentationState, setInitialPresentationState] = useState<CVEditorPresentationDraft>(() => ({ templateId: initial.template_id, locale: presentation.locale ?? 'vi', templateConfigSnapshot: presentation.templateConfigSnapshot ?? currentTemplate.theme_config ?? null, candidateOverrides: presentation.candidateOverrides ?? {} }))
  const [contentDraft, setContentDraft] = useState(initial)
  const [presentationDraft, setPresentationDraft] = useState<CVEditorPresentationDraft>(initialPresentationState)
  const [activeTool, setActiveTool] = useState<CVEditorTool>('CONTENT')
  const [panelOpen, setPanelOpen] = useState(false)
  const [activeContentSection, setActiveContentSection] = useState<CVEditorContentSection>('personal')
  const [zoomMode, setZoomMode] = useState<CVEditorZoomMode>(() => getInitialZoomState(!cvId).zoomMode)
  const [zoomPercent, setZoomPercent] = useState(() => getInitialZoomState(!cvId).zoomPercent)
  const [viewportWidth, setViewportWidth] = useState(0)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [recommendedPreviewTemplateId, setRecommendedPreviewTemplateId] = useState<string | null>(null)
  const [libraryPreviewTemplateId, setLibraryPreviewTemplateId] = useState<string | null>(null)
  const [saveState, setSaveState] = useState<CVEditorSaveState>('IDLE')
  const [validationError, setValidationError] = useState<string | null>(null)
  const [sectionErrors, setSectionErrors] = useState<Record<string, string>>({})
  const [showAvatarEditor, setAvatarEditorState] = useState(false)
  const [showAvatarDialog, setShowAvatarDialog] = useState(false)
  const [avatarImageFailed, setAvatarImageFailed] = useState(false)
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null)
  const [pendingPhoto, setPendingPhoto] = useState<File | null>(null)
  const [photoUploading, setPhotoUploading] = useState(false)
  const [experienceRowKeys, setExperienceRowKeys] = useState(() => createCVClientRowKeys(initial.experiences.length))
  const [projectRowKeys, setProjectRowKeys] = useState(() => createCVClientRowKeys(initial.projects.length))
  const [sectionOrder, setSectionOrder] = useState<CVSectionKey[]>([
    'summary', 'experience', 'education', 'skills', 'projects', 'certificates', 'languages'
  ])
  const [pendingNavigation, setPendingNavigation] = useState<(() => void) | null>(null)
  const previewButtonRef = useRef<HTMLButtonElement>(null)
  const printRootRef = useRef<HTMLDivElement>(null)
  const saveLock = useRef(false)

  const selectedTemplate = useMemo(() => templates.find((template) => template.id === presentationDraft.templateId) ?? currentTemplate, [currentTemplate, presentationDraft.templateId, templates])
  const availableTemplates = useMemo(() => { const unique = new Map<string, CVTemplateSummary>(); [currentTemplate, ...templates].forEach((template) => unique.set(template.id, template)); return sortCVTemplates([...unique.values()]) }, [currentTemplate, templates])
  const dirty = useMemo(() => deriveEditorDirtyState(initialContentState, contentDraft, initialPresentationState, presentationDraft), [contentDraft, initialContentState, initialPresentationState, presentationDraft])
  const isNewCV = !cvId
  const hasUnsavedChanges = dirty.hasUnsavedChanges || isNewCV
  const route = isNewCV ? 'content' : deriveSaveRoute(dirty)
  const effectiveSaveState: CVEditorSaveState = submitting ? 'SAVING' : saveState
  const saveAllowed = canSave({ hasUnsavedChanges, saveState: effectiveSaveState })
  const saveStatus = getSaveStatus(effectiveSaveState, hasUnsavedChanges)
  const { printCV, printing, printError } = useCVPrint({ rootRef: printRootRef, title: contentDraft.title })

  const mutateTextFormatting = useCallback((mutate: (current?: CVTextFormatting) => CVTextFormatting | undefined) => {
    setPresentationDraft((current) => {
      const textFormatting = mutate(current.candidateOverrides.text_formatting)
      const candidateOverrides = { ...current.candidateOverrides }
      if (textFormatting) candidateOverrides.text_formatting = textFormatting
      else delete candidateOverrides.text_formatting
      return { ...current, candidateOverrides }
    })
    setSaveState('IDLE')
  }, [])

  const updateTextFormatting = useCallback((fieldId: string, formatting?: CVFieldTextFormatting) => {
    mutateTextFormatting((current) => {
      const fields = { ...(current?.fields ?? {}) }
      if (formatting) fields[fieldId] = formatting
      else delete fields[fieldId]
      return Object.keys(fields).length > 0 ? { version: 1, fields } : undefined
    })
  }, [mutateTextFormatting])

  const removeIndexedFormatting = useCallback((collection: keyof typeof TEXT_FORMATTING_PREFIX, index: number) => {
    mutateTextFormatting((current) => deleteIndexedTextFormatting(current, TEXT_FORMATTING_PREFIX[collection], index))
  }, [mutateTextFormatting])

  const patch = useCallback((changes: Partial<CVCreateRequest>) => { setContentDraft((current) => ({ ...current, ...changes })); setValidationError(null); setSectionErrors({}); setSaveState('IDLE') }, [])
  const updatePersonalInfo = useCallback((changes: Partial<CVCreateRequest['personal_info']>) => { setAvatarImageFailed(false); setContentDraft((current) => ({ ...current, personal_info: { ...current.personal_info, ...changes } })); setValidationError(null); setSectionErrors({}); setSaveState('IDLE') }, [])
  const updateItem = useCallback(<T,>(key: 'educations' | 'experiences' | 'skills' | 'projects' | 'certificates' | 'languages', index: number, changes: Partial<T>) => { setContentDraft((current) => ({ ...current, [key]: (current[key] as T[]).map((item, itemIndex) => itemIndex === index ? { ...item, ...changes } : item) } as CVCreateRequest)); setValidationError(null); setSectionErrors({}); setSaveState('IDLE') }, [])
  const addExperience = useCallback(() => { setContentDraft((current) => ({ ...current, experiences: [...current.experiences, { company_name: '', position: '', is_current: false }] })); setExperienceRowKeys((current) => [...current, createCVClientRowKey()]); setValidationError(null); setSectionErrors({}); setSaveState('IDLE') }, [])
  const deleteExperience = useCallback((index: number) => { setContentDraft((current) => ({ ...current, experiences: current.experiences.filter((_, itemIndex) => itemIndex !== index) })); setExperienceRowKeys((current) => current.filter((_, itemIndex) => itemIndex !== index)); removeIndexedFormatting('experiences', index); setValidationError(null); setSectionErrors({}); setSaveState('IDLE') }, [removeIndexedFormatting])
  const addEducation = useCallback(() => { setContentDraft((current) => ({ ...current, educations: [...current.educations, { school_name: '', is_current: false }] })); setValidationError(null); setSectionErrors({}); setSaveState('IDLE') }, [])
  const deleteEducation = useCallback((index: number) => { setContentDraft((current) => ({ ...current, educations: current.educations.filter((_, itemIndex) => itemIndex !== index) })); removeIndexedFormatting('educations', index); setValidationError(null); setSectionErrors({}); setSaveState('IDLE') }, [removeIndexedFormatting])
  const addSkill = useCallback(() => { setContentDraft((current) => ({ ...current, skills: [...current.skills, { name: '', level: null }] })); setValidationError(null); setSectionErrors({}); setSaveState('IDLE') }, [])
  const deleteSkill = useCallback((index: number) => { setContentDraft((current) => ({ ...current, skills: current.skills.filter((_, itemIndex) => itemIndex !== index) })); removeIndexedFormatting('skills', index); setValidationError(null); setSectionErrors({}); setSaveState('IDLE') }, [removeIndexedFormatting])
  const addProject = useCallback(() => { setContentDraft((current) => ({ ...current, projects: [...current.projects, { name: '', technologies: [] }] })); setProjectRowKeys((current) => [...current, createCVClientRowKey()]); setValidationError(null); setSectionErrors({}); setSaveState('IDLE') }, [])
  const deleteProject = useCallback((index: number) => { setContentDraft((current) => ({ ...current, projects: current.projects.filter((_, itemIndex) => itemIndex !== index) })); setProjectRowKeys((current) => current.filter((_, itemIndex) => itemIndex !== index)); removeIndexedFormatting('projects', index); setValidationError(null); setSectionErrors({}); setSaveState('IDLE') }, [removeIndexedFormatting])
  const addCertificate = useCallback(() => { setContentDraft((current) => ({ ...current, certificates: [...current.certificates, { name: '' }] })); setValidationError(null); setSectionErrors({}); setSaveState('IDLE') }, [])
  const deleteCertificate = useCallback((index: number) => { setContentDraft((current) => ({ ...current, certificates: current.certificates.filter((_, itemIndex) => itemIndex !== index) })); removeIndexedFormatting('certificates', index); setValidationError(null); setSectionErrors({}); setSaveState('IDLE') }, [removeIndexedFormatting])
  const addLanguage = useCallback(() => { setContentDraft((current) => ({ ...current, languages: [...current.languages, { name: '', proficiency: null }] })); setValidationError(null); setSectionErrors({}); setSaveState('IDLE') }, [])
  const deleteLanguage = useCallback((index: number) => { setContentDraft((current) => ({ ...current, languages: current.languages.filter((_, itemIndex) => itemIndex !== index) })); removeIndexedFormatting('languages', index); setValidationError(null); setSectionErrors({}); setSaveState('IDLE') }, [removeIndexedFormatting])

  const moveItem = useCallback((collection: 'experiences' | 'educations' | 'skills' | 'projects' | 'certificates' | 'languages', index: number, direction: 'UP' | 'DOWN') => {
    const targetIndex = direction === 'UP' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= contentDraft[collection].length) return
    setContentDraft((current) => {
      const items = [...current[collection]]
      const targetIndex = direction === 'UP' ? index - 1 : index + 1
      if (targetIndex < 0 || targetIndex >= items.length) return current

      const temp = items[index]
      items[index] = items[targetIndex]
      items[targetIndex] = temp
      return { ...current, [collection]: items }
    })
    if (collection === 'experiences') {
      setExperienceRowKeys((current) => {
        const next = [...current]
        const targetIndex = direction === 'UP' ? index - 1 : index + 1
        if (targetIndex < 0 || targetIndex >= next.length) return current
        const temp = next[index]
        next[index] = next[targetIndex]
        next[targetIndex] = temp
        return next
      })
    }
    if (collection === 'projects') {
      setProjectRowKeys((current) => {
        const next = [...current]
        const targetIndex = direction === 'UP' ? index - 1 : index + 1
        if (targetIndex < 0 || targetIndex >= next.length) return current
        const temp = next[index]
        next[index] = next[targetIndex]
        next[targetIndex] = temp
        return next
      })
    }
    mutateTextFormatting((current) => reorderIndexedTextFormatting(current, TEXT_FORMATTING_PREFIX[collection], index, targetIndex))
    setSaveState('IDLE')
  }, [contentDraft, mutateTextFormatting])

  const reorderCollectionItems = useCallback((collection: 'experiences' | 'educations' | 'skills' | 'projects' | 'certificates' | 'languages', fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return
    if (fromIndex < 0 || fromIndex >= contentDraft[collection].length || toIndex < 0 || toIndex >= contentDraft[collection].length) return
    setContentDraft((current) => {
      const items = [...current[collection]]
      if (fromIndex < 0 || fromIndex >= items.length || toIndex < 0 || toIndex >= items.length) return current
      const [moved] = items.splice(fromIndex, 1)
      items.splice(toIndex, 0, moved)
      return { ...current, [collection]: items }
    })
    if (collection === 'experiences') {
      setExperienceRowKeys((current) => {
        const next = [...current]
        const [moved] = next.splice(fromIndex, 1)
        next.splice(toIndex, 0, moved)
        return next
      })
    }
    if (collection === 'projects') {
      setProjectRowKeys((current) => {
        const next = [...current]
        const [moved] = next.splice(fromIndex, 1)
        next.splice(toIndex, 0, moved)
        return next
      })
    }
    mutateTextFormatting((current) => reorderIndexedTextFormatting(current, TEXT_FORMATTING_PREFIX[collection], fromIndex, toIndex))
    setSaveState('IDLE')
  }, [contentDraft, mutateTextFormatting])
  const updatePresentation = useCallback((value: CVEditorPresentationDraft) => { setPresentationDraft(value); setSaveState('IDLE') }, [])

  const handleMoveSectionUp = useCallback((key: CVSectionKey) => {
    setSectionOrder((current) => {
      const idx = current.indexOf(key)
      if (idx <= 0) return current
      const next = [...current]
      const temp = next[idx - 1]
      next[idx - 1] = next[idx]
      next[idx] = temp
      return next
    })
    setSaveState('IDLE')
  }, [])

  const handleMoveSectionDown = useCallback((key: CVSectionKey) => {
    setSectionOrder((current) => {
      const idx = current.indexOf(key)
      if (idx === -1 || idx >= current.length - 1) return current
      const next = [...current]
      const temp = next[idx + 1]
      next[idx + 1] = next[idx]
      next[idx] = temp
      return next
    })
    setSaveState('IDLE')
  }, [])

  const handleReorderSections = useCallback((draggedKey: CVSectionKey, targetKey: CVSectionKey) => {
    if (draggedKey === targetKey) return
    setSectionOrder((current) => {
      const fromIdx = current.indexOf(draggedKey)
      const toIdx = current.indexOf(targetKey)
      if (fromIdx === -1 || toIdx === -1) return current

      const next = [...current]
      next.splice(fromIdx, 1)
      next.splice(toIdx, 0, draggedKey)
      return next
    })
    setSaveState('IDLE')
  }, [])

  const handleRemoveSection = useCallback((key: CVSectionKey) => {
    updatePresentation({
      ...presentationDraft,
      candidateOverrides: {
        ...presentationDraft.candidateOverrides,
        section_visibility: {
          ...presentationDraft.candidateOverrides.section_visibility,
          [key]: false,
        },
      },
    })
    showToastInfo(`Đã ẩn mục "${SECTION_LABELS[key]}". Bạn có thể thêm lại từ tab "Thêm mục" bên trái.`)
  }, [presentationDraft, showToastInfo, updatePresentation])

  const { url: managedPhotoUrl, failed: managedPhotoFailed } = usePrivateMediaUrl(cvId && hasManagedPhoto ? `/api/v1/candidate/cvs/${cvId}/photo` : null, photoVersion)
  const printPhotoLoading = Boolean(cvId && hasManagedPhoto && !managedPhotoUrl && !managedPhotoFailed)
  const legacyAvatarUrl = contentDraft.personal_info.avatar_url?.trim() || ''
  const avatarUrl = photoPreviewUrl || managedPhotoUrl || legacyAvatarUrl
  const hasAvatar = Boolean(avatarUrl && (isHttpUrl(avatarUrl) || avatarUrl.startsWith('blob:')) && !avatarImageFailed)
  const requestNavigation = useCallback((destination: () => void) => { if (hasUnsavedChanges) setPendingNavigation(() => destination); else destination() }, [hasUnsavedChanges])

  useEffect(() => { const beforeUnload = (event: BeforeUnloadEvent) => { if (!hasUnsavedChanges) return; event.preventDefault(); event.returnValue = '' }; window.addEventListener('beforeunload', beforeUnload); return () => window.removeEventListener('beforeunload', beforeUnload) }, [hasUnsavedChanges])
  useEffect(() => {
    const protectInternalLink = (event: MouseEvent) => {
      if (!hasUnsavedChanges || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
      const anchor = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>('a[href]') : null
      if (!anchor || anchor.target === '_blank' || anchor.hasAttribute('download')) return
      const destination = new URL(anchor.href, window.location.href)
      if (destination.origin !== window.location.origin) return
      const nextLocation = `${destination.pathname}${destination.search}${destination.hash}`
      const currentLocation = `${window.location.pathname}${window.location.search}${window.location.hash}`
      if (nextLocation === currentLocation) return
      event.preventDefault()
      event.stopPropagation()
      setPendingNavigation(() => () => navigate(nextLocation))
    }
    document.addEventListener('click', protectInternalLink, true)
    return () => document.removeEventListener('click', protectInternalLink, true)
  }, [hasUnsavedChanges, navigate])
  const renderedZoom = zoomMode === 'FIT' && viewportWidth > 0 ? computeFitZoom({ viewportWidth }) : zoomPercent

  const uploadPhoto = useCallback(async (file: File) => {
    if (photoUploading) return
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) { setValidationError('Ảnh cần là JPG, PNG hoặc WEBP và không vượt quá 5 MB.'); return }
    if (!cvId) { if (photoPreviewUrl) URL.revokeObjectURL(photoPreviewUrl); setPendingPhoto(file); setPhotoPreviewUrl(URL.createObjectURL(file)); setValidationError(null); return }
    const temporaryUrl = URL.createObjectURL(file); setPhotoPreviewUrl(temporaryUrl); setPhotoUploading(true); setValidationError(null)
    try { onPhotoUpdated?.(await cvService.uploadCVPhoto(cvId, file)) } catch { setPhotoPreviewUrl(null); setValidationError('Không thể tải ảnh lên. Ảnh cũ vẫn được giữ nguyên.') } finally { URL.revokeObjectURL(temporaryUrl); setPhotoPreviewUrl(null); setPhotoUploading(false) }
  }, [cvId, onPhotoUpdated, photoPreviewUrl, photoUploading])
  useEffect(() => () => { if (photoPreviewUrl) URL.revokeObjectURL(photoPreviewUrl) }, [photoPreviewUrl])
  const removePhoto = async () => {
    if (photoUploading) return
    if (!cvId) { if (photoPreviewUrl) URL.revokeObjectURL(photoPreviewUrl); setPendingPhoto(null); setPhotoPreviewUrl(null); setAvatarEditorState(false); return }
    setPhotoUploading(true); setValidationError(null)
    try { onPhotoUpdated?.(await cvService.deleteCVPhoto(cvId)); setAvatarImageFailed(false); setAvatarEditorState(false) } catch { setValidationError('Không thể xoá ảnh lúc này. Ảnh hiện tại vẫn được giữ nguyên.') } finally { setPhotoUploading(false) }
  }

  const validate = useCallback(() => {
    const errors: Record<string, string> = {}
    const info = contentDraft.personal_info
    const normalizedLanguages = contentDraft.languages.map((item) => ({ ...item, proficiency: normalizeLanguageProficiency(item.proficiency) }))
    if (!contentDraft.title.trim()) errors.TITLE = 'Nhập tên CV để dễ quản lý trong danh sách.'
    if (!info.full_name?.trim() || !info.email?.trim() || !info.phone?.trim() || !info.address?.trim() || !info.github_url?.trim()) errors['THÔNG TIN LIÊN HỆ'] = 'Điền đầy đủ họ tên, email, số điện thoại, địa chỉ và liên kết GitHub/Portfolio.'
    else if (!/^\S+@\S+\.\S+$/.test(info.email) || !isHttpUrl(info.github_url)) errors['THÔNG TIN LIÊN HỆ'] = 'Kiểm tra lại định dạng email và liên kết GitHub/Portfolio.'
    if (!contentDraft.career_objective?.trim()) errors['MỤC TIÊU NGHỀ NGHIỆP'] = 'Nhập mục tiêu nghề nghiệp.'
    if (contentDraft.educations.some((item) => !item.school_name.trim() || !item.degree?.trim())) errors['HỌC VẤN'] = 'Mỗi mục học vấn cần có tên trường và bằng cấp/chuyên ngành.'
    if (contentDraft.experiences.some((item) => !item.company_name.trim() || !item.position.trim() || !item.description?.trim())) errors['KINH NGHIỆM LÀM VIỆC'] = 'Mỗi mục kinh nghiệm cần có công ty, vị trí và mô tả.'
    if (contentDraft.skills.some((item) => !item.name.trim())) errors['KỸ NĂNG'] = 'Mỗi kỹ năng cần có tên.'
    if (contentDraft.projects.some((item) => !item.name.trim() || !item.description?.trim())) errors['DỰ ÁN'] = 'Mỗi dự án cần có tên và mô tả.'
    if (contentDraft.certificates.some((item) => !item.name.trim())) errors['CHỨNG CHỈ'] = 'Mỗi chứng chỉ cần có tên.'
    if (contentDraft.languages.some((item) => !item.name.trim() || !item.proficiency) || normalizedLanguages.some((item) => !item.proficiency)) errors['NGOẠI NGỮ'] = 'Nhập tên và trình độ hợp lệ cho mỗi ngôn ngữ.'
    setSectionErrors(errors)
    if (Object.keys(errors).length) { setValidationError('Hãy sửa các phần được đánh dấu trước khi lưu.'); setActiveTool('CONTENT'); setPanelOpen(true); return null }
    return normalizedLanguages
  }, [contentDraft])

  const save = useCallback(async () => {
    if (saveLock.current || route === 'none') return
    const normalizedLanguages = validate()
    if (!normalizedLanguages) return
    saveLock.current = true; setSaveState('SAVING'); setValidationError(null)
    try {
      const saved = await onSave({ ...contentDraft, languages: normalizedLanguages }, presentationDraft, pendingPhoto ?? undefined)
      if (saved && isBuilderCV(saved)) {
        const nextContent = cvToEditableData(saved)
        const nextPresentation: CVEditorPresentationDraft = { templateId: saved.template_id, locale: saved.presentation.locale, templateConfigSnapshot: saved.presentation.template_config_snapshot, candidateOverrides: saved.presentation.candidate_overrides }
        setInitialContentState(nextContent); setInitialPresentationState(nextPresentation); setContentDraft(nextContent); setExperienceRowKeys((current) => reconcileCVClientRowKeys(current, nextContent.experiences.length)); setProjectRowKeys((current) => reconcileCVClientRowKeys(current, nextContent.projects.length)); setPresentationDraft(nextPresentation); setPendingPhoto(null)
      } else { setInitialContentState({ ...contentDraft, languages: normalizedLanguages }); setInitialPresentationState(presentationDraft) }
      setSaveState('SAVED')
    } catch { setSaveState('ERROR'); setValidationError('Không thể lưu CV. Nội dung bạn đang chỉnh sửa vẫn được giữ.') } finally { saveLock.current = false }
  }, [contentDraft, onSave, pendingPhoto, presentationDraft, route, validate])
  useEffect(() => { const shortcut = (event: KeyboardEvent) => { if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') { event.preventDefault(); if (!saveLock.current) void save() } }; window.addEventListener('keydown', shortcut); return () => window.removeEventListener('keydown', shortcut) }, [save])
  useEffect(() => {
    if (!panelOpen) return
    const closePanelOnEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || previewOpen || showAvatarDialog || pendingNavigation) return
      setPanelOpen(false)
    }
    window.addEventListener('keydown', closePanelOnEscape)
    return () => window.removeEventListener('keydown', closePanelOnEscape)
  }, [panelOpen, pendingNavigation, previewOpen, showAvatarDialog])

  const changeTemplate = (templateId: string) => { const nextTemplate = availableTemplates.find((template) => template.id === templateId); if (!nextTemplate) return; setContentDraft((current) => ({ ...current, template_id: templateId })); updatePresentation(applyTemplateSwitch({ current: presentationDraft, nextTemplate, initial: initialPresentationState })) }
  const showSection = (key: keyof CVSectionVisibility) => updatePresentation({ ...presentationDraft, candidateOverrides: { ...presentationDraft.candidateOverrides, section_visibility: { ...presentationDraft.candidateOverrides.section_visibility, [key]: true } } })
  const editSection = useCallback((key: CVEditorContentSection) => { setActiveContentSection(key); setActiveTool('CONTENT'); setPanelOpen(true) }, [])
  const selectTool = (tool: CVEditorTool) => {
    if (panelOpen && activeTool === tool) { setPanelOpen(false); return }
    setActiveTool(tool)
    setPanelOpen(true)
  }
  const closePreview = useCallback(() => { setPreviewOpen(false); setRecommendedPreviewTemplateId(null); setLibraryPreviewTemplateId(null); window.setTimeout(() => previewButtonRef.current?.focus(), 0) }, [])
  const panelMeta = { CONTENT: ['Nội dung', 'Chỉnh sửa thông tin CV. Bản xem trước cập nhật ngay lập tức.'], DESIGN: ['Thiết kế & Font', 'Tuỳ chỉnh giao diện dựa trên mẫu đang chọn.'], ADD_SECTION: ['Thêm mục', 'Tìm nhanh mục cần bổ sung hoặc hiển thị lại.'], LAYOUT: ['Bố cục', 'Chọn mục được hiển thị mà không xoá nội dung.'], TEMPLATE: ['Đổi mẫu CV', 'Đổi mẫu cục bộ và chỉ lưu khi bạn nhấn Lưu.'], LIBRARY: ['Thư viện CV', ''] } as const
  const panel = activeTool === 'CONTENT' ? <CVContentPanel data={contentDraft} activeSection={activeContentSection} sectionErrors={sectionErrors} avatarUrl={avatarUrl || null} hasAvatar={hasAvatar} photoUploading={photoUploading} showAvatarEditor={showAvatarEditor} experienceRowKeys={experienceRowKeys} projectRowKeys={projectRowKeys} onActiveSection={setActiveContentSection} onPatch={patch} onPersonalInfo={updatePersonalInfo} onUpdateItem={updateItem} onAddExperience={addExperience} onDeleteExperience={deleteExperience} onAddProject={addProject} onDeleteProject={deleteProject} onMoveItem={moveItem} onToggleAvatarEditor={() => setAvatarEditorState((current) => !current)} onAvatarError={() => setAvatarImageFailed(true)} onChoosePhoto={() => setShowAvatarDialog(true)} onRemovePhoto={() => void removePhoto()} /> : activeTool === 'DESIGN' ? <CVDesignControls layoutKey={selectedTemplate.layout_key} snapshot={presentationDraft.templateConfigSnapshot as Partial<CVTemplateThemeConfig> | null} overrides={presentationDraft.candidateOverrides} locale={presentationDraft.locale} onLocaleChange={(locale) => updatePresentation({ ...presentationDraft, locale })} onChange={(candidateOverrides) => updatePresentation({ ...presentationDraft, candidateOverrides })} /> : activeTool === 'LAYOUT' ? <CVLayoutPanel template={selectedTemplate} presentation={presentationDraft} onChange={updatePresentation} /> : activeTool === 'ADD_SECTION' ? <CVAddSectionPanel data={contentDraft} template={selectedTemplate} presentation={presentationDraft} onShow={showSection} onEdit={editSection} /> : activeTool === 'TEMPLATE' ? <CVTemplateSwitchPanel templates={availableTemplates as CVTemplate[]} selectedId={selectedTemplate.id} data={contentDraft} locale={presentationDraft.locale} cvId={cvId} onPreview={(templateId) => { setLibraryPreviewTemplateId(null); setRecommendedPreviewTemplateId(templateId); setPreviewOpen(true) }} onSelect={changeTemplate} /> : <CVReferenceLibraryPanel templates={availableTemplates as CVTemplate[]} onPreview={(templateId) => { setRecommendedPreviewTemplateId(null); setLibraryPreviewTemplateId(templateId); setPreviewOpen(true) }} />
  const renderPresentation: CVRenderPresentation = { locale: presentationDraft.locale, templateConfigSnapshot: presentationDraft.templateConfigSnapshot as Partial<CVTemplateThemeConfig> | null, candidateOverrides: presentationDraft.candidateOverrides }
  const inlineEditor: CVInlineEditorBindings = {
    onTextFormattingChange: updateTextFormatting,
    onChoosePhoto: () => setShowAvatarDialog(true),
    onTitleChange: (title) => patch({ title }),
    onPersonalInfoChange: updatePersonalInfo,
    onCareerObjectiveChange: (career_objective) => patch({ career_objective }),
    onEducationChange: (index, changes) => updateItem('educations', index, changes),
    onAddEducation: addEducation,
    onDeleteEducation: deleteEducation,
    onExperienceChange: (index, changes) => updateItem('experiences', index, changes),
    onAddExperience: addExperience,
    onDeleteExperience: deleteExperience,
    onSkillChange: (index, changes) => updateItem('skills', index, changes),
    onAddSkill: addSkill,
    onDeleteSkill: deleteSkill,
    onProjectChange: (index, changes) => updateItem('projects', index, changes),
    onAddProject: addProject,
    onDeleteProject: deleteProject,
    onCertificateChange: (index, changes) => updateItem('certificates', index, changes),
    onAddCertificate: addCertificate,
    onDeleteCertificate: deleteCertificate,
    onLanguageChange: (index, changes) => updateItem('languages', index, changes),
    onAddLanguage: addLanguage,
    onDeleteLanguage: deleteLanguage,
    onMoveExperienceUp: (index) => moveItem('experiences', index, 'UP'),
    onMoveExperienceDown: (index) => moveItem('experiences', index, 'DOWN'),
    onReorderExperiences: (from, to) => reorderCollectionItems('experiences', from, to),
    onMoveEducationUp: (index) => moveItem('educations', index, 'UP'),
    onMoveEducationDown: (index) => moveItem('educations', index, 'DOWN'),
    onReorderEducations: (from, to) => reorderCollectionItems('educations', from, to),
    onMoveSkillUp: (index) => moveItem('skills', index, 'UP'),
    onMoveSkillDown: (index) => moveItem('skills', index, 'DOWN'),
    onReorderSkills: (from, to) => reorderCollectionItems('skills', from, to),
    onMoveProjectUp: (index) => moveItem('projects', index, 'UP'),
    onMoveProjectDown: (index) => moveItem('projects', index, 'DOWN'),
    onReorderProjects: (from, to) => reorderCollectionItems('projects', from, to),
    onMoveCertificateUp: (index) => moveItem('certificates', index, 'UP'),
    onMoveCertificateDown: (index) => moveItem('certificates', index, 'DOWN'),
    onReorderCertificates: (from, to) => reorderCollectionItems('certificates', from, to),
    onMoveLanguageUp: (index) => moveItem('languages', index, 'UP'),
    onMoveLanguageDown: (index) => moveItem('languages', index, 'DOWN'),
    onReorderLanguages: (from, to) => reorderCollectionItems('languages', from, to),
    sectionOrder,
    onMoveSectionUp: handleMoveSectionUp,
    onMoveSectionDown: handleMoveSectionDown,
    onRemoveSection: handleRemoveSection,
    onReorderSections: handleReorderSections,
  }
  const renderer = <CVTemplateRenderer cv={contentDraft} template={selectedTemplate} presentation={renderPresentation} mode="editor-preview" photoUrl={hasAvatar ? avatarUrl : null} className="mx-auto" editor={inlineEditor} />
  const recommendedPreviewTemplate = recommendedPreviewTemplateId ? availableTemplates.find((template) => template.id === recommendedPreviewTemplateId) : null
  const libraryPreviewTemplate = libraryPreviewTemplateId ? availableTemplates.find((template) => template.id === libraryPreviewTemplateId) : null
  const recommendedPreviewPresentation = recommendedPreviewTemplate ? applyTemplateSwitch({ current: presentationDraft, nextTemplate: recommendedPreviewTemplate, initial: initialPresentationState }) : null
  const previewRenderer = libraryPreviewTemplate
    ? <CVTemplateRenderer cv={createSampleCVData(libraryPreviewTemplate.id)} template={libraryPreviewTemplate} presentation={{ locale: 'vi', templateConfigSnapshot: libraryPreviewTemplate.theme_config ?? null, candidateOverrides: {} }} mode="preview" photoUrl={null} className="mx-auto" />
    : recommendedPreviewTemplate && recommendedPreviewPresentation
    ? <CVTemplateRenderer cv={contentDraft} template={recommendedPreviewTemplate} presentation={{ locale: recommendedPreviewPresentation.locale, templateConfigSnapshot: recommendedPreviewPresentation.templateConfigSnapshot, candidateOverrides: recommendedPreviewPresentation.candidateOverrides }} mode="preview" photoUrl={hasAvatar ? avatarUrl : null} className="mx-auto" />
    : <CVTemplateRenderer cv={contentDraft} template={selectedTemplate} presentation={renderPresentation} mode="preview" photoUrl={hasAvatar ? avatarUrl : null} className="mx-auto" />

  return <><CVEditorWorkspace header={<CVEditorHeader title={contentDraft.title} status={saveStatus} saveState={effectiveSaveState} canSubmit={saveAllowed} printing={printing || printPhotoLoading} onTitleChange={(title) => patch({ title })} onBack={() => requestNavigation(onCancel)} onPreview={() => { setLibraryPreviewTemplateId(null); setRecommendedPreviewTemplateId(null); setPreviewOpen(true) }} onPrint={() => void printCV()} onSave={() => void save()} previewButtonRef={previewButtonRef} />} rail={<CVEditorToolRail activeTool={panelOpen ? activeTool : null} onSelect={selectTool} />} panel={panelOpen ? <CVEditorContextPanel key={activeTool} title={panelMeta[activeTool][0]} description={panelMeta[activeTool][1]} onClose={() => setPanelOpen(false)}>{validationError && <p role="alert" className="mb-4 rounded-xl bg-red-50 px-3 py-2.5 text-xs leading-5 text-red-700">{validationError}</p>}{panel}</CVEditorContextPanel> : null} canvas={<CVEditorCanvas zoomPercent={renderedZoom} zoomMode={zoomMode} onViewportWidth={setViewportWidth} onZoomChange={(zoom) => { setZoomMode('MANUAL'); setZoomPercent(zoom) }} onFit={() => setZoomMode('FIT')}>{renderer}</CVEditorCanvas>} /><CVPrintSurface rootRef={printRootRef} cv={contentDraft} template={selectedTemplate} presentation={renderPresentation} photoUrl={hasAvatar ? avatarUrl : null} />{printError && <p role="alert" className="fixed bottom-4 right-4 z-[120] max-w-sm rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white shadow-xl">{printError}</p>}{previewOpen && <CVPreviewDialog onClose={closePreview} title={libraryPreviewTemplate ? 'CV mẫu tham khảo' : undefined} description={libraryPreviewTemplate ? 'Dữ liệu minh họa chỉ dùng để tham khảo và không thay đổi CV của bạn.' : undefined} actionLabel={libraryPreviewTemplate ? 'Sử dụng mẫu này vào CV' : undefined} onAction={libraryPreviewTemplate ? () => { changeTemplate(libraryPreviewTemplate.id); closePreview() } : undefined}><div className="mx-auto w-[794px]">{previewRenderer}</div></CVPreviewDialog>}{pendingNavigation && <UnsavedChangesDialog onStay={() => setPendingNavigation(null)} onLeave={() => { const destination = pendingNavigation; setPendingNavigation(null); destination() }} />}{showAvatarDialog && (<CVAvatarDialog currentUrl={hasAvatar ? avatarUrl : null} onConfirm={(file) => void uploadPhoto(file)} onRemove={() => void removePhoto()} onClose={() => setShowAvatarDialog(false)} />)}</>
}
