import { Building2, ExternalLink, Globe2, Mail, MapPin, Phone, UserRound, UsersRound } from 'lucide-react'
import { useState } from 'react'
import type { AdminJob } from '../../../types/adminJob'
import { externalUrlLabel, safeExternalUrl, safeImageUrl } from '../../../utils/publicUrl'

type AdminJobPublisherInfoProps = {
  job: AdminJob
}

function CompanyLogo({ name, url }: { name: string; url: string | null }) {
  const [imageFailed, setImageFailed] = useState(false)
  const imageUrl = safeImageUrl(url)
  const initial = name.trim().charAt(0).toUpperCase() || 'C'

  return (
    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-blue-50 text-base font-bold text-blue-700 ring-1 ring-blue-100">
      {imageUrl && !imageFailed
        ? <img src={imageUrl} alt={`Logo ${name}`} onError={() => setImageFailed(true)} className="h-full w-full object-cover" />
        : initial}
    </div>
  )
}

function MissingValue({ children = 'Chưa cập nhật' }: { children?: string }) {
  return <span className="font-normal text-slate-400">{children}</span>
}

export default function AdminJobPublisherInfo({ job }: AdminJobPublisherInfoProps) {
  const account = job.recruiter_account
  const company = job.company_profile
  const companyName = company?.company_name || job.company_name
  const website = safeExternalUrl(company?.company_website)

  return (
    <aside className="overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200" aria-labelledby="job-publisher-heading">
      <div className="border-b border-slate-100 px-6 py-5">
        <h2 id="job-publisher-heading" className="text-lg font-bold text-slate-950">Nguồn đăng tin</h2>
        <p className="mt-1 text-sm leading-5 text-slate-500">Đối chiếu doanh nghiệp và tài khoản chịu trách nhiệm cho tin này.</p>
      </div>

      <section className="px-6 py-5" aria-labelledby="job-company-heading">
        <div className="flex min-w-0 items-center gap-3">
          <CompanyLogo name={companyName} url={company?.company_logo_url ?? null} />
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Công ty</p>
            <h3 id="job-company-heading" className="mt-1 break-words font-bold text-slate-950">{companyName}</h3>
          </div>
        </div>

        {company?.company_description && (
          <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-600">{company.company_description}</p>
        )}

        <dl className="mt-5 space-y-3.5 text-sm">
          <div className="flex items-start gap-2.5">
            <Globe2 size={16} className="mt-0.5 shrink-0 text-slate-400" aria-hidden="true" />
            <div className="min-w-0"><dt className="sr-only">Website</dt><dd className="break-all text-slate-700">{website ? <a href={website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-semibold text-blue-700 underline-offset-4 hover:underline">{externalUrlLabel(website)}<ExternalLink size={13} aria-hidden="true" /></a> : <MissingValue />}</dd></div>
          </div>
          <div className="flex items-start gap-2.5">
            <MapPin size={16} className="mt-0.5 shrink-0 text-slate-400" aria-hidden="true" />
            <div className="min-w-0"><dt className="sr-only">Địa chỉ công ty</dt><dd className="break-words text-slate-700">{company?.company_address || <MissingValue />}</dd></div>
          </div>
          <div className="flex items-start gap-2.5">
            <Building2 size={16} className="mt-0.5 shrink-0 text-slate-400" aria-hidden="true" />
            <div className="min-w-0"><dt className="sr-only">Ngành nghề</dt><dd className="break-words text-slate-700">{company?.industry || <MissingValue />}</dd></div>
          </div>
          <div className="flex items-start gap-2.5">
            <UsersRound size={16} className="mt-0.5 shrink-0 text-slate-400" aria-hidden="true" />
            <div className="min-w-0"><dt className="sr-only">Quy mô công ty</dt><dd className="text-slate-700">{company?.company_size ? `${company.company_size.toLocaleString('vi-VN')} nhân sự` : <MissingValue />}</dd></div>
          </div>
        </dl>

        {!company && <p className="mt-4 rounded-xl bg-amber-50 px-3 py-2.5 text-xs leading-5 text-amber-800 ring-1 ring-amber-100">Tài khoản này chưa hoàn thiện hồ sơ công ty. Tên phía trên được lấy từ nội dung tin tuyển dụng.</p>}
      </section>

      <section className="border-t border-slate-100 px-6 py-5" aria-labelledby="job-account-heading">
        <div className="flex items-center justify-between gap-3">
          <h3 id="job-account-heading" className="font-bold text-slate-950">Tài khoản đăng tin</h3>
          {account && <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${account.is_active ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' : 'bg-red-50 text-red-700 ring-1 ring-red-200'}`}>{account.is_active ? 'Đang hoạt động' : 'Đã vô hiệu hóa'}</span>}
        </div>

        {account ? (
          <dl className="mt-4 space-y-3.5 text-sm">
            <div className="flex items-start gap-2.5"><UserRound size={16} className="mt-0.5 shrink-0 text-slate-400" aria-hidden="true" /><div className="min-w-0"><dt className="sr-only">Người phụ trách</dt><dd className="break-words font-semibold text-slate-900">{account.full_name}</dd></div></div>
            <div className="flex items-start gap-2.5"><Mail size={16} className="mt-0.5 shrink-0 text-slate-400" aria-hidden="true" /><div className="min-w-0"><dt className="sr-only">Email đăng nhập</dt><dd className="break-all"><a href={`mailto:${account.email}`} className="text-blue-700 underline-offset-4 hover:underline">{account.email}</a></dd></div></div>
            <div className="flex items-start gap-2.5"><Phone size={16} className="mt-0.5 shrink-0 text-slate-400" aria-hidden="true" /><div className="min-w-0"><dt className="sr-only">Số điện thoại</dt><dd className="text-slate-700">{account.phone || <MissingValue />}</dd></div></div>
          </dl>
        ) : (
          <p className="mt-3 rounded-xl bg-slate-50 px-3 py-2.5 text-sm leading-6 text-slate-600">Không tìm thấy tài khoản sở hữu tin này. Tài khoản có thể đã bị xóa.</p>
        )}
      </section>
    </aside>
  )
}
