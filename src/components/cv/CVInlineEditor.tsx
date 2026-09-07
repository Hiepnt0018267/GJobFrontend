import { Camera, ChevronLeft, Plus, Save, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import type { CVCertificateItem, CV, CVCreateRequest, CVEducationItem, CVExperienceItem, CVLanguageItem, CVLanguageProficiency, CVProjectItem, CVTemplateSummary } from '../../types/cv';
import { cvService } from '../../services/cvService';
import { usePrivateMediaUrl } from '../../hooks/usePrivateMediaUrl';
import CVTemplateRenderer from './CVTemplateRenderer';
import { resolveCVTheme } from './cvTheme';
import { sortCVTemplates } from '../../utils/cvTemplateSort';
type Props = {
    initial: CVCreateRequest;
    currentTemplate: CVTemplateSummary;
    templates: CVTemplateSummary[];
    profileAvatarUrl?: string | null;
    submitLabel: string;
    submitting: boolean;
    onSave: (data: CVCreateRequest, pendingPhoto?: File) => Promise<void>;
    onCancel: () => void;
    cvId?: string;
    hasManagedPhoto?: boolean;
    photoVersion?: string | null;
    onPhotoUpdated?: (cv: CV) => void;
};
const editClass = 'w-full rounded px-1 py-0.5 text-base outline-none transition hover:bg-blue-50 focus:bg-white focus:ring-2 focus:ring-blue-200';
const removeAt = <T,>(items: T[], index: number) => items.filter((_, current) => current !== index);
const isHttpUrl = (value: string) => {
    try {
        const parsed = new URL(value);
        return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    }
    catch {
        return false;
    }
};
const normalizeLanguageProficiency = (value: string | null | undefined): CVLanguageProficiency | null => {
    const normalized = value?.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replaceAll('đ', 'd').trim().toLowerCase();
    const aliases: Record<string, CVLanguageProficiency> = {
        basic: 'BASIC', 'co ban': 'BASIC',
        conversational: 'CONVERSATIONAL', 'giao tiep': 'CONVERSATIONAL',
        professional: 'PROFESSIONAL', 'chuyen nghiep': 'PROFESSIONAL',
        fluent: 'FLUENT', 'thanh thao': 'FLUENT',
        native: 'NATIVE', 'ban ngu': 'NATIVE',
    };
    return normalized ? aliases[normalized] ?? null : null;
};
export default function CVInlineEditor({ initial, currentTemplate, templates, submitLabel, submitting, onSave, onCancel, cvId, hasManagedPhoto = false, photoVersion, onPhotoUpdated }: Props) {
    const [data, setData] = useState(initial);
    const [validationError, setValidationError] = useState<string | null>(null);
    const [sectionErrors, setSectionErrors] = useState<Record<string, string>>({});
    const [showAvatarEditor, setAvatarEditorState] = useState(false);
    const [avatarImageFailed, setAvatarImageFailed] = useState(false);
    const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
    const [pendingPhoto, setPendingPhoto] = useState<File | null>(null);
    const [photoUploading, setPhotoUploading] = useState(false);
    const pickerRef = useRef<HTMLInputElement | null>(null);
    const [skillText, setSkillText] = useState(() => initial.skills.map((skill) => skill.name).join('\n'));
    const selectedTemplate = useMemo(() => templates.find((template) => template.id === data.template_id) ?? currentTemplate, [currentTemplate, data.template_id, templates]);
    const availableTemplates = useMemo(() => {
        const unique = new Map<string, CVTemplateSummary>();
        [currentTemplate, ...templates].forEach((template) => unique.set(template.id, template));
        return sortCVTemplates([...unique.values()]);
    }, [currentTemplate, templates]);
    const patch = (changes: Partial<CVCreateRequest>) => {
        setData((current) => ({ ...current, ...changes }));
        setValidationError(null);
        setSectionErrors({});
    };
    const updatePersonalInfo = (changes: Partial<CVCreateRequest['personal_info']>) => {
        setAvatarImageFailed(false);
        setData((current) => ({ ...current, personal_info: { ...current.personal_info, ...changes } }));
        setValidationError(null);
        setSectionErrors({});
    };
    const updateItem = <T,>(key: keyof Pick<CVCreateRequest, 'educations' | 'experiences' | 'projects' | 'certificates' | 'languages'>, index: number, changes: Partial<T>) => {
        setData((current) => ({ ...current, [key]: (current[key] as T[]).map((item, itemIndex) => itemIndex === index ? { ...item, ...changes } : item) } as CVCreateRequest));
        setValidationError(null);
        setSectionErrors({});
    };
    const { url: managedPhotoUrl } = usePrivateMediaUrl(cvId && hasManagedPhoto ? `/api/v1/candidate/cvs/${cvId}/photo` : null, photoVersion);
    const legacyAvatarUrl = data.personal_info.avatar_url?.trim() || '';
    const avatarUrl = photoPreviewUrl || managedPhotoUrl || legacyAvatarUrl;
    const hasAvatar = Boolean(avatarUrl && (isHttpUrl(avatarUrl) || avatarUrl.startsWith('blob:')) && !avatarImageFailed);
    const theme = useMemo(() => resolveCVTheme(selectedTemplate.layout_key, selectedTemplate.theme_config), [selectedTemplate]);
    const isClassic = selectedTemplate.layout_key === 'CLASSIC';
    const isMinimal = selectedTemplate.layout_key === 'MINIMAL';
    const choosePhoto = () => {
        pickerRef.current?.click();
    };
    const uploadPhoto = useCallback(async (file: File) => {
        if (photoUploading)
            return;
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) {
            setValidationError('Ảnh cần là JPG, PNG hoặc WEBP và không vượt quá 5 MB.');
            return;
        }
        if (!cvId) {
            if (photoPreviewUrl)
                URL.revokeObjectURL(photoPreviewUrl);
            setPendingPhoto(file);
            setPhotoPreviewUrl(URL.createObjectURL(file));
            setValidationError(null);
            return;
        }
        const temporaryUrl = URL.createObjectURL(file);
        setPhotoPreviewUrl(temporaryUrl);
        setPhotoUploading(true);
        setValidationError(null);
        try {
            onPhotoUpdated?.(await cvService.uploadCVPhoto(cvId, file));
        }
        catch {
            setPhotoPreviewUrl(null);
            setValidationError('Không thể tải ảnh lên. Ảnh cũ vẫn được giữ nguyên.');
        }
        finally {
            URL.revokeObjectURL(temporaryUrl);
            setPhotoPreviewUrl(null);
            setPhotoUploading(false);
        }
    }, [cvId, onPhotoUpdated, photoPreviewUrl, photoUploading]);
    useEffect(() => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/jpeg,image/png,image/webp';
        input.className = 'sr-only';
        input.addEventListener('change', () => { const file = input.files?.[0]; if (file)
            void uploadPhoto(file); input.value = ''; });
        document.body.appendChild(input);
        pickerRef.current = input;
        return () => { pickerRef.current = null; input.remove(); };
    }, [uploadPhoto]);
    useEffect(() => () => { if (photoPreviewUrl)
        URL.revokeObjectURL(photoPreviewUrl); }, [photoPreviewUrl]);
    const removePhoto = async () => {
        if (photoUploading)
            return;
        if (!cvId) {
            if (photoPreviewUrl)
                URL.revokeObjectURL(photoPreviewUrl);
            setPendingPhoto(null);
            setPhotoPreviewUrl(null);
            setAvatarEditorState(false);
            return;
        }
        setPhotoUploading(true);
        setValidationError(null);
        try {
            onPhotoUpdated?.(await cvService.deleteCVPhoto(cvId));
            setAvatarImageFailed(false);
            setAvatarEditorState(false);
        }
        catch {
            setValidationError('Không thể xoá ảnh lúc này. Ảnh hiện tại vẫn được giữ nguyên.');
        }
        finally {
            setPhotoUploading(false);
        }
    };
    const save = () => {
        const errors: Record<string, string> = {};
        const info = data.personal_info;
        const normalizedLanguages = data.languages.map((item) => ({ ...item, proficiency: normalizeLanguageProficiency(item.proficiency) }));
        if (!data.title.trim())
            errors.TITLE = 'Nhập tên CV để dễ quản lý trong danh sách.';
        if (!info.full_name?.trim() || !info.email?.trim() || !info.phone?.trim() || !info.address?.trim() || !info.github_url?.trim())
            errors['THÔNG TIN LIÊN HỆ'] = 'Điền đầy đủ họ tên, email, số điện thoại, địa chỉ và liên kết GitHub/Portfolio.';
        else if (!/^\S+@\S+\.\S+$/.test(info.email) || !isHttpUrl(info.github_url))
            errors['THÔNG TIN LIÊN HỆ'] = 'Kiểm tra lại định dạng email và liên kết GitHub/Portfolio.';
        if (!data.career_objective?.trim())
            errors['MỤC TIÊU NGHỀ NGHIỆP'] = 'Nhập mục tiêu nghề nghiệp.';
        if (data.educations.some((item) => !item.school_name.trim() || !item.degree?.trim()))
            errors['HỌC VẤN'] = 'Mỗi mục học vấn cần có tên trường và bằng cấp/chuyên ngành.';
        if (data.experiences.some((item) => !item.company_name.trim() || !item.position.trim() || !item.description?.trim()))
            errors['KINH NGHIỆM LÀM VIỆC'] = 'Mỗi mục kinh nghiệm cần có công ty, vị trí và mô tả.';
        if (data.projects.some((item) => !item.name.trim() || !item.description?.trim()))
            errors['DỰ ÁN'] = 'Mỗi dự án cần có tên và mô tả.';
        if (data.certificates.some((item) => !item.name.trim()))
            errors['CHỨNG CHỈ'] = 'Mỗi chứng chỉ cần có tên.';
        if (data.languages.some((item) => !item.name.trim() || !item.proficiency))
            errors['NGOẠI NGỮ'] = 'Mỗi ngoại ngữ cần có tên và trình độ.';
        else if (normalizedLanguages.some((item) => !item.proficiency))
            errors['NGOẠI NGỮ'] = 'Trình độ không hợp lệ. Nhập: Cơ bản, Giao tiếp, Chuyên nghiệp, Thành thạo hoặc Bản ngữ.';
        setSectionErrors(errors);
        if (Object.keys(errors).length > 0) {
            setValidationError('Hãy sửa các phần được đánh dấu đỏ bên dưới trước khi lưu.');
            return;
        }
        setValidationError(null);
        void onSave({ ...data, languages: normalizedLanguages }, pendingPhoto ?? undefined);
    };
    const section = (name: string, children: ReactNode) => <section className={theme.sectionSpacingClass}>
<div style={{ color: theme.primary_color, borderColor: theme.primary_color }} className={`${theme.headingClass} text-xs font-bold tracking-[0.08em]`}>{name}</div>{children}{sectionErrors[name] && <p role="alert" className="mt-2 text-xs font-medium text-red-600">{sectionErrors[name]}</p>}</section>;
    const removeButton = (onDelete: () => void) => <button type="button" onClick={onDelete} aria-label="Xoá mục" className="opacity-0 text-slate-400 transition hover:text-red-600 focus:opacity-100 group-hover:opacity-100">
<Trash2 size={14}/>
</button>;
    return <div className="min-h-screen bg-slate-100">
    <div className="sticky top-0 z-30 border-b border-slate-200 bg-white">
<div className="mx-auto flex max-w-5xl flex-wrap items-center gap-3 px-4 py-3">
<button type="button" onClick={onCancel} className="inline-flex items-center gap-1 text-sm font-semibold text-slate-600 hover:text-blue-700">
<ChevronLeft size={16}/>CV của tôi</button>
<input value={data.title} required maxLength={255} onChange={(event) => patch({ title: event.target.value })} className={`min-w-48 flex-1 rounded border bg-white px-2 py-1 text-sm font-bold outline-none hover:border-slate-200 focus:border-blue-500 ${sectionErrors.TITLE ? 'border-red-400 text-red-950' : 'border-transparent text-slate-900'}`} placeholder="Tên CV" aria-label="Tên CV" aria-invalid={Boolean(sectionErrors.TITLE)}/>
<label className="text-xs font-semibold text-slate-500">Đổi mẫu<select value={data.template_id} onChange={(event) => patch({ template_id: event.target.value })} className="ml-1 rounded border border-slate-200 bg-white px-1.5 py-1 text-slate-700 outline-none focus:border-blue-500">{availableTemplates.map((template) => <option key={template.id} value={template.id}>{template.name}</option>)}</select>
</label>
<button type="button" disabled={submitting} onClick={save} className="ml-auto inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
<Save size={16}/>{submitting ? 'Đang lưu...' : submitLabel}</button>
</div>{validationError && <p role="alert" className="mx-auto max-w-5xl border-t border-red-100 bg-red-50 px-4 py-2 text-sm text-red-700">Không thể lưu CV. {validationError}</p>}{sectionErrors.TITLE && <p className="mx-auto max-w-5xl px-4 pb-2 text-xs font-medium text-red-600">{sectionErrors.TITLE}</p>}</div>
    <main className="mx-auto max-w-4xl p-4 sm:p-8">
<CVTemplateRenderer cv={data} template={selectedTemplate} mode="edit" className="mx-auto min-h-[1120px] max-w-[794px] p-7 shadow-xl sm:p-12">
<header style={isMinimal ? undefined : { borderColor: theme.primary_color }} className={`${isMinimal ? '' : isClassic ? 'border-b' : 'border-b-2'} pb-6 ${isClassic ? 'text-center' : ''}`}>
<div className={`flex gap-5 ${isClassic ? 'flex-col items-center' : 'items-start'}`}>
<div className="relative shrink-0">
<button type="button" onClick={() => setAvatarEditorState((current) => !current)} aria-expanded={showAvatarEditor} aria-label="Quản lý ảnh CV" className="group relative block h-28 w-20 overflow-hidden rounded-md border border-slate-300 bg-slate-50 text-slate-500 outline-none ring-offset-2 focus:ring-2 focus:ring-blue-500">{hasAvatar ? <img src={avatarUrl} alt="Ảnh CV" onError={() => setAvatarImageFailed(true)} className="h-full w-full object-cover"/> : <span className="flex h-full flex-col items-center justify-center gap-1 text-[10px] font-bold tracking-wide">
<Camera size={18}/>
<span>ẢNH 3×4</span>
</span>}<span className="absolute inset-x-0 bottom-0 bg-slate-950/75 py-1 text-[10px] font-semibold text-white opacity-0 transition group-hover:opacity-100 group-focus:opacity-100">Đổi ảnh</span>
</button>{showAvatarEditor && <div className="absolute left-0 top-[calc(100%+0.5rem)] z-20 w-56 rounded-xl bg-white p-3 shadow-lg ring-1 ring-slate-200">
<p className="text-xs font-medium text-slate-700">Ảnh CV riêng tư</p>
<p className="mt-1 text-[11px] leading-4 text-slate-500">JPG, PNG hoặc WEBP · tối đa 5 MB.</p>
<div className="mt-3 flex flex-wrap gap-2">
<button type="button" disabled={photoUploading} onClick={choosePhoto} className="rounded-md bg-blue-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-60">{photoUploading ? 'Đang tải...' : hasAvatar ? 'Thay ảnh' : 'Tải ảnh'}</button>
{hasAvatar && <button type="button" disabled={photoUploading} onClick={() => void removePhoto()} className="rounded-md px-2.5 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-60">Xoá ảnh</button>}
</div>
</div>}</div>
<div className="min-w-0 flex-1">
<input value={data.personal_info.full_name ?? ''} maxLength={255} onChange={(event) => updatePersonalInfo({ full_name: event.target.value })} className={`${editClass} text-3xl font-bold tracking-tight text-slate-950`} placeholder="Họ và tên"/>
<div className="mt-3 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
<input value={data.personal_info.email ?? ''} onChange={(event) => updatePersonalInfo({ email: event.target.value })} className={editClass} placeholder="Email"/>
<input value={data.personal_info.phone ?? ''} maxLength={20} onChange={(event) => updatePersonalInfo({ phone: event.target.value })} className={editClass} placeholder="Số điện thoại"/>
<input value={data.personal_info.address ?? ''} maxLength={500} onChange={(event) => updatePersonalInfo({ address: event.target.value })} className={editClass} placeholder="Địa chỉ"/>
<input type="url" value={data.personal_info.github_url ?? ''} onChange={(event) => updatePersonalInfo({ github_url: event.target.value })} className={editClass} placeholder="GitHub / Portfolio"/>
</div>{sectionErrors['THÔNG TIN LIÊN HỆ'] && <p role="alert" className="mt-2 text-xs font-medium text-red-600">{sectionErrors['THÔNG TIN LIÊN HỆ']}</p>}</div>
</div>
</header>
      {section('THÔNG TIN LIÊN HỆ', <p className="mt-2 text-xs text-slate-500">Hoàn thiện các trường ở phần đầu CV.</p>)}
      {section('MỤC TIÊU NGHỀ NGHIỆP', <textarea value={data.career_objective ?? ''} maxLength={5000} onChange={(event) => patch({ career_objective: event.target.value })} className={`${editClass} mt-3 min-h-20 resize-y text-sm leading-6`} placeholder="Nhấn để thêm mục tiêu nghề nghiệp"/>)}
      {section('HỌC VẤN', <>
<div className="mt-3 space-y-3">{data.educations.map((item, index) => <div key={index} className="group relative grid gap-1 rounded p-1 hover:bg-slate-50">
<div className="absolute right-1 top-1">{removeButton(() => patch({ educations: removeAt(data.educations, index) }))}</div>
<input value={item.school_name} maxLength={255} onChange={(event) => updateItem<CVEducationItem>('educations', index, { school_name: event.target.value })} className={`${editClass} font-semibold`} placeholder="Trường học"/>
<input value={[item.degree, item.field_of_study].filter(Boolean).join(' · ')} onChange={(event) => updateItem<CVEducationItem>('educations', index, { degree: event.target.value })} className={`${editClass} text-sm`} placeholder="Bằng cấp · Chuyên ngành"/>
</div>)}</div>
<button type="button" onClick={() => patch({ educations: [...data.educations, { school_name: '', is_current: false }] })} className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-blue-700">
<Plus size={15}/>Thêm học vấn</button>
</>)}
      {section('KINH NGHIỆM LÀM VIỆC', <>
<div className="mt-3 space-y-3">{data.experiences.map((item, index) => <div key={index} className="group relative grid gap-1 rounded p-1 hover:bg-slate-50">
<div className="absolute right-1 top-1">{removeButton(() => patch({ experiences: removeAt(data.experiences, index) }))}</div>
<input value={item.position} maxLength={255} onChange={(event) => updateItem<CVExperienceItem>('experiences', index, { position: event.target.value })} className={`${editClass} font-semibold`} placeholder="Vị trí"/>
<input value={item.company_name} maxLength={255} onChange={(event) => updateItem<CVExperienceItem>('experiences', index, { company_name: event.target.value })} className={`${editClass} text-sm text-blue-700`} placeholder="Công ty"/>
<textarea value={item.description ?? ''} maxLength={10000} onChange={(event) => updateItem<CVExperienceItem>('experiences', index, { description: event.target.value })} className={`${editClass} min-h-12 resize-y text-sm`} placeholder="Mô tả công việc"/>
</div>)}</div>
<button type="button" onClick={() => patch({ experiences: [...data.experiences, { company_name: '', position: '', is_current: false }] })} className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-blue-700">
<Plus size={15}/>Thêm kinh nghiệm</button>
</>)}
      {section('KỸ NĂNG', <>
<textarea value={skillText} onChange={(event) => { const value = event.target.value; setSkillText(value); patch({ skills: value.split('\n').map((name) => name.trim()).filter(Boolean).map((name) => ({ name, level: null })) }); }} className={`${editClass} mt-3 min-h-28 resize-y leading-6`} placeholder={'Nhập mỗi kỹ năng trên một dòng\nVí dụ: React\nTypeScript\nFigma'} aria-describedby="skills-hint"/>
<p id="skills-hint" className="mt-2 text-xs text-slate-500">Nhấn Enter để xuống dòng. Mỗi dòng được lưu là một kỹ năng.</p>
</>)}
      {section('DỰ ÁN', <InlineItems items={data.projects} label="Thêm dự án" onAdd={() => patch({ projects: [...data.projects, { name: '', technologies: [] }] })} onDelete={(index) => patch({ projects: removeAt(data.projects, index) })} render={(item, index) => <>
<input value={item.name} maxLength={255} onChange={(event) => updateItem<CVProjectItem>('projects', index, { name: event.target.value })} className={`${editClass} font-semibold`} placeholder="Tên dự án"/>
<textarea value={item.description ?? ''} maxLength={10000} onChange={(event) => updateItem<CVProjectItem>('projects', index, { description: event.target.value })} className={`${editClass} min-h-12 resize-y text-sm`} placeholder="Mô tả dự án"/>
</>}/>)}
      {section('CHỨNG CHỈ', <InlineItems items={data.certificates} label="Thêm chứng chỉ" onAdd={() => patch({ certificates: [...data.certificates, { name: '' }] })} onDelete={(index) => patch({ certificates: removeAt(data.certificates, index) })} render={(item, index) => <input value={item.name} maxLength={255} onChange={(event) => updateItem<CVCertificateItem>('certificates', index, { name: event.target.value })} className={`${editClass} font-semibold`} placeholder="Tên chứng chỉ"/>}/>)}
      {section('NGOẠI NGỮ', <InlineItems items={data.languages} label="Thêm ngoại ngữ" onAdd={() => patch({ languages: [...data.languages, { name: '', proficiency: null }] })} onDelete={(index) => patch({ languages: removeAt(data.languages, index) })} render={(item, index) => <div className="grid gap-2 sm:grid-cols-2">
<input value={item.name} maxLength={100} onChange={(event) => updateItem<CVLanguageItem>('languages', index, { name: event.target.value })} className={`${editClass} font-semibold`} placeholder="Ngôn ngữ"/>
<input value={item.proficiency ?? ''} onChange={(event) => updateItem<CVLanguageItem>('languages', index, { proficiency: event.target.value as CVLanguageItem['proficiency'] })} className={editClass} placeholder="Trình độ, ví dụ: Giao tiếp"/>
</div>}/>)}
    </CVTemplateRenderer>
</main>
  </div>;
}
function InlineItems<T>({ items, label, onAdd, onDelete, render }: {
    items: T[];
    label: string;
    onAdd: () => void;
    onDelete: (index: number) => void;
    render: (item: T, index: number) => ReactNode;
}) {
    return <>
<div className="mt-3 space-y-2">{items.map((item, index) => <div key={index} className="group relative rounded p-1 hover:bg-slate-50">{render(item, index)}<button type="button" onClick={() => onDelete(index)} aria-label="Xoá mục" className="absolute right-1 top-1 opacity-0 text-slate-400 transition hover:text-red-600 focus:opacity-100 group-hover:opacity-100">
<Trash2 size={14}/>
</button>
</div>)}</div>
<button type="button" onClick={onAdd} className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-blue-700">
<Plus size={15}/>{label}</button>
</>;
}
