PLAYWRIGHT_HTML_REPORT=report/search-report npx playwright test search.spec.ts --reporter=html

PLAYWRIGHT_HTML_REPORT=report/search-report npx playwright test search.spec.ts --last-failed

setTimeout(() => { debugger; }, 3000);

Dưới đây là nội dung `README.md` ngắn gọn, tập trung trực tiếp vào việc hướng dẫn cài đặt và các lệnh thực thi kiểm thử theo đúng yêu cầu của bạn.

````markdown
# Dự Án Kiểm Thử Tự Động: Tìm Kiếm Fahasa

Dự án này sử dụng [Playwright](https://playwright.dev/) để tự động hóa các kịch bản kiểm thử cho chức năng tìm kiếm trên trang web [Fahasa.com](https://www.fahasa.com/). Bộ kiểm thử (test suite) được thiết kế chủ yếu để chạy trên trình duyệt **Chromium**.

## ⚙️ Yêu Cầu Hệ Thống

- **Node.js** (Phiên bản tương thích với `@types/node` v25+)
- **NPM** (hoặc Yarn/pnpm)

## 📦 Hướng Dẫn Cài Đặt

1. **Cài đặt các thư viện (dependencies) của dự án:**
   ```bash
   npm install
   ```
````

2. **Cài đặt trình duyệt cho Playwright:**

```bash
npx playwright install --with-deps

```

## 🚀 Các Lệnh Chạy Kiểm Thử

Playwright mặc định chạy ẩn (headless mode). Dưới đây là các lệnh để thực thi test trong nhiều chế độ khác nhau:

### 1. Chạy cơ bản (Được định nghĩa trong `package.json`)

- **Chạy toàn bộ test:**

```bash
npm run test

```

- **Chạy riêng file test tìm kiếm trên Chromium:**

```bash
npm run test:search

```

- **Chạy riêng file test giỏ hàng (Cart) trên Chromium:**

```bash
npm run test:cart

```

### 2. Chạy có giao diện trực quan (Headed / UI Mode)

- **Chạy với giao diện trình duyệt bật lên (Headed mode):** Giúp bạn nhìn thấy rõ các thao tác click, gõ phím đang diễn ra.

```bash
npx playwright test --headed

```

- **Chạy với Playwright UI (Khuyên dùng):** Mở ra một giao diện quản lý trực quan để chạy từng test case, xem timeline, DOM snapshot và network.

```bash
npx playwright test --ui

```

### 3. Chạy ở chế độ gỡ lỗi (Debug Mode)

- **Bật Playwright Inspector:** Tạm dừng ở mỗi thao tác (step) để bạn có thể đi từng bước (step-over) và kiểm tra locator.

```bash
npx playwright test --debug

```

- **Debug một file cụ thể:**

```bash
npx playwright test tests/search.spec.ts --debug

```

### 4. Xem Báo Cáo (Report)

Dự án được cấu hình để xuất báo cáo dạng HTML. Sau khi chạy test, bạn có thể xem chi tiết (bao gồm cả video và ảnh chụp màn hình nếu test lỗi):

```bash
npm run report

```

---

## ⚠️ Các Kịch Bản Kiểm Thử Đặc Biệt (Sử dụng Biến Môi Trường)

Trong file `search.spec.ts` có chứa 2 test case bị bỏ qua (skip) mặc định do rủi ro bị hệ thống tường lửa (WAF) của Fahasa chặn. Bạn có thể ép chạy bằng cách truyền biến môi trường:

- **Kiểm thử mã độc XSS (TC-S2-04):**
- _Lưu ý: Có thể khiến IP của bạn bị Cloudflare khóa._

```bash
# Linux/macOS
RUN_WAF_XSS=1 npx playwright test
# Windows (CMD)
set RUN_WAF_XSS=1 && npx playwright test
# Windows (PowerShell)
$env:RUN_WAF_XSS="1"; npx playwright test

```

- **Kiểm thử chịu tải / Spam (TC-S5-01):**
- _Lưu ý: Gửi 20 request liên tục để kiểm tra rate-limit._

```bash
# Linux/macOS
RUN_STRESS=1 npx playwright test
# Windows (CMD)
set RUN_STRESS=1 && npx playwright test
# Windows (PowerShell)
$env:RUN_STRESS="1"; npx playwright test

```

```

```
