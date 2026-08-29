# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Ứng viên tìm kiếm và đánh giá cơ hội việc làm; nhà tuyển dụng là đối tượng sử dụng của các luồng tuyển dụng về sau.

## Product Purpose

GJob là nền tảng hỗ trợ tìm việc và tuyển dụng có tích hợp AI. Ở Task 04, ứng viên có thể tìm, lọc, phân trang và xem chi tiết các vị trí tuyển dụng từ dữ liệu backend thật.

## Operating Context

Người dùng truy cập danh sách việc làm công khai, điều chỉnh tìm kiếm và bộ lọc qua URL để có thể làm mới, sao chép hoặc chia sẻ kết quả, rồi mở chi tiết từng công việc.

## Capabilities and Constraints

Frontend dùng React, TypeScript, Vite, React Router, Axios, Tailwind CSS v4 và Lucide React. Task 04 chỉ gồm Job Listing, Job Detail, Search, Filter, Pagination và các trạng thái tải/rỗng/lỗi. Dùng Axios instance hiện có và FastAPI API thực; không triển khai ứng tuyển, CV, AI hoặc các luồng quản trị/tuyển dụng.

## Brand Commitments

Giữ nguyên visual system hiện hữu: giao diện chuyên nghiệp, gọn gàng, xanh dương và slate, responsive, nhất quán với các Task 01–03.

## Evidence on Hand

Các route `/jobs` và `/jobs/:id` hiện là placeholder; `src/services/api.ts` là Axios instance dùng chung; mock job chỉ còn trong `src/data/mockData.ts` và không được dùng trong flow `/jobs`.

## Product Principles

- Ưu tiên kết quả việc làm chính xác từ backend thay vì dữ liệu mô phỏng.
- Giúp ứng viên quét, lọc và mở thông tin công việc nhanh chóng.
- URL phản ánh trạng thái tìm kiếm để kết quả có thể lặp lại.
- Mở rộng kiến trúc hiện có với thay đổi tối thiểu.
