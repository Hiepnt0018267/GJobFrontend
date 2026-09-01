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

export function recruiterJobErrorMessage(error: unknown): string {
  if (!axios.isAxiosError(error) || !error.response) return 'Không thể kết nối tới máy chủ.'
  switch (error.response.status) {
    case 401: return 'Phiên đăng nhập đã hết hạn.'
    case 403: return 'Bạn không có quyền thực hiện thao tác này.'
    case 404: return 'Không tìm thấy tin tuyển dụng.'
    case 409: return 'Không thể thực hiện thao tác với trạng thái hiện tại.'
    case 422: return 'Thông tin tin tuyển dụng không hợp lệ. Vui lòng kiểm tra lại các trường.'
    default: return error.response.status >= 500 ? 'Máy chủ đang gặp sự cố.' : 'Không thể xử lý yêu cầu. Vui lòng thử lại.'
  }
}

export function adminDashboardErrorMessage(error: unknown): string {
  if (!axios.isAxiosError(error) || !error.response) return 'Không thể kết nối tới máy chủ.'
  switch (error.response.status) {
    case 401: return 'Phiên đăng nhập đã hết hạn.'
    case 403: return 'Bạn không có quyền truy cập dữ liệu tổng quan.'
    default: return error.response.status >= 500 ? 'Máy chủ đang gặp sự cố.' : 'Không thể tải dữ liệu tổng quan.'
  }
}
