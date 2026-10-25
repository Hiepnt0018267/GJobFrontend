import { ArrowRight, BriefcaseBusiness, Clock3, MapPin, Wallet, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import type { CSSProperties, RefObject } from 'react'
import type { Job } from '../../types/job'
import { experienceRequirementLabel, formatSalary, workModeLabel } from '../../utils/jobDisplay'
import { safeImageUrl } from '../../utils/publicUrl'

type Props = {
  job: Job
  open: boolean
  anchorRef: RefObject<HTMLElement | null>
  returnTo?: string
  onEnter: () => void
  onLeave: () => void
  onClose: () => void
}

type PreviewPlacement = {
  desktop: boolean
  style: CSSProperties
}

const PANEL_WIDTH = 540
const VIEWPORT_MARGIN = 16
const PANEL_GAP = 12

function calculatePlacement(anchor: HTMLElement | null): PreviewPlacement {
  const desktop = window.matchMedia('(hover: hover) and (pointer: fine)').matches
  if (!desktop || !anchor) return { desktop: false, style: {} }

  const rect = anchor.getBoundingClientRect()
  const width = Math.min(PANEL_WIDTH, window.innerWidth - VIEWPORT_MARGIN * 2)
  const availableRight = window.innerWidth - rect.right
  const left = availableRight >= width + PANEL_GAP
    ? rect.right + PANEL_GAP
    : rect.left >= width + PANEL_GAP
      ? rect.left - width - PANEL_GAP
      : Math.max(VIEWPORT_MARGIN, (window.innerWidth - width) / 2)
  const estimatedHeight = Math.min(620, window.innerHeight * 0.76)
  const top = Math.min(
    Math.max(rect.top, VIEWPORT_MARGIN),
    Math.max(VIEWPORT_MARGIN, window.innerHeight - estimatedHeight - VIEWPORT_MARGIN),
  )

  return { desktop: true, style: { left, top, width } }
}

function CompanyLogo({ job }: { job: Job }) {
  const [failed, setFailed] = useState(false)
  const logoUrl = safeImageUrl(job.company_logo_url)
  const initial = job.company_name.trim().charAt(0).toUpperCase() || 'G'

  if (logoUrl && !failed) {
    return <img src={logoUrl} alt={`Logo ${job.company_name}`} className="size-full object-contain p-2" onError={() => setFailed(true)} />
  }
  return <span className="flex size-full items-center justify-center bg-[#49BBBD] text-lg font-bold text-white">{initial}</span>
}

export default function JobQuickPreview({ job, open, anchorRef, returnTo, onEnter, onLeave, onClose }: Props) {
  const [placement, setPlacement] = useState<PreviewPlacement>({ desktop: false, style: {} })

  useEffect(() => {
    if (!open) return
    const update = () => setPlacement(calculatePlacement(anchorRef.current))
    update()
    window.addEventListener('resize', update)
    window.addEventListener('scroll', update, true)
    return () => {
      window.removeEventListener('resize', update)
      window.removeEventListener('scroll', update, true)
    }
  }, [anchorRef, open])

  useEffect(() => {
    if (!open) return
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', closeOnEscape)
    return () => document.removeEventListener('keydown', closeOnEscape)
  }, [onClose, open])

  useEffect(() => {
    if (!open || placement.desktop) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = previousOverflow }
  }, [open, placement.desktop])

  if (!open || typeof document === 'undefined') return null

  const detailState = returnTo ? { returnTo } : undefined
  const preview = (
    <>
      {!placement.desktop && <button type="button" aria-label="Đóng xem nhanh" onClick={onClose} className="fixed inset-0 z-[70] bg-slate-950/35 backdrop-blur-[2px]" />}
      <section
        role="region"
        aria-label={`Xem nhanh ${job.title}`}
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
        style={placement.desktop ? placement.style : undefined}
        className={placement.desktop
          ? 'fixed z-[80] flex max-h-[76vh] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/20 animate-in fade-in zoom-in-95 duration-150'
          : 'fixed inset-x-0 bottom-0 z-[80] flex max-h-[88vh] flex-col overflow-hidden rounded-t-3xl border border-slate-200 bg-white shadow-2xl animate-in slide-in-from-bottom-5 duration-200 sm:inset-x-4 sm:bottom-4 sm:rounded-3xl'}
      >
        {!placement.desktop && <div className="mx-auto mt-2.5 h-1 w-12 rounded-full bg-slate-300" aria-hidden="true" />}

        <header className="flex items-start gap-4 border-b border-slate-100 p-5 sm:p-6">
          <div className="size-16 shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
            <CompanyLogo job={job} />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="line-clamp-2 text-lg font-bold leading-6 text-slate-950">{job.title}</h2>
            <p className="mt-1 truncate text-sm font-semibold text-slate-500">{job.company_name}</p>
            <p className="mt-2 flex items-center gap-1.5 text-sm font-bold text-[#49BBBD]"><Wallet size={15} />{formatSalary(job)}</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Đóng xem nhanh" className="flex size-9 shrink-0 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#49BBBD]">
            <X size={18} />
          </button>
        </header>

        <div className="overflow-y-auto overscroll-contain px-5 py-4 sm:px-6">
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-semibold text-slate-600"><MapPin size={13} />{job.location || 'Linh hoạt'}</span>
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-semibold text-slate-600"><BriefcaseBusiness size={13} />{experienceRequirementLabel(job.experience_requirement)}</span>
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-semibold text-slate-600"><Clock3 size={13} />{workModeLabel(job.work_mode)}</span>
          </div>

          <section className="mt-5 border-l-[3px] border-[#49BBBD] pl-4">
            <h3 className="text-sm font-bold text-slate-900">Mô tả công việc</h3>
            <p className="mt-2 line-clamp-6 whitespace-pre-line text-sm leading-6 text-slate-600">{job.description}</p>
          </section>

          {job.requirements && (
            <section className="mt-5 border-t border-slate-100 pt-5">
              <h3 className="text-sm font-bold text-slate-900">Yêu cầu nổi bật</h3>
              <p className="mt-2 line-clamp-4 whitespace-pre-line text-sm leading-6 text-slate-600">{job.requirements}</p>
            </section>
          )}

          {job.skills && job.skills.length > 0 && (
            <section className="mt-5 border-t border-slate-100 pt-5">
              <h3 className="text-sm font-bold text-slate-900">Kỹ năng</h3>
              <div className="mt-2.5 flex flex-wrap gap-2">
                {job.skills.slice(0, 6).map((skill) => <span key={skill} className="rounded-lg bg-teal-50 px-2.5 py-1 text-xs font-semibold text-[#287f81]">{skill}</span>)}
                {job.skills.length > 6 && <span className="self-center text-xs font-semibold text-slate-400">+{job.skills.length - 6}</span>}
              </div>
            </section>
          )}
        </div>

        <footer className="mt-auto grid grid-cols-2 gap-3 border-t border-slate-100 bg-white p-4 sm:px-6">
          <Link to={`/jobs/${job.id}`} state={detailState} onClick={onClose} className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-200 px-4 text-sm font-bold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#49BBBD]">
            Xem chi tiết
          </Link>
          <Link to={`/jobs/${job.id}#apply`} state={detailState} onClick={onClose} className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl bg-[#49BBBD] px-4 text-sm font-bold text-white shadow-sm shadow-[#49BBBD]/25 transition hover:bg-[#3ca8aa] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#49BBBD] focus-visible:ring-offset-2">
            Ứng tuyển <ArrowRight size={15} />
          </Link>
        </footer>
      </section>
    </>
  )

  return createPortal(preview, document.body)
}
