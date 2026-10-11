import type { RecruiterApplicationListResponse } from '../../types/recruiterApplication'
import RecruiterApplicationList from './RecruiterApplicationList'
import { rankingResultTitle } from '../../utils/recruiterRanking'

export default function RecruiterRankingResults({ data, returnTo }: { data: RecruiterApplicationListResponse; returnTo: string }) {
  // Partition this transport page by backend status only: no scoring/sorting/Top-N slicing.
  const ranked = data.items.filter((item) => item.ranking_status === 'ranked')
  const unranked = data.items.filter((item) => item.ranking_status !== 'ranked')
  return <div className="mt-6 space-y-8">
    <section aria-labelledby="ranked-results-title">
      <h2 id="ranked-results-title" className="text-lg font-bold text-slate-950">{rankingResultTitle(data.ranking_mode ?? 'all', data.requested_top_n ?? undefined)}</h2>
      <p className="mt-1 text-sm leading-6 text-slate-600">{data.returned_ranked_count ?? ranked.length} ứng viên đã xếp hạng trong kết quả{data.ranking_mode === 'top_n' ? ` / ${data.ranked_available_count ?? ranked.length} người có tín hiệu AI` : ''}.</p>
      {ranked.length ? <RecruiterApplicationList applications={ranked} returnTo={returnTo} showRanking /> : <p className="mt-4 rounded-xl bg-white p-5 text-sm leading-6 text-slate-600">{data.returned_ranked_count ? 'Nhóm đã xếp hạng nằm ở trang khác của kết quả.' : 'Chưa có ứng viên có tín hiệu AI để xếp hạng.'}</p>}
    </section>
    <section aria-labelledby="unranked-results-title">
      <h2 id="unranked-results-title" className="text-lg font-bold text-slate-950">Chưa thể xếp hạng ({data.unranked_count ?? unranked.length})</h2>
      <p className="mt-1 text-sm leading-6 text-slate-600">Thiếu tín hiệu AI không có nghĩa là ứng viên không phù hợp. Nhóm này không chiếm vị trí Top N.</p>
      {unranked.length ? <RecruiterApplicationList applications={unranked} returnTo={returnTo} showRanking /> : <p className="mt-4 text-sm leading-6 text-slate-600">{data.unranked_count ? 'Nhóm chưa thể xếp hạng nằm ở trang khác của kết quả. Dùng phân trang bên dưới để xem.' : 'Không có ứng viên chưa thể xếp hạng trong bộ lọc hiện tại.'}</p>}
    </section>
  </div>
}
