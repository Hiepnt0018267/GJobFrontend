import { Link } from 'react-router-dom'
import { Shield, Heart } from 'lucide-react'
import GJobLogo from '../brand/GJobLogo'

const FOOTER_LINKS = {
  discovery: [
    { label: 'Trang chủ', to: '/' },
    { label: 'Tất cả việc làm', to: '/jobs' },
    { label: 'Việc làm Remote', to: '/jobs?work_mode=REMOTE' },
    { label: 'Thực tập sinh', to: '/jobs?level=INTERN' },
  ],
  candidates: [
    { label: 'Khám phá việc làm', to: '/jobs' },
    { label: 'Tạo CV chuyên nghiệp', to: '/candidate/cvs/templates' },
    { label: 'Đăng nhập ứng viên', to: '/login' },
    { label: 'Đăng ký tài khoản', to: '/register' },
  ],
  employers: [
    { label: 'Đăng tin tuyển dụng', to: '/recruiter/jobs/create' },
    { label: 'Dashboard tuyển dụng', to: '/recruiter' },
    { label: 'Tìm kiếm hồ sơ ứng viên', to: '/login' },
    { label: 'Báo giá dịch vụ', to: '/login' },
  ],
}

export default function Footer() {
  return (
    <footer className="bg-[#1e293b] text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Links Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 mb-14">
          
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link to="/" className="group mb-4 inline-flex rounded-xl bg-white px-3 py-2 shadow-sm" aria-label="GJob">
              <GJobLogo className="h-9 w-auto transition-transform duration-200 group-hover:scale-[1.03]" />
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed mb-6 max-w-sm">
              Nền tảng kết nối nhân tài và việc làm ứng dụng AI hàng đầu Việt Nam. Tối ưu hóa hồ sơ, đối chiếu năng lực và kiến tạo cơ hội sự nghiệp bền vững.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Shield size={14} className="text-teal-400" />
              <span>Bảo mật thông tin & Đối tác xác thực 100%</span>
            </div>
          </div>

          {/* Discovery Links */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              Khám phá
            </h4>
            <ul className="space-y-2.5">
              {FOOTER_LINKS.discovery.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-sm text-slate-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Candidate Links */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              Ứng viên
            </h4>
            <ul className="space-y-2.5">
              {FOOTER_LINKS.candidates.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-sm text-slate-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Employer Links */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              Nhà tuyển dụng
            </h4>
            <ul className="space-y-2.5">
              {FOOTER_LINKS.employers.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-sm text-slate-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>
            &copy; {new Date().getFullYear()} GJob Platform. Bản quyền được bảo lưu.
          </p>
          <div className="flex items-center gap-1 text-slate-400">
            <span>Thiết kế vì cộng đồng nhân tài Việt Nam</span>
            <Heart size={13} className="text-rose-500 fill-rose-500 mx-1" />
          </div>
        </div>

      </div>
    </footer>
  )
}
