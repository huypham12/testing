# TÀI LIỆU ĐẶC TẢ KIỂM THỬ (TEST SPECIFICATION) - TÍNH NĂNG GIỎ HÀNG (CART)

---

# 1. Phạm vi kiểm thử (Test Scope)

## Thuộc phạm vi kiểm thử (In-scope)

- Thêm sản phẩm vào giỏ hàng (Guest & User).
- Quản lý trạng thái chọn/bỏ chọn sản phẩm (Checkbox).
- Cập nhật số lượng sản phẩm và xử lý các giá trị biên của tồn kho.
- Xóa sản phẩm đơn lẻ và toàn bộ.
- Tính toán tổng tiền tạm tính dựa trên logic Checkbox.
- Khuyến mãi cơ bản (Tiến trình Freeship, Áp dụng mã giảm giá) liên kết với tổng tiền.
- Quản lý phiên làm việc (Session), đồng bộ dữ liệu khi đăng nhập và xử lý lỗi tương tranh (Concurrency/Backend sync).

---

## Không thuộc phạm vi kiểm thử (Out-of-scope)

- Luồng thanh toán (Checkout Process / Payment Gateway).
- Quản lý và điều chỉnh kho hàng (Inventory Management) phía Admin.
- Tích hợp và cấu hình chiến dịch khuyến mãi (Promotion Setup).

---

# 2. Danh sách Kịch bản và Test Case chi tiết

---

# SCENARIO 1: Thêm sản phẩm vào giỏ hàng và Xử lý tương tranh

## Mục tiêu kiểm thử

Đảm bảo người dùng có thể thêm các sản phẩm với trạng thái tồn kho khác nhau vào giỏ hàng, đồng thời hệ thống xử lý chính xác các trường hợp ngoại lệ từ máy chủ.

---

## Kỹ thuật áp dụng

- Equivalence Partitioning (EP)
- Error Guessing

---

## Giả định nghiệp vụ (Business Rule)

- Nút "Thêm vào giỏ" ở trang danh sách/chi tiết mặc định thêm `Quantity = 1`.
- Sản phẩm thêm thành công sẽ hiển thị thông báo và mặc định được tick chọn (Checkbox = true).
- Sản phẩm hết hàng không được phép thêm (Nút bị disable).

---

## Test Cases

---

### TC_001 — Thêm 1 sản phẩm mới vào giỏ trống

| Thuộc tính        | Nội dung                                                  |
| ----------------- | --------------------------------------------------------- |
| **Pre-condition** | Giỏ hàng hiện tại đang trống. Sản phẩm A có tồn kho = 10. |
| **Test Data**     | Sản phẩm A (Giá: 43.000đ)                                 |
| **Steps**         | 1. Nhấn nút "Thêm giỏ hàng" tại Sản phẩm A.<br>           |

<br>2. Truy cập vào trang Giỏ hàng để kiểm tra. |
| **Expected Result** | - Hiển thị popup/toast: "Sản phẩm đã được thêm vào giỏ hàng".<br>

<br>- Sản phẩm A xuất hiện trong giỏ với Số lượng = 1.<br>

<br>- Checkbox của Sản phẩm A tự động được tick.<br>

<br>- Dòng "Thành tiền" cập nhật đúng 43.000đ. |

---

### TC_002 — Thêm sản phẩm đã tồn tại trong giỏ

| Thuộc tính        | Nội dung                                                |
| ----------------- | ------------------------------------------------------- |
| **Pre-condition** | Giỏ hàng đã có Sản phẩm A (Số lượng = 1). Tồn kho = 10. |
| **Test Data**     | Sản phẩm A                                              |
| **Steps**         | 1. Quay lại trang chi tiết Sản phẩm A.<br>              |

<br>2. Nhấn nút "Thêm giỏ hàng" lần 2.<br>

<br>3. Truy cập vào trang Giỏ hàng. |
| **Expected Result** | - Hệ thống không tạo dòng record sản phẩm mới.<br>

<br>- Số lượng của Sản phẩm A trong giỏ tự động tăng từ 1 lên 2.<br>

<br>- "Thành tiền" cập nhật thành 86.000đ (43.000đ \* 2). |

---

### TC_003 — Thêm sản phẩm ở trạng thái Hết hàng

| Thuộc tính        | Nội dung                                   |
| ----------------- | ------------------------------------------ |
| **Pre-condition** | Sản phẩm B có tồn kho = 0 trên hệ thống.   |
| **Test Data**     | Sản phẩm B                                 |
| **Steps**         | 1. Truy cập trang chi tiết Sản phẩm B.<br> |

<br>2. Quan sát trạng thái nút thêm vào giỏ. |
| **Expected Result** | - Nút mua hàng bị vô hiệu hóa (Disabled), màu sắc chuyển xám.<br>

<br>- Text trên nút thay đổi thành "Hết hàng".<br>

<br>- Không thể click để gọi API thêm. |

---

### TC_004 — Xử lý ngoại lệ Server Timeout khi thêm sản phẩm

| Thuộc tính        | Nội dung                                                                           |
| ----------------- | ---------------------------------------------------------------------------------- |
| **Pre-condition** | Mạng hoặc Server Backend xử lý chậm/mất kết nối (Mô phỏng ngắt mạng khi call API). |
| **Test Data**     | Sản phẩm C                                                                         |
| **Steps**         | 1. Nhấn "Thêm giỏ hàng" tại Sản phẩm C.<br>                                        |

<br>2. Hệ thống frontend gửi request nhưng backend không phản hồi trong 30s. |
| **Expected Result** | - Giao diện hiển thị loading spinner trong thời gian chờ.<br>

<br>- Sau 30s, hiển thị thông báo lỗi màu đỏ: "Kết nối máy chủ bị gián đoạn, vui lòng thử lại sau". |

---

# SCENARIO 2: Chọn / Bỏ chọn sản phẩm (Checkbox) và Tính toán

## Mục tiêu kiểm thử

Đảm bảo tổng tiền chỉ được tính toán chính xác dựa trên các sản phẩm có trạng thái Checkbox được tick chọn.

---

## Kỹ thuật áp dụng

- Use Case Testing
- Decision Table Testing

---

## Giả định nghiệp vụ (Business Rule)

- Tiền "Tạm tính" = Tổng `(Giá bán * Số lượng)` của các sản phẩm có Checkbox = Ticked.
- Bỏ tick sản phẩm sẽ loại trừ giá trị của sản phẩm đó khỏi Tổng tiền.
- Chức năng "Chọn tất cả" sẽ tick đồng loạt các sản phẩm có trong giỏ.

---

## Test Cases

---

### TC_005 — Tính tổng tiền khi chọn toàn bộ sản phẩm

| Thuộc tính        | Nội dung                                                          |
| ----------------- | ----------------------------------------------------------------- |
| **Pre-condition** | Giỏ hàng có 3 sản phẩm đều đang ở trạng thái KHÔNG được chọn:<br> |

<br>- SP A (194.600đ, SL: 5)<br>

<br>- SP B (60.000đ, SL: 2)<br>

<br>- SP C (43.000đ, SL: 1) |
| **Test Data** | Checkbox "Chọn tất cả" |
| **Steps** | 1. Tick vào ô Checkbox "Chọn tất cả (3 sản phẩm)" ở trên cùng danh sách.<br>

<br>2. Kiểm tra trạng thái các item và số tiền. |
| **Expected Result** | - Checkbox của SP A, B, C đồng loạt chuyển sang trạng thái đã chọn.<br>

<br>- Dòng "Thành tiền" = `(194.600 * 5) + (60.000 * 2) + (43.000 * 1) = 1.136.000đ`.<br>

<br>- Nút "Mua hàng" sáng lên. |

---

### TC_006 — Tính tổng tiền khi bỏ chọn một sản phẩm

| Thuộc tính        | Nội dung                                                                 |
| ----------------- | ------------------------------------------------------------------------ |
| **Pre-condition** | Giỏ hàng đang được tick "Chọn tất cả" với SP A, B, C (Tổng: 1.136.000đ). |
| **Test Data**     | Bỏ tick Sản phẩm C (43.000đ)                                             |
| **Steps**         | 1. Click vào Checkbox của SP C để bỏ chọn.<br>                           |

<br>2. Kiểm tra trạng thái UI. |
| **Expected Result** | - Checkbox "Chọn tất cả" ở phía trên tự động chuyển sang trạng thái bỏ chọn (Unticked).<br>

<br>- SP C bị loại khỏi phép tính.<br>

<br>- Dòng "Thành tiền" giảm trừ 43.000đ, hiển thị = `1.093.000đ`. |

---

# SCENARIO 3: Cập nhật số lượng sản phẩm (Phân tích giá trị biên)

## Mục tiêu kiểm thử

Kiểm tra giới hạn số lượng sản phẩm thông qua input hợp lệ và không hợp lệ dựa trên quy tắc phân tích biên.

---

## Kỹ thuật áp dụng

- Boundary Value Analysis (BVA)
- Equivalence Partitioning (EP)

---

## Giả định nghiệp vụ (Business Rule)

- Tồn kho thực tế (Stock) giả định trong kịch bản = 5.
- Giá trị biên hợp lệ (Valid Boundaries): `1` (Cận dưới), `5` (Cận trên).
- Giá trị biên không hợp lệ (Invalid Boundaries): `0` (Dưới cận dưới), `6` (Trên cận trên).

---

## Test Cases

---

### TC_008 — Nhập số lượng bằng Giá trị biên trên hợp lệ (Qty = 5)

| Thuộc tính        | Nội dung                                          |
| ----------------- | ------------------------------------------------- |
| **Pre-condition** | SP A trong giỏ, Stock = 5, Số lượng hiện tại = 1. |
| **Test Data**     | Input = `5`                                       |
| **Steps**         | 1. Click vào ô số lượng của SP A.<br>             |

<br>2. Xóa số hiện tại, nhập số `5`.<br>

<br>3. Click chuột ra ngoài khoảng trống (blur) để áp dụng. |
| **Expected Result** | - Giao diện chấp nhận số 5.<br>

<br>- Tổng tiền cập nhật chính xác (Giá \* 5).<br>

<br>- Nút cộng (+) bị vô hiệu hóa (disable) do đã đạt tối đa tồn kho. |

---

### TC_009 — Nhập số lượng vượt Giá trị biên trên (Qty = 6)

| Thuộc tính        | Nội dung                                                                  |
| ----------------- | ------------------------------------------------------------------------- |
| **Pre-condition** | SP A trong giỏ, Stock = 5, Số lượng hiện tại = 5.                         |
| **Test Data**     | Input = `6`                                                               |
| **Steps**         | 1. Cố ý nhập số `6` vào ô input (hoặc gọi API trực tiếp nếu UI chặn).<br> |

<br>2. Click chuột ra ngoài để áp dụng. |
| **Expected Result** | - Hệ thống không tính tiền cho giá trị dư.<br>

<br>- Hiển thị dòng chữ màu đỏ báo lỗi ngay dưới giá SP A: `* Số lượng yêu cầu cho 6 không có sẵn.`<br>

<br>- Ô input tự động reset lại giá trị `5` (giá trị Max hợp lệ) sau khi reload. |

---

### TC_010 — Nhập số lượng bằng Giá trị biên dưới không hợp lệ (Qty = 0)

| Thuộc tính        | Nội dung                                     |
| ----------------- | -------------------------------------------- |
| **Pre-condition** | SP A trong giỏ, Số lượng hiện tại = 1.       |
| **Test Data**     | Input = `0`                                  |
| **Steps**         | 1. Xóa số 1, nhập số `0` vào ô số lượng.<br> |

<br>2. Bấm ra ngoài khoảng trống. |
| **Expected Result** | - Hệ thống từ chối giá trị 0.<br>

<br>- Input tự động thiết lập lại giá trị thành `1` (giá trị Min hợp lệ).<br>

<br>- Nút trừ (-) bị vô hiệu hóa hoàn toàn khi giá trị đang là 1. |

---

### TC_011 — Nhập ký tự không hợp lệ (Chữ, Ký tự đặc biệt)

| Thuộc tính        | Nội dung                               |
| ----------------- | -------------------------------------- |
| **Pre-condition** | SP A trong giỏ, Số lượng hiện tại = 2. |
| **Test Data**     | Input = `abc`, `@#$`, `-5`             |
| **Steps**         | 1. Focus vào ô Số lượng.<br>           |

<br>2. Nhập các ký tự chữ, ký tự đặc biệt hoặc số âm. |
| **Expected Result** | - Form input sử dụng regex chặn trực tiếp, không cho nhập ký tự chữ/kí hiệu.<br>

<br>- Nếu paste data vào, hệ thống tự động xóa ký tự sai và trả về giá trị cũ là `2`. |

---

# SCENARIO 4: Áp dụng Khuyến mãi (Bảng quyết định - Decision Table)

## Mục tiêu kiểm thử

Đảm bảo module khuyến mãi (Freeship Bar và Mã Giảm Giá) xuất hiện và được tính toán đúng dựa trên điều kiện của TỔNG TIỀN.

---

## Kỹ thuật áp dụng

- Decision Table Testing

---

## Giả định nghiệp vụ (Business Rule)

Xây dựng Bảng quyết định dựa trên mốc Tổng tiền Tạm tính:

- Mốc 1: Đơn < 500k -> Không có gì.
- Mốc 2: 500k <= Đơn < 999k -> Kích hoạt trạng thái Miễn phí giao hàng.
- Mốc 3: Đơn >= 999k -> Miễn phí giao hàng VÀ đủ điều kiện áp dụng Voucher "Giảm 70k Toàn sàn".

---

## Test Cases

---

### TC_012 — Tổng tiền chưa đủ điều kiện khuyến mãi (Đơn < 500k)

| Thuộc tính        | Nội dung                                                      |
| ----------------- | ------------------------------------------------------------- |
| **Pre-condition** | Giỏ hàng đang tick chọn các SP có Tổng thành tiền = 400.000đ. |
| **Test Data**     | Đơn = 400.000đ                                                |
| **Steps**         | 1. Mở xem thanh tiến trình Freeship bên phải.<br>             |

<br>2. Mở popup danh sách Mã Khuyến Mãi. |
| **Expected Result** | - Thanh Freeship hiển thị chưa đầy (thông báo cần mua thêm 100.000đ để được freeship).<br>

<br>- Voucher 70k (cho đơn 999k) bị làm mờ, hiển thị trạng thái "Chưa đủ điều kiện".<br>

<br>- Nút "Áp dụng" mã bị disable. |

---

### TC_013 — Tổng tiền chỉ đạt điều kiện Freeship (500k <= Đơn < 999k)

| Thuộc tính        | Nội dung                                                      |
| ----------------- | ------------------------------------------------------------- |
| **Pre-condition** | Giỏ hàng đang tick chọn các SP có Tổng thành tiền = 600.000đ. |
| **Test Data**     | Đơn = 600.000đ                                                |
| **Steps**         | 1. Quan sát thanh tiến trình Freeship.<br>                    |

<br>2. Mở popup danh sách Mã Khuyến Mãi. |
| **Expected Result** | - Thanh Freeship đạt 100%, đổi màu xanh lác cây kèm text: "Miễn phí giao hàng cho đơn từ 500k trở lên!".<br>

<br>- Phí giao hàng trừ 0đ.<br>

<br>- Voucher 70k (cho đơn 999k) vẫn bị làm mờ và không thể áp dụng (thiếu 399k nữa). |

---

### TC_014 — Tổng tiền đạt toàn bộ điều kiện (Đơn >= 999k)

| Thuộc tính        | Nội dung                                                        |
| ----------------- | --------------------------------------------------------------- |
| **Pre-condition** | Giỏ hàng đang tick chọn các SP có Tổng thành tiền = 1.136.000đ. |
| **Test Data**     | Đơn = 1.136.000đ, thao tác Áp dụng mã 70k.                      |
| **Steps**         | 1. Quan sát thanh Freeship.<br>                                 |

<br>2. Mở popup danh sách mã, tìm mã "Giảm 70k Toàn sàn" (điều kiện 999k).<br>

<br>3. Bấm "Áp dụng". |
| **Expected Result** | - Thanh Freeship đạt 100%.<br>

<br>- Mã 70k hiển thị sáng màu, nút "Áp dụng" hoạt động.<br>

<br>- Sau khi bấm, popup đóng, phần tính tiền xuất hiện thêm dòng "Giảm giá" với giá trị `-70.000đ`.<br>

<br>- Tổng số tiền (gồm VAT) = `1.136.000đ - 70.000đ = 1.066.000đ`. |

---

# SCENARIO 5: Xóa sản phẩm khỏi giỏ hàng

## Mục tiêu kiểm thử

Kiểm tra sự thay đổi trạng thái của Giỏ hàng khi xóa phần tử đơn lẻ và khi giỏ rơi vào trạng thái rỗng hoàn toàn.

---

## Kỹ thuật áp dụng

- State Transition

---

## Giả định nghiệp vụ (Business Rule)

- Bấm nút Thùng rác xóa trực tiếp sản phẩm (Không hỏi lại).
- Nếu giỏ hàng không còn sản phẩm nào, tự động chuyển về giao diện Empty State.

---

## Test Cases

---

### TC_015 — Xóa 1 sản phẩm trong giỏ nhiều sản phẩm

| Thuộc tính          | Nội dung                                                      |
| ------------------- | ------------------------------------------------------------- |
| **Pre-condition**   | Giỏ hàng đang có SP A và SP B (Cả 2 đều đang được tick chọn). |
| **Test Data**       | Icon thùng rác của SP A                                       |
| **Steps**           | 1. Click vào icon Thùng rác (Delete) tại dòng Sản phẩm A.     |
| **Expected Result** | - Dòng Sản phẩm A bị xóa ngay lập tức khỏi giao diện.<br>     |

<br>- Sản phẩm B giữ nguyên vị trí, số lượng và trạng thái tick chọn.<br>

<br>- Tổng tiền tự động tính lại chỉ bao gồm tiền của Sản phẩm B. |

---

### TC_016 — Xóa sản phẩm cuối cùng (Empty State)

| Thuộc tính          | Nội dung                                         |
| ------------------- | ------------------------------------------------ |
| **Pre-condition**   | Giỏ hàng chỉ có duy nhất Sản phẩm B.             |
| **Test Data**       | Icon thùng rác                                   |
| **Steps**           | 1. Click vào icon Thùng rác tại dòng Sản phẩm B. |
| **Expected Result** | - Sản phẩm B bị xóa hoàn toàn.<br>               |

<br>- Giao diện giỏ hàng thay đổi sang trạng thái Empty State: hiển thị icon/hình minh họa giỏ rỗng.<br>

<br>- Hiển thị text "Chưa có sản phẩm nào" và nút "Tiếp tục mua sắm". |

---

# SCENARIO 6: Quản lý Session, Đồng bộ và Biến động tồn kho (Concurrency)

## Mục tiêu kiểm thử

Đảm bảo tính toàn vẹn của dữ liệu giỏ hàng qua các thao tác đăng nhập, hết hạn phiên và biến động tồn kho do user khác tác động.

---

## Kỹ thuật áp dụng

- Use Case Testing
- Error Guessing

---

## Giả định nghiệp vụ (Business Rule)

- Giỏ hàng của Khách (Guest) lưu qua Cookie/LocalStorage.
- Khi đăng nhập, giỏ của Guest sẽ gộp (merge) với giỏ hiện tại của Account trên Database.
- Khi reload, nếu tồn kho thực tế ở kho hệ thống < Số lượng đang chọn trong giỏ, tự động cập nhật cảnh báo.

---

## Test Cases

---

### TC_017 — Đồng bộ (Merge) giỏ hàng khi Đăng nhập tài khoản

| Thuộc tính        | Nội dung                                                         |
| ----------------- | ---------------------------------------------------------------- |
| **Pre-condition** | - User đang duyệt web dạng Khách (Guest), có SP A trong giỏ.<br> |

<br>- Account X trên Database trước đó đã lưu sẵn SP B trong giỏ. |
| **Test Data** | Đăng nhập Account X |
| **Steps** | 1. Từ trang Giỏ hàng có SP A, ấn Đăng nhập ở góc trên bên phải.<br>

<br>2. Nhập username/password cho Account X thành công.<br>

<br>3. Kiểm tra lại Giỏ hàng. |
| **Expected Result** | - Hệ thống đồng bộ thành công, không mất data của Guest.<br>

<br>- Giỏ hàng hiện tại chứa cả SP A và SP B.<br>

<br>- Nếu SP A và SP B trùng nhau, cộng dồn số lượng. |

---

### TC_018 — Tồn kho thực tế bị hụt do User khác mua hết

| Thuộc tính        | Nội dung                                                                              |
| ----------------- | ------------------------------------------------------------------------------------- |
| **Pre-condition** | User X đang có SP A (Số lượng = 3) trong giỏ. Tồn kho hệ thống hiện tại = 5.          |
| **Test Data**     | User Y mua hết hàng                                                                   |
| **Steps**         | 1. Ở một thiết bị khác, User Y chốt đơn và mua thành công 4 SP A (Tồn kho còn 1).<br> |

<br>2. Ở thiết bị của User X, F5 reload lại trang Giỏ hàng (Hoặc bấm Check-out). |
| **Expected Result** | - Hệ thống phát hiện sự chênh lệch (3 > 1).<br>

<br>- Tự động reset số lượng của User X về 1.<br>

<br>- Hiển thị thông báo đỏ dưới SP A: "Sản phẩm vừa có thay đổi về tồn kho, số lượng hiện tại chỉ còn 1". |

---

# 3. Ma trận theo dõi Kỹ thuật kiểm thử (Testing Techniques Matrix)

| Kỹ thuật Thiết kế (ISTQB)         | Kịch bản áp dụng | Mục đích sử dụng                                                                                                          |
| --------------------------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------- |
| **Equivalence Partitioning (EP)** | Scenario 1, 3    | Phân chia vùng dữ liệu đầu vào (số lượng hợp lệ, chuỗi không hợp lệ, thao tác hàng còn/hết) để hạn chế thừa test case.    |
| **Boundary Value Analysis (BVA)** | Scenario 3       | Xác định hành vi của hệ thống ở đúng điểm giới hạn tồn kho (Tồn kho Min=1, Max=5, Lỗi=0, 6) tránh tràn viền logic.        |
| **Decision Table Testing**        | Scenario 2, 4    | Quản lý các tổ hợp điều kiện logic phức tạp (Tích/Bỏ tích checkbox kết hợp với việc đạt các mốc freeship/khuyến mãi lớn). |
| **State Transition**              | Scenario 5       | Kiểm tra sự thay đổi trạng thái UI của Giỏ hàng từ Có chứa Item -> Xóa phần tử -> Trạng thái Rỗng (Empty State).          |
| **Use Case Testing**              | Scenario 2, 6    | Mô phỏng luồng hành vi của người dùng từ Guest đến khi Login và đồng bộ dữ liệu thực tế.                                  |
| **Error Guessing**                | Scenario 1, 6    | Vận dụng kinh nghiệm để dự đoán các lỗi Timeout kết nối mạng và biến động tồn kho tương tranh (Concurrency) giữa DB.      |
