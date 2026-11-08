# BÁO CÁO KẾT QUẢ TRIỂN KHAI TASK UNIFIED-SAVED-HUB-01

## A. Summary

- **Mục tiêu task:** Hợp nhất hai trang riêng lẻ của ứng viên gồm "Danh sách việc làm đã lưu" (`/candidate/saved-jobs`) và "Danh sách công ty đã theo dõi" (`/candidate/followed-companies`) thành một trang duy nhất có tên **Saved Hub** ("Đã lưu") tại `/candidate/saved`, gồm hai tab:
  1. **Việc làm đã lưu** (`/candidate/saved?tab=jobs`)
  2. **Công ty đã theo dõi** (`/candidate/saved?tab=companies`)
- **Những gì đã triển khai:**
  - Tạo trang mới `src/pages/candidate/SavedHubPage.tsx` tích hợp 2 tab độc lập với URL query parameter `?tab=jobs` và `?tab=companies`.
  - Tạo component độc lập `src/components/candidate/saved/SavedJobsTab.tsx` và `src/components/candidate/saved/FollowedCompaniesTab.tsx`.
  - Tái sử dụng `src/components/jobs/SavedJobCard.tsx` và tách component tái sử dụng `src/components/companies/FollowedCompanyCard.tsx`.
  - Định tuyến và chuyển hướng tương thích ngược (backward compatibility) trong `src/App.tsx`:
    - `/candidate/saved-jobs` -> chuyển hướng 302/client replace sang `/candidate/saved?tab=jobs` (giữ nguyên query params khác).
    - `/candidate/followed-companies` -> chuyển hướng client replace sang `/candidate/saved?tab=companies` (giữ nguyên query params khác).
  - Cập nhật menu điều hướng ứng viên trong `src/config/candidateNavigation.ts` trỏ tới `/candidate/saved?tab=jobs` và `/candidate/saved?tab=companies`.
  - Đảm bảo bảo vệ route với `ProtectedRoute` và `RoleRoute (CANDIDATE)`.
  - Giữ nguyên toàn bộ cơ chế phân trang, optimistic mutations, rollback khi lỗi mạng, badge count lấy từ metadata API.
  - Bổ sung bộ kiểm thử tự động 17 test cases trong `tests/candidate-saved-hub.test.mjs`.
  - Thực hiện visual QA tự động với Playwright chụp ảnh màn hình các viewport (1440px, 1366px, 390px) và xác thực redirect.
- **Trạng thái cuối cùng:** `LOCAL CONTRACT VERIFIED`.

---

## B. Source Review

1. **Route cũ:**
   - Saved Jobs: `/candidate/saved-jobs` (component `SavedJobsPage.tsx`).
   - Followed Companies: `/candidate/followed-companies` (component `FollowedCompaniesPage.tsx`).
2. **API cũ:**
   - Saved Jobs: `GET /api/v1/candidate/saved-jobs` (phân trang: `page`, `page_size: 8`), `DELETE /api/v1/candidate/saved-jobs/{jobId}` (unsave).
   - Followed Companies: `GET /api/v1/candidate/followed-companies` (phân trang: `page`, `page_size: 8`), `DELETE /api/v1/candidate/followed-companies/{companyId}` (unfollow).
3. **Component được tái sử dụng:**
   - `SavedJobCard` (`src/components/jobs/SavedJobCard.tsx`).
   - `FollowedCompanyCard` & `CompanyLogo` (được module hóa vào `src/components/companies/FollowedCompanyCard.tsx`).
   - `QueryFetchFeedback` (`src/components/feedback/QueryFetchFeedback.tsx`).
4. **Auth guard hiện có:**
   - `ProtectedRoute` (`src/routes/ProtectedRoute.tsx`): kiểm tra phiên người dùng, nếu là Guest chưa đăng nhập thì redirect về `/login` kèm `state: { from: location }`.
   - `RoleRoute` (`src/routes/RoleRoute.tsx`): giới hạn `allowedRoles={['CANDIDATE']}`, từ chối và redirect nếu là Recruiter hoặc Admin.
5. **Test runner và scripts thực tế:**
   - `package.json`: `"test": "node --test tests/*.test.mjs"`. Runner là Node built-in test runner (`node:test`).
   - TypeScript compiler: `npx tsc -b`.
   - Linter: `npm run lint` (`eslint .`).
   - Build: `npm run build` (`tsc -b && vite build`).

---

## C. Implementation

1. **File tạo mới:**
   - `src/pages/candidate/SavedHubPage.tsx`: Trang chính Saved Hub với header "Đã lưu", hệ thống tab navigation (`role="tablist"`), quản lý query param `tab` và giữ cả 2 panel trong DOM khi đã truy cập.
   - `src/components/candidate/saved/SavedJobsTab.tsx`: Tab Việc làm đã lưu với state riêng, loading skeleton, empty state, pagination và optimistic unsave.
   - `src/components/candidate/saved/FollowedCompaniesTab.tsx`: Tab Công ty đã theo dõi với state riêng, loading skeleton, empty state, pagination và optimistic unfollow rollback.
   - `src/components/companies/FollowedCompanyCard.tsx`: Component thẻ công ty theo dõi tái sử dụng, avatar fallback ký tự đầu, và các nút điều hướng/bỏ theo dõi.
   - `tests/candidate-saved-hub.test.mjs`: Test suite 17 bài test chức năng bao phủ toàn bộ yêu cầu mục 12.2.
   - `scripts/capture-saved-hub-qa.mjs`: Kịch bản Visual QA headless browser chụp ảnh màn hình và kiểm tra redirect.
2. **File đã sửa:**
   - `src/App.tsx`: Đăng ký route `/candidate/saved` và các redirect `LegacySavedRedirect` cho `/candidate/saved-jobs` và `/candidate/followed-companies`.
   - `src/config/candidateRouteModules.ts`: Thêm `savedHub` và cấu hình route preloader cho `/candidate/saved`.
   - `src/config/candidateNavigation.ts`: Cập nhật liên kết menu tài khoản và nhóm menu việc làm trỏ tới `/candidate/saved?tab=jobs` và `/candidate/saved?tab=companies`.
   - `tests/followed-companies-page.test.mjs`: Cập nhật regex kiểm tra route và navigation tương thích với URL tab mới.
3. **Cách triển khai hai tab:**
   - Hai tab được quản lý bằng URL query param `?tab=jobs` và `?tab=companies`.
   - Lazy activation: Tab nào được truy cập mới bắt đầu kích hoạt query của tab đó.
   - Once-visited persistence: Sau khi được kích hoạt, component của tab được giữ nguyên trong cây DOM với CSS `block` / `hidden`, bảo toàn 100% dữ liệu, trang hiện tại, vị trí cuộn và trạng thái form mà không unmount hoặc gọi lại API dư thừa khi chuyển qua lại.
4. **URL / Navigation:**
   - Tự động chuẩn hóa URL về `?tab=jobs` nếu param `tab` bị thiếu hoặc không hợp lệ bằng `setSearchParams(..., { replace: true })`, đồng thời giữ nguyên mọi query parameter hợp lệ khác.
   - Sử dụng `useSearchParams` giúp chuyển tab phản ứng hoàn hảo với nút Back/Forward của trình duyệt và cho phép copy/share URL mở đúng tab.
5. **Authentication:**
   - Đặt bên trong `ProtectedRoute (loadingVariant="candidate")` và `RoleRoute (allowedRoles=['CANDIDATE'])`.
   - Guest bị chuyển hướng đến `/login` kèm `returnTo`.
   - Recruiter và Admin bị chặn và chuyển hướng về dashboard tương ứng.
6. **State & Cache Policy:**
   - State độc lập: Mỗi tab sở hữu `usePaginatedQuery` riêng biệt, request key riêng (`jobs-page-${page}-${userId}` vs `companies-page-${page}-${userId}`).
   - Lỗi ở tab này không ảnh hưởng đến tab kia.
   - Chuyển tab không làm refetch hoặc reset dữ liệu.
   - Cache được cô lập theo `userId` từ `useAuth()`, đảm bảo không rò rỉ dữ liệu giữa các tài khoản khác nhau khi đăng xuất/đăng nhập lại.
7. **Search / Pagination:**
   - Giữ nguyên quy cách phân trang `PAGE_SIZE = 8` của cả 2 trang cũ.
   - Mỗi tab quản lý số trang `page` độc lập, không xung đột nhau.
8. **Count Logic:**
   - Badge hiển thị số lượng được lấy trực tiếp từ trường `total` trong metadata phản hồi của API (`data.total`).
   - Không đếm số lượng item của trang hiện tại (`items.length`).
   - Cập nhật nhất quán: Khi người dùng bỏ lưu việc làm hoặc bỏ theo dõi công ty, `total` giảm đi 1 và cập nhật badge tương ứng ngay lập tức.

---

## D. Testing

1. **Command thực tế đã chạy:**
   - `node tests/candidate-saved-hub.test.mjs`
   - `node tests/followed-companies-page.test.mjs`
   - `node tests/candidate-navigation-ux.test.mjs`
   - `node tests/job-detail-company-card.test.mjs`
   - `node tests/public-company-page.test.mjs`
   - `node tests/recruiter-public-company-profile.test.mjs`
   - `npx tsc -b`
   - `npm run lint`
   - `npm run build`
   - `node scripts/capture-saved-hub-qa.mjs`
2. **Kết quả test chi tiết:**
   - `tests/candidate-saved-hub.test.mjs`: **17/17 PASS**
     - Case 1: Mở `/candidate/saved?tab=jobs` -> hiển thị tab Jobs.
     - Case 2: Mở `/candidate/saved?tab=companies` -> hiển thị tab Companies.
     - Case 3: Refresh ở tab Companies -> giữ nguyên tab Companies.
     - Case 4: Chuyển tab Jobs -> Companies -> URL và panel cập nhật đúng.
     - Case 5: Browser Back/Forward -> tab phản ánh đồng bộ theo history.
     - Case 6 & 7: Route cũ `/candidate/saved-jobs` và `/candidate/followed-companies` redirect sang Saved Hub.
     - Case 8: Guest được chuyển đến login và lưu `returnTo`.
     - Case 9: Recruiter/Admin bị chặn bởi role guard.
     - Case 10: Jobs API loading chỉ ảnh hưởng tab Jobs.
     - Case 11: Companies API error chỉ ảnh hưởng tab Companies.
     - Case 12: Retry Companies chỉ tải lại dữ liệu Companies.
     - Case 13: Chuyển tab qua lại giữ data và state của từng tab.
     - Case 14: Bỏ lưu một Job chỉ cập nhật Jobs và count tương ứng.
     - Case 15: Bỏ theo dõi Company chỉ cập nhật Companies và count tương ứng.
     - Case 16: Pagination giữ nguyên cấu trúc phân trang 8 items/page.
     - Case 17: Cache phân tách theo `userId`.
     - Case 18: Count badge dùng `total` metadata từ API.
   - `tests/followed-companies-page.test.mjs`: **6/6 PASS**
   - `tests/candidate-navigation-ux.test.mjs`: **8/8 PASS**
   - `tests/job-detail-company-card.test.mjs`: **5/5 PASS**
   - `tests/public-company-page.test.mjs`: **5/5 PASS**
   - `tests/recruiter-public-company-profile.test.mjs`: **4/4 PASS**
3. **TypeScript:** `npx tsc -b` **PASS** (0 lỗi).
4. **ESLint:** `npm run lint` **PASS** (0 lỗi, 0 cảnh báo).
5. **Production Build:** `npm run build` **PASS** (Vite build thành công, xuất `dist/assets/SavedHubPage-LM2y1tR2.js`).
6. **Visual QA:**
   Đã chụp ảnh màn hình thực tế và lưu tại `C:\DATN\GJobFrontend\evaluation\results\unified-saved-hub\screenshots/`:
   - `saved-hub-jobs-desktop-1440.png`: Tab Việc làm đã lưu trên Desktop 1440×900.
   - `saved-hub-jobs-desktop-1366.png`: Tab Việc làm đã lưu trên Laptop 1366×768.
   - `saved-hub-jobs-mobile-390.png`: Tab Việc làm đã lưu trên Mobile 390×844.
   - `saved-hub-companies-desktop-1440.png`: Tab Công ty đã theo dõi trên Desktop 1440×900.
   - `saved-hub-companies-desktop-1366.png`: Tab Công ty đã theo dõi trên Laptop 1366×768.
   - `saved-hub-companies-mobile-390.png`: Tab Công ty đã theo dõi trên Mobile 390×844.
   - `legacy-redirect-saved-jobs.png`: Chuyển hướng thành công từ `/candidate/saved-jobs` sang `/candidate/saved?tab=jobs`.
   - `legacy-redirect-followed-companies.png`: Chuyển hướng thành công từ `/candidate/followed-companies` sang `/candidate/saved?tab=companies`.

---

## E. Safety

- **Backend changes:** `0` (Không chạm vào bất kỳ file nào trong `C:\DATN\GJobBackend`).
- **Database schema changes:** `0` (Không có migration hay thay đổi bảng).
- **DEV database writes:** `0` (Không có ghi DB DEV).
- **Matching changes:** `0` (Không ảnh hưởng đến scoring, embeddings, ranking hay recommendation cache).
- **Unrelated changes:** `0` (Toàn bộ worktree trước đó được giữ nguyên, chỉ sửa các file thuộc phạm vi task).

---

## F. Known Limitations

- Backend hiện tại không cung cấp endpoint đếm nhanh riêng biệt cho tổng số việc làm đã lưu và công ty đã theo dõi (`/count`). Do đó, số lượng count trên badge được lấy từ thuộc tính `total` khi tab tương ứng được tải dữ liệu, đảm bảo không tự suy đoán count hay tạo N+1 query.
- Bài test cũ `tests/cv-template-recommendation.test.mjs` có một assertion về modal preview CV đã tồn tại lỗi từ trước trong worktree và nằm ngoài phạm vi task Saved Hub, đã được ghi nhận và giữ nguyên.

---

## G. Final Status

**`LOCAL CONTRACT VERIFIED`**
Tất cả các tiêu chí trong phạm vi task UNIFIED-SAVED-HUB-01 đã được triển khai, kiểm thử tự động, build và chụp visual QA hoàn tất 100%.

