```text

npm run test:cart -- -g "TC-CART-S4-001|TC-CART-S4-002|TC-CART-S4-003|TC-CART-S4-004"

npm run test:cart -- -g "TC-CART-S4-001"

npm run test:cart -- -g "TC-CART-S6-001|TC-CART-S6-002"








```

# Dự án kiểm thử tự động Fahasa (Playwright)

Dự án dùng [Playwright](https://playwright.dev/) để kiểm thử tự động các chức năng trên [Fahasa.com](https://www.fahasa.com/). Test chạy trên trình duyệt **Chromium** (cấu hình trong `playwright.config.ts`).

## Cấu trúc thư mục chính

| Thư mục / file           | Mô tả                                                     |
| ------------------------ | --------------------------------------------------------- |
| `tests/search.spec.ts`   | Test chức năng **Tìm kiếm**                               |
| `tests/cart.spec.ts`     | Test chức năng **Giỏ hàng**                               |
| `tests/checkout.spec.ts` | Test chức năng **Thanh toán** (đang phát triển)           |
| `data/search.data.ts`    | Dữ liệu test Search (import trong spec, không chạy riêng) |
| `data/cart.data.ts`      | Dữ liệu test Cart                                         |
| `pages/`                 | Page Object (SearchPage, CartPage, …)                     |
| `playwright.config.ts`   | Cấu hình chung: base URL, reporter, timeout, browser      |

**Lưu ý:** File `*.data.ts` chỉ cung cấp dữ liệu. Muốn chạy Search/Cart thì chạy file `tests/*.spec.ts` tương ứng.

---

## Yêu cầu hệ thống

- **Node.js** (tương thích `@types/node` v25+)
- **npm** (hoặc yarn / pnpm)

## Cài đặt

```bash
npm install
npx playwright install --with-deps
```

---

## Lệnh npm (khuyên dùng)

Các script được định nghĩa trong `package.json`:

| Lệnh                  | Mô tả                                                        |
| --------------------- | ------------------------------------------------------------ |
| `npm run test`        | Chạy **toàn bộ** test trong thư mục `tests/`                 |
| `npm run test:search` | Chỉ `tests/search.spec.ts` trên Chromium                     |
| `npm run test:cart`   | Chỉ `tests/cart.spec.ts` trên Chromium                       |
| `npm run report`      | Mở báo cáo HTML sau khi chạy test (`playwright show-report`) |

Ví dụ chạy riêng từng chức năng:

```bash
npm run test:search
npm run test:cart
```

---

## Lệnh Playwright chi tiết (`npx`)

Playwright mặc định chạy **headless**. Thêm `--project=chromium` để khớp cấu hình dự án.

### 1. Chạy theo chức năng (file spec)

```bash
npx playwright test tests/search.spec.ts --project=chromium
npx playwright test tests/cart.spec.ts --project=chromium
npx playwright test tests/checkout.spec.ts --project=chromium
```

### 2. Chạy một test case hoặc một nhóm

Dùng `-g` (grep) theo **tiêu đề test** hoặc **mô tả nhóm**:

```bash
# Một TC cụ thể (theo mã TC trong tên test)
npx playwright test tests/search.spec.ts -g "TC-SEARCH-S1-001" --project=chromium
npx playwright test tests/cart.spec.ts -g "TC-CART-S1-001" --project=chromium

# Cả nhóm describe
npx playwright test tests/search.spec.ts -g "Tính năng Tìm kiếm" --project=chromium
npx playwright test tests/cart.spec.ts -g "Tính năng Giỏ hàng" --project=chromium
```

### 3. Chạy lại test thất bại lần trước

```bash
npx playwright test tests/search.spec.ts --last-failed --project=chromium
npx playwright test --last-failed
```

### 4. Giao diện trình duyệt / UI / Debug

```bash
# Hiện cửa sổ trình duyệt
npx playwright test tests/search.spec.ts --headed --project=chromium

# Playwright UI — chọn và chạy từng test, xem trace/timeline
npx playwright test --ui

# Inspector — dừng từng bước, kiểm tra locator
npx playwright test tests/search.spec.ts --debug --project=chromium
```

Có thể kết hợp file + chế độ, ví dụ:

```bash
npx playwright test tests/cart.spec.ts -g "TC-CART-S2-001" --headed --project=chromium
```

### 5. Điều khiển song song (tùy chọn)

```bash
# Chạy tuần tự (1 worker) — ổn định hơn khi debug
npx playwright test tests/cart.spec.ts --workers=1 --project=chromium
```

Trên CI, `playwright.config.ts` đã đặt `workers: 1` khi có biến `CI`.

---

## Báo cáo kết quả

Sau mỗi lần chạy, config tự xuất:

| Đầu ra | File / thư mục                                  |
| ------ | ----------------------------------------------- |
| HTML   | `playwright-report/` (mở bằng `npm run report`) |
| JSON   | `test-results.json`                             |
| JUnit  | `results.xml`                                   |

Khi test **fail**, Playwright lưu screenshot, video và trace (theo `playwright.config.ts`).

### Báo cáo HTML riêng cho từng chức năng

Đặt thư mục report trước khi chạy:

**PowerShell (Windows):**

```powershell
$env:PLAYWRIGHT_HTML_REPORT="report/search-report"
npx playwright test tests/search.spec.ts --reporter=html --project=chromium

$env:PLAYWRIGHT_HTML_REPORT="report/cart-report"
npx playwright test tests/cart.spec.ts --reporter=html --project=chromium
```

**Linux / macOS:**

```bash
PLAYWRIGHT_HTML_REPORT=report/search-report npx playwright test tests/search.spec.ts --reporter=html --project=chromium
```

---

## Biến môi trường (test Cart bị skip mặc định)

Một số kịch bản trong `tests/cart.spec.ts` **không chạy** trừ khi bật biến môi trường:

| Biến                                               | Mục đích                                                               |
| -------------------------------------------------- | ---------------------------------------------------------------------- |
| `RUN_CART_PROMO=1`                                 | TC-CART-S4-004 (áp dụng / gỡ voucher trong popup KM)                   |
| `RUN_CART_LOGIN=1`                                 | TC-CART-S6-001, S6-002 (merge giỏ khi đăng nhập; có thể gặp reCAPTCHA) |
| `FAHASA_ACCOUNT_PHONE` / `FAHASA_ACCOUNT_PASSWORD` | Tài khoản test (mặc định trong `cart.data.ts`)                         |

**PowerShell:**

```powershell
$env:RUN_CART_PROMO="1"; npm run test:cart
$env:RUN_CART_LOGIN="1"; npm run test:cart
```

**CMD:**

```cmd
set RUN_CART_PROMO=1 && npm run test:cart
```

**Linux / macOS:**

```bash
RUN_CART_LOGIN=1 npm run test:cart
```

Các test Cart bị `skip` khi thiếu dữ liệu trong `cart.data.ts` (xem message skip trong báo cáo HTML):

| Test                  | Cần bổ sung trong `data/cart.data.ts`                                                                            |
| --------------------- | ---------------------------------------------------------------------------------------------------------------- |
| **S6-001**            | `mergeScenarioS6001` (guestQty, accountQty trên account X, expectedQty sau merge)                                |
| **S4-004** (phần A/B) | Tổ hợp SP/qty đạt đúng **999.000đ** (`VOUCHER_70K_EXACT_PLAN` — với catalog hiện tại thường **không ghép được**) |
| **S4-004** (phần C)   | Mã Freeship/Discount trên Fahasa khớp regex `/300K/`, `/500K/` khi `RUN_CART_PROMO=1`                            |
| **S6-002**            | Account X phải **có sẵn** `mergeScenarioS6002.accountProductId` trên server trước khi guest login                |

Plan subtotal dưới ngưỡng (S4-001, S4-003) dùng `planMaxBelow()` từ **giá thật** trong `cartData` (vd. 498.000đ thay vì 499.999đ nếu không ghép được).

---

## Cấu hình Playwright — cần sửa khi chạy riêng từng chức năng?

**Không bắt buộc.** Chạy theo file hoặc `-g` qua CLI là đủ; `playwright.config.ts` dùng chung cho mọi spec (`testDir: ./tests`, `baseURL`, reporter, Chromium).

Chỉ cần chỉnh config khi bạn muốn thêm (tùy chọn): script npm mới, tag `@cart`, hoặc project riêng cho CI.

---

## CI (GitHub Actions)

Workflow `.github/workflows/playwright.yml` chạy:

```bash
npx playwright test
```

Artifact `playwright-report` được upload sau mỗi lần chạy trên `main` / `master`.

---

## Tài liệu đặc tả test

Chi tiết testcase và component: thư mục `docs/` (`search_spec.md`, `cart_spec.md`, `checkout_spec.md`, …).
