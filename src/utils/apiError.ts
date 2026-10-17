import axios from 'axios'
import { CVDateValidationError } from './cvDate'

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

export function recruiterApplicationErrorMessage(error: unknown, context: 'list' | 'detail' | 'action'): string {
  const requestStatus = getApiErrorStatus(error)
  if (requestStatus === null) return 'Không thể kết nối tới máy chủ. Vui lòng thử lại.'
  if (requestStatus === 401) return 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.'
  if (requestStatus === 403) return 'Bạn không có quyền truy cập dữ liệu này.'
  if (requestStatus === 404) return context === 'detail' ? 'Không tìm thấy đơn ứng tuyển hoặc bạn không có quyền truy cập.' : 'Không tìm thấy dữ liệu ứng viên.'
  if (requestStatus === 409) return 'Trạng thái đơn ứng tuyển đã thay đổi.'
  if (requestStatus === 422) return 'Yêu cầu không hợp lệ. Vui lòng kiểm tra lại dữ liệu.'
  if (requestStatus >= 500) return 'Máy chủ đang gặp sự cố. Vui lòng thử lại.'
  return context === 'list' ? 'Không thể tải danh sách ứng viên.' : 'Không thể xử lý yêu cầu. Vui lòng thử lại.'
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

export function subscriptionErrorMessage(error: unknown, context: 'list' | 'plan' | 'grant' | 'revoke' | 'self'): string {
  const status = getApiErrorStatus(error)
  if (status === null) return 'Không thể kết nối tới máy chủ. Vui lòng thử lại.'
  if (status === 401) return 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.'
  if (status === 403) return 'Bạn không có quyền thực hiện thao tác này.'
  if (status === 404) return context === 'self' ? 'Không tìm thấy thông tin gói của tài khoản.' : 'Gói dịch vụ hoặc nhà tuyển dụng không còn tồn tại.'
  if (status === 409) {
    if (context === 'revoke') return 'Gói của nhà tuyển dụng đã thay đổi hoặc đã được thu hồi. Hãy tải lại dữ liệu.'
    if (context === 'grant') return 'Không thể cấp gói do dữ liệu hiện tại đã thay đổi. Hãy tải lại và thử lại.'
    return 'Mã gói đã tồn tại hoặc dữ liệu gói đã thay đổi.'
  }
  if (status === 422) return 'Thông tin gói dịch vụ chưa hợp lệ. Vui lòng kiểm tra lại.'
  if (status >= 500) return 'Máy chủ đang gặp sự cố. Vui lòng thử lại.'
  if (context === 'list') return 'Không thể tải dữ liệu quản lý gói dịch vụ.'
  if (context === 'self') return 'Không thể tải thông tin gói hiện tại.'
  return 'Không thể hoàn tất thao tác với gói dịch vụ.'
}

export function paymentErrorMessage(error: unknown, context: 'create' | 'read' | 'cancel'): string {
  const status = getApiErrorStatus(error)
  if (status === null) return 'Không thể kết nối tới máy chủ. Vui lòng thử lại.'
  if (status === 401) return 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.'
  if (status === 403) return 'Bạn không có quyền sử dụng chức năng thanh toán này.'
  if (status === 404) return context === 'create' ? 'Gói dịch vụ không còn tồn tại.' : 'Không tìm thấy đơn thanh toán này.'
  if (status === 409) return context === 'cancel'
    ? 'Đơn không còn ở trạng thái chờ nên không thể hủy.'
    : 'Gói hiện tại hoặc đơn thanh toán đã thay đổi. Vui lòng tải lại và thử lại.'
  if (status === 422) return 'Gói này hiện không thể đăng ký trực tuyến.'
  if (status === 503) return 'Kênh thanh toán chưa được cấu hình. Vui lòng liên hệ quản trị viên.'
  if (status >= 500) return 'Hệ thống thanh toán đang gặp sự cố. Vui lòng thử lại sau.'
  return 'Không thể hoàn tất yêu cầu thanh toán.'
}

function getApiErrorDetail(error: unknown): string {
  if (!axios.isAxiosError(error) || !error.response?.data || typeof error.response.data !== 'object') return ''
  const detail = 'detail' in error.response.data ? error.response.data.detail : ''
  if (typeof detail === 'string') return detail.toLowerCase()
  if (detail && typeof detail === 'object' && 'message' in detail && typeof detail.message === 'string') return detail.message.toLowerCase()
  return ''
}

export function getApiErrorCode(error: unknown): string {
  if (!axios.isAxiosError(error) || !error.response?.data || typeof error.response.data !== 'object') return ''
  const detail = 'detail' in error.response.data ? error.response.data.detail : null
  if (!detail || typeof detail !== 'object' || !('code' in detail)) return ''
  return typeof detail.code === 'string' ? detail.code : ''
}

export function isFeatureNotIncludedError(error: unknown, feature: string): boolean {
  if (getApiErrorStatus(error) !== 403 || getApiErrorCode(error) !== 'FEATURE_NOT_INCLUDED') return false
  if (!axios.isAxiosError(error) || !error.response?.data || typeof error.response.data !== 'object') return false
  const detail = 'detail' in error.response.data ? error.response.data.detail : null
  return Boolean(detail && typeof detail === 'object' && 'feature' in detail && detail.feature === feature)
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

export function savedJobErrorMessage(error: unknown, context: 'list' | 'status' | 'save' | 'unsave'): string {
  const status = getApiErrorStatus(error)
  if (status === null) return 'Không thể kết nối tới máy chủ. Vui lòng thử lại.'
  if (status === 401) return 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.'
  if (status === 403) return 'Chỉ ứng viên mới có thể lưu việc làm.'
  if (status === 404) return 'Tin tuyển dụng không còn tồn tại.'
  if (status === 409) return 'Tin tuyển dụng này hiện không thể lưu.'
  if (status >= 500) return 'Máy chủ đang gặp sự cố. Vui lòng thử lại.'
  if (context === 'list') return 'Không thể tải danh sách việc làm đã lưu.'
  if (context === 'status') return 'Không thể kiểm tra trạng thái lưu.'
  return context === 'save' ? 'Không thể lưu việc làm.' : 'Không thể bỏ lưu việc làm.'
}

export type CVExtractionErrorKind = 'not-found' | 'conflict' | 'invalid' | 'document' | 'rate-limit' | 'provider' | 'network' | 'unknown'

export function cvExtractionError(error: unknown): { kind: CVExtractionErrorKind; message: string } {
  if (error instanceof CVDateValidationError || error instanceof TypeError) {
    return { kind: 'invalid', message: 'Một số trường ngày tháng chưa đúng định dạng. Vui lòng kiểm tra lại.' }
  }
  if (!axios.isAxiosError(error)) {
    return { kind: 'unknown', message: 'Không thể chuẩn bị dữ liệu CV để lưu. Nội dung bạn đang chỉnh sửa vẫn được giữ nguyên.' }
  }
  if (axios.isAxiosError(error) && error.code === 'ECONNABORTED') {
    return { kind: 'network', message: 'Hệ thống vẫn có thể đang xử lý CV. Hãy mở lại CV để kiểm tra trạng thái mới nhất.' }
  }
  const status = getApiErrorStatus(error)
  const detail = getApiErrorDetail(error)
  const code = getApiErrorCode(error)
  const extractionMessage = cvExtractionFailureMessage(code)
  if (extractionMessage) return { kind: 'provider', message: extractionMessage }
  if (status === 504) return { kind: 'provider', message: 'Quá trình phân tích CV mất quá nhiều thời gian. Tệp của bạn vẫn được lưu; hãy kiểm tra trạng thái trước khi thử lại.' }
  if (code === 'AI_RATE_LIMITED' || (status === 503 && detail.includes('rate limited'))) return { kind: 'rate-limit', message: 'Chưa thể xử lý CV lúc này. Bạn có thể thử lại sau.' }
  if (status === 404) return { kind: 'not-found', message: 'CV chưa có thông tin sẵn sàng.' }
  if (status === 409) return { kind: 'conflict', message: 'Thông tin CV đã thay đổi. Hãy tải bản mới nhất trước khi lưu.' }
  if (status === 422) {
    const isDocumentError = detail.includes('document') || detail.includes('extract') || detail.includes('tệp') || detail.includes('file')
    return isDocumentError
      ? { kind: 'document', message: 'Không thể đọc nội dung CV. Vui lòng kiểm tra tệp và thử lại.' }
      : { kind: 'invalid', message: 'Một số thông tin chưa hợp lệ. Hãy kiểm tra các phần được đánh dấu.' }
  }
  if (status === 502 || status === 503) return { kind: 'provider', message: 'Chưa thể xử lý CV lúc này. Bạn có thể thử lại sau.' }
  if (status === null) return { kind: 'network', message: 'Không thể kết nối tới máy chủ. Nội dung đang hiển thị vẫn được giữ nguyên.' }
  return { kind: 'unknown', message: status >= 500 ? 'Máy chủ đang gặp sự cố. Vui lòng thử lại.' : 'Không thể xử lý yêu cầu lúc này.' }
}

export function cvExtractionFailureMessage(code: string | null | undefined): string | undefined {
  if (code === 'AI_CONTEXT_BUDGET_EXCEEDED' || code === 'AI_CONTEXT_LIMIT_EXCEEDED') return 'Nội dung CV vượt quá phạm vi xử lý an toàn hiện tại. Tệp của bạn vẫn được lưu.'
  if (code === 'AI_PROVIDER_TIMEOUT' || code === 'AI_OPERATION_DEADLINE_EXCEEDED') return 'Quá trình phân tích CV mất quá nhiều thời gian. Tệp của bạn vẫn được lưu; hãy kiểm tra trạng thái trước khi thử lại.'
  if (code === 'AI_OUTPUT_BUDGET_EXCEEDED') return 'AI chưa tạo được kết quả CV hoàn chỉnh trong giới hạn xử lý. Không có dữ liệu phân tích dở dang được sử dụng.'
  if (['AI_JSON_INVALID', 'AI_SCHEMA_INVALID', 'AI_CORRECTION_FAILED'].includes(code ?? '')) return 'AI trả về dữ liệu CV chưa hợp lệ. Tệp của bạn vẫn được lưu an toàn.'
  if (code === 'AI_TOKEN_ACCOUNTING_UNAVAILABLE') return 'Dịch vụ phân tích CV chưa sẵn sàng để xử lý an toàn. Vui lòng thử lại sau.'
  return undefined
}
