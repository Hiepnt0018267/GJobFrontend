import type { Company } from '../../types/job'
import CompanyCard from './CompanyCard'

interface Props {
  companies: Company[]
}

export default function CompanyMarquee({ companies }: Props) {
  // Triplicate list for infinite seamless loop on any screen width
  const loopList = [...companies, ...companies, ...companies]

  return (
    <div className="relative w-full overflow-hidden py-3 [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
      <div className="animate-marquee flex gap-5 py-2 hover:[animation-play-state:paused]">
        {loopList.map((company, index) => (
          <div key={`${company.id}-${index}`} className="w-[190px] sm:w-[220px] shrink-0">
            <CompanyCard company={company} />
          </div>
        ))}
      </div>
    </div>
  )
}
