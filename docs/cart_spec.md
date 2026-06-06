# TÀI LIỆU ĐẶC TẢ KIỂM THỬ (TEST SPECIFICATION) - CART TEST SUITE

---

# 1. Phạm vi kiểm thử (Test Scope)

## Thuộc phạm vi kiểm thử (In-scope)

- Thêm sản phẩm vào giỏ hàng với các trạng thái tồn kho và trạng thái giỏ khác nhau.
- Gộp dòng sản phẩm trùng SKU/variant thay vì tạo record mới.
- Chọn / bỏ chọn item và cập nhật subtotal theo trạng thái checkbox.
- Số lượng hợp lệ, invalid input, giá trị biên, và thay đổi tồn kho trong lúc đang thao tác.
- Xóa item, xóa item cuối cùng và chuyển sang empty state.
- Freeship / voucher theo ngưỡng subtotal, đặc biệt các mốc sát biên.
- Đồng bộ guest cart, merge khi đăng nhập, và xử lý session stale / concurrency.

---

## Không thuộc phạm vi kiểm thử (Out-of-scope)

- Luồng thanh toán và cổng thanh toán.
- Cấu hình chiến dịch promotion ở phía admin.
- Nghiệp vụ quản trị kho hàng.
- Thay đổi giá, tồn kho hoặc trạng thái sản phẩm từ phía server/admin.
- Can thiệp Local Storage/Cookie để giả lập dữ liệu giỏ hàng.

---

# 2. Danh sách Kịch bản và Test Case chi tiết

---

# SCENARIO 1: Thêm sản phẩm vào giỏ hàng và xử lý lỗi đồng thời

## Mục tiêu kiểm thử

Phát hiện lỗi ở luồng add-to-cart, đặc biệt tại điểm giao giữa trạng thái giỏ, tồn kho, idempotency và lỗi backend.

---

## Kỹ thuật áp dụng

- Equivalence Partitioning (EP)
- Error Guessing
- State Transition

---

## Giả định nghiệp vụ (Business Rule)

- Mỗi SKU/variant chỉ có một dòng trong giỏ; add trùng thì tăng số lượng.
- Khi thêm thành công, item được tick chọn mặc định nếu giỏ đang có ít nhất một item được chọn.
- Sản phẩm hết hàng phải disable nút thêm.
- Nút Add-to-cart phải có cơ chế Idempotency hoặc Debounce để chống spam request sinh rác dữ liệu.

---

## Test Cases

---

### TC-CART-S1-001 — Thêm mới một sản phẩm hợp lệ vào giỏ rỗng

| Thuộc tính          | Nội dung                                                                                                                                        |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| **Pre-condition**   | Giỏ hàng rỗng. SP A còn hàng, tồn kho = 10.                                                                                                     |
| **Test Data**       | SP A, giá 43.000đ                                                                                                                               |
| **Steps**           | 1. Nhấn nút thêm giỏ tại SP A.<br>2. Mở trang giỏ hàng.                                                                                         |
| **Expected Result** | - Item SP A xuất hiện đúng 1 dòng.<br>- Số lượng = 1.<br>- Item được tick chọn mặc định.<br>- Subtotal = 43.000đ.<br>- Không tạo bản ghi trùng. |

---

### TC-CART-S1-002 — Add trùng SKU phải tăng số lượng, không tạo dòng mới

| Thuộc tính          | Nội dung                                                                                                                                                         |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Pre-condition**   | Trong giỏ đã có SP A, số lượng = 1.                                                                                                                              |
| **Test Data**       | Click thêm lại SP A từ trang chi tiết hoặc danh sách.                                                                                                            |
| **Steps**           | 1. Thêm lại SP A lần 2.<br>2. Vào giỏ kiểm tra số lượng.                                                                                                         |
| **Expected Result** | - Không sinh thêm dòng mới cho SP A.<br>- Số lượng tăng từ 1 lên 2.<br>- Subtotal của SP A = 86.000đ.<br>- Nếu UI có badge/count tổng item, badge cập nhật đúng. |

---

### TC-CART-S1-003 — Thêm sản phẩm hết hàng phải bị chặn ở UI và API

| Thuộc tính          | Nội dung                                                                                                                                                                  |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Pre-condition**   | SP B có tồn kho = 0.                                                                                                                                                      |
| **Test Data**       | SP B                                                                                                                                                                      |
| **Steps**           | 1. Mở trang chi tiết SP B.<br>2. Quan sát và thử thao tác nút thêm.                                                                                                       |
| **Expected Result** | - Nút thêm bị disable.<br>- Text trạng thái là "Hết hàng".<br>- Không gửi request add-to-cart khi click/tap.<br>- Nếu cố call API trực tiếp, backend phải từ chối hợp lệ. |

---

# SCENARIO 2: Chọn / bỏ chọn và tính subtotal theo trạng thái

## Mục tiêu kiểm thử

Phát hiện lỗi đồng bộ checkbox tổng, checkbox con, và subtotal khi người dùng thay đổi lựa chọn liên tục.

---

## Kỹ thuật áp dụng

- Decision Table Testing
- Use Case Testing
- State Transition

---

## Giả định nghiệp vụ (Business Rule)

- Chỉ item được tick mới tính vào subtotal.
- Checkbox tổng phản ánh đúng trạng thái của tất cả item con.
- Bỏ tick một item trong nhóm đã chọn phải làm checkbox tổng về trạng thái trung gian hoặc bỏ chọn.

---

## Test Cases

---

### TC-CART-S2-001 — Chọn / bỏ chọn / chọn lại item phải cập nhật subtotal chính xác

| Thuộc tính          | Nội dung                                                                                                                                                                                                                                                                    |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Pre-condition**   | Giỏ có SP A, SP B, SP C đều đang uncheck.                                                                                                                                                                                                                                   |
| **Test Data**       | Checkbox "Chọn tất cả"                                                                                                                                                                                                                                                      |
| **Steps**           | 1. Tick chọn tất cả.<br>2. Bỏ chọn SP C, quan sát subtotal và checkbox tổng.<br>3. Tick lại SP C, quan sát trạng thái checkbox tổng và subtotal.                                                                                                                             |
| **Expected Result** | - Sau bước 2: Checkbox tổng không còn all-selected; SP C bị loại khỏi subtotal; subtotal giảm đúng giá trị SP C.<br>- Sau bước 3: Checkbox tổng quay lại all-selected; subtotal tăng lại đúng giá trị SP C.<br>- Không mismatch giữa checkbox tổng và item con; không cộng/trừ hai lần do event handler bắn trùng. |

---

### TC-CART-S2-002 — Reload trang phải giữ trạng thái chọn / bỏ chọn nếu nghiệp vụ yêu cầu persist

| Thuộc tính          | Nội dung                                                                                                                                                                                                    |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Pre-condition**   | Một phần item đang được tick, phần còn lại uncheck.                                                                                                                                                         |
| **Test Data**       | F5 / reload trang                                                                                                                                                                                           |
| **Steps**           | 1. Reload trang giỏ.<br>2. So sánh trạng thái checkbox và subtotal trước/sau reload.                                                                                                                        |
| **Expected Result** | - Trạng thái sau reload khớp với dữ liệu đã lưu.<br>- Không reset toàn bộ item về cùng một trạng thái nếu hệ thống thiết kế có persist.<br>- Nếu hệ thống không persist, phải có spec rõ ràng và nhất quán. |

---

# SCENARIO 3: Cập nhật số lượng sản phẩm và biên tồn kho

## Mục tiêu kiểm thử

Tìm lỗi ở input validation, giới hạn min/max, paste dữ liệu bẩn, và thay đổi tồn kho trong quá trình người dùng chỉnh số lượng.

---

## Kỹ thuật áp dụng

- Boundary Value Analysis (BVA)
- Equivalence Partitioning (EP)
- Error Guessing

---

## Giả định nghiệp vụ (Business Rule)

- Stock giả định = 5.
- Số lượng hợp lệ nằm trong [1..5].
- Input chỉ nhận số nguyên dương.
- Khi số lượng vượt stock, hệ thống phải chặn và giải thích được nguyên nhân.

---

## Test Cases

---

### TC-CART-S3-001 — Nhập đúng cận dưới hợp lệ

| Thuộc tính          | Nội dung                                                                                             |
| ------------------- | ---------------------------------------------------------------------------------------------------- |
| **Pre-condition**   | SP A đang có số lượng = 2, stock = 5.                                                                |
| **Test Data**       | Input = 1                                                                                            |
| **Steps**           | 1. Xóa giá trị hiện tại.<br>2. Nhập 1 và blur khỏi ô.                                                |
| **Expected Result** | - Input chấp nhận 1.<br>- Nút trừ bị disable ở mức 1.<br>- Subtotal cập nhật đúng theo số lượng mới. |

---

### TC-CART-S3-002 — Nhập đúng cận trên hợp lệ

| Thuộc tính          | Nội dung                                                                                    |
| ------------------- | ------------------------------------------------------------------------------------------- |
| **Pre-condition**   | SP A đang có số lượng = 1, stock = 5.                                                       |
| **Test Data**       | Input = 5                                                                                   |
| **Steps**           | 1. Nhập 5.<br>2. Blur để áp dụng.                                                           |
| **Expected Result** | - Input chấp nhận 5.<br>- Nút cộng bị disable ở mức stock tối đa.<br>- Subtotal = giá \* 5. |

---

### TC-CART-S3-003 — Nhập vượt cận trên phải bị chặn bằng thông báo nghiệp vụ

| Thuộc tính          | Nội dung                                                                                                                                                                            |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Pre-condition**   | SP A hiện số lượng = 5, stock = 5.                                                                                                                                                  |
| **Test Data**       | Input = 6                                                                                                                                                                           |
| **Steps**           | 1. Thử nhập 6 bằng UI hoặc paste.<br>2. Blur để xác nhận.                                                                                                                           |
| **Expected Result** | - Không chấp nhận số vượt stock.<br>- Có thông báo lỗi rõ ràng dưới item.<br>- Giá trị input quay về 5 hoặc về giá trị hợp lệ gần nhất theo spec.<br>- Không làm subtotal tăng sai. |

---

### TC-CART-S3-004 — Nhập biên dưới không hợp lệ và giá trị rỗng

| Thuộc tính          | Nội dung                                                                                                                                               |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Pre-condition**   | SP A đang có số lượng = 2.                                                                                                                             |
| **Test Data**       | Input = 0, rỗng, -1                                                                                                                                    |
| **Steps**           | 1. Thay lần lượt các giá trị invalid vào ô số lượng.<br>2. Blur.                                                                                       |
| **Expected Result** | - 0, rỗng, số âm đều bị từ chối.<br>- Không được phép để input ở trạng thái không xác định sau blur.<br>- Giá trị phải rollback về số hợp lệ gần nhất. |

---

### TC-CART-S3-005 — Paste ký tự bẩn phải không làm vỡ state

| Thuộc tính          | Nội dung                                                                                                                                             |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Pre-condition**   | SP A đang có số lượng = 2.                                                                                                                           |
| **Test Data**       | Paste `abc`, `@#$`, `2e3`, `1.5`, khoảng trắng đầu/cuối                                                                                              |
| **Steps**           | 1. Paste dữ liệu bẩn vào ô số lượng.<br>2. Blur khỏi ô.                                                                                              |
| **Expected Result** | - Chỉ cho phép dữ liệu hợp lệ đi qua.<br>- Không biến input thành NaN, Infinity, hoặc chuỗi rác.<br>- State cũ không bị phá hỏng nếu paste thất bại. |

---

# SCENARIO 4: Khuyến mãi và freeship theo ngưỡng subtotal

## Mục tiêu kiểm thử

Phát hiện lỗi ở logic tính ngưỡng sát biên, gộp voucher (stacking), và recalculation khi subtotal thay đổi (bỏ tick, xóa item, giảm số lượng) sau khi voucher đã được chọn.

---

## Kỹ thuật áp dụng

- Decision Table Testing
- Boundary Value Analysis

---

## Giả định nghiệp vụ (Business Rule)

- Freeship bắt đầu từ 500.000đ.
- Voucher 70k bắt đầu từ 999.000đ.
- Ngưỡng phải tính trên subtotal của các item đang được tick, trước khi giảm giá.
- Khi subtotal giảm xuống dưới ngưỡng, voucher đang áp dụng phải tự hủy hoặc báo không đủ điều kiện.
- Cho phép áp dụng 1 mã Freeship và 1 mã Giảm giá cùng lúc; ngưỡng từng mã hoạt động độc lập trên Subtotal.

---

## Test Cases

---

### TC-CART-S4-001 — Dưới ngưỡng freeship sát 1đ

| Thuộc tính          | Nội dung                                                                                                         |
| ------------------- | ---------------------------------------------------------------------------------------------------------------- |
| **Pre-condition**   | Subtotal của item được tick = 499.999đ.                                                                          |
| **Test Data**       | Đơn = 499.999đ                                                                                                   |
| **Steps**           | 1. Mở thanh freeship.<br>2. Mở danh sách voucher.                                                                |
| **Expected Result** | - Chưa đạt freeship.<br>- UI phải hiển thị số tiền cần thêm chính xác là 1đ.<br>- Voucher 70k vẫn chưa khả dụng. |

---

### TC-CART-S4-002 — Đúng ngưỡng freeship nhưng chưa đạt voucher

| Thuộc tính          | Nội dung                                                                                                                                                                   |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Pre-condition**   | Subtotal = 500.000đ.                                                                                                                                                       |
| **Test Data**       | Đơn = 500.000đ                                                                                                                                                             |
| **Steps**           | 1. Quan sát thanh freeship.<br>2. Kiểm tra voucher.                                                                                                                        |
| **Expected Result** | - Freeship đạt ngưỡng.<br>- Phí ship về 0đ.<br>- Voucher 70k vẫn chưa được kích hoạt nếu chưa đạt 999k.<br>- Không được hiển thị ngưỡng sai lệch làm người dùng hiểu nhầm. |

---

### TC-CART-S4-003 — Sát ngưỡng voucher nhưng chưa đủ

| Thuộc tính          | Nội dung                                                                                                                                   |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| **Pre-condition**   | Subtotal = 998.999đ.                                                                                                                       |
| **Test Data**       | Đơn = 998.999đ                                                                                                                             |
| **Steps**           | 1. Mở voucher 70k.<br>2. Quan sát trạng thái áp dụng.                                                                                      |
| **Expected Result** | - Freeship vẫn đạt.<br>- Voucher 70k phải bị khóa vì thiếu 1đ.<br>- Message đủ điều kiện phải rõ ràng, không được làm tròn sai thành 999k. |

---

### TC-CART-S4-004 — Giảm subtotal phải recalculation voucher (bỏ tick, xóa item, gộp voucher)

| Thuộc tính          | Nội dung                                                                                                                                                                                                                                                                                                                                                                                          |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Pre-condition**   | Có thể dựng giỏ đạt các mức subtotal 999.000đ và 500.000đ.                                                                                                                                                                                                                                                                                                                                        |
| **Test Data**       | Voucher 70k (ngưỡng 999k); Voucher Freeship (ngưỡng 300k); Voucher Discount (ngưỡng 500k).                                                                                                                                                                                                                                                                                                        |
| **Steps**           | **Phần A — Bỏ tick làm mất điều kiện:**<br>1. Subtotal ≥ 999k, áp dụng voucher 70k.<br>2. Bỏ tick một item để subtotal < 999k, quan sát tổng tiền.<br><br>**Phần B — Xóa item làm mất điều kiện:**<br>3. Dựng lại giỏ ≥ 999k, áp dụng voucher 70k.<br>4. Xóa item làm subtotal tụt dưới ngưỡng, quan sát voucher và tổng tiền.<br><br>**Phần C — Stacking hai voucher:**<br>5. Subtotal = 500k, áp dụng Freeship + Discount.<br>6. Giảm SL hoặc bỏ tick để subtotal = 400k, quan sát khu vực mã khuyến mãi. |
| **Expected Result** | - Phần A & B: Voucher 70k bị gỡ khi subtotal không còn đủ ngưỡng; tổng tiền recalculation ngay; không giữ trạng thái "đã áp dụng" sai điều kiện.<br>- Phần C: Voucher Discount bị gỡ (400k < 500k); Voucher Freeship vẫn áp dụng (400k > 300k).<br>- Tổng tiền cuối cùng tính lại chính xác theo voucher còn hiệu lực.                                                                                    |

---

# SCENARIO 5: Xóa sản phẩm và chuyển trạng thái giao diện

## Mục tiêu kiểm thử

Bắt lỗi state transition khi xóa item, đặc biệt khi item đó ảnh hưởng subtotal, checkbox tổng, hoặc là item cuối cùng của giỏ.

---

## Kỹ thuật áp dụng

- State Transition
- Decision Table Testing

---

## Giả định nghiệp vụ (Business Rule)

- Xóa là hành động trực tiếp, không confirm.
- Xóa item đang được tick phải trừ khỏi subtotal ngay.
- Nếu giỏ trống hoàn toàn, chuyển sang empty state.

---

## Test Cases

---

### TC-CART-S5-001 — Xóa item đang được tick nhưng giỏ vẫn còn item khác

| Thuộc tính          | Nội dung                                                                                                                                               |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Pre-condition**   | Giỏ có SP A và SP B, cả hai đang tick chọn.                                                                                                            |
| **Test Data**       | Xóa SP A                                                                                                                                               |
| **Steps**           | 1. Nhấn xóa SP A.<br>2. Quan sát subtotal và checkbox tổng.                                                                                            |
| **Expected Result** | - SP A biến mất ngay.<br>- SP B vẫn giữ nguyên trạng thái.<br>- Subtotal chỉ còn phần của SP B.<br>- Checkbox tổng phải cập nhật theo số item còn lại. |

---

### TC-CART-S5-002 — Xóa item cuối cùng phải chuyển sang empty state đúng chuẩn

| Thuộc tính          | Nội dung                                                                                                                                                                                  |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Pre-condition**   | Giỏ chỉ còn 1 item duy nhất.                                                                                                                                                              |
| **Test Data**       | Xóa item cuối cùng                                                                                                                                                                        |
| **Steps**           | 1. Nhấn xóa item duy nhất.<br>2. Quan sát màn hình sau xóa.                                                                                                                               |
| **Expected Result** | - Danh sách giỏ rỗng.<br>- Empty state hiển thị rõ ràng.<br>- Có text rỗng giỏ và CTA tiếp tục mua sắm.<br>- Không còn các control liên quan tới subtotal/voucher nếu giỏ không còn item. |

---

# SCENARIO 6: Session, merge giỏ và concurrency tồn kho

## Mục tiêu kiểm thử

Săn lỗi ở các điểm rất dễ hỏng: merge guest cart, trùng SKU và stale session.

---

## Kỹ thuật áp dụng

- Use Case Testing
- Error Guessing
- State Transition

---

## Giả định nghiệp vụ (Business Rule)

- Guest cart được lưu local.
- Khi login, guest cart được merge vào account cart.
- Nếu cùng SKU xuất hiện ở cả hai giỏ, số lượng phải cộng dồn theo quy tắc hệ thống.
- Khi tồn kho thực tế giảm thấp hơn số lượng đang giữ, hệ thống phải cảnh báo và co về mức hợp lệ.

---

## Test Cases

---

### TC-CART-S6-001 — Merge giỏ khi login với cùng SKU phải cộng dồn đúng quy tắc và không vượt tồn kho

| Thuộc tính          | Nội dung                                                                                                                                                                                                                                      |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Pre-condition**   | Guest có SP A (SL=3); Account X cũng có SP A (SL=4). Tồn kho thực tế tối đa của SP A = 5.                                                                                                                                                    |
| **Test Data**       | Đăng nhập account X                                                                                                                                                                                                                           |
| **Steps**           | 1. Login account X.<br>2. Vào lại giỏ hàng kiểm tra số lượng SP A.                                                                                                                                                                          |
| **Expected Result** | - Hai giỏ được merge thành công, không tạo ra 2 dòng SP A riêng biệt.<br>- Số lượng SP A được cộng dồn nhưng phải bị giới hạn ở mức 5 (tồn kho tối đa), không được là 7 gây lỗi logic.<br>- Có thông báo: Số lượng sản phẩm đã được cập nhật do giới hạn tồn kho. |

---

### TC-CART-S6-002 — Merge giỏ khi login với SKU khác nhau phải giữ đủ cả hai phía

| Thuộc tính          | Nội dung                                                                                                                                                |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Pre-condition**   | Guest có SP A; account X có SP B.                                                                                                                       |
| **Test Data**       | Đăng nhập account X                                                                                                                                     |
| **Steps**           | 1. Login account X.<br>2. Kiểm tra giỏ sau merge.                                                                                                       |
| **Expected Result** | - Giỏ cuối cùng chứa cả SP A và SP B.<br>- Trạng thái chọn/bỏ chọn không bị reset sai nếu hệ thống có persist selection.<br>- Không mất item của guest. |

---


# 3. Ma trận theo dõi Kỹ thuật kiểm thử (Testing Techniques Matrix)

| Kỹ thuật Thiết kế (ISTQB)         | Kịch bản áp dụng         | Mục đích sử dụng                                                                                                      |
| --------------------------------- | ------------------------ | --------------------------------------------------------------------------------------------------------------------- |
| **Equivalence Partitioning (EP)** | Scenario 1, 3            | Phân lớp dữ liệu hợp lệ/không hợp lệ để bắt lỗi input, tồn kho và add-to-cart.                                        |
| **Boundary Value Analysis (BVA)** | Scenario 3, 4, 7         | Đánh vào các mốc 1, 5, 499.999, 500.000, 998.999, 999.000 là nơi dễ sai nhất. Bổ sung: Đánh vào giới hạn số lượng loại sản phẩm tối đa (Max items in cart). |
| **Decision Table Testing**        | Scenario 2, 4, 5         | Kiểm tra tổ hợp checkbox, subtotal, freeship, voucher stacking và recalculation khi trạng thái thay đổi.               |
| **State Transition**              | Scenario 1, 2, 5, 6      | Bắt lỗi chuyển trạng thái: add, chọn, xóa, merge, reload, hết session.                                                |
| **Use Case Testing**              | Scenario 2, 6            | Mô phỏng luồng thực của người dùng nhưng vẫn tập trung vào điểm dễ phát sinh bug.                                      |
| **Error Guessing**                | Scenario 1, 3, 6         | Đánh vào timeout, stale state, paste bẩn, concurrency, merge conflict và race condition khi add-cart trong điều kiện lag mạng. |
