# Hướng Dẫn & Quy Tắc Dự Án GJobFrontend

## 📌 QUY TẮC CỐT LÕI: CHỈ SỬA UI/UX FRONTEND, KHÔNG ĐỤNG ĐẾN BACKEND

1. **Phạm vi công việc:**
   - Chỉ chỉnh sửa UI/UX phía Frontend (`c:\DATN\GJobFrontend`): bố cục (Layout), giao diện (UI), màu sắc, typography, component hiển thị, animation và trải nghiệm người dùng (UX).

2. **Ràng buộc Backend tuyệt đối:**
   - **KHÔNG ĐƯỢC** đụng chạm, sửa đổi, thêm, bớt hoặc can thiệp vào bất kỳ tệp tin, mã nguồn, database hay logic nào của Backend.
   - **KHÔNG ĐƯỢC** thay đổi API contract: Giữ nguyên toàn bộ endpoint URL, methods, request payload, query params, headers và kiểu dữ liệu (`types/*`, `services/*`).
   - Mọi luồng dữ liệu, auth session, JWT token và nghiệp vụ kết nối với server phải được đảm bảo hoạt động trơn tru 100%.
