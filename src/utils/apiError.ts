import axios from 'axios'

export function recruiterErrorMessage(error: unknown): string {
  if (!axios.isAxiosError(error) || !error.response) return 'Không thể kết nối tới máy chủ.'
  switch (error.response.status) {
    case 401: return 'Phiên đăng nhập đã hết hạn.'
    case 403: return 'Bạn không có quyền truy cập trang này.'
    case 404: return 'Không tìm thấy thông tin nhà tuyển dụng.'
    case 422: return 'Thông tin hồ sơ không hợp lệ.'
    default: return error.response.status >= 500 ? 'Đã xảy ra lỗi máy chủ.' : 'Không thể tải thông tin. Vui lòng thử lại.'
  }
}
