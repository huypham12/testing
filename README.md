# Hướng dẫn Kiểm thử tự động với Playwright

Dự án này sử dụng [Playwright](https://playwright.dev/) để thực hiện kiểm thử tự động (E2E Testing).

## 1. Cài đặt môi trường

Lần đầu tiên clone dự án về, bạn cần chạy các lệnh sau để cài đặt các thư viện cần thiết và trình duyệt:

```bash
# Cài đặt các thư viện (bao gồm cả cross-env vừa được thêm)
npm install

# Cài đặt các trình duyệt của Playwright
npx playwright install
```

## 2. Các lệnh chạy Test

Kết quả kiểm thử (Report) đã được cấu hình tự động phân tách tùy theo kịch bản chạy.

**Chạy toàn bộ các Test:**
```bash
# Sẽ chạy toàn bộ test và lưu kết quả vào thư mục `report/`
npm run test
```

**Chạy riêng từng tính năng:**
```bash
# Chạy test tìm kiếm, lưu kết quả vào `report/search-report/`
npm run test:search

# Chạy test giỏ hàng, lưu kết quả vào `report/cart-report/`
npm run test:cart

# Chạy test thanh toán, lưu kết quả vào `report/checkout-report/`
npm run test:checkout
```

## 3. Các tùy chọn chạy mở rộng (Kết hợp linh hoạt)

Để tránh việc phải chạy toàn bộ test gây mất thời gian, bạn có thể truyền thêm các cờ (flags) vào sau lệnh `npm run` (bằng cách thêm phần `--` ở giữa) để chỉ quan sát một module hoặc một test cụ thể.

**Chạy có giao diện trình duyệt (Headed Mode):**
```bash
# Chỉ mở Chrome quan sát test của tính năng Search
npm run test:search -- --headed

# Chỉ mở Chrome quan sát riêng một test ID cụ thể (ví dụ: TC_SEARCH_01)
npm run test:search -- -g "TC_SEARCH_01" --headed
```

**Chạy UI Mode (Công cụ Debug tương tác trực quan tốt nhất của Playwright):**
```bash
# Mở giao diện UI Mode để debug riêng tính năng Giỏ hàng
npm run test:cart -- --ui
```

**Chạy một Test cụ thể (theo ID hoặc tên Test) chế độ chạy ngầm (Headless):**
```bash
# Chỉ chạy ngầm 1 test cụ thể trong tính năng Thanh toán
npm run test:checkout -- -g "TC-CHECKOUT-01"
```

**Chạy lại (Retry) các test vừa bị Fail ở lần chạy trước:**
```bash
npm run test -- --last-failed
# Hoặc chạy lại các test fail nhưng mở thêm giao diện:
npm run test -- --last-failed --headed
```

## 4. Xem Báo cáo kết quả (Report)

Sau khi chạy test xong, nếu bạn muốn xem lại báo cáo HTML chi tiết:

```bash
# Xem report tổng hợp (nếu dùng npm run test)
npm run report

# Xem report từng tính năng riêng (nếu dùng các lệnh test lẻ)
npm run report:search
npm run report:cart
npm run report:checkout
```

---
*Ghi chú: Cấu trúc thư mục báo cáo (report) được tổ chức theo cấp bậc giúp dễ dàng theo dõi tổng thể hoặc đi sâu vào từng module mà không bị ghi đè, lộn xộn các file kết quả với nhau.*


TC-SEARCH-S5-002
TC-SEARCH-S5-003
TC-SEARCH-S5-004
TC-SEARCH-S5-006
TC-SEARCH-S5-007
TC-CHECKOUT-S1-005
TC-CHECKOUT-S1-007
TC-CART-S1-004

npm run test -- -g "TC-SEARCH-S5-002|TC-SEARCH-S5-003|TC-SEARCH-S5-004|TC-SEARCH-S5-006|TC-SEARCH-S5-007|TC-CHECKOUT-S1-005|TC-CHECKOUT-S1-007|TC-CART-S1-004"