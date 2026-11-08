# BÁO CÁO KẾT QUẢ: TRUNG TÂM HỖ TRỢ VÀ GIẢI ĐÁP GJOB (GJOB BRAND TEAL & MINIMALIST LAYOUT)

## 1. Tóm tắt cập nhật theo yêu cầu người dùng

### 1.1. Chuẩn hóa màu sắc thương hiệu GJob (`#15999B` & `#49BBBD`)
- Đã thay thế toàn bộ mã màu xanh lá TopCV (`#00b14f`, `#e8f7ee`) bằng **màu thương hiệu mặc định của GJob**:
  - Tiêu đề **"Chuyên mục"**: Chuyển sang màu xanh mòng két đặc trưng của GJob `text-[#15999B]`.
  - Mục chuyên mục đang chọn (Active): Viền trái đậm `border-l-4 border-[#15999B]`, chữ `text-[#15999B] font-semibold`, nền mềm `bg-teal-50/90`.
  - Hiệu ứng hover: `hover:text-[#15999B]`.
  - Thanh tìm kiếm: Focus ring và border chuyển sang `focus:border-[#15999B] focus:ring-[#15999B]`.
  - Thẻ câu hỏi khi mở: Icon mũi tên xoay và chuyển sang `text-[#15999B]`.
  - Nút xem thêm / liên kết điều hướng: `text-[#15999B] hover:text-[#117D7F]` và `bg-[#15999B] hover:bg-[#117D7F]`.
  - Đồng bộ 100% với Logo GJob trên thanh điều hướng, nút Đăng ký, và toàn bộ hệ thống nhận diện GJob.

### 1.2. Bố cục tối giản thanh lịch chuẩn TopCV
- Bỏ hoàn toàn banner màu mè lớn ở trên cùng.
- Thanh tìm kiếm `Tìm kiếm câu hỏi...` tinh gọn ở trên cùng bên phải.
- Tiêu đề chuyên mục trực tiếp, sắc nét.
- 10 chuyên mục dạng văn bản tinh giản ở sidebar trái.
- Các thẻ câu hỏi card trắng độc lập, mở rộng accordion hiển thị giải đáp chi tiết.

### 1.3. Cải tiến nút "Liên hệ GJob" trong Support Popover
- Nút **"Liên hệ GJob"** (`SupportPopover.tsx`) được gắn trực tiếp đường dẫn email:
  `mailto:${supportEmail}?subject=${encodeURIComponent('Hỗ trợ GJob - Yêu cầu trợ giúp')}`
- Khi người dùng nhấn vào nút này, hệ thống sẽ mở ứng dụng email (Gmail/Mail client) của người dùng để gửi thư trực tiếp tới địa chỉ CSKH (`hiepbosv2@gmail.com`), tự động đóng popover mà không chuyển hướng rời khỏi trang hiện tại.

---

## 2. Kết quả kiểm thử tự động

Toàn bộ **41/41 test case vượt qua (100% PASS)**:
- `tests/help-center-page.test.mjs`: **8/8 PASS** (10 chuyên mục, 7 câu hỏi an toàn, tìm kiếm, accordion, responsive, routing).
- `tests/support-center.test.mjs`: **11/11 PASS** (Launcher popover 4 nút, portal z-[70] của modal an toàn, điều hướng liên kết).
- `tests/feedback-ui.test.mjs`: **12/12 PASS** (Phân luồng góp ý vs Zalo, bỏ QR code, nút full-width).
- `tests/candidate-quick-dock.test.mjs`: **10/10 PASS** (Floating dock).

**Chất lượng mã nguồn:**
- `npx tsc -b`: 0 lỗi compilation.
- `npm run lint`: 0 errors, 0 warnings.
- `npm run build`: Production bundle hoàn tất thành công.

---

## 3. Ảnh chụp thực tế Visual QA (Playwright)

Thư mục lưu trữ: `evaluation/results/support-center/screenshots/`
- `help-center-safety-desktop.png`: Giao diện tối giản với màu thương hiệu mặc định GJob Teal (`#15999B`).
- `help-center-mobile.png`: Giao diện mobile với thanh tab danh mục trượt ngang đồng bộ màu GJob.
- `support-popover-launcher.png`: Launcher popover 4 nút góc dưới phải.
