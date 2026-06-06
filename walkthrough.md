# Review Test Cases Checkout — Fahasa.com

## Tổng quan

Đã tạo **3 file** theo mô hình POM:

| File | Đường dẫn | Mô tả |
|------|-----------|-------|
| [checkout.data.ts](file:///c:/Users/ThinkPad%20T14s/Downloads/nam4/ki2/dot2/kiemthu/giuaky/code/data/checkout.data.ts) | `data/` | Dữ liệu test: địa chỉ, SĐT, voucher, VAT, PTTT |
| [CheckoutPages.ts](file:///c:/Users/ThinkPad%20T14s/Downloads/nam4/ki2/dot2/kiemthu/giuaky/code/pages/CheckoutPages.ts) | `pages/` | Page Object Model: locators + actions |
| [checkout.spec.ts](file:///c:/Users/ThinkPad%20T14s/Downloads/nam4/ki2/dot2/kiemthu/giuaky/code/tests/checkout.spec.ts) | `tests/` | 28 test cases (5 Scenarios) |

---

## ✅ NHÓM 1: Test Cases ĐỦ ĐIỀU KIỆN thực thi (16/28)

Các TC này đã có đầy đủ selectors HTML, test data và logic — có thể chạy ngay.

| TC ID | Tên | Ghi chú |
|-------|-----|---------|
| S1-002 | Submit form bỏ trống tất cả trường | ✅ Chỉ cần click submit, check lỗi |
| S1-003 | SĐT 9 chữ số (BVA biên dưới) | ✅ Input + blur + check error |
| S1-004 | SĐT 11 chữ số (BVA vượt biên trên) | ✅ maxlength="10" tự cắt |
| S1-005 | 🐛 SĐT không bắt đầu bằng 0 (DEFECT-001) | ✅ Ghi nhận defect |
| S1-006 | SĐT chứa chữ cái | ✅ Validate input |
| S1-007 | 🐛 Rò rỉ SĐT (DEFECT-002) | ✅ Cần `ACCOUNT_PHONE` từ .env |
| S1-010 | Bỏ trống Tỉnh/Thành | ✅ Không chọn dropdown, click submit |
| S1-011 | Email sai định dạng | ✅ Input `user@domain` |
| S1-012 | Họ tên chỉ khoảng trắng | ✅ Error guessing |
| S2-004 | Mã khuyến mãi không hợp lệ | ✅ Nhập mã bất kỳ |
| S3-001 | State transition biểu mẫu VAT | ✅ Check/uncheck, Cá nhân/DN |
| S3-002 | Bỏ trống MST trong DN | ✅ Có đủ selectors |
| S3-003 | Email VAT sai định dạng | ✅ Input invalid email |
| S4-004 | Chuyển đổi phương thức thanh toán | ✅ Click radio buttons |
| S5-002 | Ghi chú đơn hàng — toggle | ✅ Check/uncheck/nhập text |
| S4-006 | Block kiểm tra đơn hàng | ✅ Verify tên SP + ảnh |

---

## ⚠️ NHÓM 2: Test Cases CẦN BỔ SUNG DATA (7/28)

Các TC này có đủ selectors nhưng **thiếu dữ liệu cụ thể** cần lấy từ web.

| TC ID | Tên | Thiếu gì? | Cách lấy |
|-------|-----|-----------|----------|
| **S1-001** | Điền đầy đủ thông tin hợp lệ Guest | Cần xác nhận value chính xác của **Quận 1** và **Bến Nghé** trong select2 dropdown khi chọn HCM | Lên web → Checkout → Chọn HCM → Inspect dropdown Quận/Huyện → copy text chính xác |
| **S1-008** | Cascaded Tỉnh → Quận | Cần xác nhận danh sách quận Hà Nội chính xác (để assert) | Lên web → Checkout → Chọn Hà Nội → mở dropdown Quận/Huyện |
| **S1-009** | Reset Quận/Phường khi đổi Tỉnh | Cần xác nhận text placeholder chính xác sau reset | Lên web → Inspect placeholder text |
| **S2-001** | Voucher 30K biên 499K | Plan `PLAN_EXACT_499K` có thể **null** nếu không ghép đúng 499K từ sản phẩm hiện có → test bị skip | Kiểm tra: `106K×1 + 64K×1 + 100K×1 + 56K×1 + 116K×1 = 442K` → không ghép đúng 499K! **Cần thêm sản phẩm có giá khác vào cartData** |
| **S2-002** | Voucher 30K dưới biên | Tương tự, plan phụ thuộc vào cartData | |
| **S2-003** | Đồng thời Voucher + Freeship | Thiếu **mã Freeship cụ thể** (code) | Lên web → Popup KM → Tab Freeship → Copy attribute `coupon="..."` |
| **S2-005** | Gỡ bỏ voucher | Phụ thuộc S2-001 | |

---

## 🔴 NHÓM 3: Test Cases CẦN BỔ SUNG THÊM HTML / KHÔNG THỂ CHẠY Guest (5/28)

| TC ID | Tên | Vấn đề | Giải pháp |
|-------|-----|--------|-----------|
| **S4-001** | Tính tổng F-Point + Voucher + Ship | **Cần đăng nhập** để có F-Point. Chưa biết selector chính xác của checkbox/input F-Point | 1. Bạn đăng nhập → vào Checkout → Inspect block "Thành viên Fahasa" → gửi HTML block đó cho tôi |
| **S4-002** | F-Point vượt số dư | **Cần đăng nhập** + tài khoản có F-Point | Tương tự S4-001 |
| **S4-003** | Chọn PTTT online | Cần xác nhận **id chính xác** của các radio PTTT: `zalopay`, `vnpay`, `momo`, `shopeepay`, `banktransfer` | Lên web → Checkout → Inspect các radio button PTTT → copy `value` attribute |
| **S4-005** | Phí ship đổi khu vực | Thiếu **Quận/Huyện + Phường/Xã cho Hà Giang** | Lên web → Chọn Hà Giang → copy tên Quận/Huyện + Phường/Xã đầu tiên |
| **S5-001** | Chọn quà tặng | Chưa biết **selector chính xác** của block quà tặng + cách chọn quà | Lên web → Checkout với đơn lớn → Inspect block "Nhận quà" → gửi HTML |

---

## 📋 DANH SÁCH THÔNG TIN CẦN BỔ SUNG (Ưu tiên)

### 🔥 Ưu tiên cao (ảnh hưởng nhiều test cases)

> [!IMPORTANT]
> **1. Selector chính xác các Radio Button phương thức thanh toán**
> Lên web Checkout → Inspect phần "Phương thức thanh toán" → Gửi cho tôi `id` hoặc `value` của từng radio:
> - COD, ZaloPay, VNPAY, ShopeePay, Momo, ATM
> 
> Ví dụ hiện tại tôi dùng: `#fhs_checkout_paymentmethod_vnpay` — cần xác nhận có đúng không.

> [!IMPORTANT]
> **2. HTML block "Thành viên Fahasa" (F-Point)**
> Cần HTML của phần checkbox + input nhập F-Point để tôi viết selector chính xác.

> [!IMPORTANT]
> **3. Data Quận/Huyện + Phường/Xã cho Hà Giang**
> Lên web → Chọn Tỉnh = Hà Giang → Ghi lại tên 1 Quận/Huyện + 1 Phường/Xã để điền vào `checkout.data.ts`.

### ⚡ Ưu tiên trung bình

> [!NOTE]
> **4. Mã Freeship cụ thể (coupon code)**
> Trong popup KM → Tab Freeship → Copy giá trị attribute `coupon="..."` của 1 mã Freeship đang matched.

> [!NOTE]
> **5. Thêm sản phẩm vào `cartData` để ghép đúng 499K**
> Hiện tại các sản phẩm: 106K, 64K, 100K, 56K, 116K — không ghép được chính xác 499K.
> Cần thêm 1 sản phẩm có giá chia hết cho 1K để dễ ghép (VD: 57K, hoặc 73K).
> Hoặc cho tôi biết 1 sản phẩm có giá ~ 57,000đ trên Fahasa.

> [!NOTE]
> **6. HTML block "Nhận quà" (Gift)**
> Nếu bạn thấy block "Nhận quà (0/1)" trên trang Checkout, inspect và gửi HTML cho tôi.

---

## Tóm tắt trạng thái

```
✅ Sẵn sàng chạy:   16/28 (57%)
⚠️ Cần bổ sung data: 7/28 (25%)
🔴 Cần HTML/Login:   5/28 (18%)
```
