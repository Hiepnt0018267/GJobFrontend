import {
  AlertTriangle,
  ArrowLeft,
  Check,
  Columns,
  Eye,
  FileText,
  ImageUp,
  Layers,
  Lock,
  Maximize2,
  Palette,
  RotateCcw,
  SlidersHorizontal,
  Trash2,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react'
import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import AdminViewportPortal from '../AdminViewportPortal'
import CVPreview from '../../cv/CVPreview'
import { CV_THEME_OPTIONS, resolveCVTheme } from '../../cv/cvTheme'
import {
  createLongSampleCVData,
  createMinimalSampleCVData,
  createNormalSampleCVData,
} from '../../cv/sampleCVData'
import type {
  AdminCVTemplate,
  AdminCVTemplateCreateRequest,
  AdminCVTemplateUpdateRequest,
} from '../../../types/adminCVTemplate'
import type {
  CVTemplateExperienceLevel,
  CVTemplateLayoutKey,
  CVTemplateStyle,
  CVTemplateSummary,
  CVTemplateTaxonomy,
  CVTemplateThemeConfig,
} from '../../../types/cv'
import { layoutOptions } from './adminCVTemplateLayout'
import { cvTemplateService } from '../../../services/cvTemplateService'
import { CV_TEMPLATE_STYLE_LABELS } from '../../cv/cvTemplateStyles'
import { resolveApiAssetUrl } from '../../../services/api'
import AdminMultiSelect from './AdminMultiSelect'

type Props = {
  mode: 'create' | 'edit'
  template?: AdminCVTemplate
  submitting: boolean
  error: string | null
  onSubmit: (
    payload: AdminCVTemplateCreateRequest | AdminCVTemplateUpdateRequest,
    thumbnail?: File
  ) => void
}

const hexColor = /^#(?:[0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/
const normalizeHex = (value: string) => {
  const upper = value.toUpperCase()
  return upper.length === 4
    ? `#${[...upper.slice(1)].map((part) => part + part).join('')}`
    : upper
}

const editableTheme = (
  layout: CVTemplateLayoutKey,
  value?: Partial<CVTemplateThemeConfig> | null
): CVTemplateThemeConfig => {
  const theme = resolveCVTheme(layout, value)
  return {
    primary_color: theme.primary_color,
    secondary_color: theme.secondary_color,
    font_family: theme.font_family,
    font_scale: theme.font_scale,
    section_spacing: theme.section_spacing,
    line_spacing: theme.line_spacing,
    heading_style: theme.heading_style,
    default_section_visibility: theme.default_section_visibility,
  }
}

const EXPERIENCE_LABELS: Record<CVTemplateExperienceLevel, string> = {
  STUDENT: 'Sinh viên',
  FRESHER: 'Mới tốt nghiệp (Fresher)',
  JUNIOR: 'Junior (1 - 3 năm)',
  EXPERIENCED: 'Có kinh nghiệm (Experienced)',
}

const A4_WIDTH = 794

export default function AdminCVTemplateForm({
  mode,
  template,
  submitting,
  error,
  onSubmit,
}: Props) {
  const [code, setCode] = useState(template?.code ?? '')
  const [name, setName] = useState(template?.name ?? '')
  const [description, setDescription] = useState(template?.description ?? '')
  const [layoutKey, setLayoutKey] = useState<CVTemplateLayoutKey>(template?.layout_key ?? 'SIMPLE_SINGLE_COLUMN')
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [thumbnailPreviewUrl, setThumbnailPreviewUrl] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState(String(template?.sort_order ?? 0))
  const [active, setActive] = useState(template?.is_active ?? true)
  const [featured, setFeatured] = useState(template?.is_featured ?? false)
  const [localError, setLocalError] = useState<string | null>(null)

  const [taxonomy, setTaxonomy] = useState<CVTemplateTaxonomy | null>(null)
  const [industryGroups, setIndustryGroups] = useState<string[]>(template?.industry_groups ?? [])
  const [jobPositions, setJobPositions] = useState<string[]>(template?.job_positions ?? [])
  const [experienceLevels, setExperienceLevels] = useState<CVTemplateExperienceLevel[]>(
    template?.experience_levels ?? []
  )
  const [styles, setStyles] = useState<CVTemplateStyle[]>(template?.styles ?? [])
  const [themeConfig, setThemeConfig] = useState<CVTemplateThemeConfig>(() =>
    editableTheme(template?.layout_key ?? 'SIMPLE_SINGLE_COLUMN', template?.theme_config)
  )
  const [initialFormSignature] = useState(() => JSON.stringify({
    code: template?.code ?? '',
    name: template?.name ?? '',
    description: template?.description ?? '',
    layoutKey: template?.layout_key ?? 'SIMPLE_SINGLE_COLUMN',
    sortOrder: String(template?.sort_order ?? 0),
    active: template?.is_active ?? true,
    featured: template?.is_featured ?? false,
    industryGroups: template?.industry_groups ?? [],
    jobPositions: template?.job_positions ?? [],
    experienceLevels: template?.experience_levels ?? [],
    styles: template?.styles ?? [],
    themeConfig: editableTheme(template?.layout_key ?? 'SIMPLE_SINGLE_COLUMN', template?.theme_config),
  }))
  const currentFormSignature = JSON.stringify({
    code,
    name,
    description,
    layoutKey,
    sortOrder,
    active,
    featured,
    industryGroups,
    jobPositions,
    experienceLevels,
    styles,
    themeConfig,
  })
  const isDirty = thumbnailFile !== null || currentFormSignature !== initialFormSignature

  // Live preview interactive state
  const [zoomPercent, setZoomPercent] = useState<number>(68)
  const [sampleDataType, setSampleDataType] = useState<'NORMAL' | 'MINIMAL' | 'LONG'>('NORMAL')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [fullscreenZoom, setFullscreenZoom] = useState(100)

  const usageCount = template?.usage_count ?? 0
  const layoutLocked = mode === 'edit' && usageCount > 0

  const handleFileSelect = (file: File | null) => {
    if (thumbnailPreviewUrl) {
      URL.revokeObjectURL(thumbnailPreviewUrl)
    }
    if (!file) {
      setThumbnailFile(null)
      setThumbnailPreviewUrl(null)
      return
    }
    if (
      file.size > 5 * 1024 * 1024 ||
      !['image/jpeg', 'image/png', 'image/webp'].includes(file.type)
    ) {
      setLocalError('Ảnh cần là JPG, PNG hoặc WEBP và không vượt quá 5 MB.')
      return
    }
    setThumbnailFile(file)
    setThumbnailPreviewUrl(URL.createObjectURL(file))
    setLocalError(null)
  }

  const handleClearThumbnail = () => {
    if (thumbnailPreviewUrl) {
      URL.revokeObjectURL(thumbnailPreviewUrl)
    }
    setThumbnailFile(null)
    setThumbnailPreviewUrl(null)
  }

  // Cleanup object URL on unmount
  useEffect(() => {
    return () => {
      if (thumbnailPreviewUrl) {
        URL.revokeObjectURL(thumbnailPreviewUrl)
      }
    }
  }, [thumbnailPreviewUrl])

  useEffect(() => {
    if (!isDirty || submitting) return
    const beforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = ''
    }
    const protectInternalNavigation = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
      const target = event.target
      if (!(target instanceof Element)) return
      const anchor = target.closest<HTMLAnchorElement>('a[href]')
      if (!anchor || anchor.target === '_blank') return
      const destination = new URL(anchor.href, window.location.href)
      if (destination.origin !== window.location.origin) return
      if (!window.confirm('Bạn có thay đổi chưa lưu. Rời trang và bỏ các thay đổi này?')) {
        event.preventDefault()
        event.stopPropagation()
      }
    }
    window.addEventListener('beforeunload', beforeUnload)
    document.addEventListener('click', protectInternalNavigation, true)
    return () => {
      window.removeEventListener('beforeunload', beforeUnload)
      document.removeEventListener('click', protectInternalNavigation, true)
    }
  }, [isDirty, submitting])

  // Handle escape key for fullscreen modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isFullscreen])

  // Fetch taxonomy
  useEffect(() => {
    let cancelled = false
    cvTemplateService
      .getCVTemplateTaxonomy()
      .then((value) => {
        if (!cancelled) setTaxonomy(value)
      })
      .catch(() => {
        if (!cancelled) setLocalError('Không thể tải danh mục ngành nghề cho mẫu CV.')
      })
    return () => {
      cancelled = true
    }
  }, [])

  const updateTheme = <K extends keyof CVTemplateThemeConfig>(
    key: K,
    value: CVTemplateThemeConfig[K]
  ) => {
    setThemeConfig((current) => ({ ...current, [key]: value }))
  }

  const changeLayout = (nextLayout: CVTemplateLayoutKey) => {
    if (layoutLocked) return
    setLayoutKey(nextLayout)
    setThemeConfig(editableTheme(nextLayout))
  }

  const previewTemplate = useMemo<CVTemplateSummary>(
    () => ({
      id: 'admin-theme-preview',
      name: name.trim() || 'Mẫu CV mới',
      layout_key: layoutKey,
      theme_config: themeConfig,
      is_featured: featured,
      sort_order: Number(sortOrder) || 0,
      ats_status: template?.ats_status ?? 'UNREVIEWED',
      qualification_version: template?.qualification_version ?? 'ats-v1',
    }),
    [
      featured,
      layoutKey,
      name,
      sortOrder,
      template?.ats_status,
      template?.qualification_version,
      themeConfig,
    ]
  )

  const activeSampleCV = useMemo(() => {
    switch (sampleDataType) {
      case 'MINIMAL':
        return createMinimalSampleCVData(previewTemplate.id)
      case 'LONG':
        return createLongSampleCVData(previewTemplate.id)
      case 'NORMAL':
      default:
        return createNormalSampleCVData(previewTemplate.id)
    }
  }, [previewTemplate.id, sampleDataType])

  const submit = (event: FormEvent) => {
    event.preventDefault()
    const normalizedName = name.trim()
    const parsedOrder = Number(sortOrder)

    if (mode === 'create' && !/^[A-Z][A-Z0-9_]{2,63}$/.test(code)) {
      return setLocalError('Mã mẫu chỉ gồm chữ in hoa, số và dấu gạch dưới (VD: TECH_MODERN_01).')
    }
    if (!normalizedName) return setLocalError('Tên mẫu CV là bắt buộc.')
    if (!Number.isInteger(parsedOrder) || parsedOrder < 0) {
      return setLocalError('Thứ tự hiển thị phải là số nguyên từ 0 trở lên.')
    }
    if (!hexColor.test(themeConfig.primary_color) || !hexColor.test(themeConfig.secondary_color)) {
      return setLocalError('Màu giao diện phải có định dạng #RGB hoặc #RRGGBB.')
    }

    setLocalError(null)
    const metadata = {
      name: normalizedName,
      description: description.trim() || null,
      layout_key: layoutKey,
      theme_config: {
        ...themeConfig,
        primary_color: normalizeHex(themeConfig.primary_color),
        secondary_color: normalizeHex(themeConfig.secondary_color),
      },
      sort_order: parsedOrder,
      industry_groups: industryGroups,
      job_positions: jobPositions,
      experience_levels: experienceLevels,
      styles,
    }

    onSubmit(
      mode === 'create'
        ? {
            ...metadata,
            code,
            is_active: active,
            is_featured: featured && active,
          }
        : metadata,
      thumbnailFile ?? undefined
    )
  }

  // Calculate scaled dimensions
  const scale = zoomPercent / 100
  const fullscreenScale = fullscreenZoom / 100

  return (
    <form onSubmit={submit} className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_500px] 2xl:grid-cols-[minmax(0,1fr)_580px] xl:items-start">
      {/* LEFT COLUMN: FORM SECTIONS */}
      <div className="space-y-6">
        {/* CARD 1: THÔNG TIN MẪU */}
        <section className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs sm:p-7">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-[#1C1C1C]">
              <FileText size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-950">Thông tin cơ bản</h2>
              <p className="text-xs text-slate-500">Mã định danh, tên và mô tả chung của mẫu CV</p>
            </div>
          </div>

          <div className="mt-5 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Mã mẫu CV"
                hint={mode === 'create' ? 'In hoa, số & gạch dưới' : 'Mã cố định sau khi tạo'}
              >
                <input
                  value={code}
                  disabled={mode === 'edit'}
                  maxLength={64}
                  onChange={(event) => setCode(event.target.value.toUpperCase())}
                  className="input font-mono text-sm tracking-wide disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
                  placeholder="VD: TECH_MODERN_01"
                  required={mode === 'create'}
                />
              </Field>

              <Field label="Thứ tự ưu tiên" hint="Số nhỏ hiển thị trước">
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={sortOrder}
                  onChange={(event) => setSortOrder(event.target.value)}
                  className="input text-sm"
                  placeholder="0"
                />
              </Field>
            </div>

            <Field label="Tên mẫu CV" hint="Tên người dùng nhìn thấy">
              <input
                value={name}
                maxLength={255}
                onChange={(event) => setName(event.target.value)}
                className="input text-sm"
                placeholder="VD: CV Kỹ sư Hiện đại — Chuyên nghiệp"
                required
              />
            </Field>

            <Field label="Mô tả mẫu CV" hint="Giải thích phong cách hoặc đối tượng phù hợp">
              <textarea
                value={description}
                rows={3}
                onChange={(event) => setDescription(event.target.value)}
                className="input resize-y text-sm leading-6"
                placeholder="Mẫu CV được thiết kế với bố cục 2 cột cân đối, làm nổi bật kinh nghiệm và dự án..."
              />
            </Field>

            {/* THUMBNAIL UPLOAD & LIVE PREVIEW */}
            <div>
              <label className="block text-sm font-semibold text-slate-800">
                Ảnh đại diện xem trước
              </label>
              <p className="mt-1 text-xs text-slate-500">
                Ảnh thumbnail hiển thị tại danh sách mẫu CV cho ứng viên (tối đa 5MB, JPG/PNG/WEBP)
              </p>

              <div className="mt-2">
                {thumbnailPreviewUrl || template?.thumbnail_url ? (
                  <div className="flex items-center gap-3.5 rounded-xl border border-slate-200 bg-slate-50/70 p-3">
                    <div className="relative grid h-16 w-14 shrink-0 place-items-center overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xs">
                      <FileText size={18} className="text-slate-300" aria-hidden="true" />
                      <img
                        src={
                          thumbnailPreviewUrl ??
                          (template?.thumbnail_url ? resolveApiAssetUrl(template.thumbnail_url) : '')
                        }
                        alt="Ảnh xem trước"
                        className="absolute inset-0 h-full w-full object-cover"
                        onError={(event) => { event.currentTarget.style.display = 'none' }}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-200">
                          <Check size={11} />
                          {thumbnailFile ? 'Ảnh mới chọn' : 'Ảnh hiện tại'}
                        </span>
                        {thumbnailFile && (
                          <span className="text-[11px] text-slate-500">
                            {(thumbnailFile.size / 1024).toFixed(1)} KB
                          </span>
                        )}
                      </div>
                      <p className="mt-1 truncate text-xs font-medium text-slate-700">
                        {thumbnailFile?.name ||
                          template?.thumbnail_original_filename ||
                          'Ảnh đại diện hiện hành'}
                      </p>
                      <div className="mt-1.5 flex items-center gap-2">
                        <label className="inline-flex cursor-pointer items-center gap-1 rounded-md border border-slate-300 bg-white px-2 py-0.5 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
                          <ImageUp size={12} />
                          Đổi ảnh
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            className="sr-only"
                            onChange={(event) => {
                              handleFileSelect(event.target.files?.[0] ?? null)
                              event.target.value = ''
                            }}
                          />
                        </label>
                        {thumbnailFile && (
                          <button
                            type="button"
                            onClick={handleClearThumbnail}
                            className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 size={12} />
                            Hủy chọn
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50/70 px-4 py-3 transition-all hover:border-slate-400 hover:bg-slate-100/70">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-slate-600 shadow-xs ring-1 ring-slate-200">
                        <ImageUp size={17} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-800">Tải ảnh đại diện mẫu</p>
                        <p className="text-[11px] text-slate-500">Hỗ trợ JPG, PNG, WEBP (Tối đa 5 MB)</p>
                      </div>
                    </div>
                    <span className="shrink-0 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition-colors">
                      Chọn ảnh
                    </span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="sr-only"
                      onChange={(event) => {
                        handleFileSelect(event.target.files?.[0] ?? null)
                        event.target.value = ''
                      }}
                    />
                  </label>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* CARD 2: BỐ CỤC MẪU (VISUAL CARDS) */}
        <section className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs sm:p-7">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-[#1C1C1C]">
                <Layers size={18} />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-950">Bố cục mẫu CV</h2>
                <p className="text-xs text-slate-500">
                  Chọn khung kết cấu hiển thị của CV ứng viên
                </p>
              </div>
            </div>
            {layoutLocked && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-800 ring-1 ring-amber-200">
                <Lock size={12} />
                Đã khóa (đang có {usageCount} CV sử dụng)
              </span>
            )}
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {layoutOptions.map((opt) => {
              const isSelected = layoutKey === opt.value
              return (
                <div
                  key={opt.value}
                  role="button"
                  tabIndex={layoutLocked ? -1 : 0}
                  onClick={() => changeLayout(opt.value)}
                  onKeyDown={(e) => {
                    if ((e.key === 'Enter' || e.key === ' ') && !layoutLocked) {
                      e.preventDefault()
                      changeLayout(opt.value)
                    }
                  }}
                  className={`relative flex flex-col justify-between rounded-xl border p-3.5 text-left transition-all ${
                    layoutLocked
                      ? 'cursor-not-allowed opacity-60'
                      : 'cursor-pointer hover:border-slate-400'
                  } ${
                    isSelected
                      ? 'border-[#1C1C1C] bg-slate-50/80 ring-2 ring-[#1C1C1C]/10'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md ${
                          isSelected
                            ? 'bg-[#1C1C1C] text-white'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        <Columns size={13} />
                      </div>
                      <span className="text-xs font-bold text-slate-950">{opt.label}</span>
                    </div>
                    <div
                      className={`h-4 w-4 shrink-0 rounded-full border flex items-center justify-center transition-colors ${
                        isSelected
                          ? 'border-[#1C1C1C] bg-[#1C1C1C] text-white'
                          : 'border-slate-300 bg-white'
                      }`}
                    >
                      {isSelected && <Check size={10} strokeWidth={3} />}
                    </div>
                  </div>
                  <p className="mt-2 text-[11px] leading-4 text-slate-500">{opt.description}</p>
                </div>
              )
            })}
          </div>
        </section>

        {/* CARD 3: PHÂN LOẠI & ĐỐI TƯỢNG PHÙ HỢP */}
        <section className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs sm:p-7">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-[#1C1C1C]">
              <SlidersHorizontal size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-950">Phân loại & Định vị</h2>
              <p className="text-xs text-slate-500">
                Gắn nhãn để ứng viên dễ dàng lọc và tìm kiếm mẫu theo ngành nghề, vị trí
              </p>
            </div>
          </div>

          {taxonomy ? (
            <div className="mt-5 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <AdminMultiSelect
                  label="Ngành nghề"
                  description="Các nhóm ngành phù hợp với mẫu CV này"
                  values={industryGroups}
                  options={taxonomy.industries.map((item) => ({
                    value: item.code,
                    label: item.display_name,
                  }))}
                  onChange={setIndustryGroups}
                  placeholder="Tìm ngành nghề..."
                />

                <AdminMultiSelect
                  label="Vị trí công việc"
                  description="Chức danh cụ thể được đề xuất"
                  values={jobPositions}
                  options={taxonomy.industries
                    .flatMap((item) => item.positions)
                    .filter(
                      (item, index, all) =>
                        all.findIndex((candidate) => candidate.code === item.code) === index
                    )
                    .map((item) => ({ value: item.code, label: item.display_name }))}
                  onChange={setJobPositions}
                  placeholder="Tìm vị trí..."
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <AdminMultiSelect
                  label="Cấp bậc kinh nghiệm"
                  values={experienceLevels}
                  options={taxonomy.experience_levels.map((value) => ({
                    value,
                    label: EXPERIENCE_LABELS[value] || value,
                  }))}
                  onChange={(vals) => setExperienceLevels(vals as CVTemplateExperienceLevel[])}
                  placeholder="Chọn cấp bậc..."
                />

                <AdminMultiSelect
                  label="Phong cách thiết kế"
                  values={styles}
                  options={taxonomy.styles.map((value) => ({
                    value,
                    label: CV_TEMPLATE_STYLE_LABELS[value] || value,
                  }))}
                  onChange={(vals) => setStyles(vals as CVTemplateStyle[])}
                  placeholder="Chọn phong cách..."
                />
              </div>
            </div>
          ) : (
            <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700" />
              Đang tải danh mục ngành nghề...
            </div>
          )}
        </section>

        {/* CARD 4: MÀU SẮC & GIAO DIỆN */}
        <section className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs sm:p-7">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-[#1C1C1C]">
                <Palette size={18} />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-950">Tùy biến giao diện & Màu sắc</h2>
                <p className="text-xs text-slate-500">
                  Cấu hình màu sắc mặc định, phông chữ và bố cục chi tiết
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setThemeConfig(editableTheme(layoutKey))}
              className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
              title="Đặt lại theme mặc định của bố cục"
            >
              <RotateCcw size={13} />
              Đặt lại
            </button>
          </div>

          {mode === 'edit' && usageCount > 0 && (
            <div className="mt-4 flex items-start gap-2.5 rounded-xl bg-amber-50 p-3.5 text-xs text-amber-900 ring-1 ring-amber-200">
              <AlertTriangle className="mt-0.5 shrink-0" size={16} />
              <span>
                Thay đổi giao diện chỉ áp dụng cho người dùng chọn mẫu mới; {usageCount} CV đã lưu
                trước đó sẽ giữ snapshot hiện hành.
              </span>
            </div>
          )}

          {/* DETAILED COLOR PICKERS */}
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Field label="Màu chủ đạo (Primary)" hint="Tiêu đề, điểm nhấn, thanh bar">
              <div className="flex items-center gap-2.5">
                <div className="relative flex h-11 w-14 shrink-0 overflow-hidden rounded-xl border border-slate-300 bg-white shadow-xs p-1">
                  <input
                    type="color"
                    value={
                      hexColor.test(themeConfig.primary_color)
                        ? normalizeHex(themeConfig.primary_color)
                        : '#49BBBD'
                    }
                    onChange={(event) =>
                      updateTheme('primary_color', event.target.value.toUpperCase())
                    }
                    className="h-full w-full cursor-pointer opacity-0 absolute inset-0"
                    aria-label="Chọn màu chủ đạo"
                  />
                  <div
                    className="h-full w-full rounded-lg"
                    style={{
                      backgroundColor: hexColor.test(themeConfig.primary_color)
                        ? themeConfig.primary_color
                        : '#49BBBD',
                    }}
                  />
                </div>
                <input
                  value={themeConfig.primary_color}
                  maxLength={7}
                  onChange={(event) =>
                    updateTheme('primary_color', event.target.value.toUpperCase())
                  }
                  className="input font-mono text-xs uppercase"
                  placeholder="#49BBBD"
                />
              </div>
            </Field>

            <Field label="Màu phụ (Secondary)" hint="Đường viền, nhãn mục phụ">
              <div className="flex items-center gap-2.5">
                <div className="relative flex h-11 w-14 shrink-0 overflow-hidden rounded-xl border border-slate-300 bg-white shadow-xs p-1">
                  <input
                    type="color"
                    value={
                      hexColor.test(themeConfig.secondary_color)
                        ? normalizeHex(themeConfig.secondary_color)
                        : '#64748B'
                    }
                    onChange={(event) =>
                      updateTheme('secondary_color', event.target.value.toUpperCase())
                    }
                    className="h-full w-full cursor-pointer opacity-0 absolute inset-0"
                    aria-label="Chọn màu phụ"
                  />
                  <div
                    className="h-full w-full rounded-lg"
                    style={{
                      backgroundColor: hexColor.test(themeConfig.secondary_color)
                        ? themeConfig.secondary_color
                        : '#64748B',
                    }}
                  />
                </div>
                <input
                  value={themeConfig.secondary_color}
                  maxLength={7}
                  onChange={(event) =>
                    updateTheme('secondary_color', event.target.value.toUpperCase())
                  }
                  className="input font-mono text-xs uppercase"
                  placeholder="#64748B"
                />
              </div>
            </Field>
          </div>

          {/* TYPOGRAPHY & SPACING */}
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <SelectField
              label="Phông chữ"
              value={themeConfig.font_family}
              options={CV_THEME_OPTIONS.fontFamilies}
              onChange={(value) => updateTheme('font_family', value)}
            />
            <SelectField
              label="Cỡ chữ"
              value={themeConfig.font_scale}
              options={CV_THEME_OPTIONS.fontScales}
              onChange={(value) => updateTheme('font_scale', value)}
            />
            <SelectField
              label="Kiểu tiêu đề"
              value={themeConfig.heading_style}
              options={CV_THEME_OPTIONS.headingStyles}
              onChange={(value) => updateTheme('heading_style', value)}
            />
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <SelectField
              label="Khoảng cách giữa các phần"
              value={themeConfig.section_spacing}
              options={CV_THEME_OPTIONS.sectionSpacings}
              onChange={(value) => updateTheme('section_spacing', value)}
            />
            <SelectField
              label="Khoảng cách dòng (Line height)"
              value={themeConfig.line_spacing}
              options={CV_THEME_OPTIONS.lineSpacings}
              onChange={(value) => updateTheme('line_spacing', value)}
            />
          </div>

          {/* SECTION VISIBILITY TOGGLES */}
          <div className="mt-5 border-t border-slate-100 pt-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
              Mặc định hiển thị các phần nội dung
            </label>
            <div className="mt-3 flex flex-wrap gap-2">
              {Object.entries({
                summary: 'Giới thiệu bản thân',
                experience: 'Kinh nghiệm làm việc',
                education: 'Học vấn',
                skills: 'Kỹ năng',
                projects: 'Dự án nổi bật',
                certificates: 'Chứng chỉ',
                languages: 'Ngoại ngữ',
              }).map(([key, label]) => {
                const isChecked =
                  themeConfig.default_section_visibility[
                    key as keyof typeof themeConfig.default_section_visibility
                  ]
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() =>
                      updateTheme('default_section_visibility', {
                        ...themeConfig.default_section_visibility,
                        [key]: !isChecked,
                      })
                    }
                    className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                      isChecked
                        ? 'bg-[#1C1C1C] text-white shadow-xs'
                        : 'border border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    <div
                      className={`h-3 w-3 rounded-full border flex items-center justify-center ${
                        isChecked ? 'border-white bg-white text-black' : 'border-slate-400'
                      }`}
                    >
                      {isChecked && <Check size={8} strokeWidth={4} />}
                    </div>
                    {label}
                  </button>
                )
              })}
            </div>
          </div>
        </section>

        {/* CARD 5: TRẠNG THÁI & KÍCH HOẠT */}
        {mode === 'create' && (
          <section className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs sm:p-7">
            <h2 className="text-base font-bold text-slate-950">Trạng thái phát hành</h2>
            <div className="mt-4 flex flex-wrap gap-6">
              <label className="inline-flex cursor-pointer items-center gap-2.5 text-sm font-semibold text-slate-800">
                <input
                  type="checkbox"
                  checked={active}
                  onChange={(event) => {
                    setActive(event.target.checked)
                    if (!event.target.checked) setFeatured(false)
                  }}
                  className="h-4 w-4 rounded accent-[#1C1C1C]"
                />
                Kích hoạt mẫu ngay
              </label>

              <label className="inline-flex cursor-pointer items-center gap-2.5 text-sm font-semibold text-slate-800">
                <input
                  type="checkbox"
                  checked={featured}
                  disabled={!active}
                  onChange={(event) => setFeatured(event.target.checked)}
                  className="h-4 w-4 rounded accent-[#1C1C1C] disabled:opacity-40"
                />
                Đánh dấu là mẫu nổi bật (Featured)
              </label>
            </div>
          </section>
        )}

        {/* ERROR MESSAGE BANNER */}
        {(localError || error) && (
          <div
            role="alert"
            className="flex items-start gap-2.5 rounded-xl bg-red-50 p-4 text-sm font-medium text-red-800 ring-1 ring-red-200"
          >
            <AlertTriangle size={18} className="mt-0.5 shrink-0 text-red-600" />
            <div className="flex-1">{localError || error}</div>
          </div>
        )}

        {/* FORM ACTIONS */}
        <div className="flex items-center justify-between border-t border-slate-200 pt-5">
          <Link
            to="/admin/cv-templates"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-black transition-colors"
          >
            <ArrowLeft size={16} />
            Hủy / Quay lại
          </Link>

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1C1C1C] px-6 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-black disabled:cursor-not-allowed disabled:opacity-60 transition-colors"
          >
            {submitting ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Đang lưu...
              </>
            ) : mode === 'create' ? (
              'Tạo mẫu CV'
            ) : (
              'Lưu thay đổi'
            )}
          </button>
        </div>
      </div>

      {/* RIGHT COLUMN: DEDICATED LIVE PREVIEW WORKSPACE */}
      <aside className="xl:sticky xl:top-6">
        <section className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm">
          {/* PREVIEW TOP BAR */}
          <div className="border-b border-slate-100 p-4 sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                  </span>
                  <h2 className="text-sm font-bold text-slate-950">Xem trước trực tiếp</h2>
                </div>
                <p className="mt-0.5 truncate text-[11px] text-slate-500">
                  Tự động cập nhật theo cấu hình
                </p>
              </div>

              {/* SAMPLE DATA SELECTOR */}
              <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 p-1 text-xs">
                <button
                  type="button"
                  onClick={() => setSampleDataType('NORMAL')}
                  className={`rounded-md px-2 py-1 font-semibold transition-all ${
                    sampleDataType === 'NORMAL'
                      ? 'bg-white text-slate-950 shadow-xs'
                      : 'text-slate-600 hover:text-black'
                  }`}
                  title="Dữ liệu mẫu tiêu chuẩn"
                >
                  Chuẩn
                </button>
                <button
                  type="button"
                  onClick={() => setSampleDataType('LONG')}
                  className={`rounded-md px-2 py-1 font-semibold transition-all ${
                    sampleDataType === 'LONG'
                      ? 'bg-white text-slate-950 shadow-xs'
                      : 'text-slate-600 hover:text-black'
                  }`}
                  title="Dữ liệu mẫu dài nhiều kinh nghiệm"
                >
                  Dài
                </button>
                <button
                  type="button"
                  onClick={() => setSampleDataType('MINIMAL')}
                  className={`rounded-md px-2 py-1 font-semibold transition-all ${
                    sampleDataType === 'MINIMAL'
                      ? 'bg-white text-slate-950 shadow-xs'
                      : 'text-slate-600 hover:text-black'
                  }`}
                  title="Dữ liệu mẫu tối giản"
                >
                  Gọn
                </button>
              </div>
            </div>

            {/* ZOOM & CONTROLS TOOLBAR */}
            <div className="mt-3.5 flex items-center justify-between border-t border-slate-100 pt-3">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setZoomPercent((prev) => Math.max(45, prev - 10))}
                  className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-950 transition-colors"
                  title="Thu nhỏ (-10%)"
                >
                  <ZoomOut size={15} />
                </button>
                <span className="w-12 text-center font-mono text-xs font-semibold text-slate-700">
                  {zoomPercent}%
                </span>
                <button
                  type="button"
                  onClick={() => setZoomPercent((prev) => Math.min(100, prev + 10))}
                  className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-950 transition-colors"
                  title="Phóng to (+10%)"
                >
                  <ZoomIn size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => setZoomPercent(68)}
                  className="ml-1 rounded-md bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-200 transition-colors"
                >
                  Vừa khung
                </button>
              </div>

              {/* FULLSCREEN BUTTON */}
              <button
                type="button"
                onClick={() => {
                  setFullscreenZoom(100)
                  setIsFullscreen(true)
                }}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-black shadow-xs transition-colors"
              >
                <Maximize2 size={13} />
                Xem toàn màn hình
              </button>
            </div>
          </div>

          {/* SCROLLABLE PREVIEW CANVAS */}
          <div className="relative h-[640px] 2xl:h-[720px] overflow-auto bg-slate-100/90 p-4 sm:p-6 flex justify-center items-start">
            <div
              style={{
                width: A4_WIDTH * scale,
                minHeight: 1123 * scale,
                transition: 'width 0.15s ease-out',
              }}
              className="shrink-0"
            >
              <div
                style={{
                  width: A4_WIDTH,
                  transform: `scale(${scale})`,
                  transformOrigin: 'top left',
                }}
                className="rounded-sm bg-white shadow-2xl ring-1 ring-slate-900/10"
              >
                <CVPreview
                  cv={activeSampleCV}
                  template={previewTemplate}
                  presentation={{ locale: 'vi' }}
                />
              </div>
            </div>
          </div>

          {/* PREVIEW FOOTER */}
          <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/60 px-4 py-2.5 text-[11px] text-slate-500">
            <span>Khổ A4 chuẩn (794 × 1123px)</span>
            <span className="font-medium text-slate-700">{layoutKey}</span>
          </div>
        </section>
      </aside>

      {/* FULLSCREEN PREVIEW MODAL */}
      {isFullscreen && (
        <AdminViewportPortal><div
          role="presentation"
          className="fixed inset-0 z-[100] flex min-h-dvh flex-col bg-slate-950/80 backdrop-blur-md animate-in fade-in-50 duration-200"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setIsFullscreen(false)
          }}
        >
          {/* MODAL HEADER */}
          <header className="flex items-center justify-between border-b border-white/10 bg-slate-900 px-6 py-4 text-white">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white">
                <Eye size={18} />
              </div>
              <div>
                <h3 className="font-bold text-sm tracking-tight text-white">
                  Xem toàn màn hình: {name || 'Mẫu CV mới'}
                </h3>
                <p className="text-xs text-slate-400">
                  {layoutKey} · Tỷ lệ thực tế A4 sắc nét 100%
                </p>
              </div>
            </div>

            {/* MODAL ZOOM & ACTIONS */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 rounded-xl bg-white/10 p-1 text-xs">
                <button
                  type="button"
                  onClick={() => setFullscreenZoom((prev) => Math.max(50, prev - 10))}
                  className="rounded-lg p-1.5 text-slate-300 hover:bg-white/10 hover:text-white"
                  title="Thu nhỏ"
                >
                  <ZoomOut size={16} />
                </button>
                <span className="w-14 text-center font-mono font-semibold text-white">
                  {fullscreenZoom}%
                </span>
                <button
                  type="button"
                  onClick={() => setFullscreenZoom((prev) => Math.min(150, prev + 10))}
                  className="rounded-lg p-1.5 text-slate-300 hover:bg-white/10 hover:text-white"
                  title="Phóng to"
                >
                  <ZoomIn size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => setFullscreenZoom(100)}
                  className="rounded-lg px-2.5 py-1 font-semibold text-slate-300 hover:bg-white/10 hover:text-white"
                >
                  100%
                </button>
              </div>

              <button
                type="button"
                onClick={() => setIsFullscreen(false)}
                className="grid h-9 w-9 place-items-center rounded-xl bg-white/10 text-slate-300 hover:bg-white/20 hover:text-white transition-colors"
                title="Đóng xem toàn màn hình (Esc)"
              >
                <X size={18} />
              </button>
            </div>
          </header>

          {/* MODAL CANVAS */}
          <div className="flex-1 overflow-auto p-6 sm:p-10 flex justify-center items-start">
            <div
              style={{
                width: A4_WIDTH * fullscreenScale,
                minHeight: 1123 * fullscreenScale,
              }}
              className="shrink-0"
            >
              <div
                style={{
                  width: A4_WIDTH,
                  transform: `scale(${fullscreenScale})`,
                  transformOrigin: 'top left',
                }}
                className="rounded bg-white shadow-2xl ring-1 ring-black/20"
              >
                <CVPreview
                  cv={activeSampleCV}
                  template={previewTemplate}
                  presentation={{ locale: 'vi' }}
                />
              </div>
            </div>
          </div>
        </div></AdminViewportPortal>
      )}
    </form>
  )
}

function Field({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: ReactNode
}) {
  return (
    <label className="block text-sm font-semibold text-slate-800">
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <span>{label}</span>
        {hint && <span className="text-xs font-normal text-slate-500">{hint}</span>}
      </div>
      <div>{children}</div>
    </label>
  )
}

function SelectField<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: T
  options: ReadonlyArray<{ value: T; label: string }>
  onChange: (value: T) => void
}) {
  return (
    <Field label={label}>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as T)}
        className="input bg-white text-xs font-medium"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </Field>
  )
}
