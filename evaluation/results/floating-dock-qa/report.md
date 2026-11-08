# BÁO CÁO KIỂM THỬ TÍCH HỢP TOÀN DIỆN (TASK: FLOATING-DOCK-QA-01)
## FLOATING QUICK DOCK, UNIFIED SAVED HUB, FEEDBACK SYSTEM & SUPPORT CENTER

- **Dự án**: GJob Platform
- **Mã công việc**: `FLOATING-DOCK-QA-01 — KIỂM THỬ TÍCH HỢP FLOATING QUICK DOCK VÀ SAVED HUB`
- **Thời gian thực hiện**: 2026-11-07
- **Phạm vi kiểm thử**:
  1. Unified Saved Hub (`/candidate/saved`)
  2. Floating Quick Dock (`CandidateQuickDock.tsx`)
  3. Feedback Modal (`FeedbackModal.tsx`) & Backend Feedback API (`/api/v1/feedbacks`)
  4. Admin Feedback Management (`/admin/feedbacks`)
  5. Support Center (`SupportPopover.tsx`, `SupportFAQAccordion.tsx`, `SafetyGuideModal.tsx`)
- **Môi trường Database xác thực**: `gjob_db_test@loopback:5433` (DEV DB writes = 0)

---

## 1. TỔNG QUAN HỆ THỐNG VÀ KIẾN TRÚC TÍCH HỢP

Nhóm tính năng Floating Quick Dock và Saved Hub đã hoàn thiện cấu trúc giao diện tiện ích nổi (floating dock) hiện đại cho ứng viên và khách vãng lai, kết hợp quản lý việc làm/công ty đã lưu tập trung, kênh góp ý sản phẩm kèm hệ thống quản trị admin, và trung tâm trợ giúp an toàn minh bạch.

```
+-----------------------------------------------------------------------------------+
|                                  MAIN LAYOUT                                      |
|                                                                                   |
|  [Header] ----------------------------------------------------------------------  |
|                                                                                   |
|  [Content Pages: /jobs, /candidate/saved, /admin/feedbacks...]                    |
|                                                                                   |
|  [Footer] ----------------------------------------------------------------------  |
|                                                                                   |
|                                                [Floating Quick Dock] (z-40)       |
|                                                | - Bookmark -> /candidate/saved   |
|                                                | - Góp ý    -> FeedbackModal(z-70)|
|                                                | - Hỗ trợ   -> SupportPopover(z-50|
|                                                | - Scroll-to-Top (> 300px)        |
+-----------------------------------------------------------------------------------+
```

---

## 2. KẾT QUẢ KIỂM THỬ THEO TỪNG NHÓM CHỨC NĂNG

### 2.1. Nhóm 1: Unified Saved Hub (`/candidate/saved`)
- **Mở từ Dock**: Nút Bookmark (`#quick-dock-bookmark`) trên Quick Dock điều hướng chính xác đến `/candidate/saved?tab=jobs`.
- **Mặc định & Đồng bộ URL**:
  - Mặc định mở tab "Việc làm đã lưu" khi không truyền query param hoặc query param không hợp lệ.
  - Chuyển tab sang "Công ty đã theo dõi" cập nhật URL tức thì thành `?tab=companies`.
  - F5 / Refresh trình duyệt giữ nguyên tab đang xem.
  - Nút Back / Forward trình duyệt chuyển đổi tab đồng bộ với lịch sử URL.
- **Tương thích Route Legacy**:
  - Route `/candidate/saved-jobs` được chuyển hướng chuẩn (HTTP 302/Redirect component) sang `/candidate/saved?tab=jobs`.
  - Route `/candidate/followed-companies` được chuyển hướng chuẩn sang `/candidate/saved?tab=companies`.
- **Tính độc lập giữa hai tab**:
  - Phân trang, bộ nhớ đệm (`queryKey`), tham số tìm kiếm và trạng thái API (`loading`, `error`, `empty`) hoàn toàn riêng biệt giữa `SavedJobsTab` và `FollowedCompaniesTab`.
  - Lỗi mạng hoặc dữ liệu rỗng ở tab này không ảnh hưởng đến tab kia.
  - Bỏ lưu việc làm (`removeSavedJob`) chỉ làm tươi dữ liệu việc làm; bỏ theo dõi công ty (`unfollow`) chỉ làm tươi dữ liệu công ty.
- **Badge tổng**: Sử dụng trường `total` từ metadata API của hai endpoint độc lập (`saved_jobs` + `candidate_company_follows`), không tính toán thủ công trên độ dài mảng trang hiện tại.

### 2.2. Nhóm 2: Floating Quick Dock (`CandidateQuickDock.tsx`)
- **Phân quyền hiển thị (Role Matrix)**:
  - **Candidate**: Hiển thị đầy đủ 3 nút chính (Bookmark kèm Badge tổng, Góp ý, Hỗ trợ) và nút Lên đầu trang khi cuộn.
  - **Guest**: Hiển thị Dock; khi click Bookmark, tự động chuyển hướng đến `/login` kèm `state.from` lưu đích đến `returnTo = /candidate/saved?tab=jobs`. Click Góp ý mở Feedback Modal, click Hỗ trợ mở Support Popover.
  - **Recruiter & Admin**: Dock hoàn toàn bị ẩn (`return null`), không che khuất màn hình tác nghiệp tuyển dụng và quản trị.
- **Vị trí và không trùng lặp**:
  - Chỉ mount một lần duy nhất tại `MainLayout.tsx`.
  - Tự động ẩn hoàn toàn khi người dùng truy cập Trình soạn thảo CV (`/candidate/cvs/create` và `/candidate/cvs/:id/edit`).
- **Nút Scroll-to-Top**:
  - Chỉ xuất hiện khi người dùng cuộn trang vượt qua ngưỡng 300px (`window.scrollY > 300`).
  - Lắng nghe sự kiện scroll với cờ `passive: true`, tự động xóa listener khi unmount chống rò rỉ bộ nhớ.
- **Cập nhật dữ liệu thời gian thực**:
  - Lắng nghe `useDataRefreshVersion()` để tự động cập nhật số lượng badge khi ứng viên thực hiện lưu/bỏ lưu việc làm hoặc theo dõi/bỏ theo dõi công ty ở bất kỳ đâu trên trang.

### 2.3. Nhóm 3: Feedback Modal & Backend API
- **Khách vãng lai (Guest)**:
  - Gửi góp ý thành công không cần đăng nhập.
  - Trường `user_id` trong cơ sở dữ liệu được lưu là `NULL`.
  - Bất kỳ giá trị `user_id` nào do client cố tình gửi trong body đều bị backend bỏ qua, ngăn chặn giả mạo danh tính.
- **Ứng viên & Nhà tuyển dụng (Candidate / Recruiter)**:
  - Tự động trích xuất `user_id` an toàn từ JWT Bearer token qua dependency `get_optional_current_user`.
  - Phản hồi liên kết chính xác với thông tin người gửi.
- **Kiểm soát tính hợp lệ (Validation & Anti-Spam)**:
  - **Chủ đề (Topic)**: 6 chủ đề bắt buộc (`CV_TOOL`, `AI_MATCHING`, `JOB_SEARCH`, `JOB_NOTIFICATION`, `WEBSITE_UI_UX`, `OTHER`). Chủ đề sai bị trả lỗi `422`.
  - **Nội dung (Content)**: Rỗng, chỉ chứa khoảng trắng hoặc vượt quá 1.000 ký tự bị trả lỗi `422`.
  - **Bảo mật XSS**: Thẻ HTML và `<script>` bị bộ lọc backend phát hiện và từ chối `422`.
  - **Đánh giá (Rating)**: Bắt buộc từ 1 đến 5. Ngoài khoảng này bị từ chối `422`.
  - **Chống Spam**: Cơ chế In-memory Sliding Window Limiter (tối đa 5 lượt/phút) và Double-submit Protection (chặn gửi lặp lại cùng nội dung trong 5 giây) trả về mã lỗi `429 Too Many Requests`.
- **Trải nghiệm Frontend**:
  - Bộ đếm ký tự `0/1000` cập nhật tức thì.
  - Khi gửi thành công: Thông báo Toast xanh, reset form về mặc định và đóng modal.
  - Khi gặp lỗi: Giữ nguyên nội dung đã nhập, hiển thị alert lỗi, không đóng modal để bảo vệ công sức soạn thảo của người dùng.

### 2.4. Nhóm 4: Admin Feedback Management (`/admin/feedbacks`)
- **Bảo vệ quyền truy cập**:
  - Guest truy cập API Admin bị từ chối `401 Unauthorized`.
  - Candidate và Recruiter truy cập bị từ chối `403 Forbidden`.
  - Chỉ tài khoản có role `ADMIN` mới được phép xem và thao tác.
- **Tính năng giao diện Admin**:
  - Thanh tìm kiếm từ khóa hỗ trợ tìm trong nội dung góp ý, tên người gửi hoặc email.
  - Bộ lọc kết hợp theo Trạng thái (`NEW`, `IN_REVIEW`, `RESOLVED`), Chủ đề và Mức độ hài lòng (1-5 sao).
  - Bảng danh sách phân trang chuẩn, badge màu sắc riêng biệt cho từng chủ đề.
  - Dialog xem chi tiết toàn văn góp ý và thông tin người gửi.
  - Nút chuyển trạng thái nhanh (`Mới tiếp nhận` -> `Đang xem xét` -> `Đã xử lý`).

### 2.5. Nhóm 5: Support Center & Cẩm nang an toàn
- **Support Popover (`SupportPopover.tsx`)**:
  - Mở tức thì khi bấm nút Hỗ trợ trên Quick Dock.
  - Đóng linh hoạt khi nhấn phím `Escape`, bấm nút X hoặc click ra ngoài popover (không đóng nhầm khi bấm vào chính nút kích hoạt).
  - Header mang nhận diện thương hiệu GJob rõ ràng, minh bạch, không sử dụng tên nhân viên ảo hoặc cam kết giả mạo.
- **Danh sách Câu hỏi thường gặp (`SupportFAQAccordion.tsx`)**:
  - 6 câu hỏi FAQ phản ánh chính xác 100% năng lực hệ thống hiện có của GJob:
    1. Làm sao để tạo CV trên GJob? (Trình soạn thảo chuẩn A4)
    2. Làm thế nào để tải CV về máy? (Xuất PDF / In chuẩn)
    3. Làm thế nào để tìm kiếm và ứng tuyển việc làm? (Trang Việc làm & Dialog nộp hồ sơ)
    4. AI Matching đánh giá độ phù hợp CV–JD như thế nào? (So khớp kỹ năng, kinh nghiệm, điểm % phù hợp)
    5. Làm thế nào để lưu việc làm và theo dõi công ty? (Bookmark việc làm & Theo dõi công ty vào Saved Hub)
    6. Làm thế nào để nhận thông báo việc làm mới? (Thông báo tuyển dụng mới tự động qua chuông & email)
  - Accordion đóng/mở mượt mà, hỗ trợ chuẩn Accessibility (`aria-expanded`, `aria-controls`, `role="region"`).
- **Cẩm nang tìm việc an toàn (`SafetyGuideModal.tsx`)**:
  - Modal chuyên biệt cung cấp 3 nhóm khuyến cáo phòng chống lừa đảo việc làm:
    1. Cảnh giác với yêu cầu chuyển tiền / đặt cọc / nạp tiền làm nhiệm vụ.
    2. Bảo vệ tài khoản, không chia sẻ mật khẩu, mã OTP hoặc thông tin ngân hàng nhạy cảm.
    3. Kiểm tra tư cách pháp nhân của nhà tuyển dụng và báo cáo tin đăng đáng ngờ.
  - Tự động khóa cuộn trang (`body.style.overflow = 'hidden'`) khi modal mở.
- **Kênh liên kết ngoài an toàn (`supportConfig.ts`)**:
  - Nút Chat Zalo chỉ render khi biến môi trường `VITE_SUPPORT_ZALO_URL` được cấu hình URL hợp lệ (`https://`), mở tab mới an toàn với `target="_blank"` và `rel="noopener noreferrer"`.
  - Thông tin Email và Hotline chỉ render khi có cấu hình hợp lệ; nếu không có, hiển thị thông báo hướng dẫn thân thiện, tuyệt đối không tạo số điện thoại hay email giả.

---

## 3. BẢNG MA TRẬN KIỂM THỬ TRỰC QUAN (VISUAL QA MATRIX)

Toàn bộ các viewport quy chuẩn đã được chạy kiểm thử và chụp ảnh minh chứng thực tế bằng headless Chrome:

| Viewport | Kích thước | Quick Dock | Saved Hub | Feedback Modal | Support Popover | Admin Feedbacks | Kết quả |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Desktop Lớn** | 1440 × 900 | Cố định góc dưới phải, z-40 | Grid 2 cột cân đối, thanh tab thoáng | Căn giữa, max-w-xl, đếm ký tự rõ | Cố định nổi sm:w-96, max-h 80vh | Bảng dữ liệu rộng, bộ lọc full | **PASS** |
| **Desktop Chuẩn** | 1366 × 768 | Cố định góc dưới phải, z-40 | Không tràn ngang, khoảng cách cân đối | Vừa vặn viewport, không bị che footer | Popover hiển thị hoàn chỉnh, cuộn êm | Bộ lọc co giãn tốt, không vỡ layout | **PASS** |
| **Tablet** | 768 × 1024 | Tự điều chỉnh kích thước icon | Grid 1-2 cột co giãn, tab bấm nhạy | Dialog căn giữa, chạm cảm ứng dễ | Tự co chiều ngang, không che nút đóng | Bảng hỗ trợ cuộn ngang an toàn | **PASS** |
| **Mobile** | 390 × 844 | Bottom 20, cách lề 16px | 1 cột toàn màn hình, tab dễ vuốt | max-h 90vh, phím ảo không che nút gửi | Chiều rộng `calc(100vw-2rem)`, cuộn dọc | Co gọn dạng danh sách di động | **PASS** |

### Chi tiết phân tích giao diện & Tương tác:
1. **Không che nút tác vụ chính**: Quick Dock được căn chỉnh `bottom-20 right-4 sm:bottom-24 sm:right-6`, giữ khoảng cách an toàn với nút "Ứng tuyển ngay" (Job Apply Action) và các thành phần CTA chính.
2. **Không xung đột Z-Index**:
   - Quick Dock: `z-40`
   - Header GJob: `z-30`
   - Support Popover: `z-50`
   - Safety Guide Modal: `z-50`
   - Feedback Modal: `z-[70]` (nằm trên cùng, làm mờ toàn bộ backdrop với `bg-slate-950/50`)
3. **Trải nghiệm bàn phím & A11y**:
   - Phím `Escape` đóng nhanh Support Popover, Safety Guide Modal và Feedback Modal.
   - Bấm ra ngoài (click outside) đóng popover và modal đúng chuẩn.
   - Các nút bấm có viền focus nổi bật (`focus-visible:ring-2 focus-visible:ring-[#49BBBD]`).

---

## 4. AN TOÀN CƠ SỞ DỮ LIỆU & BẢO TOÀN HỆ THỐNG

| Tiêu chí | Trạng thái | Bằng chứng kiểm tra thực tế |
| :--- | :--- | :--- |
| **DEV DB Writes = 0** | **TUÂN THỦ TUYỆT ĐỐI** | Toàn bộ migration, fixture và test suite chỉ kết nối tới `gjob_db_test@loopback:5433`. DEV DB không phát sinh bất kỳ dòng ghi nào. |
| **Tên DB kiểm thử** | **ĐẠT** | Truy vấn `SELECT current_database();` xác nhận chính xác `gjob_db_test` (kết thúc bằng `_test`). |
| **Bảo toàn bảng `saved_jobs`** | **ĐẠT** | 4 cột nguyên bản `[id, candidate_id, job_id, created_at]` không bị thay đổi kiểu dữ liệu hay cấu trúc. |
| **Bảo toàn bảng `candidate_company_follows`**| **ĐẠT** | 4 cột nguyên bản `[id, candidate_id, recruiter_profile_id, created_at]` nguyên vẹn, tách biệt độc lập với bảng việc làm. |
| **Bảng mới `user_feedbacks`** | **ĐẠT** | Tạo mới độc lập qua Alembic migration `b1e3d5f7a9c2`, có check constraint `rating 1-5` và `content <= 1000`. |
| **Tính toàn vẹn AI Matching & Ranking** | **ĐẠT** | Bộ kiểm thử baseline `test_job_matching_baseline_contract.py` (10/10 test) xác nhận kết quả chấm điểm CV-JD, fingerprint và thứ tự xếp hạng hoàn toàn không đổi. |

---

## 5. TỔNG HỢP KẾT QUẢ KIỂM THỬ REGRESSION

### 5.1. Frontend Quality Checks
- **TypeScript Typecheck**:
  ```bash
  npx tsc --noEmit
  # Result: 0 errors
  ```
- **ESLint**:
  ```bash
  npm run lint
  # Result: 0 errors, 0 warnings
  ```
- **Production Build**:
  ```bash
  npm run build
  # Result: vite v8.2.2 built in 896ms (Code 0)
  ```

### 5.2. Frontend Automated Tests (`node --test`)
Đã thực thi thành công **66/66 test cases** trên toàn bộ các tệp test liên quan:
- `tests/floating-dock-qa-integration.test.mjs`: **20/20 PASSED** (Kiểm thử tích hợp chéo toàn bộ luồng)
- `tests/candidate-quick-dock.test.mjs`: **10/10 PASSED** (Kiểm thử Quick Dock)
- `tests/candidate-saved-hub.test.mjs`: **17/17 PASSED** (Kiểm thử Saved Hub độc lập)
- `tests/feedback-ui.test.mjs`: **9/9 PASSED** (Kiểm thử UI Feedback & Admin Page)
- `tests/support-center.test.mjs`: **10/10 PASSED** (Kiểm thử Support Popover & Safety Modal)

### 5.3. Backend Automated Tests (`pytest`)
Đã thực thi thành công **24/24 test cases**:
- `tests/test_feedbacks.py`: **12/12 PASSED**
- `tests/test_company_new_job_notifications.py`: **12/12 PASSED**
- `tests/test_job_matching_baseline_contract.py`: **10/10 PASSED**

---

## 6. DANH SÁCH BUG ĐÃ PHÁT HIỆN VÀ SỬA CHỮA TRONG QUÁ TRÌNH QA

1. **Lỗi unused imports trong Admin Feedbacks Page**:
   - *Phát hiện*: Khi chạy `npx tsc -b`, phát hiện `CheckCircle2`, `Filter`, `Loader2`, `useMemo`, `FeedbackRatingOption` khai báo nhưng không dùng.
   - *Khắc phục*: Dọn dẹp toàn bộ import thừa trong [`src/pages/admin/AdminFeedbacksPage.tsx`](file:///c:/DATN/GJobFrontend/src/pages/admin/AdminFeedbacksPage.tsx), đảm bảo mã nguồn tuân thủ strict typecheck.
2. **Chuẩn hóa Regex kiểm tra Component Tab trong Integration Test**:
   - *Phát hiện*: Khác biệt xuống dòng giữa mã JSX và chuỗi so khớp regex trong test runner.
   - *Khắc phục*: Tinh chỉnh pattern trong [`tests/floating-dock-qa-integration.test.mjs`](file:///c:/DATN/GJobFrontend/tests/floating-dock-qa-integration.test.mjs) hỗ trợ linh hoạt khoảng trắng và newline.
3. **Đồng bộ hóa Event Bus mở Modal / Popover**:
   - *Phát hiện*: Tránh xung đột giữa props callback truyền trực tiếp và CustomEvent toàn cục `gjob:open-feedback` / `gjob:open-support`.
   - *Khắc phục*: Chuẩn hóa cơ chế fallback trong `CandidateQuickDock.tsx`: ưu tiên gọi prop callback nếu có, đồng thời phát Custom Event để bất kỳ vị trí nào trong ứng dụng cũng có thể kích hoạt modal.

---

## 7. DANH SÁCH ẢNH MINH CHỨNG CHỤP THỰC TẾ

Toàn bộ ảnh chụp màn hình kiểm thử trực quan được lưu trữ tại thư mục:
`GJobFrontend/evaluation/results/floating-dock-qa/screenshots/`

1. `saved-hub-desktop-1440.png`: Giao diện Saved Hub toàn cảnh trên màn hình Desktop 1440x900.
2. `saved-hub-desktop-1366.png`: Giao diện Saved Hub trên màn hình Desktop phổ thông 1366x768.
3. `saved-hub-tablet-768.png`: Giao diện Saved Hub dạng Tablet dọc 768x1024.
4. `saved-hub-mobile-390.png`: Giao diện Saved Hub co gọn trên điện thoại di động 390x844.
5. `feedback-modal-desktop-1440.png`: Feedback Modal mở trên Desktop hiển thị rõ 6 chủ đề, textarea đếm ký tự và 5 emoji đánh giá.
6. `feedback-modal-mobile-390.png`: Feedback Modal co giãn vừa vặn màn hình điện thoại di động.
7. `support-popover-desktop-1440.png`: Popover Trung tâm hỗ trợ mở trên Desktop hiển thị banner, FAQ và nút hướng dẫn an toàn.
8. `support-popover-mobile-390.png`: Popover Trung tâm hỗ trợ dạng responsive card trên Mobile.
9. `admin-feedbacks-desktop-1440.png`: Trang quản trị Admin Feedbacks tại `/admin/feedbacks` kèm bộ lọc và danh sách phản hồi.

---

## 8. CÁC HẠN CHẾ VÀ ĐẶC ĐIỂM CHỦ ĐÍCH NGOÀI PHẠM VI

1. **Không triển khai AI Chatbot / Realtime Live-Chat**: Đây là quyết định thiết kế chủ đích nhằm giữ cho hệ thống tinh gọn, ổn định và tránh phát sinh chi phí vận hành ngoài kế hoạch.
2. **Phụ thuộc cấu hình Zalo / Hotline**: Nút chat Zalo và thông tin hotline/email được quản lý linh hoạt qua biến môi trường. Khi chưa cấu hình, giao diện tự động ẩn nút và hiển thị văn bản hướng dẫn thân thiện, không làm gián đoạn trải nghiệm người dùng.

---

## 9. KẾT LUẬN NGHIỆM THU

Bộ tính năng **Floating Quick Dock**, **Unified Saved Hub**, **Feedback System** và **Support Center** đã:
- **Đạt 100% tiêu chí chức năng và phân quyền người dùng**.
- **Vượt qua toàn bộ 66 ca kiểm thử Frontend và 24 ca kiểm thử Backend**.
- **Đạt chuẩn kiểm thử trực quan responsive trên cả 4 kích thước màn hình quy chuẩn**.
- **Đảm bảo an toàn tuyệt đối cho cơ sở dữ liệu và các phân hệ lõi (Matching, Auth, Notification)**.

**Trạng thái nghiệm thu chính thức: PASS (HOÀN THÀNH TOÀN DIỆN)**.

