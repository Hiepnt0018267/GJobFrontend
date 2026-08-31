import { Link, useNavigate } from 'react-router-dom'
import { ShieldOff, Home, ArrowLeft } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { dashboardFor } from '../../utils/dashboardFor'

export default function ForbiddenPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="text-center max-w-md">
        {/* Icon */}
        <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-red-100">
          <ShieldOff size={36} className="text-red-400" />
        </div>

        {/* Status code */}
        <p className="text-sm font-semibold text-red-500 uppercase tracking-widest mb-2">
          403 — Truy cập bị từ chối
        </p>

        <h1 className="text-2xl font-bold text-slate-900 mb-3">
          Bạn không có quyền truy cập trang này
        </h1>

        <p className="text-sm text-slate-500 leading-relaxed mb-8">
          Trang này yêu cầu quyền truy cập đặc biệt. Nếu bạn cho rằng đây là lỗi, vui lòng liên hệ hỗ trợ.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/"
            className="
              inline-flex items-center justify-center gap-2
              px-5 py-2.5 rounded-xl text-sm font-medium text-white
              bg-blue-600 hover:bg-blue-700 transition-colors duration-200
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
            "
          >
            <Home size={16} />
            Trang chủ
          </Link>

          {user && (
            <button
              type="button"
              onClick={() => navigate(dashboardFor(user.role))}
              className="
                inline-flex items-center justify-center gap-2
                px-5 py-2.5 rounded-xl text-sm font-medium text-slate-700
                border border-slate-200 hover:bg-slate-100 transition-colors duration-200
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
              "
            >
              <ArrowLeft size={16} />
              Về Dashboard của tôi
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
