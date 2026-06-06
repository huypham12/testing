# TÀI LIỆU ĐẶC TẢ KIỂM THỬ (TEST SPECIFICATION)

# TÍNH NĂNG ĐIỀN THÔNG TIN THANH TOÁN — FAHASA.COM

---

# 0. Ghi chú quan trọng cho Automation (Playwright)

> **⚠️ LOADING OVERLAY:**
> Fahasa web sử dụng **loading overlay (spinner)** sau hầu hết các thao tác thay đổi dữ liệu trên trang Checkout:
>
> - Chọn dropdown Tỉnh/Thành, Quận/Huyện, Phường/Xã
> - Áp dụng / gỡ voucher, Gift Card
> - Thay đổi phương thức thanh toán
> - Tính lại phí vận chuyển
>
> Nếu Playwright thao tác tiếp khi spinner đang hiển thị → **click bị chặn** hoặc **data chưa load xong** → test **flaky**.
>
> **Yêu cầu bắt buộc:** Sau mỗi bước gây thay đổi dữ liệu, phải **chờ loading overlay biến mất** trước khi thực hiện bước tiếp theo. Thời gian chờ có thể từ 1–5 giây tùy tốc độ mạng.
>
> Trong tất cả Test Case bên dưới, khi ghi "**Chờ loading**" nghĩa là phải chờ spinner/loading biến mất.

---

# 1. Phạm vi kiểm thử (Test Scope)

## Thuộc phạm vi kiểm thử (In-scope)

- Điền thông tin địa chỉ giao hàng:
  - Luồng Guest (chưa đăng nhập) — form inline trên trang
  - Luồng Logged-in — popup Thêm mới / Sửa địa chỉ
  - Validation các trường bắt buộc
  - Logic Dropdown Tỉnh/Thành (Cascaded)

- Quản lý Khuyến mãi:
  - Voucher giảm giá sản phẩm
  - Voucher Freeship
  - Gift Card
  - Điểm thưởng F-Point

- Biểu mẫu Yêu cầu xuất hóa đơn GTGT:
  - State Transition (check/uncheck, Cá nhân/Doanh nghiệp)
  - Validation các trường bắt buộc

- Phương thức thanh toán:
  - Chọn / chuyển đổi giữa các phương thức (COD, ZaloPay, VNPAY, Momo, ATM)
  - Kiểm tra UI khi chọn (chỉ dừng ở bước chọn, không thanh toán online)

- Tính toán tổng tiền:
  - Tiền hàng + Phí Ship − Voucher − F-Point
  - Phí ship thay đổi theo khu vực

- Thông tin khác: Ghi chú, Quà tặng, Kiểm tra lại đơn hàng

---

## Không thuộc phạm vi kiểm thử (Out-of-scope)

- Xử lý giao dịch tại cổng thanh toán bên thứ 3 (ZaloPay, VNPAY, Momo, ATM/Internet Banking).
- Thanh toán online (quét mã QR, nhập OTP, xác nhận giao dịch).
- Thêm, sửa, xóa sản phẩm trong Giỏ hàng (thuộc feature Cart).
- Tấn công XSS, SQL Injection, Spam (web đã có cơ chế chặn).
- Performance Testing, API Testing.

---

# 2. Defect đã phát hiện

| ID | Summary | Severity |
|---|---|---|
| **DEFECT-001** | Nhập SĐT đủ 10 chữ số nhưng không bắt đầu bằng `0` → hệ thống báo "Số điện thoại phải 10 chữ số" thay vì hướng dẫn phải bắt đầu bằng 0. Thông báo lỗi sai lệch, gây confuse. | Medium |
| **DEFECT-002** | Ở chế độ Guest, nhập SĐT đã đăng ký tài khoản → hệ thống tiết lộ SĐT đó đã đăng ký và gợi ý đăng nhập → rò rỉ thông tin khách hàng, cho phép dò quét SĐT. | High |

---

# 3. Danh sách Kịch bản và Test Case chi tiết

---

# SCENARIO 1: Điền thông tin Địa chỉ giao hàng (Guest Checkout)

## Mục tiêu kiểm thử

Phát hiện lỗi ở:

- Validation các trường bắt buộc (text input, dropdown)
- Định dạng và ràng buộc Số điện thoại Việt Nam
- Logic liên kết cascaded giữa Tỉnh → Quận → Phường
- Rò rỉ thông tin bảo mật qua SĐT

---

## Kỹ thuật áp dụng

- Equivalence Partitioning (EP)
- Boundary Value Analysis (BVA)
- State Transition Testing
- Error Guessing (EG)

---

## Giả định nghiệp vụ (Business Rule)

- Các trường bắt buộc trên form Guest:
  - Họ và tên người nhận
  - Email
  - Số điện thoại
  - Quốc gia (mặc định Việt Nam)
  - Tỉnh/Thành phố
  - Quận/Huyện
  - Phường/Xã
  - Địa chỉ nhận hàng

  → Không được để trống khi submit.

- Số điện thoại:
  - Đúng 10 chữ số
  - Chỉ chứa số (0-9)
  - Bắt đầu bằng số `0`
  - Placeholder trên web: `Vd: 0979123xxx (10 ký tự số)`

- Email:
  - Đúng định dạng chuẩn (có `@` và domain hợp lệ)

- Dropdown Tỉnh/Thành, Quận/Huyện, Phường/Xã:
  - Có tính liên kết cascaded
  - Quận/Huyện phụ thuộc Tỉnh/Thành
  - Phường/Xã phụ thuộc Quận/Huyện
  - Mỗi lần chọn dropdown, web có **loading overlay** để tải dữ liệu phụ thuộc

---

## Test Cases

---

### TC-CHECKOUT-S1-001 — [Positive Baseline] Điền đầy đủ thông tin hợp lệ trên form Guest

| Thuộc tính          | Nội dung                                                                                                                                                                                                                                                                                                                                                     |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Pre-condition**   | Giỏ hàng có sản phẩm. User KHÔNG đăng nhập. Đang ở trang Checkout (form inline).                                                                                                                                                                                                                                                                             |
| **Test Data**       | Họ tên: Nguyen Van A <br> Email: testabc@gmail.com <br> SĐT: 0378416504 <br> Quốc gia: Việt Nam <br> Tỉnh: Hồ Chí Minh <br> Quận: Quận 1 <br> Phường: Bến Nghé <br> Địa chỉ: 123 Lê Lợi                                                                                                                                                                   |
| **Steps**           | 1. Nhập Họ tên. <br> 2. Nhập Email. <br> 3. Nhập SĐT. <br> 4. Chọn Tỉnh/Thành → **Chờ loading**. <br> 5. Chọn Quận/Huyện → **Chờ loading**. <br> 6. Chọn Phường/Xã → **Chờ loading**. <br> 7. Nhập Địa chỉ nhận hàng. <br> 8. Cuộn xuống kiểm tra block Phương thức vận chuyển.                                                                          |
| **Expected Result** | Không hiển thị thông báo lỗi nào trên form. <br><br> Block "Phương thức vận chuyển" hiển thị phí ship tương ứng địa chỉ đã chọn kèm dự kiến ngày giao. <br><br> Phương thức thanh toán hiển thị đầy đủ các tùy chọn. <br><br> Nút "Xác nhận thanh toán" có thể click.                                                                                       |
| **Lưu ý Playwright** | Sau mỗi lần chọn dropdown Tỉnh/Quận/Phường, phải wait cho loading overlay biến mất trước khi thao tác tiếp.                                                                                                                                                                                                                                                  |

---

### TC-CHECKOUT-S1-002 — Submit form khi bỏ trống TẤT CẢ các trường bắt buộc

| Thuộc tính          | Nội dung                                                                                                                                                                                              |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Pre-condition**   | Trang Checkout guest, chưa nhập bất kỳ thông tin nào.                                                                                                                                                  |
| **Test Data**       | Tất cả trường để trống (giữ nguyên trạng thái mặc định).                                                                                                                                               |
| **Steps**           | 1. Cuộn xuống cuối trang. <br> 2. Click nút "Xác nhận thanh toán" mà không nhập bất kỳ thông tin nào.                                                                                                  |
| **Expected Result** | Hệ thống chặn đặt hàng. <br><br> Trang tự scroll về trường lỗi đầu tiên. <br><br> Tất cả trường bắt buộc (Họ tên, Email, SĐT, Tỉnh/Thành, Quận/Huyện, Phường/Xã, Địa chỉ) được highlight đỏ kèm thông báo lỗi tương ứng. <br><br> Không tạo đơn hàng. |

---

### TC-CHECKOUT-S1-003 — SĐT chỉ có 9 chữ số (BVA — biên dưới)

| Thuộc tính          | Nội dung                                                                                                               |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| **Pre-condition**   | Đang ở form Checkout guest.                                                                                              |
| **Test Data**       | SĐT: `037841650` (9 chữ số, thiếu 1 số)                                                                                |
| **Steps**           | 1. Nhập đủ thông tin hợp lệ, riêng SĐT nhập Test Data. <br> 2. Blur khỏi ô SĐT hoặc click "Xác nhận thanh toán".       |
| **Expected Result** | Ô SĐT bị highlight đỏ. <br><br> Hiển thị thông báo lỗi (VD: "Số điện thoại phải 10 chữ số"). <br><br> Không cho phép đặt hàng.                                                    |

---

### TC-CHECKOUT-S1-004 — SĐT có 11 chữ số (BVA — vượt biên trên)

| Thuộc tính          | Nội dung                                                                                                                                                                                           |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Pre-condition**   | Đang ở form Checkout guest.                                                                                                                                                                         |
| **Test Data**       | SĐT: `03784165041` (11 chữ số)                                                                                                                                                                      |
| **Steps**           | 1. Nhập SĐT Test Data. <br> 2. Blur khỏi ô.                                                                                                                                                        |
| **Expected Result** | Hệ thống chặn: highlight đỏ + thông báo lỗi "Số điện thoại phải 10 chữ số" hoặc tương đương. <br><br> HOẶC: Ô input chỉ cho phép nhập tối đa 10 ký tự (ký tự thứ 11 bị bỏ qua tự động). <br><br> Không cho phép đặt hàng. |

---

### TC-CHECKOUT-S1-005 — 🐛 SĐT đủ 10 số nhưng KHÔNG bắt đầu bằng 0 (DEFECT-001)

| Thuộc tính          | Nội dung                                                                                                                                                                                                                                                                              |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Pre-condition**   | Đang ở form Checkout guest.                                                                                                                                                                                                                                                            |
| **Test Data**       | SĐT: `1001010101` (10 chữ số, bắt đầu bằng 1 — không bắt đầu bằng 0)                                                                                                                                                                                                                 |
| **Steps**           | 1. Nhập đủ thông tin hợp lệ, riêng SĐT nhập Test Data. <br> 2. Blur khỏi ô SĐT.                                                                                                                                                                                                      |
| **Expected Result** | **(Expected đúng theo spec):** Highlight đỏ ô SĐT. Hiển thị thông báo lỗi rõ ràng hướng dẫn phải bắt đầu bằng số 0, VD: "Số điện thoại không hợp lệ" hoặc "Số điện thoại phải bắt đầu bằng số 0". <br><br> **(Actual — DEFECT-001):** Hệ thống báo "Số điện thoại phải 10 chữ số" → **thông báo sai lệch** vì user đã nhập đủ 10 số, gây confuse. |
| **Kỹ thuật**        | EP (Partition: đủ length nhưng sai format prefix)                                                                                                                                                                                                                                       |
| **Trạng thái**      | 🐛 **KNOWN DEFECT — DEFECT-001**                                                                                                                                                                                                                                                        |

---

### TC-CHECKOUT-S1-006 — SĐT chứa ký tự chữ cái (EP — Invalid non-numeric)

| Thuộc tính          | Nội dung                                                                                                                                                                |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Pre-condition**   | Đang ở form Checkout guest.                                                                                                                                               |
| **Test Data**       | SĐT: `0378abc504`                                                                                                                                                        |
| **Steps**           | 1. Nhập SĐT Test Data vào ô. <br> 2. Blur khỏi ô.                                                                                                                       |
| **Expected Result** | Hệ thống chặn input: ô chỉ nhận số → chữ cái bị lọc bỏ khi gõ (input type="tel"). <br><br> HOẶC: chấp nhận input nhưng hiển thị lỗi validate khi blur/submit. <br><br> Không được phép đặt hàng với SĐT chứa chữ cái. |
| **Kỹ thuật**        | EP (Invalid partition: non-numeric characters)                                                                                                                             |

---

### TC-CHECKOUT-S1-007 — 🐛 Rò rỉ thông tin khách hàng qua SĐT ở chế độ Guest (DEFECT-002)

| Thuộc tính          | Nội dung                                                                                                                                                                                                                                                                                          |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Pre-condition**   | User KHÔNG đăng nhập. Biết 1 SĐT đã đăng ký tài khoản Fahasa.                                                                                                                                                                                                                                     |
| **Test Data**       | SĐT: `<Một SĐT đã đăng ký tài khoản Fahasa>`                                                                                                                                                                                                                                                      |
| **Steps**           | 1. Ở trang Checkout guest, nhập SĐT Test Data. <br> 2. Blur khỏi ô hoặc tiếp tục điền form. <br> 3. Quan sát phản hồi của hệ thống.                                                                                                                                                                |
| **Expected Result** | **(Expected đúng theo bảo mật chuẩn):** Không tiết lộ SĐT đã đăng ký hay chưa. Xử lý bình thường như mọi SĐT hợp lệ khác. <br><br> **(Actual — DEFECT-002):** Hệ thống hiển thị thông báo xác nhận SĐT đã đăng ký và **gợi ý đăng nhập bằng số đó** → rò rỉ thông tin, cho phép kẻ xấu dò quét SĐT nào đã có tài khoản. |
| **Kỹ thuật**        | Error Guessing (Security-oriented)                                                                                                                                                                                                                                                                    |
| **Trạng thái**      | 🐛 **KNOWN DEFECT — DEFECT-002 (Severity: High)**                                                                                                                                                                                                                                                     |

---

### TC-CHECKOUT-S1-008 — Logic liên kết Cascaded: chọn Tỉnh → Quận chỉ load đúng dữ liệu

| Thuộc tính          | Nội dung                                                                                                                                                                     |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Pre-condition**   | Đang ở form Checkout guest. Chưa chọn Tỉnh/Thành.                                                                                                                            |
| **Test Data**       | Tỉnh/Thành: "Hà Nội"                                                                                                                                                         |
| **Steps**           | 1. Chọn Tỉnh/Thành = "Hà Nội". <br> 2. **Chờ loading**. <br> 3. Click mở dropdown "Quận/Huyện". <br> 4. Quan sát danh sách.                                                  |
| **Expected Result** | Dropdown "Quận/Huyện" chỉ hiển thị danh sách các quận/huyện thuộc Hà Nội (Hoàn Kiếm, Ba Đình, Đống Đa, Cầu Giấy...). <br><br> Các quận/huyện của tỉnh khác không xuất hiện. |
| **Kỹ thuật**        | EP (Cascaded dependency)                                                                                                                                                       |
| **Lưu ý Playwright** | Bắt buộc chờ loading overlay mất sau khi chọn Tỉnh, nếu không dropdown Quận/Huyện sẽ chưa load dữ liệu.                                                                       |

---

### TC-CHECKOUT-S1-009 — Đổi Tỉnh/Thành phải reset Quận/Huyện và Phường/Xã

| Thuộc tính          | Nội dung                                                                                                                                                                                                                  |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Pre-condition**   | Đã chọn đầy đủ: Hồ Chí Minh → Quận 1 → Phường Bến Nghé.                                                                                                                                                                   |
| **Test Data**       | Đổi Tỉnh/Thành sang "Hà Nội".                                                                                                                                                                                              |
| **Steps**           | 1. Chọn lại Tỉnh/Thành = "Hà Nội". <br> 2. **Chờ loading**. <br> 3. Quan sát dropdown Quận/Huyện và Phường/Xã.                                                                                                             |
| **Expected Result** | Quận/Huyện bị reset về placeholder mặc định ("Chọn quận/huyện"). <br><br> Phường/Xã bị reset về placeholder mặc định. <br><br> Dropdown Quận/Huyện khi mở chỉ chứa các quận của Hà Nội. <br><br> Phí ship được tính lại (hoặc ẩn đi cho đến khi chọn đủ Quận + Phường). |
| **Kỹ thuật**        | State Transition (Cascaded reset)                                                                                                                                                                                             |
| **Lưu ý Playwright** | Sau khi chọn Tỉnh mới, Fahasa loading ~1-3s. Phải wait trước khi assert Quận/Huyện.                                                                                                                                          |

---

### TC-CHECKOUT-S1-010 — Submit khi bỏ trống Tỉnh/Thành phố (Dropdown validation)

| Thuộc tính          | Nội dung                                                                                                                                                                                                          |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Pre-condition**   | Đang ở form Checkout guest.                                                                                                                                                                                        |
| **Test Data**       | Nhập đầy đủ Họ tên, Email, SĐT, Địa chỉ. **KHÔNG chọn** Tỉnh/Thành phố (giữ ở placeholder "Chọn tỉnh/thành phố").                                                                                                 |
| **Steps**           | 1. Điền đầy đủ các trường text. <br> 2. Giữ Tỉnh/Thành ở placeholder mặc định. <br> 3. Click "Xác nhận thanh toán".                                                                                               |
| **Expected Result** | Hệ thống chặn đặt hàng. <br><br> Dropdown Tỉnh/Thành bị highlight đỏ kèm thông báo lỗi. <br><br> Quận/Huyện và Phường/Xã vẫn ở trạng thái chưa chọn (chưa load data vì chưa có Tỉnh). |
| **Kỹ thuật**        | EP (Negative — validate dropdown khác cơ chế validate text input)                                                                                                                                                    |

---

### TC-CHECKOUT-S1-011 — Email sai định dạng trên form Guest

| Thuộc tính          | Nội dung                                                                                                                    |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| **Pre-condition**   | Đang ở form Checkout guest.                                                                                                  |
| **Test Data**       | Email: `user@domain` (thiếu phần mở rộng domain, VD: thiếu `.com`)                                                           |
| **Steps**           | 1. Nhập đủ thông tin hợp lệ, riêng Email nhập Test Data. <br> 2. Click "Xác nhận thanh toán".                                |
| **Expected Result** | Ô Email bị highlight đỏ. <br><br> Hiển thị thông báo "Email không hợp lệ" hoặc tương đương. <br><br> Không cho phép đặt hàng. |
| **Kỹ thuật**        | EP (Invalid email format)                                                                                                     |

---

### TC-CHECKOUT-S1-012 — Họ tên chỉ chứa khoảng trắng

| Thuộc tính          | Nội dung                                                                                                                             |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| **Pre-condition**   | Đang ở form Checkout guest.                                                                                                           |
| **Test Data**       | Họ tên: `     ` (chỉ gồm 5 khoảng trắng, không có ký tự thực)                                                                       |
| **Steps**           | 1. Nhập Họ tên chỉ toàn khoảng trắng. <br> 2. Nhập đủ các trường còn lại với data hợp lệ. <br> 3. Click "Xác nhận thanh toán".        |
| **Expected Result** | Hệ thống phải coi đây là trường rỗng và chặn: highlight đỏ + thông báo "Vui lòng nhập họ tên" hoặc tương đương. <br><br> Nếu hệ thống chấp nhận khoảng trắng làm tên hợp lệ → đây là **lỗi validation** cần ghi nhận. |
| **Kỹ thuật**        | Error Guessing (whitespace-only input)                                                                                                  |

---

# SCENARIO 2: Quản lý Khuyến mãi, Gift Card và F-Point

## Mục tiêu kiểm thử

Xác minh:

- Logic áp dụng tổ hợp các loại mã giảm giá
- Giới hạn điều kiện tiền tệ (biên)
- Xử lý mã không hợp lệ
- Tính lại tổng khi gỡ mã

---

## Kỹ thuật áp dụng

- Boundary Value Analysis (BVA)
- Decision Table Testing
- Error Guessing (EG)

---

## Giả định nghiệp vụ (Business Rule)

- Mã `Giảm 30K` chỉ áp dụng cho đơn hàng có tổng giá trị sản phẩm từ `499,000đ` trở lên.
- Tối đa:
  - 1 Voucher giảm giá sản phẩm
  - 1 Voucher Freeship

  trên 1 đơn hàng.

---

## Decision Table

| Điều kiện / Rule        | Rule 1                         | Rule 2               | Rule 3                | Rule 4         |
| ----------------------- | ------------------------------ | -------------------- | --------------------- | -------------- |
| Áp dụng Voucher hợp lệ  | Y                              | Y                    | N                     | N              |
| Áp dụng Freeship hợp lệ | Y                              | N                    | Y                     | N              |
| Hành động hệ thống      | Áp dụng cả 2, trừ tiền 2 khoản | Chỉ trừ tiền Voucher | Chỉ trừ tiền Freeship | Không trừ tiền |

---

## Test Cases

---

### TC-CHECKOUT-S2-001 — Áp dụng Voucher 30k với giá trị đơn hàng ĐÚNG BẰNG điều kiện biên (BVA)

| Thuộc tính          | Nội dung                                                                                                       |
| ------------------- | -------------------------------------------------------------------------------------------------------------- |
| **Pre-condition**   | Giỏ hàng có tổng giá trị sản phẩm chính xác là 499,000đ.                                                        |
| **Test Data**       | Chọn voucher "Mã Giảm 30K - Đơn hàng từ 499k".                                                                  |
| **Steps**           | 1. Mở popup "Chọn mã khuyến mãi". <br> 2. Click nút "Áp dụng" trên voucher Test Data. <br> 3. **Chờ loading**. <br> 4. Đóng popup. |
| **Expected Result** | Nút "Áp dụng" chuyển thành "Đã áp dụng". <br><br> Block "Kiểm tra lại đơn hàng" hiển thị "Giảm giá: -30.000đ". <br><br> Tổng số tiền giảm đúng 30,000đ. |

---

### TC-CHECKOUT-S2-002 — Áp dụng Voucher 30k với giá trị đơn hàng DƯỚI điều kiện biên (BVA)

| Thuộc tính          | Nội dung                                                                                                          |
| ------------------- | ----------------------------------------------------------------------------------------------------------------- |
| **Pre-condition**   | Giỏ hàng có tổng giá trị sản phẩm là 498,000đ.                                                                     |
| **Test Data**       | Chọn voucher "Mã Giảm 30K - Đơn hàng từ 499k".                                                                     |
| **Steps**           | 1. Mở popup "Chọn mã khuyến mãi". <br> 2. Quan sát trạng thái của voucher Test Data.                              |
| **Expected Result** | Voucher bị mờ/disable. <br><br> Nút thao tác hiển thị "Mua thêm 1,000đ" (hoặc số tiền chênh lệch). <br><br> Không thể click để chọn mã này. |

---

### TC-CHECKOUT-S2-003 — Áp dụng đồng thời Voucher và Freeship (Rule 1 — Decision Table)

| Thuộc tính          | Nội dung                                                                                                                                                                                         |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Pre-condition**   | Giỏ hàng đủ điều kiện áp dụng cả 2 mã.                                                                                                                                                            |
| **Test Data**       | Mã 1: Voucher giảm 30k <br> Mã 2: Freeship 15k                                                                                                                                                   |
| **Steps**           | 1. Mở popup "Chọn mã khuyến mãi". <br> 2. Click "Áp dụng" cho Mã 1. **Chờ loading**. <br> 3. Click "Áp dụng" cho Mã 2. **Chờ loading**. <br> 4. Đóng popup.                                        |
| **Expected Result** | Cả 2 mã chuyển trạng thái "Đã áp dụng". <br><br> UI chi tiết giá hiển thị 2 dòng riêng biệt: <br> - "Giảm giá: -30.000đ" <br> - "Giảm giá vận chuyển: -15.000đ" <br><br> Tổng tiền được khấu trừ tương ứng cả 2 khoản. |

---

### TC-CHECKOUT-S2-004 — Nhập mã khuyến mãi / Gift Card không hợp lệ

| Thuộc tính          | Nội dung                                                                                                                                                   |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Pre-condition**   | User đang ở trang Checkout.                                                                                                                                 |
| **Test Data**       | Mã: `KHONGTONNTAI999` (mã bất kỳ không tồn tại trong hệ thống)                                                                                             |
| **Steps**           | 1. Tại ô "Mã khuyến mãi / Gift Card", nhập Test Data. <br> 2. Click nút "Áp dụng". <br> 3. **Chờ loading**.                                                 |
| **Expected Result** | Hiển thị thông báo lỗi rõ ràng (VD: "Mã giảm giá không hợp lệ" hoặc "Mã giảm giá đã hết hạn hoặc hết lượt sử dụng"). <br><br> Không có khoản giảm trừ nào được ghi nhận. <br><br> Tổng tiền không thay đổi. |
| **Kỹ thuật**        | Error Guessing (Invalid code)                                                                                                                                |

---

### TC-CHECKOUT-S2-005 — Áp voucher thành công rồi gỡ bỏ — tổng tiền phải phục hồi

| Thuộc tính          | Nội dung                                                                                                                                                   |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Pre-condition**   | Đã áp dụng thành công 1 voucher giảm giá. Tổng tiền đã bị trừ.                                                                                              |
| **Test Data**       | Gỡ voucher đang áp dụng.                                                                                                                                    |
| **Steps**           | 1. Ghi nhận tổng tiền hiện tại (đã trừ voucher). <br> 2. Mở popup "Chọn mã khuyến mãi". <br> 3. Click "Bỏ chọn" / "Hủy" trên voucher đang áp dụng. **Chờ loading**. <br> 4. Đóng popup. <br> 5. Kiểm tra tổng tiền. |
| **Expected Result** | Voucher chuyển trạng thái từ "Đã áp dụng" về "Áp dụng". <br><br> Dòng giảm giá biến mất khỏi block tổng tiền. <br><br> Tổng tiền phục hồi về đúng giá trị ban đầu (trước khi áp voucher). |
| **Kỹ thuật**        | State Transition (áp dụng → gỡ bỏ → verify rollback)                                                                                                        |

---

# SCENARIO 3: Yêu cầu Xuất hóa đơn GTGT (VAT)

## Mục tiêu kiểm thử

Kiểm tra:

- Sự chuyển đổi trạng thái biểu mẫu (check/uncheck, Cá nhân/Doanh nghiệp)
- Validation các trường bắt buộc khi submit

---

## Kỹ thuật áp dụng

- State Transition Testing
- Equivalence Partitioning (EP)

---

## Giả định nghiệp vụ (Business Rule)

- Checkbox "Xuất hóa đơn GTGT":
  - Mặc định Unchecked
  - Khi Checked:
    - Form mở rộng
    - Mặc định chọn loại "Cá nhân"

- Form Doanh nghiệp yêu cầu:
  - Tên người mua
  - Tên DN
  - Địa chỉ DN
  - MST
  - Mã đơn vị QHNS
  - Email

- Form Cá nhân yêu cầu:
  - Họ tên
  - Địa chỉ
  - CCCD
  - Hộ chiếu
  - Email

- Email nhận hóa đơn:
  - Bắt buộc
  - Đúng định dạng chuẩn

---

## Test Cases

---

### TC-CHECKOUT-S3-001 — Chuyển đổi trạng thái biểu mẫu Hóa đơn GTGT (State Transition)

| Thuộc tính          | Nội dung                                                                                                                                                                                                                              |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Pre-condition**   | User ở trang Checkout, đang ở phần "Thông tin khác".                                                                                                                                                                                   |
| **Test Data**       | N/A                                                                                                                                                                                                                                   |
| **Steps**           | 1. Click checkbox "Xuất hóa đơn GTGT". <br> 2. Quan sát form xuất hiện. <br> 3. Click radio "Doanh nghiệp". <br> 4. Quan sát form thay đổi. <br> 5. Bỏ check "Xuất hóa đơn GTGT". <br> 6. Quan sát form.                                |
| **Expected Result** | Bước 2: Form xuất hiện, Radio "Cá nhân" được chọn mặc định. <br><br> Bước 4: UI thay đổi hiển thị các trường của Doanh nghiệp (Tên DN, MST, Mã đơn vị QHNS...). <br><br> Bước 6: Toàn bộ form ẩn đi, data đã nhập bị reset. |

---

### TC-CHECKOUT-S3-002 — Bỏ trống MST trong form Doanh nghiệp (EP — Negative)

| Thuộc tính          | Nội dung                                                                                                                                                                         |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Pre-condition**   | Đã check "Xuất hóa đơn GTGT", chọn "Doanh nghiệp".                                                                                                                                |
| **Test Data**       | Bỏ trống "Mã số thuế". Nhập đủ các trường còn lại.                                                                                                                               |
| **Steps**           | 1. Nhập đủ thông tin trừ MST. <br> 2. Cuộn xuống click nút "Xác nhận thanh toán".                                                                                                 |
| **Expected Result** | Hệ thống chặn thao tác đặt hàng. <br><br> Màn hình tự động scroll về vị trí form hóa đơn. <br><br> Trường "Mã số thuế" bị highlight đỏ kèm thông báo lỗi. |

---

### TC-CHECKOUT-S3-003 — Email nhận hóa đơn sai định dạng (EP — Negative)

| Thuộc tính          | Nội dung                                                                                                 |
| ------------------- | -------------------------------------------------------------------------------------------------------- |
| **Pre-condition**   | Đang ở form VAT "Cá nhân".                                                                                |
| **Test Data**       | Email: `user@domain` (thiếu phần mở rộng domain)                                                          |
| **Steps**           | 1. Nhập đủ thông tin hợp lệ, riêng Email nhập Test Data. <br> 2. Click "Xác nhận thanh toán".            |
| **Expected Result** | Hệ thống chặn đặt hàng. <br><br> Trường Email highlight đỏ kèm thông báo lỗi "Định dạng email không hợp lệ" hoặc tương đương. |

---

# SCENARIO 4: Phương thức thanh toán, Phí ship và Tổng tiền

## Mục tiêu kiểm thử

Xác nhận:

- Chọn / chuyển đổi phương thức thanh toán hoạt động đúng ở UI
- Phí ship thay đổi đúng khi đổi khu vực giao hàng
- Hệ thống tính toán tổng tiền chính xác (F-Point, Voucher, Phí ship)
- Block "Kiểm tra lại đơn hàng" hiển thị đúng thông tin

---

## Kỹ thuật áp dụng

- Use Case Testing
- Boundary Value Analysis (BVA)
- State Transition Testing
- Equivalence Partitioning (EP)

---

## Giả định nghiệp vụ (Business Rule)

- Công thức:

```text
Tổng số tiền
=
(Thành tiền hàng + Phí vận chuyển)
-
(Voucher giảm giá hàng + Mã Freeship + Điểm F-Point quy đổi)
```

- F-Point:
  - 1 F-Point = 1 VNĐ
  - Không thể nhập:
    - lớn hơn Tổng số tiền
    - lớn hơn số dư hiện có

- Phương thức thanh toán mặc định: COD ("Thanh toán bằng tiền mặt khi nhận hàng").

- Các phương thức khả dụng: COD, Ví ZaloPay, VNPAY, Ví ShopeePay, Ví Momo, ATM/Internet Banking.

- Phí vận chuyển: phụ thuộc vào khu vực giao hàng (Tỉnh/Quận/Phường đã chọn). Thay đổi khu vực → phí ship tính lại.

---

## Test Cases

---

### TC-CHECKOUT-S4-001 — Tính tổng tiền tích hợp F-Point, Voucher và Phí ship

| Thuộc tính          | Nội dung                                                                                                                                                                       |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Pre-condition**   | Giỏ hàng: 240,000đ <br> Phí ship: 22,000đ <br> Voucher: -30,000đ <br> User có số dư 50,000 F-point.                                                                            |
| **Test Data**       | Nhập sử dụng `10000` F-point.                                                                                                                                                   |
| **Steps**           | 1. Tại block "Thành viên Fahasa", check box "Dùng Fpoint để thanh toán". <br> 2. Nhập số F-point theo Test Data. <br> 3. **Chờ loading**. <br> 4. Kiểm tra block "Tổng Số Tiền".  |
| **Expected Result** | Hệ thống trừ ngay lập tức vào tổng số tiền. <br><br> Dòng tính toán hiển thị chi tiết: <br> `240,000 + 22,000 - 30,000 - 10,000` <br><br> Tổng số tiền cuối cùng = `222,000đ`. |
| **Kỹ thuật**        | Use Case (tích hợp nhiều thành phần tính toán)                                                                                                                                    |

---

### TC-CHECKOUT-S4-002 — F-Point vượt quá số dư hiện có (BVA)

| Thuộc tính          | Nội dung                                                                                                                                                                            |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Pre-condition**   | User có số dư 5,000 F-point.                                                                                                                                                         |
| **Test Data**       | Nhập sử dụng `10000` F-point.                                                                                                                                                        |
| **Steps**           | 1. Check box "Dùng Fpoint". <br> 2. Nhập số lượng F-point theo Test Data. <br> 3. **Chờ loading**.                                                                                    |
| **Expected Result** | Hệ thống tự động cap (chặn) giá trị. <br><br> Field text tự nhảy về số dư tối đa là `5000` hoặc hiển thị lỗi "Số F-Point không đủ". <br><br> Tổng tiền chỉ được giảm tối đa 5,000đ. |
| **Kỹ thuật**        | BVA (vượt biên trên số dư)                                                                                                                                                            |

---

### TC-CHECKOUT-S4-003 — Chọn phương thức thanh toán online — kiểm tra UI

| Thuộc tính          | Nội dung                                                                                                                                                       |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Pre-condition**   | Đã điền đầy đủ thông tin giao hàng hợp lệ. Phương thức mặc định đang là COD.                                                                                    |
| **Test Data**       | Chọn "Ví ZaloPay" hoặc "VNPAY".                                                                                                                                 |
| **Steps**           | 1. Cuộn xuống block "Phương thức thanh toán". <br> 2. Click radio button của phương thức thanh toán online. <br> 3. **Chờ loading**. <br> 4. Quan sát UI.          |
| **Expected Result** | Radio button phương thức mới được chọn (active). <br><br> COD không còn được chọn. <br><br> Tổng tiền KHÔNG thay đổi (phương thức thanh toán không ảnh hưởng giá). <br><br> Nút "Xác nhận thanh toán" vẫn có thể click. |
| **Kỹ thuật**        | EP (chọn phương thức khác mặc định)                                                                                                                               |
| **Ghi chú**         | Chỉ kiểm tra đến bước UI thay đổi. **KHÔNG click** "Xác nhận thanh toán" vì sẽ redirect tới cổng thanh toán bên thứ 3 (ngoài phạm vi).                            |

---

### TC-CHECKOUT-S4-004 — Chuyển đổi qua lại giữa các phương thức thanh toán

| Thuộc tính          | Nội dung                                                                                                                                                                  |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Pre-condition**   | Đã điền thông tin giao hàng hợp lệ.                                                                                                                                        |
| **Test Data**       | Chọn lần lượt: VNPAY → COD → Ví Momo.                                                                                                                                      |
| **Steps**           | 1. Click VNPAY → **Chờ loading**. <br> 2. Click COD → **Chờ loading**. <br> 3. Click Ví Momo → **Chờ loading**. <br> 4. Kiểm tra trạng thái radio buttons và tổng tiền.       |
| **Expected Result** | Chỉ 1 phương thức được active tại mỗi thời điểm (radio button exclusive). <br><br> Tổng tiền không thay đổi qua các lần chuyển. <br><br> Không có lỗi UI, flickering, hay thông báo lỗi bất thường. |
| **Kỹ thuật**        | State Transition (chuyển đổi liên tục qua nhiều trạng thái)                                                                                                                   |

---

### TC-CHECKOUT-S4-005 — Phí vận chuyển thay đổi khi đổi khu vực giao hàng

| Thuộc tính          | Nội dung                                                                                                                                                                                     |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Pre-condition**   | Đã điền thông tin giao hàng với Tỉnh = Hồ Chí Minh. Phí ship đã hiển thị.                                                                                                                     |
| **Test Data**       | Đổi Tỉnh sang "Hà Giang" (tỉnh miền núi xa).                                                                                                                                                  |
| **Steps**           | 1. Ghi nhận phí ship hiện tại (VD: 22,000đ cho HCM). <br> 2. Đổi Tỉnh/Thành → Hà Giang. **Chờ loading**. <br> 3. Chọn Quận/Huyện. **Chờ loading**. <br> 4. Chọn Phường/Xã. **Chờ loading**. <br> 5. So sánh phí ship mới với phí ship cũ. |
| **Expected Result** | Phí ship thay đổi (thường tăng khi giao tỉnh xa). <br><br> Tổng tiền tính lại = Thành tiền + Phí ship mới − Giảm giá. <br><br> Block "Phương thức vận chuyển" cập nhật dự kiến ngày giao mới. |
| **Kỹ thuật**        | EP (data-driven: khu vực khác nhau → phí khác nhau)                                                                                                                                             |

---

### TC-CHECKOUT-S4-006 — Block "Kiểm tra lại đơn hàng" hiển thị đúng thông tin sản phẩm

| Thuộc tính          | Nội dung                                                                                                                                                                               |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Pre-condition**   | Giỏ hàng có 1 sản phẩm đã biết rõ thông tin.                                                                                                                                            |
| **Test Data**       | SP test: Tên sản phẩm đã biết, Giá gốc, Giá sale (nếu có), SL = 1.                                                                                                                      |
| **Steps**           | 1. Cuộn xuống block "Kiểm tra lại đơn hàng". <br> 2. Kiểm tra: tên SP, ảnh bìa, giá gốc (gạch ngang nếu có sale), giá sale, số lượng, thành tiền.                                        |
| **Expected Result** | Tên sản phẩm khớp với sản phẩm trong giỏ. <br><br> Ảnh bìa hiển thị (không bị broken image). <br><br> Giá gốc hiển thị gạch ngang (nếu có sale). <br><br> Giá hiện tại đúng. <br><br> Số lượng đúng. <br><br> Thành tiền = Giá hiện tại × Số lượng. |
| **Kỹ thuật**        | Use Case (end-to-end data integrity verification)                                                                                                                                          |

---

# SCENARIO 5: Thông tin khác (Ghi chú, Quà tặng)

## Mục tiêu kiểm thử

Kiểm tra các chức năng phụ trên trang Checkout:

- Ghi chú đơn hàng (Checkbox + ô nhập liệu)
- Chọn quà tặng kèm (nếu đơn đủ điều kiện)

---

## Kỹ thuật áp dụng

- State Transition Testing
- Use Case Testing

---

## Test Cases

---

### TC-CHECKOUT-S5-001 — Chọn quà tặng kèm khi đủ điều kiện

| Thuộc tính          | Nội dung                                                                                                                                       |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| **Pre-condition**   | Đơn hàng đủ điều kiện nhận quà (block "Nhận quà" hiển thị trên trang).                                                                         |
| **Test Data**       | Chọn 1 món quà từ danh sách khả dụng.                                                                                                           |
| **Steps**           | 1. Tại block "Nhận quà (0/1)", click "Chọn quà" hoặc nút tương tự. <br> 2. Chọn 1 món quà từ popup/danh sách. <br> 3. Xác nhận chọn.            |
| **Expected Result** | Counter quà cập nhật (1/1). <br><br> Quà được hiển thị trong block. <br><br> Tổng tiền KHÔNG thay đổi (quà tặng miễn phí).                       |
| **Kỹ thuật**        | Use Case                                                                                                                                         |

---

### TC-CHECKOUT-S5-002 — Ghi chú đơn hàng — chuyển đổi trạng thái

| Thuộc tính          | Nội dung                                                                                                                                                       |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Pre-condition**   | Trang Checkout, phần "Thông tin khác".                                                                                                                           |
| **Test Data**       | Ghi chú: "Giao hàng giờ hành chính, gọi trước khi giao"                                                                                                         |
| **Steps**           | 1. Check checkbox "Ghi chú". <br> 2. Quan sát ô nhập ghi chú xuất hiện. <br> 3. Nhập nội dung ghi chú. <br> 4. Bỏ check "Ghi chú". <br> 5. Check lại "Ghi chú". |
| **Expected Result** | Bước 2: Ô ghi chú xuất hiện (state transition: hidden → visible). <br><br> Bước 3: Nội dung được giữ trong ô. <br><br> Bước 4: Ô ghi chú ẩn đi. <br><br> Bước 5: Kiểm tra nội dung có bị reset hay vẫn giữ lại (ghi nhận hành vi thực tế của web). |
| **Kỹ thuật**        | State Transition                                                                                                                                                    |

---

# 4. Tổng hợp Test Case

| Scenario | Số TC | Danh sách |
|---|---|---|
| S1 — Địa chỉ giao hàng (Guest) | 12 | S1-001 → S1-012 |
| S2 — Khuyến mãi, Gift Card | 5 | S2-001 → S2-005 |
| S3 — Hóa đơn GTGT | 3 | S3-001 → S3-003 |
| S4 — Thanh toán, Phí ship, Tổng tiền | 6 | S4-001 → S4-006 |
| S5 — Thông tin khác | 2 | S5-001 → S5-002 |
| **Tổng** | **28** | |

### Phân loại theo loại test

| Loại | Số TC | Ví dụ |
|---|---|---|
| Negative / Validation | 14 | S1-002 → S1-012, S2-004, S3-002, S3-003 |
| Boundary Value | 4 | S1-003, S1-004, S2-001, S2-002 |
| State Transition | 5 | S1-009, S2-005, S3-001, S4-004, S5-002 |
| Known Defect | 2 | S1-005 (DEFECT-001), S1-007 (DEFECT-002) |
| Positive Baseline | 1 | S1-001 |
| Use Case / Integration | 2 | S4-001, S4-006 |

---

# 5. Ma trận theo dõi Kỹ thuật kiểm thử (Testing Techniques Matrix)

| Kỹ thuật Thiết kế (ISTQB)         | Kịch bản áp dụng              | Mục đích sử dụng                                                                                                                                                                              |
| --------------------------------- | ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Equivalence Partitioning (EP)** | Scenario 1, 2, 3, 4           | Phân vùng dữ liệu hợp lệ (SĐT 10 số bắt đầu 0, email đúng format) và không hợp lệ (9 số, 11 số, chứa chữ cái, thiếu trường) để bao phủ validation với số TC tối ưu.                           |
| **Boundary Value Analysis (BVA)** | Scenario 1, 2, 4              | Đánh vào điểm cận biên: SĐT 9/10/11 số, voucher 498k/499k, F-Point vượt số dư. Phát hiện lỗi sai toán tử (`>` vs `>=`) trong logic validation.                                                  |
| **Error Guessing (EG)**           | Scenario 1, 2                 | Tấn công rủi ro phổ biến: khoảng trắng thay tên, SĐT đã đăng ký rò rỉ thông tin, mã khuyến mãi không tồn tại.                                                                                  |
| **State Transition Testing**      | Scenario 1, 2, 3, 4, 5        | Kiểm soát chuyển đổi trạng thái: cascaded dropdown reset, check/uncheck VAT form, chuyển đổi phương thức thanh toán, áp/gỡ voucher, ghi chú toggle.                                              |
| **Decision Table Testing**        | Scenario 2                    | Kiểm tra tổ hợp điều kiện khi kết hợp Voucher SP + Freeship. Đảm bảo rule nghiệp vụ không conflict khi áp nhiều loại discount cùng lúc.                                                         |
| **Use Case Testing**              | Scenario 4, 5                 | Mô phỏng luồng người dùng cuối: tính tổng tiền tích hợp nhiều thành phần, kiểm tra data integrity của block đơn hàng, chọn quà tặng.                                                             |
