// =====================================================================
// DATA CHO SCENARIO 1: TÌM KIẾM HỢP LỆ (Hàng chục đầu sách và SKU thật)
// =====================================================================
export const s1_exactMatchData = [
  { kw: "hai số phận", expected: "Hai Số Phận" },
  { kw: "harry potter và hòn đá phù thủy", expected: "Harry Potter" },
];

export const s1_partialMatchData = [
  { kw: "so phan kane", expected: "Hai Số Phận" },
  { kw: "cam ngot", expected: "Cây Cam Ngọt" },
  { kw: "harry hòn đá", expected: "Harry Potter" },
  { kw: "nguyễn nhật ánh", expected: "Nguyễn Nhật Ánh" }, // Tên tác giả
];

export const s1_noMarkData = [
  { marked: "hai số phận", unmarked: "hai so phan" },
];

export const s1_skuData = [{ sku: "8935095635047", expected: "8935095635047" }];

// =====================================================================
// DATA CHO SCENARIO 2: DỮ LIỆU RÁC, BẢO MẬT & KHOẢNG TRẮNG
// =====================================================================
export const s2_emptySpacesData = [
  { kw: "", desc: "Bỏ trống hoàn toàn" },
  { kw: " ", desc: "1 khoảng trắng" },
  { kw: "   \t  ", desc: "Khoảng trắng và phím Tab" },
];

export const s2_specialAndXssData = [
  { kw: "@#$%^&*", desc: "Ký tự đặc biệt thuần" },
  { kw: "📚👍❤", desc: "Ký tự Emoji" },
];

export const s2_notFoundData = [
  { kw: "alkdieyklkdkjsoid", desc: "Chuỗi ký tự gõ bừa" },
];

export const s2_trimData = [
  {
    kw: "  hai số phận  ",
    expected: "hai số phận",
    desc: "Khoảng trắng 2 đầu",
  },
];

// =====================================================================
// DATA CHO SCENARIO 3: KIỂM TRA BIÊN (Boundary)
// =====================================================================
export const s3_boundaryData = [
  { kw: "a", desc: "Biên dưới (1 ký tự)" },
  { kw: "a".repeat(100), desc: "Độ dài trung bình (100 ký tự)" },
  { kw: "a".repeat(400), desc: "Biên trên / Vượt biên (400 ký tự)" },
];

// =====================================================================
// DATA CHO BỘ LỌC (FILTER) VÀ LỖI CHÍNH TẢ (TYPO)
// =====================================================================
export const filterPriceData = [
  {
    kw: "kinh tế",
    min: 50000,
    max: 150000,
    desc: "Giá trung bình (50k - 150k)",
  },
  { kw: "tâm lý học", min: 200000, max: 500000, desc: "Giá cao (200k - 500k)" },
  { kw: "tiểu thuyết", min: 100000, max: 100000, desc: "Min bằng Max (100k)" },
  {
    kw: "lịch sử",
    min: 150000,
    max: 100000,
    desc: "Min lớn hơn Max (Báo lỗi khoảng giá)",
  },
];

export const filterPublisherData = [
  { kw: "tâm lý", publisher: "NXB Dân Trí" },
  { kw: "kinh tế", publisher: "NXB Trẻ" },
  { kw: "tiểu thuyết", publisher: "Văn Học" },
];

export const typoTestData = [
  // Nhóm 1: Thiếu ký tự
  { typo: "hry potter", expected: "harry potter", category: "Thiếu ký tự" },
  { typo: "đắc nhân tm", expected: "đắc nhân tâm", category: "Thiếu ký tự" },
  { typo: "nh giả kim", expected: "nhà giả kim", category: "Thiếu ký tự" },
  {
    typo: "tuổi trẻ đáng gá",
    expected: "tuổi trẻ đáng giá",
    category: "Thiếu ký tự",
  },
  // Nhóm 2: Thừa ký tự
  { typo: "câyy cam ngọt", expected: "cây cam ngọt", category: "Thừa ký tự" },
  { typo: "haai số phận", expected: "hai số phận", category: "Thừa ký tự" },
  {
    typo: "không giia đình",
    expected: "không gia đình",
    category: "Thừa ký tự",
  },
  { typo: "harry potterr", expected: "harry potter", category: "Thừa ký tự" },
  // Nhóm 3: Đảo vị trí ký tự
  { typo: "haryr potter", expected: "harry potter", category: "Đảo vị trí" },
  {
    typo: "muôn kếip nhân sinh",
    expected: "muôn kiếp nhân sinh",
    category: "Đảo vị trí",
  },
  { typo: "dắc nhan tâm", expected: "đắc nhân tâm", category: "Đảo vị trí" },
  // Nhóm 4: Dính phím liền kề
  { typo: "jary potter", expected: "harry potter", category: "Dính phím" },
  { typo: "hoành tử bé", expected: "hoàng tử bé", category: "Dính phím" },
  { typo: "thú rội", expected: "thú tội", category: "Dính phím" },
  // Nhóm 5: Lỗi Telex / VNI
  { typo: "đắc nhân tậm", expected: "đắc nhân tâm", category: "Lỗi dấu" },
  { typo: "nhaf giả kim", expected: "nhà giả kim", category: "Lỗi Telex" },
  {
    typo: "muono kieps nhana sinh",
    expected: "muôn kiếp nhân sinh",
    category: "Lỗi Telex",
  },
];
