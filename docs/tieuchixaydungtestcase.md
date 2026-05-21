Đúng hướng, nhưng danh sách hiện tại đang trộn lẫn:

- tiêu chí “bắt buộc” của một test case tốt
- tiêu chí tối ưu cho automation
- chiến lược test
- kỹ thuật thiết kế test
- nguyên tắc quản lý test suite

Đối với **test case kiểm thử hộp đen (black-box)**, nên ưu tiên lại theo mức độ quan trọng thực tế như sau.

---

# Tier 1 — Bắt buộc phải có

Nếu thiếu các mục này thì test case gần như bị xem là kém chất lượng.

## 1. Có mục tiêu kiểm thử rõ ràng

- Muốn xác minh điều gì
- Muốn phát hiện loại lỗi gì

Ví dụ xấu:

- “Test search”

Ví dụ tốt:

- “Kiểm tra search với keyword hợp lệ có trả về đúng sản phẩm liên quan”

---

## 2. Expected result cụ thể, đo được

Phải xác định được:

- đúng/sai
- pass/fail

Không dùng:

- “hiển thị hợp lý”
- “giao diện đẹp”
- “kết quả đúng”

Nên dùng:

- “Hiển thị danh sách sản phẩm chứa keyword”
- “Không cho phép thanh toán”
- “Hiển thị message ‘Email không hợp lệ’”

---

## 3. Có khả năng phát hiện defect cao

Một test case tốt phải có giá trị tìm lỗi.

Ưu tiên:

- edge case
- boundary
- invalid input
- trạng thái bất thường

hơn là:

- chỉ test happy path

---

## 4. Test case độc lập

- Chạy riêng vẫn hoạt động
- Không phụ thuộc test trước

Ví dụ xấu:

- Test B chỉ chạy được nếu test A đã thêm sản phẩm vào giỏ

---

## 5. Không trùng lặp ý nghĩa

Nhiều test khác nhau nhưng cùng kiểm tra một logic → dư thừa.

Mục tiêu:

- tối thiểu số lượng
- tối đa khả năng tìm lỗi

---

# Tier 2 — Rất quan trọng

## 6. Bao phủ rủi ro nghiệp vụ quan trọng

Ưu tiên test:

- thanh toán
- tính tiền
- đăng nhập
- phân quyền
- cập nhật dữ liệu
- transaction

trước các phần ít rủi ro.

---

## 7. Có áp dụng kỹ thuật thiết kế test phù hợp

Đây là phần cực quan trọng trong black-box testing.

Bao gồm:

- Phân hoạch tương đương (Equivalence Partitioning)
- Giá trị biên (Boundary Value Analysis)
- Decision Table
- State Transition
- Cause Effect Graph

Một test case tốt thường sinh ra từ các kỹ thuật này.

---

## 8. Có đủ loại kiểm thử dữ liệu

Bao gồm:

- Positive test
- Negative test
- Error/exception case

Nếu chỉ có happy case thì bộ test rất yếu.

---

## 9. Tối ưu giữa số lượng test và giá trị kiểm thử

Không phải càng nhiều test càng tốt.

Một bộ test tốt:

- ít trùng
- bao phủ logic mạnh
- tập trung vùng dễ lỗi

---

## 10. Ưu tiên nơi dễ phát sinh lỗi nhất

Ví dụ:

- validation phức tạp
- search/filter
- tính toán
- đồng bộ trạng thái
- checkout flow

---

# Tier 3 — Quan trọng cho automation testing

Các mục này đặc biệt quan trọng khi dùng Playwright/Selenium/Cypress.

## 11. Ổn định (non-flaky)

Không nên:

- lúc pass lúc fail
- phụ thuộc timing
- phụ thuộc network random

---

## 12. Phù hợp để tự động hóa

Nên:

- deterministic
- có expected rõ
- có thể chạy lặp lại

Không nên automation:

- CAPTCHA
- OTP thật
- logic phụ thuộc người duyệt thủ công

---

## 13. Không phụ thuộc mạnh vào UI dễ thay đổi

Tránh:

- selector quá mong manh
- xpath dài
- phụ thuộc vị trí UI

Ưu tiên:

- data-testid
- role
- semantic selector

---

## 14. Giúp debug dễ khi fail

Khi fail cần biết:

- fail bước nào
- input gì
- expected gì
- actual gì

---

## 15. Có khả năng tái sử dụng cho regression

Một test case tốt thường được dùng lại lâu dài sau mỗi lần release.

---

# Tier 4 — Tiêu chí hỗ trợ

## 16. Dễ đọc, dễ hiểu, dễ maintain

Quan trọng với team/project lớn.

---

## 17. Dùng dữ liệu test thực tế

Ví dụ:

- email thật
- tên sách thật
- giá tiền hợp lý

sẽ dễ phát hiện lỗi thực tế hơn dữ liệu giả vô nghĩa.

---

# Những gì nên loại bỏ nếu chỉ tập trung Black-box

Danh sách của bạn hiện gần như không chứa tiêu chí white-box rõ rệt.

Tuy nhiên các tiêu chí dưới đây thường nghiêng về white-box hoặc internal testing nên KHÔNG cần đưa vào checklist black-box cơ bản:

- code coverage
- branch coverage
- statement coverage
- path coverage
- internal function call verification
- mock interaction verification

Bạn chưa liệt kê các mục này nên hiện tại ổn.

---

# Phiên bản rút gọn thực chiến

Nếu cần checklist ngắn gọn để đánh giá nhanh một test case black-box chất lượng:

1. Mục tiêu test rõ ràng
2. Expected cụ thể, đo được
3. Có khả năng tìm lỗi cao
4. Ưu tiên boundary/negative/edge case
5. Không trùng logic với test khác
6. Bao phủ rủi ro nghiệp vụ quan trọng
7. Áp dụng đúng kỹ thuật thiết kế test
8. Test độc lập
9. Ổn định và phù hợp automation
10. Dễ debug khi fail
11. Có thể reuse cho regression
12. Dễ maintain và ít phụ thuộc UI fragile

Đối với **đồ án môn học kiểm thử tự động bằng Playwright**, giảng viên thường không đánh giá theo tiêu chuẩn QA enterprise đầy đủ, mà sẽ tập trung vào:

- tư duy kiểm thử
- khả năng thiết kế test case
- khả năng tìm defect
- mức độ chuyên nghiệp của automation
- tính hợp lý của bộ test

Với đề tài của bạn (Fahasa — search, cart, checkout), để tối đa điểm thì nên ưu tiên các tiêu chí dưới đây theo thứ tự.

---

# Tier S — Quan trọng nhất để ăn điểm

## 1. Test case có khả năng tìm lỗi thật

Đây thường là thứ giảng viên quan tâm nhất.

Nếu toàn test happy case kiểu:

- nhập đúng
- click đúng
- flow đúng

→ thường bị đánh giá là “test hời hợt”.

Phải có:

- invalid input
- boundary
- empty data
- special characters
- state bất thường
- thao tác liên tục
- dữ liệu conflict

Ví dụ mạnh hơn:

- Search với ký tự đặc biệt
- Quantity âm
- Spam click Add To Cart
- Refresh giữa checkout
- Search chuỗi cực dài
- Input khoảng trắng
- Checkout khi cart rỗng

---

## 2. Áp dụng đúng kỹ thuật thiết kế test

Cái này cực kỳ quan trọng trong môi trường học thuật.

Bạn gần như chắc chắn phải thể hiện:

- Equivalence Partitioning
- Boundary Value Analysis
- Decision Table
- State Transition

Không chỉ “có test”.

Mà phải chứng minh:

> test này sinh ra từ kỹ thuật nào.

Đây là phần giúp report có chiều sâu học thuật.

---

## 3. Expected result rõ ràng

Đây là thứ phân biệt test chuyên nghiệp và test “cho có”.

Ví dụ kém:

- “Hiển thị đúng”

Ví dụ tốt:

- “Hiển thị message ‘Không tìm thấy sản phẩm’”
- “Số lượng giỏ hàng tăng thêm 1”
- “Không cho nhập quantity < 1”

---

## 4. Bộ test có tính bao phủ tốt nhưng không spam số lượng

Giảng viên thường ghét:

- 100 test giống nhau
- đổi mỗi data

Thay vào đó:

- ít nhưng chất
- mỗi test có ý nghĩa riêng
- mỗi test target một risk khác nhau

---

## 5. Có negative test và edge case

Đây gần như là bắt buộc để được đánh giá cao.

Nếu chỉ có happy path:

- điểm thường không cao

---

# Tier A — Rất quan trọng cho automation

## 6. Test ổn định (không flaky)

Nếu demo:

- chạy lúc pass lúc fail
- timeout random

→ mất điểm rất mạnh.

Playwright project môn học cần:

- selector ổn định
- wait hợp lý
- tránh sleep cứng

---

## 7. Test độc lập

Mỗi test nên:

- setup riêng
- không phụ thuộc test trước

Giảng viên thường rất thích:

```ts
test.beforeEach(...)
```

hoặc:

- reset state rõ ràng

---

## 8. Dễ đọc và chuyên nghiệp

Code automation nên:

- chia page object nếu có thời gian
- tên test rõ
- comment vừa đủ
- structure sạch

Ví dụ:

```ts
test("Search with empty keyword should show validation message");
```

sẽ chuyên nghiệp hơn:

```ts
test("test search 1");
```

---

## 9. Có assertion meaningful

Không chỉ:

```ts
expect(true).toBeTruthy();
```

Mà phải assert:

- text
- URL
- trạng thái button
- số lượng item
- validation message
- visibility

---

# Tier B — Có sẽ cộng điểm

## 10. Có architecture automation tương đối tốt

Ví dụ:

- Page Object Model
- reusable helper
- test data riêng
- config environment

Không bắt buộc với đồ án ngắn hạn, nhưng có sẽ rất mạnh.

---

## 11. Có report/test evidence

Ví dụ:

- screenshot khi fail
- video
- HTML report
- trace viewer

Playwright hỗ trợ sẵn nên rất đáng dùng.

---

## 12. Có phân loại test scenario hợp lý

Ví dụ:

- Functional
- Validation
- Boundary
- State
- UX
- Performance nhẹ

Report nhìn sẽ rất chuyên nghiệp.

---

# Những thứ KHÔNG cần quá tập trung cho đồ án môn học

Các thứ này enterprise quan trọng nhưng không tăng điểm nhiều trong đồ án ngắn:

- CI/CD
- parallel execution optimization
- advanced mocking
- visual regression
- contract testing
- coverage metrics phức tạp
- cross-browser exhaustive
- performance benchmark nghiêm túc

---

# Công thức thực tế để dễ điểm cao

Nếu chỉ có 2 tuần, tôi sẽ ưu tiên:

## 1. Viết bộ kịch bản chất lượng

Quan trọng nhất.

---

## 2. Mapping kỹ thuật kiểm thử vào từng kịch bản

Ví dụ:

| Scenario      | Technique             |
| ------------- | --------------------- |
| Empty search  | Equivalence Partition |
| Quantity = 0  | Boundary Value        |
| Checkout flow | State Transition      |

---

## 3. Automation ổn định

- selector tốt
- không flaky
- demo pass ổn

---

## 4. Có vài defect thật

Đây là điểm ăn mạnh nhất.

Dù lỗi nhỏ vẫn tốt hơn không có lỗi nào.

---

## 5. Report chuyên nghiệp

Bao gồm:

- mục tiêu
- phạm vi
- kỹ thuật dùng
- test case
- kết quả
- defect tìm được
- kết luận

---

# Nếu phải chọn 5 tiêu chí quan trọng nhất

Cho đúng bài toán của bạn:

1. Khả năng phát hiện defect
2. Áp dụng kỹ thuật thiết kế test đúng
3. Expected result rõ ràng
4. Có negative/boundary/edge case
5. Automation ổn định, demo không flaky
