# Test cases — Search (Fahasa.com)

Mục tiêu: chuyển các kịch bản trong `docs/search_spec.md` thành **test case đo được (pass/fail rõ ràng)**, ưu tiên tiêu chí “ăn điểm” của đồ án: có khả năng tìm defect, áp dụng đúng kỹ thuật thiết kế test (EP/BVA/Cause-Effect/Error Guessing), expected rõ, ít flaky khi chạy Playwright trên web thật.

> Ghi chú: Website search có tính chất fuzzy/ranking thay đổi theo thời điểm, nên một số assertion được thiết kế theo hướng **ổn định** (không phụ thuộc danh sách cố định), hoặc dùng **top N** và/hoặc “any-of” title.

---

## 1) Spec rút gọn (đề xuất)

Giữ lại các case “ăn điểm” và chạy ổn định:

> Scope theo trải nghiệm thực tế: search box phù hợp nhất với **tiêu đề sách** và **mã hàng/mã sách**.

### Tầng 1 — Scenario lớn (nhóm hành vi)

- **S1 — Search keyword hợp lệ**
- **S2 — Search input không hợp lệ / bất thường**
- **S3 — Boundary input**
- **S4 — UI/UX behavior khi search**
- **S5 — Stability nhẹ khi thao tác nhanh**

### Tầng 2 — Danh sách test case theo scenario

**S1 — Search keyword hợp lệ**

- TC-S1-01: Exact keyword (Spec ref: FT-01)
- TC-S1-02: Partial keyword (Spec ref: FT-02)
- TC-S1-03: Có dấu/không dấu (Spec ref: FT-04)
- TC-S1-04: Search theo mã hàng/SKU (Spec ref: FT-07)
- TC-S1-05: Nhiều từ khóa (Spec ref: FT-09)

**S2 — Search input không hợp lệ / bất thường**

- TC-S2-01: Search rỗng (Spec ref: VT-01)
- TC-S2-02: Chỉ whitespace (Spec ref: VT-02)
- TC-S2-03: Ký tự đặc biệt (Spec ref: VT-03)
- TC-S2-04: XSS payload (Spec ref: VT-04) (optional, gated)
- TC-S2-05: Keyword không tồn tại (Spec ref: EC-01)
- TC-S2-06: Unicode “đ/Đ” (Spec ref: EC-02)
- TC-S2-07: Trim khoảng trắng đầu/cuối (Spec ref: EC-03)

**S3 — Boundary input**

- TC-S3-01: Keyword cực dài ~400 ký tự (Spec ref: BT-01)
- TC-S3-02: Keyword tối thiểu 1 ký tự (Spec ref: BT-02)

**S4 — UI/UX behavior khi search**

- TC-S4-01: Enter vs click icon (Spec ref: UX-01)
- TC-S4-02: Suggestion dropdown xuất hiện (Spec ref: UX-02) (session dependent)
- TC-S4-03: Click suggestion hoạt động đúng (Spec ref: UX-03) (session dependent)
- TC-S4-04: Keyword giữ lại sau search (Spec ref: UX-04)

**S5 — Stability nhẹ khi thao tác nhanh**

- TC-S5-01: Spam submit 20 lần (Spec ref: PF-01) (optional, gated)

Ghi chú:

- Các nhãn FT/VT/BT/UX/PF/EC là **Spec Ref** theo nhóm kỹ thuật.
- ID dùng trong automation/báo cáo được chuẩn hoá theo dạng **TC-Sx-xx** để thể hiện “1 scenario → nhiều test case”.

Đề xuất bỏ/đổi scope:

- FT-03 (hoa/thường): có thể bỏ nếu đã có FT-04 và UX-01 (giảm trùng lặp). Nếu cần thêm 1 case EP đơn giản thì có thể giữ.
- FT-08 (search theo thể loại): **bỏ** nếu search box không hỗ trợ. Nếu muốn giữ “thể loại”, đổi thành test filter/chip danh mục trên trang kết quả (không nằm trong scope file này).
- ST-01..03 (state login/logout): **bỏ** trong automation hiện tại theo yêu cầu scope.

---

## 2) Preconditions (áp dụng cho mọi test case)

- Target: https://www.fahasa.com/ (Desktop Chrome)
- Chạy trên Playwright với context sạch (không dùng state đăng nhập) để giảm flaky.
- Nếu có banner/popup che UI: đóng trước khi thao tác.
- “Top 5” = 5 sản phẩm đầu tiên trong grid/list kết quả.

---

## 3) Test data chuẩn hóa

**Keywords & expected**

- KW_EXACT_VI: `hai số phận`
- KW_EXACT_VI_SPACES: `   hai số phận   `
- KW_EXACT_VI_MULTI: `hai số phận kane`
- KW_NO_DIACRITIC: `hai so phan`
- KW_PARTIAL: `so phan`
- KW_NO_RESULT: `alkdieyklkdkjsoid`
- KW_SPECIAL: `@#$%^`
- KW_XSS: `<script>alert(1);</script>`
- KW_MIN: `a`
- KW_LONG_400: ký tự `a` lặp 400 lần

**Expected title (any-of) để assert ổn định**

- EXPECTED_TITLES_ANY_OF:
  - `Hai Số Phận - Kane And Abel (Tái Bản 2025)`
  - `Hai Số Phận - Kane And Abel - Bìa Cứng (Tái Bản 2025)`

**Product detail fields (từ trang chi tiết bạn cung cấp)**

- PRODUCT_CODE (Mã hàng): `8935095635047`

---

## 4) Bộ test case (để automate bằng Playwright)

> Format tuân theo checklist trong `docs/test-case-mau.md`.

### TC-S1-01 — Exact keyword (Spec ref: FT-01)

- **Test Case ID:** TC-S1-01
- **Scenario/Title:** (S1) Exact keyword `hai số phận` trả về item mong đợi trong top 5
- **Technique Used:** Equivalence Partitioning (EP)
- **Priority:** High
- **Preconditions:** Preconditions chung
- **Test Data:** keyword = KW_EXACT_VI; expectedTitle ∈ EXPECTED_TITLES_ANY_OF
- **Steps:**
  1. Mở trang chủ
  2. Nhập KW_EXACT_VI vào ô search
  3. Submit search (Enter hoặc click icon)
  4. Lấy title của 5 sản phẩm đầu
- **Expected Result:**
  - Hiển thị trang/khu vực “KẾT QUẢ TÌM KIẾM”
  - Trong top 5 có ít nhất 1 title khớp **chính xác** một trong EXPECTED_TITLES_ANY_OF

---

### TC-S1-02 — Partial keyword (Spec ref: FT-02)

- **Test Case ID:** TC-S1-02
- **Scenario/Title:** (S1) Partial keyword `so phan` có trả về danh sách kết quả
- **Technique Used:** EP
- **Priority:** High
- **Preconditions:** Preconditions chung
- **Test Data:** keyword = KW_PARTIAL
- **Steps:**
  1. Mở trang chủ
  2. Nhập KW_PARTIAL
  3. Submit search
- **Expected Result:**
  - Hiển thị “KẾT QUẢ TÌM KIẾM”
  - Có ít nhất 1 sản phẩm trong danh sách kết quả (count > 0)

---

### TC-S1-03 — Có dấu/không dấu (Spec ref: FT-04)

- **Test Case ID:** TC-S1-03
- **Scenario/Title:** (S1) Search `hai số phận` và `hai so phan` đều tìm được
- **Technique Used:** EP
- **Priority:** High
- **Preconditions:** Preconditions chung
- **Test Data:** keywordA = KW_EXACT_VI; keywordB = KW_NO_DIACRITIC; expectedTitle ∈ EXPECTED_TITLES_ANY_OF
- **Steps:**
  1. Search keywordA, lấy top 5 titles
  2. Search keywordB, lấy top 5 titles
- **Expected Result:**
  - Cả hai lần đều có kết quả (count > 0)
  - Mỗi lần đều có ít nhất 1 title trong top 5 khớp một trong EXPECTED_TITLES_ANY_OF

---

### TC-S1-04 — Search theo mã hàng/SKU (Spec ref: FT-07)

- **Test Case ID:** TC-S1-04
- **Scenario/Title:** (S1) Search theo mã hàng `8935095635047` trả về đúng sản phẩm
- **Technique Used:** EP
- **Priority:** High
- **Preconditions:** Preconditions chung
- **Test Data:** keyword = PRODUCT_CODE
- **Steps:**
  1. Mở trang chủ
  2. Nhập PRODUCT_CODE
  3. Submit search
  4. Mở sản phẩm đầu tiên (hoặc trong top 3)
  5. Tại trang chi tiết, tìm trường “Mã hàng”
- **Expected Result:**
  - Có kết quả (count > 0)
  - Trên trang chi tiết, “Mã hàng” = PRODUCT_CODE

---

### TC-S1-05 — Nhiều từ khóa (Spec ref: FT-09)

- **Test Case ID:** TC-S1-05
- **Scenario/Title:** (S1) Search nhiều từ `hai số phận kane` vẫn có kết quả liên quan
- **Technique Used:** EP
- **Priority:** Medium
- **Preconditions:** Preconditions chung
- **Test Data:** keyword = KW_EXACT_VI_MULTI
- **Steps:**
  1. Mở trang chủ
  2. Nhập KW_EXACT_VI_MULTI
  3. Submit search
- **Expected Result:**
  - Có kết quả (count > 0)
  - Trong top 5 có ít nhất 1 title chứa “Hai Số Phận” (không phân biệt hoa thường) **hoặc** thuộc EXPECTED_TITLES_ANY_OF

---

### TC-S2-01 — Search rỗng (Spec ref: VT-01)

- **Test Case ID:** TC-S2-01
- **Scenario/Title:** (S2) Submit search rỗng hiển thị default suggestion
- **Technique Used:** BVA + EP
- **Priority:** High
- **Preconditions:** Preconditions chung
- **Test Data:** keyword = "" (rỗng)
- **Steps:**
  1. Mở trang chủ
  2. Đảm bảo ô search rỗng
  3. Click icon search (hoặc Enter)
- **Expected Result (không phụ thuộc data cố định):**
  - Điều hướng sang trang/khu vực “KẾT QUẢ TÌM KIẾM”
  - Có hiển thị danh sách sản phẩm (>= 1 item)
  - Ô search vẫn rỗng (sau trim)

Ghi chú:

- Spec gốc có cho phép “không search”, nhưng trong scope automation mình **chốt theo hành vi phổ biến** là vẫn vào trang kết quả để pass/fail rõ.

---

### TC-S2-02 — Search chỉ whitespace (Spec ref: VT-02)

- **Test Case ID:** TC-S2-02
- **Scenario/Title:** (S2) Search chỉ whitespace được trim và xử lý hợp lệ
- **Technique Used:** Error Guessing
- **Priority:** High
- **Preconditions:** Preconditions chung
- **Test Data:** keyword = " " (5+ spaces)
- **Steps:**
  1. Mở trang chủ
  2. Nhập 5+ khoảng trắng
  3. Submit search
- **Expected Result:**
  - Điều hướng sang trang/khu vực “KẾT QUẢ TÌM KIẾM”
  - Ô search hiển thị rỗng sau trim
  - Không crash/không trắng trang

---

### TC-S2-03 — Ký tự đặc biệt (Spec ref: VT-03)

- **Test Case ID:** TC-S2-03
- **Scenario/Title:** (S2) Search `@#$%^` không crash và UI không lỗi
- **Technique Used:** EP
- **Priority:** High
- **Preconditions:** Preconditions chung
- **Test Data:** keyword = KW_SPECIAL
- **Steps:**
  1. Mở trang chủ
  2. Nhập KW_SPECIAL
  3. Submit search
- **Expected Result:**
  - Không crash
  - Trang kết quả render bình thường (có heading kết quả hoặc trạng thái “không tìm thấy”)

---

### TC-S2-04 — XSS payload (Spec ref: VT-04)

- **Test Case ID:** TC-S2-04
- **Scenario/Title:** (S2) Search payload XSS không thực thi script
- **Technique Used:** Error Guessing
- **Priority:** High
- **Preconditions:** Preconditions chung
- **Test Data:** keyword = KW_XSS
- **Steps:**
  1. Mở trang chủ
  2. Nhập KW_XSS
  3. Submit search
- **Expected Result:**
  - Không xuất hiện dialog/alert
  - Không thấy dấu hiệu script execute
  - Trang không crash/không trắng

---

### TC-S3-01 — Keyword cực dài (Spec ref: BT-01)

- **Test Case ID:** TC-S3-01
- **Scenario/Title:** (S3) Search keyword dài (~400 ký tự) không crash
- **Technique Used:** BVA
- **Priority:** Medium
- **Preconditions:** Preconditions chung
- **Test Data:** keyword = KW_LONG_400
- **Steps:**
  1. Mở trang chủ
  2. Nhập KW_LONG_400
  3. Submit search
- **Expected Result:**
  - Không crash
  - Trang vẫn phản hồi hợp lệ (có kết quả hoặc không tìm thấy đều chấp nhận)
  - UI không “vỡ” nghiêm trọng: ô search vẫn visible và có thể focus/click

---

### TC-S3-02 — Keyword tối thiểu (Spec ref: BT-02)

- **Test Case ID:** TC-S3-02
- **Scenario/Title:** (S3) Search keyword 1 ký tự vẫn xử lý hợp lệ
- **Technique Used:** BVA
- **Priority:** Medium
- **Preconditions:** Preconditions chung
- **Test Data:** keyword = KW_MIN
- **Steps:**
  1. Mở trang chủ
  2. Nhập KW_MIN
  3. Submit search
- **Expected Result:**
  - Không crash
  - Có phản hồi hợp lệ (trang kết quả hoặc trạng thái phù hợp)

---

### TC-S4-01 — Enter vs click icon (Spec ref: UX-01)

- **Test Case ID:** TC-S4-01
- **Scenario/Title:** (S4) Enter và click icon cho kết quả tương đương
- **Technique Used:** Cause–Effect Graph
- **Priority:** High
- **Preconditions:** Preconditions chung
- **Test Data:** keyword = KW_EXACT_VI
- **Steps:**
  1. Search bằng Enter, lấy top 5 titles
  2. Search bằng click icon, lấy top 5 titles
- **Expected Result:**
  - Cả hai cách đều ra trang kết quả
  - Hai tập top 5 có giao nhau ít nhất 1 title (intersection ≥ 1)

---

### TC-S4-02 — Suggestion dropdown xuất hiện (Spec ref: UX-02)

- **Test Case ID:** TC-S4-02
- **Scenario/Title:** (S4) Nhập prefix hiển thị dropdown suggestion
- **Technique Used:** Cause–Effect Graph
- **Priority:** Medium
- **Preconditions:** Preconditions chung
- **Test Data:** prefix = `ha`
- **Steps:**
  1. Focus ô search
  2. Nhập prefix (không submit)
- **Expected Result:**
  - Dropdown suggestion hiển thị (visible)
  - Có ít nhất 1 item suggestion

---

### TC-S4-03 — Click suggestion hoạt động đúng (Spec ref: UX-03)

- **Test Case ID:** TC-S4-03
- **Scenario/Title:** (S4) Click suggestion điều hướng/tự điền keyword hợp lệ
- **Technique Used:** Use Case Testing
- **Priority:** Medium
- **Preconditions:** UX-02 pass (dropdown có hiện)
- **Test Data:** prefix = `ha`
- **Steps:**
  1. Nhập prefix để mở suggestion
  2. Click item suggestion đầu tiên
- **Expected Result (chấp nhận 1 trong 2 để phù hợp UI):**
  - Điều hướng sang trang kết quả và có danh sách sản phẩm (>= 1)
    **hoặc**
  - Ô search được điền theo suggestion và khi submit ra kết quả hợp lệ

---

### TC-S4-04 — Keyword giữ lại sau search (Spec ref: UX-04)

- **Test Case ID:** TC-S4-04
- **Scenario/Title:** (S4) Keyword vẫn hiển thị sau khi search
- **Technique Used:** State Transition
- **Priority:** Medium
- **Preconditions:** Preconditions chung
- **Test Data:** keyword = KW_EXACT_VI
- **Steps:**
  1. Search KW_EXACT_VI
  2. Quan sát ô search trên trang kết quả
- **Expected Result:**
  - Ô search vẫn hiển thị KW_EXACT_VI (hoặc tương đương sau trim)

---

### TC-S5-01 — Spam submit 20 lần (Spec ref: PF-01)

- **Test Case ID:** TC-S5-01
- **Scenario/Title:** (S5) Spam submit 20 lần không làm hệ thống bị block/captcha
- **Technique Used:** Error Guessing
- **Priority:** Medium
- **Preconditions:** Preconditions chung
- **Test Data:** keyword = KW_EXACT_VI; lần lặp = 20
- **Steps:**
  1. Thực hiện submit search KW_EXACT_VI liên tục 20 lần (Enter hoặc click icon)
  2. Ở lần cuối, chờ trang kết quả ổn định
- **Expected Result:**
  - Không bị điều hướng sang trang chặn/rate-limit/captcha
  - Lần cuối vẫn hiển thị trang kết quả hợp lệ (có danh sách sản phẩm)
  - UI vẫn responsive: ô search vẫn visible và có thể focus/click sau khi spam

---

### TC-S2-05 — Keyword không tồn tại (Spec ref: EC-01)

- **Test Case ID:** TC-S2-05
- **Scenario/Title:** (S2) Search keyword không tồn tại hiển thị trạng thái “không tìm thấy”
- **Technique Used:** EP
- **Priority:** High
- **Preconditions:** Preconditions chung
- **Test Data:** keyword = KW_NO_RESULT
- **Steps:**
  1. Search KW_NO_RESULT
- **Expected Result:**
  - Hiển thị message “Không tìm thấy …” **hoặc** số lượng kết quả = 0
  - Không crash

---

### TC-S2-06 — Unicode “đ/Đ” (Spec ref: EC-02)

- **Test Case ID:** TC-S2-06
- **Scenario/Title:** Search `đắc nhân tâm` không bị lỗi encoding và có phản hồi hợp lệ
- **Technique Used:** Equivalence Partitioning (EP)
- **Priority:** Medium
- **Preconditions:** Preconditions chung
- **Test Data:** keyword = `đắc nhân tâm`
- **Steps:**
  1. Mở trang chủ
  2. Nhập keyword tiếng Việt có ký tự “đ/Đ”
  3. Submit search
- **Expected Result:**
  - Không crash
  - Hiển thị trang/khu vực “KẾT QUẢ TÌM KIẾM”
  - Ô search vẫn hiển thị đúng keyword (không bị mất ký tự/biến dạng)

---

### TC-S2-07 — Trim khoảng trắng đầu/cuối (Spec ref: EC-03)

- **Test Case ID:** TC-S2-07
- **Scenario/Title:** Keyword có khoảng trắng đầu/cuối được trim
- **Technique Used:** Error Guessing
- **Priority:** High
- **Preconditions:** Preconditions chung
- **Test Data:** keyword = KW_EXACT_VI_SPACES
- **Steps:**
  1. Nhập KW_EXACT_VI_SPACES
  2. Submit search
- **Expected Result:**
  - Keyword hiển thị trên ô search hoặc heading đã được trim về `hai số phận`
  - Kết quả tương đương TC-S1-01 (top 5 có match một trong EXPECTED_TITLES_ANY_OF)

---

## 5) Mapping kỹ thuật kiểm thử (đưa vào báo cáo)

| Kỹ thuật                    | Test case (ID chuẩn hoá)                                                       |
| --------------------------- | ------------------------------------------------------------------------------ |
| Equivalence Partitioning    | TC-S1-01, TC-S1-02, TC-S1-03, TC-S1-04, TC-S1-05, TC-S2-03, TC-S2-05, TC-S2-06 |
| Boundary Value Analysis     | TC-S2-01, TC-S3-01, TC-S3-02                                                   |
| Error Guessing              | TC-S2-02, TC-S2-04, TC-S5-01, TC-S2-07                                         |
| Cause–Effect Graph          | TC-S4-01, TC-S4-02                                                             |
| Use Case Testing            | TC-S4-03                                                                       |
| State Transition (UI state) | TC-S4-04                                                                       |
