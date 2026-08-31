import { Link } from 'react-router-dom'
import { Zap } from 'lucide-react'

const FOOTER_LINKS = {
  discovery: [
    { label: 'Trang chủ', to: '/' },
    { label: 'Việc làm', to: '/jobs' },
  ],
  candidates: [
    { label: 'Tìm việc làm', to: '/jobs' },
    { label: 'Đăng nhập', to: '/login' },
    { label: 'Đăng ký', to: '/register' },
  ],
  employers: [
    { label: 'Đăng tin tuyển dụng', to: '/login' },
    { label: 'Quản lý tin tuyển dụng', to: '/login' },
    { label: 'Đăng ký tài khoản', to: '/register' },
  ],
}

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4" aria-label="GJob">
              <div className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-lg">
                <Zap size={18} className="text-white" strokeWidth={2.5} />
              </div>
              <span className="text-xl font-bold text-white">
                G<span className="text-blue-400">Job</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed mb-6">
              Nền tảng tuyển dụng thế hệ mới — kết nối tài năng và cơ hội thông qua sức mạnh của trí tuệ nhân tạo.
            </p>
          </div>

          {/* Discovery */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Khám phá
            </h3>
            <ul className="space-y-2.5">
              {FOOTER_LINKS.discovery.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-sm hover:text-white transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Candidates */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Ứng viên
            </h3>
            <ul className="space-y-2.5">
              {FOOTER_LINKS.candidates.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-sm hover:text-white transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Employers */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Nhà tuyển dụng
            </h3>
            <ul className="space-y-2.5">
              {FOOTER_LINKS.employers.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-sm hover:text-white transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500">
            &copy; {new Date().getFullYear()} GJob. Bảo lưu mọi quyền.
          </p>
          <p className="text-xs text-slate-500">Kết nối cơ hội nghề nghiệp và nhân tài.</p>
        </div>
      </div>
    </footer>
  )
}
