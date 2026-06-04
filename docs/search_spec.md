# TÀI LIỆU ĐẶC TẢ KIỂM THỬ (TEST SPECIFICATION) - TÍNH NĂNG TÌM KIẾM (SEARCH)

> **Đối tượng kiểm thử:** https://www.fahasa.com/  
> **Automation:** Playwright (`tests/search.spec.ts`, `pages/SearchPage.ts`, `data/search.data.ts`)

---

# 1. Phạm vi kiểm thử (Test Scope)

## Thuộc phạm vi kiểm thử (In-scope)

- Tìm kiếm cơ bản với từ khóa hợp lệ (Chính xác, một phần, nhiều từ khóa, mã SKU).
- Kiểm tra khả năng xử lý ngôn ngữ tiếng Việt (Có dấu/không dấu).
- Xử lý các đầu vào bất thường (Rỗng, khoảng trắng, ký tự đặc biệt, Emoji/Unicode).
- Kiểm tra giá trị biên của từ khóa (Cực ngắn, trung bình, cực dài).
- Tìm kiếm nâng cao kết hợp bộ lọc (Filter) trên trang kết quả (Lọc theo khoảng giá, Nhà xuất bản).
- Nhận diện dung sai lỗi chính tả (Typo tolerance — Thiếu, thừa, sai vị trí, dính phím, lỗi Telex/VNI).
- Hiệu năng cơ bản (Search Performance) khi danh sách sản phẩm render xong.

## Không thuộc phạm vi kiểm thử (Out-of-scope)

- Kiểm thử hiệu năng chuyên sâu hoặc Load Testing (Hệ thống chịu tải hàng ngàn request cùng lúc).
- Trạng thái tìm kiếm khi đăng nhập/đăng xuất (Thực hiện trên Guest để đảm bảo tính ổn định).
- Kiểm tra chi tiết hành vi UI/UX thuần túy (Dropdown tự xổ, di chuột, spam click liên tục) — thuộc manual test.
- Payload XSS dạng `<script>` trực tiếp và chuỗi SQL Injection — **loại khỏi test data** do rủi ro bị WAF/Cloudflare của Fahasa chặn IP.
- Kiểm tra phân biệt hoa/thường (case sensitivity) như một test case riêng.
- Lọc theo thể loại (Category filter) — chưa có automation tương ứng.
- Tìm kiếm theo tên tác giả trên kết quả partial match (VD: `nguyễn nhật ánh`) — loại khỏi automation vì hành vi thực tế website không ổn định.

---

# 2. Danh sách Kịch bản và Test Case chi tiết

_Lưu ý chung (Pre-condition chung cho mọi Test Case):_

- _Môi trường: Desktop Web — Chromium (Desktop Chrome) qua Playwright._
- _Trạng thái: Guest, không đăng nhập. Trước mỗi test: mở trang chủ Fahasa, chặn request quảng cáo (MoEngage, Insider, CleverTap, Google Ads) và ẩn popup/modal bằng init script._
- _Phương thức submit: Nhấn **Enter** trên ô tìm kiếm (automation không dùng click icon Kính lúp)._
- _Dữ liệu test: lấy từ `data/search.data.ts`, chạy data-driven (mỗi dòng data = một `test.step`)._
- _"Top N" = N sản phẩm đầu tiên trong danh sách kết quả (locator `h2.product-name-no-ellipsis a`, `h2.p-name-list a`)._

---

# SCENARIO 1: Tìm kiếm với từ khóa hợp lệ (Valid Search)

## Mục tiêu kiểm thử

Đảm bảo tính năng tìm kiếm trả về kết quả liên quan khi người dùng nhập các loại từ khóa thông thường (Tên sách, một phần tên sách, mã hàng).

---

### TC-SEARCH-S1-001 — Tìm kiếm chính xác tuyệt đối (Exact Match)

| Thuộc tính          | Nội dung                                                                                                                                                                                                 |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Pre-condition**   | Đang ở trang chủ Fahasa.                                                                                                                                                                                 |
| **Test Data**       | `{ kw: "hai số phận", expected: "Hai Số Phận" }`<br><br>`{ kw: "harry potter và hòn đá phù thủy", expected: "Harry Potter" }`                                                                           |
| **Steps**           | 1. Nhập từ khóa vào ô tìm kiếm.<br><br>2. Nhấn Enter.<br><br>3. Chờ danh sách sản phẩm hiển thị.<br><br>4. Lấy tiêu đề **top 5** sản phẩm đầu tiên.                                                      |
| **Expected Result** | - Danh sách sản phẩm render thành công (ít nhất 1 item visible).<br><br>- Trong top 5 có **ít nhất 1** tiêu đề chứa chuỗi `expected` (so khớp không phân biệt hoa/thường, chuẩn hóa Unicode NFC).         |

---

### TC-SEARCH-S1-002 — Tìm kiếm mập mờ, một phần từ khóa (Partial Match)

| Thuộc tính          | Nội dung                                                                                                                                                                                                                                      |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Pre-condition**   | Đang ở trang chủ.                                                                                                                                                                                                                             |
| **Test Data**       | `{ kw: "so phan kane", expected: "Hai Số Phận" }`<br><br>`{ kw: "cam ngot", expected: "Cây Cam Ngọt" }`<br><br>`{ kw: "harry hòn đá", expected: "Harry Potter" }`<br><br>_Loại trừ:_ `{ kw: "nguyễn nhật ánh" }` — không chạy automation. |
| **Steps**           | 1. Nhập từng keyword và Submit (Enter).<br><br>2. Lấy tiêu đề top 5 sản phẩm.                                                                                                                                                                 |
| **Expected Result** | - Danh sách sản phẩm render thành công.<br><br>- Trong top 5 có **ít nhất 1** tiêu đề chứa chuỗi `expected` tương ứng (so khớp normalize, không phân biệt hoa/thường).                                                                        |

---

### TC-SEARCH-S1-003 — Tìm kiếm tiếng Việt không dấu (Accent Insensitive)

| Thuộc tính          | Nội dung                                                                                                                                                                                                 |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Pre-condition**   | Đang ở trang chủ.                                                                                                                                                                                        |
| **Test Data**       | Keyword A (có dấu): `hai số phận`<br><br>Keyword B (không dấu): `hai so phan`                                                                                                                            |
| **Steps**           | 1. Tìm kiếm bằng Keyword A, ghi nhận top **3** kết quả.<br><br>2. Tìm kiếm lại bằng Keyword B, ghi nhận top **3** kết quả.                                                                              |
| **Expected Result** | - Cả 2 lần tìm kiếm đều trả về danh sách sản phẩm (số lượng tiêu đề > 0).<br><br>- _Lưu ý thực tế website:_ automation **không so sánh tập kết quả giữa 2 lần** — chỉ xác nhận cả hai đều có kết quả. |

---

### TC-SEARCH-S1-004 — Tìm kiếm bằng mã định danh sản phẩm (SKU / ISBN)

| Thuộc tính          | Nội dung                                                                                                                                                                                            |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Pre-condition**   | Đang ở trang chủ.                                                                                                                                                                                   |
| **Test Data**       | SKU: `8935095635047`                                                                                                                                                                                |
| **Steps**           | 1. Nhập mã hàng vào ô tìm kiếm và Submit.<br><br>2. Chờ danh sách kết quả hiển thị, click mở sản phẩm đầu tiên.<br><br>3. Đọc trường **"Mã hàng"** tại trang chi tiết (xpath `//tr[th="Mã hàng"]/td`). |
| **Expected Result** | - Trang chi tiết mở thành công.<br><br>- Giá trị trường "Mã hàng" chứa chuỗi `8935095635047`.                                                                                                      |

---

# SCENARIO 2: Đầu vào bất thường & Bảo mật (Invalid & Security)

## Mục tiêu kiểm thử

Đảm bảo hệ thống không crash khi nhận dữ liệu rác hoặc ký tự đặc biệt. Automation tập trung vào **ổn định UI**, không kiểm thử penetration sâu.

---

### TC-SEARCH-S2-001 — Tìm kiếm với khoảng trống (Empty Input)

| Thuộc tính          | Nội dung                                                                                                                                  |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| **Pre-condition**   | Đang ở trang chủ.                                                                                                                         |
| **Test Data**       | `""` (Rỗng)<br><br>`" "` (1 khoảng trắng)<br><br>`"   \t  "` (Khoảng trắng + Tab)                                                        |
| **Steps**           | 1. Nhập từng input vào ô tìm kiếm.<br><br>2. Nhấn Enter.                                                                                  |
| **Expected Result** | - Trang không crash (`body` vẫn visible).<br><br>- Ô tìm kiếm vẫn hiển thị và tương tác được (`searchInput` visible).                    |

---

### TC-SEARCH-S2-002 — Tìm kiếm chứa ký tự đặc biệt & Unicode (Special Characters)

| Thuộc tính          | Nội dung                                                                                                                                  |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| **Pre-condition**   | Đang ở trang chủ.                                                                                                                         |
| **Test Data**       | Input 1: `@#$%^&*`<br><br>Input 2: `📚👍❤` (Emoji)                                                                                        |
| **Steps**           | 1. Nhập từng input và Submit.<br><br>2. Quan sát UI sau khi trang phản hồi.                                                               |
| **Expected Result** | - Trang không crash.<br><br>- Ô tìm kiếm vẫn visible sau submit.<br><br>- _Không kiểm tra payload `<script>` — loại khỏi scope (WAF)._ |

---

### TC-SEARCH-S2-003 — Kiểm tra lỗi SQL Injection

| Thuộc tính          | Nội dung                                                                                                                                                                                                 |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Pre-condition**   | Đang ở trang chủ.                                                                                                                                                                                        |
| **Test Data**       | _Hiện tại: không có payload trong `search.data.ts`._ Automation lọc mục có `desc` chứa `"SQL"` — nếu không có data thì test pass mà không thực thi bước nào.                                            |
| **Steps**           | _(Khi có data)_ 1. Nhập chuỗi SQL Injection và Submit.<br><br>2. Đọc toàn bộ HTML trang.<br><br>3. Assert không chứa chuỗi `"sql syntax"`.                                                              |
| **Expected Result** | - Server không sập, web không crash.<br><br>- Nội dung trang không lộ thông báo lỗi SQL (VD: "SQL Syntax error").<br><br>- _Ghi chú:_ Payload `' OR 1=1 --` **không nằm trong test data hiện tại** do rủi ro WAF. |

---

### TC-SEARCH-S2-004 — Tìm kiếm từ khóa vô nghĩa (Not Found)

| Thuộc tính          | Nội dung                                                                                                                          |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| **Pre-condition**   | Đang ở trang chủ.                                                                                                                 |
| **Test Data**       | Keyword: `alkdieyklkdkjsoid`                                                                                                      |
| **Steps**           | 1. Nhập từ khóa và Submit.                                                                                                        |
| **Expected Result** | - Không crash.<br><br>- Hiển thị thông báo **"0 kết quả"** trong phần tử `.search-term-text` (timeout chờ tối đa 10 giây).       |

---

### TC-SEARCH-S2-005 — Tự động cắt khoảng trắng thừa (Input Trimming)

| Thuộc tính          | Nội dung                                                                                                                                                               |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Pre-condition**   | Đang ở trang chủ.                                                                                                                                                      |
| **Test Data**       | Input: `  hai số phận  `<br><br>Expected trong ô input sau submit: `hai số phận`                                                                                        |
| **Steps**           | 1. Nhập từ khóa có khoảng trắng ở đầu và cuối.<br><br>2. Submit.<br><br>3. Đọc giá trị hiện tại của ô tìm kiếm.                                                       |
| **Expected Result** | - Ô input tự động trim thành `hai số phận` (`toHaveValue`, timeout 5 giây).<br><br>- Trang trả về kết quả tìm kiếm hợp lệ.                                          |

---

# SCENARIO 3: Giá trị biên của từ khóa (Boundary)

## Mục tiêu kiểm thử

Kiểm tra hệ thống không crash khi độ dài từ khóa ở các mức cực hạn.

---

### TC-SEARCH-S3-001 — Kiểm tra giới hạn độ dài từ khóa (Boundary Length)

| Thuộc tính          | Nội dung                                                                                                                                                                                                 |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Pre-condition**   | Đang ở trang chủ.                                                                                                                                                                                        |
| **Test Data**       | Biên dưới: `a` (1 ký tự)<br><br>Trung bình: `a` × 100<br><br>Biên trên: `a` × 400                                                                                                                        |
| **Steps**           | 1. Nhập từng từ khóa và Submit.<br><br>2. Quan sát phản hồi trang.                                                                                                                                      |
| **Expected Result** | - Trang không crash sau mỗi lần submit.<br><br>- Ô tìm kiếm vẫn visible.<br><br>- _Automation không assert layout tràn header — chỉ kiểm tra ổn định cơ bản._                                           |

---

# SCENARIO 4: Bộ lọc nâng cao (Filters)

## Mục tiêu kiểm thử

Đảm bảo bộ lọc trên trang kết quả hoạt động đúng sau khi tìm kiếm từ khóa.

---

### TC-SEARCH-S4-001 — Lọc kết quả tìm kiếm theo khoảng giá (Price Filter)

| Thuộc tính          | Nội dung                                                                                                                                                                                                                                                                                                                                 |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Pre-condition**   | Đang ở trang chủ.                                                                                                                                                                                                                                                                                                                        |
| **Test Data**       | `{ kw: "kinh tế", min: 50000, max: 150000 }` — Giá trung bình<br><br>`{ kw: "tâm lý học", min: 200000, max: 500000 }` — Giá cao<br><br>`{ kw: "tiểu thuyết", min: 100000, max: 100000 }` — Min = Max<br><br>`{ kw: "lịch sử", min: 150000, max: 100000 }` — Min > Max (kỳ vọng báo lỗi)                                               |
| **Steps**           | 1. Tìm kiếm theo `kw` và Submit.<br><br>2. Nhập Min/Max vào `input[name="min"]` / `input[name="max"]`, nhấn Enter trên ô Max.<br><br>3. Chờ danh sách sản phẩm cập nhật.<br><br>4. Phân nhánh kiểm tra theo phản hồi UI.                                                                                                               |
| **Expected Result** | **Kịch bản A — Min > Max:** Hiển thị thông báo _"Khoảng giá chưa đúng"_.<br><br>**Kịch bản B — Không có sản phẩm trong khoảng:** Hiển thị _"Không có sản phẩm"_.<br><br>**Kịch bản C — Có sản phẩm:** Toàn bộ giá trong top 5 (locator `.price-label .m-price-font`) nằm trong `[Min, Max]`.                                         |

---

### TC-SEARCH-S4-002 — Lọc kết quả tìm kiếm theo Nhà xuất bản (Publisher Filter)

| Thuộc tính          | Nội dung                                                                                                                                                                                                                 |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Pre-condition**   | Đang ở trang chủ.                                                                                                                                                                                                        |
| **Test Data**       | `{ kw: "tâm lý", publisher: "NXB Dân Trí" }`<br><br>`{ kw: "kinh tế", publisher: "NXB Trẻ" }`<br><br>`{ kw: "tiểu thuyết", publisher: "Văn Học" }`                                                                      |
| **Steps**           | 1. Tìm kiếm theo `kw` và Submit.<br><br>2. Click checkbox Nhà xuất bản tương ứng (`a[key="publisher"][value="..."]` trong `.block-content.catalog-list`).<br><br>3. Chờ checkbox chuyển sang trạng thái checked.       |
| **Expected Result** | - Checkbox của publisher được chọn có class `m-checkbox-checked`.<br><br>- _Automation không verify tên NXB trên từng sản phẩm trong list — chỉ xác nhận trạng thái filter UI._                                         |

---

# SCENARIO 5: Lỗi chính tả & Nâng cao (Typo & Advanced)

## Mục tiêu kiểm thử

Kiểm tra engine tìm kiếm hỗ trợ gõ sai và luồng kết hợp Search + Filter.

---

### TC-SEARCH-S5-001 — Nhận diện dung sai lỗi chính tả (Typo Tolerance)

| Thuộc tính          | Nội dung                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Pre-condition**   | Đang ở trang chủ.                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| **Test Data**       | 19 case trong `typoTestData`, gồm 5 nhóm:<br><br>- **Thiếu ký tự:** `hry potter`, `đắc nhân tm`, `nh giả kim`, `tuổi trẻ đáng gá`<br>- **Thừa ký tự:** `câyy cam ngọt`, `hai số phậận`, `không giia đình`, `harry potterr`<br>- **Đảo vị trí:** `haryr potter`, `muôn kếip`, `chiến bnih`, `dắc nhan tâm`<br>- **Dính phím:** `jary potter`, `hoành tử bé`, `thú xhu`<br>- **Lỗi Telex/VNI:** `đắc nhân tậm`, `nhaaf giả kim`, `tuoir trẻ`, `hatj giống`              |
| **Steps**           | 1. Nhập từng `typo` và Submit.<br><br>2. Lấy tiêu đề **top 3** sản phẩm.                                                                                                                                                                                                                                                                                                                                                                                                |
| **Expected Result** | - Trong top 3 có **ít nhất 1** tiêu đề chứa chuỗi `expected` (so khớp normalize, không phân biệt hoa/thường).                                                                                                                                                                                                                                                                                                                                                            |

---

### TC-SEARCH-S5-002 — Kết hợp Tìm kiếm từ khóa và click Bộ lọc (Combined Search + Filter)

| Thuộc tính          | Nội dung                                                                                                                                                                                         |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Pre-condition**   | Đang ở trang chủ.                                                                                                                                                                                |
| **Test Data**       | Keyword: `tâm lý`<br><br>Publisher filter: `NXB Dân Trí` _(lấy từ `filterPublisherData[0]`)_                                                                                                     |
| **Steps**           | 1. Tìm kiếm `tâm lý` và Submit.<br><br>2. Click lọc Nhà xuất bản `NXB Dân Trí`.<br><br>3. Lấy tiêu đề top 3 sản phẩm.                                                                           |
| **Expected Result** | - Danh sách sản phẩm sau khi lọc có ít nhất 1 kết quả (số lượng tiêu đề > 0).<br><br>- _Automation không assert giá trị ô search sau khi lọc — chỉ kiểm tra có kết quả._                        |

---

### TC-SEARCH-S5-003 — Kiểm tra hiệu năng phản hồi cơ bản (Search Performance)

| Thuộc tính          | Nội dung                                                                                                                                                                                                          |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Pre-condition**   | Đang ở trang chủ.                                                                                                                                                                                                 |
| **Test Data**       | Keyword: `harry potter`<br><br>Max Acceptable Time: **5000ms** (5 giây)                                                                                                                                           |
| **Steps**           | 1. Ghi nhận `startTime = Date.now()`.<br><br>2. Submit tìm kiếm.<br><br>3. Chờ sản phẩm đầu tiên visible (`productTitleLinks.first()`, timeout 15 giây).<br><br>4. Tính `loadTime = endTime - startTime`.         |
| **Expected Result** | - Thời gian từ lúc submit đến lúc sản phẩm đầu tiên hiển thị **≤ 5000ms**.<br><br>- _Lưu ý thực tế:_ thời gian phụ thuộc mạng và tải server Fahasa; ngưỡng 5 giây phản ánh SLA thực tế đã điều chỉnh từ mốc 3 giây ban đầu. |

---

# 3. Ma trận theo dõi Kỹ thuật kiểm thử (Testing Techniques Matrix)

| Kỹ thuật Thiết kế (ISTQB)         | Kịch bản áp dụng | Mục đích sử dụng                                                                                                                   |
| --------------------------------- | ---------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| **Equivalence Partitioning (EP)** | Scenario 1, 2, 5 | Phân hoạch vùng dữ liệu đầu vào (Tên chuẩn, tên một phần, sai chính tả, chuỗi rác, ký tự đặc biệt/Emoji) để tối ưu số lượng test. |
| **Boundary Value Analysis (BVA)** | Scenario 3       | Xác định hành vi ở cực hạn độ dài từ khóa (1, 100, 400 ký tự).                                                                     |
| **Error Guessing**                | Scenario 2, 5    | Khoảng trắng vô nghĩa, ký tự đặc biệt, lỗi gõ dính phím, lỗi Telex/VNI.                                                            |
| **Use Case Testing**              | Scenario 4, 5    | Luồng thực tế: tìm kiếm + lọc giá (kèm edge case Min>Max), lọc NXB, kết hợp Search + Filter.                                       |

---

# 4. Ánh xạ Test Case ↔ Automation

| Test Case ID      | File automation        | Data source (`search.data.ts`)     |
| ----------------- | ---------------------- | ---------------------------------- |
| TC-SEARCH-S1-001  | `search.spec.ts:31`    | `s1_exactMatchData`                |
| TC-SEARCH-S1-002  | `search.spec.ts:47`    | `s1_partialMatchData` (filtered)   |
| TC-SEARCH-S1-003  | `search.spec.ts:66`    | `s1_noMarkData`                    |
| TC-SEARCH-S1-004  | `search.spec.ts:95`    | `s1_skuData`                       |
| TC-SEARCH-S2-001  | `search.spec.ts:112`   | `s2_emptySpacesData`               |
| TC-SEARCH-S2-002  | `search.spec.ts:125`   | `s2_specialAndXssData` (non-SQL)   |
| TC-SEARCH-S2-003  | `search.spec.ts:138`   | `s2_specialAndXssData` (SQL desc)  |
| TC-SEARCH-S2-004  | `search.spec.ts:151`   | `s2_notFoundData`                  |
| TC-SEARCH-S2-005  | `search.spec.ts:161`   | `s2_trimData`                      |
| TC-SEARCH-S3-001  | `search.spec.ts:176`   | `s3_boundaryData`                  |
| TC-SEARCH-S4-001  | `search.spec.ts:190`   | `filterPriceData`                  |
| TC-SEARCH-S4-002  | `search.spec.ts:251`   | `filterPublisherData`              |
| TC-SEARCH-S5-001  | `search.spec.ts:273`   | `typoTestData`                     |
| TC-SEARCH-S5-002  | `search.spec.ts:291`   | `filterPublisherData[0]`           |
| TC-SEARCH-S5-003  | `search.spec.ts:308`   | hardcoded `"harry potter"`         |
