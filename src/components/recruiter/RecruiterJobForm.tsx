import { CircleDollarSign, FileText, LoaderCircle, RefreshCw, Save, Sparkles } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { jobTaxonomyService } from '../../services/jobTaxonomyService'
import type { JobCreateRequest, RecruiterJob, SalaryType } from '../../types/job'
import type { JobTaxonomyResponse } from '../../types/jobTaxonomy'
import SearchableTaxonomySelect, { type TaxonomySelectOption } from './SearchableTaxonomySelect'
import {
  filterAllowedLevels,
  nextLevelAfterPositionChange,
  nextSelectionAfterIndustryChange,
  positionsForIndustry,
  titleAfterPositionChange,
} from './recruiterJobTaxonomy'

type Props = {
  initialJob?: RecruiterJob
  submitting: boolean
  serverError: string | null
  submitLabel: string
  onSubmit: (payload: JobCreateRequest) => Promise<void>
  onCancel: () => void
  taxonomy?: JobTaxonomyResponse | null
}

type FormState = {
  title: string
  company_name: string
  industry: string
  industry_group_id: string
  job_position_id: string
  level: string
  experience_requirement: string
  employment_type: string
  work_mode: string
  vacancies: string
  location: string
  salary_type: SalaryType
  salary_min: string
  salary_max: string
  salary_fixed: string
  description: string
  requirements: string
  benefits: string
  skills: string
}

const levelOptions: [string, string][] = [
  ['INTERN', 'Thực tập sinh'],
  ['JUNIOR', 'Mới tốt nghiệp / Junior'],
  ['STAFF', 'Chuyên viên'],
  ['SENIOR', 'Chuyên viên cao cấp / Senior'],
  ['LEAD', 'Trưởng nhóm / Lead'],
  ['MANAGER', 'Quản lý'],
  ['DIRECTOR', 'Giám đốc'],
  ['EXECUTIVE', 'Lãnh đạo cấp cao'],
]
const experienceOptions = [
  ['NO_EXPERIENCE', 'Chưa có kinh nghiệm'],
  ['LESS_THAN_ONE_YEAR', 'Dưới 1 năm'],
  ['ONE_TO_THREE_YEARS', '1–3 năm'],
  ['THREE_TO_FIVE_YEARS', '3–5 năm'],
  ['MORE_THAN_FIVE_YEARS', 'Trên 5 năm'],
]
const employmentOptions = [
  ['FULL_TIME', 'Toàn thời gian'],
  ['PART_TIME', 'Bán thời gian'],
  ['CONTRACT', 'Hợp đồng'],
  ['INTERNSHIP', 'Thực tập'],
  ['FREELANCE', 'Freelance'],
]
const workOptions = [
  ['ONSITE', 'Tại văn phòng'],
  ['HYBRID', 'Kết hợp'],
  ['REMOTE', 'Từ xa'],
]
const inputClass =
  'mt-2 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-[#1C1C1C] focus:ring-2 focus:ring-[#1C1C1C]/10 disabled:bg-slate-100'
const labelClass = 'text-sm font-semibold text-slate-700'

function initialState(job?: RecruiterJob): FormState {
  return {
    title: job?.title ?? '',
    company_name: job?.company_name ?? '',
    industry: job?.industry ?? '',
    industry_group_id: job?.industry_group_id ?? '',
    job_position_id: job?.job_position_id ?? '',
    level: job?.level ?? '',
    experience_requirement: job?.experience_requirement ?? '',
    employment_type: job?.employment_type ?? '',
    work_mode: job?.work_mode ?? '',
    vacancies: String(job?.vacancies ?? 1),
    location: job?.location ?? '',
    salary_type: job?.salary_type ?? 'NEGOTIABLE',
    salary_min: job?.salary_min?.toString() ?? '',
    salary_max: job?.salary_max?.toString() ?? '',
    salary_fixed: job?.salary_fixed?.toString() ?? '',
    description: job?.description ?? '',
    requirements: job?.requirements ?? '',
    benefits: job?.benefits ?? '',
    skills: job?.skills?.join(', ') ?? '',
  }
}

export default function RecruiterJobForm({
  initialJob,
  submitting,
  serverError,
  submitLabel,
  onSubmit,
  onCancel,
  taxonomy: propsTaxonomy,
}: Props) {
  const [form, setForm] = useState<FormState>(() => initialState(initialJob))
  const [formError, setFormError] = useState<string | null>(null)
  const [taxonomy, setTaxonomy] = useState<JobTaxonomyResponse | null>(propsTaxonomy ?? null)
  const [taxonomyLoading, setTaxonomyLoading] = useState<boolean>(!propsTaxonomy)
  const [taxonomyError, setTaxonomyError] = useState<string | null>(null)
  const titleEditedByUser = useRef(Boolean(initialJob?.title?.trim()))

  const loadTaxonomy = useCallback(
    async (signal?: AbortSignal) => {
      if (propsTaxonomy !== undefined) {
        setTaxonomy(propsTaxonomy)
        setTaxonomyLoading(false)
        return
      }
      setTaxonomyLoading(true)
      setTaxonomyError(null)
      try {
        const data = await jobTaxonomyService.getActive(signal)
        setTaxonomy(data)
      } catch {
        if (!signal?.aborted) {
          setTaxonomyError('Không thể tải danh mục nghề nghiệp. Vui lòng thử lại.')
        }
      } finally {
        if (!signal?.aborted) {
          setTaxonomyLoading(false)
        }
      }
    },
    [propsTaxonomy]
  )

  useEffect(() => {
    const controller = new AbortController()
    loadTaxonomy(controller.signal)
    return () => controller.abort()
  }, [loadTaxonomy])

  const set = (field: keyof FormState, value: string) =>
    setForm((current) => ({ ...current, [field]: value }))

  const changeSalaryType = (value: SalaryType) =>
    setForm((current) => ({
      ...current,
      salary_type: value,
      salary_min: '',
      salary_max: '',
      salary_fixed: '',
    }))

  const isIndustryInactive = Boolean(
    initialJob?.industry_group_taxonomy && !initialJob.industry_group_taxonomy.is_active
  )
  const isPositionInactive = Boolean(
    initialJob?.job_position_taxonomy && !initialJob.job_position_taxonomy.is_active
  )

  const industryOptions: TaxonomySelectOption[] = useMemo(() => {
    const activeOptions = (taxonomy?.industries ?? []).map((ind) => ({
      id: ind.id,
      label: ind.display_name,
      inactive: false,
    }))

    if (isIndustryInactive && initialJob?.industry_group_taxonomy) {
      if (!activeOptions.some((opt) => opt.id === initialJob.industry_group_taxonomy?.id)) {
        activeOptions.unshift({
          id: initialJob.industry_group_taxonomy.id,
          label: initialJob.industry_group_taxonomy.display_name,
          inactive: true,
        })
      }
    }

    return activeOptions
  }, [taxonomy, isIndustryInactive, initialJob])

  const positionOptions: TaxonomySelectOption[] = useMemo(() => {
    if (!form.industry_group_id) return []

    const selectedIndustry = taxonomy?.industries.find((ind) => ind.id === form.industry_group_id)
    const activePositions = (selectedIndustry?.positions ?? []).map((pos) => ({
      id: pos.id,
      label: pos.display_name,
      inactive: false,
    }))

    if (
      isPositionInactive &&
      initialJob?.job_position_taxonomy &&
      initialJob.industry_group_id === form.industry_group_id
    ) {
      if (!activePositions.some((pos) => pos.id === initialJob.job_position_taxonomy?.id)) {
        activePositions.unshift({
          id: initialJob.job_position_taxonomy.id,
          label: initialJob.job_position_taxonomy.display_name,
          inactive: true,
        })
      }
    }

    return activePositions
  }, [taxonomy, form.industry_group_id, isPositionInactive, initialJob])

  const selectedPosition = useMemo(() => {
    if (!form.job_position_id) return undefined
    const positions = positionsForIndustry(taxonomy?.industries ?? [], form.industry_group_id)
    return positions.find((p) => p.id === form.job_position_id)
  }, [taxonomy, form.industry_group_id, form.job_position_id])

  const availableLevelOptions = useMemo(() => {
    return filterAllowedLevels(levelOptions, selectedPosition?.allowed_levels)
  }, [selectedPosition])

  const handleIndustryChange = (newIndustryId: string) => {
    const next = nextSelectionAfterIndustryChange(
      taxonomy?.industries ?? [],
      newIndustryId,
      form.job_position_id
    )
    const positions = positionsForIndustry(taxonomy?.industries ?? [], next.industryGroupId)
    const nextPos = positions.find((p) => p.id === next.jobPositionId)
    setForm((current) => ({
      ...current,
      industry_group_id: next.industryGroupId,
      job_position_id: next.jobPositionId,
      level: nextLevelAfterPositionChange(nextPos, current.level),
    }))
  }

  const handlePositionChange = (newPositionId: string) => {
    const positions = positionsForIndustry(taxonomy?.industries ?? [], form.industry_group_id)
    const newPosition = positions.find((p) => p.id === newPositionId)
    setForm((current) => ({
      ...current,
      job_position_id: newPositionId,
      title: titleAfterPositionChange(current.title, newPosition, !titleEditedByUser.current),
      level: nextLevelAfterPositionChange(newPosition, current.level),
    }))
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setFormError(null)

    const min = form.salary_min ? Number(form.salary_min) : null
    const max = form.salary_max ? Number(form.salary_max) : null
    const fixed = form.salary_fixed ? Number(form.salary_fixed) : null

    if (form.salary_type === 'RANGE' && (min === null || max === null || min < 1 || max < min)) {
      setFormError('Khoảng lương phải lớn hơn 0 và mức tối đa không được thấp hơn mức tối thiểu.')
      return
    }
    if (form.salary_type === 'FIXED' && (fixed === null || fixed < 1)) {
      setFormError('Vui lòng nhập mức lương cố định lớn hơn 0.')
      return
    }

    await onSubmit({
      title: form.title.trim(),
      company_name: form.company_name.trim(),
      industry:
        initialJob?.industry ??
        (form.industry ? (form.industry as JobCreateRequest['industry']) : null),
      industry_group_id: form.industry_group_id || null,
      job_position_id: form.job_position_id || null,
      level: form.level ? (form.level as JobCreateRequest['level']) : null,
      experience_requirement: form.experience_requirement
        ? (form.experience_requirement as JobCreateRequest['experience_requirement'])
        : null,
      employment_type: form.employment_type
        ? (form.employment_type as JobCreateRequest['employment_type'])
        : null,
      work_mode: form.work_mode ? (form.work_mode as JobCreateRequest['work_mode']) : null,
      vacancies: Number(form.vacancies),
      location: form.location.trim() || null,
      salary_type: form.salary_type,
      salary_min: form.salary_type === 'RANGE' ? min : null,
      salary_max: form.salary_type === 'RANGE' ? max : null,
      salary_fixed: form.salary_type === 'FIXED' ? fixed : null,
      salary_currency: 'VND',
      description: form.description.trim(),
      requirements: form.requirements.trim(),
      benefits: form.benefits.trim() || null,
      skills: form.skills
        .split(',')
        .map((skill) => skill.trim())
        .filter(Boolean),
    })
  }

  const select = (label: string, field: keyof FormState, options: string[][]) => (
    <label className={labelClass}>
      {label}
      <select
        value={form[field]}
        onChange={(e) => set(field, e.target.value)}
        className={inputClass}
      >
        <option value="">Chọn {label.toLowerCase()}</option>
        {options.map(([value, text]) => (
          <option key={value} value={value}>
            {text}
          </option>
        ))}
      </select>
    </label>
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {(formError || serverError) && (
        <div
          role="alert"
          className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700 ring-1 ring-red-100"
        >
          {formError || serverError}
        </div>
      )}

      <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-7">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-[#1C1C1C]">
            <FileText size={20} />
          </span>
          <div>
            <h2 className="font-bold text-slate-900">Thông tin công việc</h2>
            <p className="text-sm text-slate-500">Những thông tin ứng viên nhìn thấy đầu tiên.</p>
          </div>
        </div>

        {taxonomyLoading && (
          <div className="mt-4 flex items-center gap-2 text-xs font-medium text-slate-500" aria-busy="true">
            <LoaderCircle size={14} className="animate-spin text-[#1C1C1C]" />
            <span>Đang tải danh mục nghề nghiệp...</span>
          </div>
        )}

        {taxonomyError && (
          <div
            role="alert"
            className="mt-4 flex items-center justify-between rounded-xl bg-red-50 p-3 text-xs font-medium text-red-700 ring-1 ring-red-200"
          >
            <span>{taxonomyError}</span>
            <button
              type="button"
              onClick={() => loadTaxonomy()}
              className="inline-flex items-center gap-1 font-bold underline hover:text-red-900"
            >
              <RefreshCw size={12} />
              Thử lại
            </button>
          </div>
        )}

        {/* LUỒNG GIAO DIỆN:
            Ngành nghề
            → Vị trí chuyên môn
            → Cấp bậc
            → Kinh nghiệm
            → Tiêu đề tin
        */}
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          {/* 1. Ngành nghề */}
          <SearchableTaxonomySelect
            label="Ngành nghề"
            value={form.industry_group_id}
            options={industryOptions}
            onChange={handleIndustryChange}
            disabled={isIndustryInactive}
            loading={taxonomyLoading}
            searchPlaceholder="Tìm ngành nghề..."
            selectPlaceholder="Chọn ngành nghề"
            emptyMessage="Không tìm thấy ngành nghề phù hợp."
            readOnly={isIndustryInactive}
          />

          {/* 2. Vị trí chuyên môn */}
          <SearchableTaxonomySelect
            label="Vị trí chuyên môn"
            value={form.job_position_id}
            options={positionOptions}
            onChange={handlePositionChange}
            disabled={!form.industry_group_id || isPositionInactive}
            loading={taxonomyLoading}
            searchPlaceholder="Tìm vị trí chuyên môn..."
            selectPlaceholder={
              form.industry_group_id
                ? 'Chọn vị trí chuyên môn'
                : 'Vui lòng chọn ngành nghề trước'
            }
            emptyMessage={
              form.industry_group_id
                ? 'Không tìm thấy vị trí chuyên môn phù hợp.'
                : 'Vui lòng chọn ngành nghề trước.'
            }
            readOnly={isPositionInactive}
          />

          {/* 3. Cấp bậc */}
          <div>
            {select('Cấp bậc', 'level', availableLevelOptions)}
            {selectedPosition?.allowed_levels && selectedPosition.allowed_levels.length > 0 && (
              <p className="mt-1 text-xs text-slate-500">
                Vị trí này áp dụng {selectedPosition.allowed_levels.length} cấp bậc phù hợp.
              </p>
            )}
          </div>

          {/* 4. Kinh nghiệm */}
          {select('Kinh nghiệm', 'experience_requirement', experienceOptions)}

          {/* 5. Tiêu đề tin */}
          <label className={`${labelClass} sm:col-span-2`}>
            Tiêu đề công việc *
            <input
              required
              maxLength={255}
              value={form.title}
              onChange={(e) => {
                titleEditedByUser.current = true
                set('title', e.target.value)
              }}
              className={inputClass}
              placeholder="Ví dụ: Senior Frontend Developer"
            />
          </label>

          {/* Tên công ty * */}
          <label className={labelClass}>
            Tên công ty *
            <input
              required
              maxLength={255}
              value={form.company_name}
              onChange={(e) => set('company_name', e.target.value)}
              className={inputClass}
            />
          </label>

          {/* Hình thức làm việc */}
          {select('Hình thức làm việc', 'employment_type', employmentOptions)}

          {/* Cách thức làm việc */}
          {select('Cách thức làm việc', 'work_mode', workOptions)}

          {/* Số lượng cần tuyển * */}
          <label className={labelClass}>
            Số lượng cần tuyển *
            <input
              required
              type="number"
              min="1"
              value={form.vacancies}
              onChange={(e) => set('vacancies', e.target.value)}
              className={inputClass}
            />
          </label>

          {/* Địa điểm */}
          <label className={labelClass}>
            Địa điểm
            <input
              maxLength={255}
              value={form.location}
              onChange={(e) => set('location', e.target.value)}
              className={inputClass}
              placeholder="Quận, thành phố"
            />
          </label>
        </div>
      </section>

      <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-7">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-[#1C1C1C]">
            <CircleDollarSign size={21} />
          </span>
          <div>
            <h2 className="font-bold text-slate-900">Mức lương</h2>
            <p className="text-sm text-slate-500">Đơn vị tiền tệ mặc định: VND.</p>
          </div>
        </div>
        <fieldset className="mt-6">
          <legend className={labelClass}>Loại lương *</legend>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            {(
              [
                ['RANGE', 'Khoảng lương'],
                ['FIXED', 'Lương cố định'],
                ['NEGOTIABLE', 'Thỏa thuận'],
              ] as const
            ).map(([value, label]) => (
              <label
                key={value}
                className={`cursor-pointer rounded-xl border p-3 text-sm font-semibold transition ${
                  form.salary_type === value
                    ? 'border-[#1C1C1C] bg-slate-100 text-[#1C1C1C] ring-1 ring-black/10'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="salary_type"
                  value={value}
                  checked={form.salary_type === value}
                  onChange={() => changeSalaryType(value)}
                  className="mr-2 accent-[#1C1C1C]"
                />
                {label}
              </label>
            ))}
          </div>
        </fieldset>
        {form.salary_type === 'RANGE' && (
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <label className={labelClass}>
              Từ *
              <input
                required
                type="number"
                min="1"
                value={form.salary_min}
                onChange={(e) => set('salary_min', e.target.value)}
                className={inputClass}
                placeholder="15.000.000"
              />
            </label>
            <label className={labelClass}>
              Đến *
              <input
                required
                type="number"
                min="1"
                value={form.salary_max}
                onChange={(e) => set('salary_max', e.target.value)}
                className={inputClass}
                placeholder="25.000.000"
              />
            </label>
          </div>
        )}
        {form.salary_type === 'FIXED' && (
          <label className={`${labelClass} mt-5 block max-w-sm`}>
            Mức lương *
            <input
              required
              type="number"
              min="1"
              value={form.salary_fixed}
              onChange={(e) => set('salary_fixed', e.target.value)}
              className={inputClass}
            />
          </label>
        )}
        {form.salary_type === 'NEGOTIABLE' && (
          <p className="mt-5 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
            Tin tuyển dụng sẽ hiển thị mức lương “Thỏa thuận”.
          </p>
        )}
      </section>

      <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-7">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
            <Sparkles size={20} />
          </span>
          <div>
            <h2 className="font-bold text-slate-900">Nội dung tuyển dụng</h2>
            <p className="text-sm text-slate-500">Viết rõ ràng, cụ thể và dễ quét.</p>
          </div>
        </div>
        <div className="mt-6 space-y-5">
          <label className={`${labelClass} block`}>
            Mô tả công việc *
            <textarea
              required
              rows={6}
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              className={inputClass}
            />
          </label>
          <label className={`${labelClass} block`}>
            Yêu cầu ứng viên *
            <textarea
              required
              rows={5}
              value={form.requirements}
              onChange={(e) => set('requirements', e.target.value)}
              className={inputClass}
            />
          </label>
          <label className={`${labelClass} block`}>
            Quyền lợi
            <textarea
              rows={5}
              value={form.benefits}
              onChange={(e) => set('benefits', e.target.value)}
              className={inputClass}
            />
          </label>
          <label className={`${labelClass} block`}>
            Kỹ năng
            <input
              value={form.skills}
              onChange={(e) => set('skills', e.target.value)}
              className={inputClass}
              placeholder="React, TypeScript, Tailwind CSS"
            />
            <span className="mt-1.5 block text-xs font-normal text-slate-500">
              Phân cách các kỹ năng bằng dấu phẩy.
            </span>
          </label>
        </div>
      </section>

      <div className="sticky bottom-4 flex flex-col-reverse gap-3 rounded-2xl bg-white/95 p-4 shadow-lg shadow-slate-300/40 ring-1 ring-slate-200 backdrop-blur sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          Hủy
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1C1C1C] px-5 py-2.5 text-sm font-semibold text-white hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? (
            <LoaderCircle size={17} className="animate-spin" />
          ) : (
            <Save size={17} />
          )}
          {submitting ? 'Đang lưu...' : submitLabel}
        </button>
      </div>
    </form>
  )
}
