import { getApiErrorCode } from './apiError'

export const AUTH_SECURITY_ERROR_MESSAGES: Readonly<Record<string, string>> = {
  EMAIL_NOT_VERIFIED: 'Email chưa được xác minh. Hãy kiểm tra hộp thư hoặc gửi lại email xác minh.',
  VERIFICATION_TOKEN_INVALID: 'Liên kết xác minh không hợp lệ.',
  VERIFICATION_TOKEN_EXPIRED: 'Liên kết xác minh đã hết hạn. Hãy yêu cầu gửi lại email.',
  VERIFICATION_TOKEN_USED: 'Liên kết xác minh này đã được sử dụng. Nếu tài khoản của bạn đã được xác minh, hãy đăng nhập.',
  RESET_TOKEN_INVALID: 'Liên kết đặt lại mật khẩu không hợp lệ.',
  RESET_TOKEN_EXPIRED: 'Liên kết đặt lại mật khẩu đã hết hạn. Hãy tạo yêu cầu mới.',
  RESET_TOKEN_USED: 'Liên kết đặt lại mật khẩu này đã được sử dụng.',
  CURRENT_PASSWORD_INCORRECT: 'Mật khẩu hiện tại không chính xác.',
  PASSWORD_SAME_AS_CURRENT: 'Mật khẩu mới phải khác mật khẩu hiện tại.',
  PASSWORD_POLICY_VIOLATION: 'Mật khẩu phải có ít nhất 8 ký tự và không vượt quá 72 byte UTF-8.',
  AUTH_SESSION_INVALIDATED: 'Phiên đăng nhập đã hết hiệu lực. Vui lòng đăng nhập lại.',
  LOCAL_PASSWORD_ALREADY_SET: 'Tài khoản đã có mật khẩu. Hãy sử dụng chức năng đổi mật khẩu.',
  ACCOUNT_DEACTIVATED: 'Tài khoản đã bị vô hiệu hóa.',
}

export function authSecurityErrorMessage(error: unknown, fallback = 'Không thể hoàn tất yêu cầu. Vui lòng thử lại.'): string {
  const code = getApiErrorCode(error)
  return AUTH_SECURITY_ERROR_MESSAGES[code] ?? fallback
}

export function passwordPolicyError(password: string): string | null {
  if (!password.trim()) return 'Mật khẩu không được để trống.'
  if (password.length < 8) return 'Mật khẩu phải có ít nhất 8 ký tự.'
  if (new TextEncoder().encode(password).length > 72) return 'Mật khẩu không được vượt quá 72 byte UTF-8.'
  return null
}
