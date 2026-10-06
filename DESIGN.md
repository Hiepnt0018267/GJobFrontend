# GJob Design System (DESIGN.md)

Tài liệu chuẩn hóa ngôn ngữ thiết kế **Modern Premium Corporate** cho toàn bộ hệ thống GJob Frontend. Được sử dụng làm kim chỉ nam xuyên suốt cho Public, Candidate, Recruiter và Admin.

---

## 1. Brand Identity & Design Philosophy

- **Định vị:** Nền tảng tuyển dụng và kết nối sự nghiệp cao cấp có tích hợp AI.
- **Phong cách:** Modern Premium Corporate (Lấy cảm hứng từ Stripe, Airbnb, Wellfound).
- **Cảm xúc mang lại:** Đáng tin cậy (Trustworthy), Minh bạch (Transparent), Tinh tế (Sophisticated), Nhanh & Mượt mà (Fluid & Effortless).
- **Quy tắc vàng:** Form Follows Function — Thẩm mỹ sinh ra từ sự rõ ràng và tối ưu công năng, không lạm dụng hiệu ứng trang trí thừa thãi.

---

## 2. Color Palette (Bảng màu)

Tuân thủ nguyên tắc phân bổ **60 - 30 - 10**:

### 60% — Nền tảng & Bề mặt (Canvas & Surfaces)
- **Base Canvas:** `#f8fafc` (Slate 50) chuyển mượt mà tới `#f1f5f9` (Slate 100).
- **Surface (Card & Modal):** `#ffffff` (Pure White).
- **Dark Panels (Contained Bento):** `#090d16` (Obsidian Midnight) đến `#0f172a` (Slate 900).
- **Hairline Border:** `#e2e8f0` (Slate 200) hoặc `rgba(15, 23, 42, 0.08)`.

### 30% — Cấu trúc & Kiểu chữ (Structure & Typography)
- **Display & Headings:** `#090d16` (Deep Midnight — đen ánh xanh sẫm, không dùng đen `#000000` thuần).
- **Body Text:** `#334155` (Slate 700) — Độ tương phản WCAG AAA.
- **Subtext / Muted:** `#64748b` (Slate 500).

### 10% — Điểm nhấn thương hiệu & Ý nghĩa nghiệp vụ (Accents & Semantics)
- **Primary Brand Blue:** `#2563eb` (Base) $\rightarrow$ `#1d4ed8` (Royal Sapphire Focus & Dark mode) $\rightarrow$ `#1e40af` (Hover).
- **Primary Light / Badge:** `#eff6ff` (Blue 50).
- **Compensation (Mức lương):** Emerald Jade `#059669` trên nền `#ecfdf5` (Ring: `rgba(5, 150, 105, 0.2)`).
- **AI Features & Match:** Iris Purple `#6366f1` / `#8b5cf6` (Nhấn mạnh trí tuệ nhân tạo).
- **Status Badges:**
  - Active / Success: Emerald `#059669`
  - Pending / Warning: Amber `#d97706`
  - Destructive / Error: Rose Crimson `#e11d48`

---

## 3. Typography (Hệ thống chữ)

- **Primary Font Family:** `'Plus Jakarta Sans', system-ui, -apple-system, sans-serif`.
- **Trọng số (Weights):**
  - Regular (400): Body text dài, đoạn văn giải thích.
  - Medium (500): Nhãn phụ, input text, dropdown items.
  - SemiBold (600): Tiêu đề nhỏ, button text, card titles.
  - Bold (700) & ExtraBold (800): Display headers, hero titles, chỉ số số liệu.
- **Letter Spacing:**
  - Hero & Display (H1, H2): `tracking-tight` (`-0.025em` đến `-0.03em`) tạo độ gọn gàng, sắc sảo.
  - Micro-labels / Uppercase tags: `tracking-[0.1em]` đến `tracking-[0.15em]`.
- **Tabular Figures:** Luôn áp dụng `tabular-nums` cho số lượng, ngày tháng và mức lương để tránh giật giao diện khi cập nhật.

---

## 4. Depth, Shadows & Hairlines (Bề mặt & Chiều sâu)

- **Không dùng bóng xám đục (Generic gray drop shadows).**
- **Hệ thống bóng đổ đa tầng mịn (Tinted Ambient Shadows):**
  ```css
  /* Bóng mềm cho card tĩnh */
  --shadow-premium: 0 1px 3px rgba(15, 23, 42, 0.04), 0 8px 24px -4px rgba(15, 23, 42, 0.06);

  /* Bóng nổi bật khi hover */
  --shadow-premium-hover: 0 4px 6px -1px rgba(15, 23, 42, 0.06), 0 16px 32px -6px rgba(15, 23, 42, 0.1);

  /* Bóng phát quang nhẹ khi focus */
  --shadow-glow-blue: 0 0 0 3px rgba(37, 99, 235, 0.15);
  ```
- **Quy tắc Concentric Radius:** Bo góc bên trong phải nhỏ hơn bo góc bên ngoài một khoảng bằng padding:
  `R_inner = R_outer - padding`.

---

## 5. Micro-interactions & Ergonomics (Tương tác & Công thái học)

- **Touch Targets:** Vùng bấm trên mobile (đặc biệt các nút icon như Bookmark, Close, Menu) tối thiểu **44x44px**.
- **Tactile Feedback:** Mọi nút bấm và thẻ tương tác đều hỗ trợ hiệu ứng nảy vật lý:
  ```css
  .btn-press:active {
    transform: scale(0.98);
  }
  ```
- **Transition Curve:** Ưu tiên `cubic-bezier(0.16, 1, 0.3, 1)` (GJob Ease) mang lại cảm giác chuyển động mượt mà và tự nhiên.
- **Accessibility & Focus Rings:** Đảm bảo `focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2` cho người dùng điều hướng bằng bàn phím.
- **Reduced Motion:** Tôn trọng cài đặt hệ thống `prefers-reduced-motion: reduce`.
