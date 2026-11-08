import { Plus, Trash2 } from 'lucide-react'
import type { ChangeEventHandler, ReactNode } from 'react'
import CVRichTextField from './CVRichTextField'

const fieldClass = 'cv-inline-field min-w-0 rounded-md border border-transparent bg-transparent px-1.5 py-1 text-inherit outline-none transition placeholder:text-current/45 hover:border-dashed hover:border-slate-300 hover:bg-white/10 focus:border-[#49BBBD] focus:bg-white/10 focus:ring-2 focus:ring-[#49BBBD]/15'

export function CVInlineInput({ value, onChange, fieldId, label, placeholder, className = '', type = 'text', maxLength }: { value?: string | null; onChange: (value: string) => void; fieldId?: string; label: string; placeholder: string; className?: string; type?: 'text' | 'email' | 'url'; maxLength?: number }) {
  return <CVRichTextField value={value} onChange={onChange} fieldId={fieldId} label={label} placeholder={placeholder} type={type} maxLength={maxLength} className={className} />
}

export function CVInlineTextarea({ value, onChange, fieldId, label, placeholder, rows = 2, className = '' }: { value?: string | null; onChange: (value: string) => void; fieldId?: string; label: string; placeholder: string; rows?: number; className?: string }) {
  return <CVRichTextField value={value} onChange={onChange} fieldId={fieldId} label={label} placeholder={placeholder} rows={rows} multiline className={className} />
}

export function CVInlineSelect({ value, onChange, label, children, className = '' }: { value?: string | null; onChange: ChangeEventHandler<HTMLSelectElement>; label: string; children: ReactNode; className?: string }) {
  return <select value={value ?? ''} onChange={onChange} aria-label={label} className={`${fieldClass} w-full appearance-none ${className}`}>{children}</select>
}

export function CVInlineAddButton({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return <button type="button" onClick={onClick} className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-slate-300 px-3 py-2 text-[11px] font-semibold text-slate-500 transition hover:border-[#49BBBD] hover:bg-teal-50 hover:text-teal-700"><Plus size={14} aria-hidden="true" />{children}</button>
}

export function CVInlineDeleteButton({ onClick, label }: { onClick: () => void; label: string }) {
  return <button type="button" onClick={onClick} aria-label={label} className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-slate-400 transition hover:bg-red-50 hover:text-red-600"><Trash2 size={13} aria-hidden="true" /></button>
}

