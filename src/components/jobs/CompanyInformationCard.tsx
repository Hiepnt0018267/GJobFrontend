import { Building2, ExternalLink, Globe2, MapPin, UsersRound } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { PublicCompanySummary } from '../../types/job'
import { externalUrlLabel, safeExternalUrl, safeImageUrl } from '../../utils/publicUrl'

type Props = {
  company: PublicCompanySummary | null
  fallbackName: string
}

export default function CompanyInformationCard({ company, fallbackName }: Props) {
  const [failedLogoUrl, setFailedLogoUrl] = useState<string | null>(null)
  const companyName = company?.name?.trim() || fallbackName
  const website = useMemo(() => safeExternalUrl(company?.website), [company?.website])
  const logoUrl = useMemo(() => safeImageUrl(company?.logo_url), [company?.logo_url])

  const hasDetails = Boolean(
    company?.industry || company?.address || company?.size || website || company?.description,
  )

  return (
    <aside className="rounded-2xl bg-white p-6 ring-1 ring-slate-200" aria-labelledby="company-information-title">
      <h2 id="company-information-title" className="text-base font-bold text-slate-900">
        Thông tin công ty
      </h2>

      <div className="mt-5 flex items-center gap-3">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-100 text-slate-400 ring-1 ring-slate-200">
          {logoUrl && failedLogoUrl !== logoUrl ? (
            <img
              src={logoUrl}
              alt={`Logo ${companyName}`}
              className="h-full w-full object-contain"
              onError={() => setFailedLogoUrl(logoUrl)}
            />
          ) : (
            <Building2 size={25} aria-hidden="true" />
          )}
        </div>
        <p className="min-w-0 break-words text-base font-bold leading-6 text-slate-900">{companyName}</p>
      </div>

      {hasDetails ? (
        <>
          <dl className="mt-5 space-y-3 text-sm">
            {company?.industry && (
              <div className="flex items-start gap-2.5">
                <Building2 size={16} className="mt-0.5 shrink-0 text-slate-400" aria-hidden="true" />
                <div><dt className="sr-only">Lĩnh vực</dt><dd className="break-words text-slate-700">{company.industry}</dd></div>
              </div>
            )}
            {company?.address && (
              <div className="flex items-start gap-2.5">
                <MapPin size={16} className="mt-0.5 shrink-0 text-slate-400" aria-hidden="true" />
                <div><dt className="sr-only">Địa chỉ công ty</dt><dd className="break-words text-slate-700">{company.address}</dd></div>
              </div>
            )}
            {company?.size && (
              <div className="flex items-start gap-2.5">
                <UsersRound size={16} className="mt-0.5 shrink-0 text-slate-400" aria-hidden="true" />
                <div><dt className="sr-only">Quy mô công ty</dt><dd className="text-slate-700">{new Intl.NumberFormat('vi-VN').format(company.size)} nhân sự</dd></div>
              </div>
            )}
          </dl>

          {company?.description && (
            <p className="mt-5 line-clamp-4 border-t border-slate-100 pt-4 text-sm leading-6 text-slate-600">
              {company.description}
            </p>
          )}

          {website && (
            <a href={website} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex min-h-10 max-w-full items-center gap-2 rounded-lg px-2 py-2 text-sm font-semibold text-blue-600 transition-colors duration-150 hover:bg-blue-50 hover:text-blue-700">
              <Globe2 size={16} className="shrink-0" aria-hidden="true" />
              <span className="truncate">{externalUrlLabel(website)}</span>
              <ExternalLink size={14} className="shrink-0" aria-hidden="true" />
              <span className="sr-only">(mở trong tab mới)</span>
            </a>
          )}
        </>
      ) : (
        <p className="mt-4 text-sm leading-6 text-slate-500">Nhà tuyển dụng chưa cập nhật thêm thông tin doanh nghiệp.</p>
      )}
    </aside>
  )
}
