import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Briefcase } from 'lucide-react'

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>()

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            to="/jobs"
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 mb-4 transition-colors"
          >
            <ArrowLeft size={14} />
            Quay lại danh sách
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">Chi tiết việc làm #{id}</h1>
          <p className="text-slate-500 text-sm mt-1">Đang phát triển — sẽ ra mắt trong thời gian tới.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="flex items-center justify-center w-16 h-16 bg-blue-50 rounded-2xl mx-auto mb-5">
          <Briefcase size={28} className="text-blue-600" />
        </div>
        <h2 className="text-xl font-semibold text-slate-700 mb-3">Tính năng đang được xây dựng</h2>
        <p className="text-slate-500 mb-6 text-sm max-w-sm mx-auto">
          Trang chi tiết việc làm đầy đủ sẽ được triển khai ở Task tiếp theo.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 border border-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors"
        >
          Quay về Trang chủ
        </Link>
      </div>
    </div>
  )
}
