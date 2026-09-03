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

export function getApiErrorStatus(error: unknown): number | null {
  return axios.isAxiosError(error) ? (error.response?.status ?? null) : null
}

function getApiErrorDetail(error: unknown): string {
  if (!axios.isAxiosError(error) || !error.response?.data || typeof error.response.data !== 'object') return ''
  const detail = 'detail' in error.response.data ? error.response.data.detail : ''
  return typeof detail === 'string' ? detail.toLowerCase() : ''
}

export function adminJobErrorMessage(error: unknown, context: 'list' | 'detail' | 'action'): string {
  const status = getApiErrorStatus(error)
  if (status === null) return 'Không thể kết nối tới máy chủ. Vui lòng thử lại.'
  if (status === 401) return 'Phiên đăng nhập đã hết hạn.'
  if (status === 403) return 'Bạn không có quyền thực hiện thao tác này.'
  if (context === 'detail' && status === 404) return 'Tin tuyển dụng không còn tồn tại.'
  if (status === 409) return 'Tin tuyển dụng đã thay đổi trạng thái. Vui lòng tải lại dữ liệu.'
  if (status >= 500) return 'Máy chủ đang gặp sự cố. Vui lòng thử lại.'
  return context === 'list' ? 'Không thể tải danh sách tin tuyển dụng.' : 'Không thể tải dữ liệu tin tuyển dụng.'
}

export function adminUserErrorMessage(error: unknown, context: 'list' | 'detail' | 'activate' | 'deactivate'): string {
  const status = getApiErrorStatus(error)
  if (status === null) return 'Không thể kết nối tới máy chủ. Vui lòng thử lại.'
  if (status === 401) return 'Phiên đăng nhập đã hết hạn.'
  if (status === 403) return 'Bạn không có quyền thực hiện thao tác này.'
  if (context === 'detail' && status === 404) return 'Người dùng không còn tồn tại.'
  if (status === 404) return 'Người dùng không còn tồn tại.'
  if (status === 409) {
    const detail = getApiErrorDetail(error)
    if (detail.includes('last active admin')) return 'Không thể vô hiệu hóa quản trị viên hoạt động cuối cùng.'
    if (detail.includes('chính mình')) return 'Bạn không thể vô hiệu hóa tài khoản của chính mình.'
    if (context === 'activate') return 'Tài khoản đã ở trạng thái hoạt động.'
    if (context === 'deactivate') return 'Tài khoản đã bị vô hiệu hóa.'
    return 'Trạng thái tài khoản đã thay đổi. Vui lòng tải lại dữ liệu.'
  }
  if (status >= 500) return 'Máy chủ đang gặp sự cố. Vui lòng thử lại.'
  return context === 'list' ? 'Không thể tải danh sách người dùng.' : 'Không thể tải thông tin người dùng.'
}

export function adminCVTemplateErrorMessage(error: unknown, context: 'list' | 'detail' | 'form' | 'action'): string {
  const status = getApiErrorStatus(error)
  if (status === null) return 'Không thể kết nối tới máy chủ. Vui lòng thử lại.'
  if (status === 401) return 'Phiên đăng nhập đã hết hạn.'
  if (status === 403) return 'Bạn không có quyền thực hiện thao tác này.'
  if (status === 404) return context === 'detail' ? 'Mẫu CV không còn tồn tại.' : 'Không tìm thấy mẫu CV.'
  if (status === 409) {
    const detail = getApiErrorDetail(error)
    if (detail.includes('layout') || detail.includes('bố cục')) return 'Mẫu CV đang được sử dụng nên không thể thay đổi bố cục.'
    if (detail.includes('inactive') || detail.includes('không hoạt động')) return 'Chỉ có thể đánh dấu nổi bật cho mẫu CV đang hoạt động.'
    return 'Trạng thái mẫu CV đã thay đổi. Vui lòng tải lại dữ liệu.'
  }
  if (status === 422) return 'Thông tin mẫu CV không hợp lệ. Vui lòng kiểm tra lại các trường.'
  if (status >= 500) return 'Máy chủ đang gặp sự cố. Vui lòng thử lại.'
  return context === 'list' ? 'Không thể tải danh sách mẫu CV.' : 'Không thể xử lý yêu cầu mẫu CV.'
}

export function adminAuditErrorMessage(error: unknown, context: 'list' | 'detail', resource: 'application' | 'cv'): string {
  const status = getApiErrorStatus(error)
  const label = resource === 'application' ? 'đơn ứng tuyển' : 'CV ứng viên'
  if (status === null) return 'Không thể kết nối tới máy chủ. Vui lòng thử lại.'
  if (status === 401) return 'Phiên đăng nhập đã hết hạn.'
  if (status === 403) return 'Bạn không có quyền truy cập dữ liệu này.'
  if (status === 404) return context === 'detail' ? `${label.charAt(0).toUpperCase()}${label.slice(1)} không còn tồn tại.` : `Không tìm thấy ${label}.`
  if (status >= 500) return 'Máy chủ đang gặp sự cố. Vui lòng thử lại.'
  return context === 'list' ? `Không thể tải danh sách ${label}.` : `Không thể tải thông tin ${label}.`
}

export function candidateApplicationErrorMessage(error: unknown, context: 'list' | 'detail' | 'withdraw'): string {
  const requestStatus = getApiErrorStatus(error)
  if (requestStatus === null) return 'Không thể kết nối tới máy chủ. Vui lòng thử lại.'
  if (requestStatus === 401) return 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.'
  if (requestStatus === 403) return 'Bạn không có quyền truy cập dữ liệu này.'
  if (requestStatus === 404) return context === 'detail' ? 'Đơn ứng tuyển không còn tồn tại.' : 'Không tìm thấy đơn ứng tuyển.'
  if (requestStatus === 409) return context === 'withdraw' ? 'Đơn ứng tuyển đã thay đổi trạng thái và không thể rút. Vui lòng tải lại dữ liệu mới nhất.' : 'Dữ liệu đơn ứng tuyển đã thay đổi. Vui lòng thử lại.'
  if (requestStatus === 422) return 'Yêu cầu không hợp lệ. Vui lòng kiểm tra lại dữ liệu.'
  if (requestStatus >= 500) return 'Máy chủ đang gặp sự cố. Vui lòng thử lại.'
  return context === 'list' ? 'Không thể tải danh sách đơn ứng tuyển.' : 'Không thể xử lý yêu cầu. Vui lòng thử lại.'
}
