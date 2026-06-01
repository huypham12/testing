# TÀI LIỆU ĐẶC TẢ KIỂM THỬ (TEST SPECIFICATION)

# TÍNH NĂNG CHECKOUT E-COMMERCE (BẢN CẬP NHẬT)

---

# 1. Phạm vi kiểm thử (Test Scope)

## Thuộc phạm vi kiểm thử (In-scope)

- Luồng chuyển tiếp từ Giỏ hàng sang trang Thanh toán (Checkout).
- Quản lý địa chỉ giao hàng:
  - Thêm mới
  - Cập nhật / Sửa
  - Thay đổi địa chỉ
  - Logic Dropdown Tỉnh/Thành

- Quản lý Khuyến mãi:
  - Voucher
  - Freeship
  - Gift Card
  - Điểm thưởng F-Point

- Biểu mẫu Yêu cầu xuất hóa đơn GTGT:
  - Validation
  - Happy Path cho Cá nhân & Doanh nghiệp

- Thuật toán tính tổng tiền:
  - Tiền hàng
  - Phí Ship
  - Khuyến mãi
  - Điểm F-Point

- Chức năng Đặt hàng với phương thức thanh toán COD.

---

## Không thuộc phạm vi kiểm thử (Out-of-scope)

- Xử lý giao dịch tại cổng thanh toán của bên thứ 3:
  - ZaloPay
  - VNPAY
  - Momo
  - Cổng thẻ quốc tế

- Thêm, sửa, xóa sản phẩm trong Giỏ hàng (thuộc feature Cart).
- Performance Testing.
- Security Testing.
- API Testing.

---

# 2. Danh sách Kịch bản và Test Case chi tiết

---

# SCENARIO 1: Quản lý thông tin Địa chỉ giao hàng

## Mục tiêu kiểm thử

Đảm bảo hệ thống xử lý đúng:

- Luồng thêm mới địa chỉ
- Luồng cập nhật địa chỉ
- Ràng buộc dữ liệu đầu vào
- Logic liên kết giữa các trường địa lý

---

## Kỹ thuật áp dụng

- Equivalence Partitioning (EP)
- Error Guessing (EG)

---

## Giả định nghiệp vụ (Business Rule)

- Các trường có dấu `*` hoặc bắt buộc ngầm định:
  - Tên
  - SĐT
  - Tỉnh/Thành
  - Quận/Huyện
  - Phường/Xã
  - Địa chỉ chi tiết

  → Không được để trống.

- Số điện thoại:
  - Đúng định dạng VN
  - 10 số
  - Bắt đầu bằng số `0`

- Dropdown:
  - Tỉnh/Thành
  - Quận/Huyện
  - Phường/Xã

  có tính liên kết cascaded:
  - Quận/Huyện phụ thuộc vào Tỉnh/Thành được chọn.

---

## Test Cases

---

### TC_ADD_01 — Thêm địa chỉ mới thành công với dữ liệu hợp lệ

| Thuộc tính          | Nội dung                                                                                                                                                                                                                    |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Pre-condition**   | User ở trang Checkout, đang mở popup "Thêm mới địa chỉ giao hàng"                                                                                                                                                           |
| **Test Data**       | Tên: Nguyễn Văn A <br> SĐT: 0378416504 <br> Quốc gia: Việt Nam <br> Tỉnh: Hà Nội <br> Quận: Hoàn Kiếm <br> Phường: Cửa Đông <br> Địa chỉ: 160 Đ. Tân Triều                                                                  |
| **Steps**           | 1. Nhập toàn bộ Test Data. <br> 2. Click nút "Lưu địa chỉ".                                                                                                                                                                 |
| **Expected Result** | Popup đóng lại. <br><br> Địa chỉ mới được hiển thị làm địa chỉ giao hàng mặc định trên UI. <br><br> Khối "Phương thức vận chuyển" update phí ship tương ứng với địa chỉ mới. <br><br> Tổng tiền thay đổi theo phí ship mới. |

---

### TC_ADD_02 — Báo lỗi khi bỏ trống một trường bắt buộc (EP)

| Thuộc tính          | Nội dung                                                                                                                                                                |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Pre-condition**   | User đang mở popup "Thêm mới địa chỉ giao hàng"                                                                                                                         |
| **Test Data**       | Nhập đủ thông tin nhưng bỏ trống trường "Họ và tên người nhận"                                                                                                          |
| **Steps**           | 1. Nhập các dữ liệu hợp lệ trừ trường Họ tên. <br> 2. Click nút "Lưu địa chỉ".                                                                                          |
| **Expected Result** | Field "Họ và tên người nhận" bị highlight đỏ. <br><br> Hiển thị text lỗi "Vui lòng nhập thông tin này" ngay dưới trường. <br><br> Popup không đóng, không cho phép lưu. |

---

### TC_ADD_03 — Validate định dạng số điện thoại sai (EP)

| Thuộc tính          | Nội dung                                                                                                               |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| **Pre-condition**   | User đang mở popup "Thêm mới địa chỉ giao hàng"                                                                        |
| **Test Data**       | SĐT: `037841650` (9 số)                                                                                                |
| **Steps**           | 1. Nhập đủ thông tin, riêng SĐT nhập Test Data. <br> 2. Click "Lưu địa chỉ".                                           |
| **Expected Result** | Hệ thống highlight đỏ field SĐT. <br><br> Hiển thị text lỗi "Số điện thoại không hợp lệ". <br><br> Không cho phép lưu. |

---

### TC_ADD_04 — Kiểm tra logic liên kết (Cascaded) của Dropdown địa lý

| Thuộc tính          | Nội dung                                                                                                                                                                  |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Pre-condition**   | User đang mở popup "Thêm mới địa chỉ giao hàng"                                                                                                                           |
| **Test Data**       | Tỉnh/Thành: "Hà Nội"                                                                                                                                                      |
| **Steps**           | 1. Chọn Tỉnh/Thành phố là "Hà Nội". <br> 2. Click mở dropdown "Quận/Huyện".                                                                                               |
| **Expected Result** | Dropdown "Quận/Huyện" chỉ load và hiển thị danh sách các quận/huyện thuộc Hà Nội (Hoàn Kiếm, Ba Đình, Đống Đa...). <br><br> Các quận/huyện của tỉnh khác không xuất hiện. |

---

### TC_ADD_05 — Cập nhật (Sửa) thông tin địa chỉ đã lưu

| Thuộc tính          | Nội dung                                                                                                                                                                                                |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Pre-condition**   | User có ít nhất 1 địa chỉ đã lưu. Đang ở trang Checkout                                                                                                                                                 |
| **Test Data**       | Phường/Xã mới: "Hàng Bông"                                                                                                                                                                              |
| **Steps**           | 1. Click nút "Sửa" kế bên địa chỉ đang chọn. <br> 2. Thay đổi giá trị "Phường/Xã" sang Test Data. <br> 3. Click "Lưu địa chỉ".                                                                          |
| **Expected Result** | Popup đóng. <br><br> Block "Địa chỉ giao hàng" cập nhật dòng text địa chỉ hiển thị "Phường Hàng Bông". <br><br> Hệ thống tự động tính lại Phí giao hàng (nếu có chênh lệch) và cập nhật "Tổng Số Tiền". |

---

# SCENARIO 2: Quản lý Khuyến mãi, Gift Card và F-Point

## Mục tiêu kiểm thử

Xác minh:

- Logic áp dụng tổ hợp các loại mã giảm giá
- Giới hạn điều kiện tiền tệ
- Xử lý mã không hợp lệ

---

## Kỹ thuật áp dụng

- Boundary Value Analysis (BVA)
- Decision Table Testing

---

## Giả định nghiệp vụ (Business Rule)

- Mã `Giảm 30K` chỉ áp dụng cho đơn hàng có tổng giá trị sản phẩm từ `499,000đ` trở lên.
- Tối đa:
  - 1 Voucher
  - 1 Freeship

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

### TC_VOU_01 — Áp dụng Voucher 30k với giá trị đơn hàng ĐÚNG BẰNG điều kiện biên (BVA)

| Thuộc tính          | Nội dung                                                                                                       |
| ------------------- | -------------------------------------------------------------------------------------------------------------- |
| **Pre-condition**   | Giỏ hàng có tổng giá trị sản phẩm chính xác là 499,000đ                                                        |
| **Test Data**       | Chọn voucher "Mã Giảm 30K - Đơn hàng từ 499k"                                                                  |
| **Steps**           | 1. Mở popup "Chọn mã khuyến mãi". <br> 2. Click nút "Áp dụng" trên voucher Test Data. <br> 3. Đóng popup.      |
| **Expected Result** | Nút "Áp dụng" chuyển thành "Đã áp dụng". <br><br> Block "Kiểm tra lại đơn hàng" hiển thị "Giảm giá: -30.000đ". |

---

### TC_VOU_02 — Áp dụng Voucher 30k với giá trị đơn hàng DƯỚI điều kiện biên (BVA)

| Thuộc tính          | Nội dung                                                                                                          |
| ------------------- | ----------------------------------------------------------------------------------------------------------------- |
| **Pre-condition**   | Giỏ hàng có tổng giá trị sản phẩm là 498,000đ                                                                     |
| **Test Data**       | Chọn voucher "Mã Giảm 30K - Đơn hàng từ 499k"                                                                     |
| **Steps**           | 1. Mở popup "Chọn mã khuyến mãi". <br> 2. Quan sát trạng thái của voucher Test Data.                              |
| **Expected Result** | Voucher bị mờ/disable. <br><br> Nút thao tác hiển thị "Mua thêm 1,000đ". <br><br> Không thể click để chọn mã này. |

---

### TC_VOU_03 — Kiểm tra áp dụng đồng thời Voucher và Freeship (Rule 1 - Decision Table)

| Thuộc tính          | Nội dung                                                                                                                                                                                         |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Pre-condition**   | Giỏ hàng đủ điều kiện áp dụng cả 2 mã                                                                                                                                                            |
| **Test Data**       | Mã 1: Voucher giảm 30k <br><br> Mã 2: Freeship 15k                                                                                                                                               |
| **Steps**           | 1. Mở popup "Chọn mã khuyến mãi". <br> 2. Click "Áp dụng" cho Mã 1. <br> 3. Click "Áp dụng" cho Mã 2. <br> 4. Đóng popup.                                                                        |
| **Expected Result** | Cả 2 mã chuyển trạng thái "Đã áp dụng". <br><br> UI chi tiết giá hiển thị 2 dòng: <br> - "Giảm giá: -30.000đ" <br> - "Giảm giá vận chuyển: -15.000đ" <br><br> Tổng tiền được khấu trừ tương ứng. |

---

### TC_VOU_04 — Báo lỗi khi nhập Gift Card đã hết hạn/hết lượt sử dụng

| Thuộc tính          | Nội dung                                                                                                                                                             |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Pre-condition**   | User đang ở trang Checkout                                                                                                                                           |
| **Test Data**       | Mã Gift Card: `EXPIRED2025`                                                                                                                                          |
| **Steps**           | 1. Tại ô "Mã khuyến mãi / Gift Card", nhập Test Data. <br> 2. Click nút "Áp dụng".                                                                                   |
| **Expected Result** | Ô nhập liệu viền đỏ. <br><br> Hiển thị text báo lỗi "Mã giảm giá đã hết hạn hoặc hết lượt sử dụng". <br><br> Không có khoản giảm trừ nào được ghi nhận vào hệ thống. |

---

# SCENARIO 3: Yêu cầu Xuất hóa đơn GTGT (VAT)

## Mục tiêu kiểm thử

Kiểm tra:

- Sự chuyển đổi trạng thái của biểu mẫu
- Validation các trường bắt buộc
- Luồng điền dữ liệu thành công cho từng loại đối tượng

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

### TC_VAT_01 — Chuyển đổi trạng thái biểu mẫu Hóa đơn (State Transition)

| Thuộc tính          | Nội dung                                                                                                                                                                                                                              |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Pre-condition**   | User ở trang Checkout, đang ở phần "Thông tin khác"                                                                                                                                                                                   |
| **Test Data**       | N/A                                                                                                                                                                                                                                   |
| **Steps**           | 1. Click checkbox "Xuất hóa đơn GTGT". <br> 2. Click radio "Doanh nghiệp". <br> 3. Bỏ check "Xuất hóa đơn GTGT".                                                                                                                      |
| **Expected Result** | Mở checkbox: Form xuất hiện, Radio "Cá nhân" được chọn. <br><br> Click Doanh nghiệp: UI thay đổi hiển thị các trường của Doanh nghiệp (Tên DN, MST...). <br><br> Bỏ checkbox: Toàn bộ form ẩn đi, data đã nhập tạm thời bị xóa/reset. |

---

### TC_VAT_02 — Báo lỗi khi bỏ trống MST trong form Doanh nghiệp (EP)

| Thuộc tính          | Nội dung                                                                                                                                                                         |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Pre-condition**   | Đã check "Xuất hóa đơn GTGT", chọn "Doanh nghiệp"                                                                                                                                |
| **Test Data**       | Bỏ trống "Mã số thuế". Nhập đủ các trường còn lại.                                                                                                                               |
| **Steps**           | 1. Kéo xuống click nút "Xác nhận thanh toán" (để submit form).                                                                                                                   |
| **Expected Result** | Hệ thống chặn thao tác đặt hàng. <br><br> Màn hình tự động scroll về vị trí form hóa đơn. <br><br> Trường "Mã số thuế" bị highlight đỏ kèm thông báo "Vui lòng nhập Mã số thuế". |

---

### TC_VAT_03 — Validate Email nhận hóa đơn sai định dạng (EP)

| Thuộc tính          | Nội dung                                                                                                 |
| ------------------- | -------------------------------------------------------------------------------------------------------- |
| **Pre-condition**   | Đang ở form VAT "Cá nhân"                                                                                |
| **Test Data**       | Email: `user@domain` (Thiếu .com)                                                                        |
| **Steps**           | 1. Nhập đủ thông tin hợp lệ, riêng Email nhập Test Data. <br> 2. Click "Xác nhận thanh toán".            |
| **Expected Result** | Hệ thống chặn đặt hàng. <br><br> Trường Email highlight đỏ kèm thông báo "Định dạng email không hợp lệ". |

---

### TC_VAT_04 — Luồng Happy Path xuất hóa đơn Cá nhân

| Thuộc tính          | Nội dung                                                                                                                                                                     |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Pre-condition**   | Đã check "Xuất hóa đơn GTGT", chọn "Cá nhân"                                                                                                                                 |
| **Test Data**       | Họ tên: Nguyễn B <br> Địa chỉ: Số 1 Lê Lợi <br> CCCD: 001099001122 <br> Email: [test@gmail.com](mailto:test@gmail.com)                                                       |
| **Steps**           | 1. Nhập toàn bộ Test Data. <br> 2. Click "Xác nhận thanh toán".                                                                                                              |
| **Expected Result** | Chấp nhận dữ liệu form hóa đơn. <br><br> Chuyển tiếp sang xử lý Đặt hàng thành công. <br><br> Thông tin yêu cầu xuất hóa đơn cá nhân được lưu vào hệ thống cho đơn hàng này. |

---

### TC_VAT_05 — Luồng Happy Path xuất hóa đơn Doanh nghiệp

| Thuộc tính          | Nội dung                                                                                                                                      |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| **Pre-condition**   | Đã check "Xuất hóa đơn GTGT", chọn "Doanh nghiệp"                                                                                             |
| **Test Data**       | Tên DN: Công ty TNHH A <br> Địa chỉ DN: Tòa X <br> MST: 0101234567 <br> Email: [admin@ctya.vn](mailto:admin@ctya.vn)                          |
| **Steps**           | 1. Nhập toàn bộ Test Data. <br> 2. Click "Xác nhận thanh toán".                                                                               |
| **Expected Result** | Chấp nhận dữ liệu. <br><br> Chuyển tiếp sang xử lý Đặt hàng thành công. <br><br> Thông tin xuất hóa đơn doanh nghiệp được lưu trữ thành công. |

---

# SCENARIO 4: Tính toán tổng tiền và Đặt hàng

## Mục tiêu kiểm thử

Xác nhận:

- Hệ thống tính toán chính xác số tiền cuối cùng
- Thực hiện hành động đặt hàng

---

## Kỹ thuật áp dụng

- Use Case Testing

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

- Payment Method mặc định:
  - COD
  - "Thanh toán bằng tiền mặt khi nhận hàng"

---

## Test Cases

---

### TC_ORD_01 — Luồng mua hàng thành công (Happy Path COD cơ bản)

| Thuộc tính          | Nội dung                                                                                                                                                               |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Pre-condition**   | Giỏ hàng có sản phẩm, đã chọn địa chỉ, không áp mã, không xuất hóa đơn                                                                                                 |
| **Test Data**       | N/A                                                                                                                                                                    |
| **Steps**           | 1. Ở mục "Phương thức thanh toán", giữ nguyên COD. <br> 2. Click "Xác nhận thanh toán".                                                                                |
| **Expected Result** | UI hiển thị overlay xử lý giao dịch. <br><br> Redirect sang trang "Đặt hàng thành công" với trạng thái đơn hàng là Chờ xác nhận và Phương thức thanh toán là Tiền mặt. |

---

### TC_ORD_02 — Kiểm tra tích hợp thuật toán tính Tổng tiền với F-Point, Voucher và Phí ship

| Thuộc tính          | Nội dung                                                                                                                                                                       |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Pre-condition**   | Giỏ hàng: 240,000đ <br><br> Phí ship: 22,000đ <br><br> Voucher: -30,000đ <br><br> User có số dư 50,000 F-point                                                                 |
| **Test Data**       | Nhập sử dụng `10000` F-point                                                                                                                                                   |
| **Steps**           | 1. Tại block "Thành viên Fahasa", check box "Dùng Fpoint để thanh toán". <br> 2. Nhập số F-point theo Test Data. <br> 3. Kiểm tra block "Tổng Số Tiền".                        |
| **Expected Result** | Hệ thống trừ ngay lập tức vào tổng số tiền. <br><br> Dòng tính toán hiển thị chi tiết: <br> `240,000 + 22,000 - 30,000 - 10,000` <br><br> Tổng số tiền cuối cùng = `222,000đ`. |

---

### TC_ORD_03 — Validate khi nhập F-Point vượt quá số dư hiện có

| Thuộc tính          | Nội dung                                                                                                                                                                            |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Pre-condition**   | User có số dư 5,000 F-point                                                                                                                                                         |
| **Test Data**       | Nhập sử dụng `10000` F-point                                                                                                                                                        |
| **Steps**           | 1. Check box "Dùng Fpoint". <br> 2. Nhập số lượng F-point theo Test Data.                                                                                                           |
| **Expected Result** | Hệ thống tự động cap (chặn) giá trị. <br><br> Field text tự nhảy về số dư tối đa là `5000` hoặc hiển thị lỗi "Số F-Point không đủ". <br><br> Tổng tiền chỉ được giảm tối đa 5,000đ. |

---

# 3. Ma trận theo dõi Kỹ thuật kiểm thử (Testing Techniques Matrix)

| Kỹ thuật Thiết kế (ISTQB)         | Kịch bản áp dụng       | Mục đích sử dụng                                                                                                                                                                              |
| --------------------------------- | ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Equivalence Partitioning (EP)** | Scenario 1, Scenario 3 | Phân vùng các tập dữ liệu hợp lệ (10 số đt, format email đúng) và không hợp lệ (chuỗi thiếu/thiếu trường bắt buộc) để đảm bảo bao phủ Validation Data với số lượng Test Case tối ưu nhất.     |
| **Boundary Value Analysis (BVA)** | Scenario 2             | Bắt chính xác tại điểm cận biên của điều kiện logic (đơn hàng đúng `499,000đ` và `498,000đ`). Phát hiện lỗi sai sót toán tử (`>` thay vì `>=`) trong source code của Developer.               |
| **Error Guessing (EG)**           | Scenario 1, Scenario 2 | Sử dụng kinh nghiệm kiểm thử để tấn công các rủi ro phổ biến như: Nhập số điện thoại thiếu chữ số, dùng Gift Card đã hết hạn/sử dụng hết.                                                     |
| **State Transition Testing**      | Scenario 3             | Kiểm soát vòng đời và sự thay đổi của Form Hóa Đơn khi thao tác người dùng kích hoạt các event khác nhau (Checked/Unchecked, chuyển đổi trạng thái Cá nhân/Doanh nghiệp).                     |
| **Decision Table Testing**        | Scenario 2             | Giải quyết và kiểm tra toàn diện các tổ hợp điều kiện khi kết hợp 2 loại mã (Voucher SP và Freeship). Đảm bảo rule nghiệp vụ không bị conflict khi user áp dụng nhiều loại discount cùng lúc. |
| **Use Case Testing**              | Scenario 4             | Đóng vai trò người dùng cuối (End-User) để thực hiện luồng tích hợp (End-to-End) qua tất cả các bước chuẩn bị, nhằm đạt được mục tiêu chung là tạo đơn đặt hàng thành công.                   |
