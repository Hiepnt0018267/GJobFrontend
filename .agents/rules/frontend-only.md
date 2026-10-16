# Quy tắc: Chỉ chỉnh sửa UI/UX Frontend (Không đụng đến Backend)

## 1. Phạm vi cho phép (Allowed Scope)
- Chỉ thực hiện các thay đổi liên quan đến giao diện người dùng (UI), trải nghiệm người dùng (UX), styling (CSS/Tailwind), bố cục (layout), typography, component hiển thị, animation, icon và visual assets thuộc dự án Frontend (`GJobFrontend`).

## 2. Ràng buộc nghiêm ngặt (Strict Backend Constraint)
- **TUYỆT ĐỐI KHÔNG** đụng chạm, sửa đổi, xóa bỏ hoặc tạo mới bất kỳ mã nguồn, logic, database, service hay cấu hình nào của Backend.
- **KHÔNG THAY ĐỔI API CONTRACT**: Giữ nguyên toàn bộ endpoint URL, HTTP methods, headers, query parameters, request body và response handling của các API hiện tại (`src/services/*`).
- **BẢO TOÀN LOGIC NGHIỆP VỤ**: Không làm gián đoạn luồng xác thực (Authentication/JWT), phân quyền (Roles/Guards), routing và quản lý trạng thái hiện hữu.
