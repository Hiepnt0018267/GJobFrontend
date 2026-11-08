# COMPANY-PUBLIC-FLOW-QA-01 — Báo cáo QA luồng trang công ty

- Ngày kiểm tra: 04/11/2026
- Phạm vi: `GJobBackend`, `GJobFrontend`
- Kết luận phạm vi trang công ty: **PASS**
- Kết luận toàn bộ frontend test suite: **PASS WITH KNOWN UNRELATED REGRESSIONS**
- Dữ liệu kiểm tra: dữ liệu local/dev tổng hợp; không dùng PII thật; không ghi dữ liệu production.

## 1. Kết quả theo luồng

| Luồng | Kết quả | Bằng chứng chính |
| --- | --- | --- |
| Job Detail → Xem trang công ty | PASS | Contract/link frontend và company summary backend đều PASS. |
| Khách xem Tổng quan | PASS | Visual QA trực tiếp và public company API test PASS. |
| Khách xem Tin tuyển dụng | PASS | Tab hiển thị 3 tin APPROVED; layout desktop/mobile đạt. |
| Khách bấm Theo dõi → đăng nhập | PASS | Điều hướng tới `/login` hoạt động sau khi sửa route auth. Contract `returnTo` PASS; không đăng nhập bằng tài khoản thật trong QA thủ công. |
| Candidate follow | PASS | API và frontend contract xác nhận tạo follow, idempotency, tăng `follower_count`. |
| Candidate unfollow | PASS | API và frontend contract xác nhận xóa follow, giảm `follower_count`, reload đọc đúng trạng thái lưu trong DB. |
| Recruiter/Admin xem trang công khai | PASS | Trang công khai đọc được; role khác Candidate không có thao tác follow; test role/authorization PASS. |
| Dữ liệu thiếu | PASS | Bao phủ logo, website, description, address, công ty không có tin APPROVED, Job legacy thiếu recruiter/profile. |
| Bảo mật | PASS | Không trả recruiter email/phone; chỉ trả APPROVED jobs; candidate identity lấy từ auth context, không từ request body; URL/ảnh qua safe URL helpers; ownership và role checks PASS. |
| Responsive 1366×768 | PASS | Không tràn/chồng khối; header, tab, overview và thông tin chung cân đối. |
| Responsive 1440×900 | PASS | Bố cục hai cột rõ ràng, nút follow và nội dung không lệch. |
| Responsive 390×844 | PASS | Chuyển một cột; nút follow toàn chiều rộng; tab và nội dung đọc được. |

## 2. Lỗi phát hiện và sửa

### Route đăng nhập của khách

Khi khách bấm **Theo dõi**, URL chuyển sang `/login` nhưng React Router cảnh báo route lá không có `element`. Nguyên nhân là `/login` và `/register` được khai báo dưới một wrapper route có `element`, còn hai route con không có phần tử riêng.

Đã sửa `src/App.tsx`:

- khai báo `/login` và `/register` thành hai route có `element` rõ ràng;
- truyền `initialMode="login"` hoặc `initialMode="register"` tương ứng;
- giữ nguyên `RedirectIfAuthenticated` và cơ chế `returnTo` hiện có.

Sau sửa, điều hướng khách → `/login` hiển thị đúng và không phát sinh cảnh báo mới trong lần kiểm tra lại.

## 3. Test đã chạy

### Backend

```text
python -m pytest -q \
  tests/test_company_follow_migration.py \
  tests/test_company_follows.py \
  tests/test_public_companies.py \
  tests/test_jobs.py \
  tests/test_saved_jobs.py \
  tests/test_applications.py \
  tests/test_job_matching_baseline_contract.py \
  tests/test_match_regression_contract.py
```

Kết quả: **96 passed**, 3 deprecation warnings, thời gian 304 giây.

Bao phủ migration follow, public company API, follow API, Job, Save Job, Apply, matching baseline và matching regression.

### Frontend — targeted sau sửa

```text
node --test \
  tests/public-company-page.test.mjs \
  tests/job-detail-company-card.test.mjs \
  tests/auth-post-login-routing.test.mjs \
  tests/job-quick-preview.test.mjs \
  tests/recruiter-public-company-profile.test.mjs \
  tests/recruiter-logo-upload.test.mjs \
  tests/recruiter-profile-onboarding.test.mjs
```

Kết quả: **26 passed, 0 failed**.

Trước sửa, ma trận company/job/auth/profile mở rộng cũng đạt **52/52**.

### Frontend — static/build

- `npm run lint`: **PASS**.
- `npm run build` (`tsc -b` + Vite production build): **PASS**.
- Build còn cảnh báo bundle `HomePage` khoảng 659.91 kB lớn hơn ngưỡng 500 kB; không thuộc luồng trang công ty.

### Frontend — full suite

`npm test`: **FAIL 2 test ngoài phạm vi trang công ty**:

1. `candidate/admin ATS UX is metadata-driven and contains no manual ATS checkbox`
2. `recommended apply reuses local changeTemplate and preview does not apply`

Các test company, job detail, auth returnTo, recruiter profile và route liên quan đều PASS. Log còn có nhiễu `WebSocket server error: Port 24678 is already in use`; không làm thất bại test company.

## 4. Visual QA

- `desktop-1366x768.png`
- `desktop-1440x900.png`
- `mobile-390x844.png`

Đã kiểm tra trực tiếp:

- Overview và tab tuyển dụng;
- logo, website, follower count, địa chỉ/Google Maps;
- trạng thái guest follow;
- bố cục desktop/mobile;
- không có overflow, chồng chữ hoặc thao tác bị che.

## 5. Regression và kiến trúc

- Job list/detail, Apply, Save Job, recruiter profile, recruiter job flows và authentication returnTo được bao phủ bởi backend/frontend tests liên quan.
- `MATCH-BASELINE-01` và match regression đều PASS.
- Không sửa `matching_input_mapper`, embeddings, scoring, ranking hoặc semantic text.
- Nguồn company hiện vẫn là `RecruiterProfile`; `RecruiterProfile.id` là public `company_id`.
- Quan hệ follow nằm ở bảng riêng `candidate_company_follows`.
- Không tạo hoặc mở rộng CRUD Company.

## 6. Giới hạn còn lại

- Không đăng nhập thủ công bằng tài khoản Candidate/Recruiter/Admin thật để tránh PII và không tạo DEV write ngoài yêu cầu; các nhánh role/follow được xác minh bằng automated tests.
- Không thực hiện mutation follow/unfollow trực tiếp trên dữ liệu production.
- Ba deprecation warnings backend nên được xử lý trong task bảo trì dependency riêng.
- Hai frontend CV tests nêu trên cần task regression CV riêng; không phải lỗi phát sinh từ trang công ty hoặc bản sửa route auth.

## 7. File sửa trong QA task

- `C:\DATN\GJobFrontend\src\App.tsx`
- `C:\DATN\GJobFrontend\evaluation\results\public-company-flow\report.md`
- Ba ảnh bằng chứng trong cùng thư mục báo cáo.

Backend source không bị sửa trong QA task này.
