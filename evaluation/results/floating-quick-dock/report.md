# BÁO CÁO KẾT QUẢ TRIỂN KHAI TASK FLOATING-QUICK-DOCK-01

## 1. Tổng quan mục tiêu
Xây dựng thanh công cụ nổi (**Floating Quick Dock**) `CandidateQuickDock` cho người dùng trên hệ thống GJob, giúp ứng viên và khách truy cập nhanh các chức năng cốt lõi:
1. **Bookmark:** Truy cập nhanh Saved Hub (`/candidate/saved?tab=jobs`), hiển thị badge tổng số lượng việc làm và công ty đã lưu/theo dõi.
2. **Góp ý (Feedback):** Mở modal góp ý thông qua prop callback `onOpenFeedback` hoặc custom event `gjob:open-feedback` (sẵn sàng kết nối task `FEEDBACK-01`).
3. **Hỗ trợ (Support):** Mở trung tâm trợ giúp qua prop callback `onOpenSupport` hoặc custom event `gjob:open-support` (sẵn sàng kết nối task `SUPPORT-CENTER-01`).
4. **Scroll to Top:** Nút cuộn mượt lên đầu trang, tự động hiển thị khi cuộn quá ngưỡng 300px.

---

## 2. Component và Layout đã tích hợp

- **Component:**
  - `src/components/navigation/CandidateQuickDock.tsx`: Chứa các subcomponent `QuickDockButton`, `QuickDockBadge`, `ScrollToTopButton` và component chính `CandidateQuickDock`.
- **Layout:**
  - Tích hợp tại `src/layouts/MainLayout.tsx` (layout chung cho toàn bộ trang ứng viên và trang công khai).
  - Tự động ẩn trên trang biên tập CV (`/candidate/cvs/create` và `/candidate/cvs/:id/edit`) để đảm bảo không gian làm việc tối đa cho ứng viên.
  - Mount duy nhất một lần tại layout cấp cao, không bị render trùng lặp khi người dùng chuyển trang.

---

## 3. Quy tắc Role & Quyền hiển thị

- **Candidate (Ứng viên đã đăng nhập):**
  - Hiển thị đầy đủ thanh công cụ.
  - Nút Bookmark mở trực tiếp `/candidate/saved?tab=jobs`.
  - Hiển thị badge tổng số lượng: `totalCount = savedJobsCount + followedCompaniesCount`.
- **Guest (Khách chưa đăng nhập):**
  - Hiển thị nút Bookmark, Góp ý, Hỗ trợ và Scroll-to-top.
  - Khi nhấn Bookmark: Điều hướng người dùng tới `/login` kèm `state: { from: { pathname: '/candidate/saved', search: '?tab=jobs' } }` để sau khi đăng nhập thành công sẽ tự động quay lại đúng tab Việc làm đã lưu.
  - Không tải và không để lộ dữ liệu cá nhân của Candidate.
- **Recruiter & Admin:**
  - Hoàn toàn **không hiển thị** `CandidateQuickDock` (tránh nhầm lẫn vai trò nghiệp vụ). Component trả về `null` ngay lập tức nếu `user.role !== 'CANDIDATE'`.

---

## 4. Cách lấy và đồng bộ Badge Count

- **Công thức:** `totalCount = savedJobsCount + followedCompaniesCount`.
- **API sử dụng:**
  - `savedJobService.getSavedJobs({ page: 1, page_size: 1 }, signal)` -> lấy `savedJobs.total`.
  - `companyService.getFollowedCompanies({ page: 1, page_size: 1 }, signal)` -> lấy `followedCompanies.total`.
- **Cơ chế cập nhật (Reactive):**
  - Sử dụng hook `useDataRefreshVersion()` kết hợp với Axios response interceptor (`notifyDataRefresh()`).
  - Khi ứng viên thực hiện lưu/bỏ lưu việc làm hoặc theo dõi/bỏ theo dõi công ty ở bất kỳ đâu trên hệ thống, `refreshVersion` tự động thay đổi và trigger fetch lại badge.
  - Không tạo interval polling hoặc request liên tục gây áp lực lên server.
  - Hỗ trợ cleanup qua `AbortController` để tránh rò rỉ bộ nhớ hoặc race conditions.

---

## 5. Hành vi Responsive & Trải nghiệm người dùng (UX)

- **Vị trí hiển thị:**
  - Desktop: `fixed bottom-24 right-6 z-40 flex flex-col items-center gap-2.5`.
  - Mobile: `bottom-20 right-4` (tự động điều chỉnh kích thước nút gọn gàng `h-11 w-11` trên mobile, `h-12 w-12` trên desktop).
- **Không che khuất nội dung:**
  - Vị trí `z-40` nằm trên nội dung thông thường nhưng dưới các modal/dialog (`z-50`).
  - Không che khuất nút ứng tuyển (Apply button) hay Footer.
- **Accessibility:**
  - Đầy đủ `aria-label` cho tất cả các nút bấm.
  - Tooltip hiển thị khi hover hoặc focus bàn phím (`role="tooltip"`).
  - Hỗ trợ đầy đủ phím Tab và các trạng thái `focus-visible:ring-2 focus-visible:ring-[#49BBBD] focus-visible:ring-offset-2`.
- **Scroll to Top:**
  - Theo dõi sự kiện `window.addEventListener('scroll', ...)` với cờ `passive: true`.
  - Chỉ hiện khi `window.scrollY > 300`.
  - Khi click: `window.scrollTo({ top: 0, behavior: 'smooth' })`.
  - Tự động hủy đăng ký listener (`removeEventListener`) khi unmount.

---

## 6. Kết quả Kiểm thử & Xác thực

1. **Unit & Contract Tests:**
   - [tests/candidate-quick-dock.test.mjs](file:///c:/DATN/GJobFrontend/tests/candidate-quick-dock.test.mjs): **10/10 PASS**
     - Case 1: Hiển thị đúng role (Candidate/Guest hiển thị, Recruiter/Admin ẩn).
     - Case 2: Mount một lần duy nhất tại `MainLayout`, ẩn trong CV editor.
     - Case 3: Bookmark mở đúng Saved Hub tab `jobs`.
     - Case 4: Guest click Bookmark được chuyển hướng login kèm `returnTo`.
     - Case 5: Tính tổng badge `totalCount = savedJobsCount + followedCompaniesCount`.
     - Case 6: Badge phản ứng và cập nhật qua `useDataRefreshVersion`.
     - Case 7: Nút Góp ý gọi đúng callback hoặc phát event.
     - Case 8: Nút Hỗ trợ gọi đúng callback hoặc phát event.
     - Case 9 & 10: Scroll-to-top xuất hiện khi scroll > 300px và cleanup listener.
     - Case 11: Định vị responsive, z-index và accessibility.
   - [tests/candidate-saved-hub.test.mjs](file:///c:/DATN/GJobFrontend/tests/candidate-saved-hub.test.mjs): **17/17 PASS**
   - [tests/candidate-navigation-ux.test.mjs](file:///c:/DATN/GJobFrontend/tests/candidate-navigation-ux.test.mjs): **8/8 PASS**
2. **TypeScript:** `npx tsc -b` **PASS** (0 lỗi).
3. **ESLint:** `npm run lint` **PASS** (0 lỗi, 0 cảnh báo).
4. **Production Build:** `npm run build` **PASS** (Bundle thành công trong 964ms).
5. **Visual QA bằng Playwright:**
   - Đã chụp ảnh màn hình các trường hợp thực tế tại `evaluation/results/floating-quick-dock/screenshots/`:
     - `quick-dock-desktop-1440-scrolled.png`
     - `quick-dock-desktop-1366-scrolled.png`
     - `quick-dock-mobile-390-scrolled.png`
     - `quick-dock-recruiter-hidden.png` (Xác thực dock hoàn toàn không xuất hiện đối với tài khoản Recruiter).

---

## 7. Những thành phần sẵn sàng chờ task tiếp theo

- **Feedback Modal (Task `FEEDBACK-01`):**
  - `CandidateQuickDock` nhận prop `onOpenFeedback?: () => void`. Nếu không truyền, mặc định phát sự kiện `window.dispatchEvent(new CustomEvent('gjob:open-feedback'))`. Không nhúng logic hay form góp ý trong dock.
- **Support Popover (Task `SUPPORT-CENTER-01`):**
  - `CandidateQuickDock` nhận prop `onOpenSupport?: () => void`. Nếu không truyền, mặc định phát sự kiện `window.dispatchEvent(new CustomEvent('gjob:open-support'))`. Không nhúng nội dung FAQ trực tiếp trong dock.

---

## 8. Trạng thái hoàn thành

**`LOCAL CONTRACT VERIFIED`**
Floating Quick Dock đã hoàn thiện 100%, hoạt động ổn định và sẵn sàng kết nối liền mạch với các module Feedback và Support tiếp theo.

