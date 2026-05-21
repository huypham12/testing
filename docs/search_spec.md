````md
- Functional
- Validation
- State
- Boundary
- UX
- Performance nhẹ

---

# Bộ kịch bản nên dùng cho Search Fahasa

## 1. Functional Testing

### FT-01 — Search bằng tên sách chính xác

Kĩ thuật sử dụng: Phân hoạch tương đương (Equivalence Partitioning)

Ví dụ:

- “Doraemon tập 1”

Expected:

- Hiển thị đúng sách liên quan
- Sách cần xuất hiện ở top đầu

---

### FT-02 — Search bằng một phần tên sách

Kĩ thuật sử dụng: Phân hoạch tương đương (Equivalence Partitioning)

Ví dụ:

- “Doraemon”

Expected:

- Trả về danh sách chứa các sách liên quan

---

### FT-03 — Search không phân biệt hoa thường

Kĩ thuật sử dụng: Phân hoạch tương đương (Equivalence Partitioning)

Ví dụ:

- “doraemon”
- “DORAEMON”

Expected:

- Kết quả tương đương

---

### FT-04 — Search có dấu / không dấu

Kĩ thuật sử dụng: Phân hoạch tương đương (Equivalence Partitioning)

Ví dụ:

- “tam ly hoc”
- “tâm lý học”

Expected:

- Hệ thống vẫn tìm được

→ Case này rất dễ lộ bug thật.

---

### FT-05 — Search theo tác giả

Kĩ thuật sử dụng: Phân hoạch tương đương (Equivalence Partitioning)

---

### FT-06 — Search theo nhà xuất bản

Kĩ thuật sử dụng: Phân hoạch tương đương (Equivalence Partitioning)

---

### FT-07 — Search theo ISBN / mã sản phẩm

Kĩ thuật sử dụng: Phân hoạch tương đương (Equivalence Partitioning)

---

### FT-08 — Search theo thể loại

Kĩ thuật sử dụng: Phân hoạch tương đương (Equivalence Partitioning)

---

### FT-09 — Search nhiều từ khóa

Kĩ thuật sử dụng: Phân hoạch tương đương (Equivalence Partitioning)

Ví dụ:

- “Harry Potter tiếng Anh”

Expected:

- Kết quả liên quan đến cả 2 keyword

---

# 2. Validation Testing

## VT-01 — Search rỗng

Kĩ thuật sử dụng:

- Phân tích giá trị biên (Boundary Value Analysis)
- Phân hoạch tương đương (Equivalence Partitioning)

Input:

- ""

Expected:

- Không search
  hoặc
- Hiển thị default suggestion

---

## VT-02 — Search chỉ chứa khoảng trắng

Kĩ thuật sử dụng: Error Guessing (Đoán lỗi)

Input:

- `"     "`

Expected:

- Trim input
- Không gửi request vô nghĩa

---

## VT-03 — Search ký tự đặc biệt

Kĩ thuật sử dụng: Phân hoạch tương đương (Equivalence Partitioning)

Input:

- `@#$%^`

Expected:

- Không crash
- Không lỗi UI

---

## VT-04 — Search script XSS cơ bản

Kĩ thuật sử dụng: Error Guessing (Đoán lỗi)

Input:

```html
<script>
  alert(1);
</script>
```
````

Expected:

- Escape output
- Không execute script

Đây là case rất có giá trị học thuật.

---

# 3. Boundary Value Testing

## BT-01 — Search keyword cực dài

Kĩ thuật sử dụng: Phân tích giá trị biên (Boundary Value Analysis)

Ví dụ:

- 300–500 ký tự

Expected:

- Không crash
- Không vỡ layout
- Có xử lý hợp lý

---

## BT-02 — Search keyword độ dài tối thiểu

Kĩ thuật sử dụng: Phân tích giá trị biên (Boundary Value Analysis)

Ví dụ:

- `"a"`

Expected:

- Hệ thống xử lý đúng

---

# 4. State Testing

## ST-01 — Search khi chưa login

Kĩ thuật sử dụng: Đồ thị chuyển trạng thái (State Transition)

---

## ST-02 — Search khi đã login

Kĩ thuật sử dụng: Đồ thị chuyển trạng thái (State Transition)

---

## ST-03 — Search sau khi logout

Kĩ thuật sử dụng: Đồ thị chuyển trạng thái (State Transition)

Nhiều hệ thống cache sai state.

---

# 5. UI / UX Testing

## UX-01 — Enter và click icon cho kết quả giống nhau

Kĩ thuật sử dụng: Đồ thị nguyên nhân – kết quả (Cause Effect Graph)

Đây là test rất tốt.

---

## UX-02 — Hiển thị suggestion khi nhập keyword

Kĩ thuật sử dụng: Đồ thị nguyên nhân – kết quả (Cause Effect Graph)

Ví dụ:

- nhập “do”

Expected:

- Dropdown suggestion xuất hiện

---

## UX-03 — Click suggestion hoạt động đúng

Kĩ thuật sử dụng: Use Case Testing

---

## UX-04 — Keyword được giữ lại sau search

Kĩ thuật sử dụng: Đồ thị chuyển trạng thái (State Transition)

Ví dụ:

- Search “Doraemon”

Expected:

- Ô input vẫn hiển thị “Doraemon”

---

# 6. Performance / Stability nhẹ

## PF-01 — Spam search liên tục

Kĩ thuật sử dụng: Error Guessing (Đoán lỗi)

Ví dụ:

- gửi 20 request nhanh

Expected:

- Không freeze UI
- Không rate-limit bất thường
- Không duplicate request lỗi

Playwright làm case này khá ổn.

---

# 7. Case rất đáng thêm (điểm cộng mạnh)

## EC-01 — Search keyword không tồn tại

Kĩ thuật sử dụng: Phân hoạch tương đương (Equivalence Partitioning)

Ví dụ:

- “asdhjkasdhjkqwe”

Expected:

- Hiển thị “Không tìm thấy sản phẩm”

---

## EC-02 — Search tiếng Việt có dấu đặc biệt

Kĩ thuật sử dụng: Phân hoạch tương đương (Equivalence Partitioning)

Ví dụ:

- “đắc nhân tâm”

Expected:

- Encoding đúng

---

## EC-03 — Search với khoảng trắng đầu/cuối

Kĩ thuật sử dụng: Error Guessing (Đoán lỗi)

Ví dụ:

```text
"   Doraemon   "

```

Expected:

- Tự trim

---

# Các kỹ thuật kiểm thử bạn đang áp dụng

Bạn hoàn toàn có thể ghi trong báo cáo:

| Kỹ thuật                | Case                          |
| ----------------------- | ----------------------------- |
| Phân hoạch tương đương  | keyword hợp lệ / không hợp lệ |
| Boundary Value Analysis | keyword cực ngắn / cực dài    |
| State Transition        | login / logout                |
| Error Guessing          | XSS, spam search              |
| Decision-based behavior | enter vs click                |

---

# Những case nên ưu tiên automate bằng Playwright

Ưu tiên cao:

- search chính xác
- partial keyword
- empty input
- special character
- XSS
- no result
- suggestion
- enter vs click
- keyword dài
- spam search nhẹ

Không cần quá sâu:

- performance thực sự
- load test lớn
- security chuyên sâu

Vì Playwright không phải tool chuyên cho load testing/security testing.

---

# Đánh giá tổng thể

Quan trọng nhất:

- mỗi test case phải có:
- ID
- precondition
- steps
- test data
- expected result

Chứ không chỉ liệt kê tên case.

```

```
