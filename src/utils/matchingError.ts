import axios from 'axios'
import { getApiErrorStatus } from './apiError'

export type MatchErrorKind = 'auth' | 'forbidden' | 'missing' | 'changed' | 'cv-processing' | 'timeout' | 'network' | 'server' | 'unknown'

export type MatchError = { kind: MatchErrorKind; message: string }

export function matchErrorMessage(error: unknown, audience: 'candidate' | 'recruiter'): MatchError {
  const status = getApiErrorStatus(error)

  if (axios.isAxiosError(error) && error.code === 'ECONNABORTED') {
    return { kind: 'timeout', message: 'Phân tích mất nhiều thời gian hơn dự kiến. Hãy thử lại sau ít phút.' }
  }
  if (status === null) return { kind: 'network', message: 'Không thể kết nối tới máy chủ. Vui lòng kiểm tra kết nối và thử lại.' }
  if (status === 401) return { kind: 'auth', message: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.' }
  if (status === 403) return { kind: 'forbidden', message: 'Bạn không có quyền thực hiện phân tích này.' }
  if (status === 404) {
    return {
      kind: 'missing',
      message: audience === 'candidate'
        ? 'Không tìm thấy CV hoặc công việc phù hợp để phân tích.'
        : 'Không tìm thấy đơn ứng tuyển hoặc bạn không có quyền truy cập.',
    }
  }
  if (status === 409) return { kind: 'changed', message: 'Dữ liệu đã thay đổi trong lúc phân tích. Hãy tải dữ liệu mới nhất rồi thử lại.' }
  if (status === 422) {
    return {
      kind: 'cv-processing',
      message: audience === 'candidate'
        ? 'CV tải lên chưa xử lý xong hoặc chưa có dữ liệu trích xuất hợp lệ. Hãy kiểm tra trạng thái CV rồi thử lại.'
        : 'CV trong đơn ứng tuyển đang được hệ thống xử lý hoặc hiện chưa thể phân tích tự động. Đơn ứng tuyển vẫn có thể được xem bình thường.',
    }
  }
  if (status >= 500) return { kind: 'server', message: 'Máy chủ đang gặp sự cố. Vui lòng thử lại sau.' }
  return { kind: 'unknown', message: 'Không thể phân tích lúc này. Vui lòng thử lại.' }
}
