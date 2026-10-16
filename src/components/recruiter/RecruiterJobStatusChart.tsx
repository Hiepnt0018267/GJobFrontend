import InteractiveDonutChart, { type DashboardChartNavigate, type DashboardChartItem } from '../dashboard/InteractiveDonutChart'
import type { RecruiterDashboardSummary } from '../../types/recruiter'

export default function RecruiterJobStatusChart({ summary, onNavigate }: {
  summary: RecruiterDashboardSummary
  onNavigate?: DashboardChartNavigate
}) {
  const items: DashboardChartItem[] = [
    { label: 'Đã duyệt', value: summary.approved_jobs, color: '#1C1C1C', to: '/recruiter/jobs?status=APPROVED' },
    { label: 'Chờ duyệt', value: summary.pending_jobs, color: '#B1E3FF', to: '/recruiter/jobs?status=PENDING' },
    { label: 'Đã đóng', value: summary.closed_jobs, color: '#95A4FC', to: '/recruiter/jobs?status=CLOSED' },
    { label: 'Bị từ chối', value: summary.rejected_jobs, color: '#C6C7F8', to: '/recruiter/jobs?status=REJECTED' },
  ]

  return (
    <InteractiveDonutChart
      items={items}
      total={summary.total_jobs}
      totalLabel="tin tuyển dụng"
      ariaLabel="Phân bổ trạng thái tin tuyển dụng của nhà tuyển dụng"
      onNavigate={onNavigate}
    />
  )
}
