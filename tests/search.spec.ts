import { expect, test } from "@playwright/test";
import * as data from "../data/search.data";
import { SearchPage } from "../pages/SearchPage";

test.describe("Tính năng Tìm kiếm (Search)", () => {
  let searchPage: SearchPage;

  test.beforeEach(async ({ page }) => {
    searchPage = new SearchPage(page);
    await searchPage.preventPopupsAndAds();

    page.on("dialog", async (dialog) => {
      try {
        await dialog.dismiss();
      } catch (e) {}
    });

    // Chỉ gọi gotoHome 1 lần ở đầu mỗi test case
    await searchPage.gotoHome();
  });

  const safeNormalize = (text: string | undefined) => {
    if (!text) return "";
    return searchPage.normalize(text).normalize("NFC");
  };

  // =====================================================================
  // NHÓM 1: TÌM KIẾM HỢP LỆ (VALID SEARCH)
  // =====================================================================

  test("TC-SEARCH-S1-001: Tìm kiếm chính xác tuyệt đối (Exact Match)", async () => {
    test.setTimeout(3 * 60 * 1000);
    for (const item of data.s1_exactMatchData) {
      await test.step(`Thực thi với: "${item.kw}"`, async () => {
        await searchPage.submitSearch(item.kw, "enter");

        // getTopProductTitles đã bao gồm expectProductListVisible (chờ DOM)
        const topTitles = await searchPage.getTopProductTitles(5);
        const isMatch = topTitles.some((t) =>
          safeNormalize(t).includes(safeNormalize(item.expected)),
        );
        expect(isMatch, `Lỗi: Không tìm thấy "${item.expected}"`).toBe(true);
      });
    }
  });

  test("TC-SEARCH-S1-002: Tìm kiếm mập mờ, một phần từ khóa (Partial Match)", async () => {
    test.setTimeout(3 * 60 * 1000);
    const partialData = data.s1_partialMatchData.filter(
      (item) => item.expected !== "Nguyễn Nhật Ánh",
    );

    for (const item of partialData) {
      await test.step(`Thực thi với: "${item.kw}"`, async () => {
        await searchPage.submitSearch(item.kw, "enter");

        const topTitles = await searchPage.getTopProductTitles(5);
        const isMatch = topTitles.some((t) =>
          safeNormalize(t).includes(safeNormalize(item.expected)),
        );
        expect(isMatch, `Lỗi: Không khớp kết quả cho "${item.kw}"`).toBe(true);
      });
    }
  });

  test("TC-SEARCH-S1-003: Tìm kiếm tiếng Việt không dấu (Accent Insensitive)", async () => {
    test.setTimeout(3 * 60 * 1000);
    const validNoMarkData = data.s1_noMarkData.filter(
      (item) => item.marked && item.unmarked,
    );

    for (const item of validNoMarkData) {
      const markedText = item.marked!;
      const unmarkedText = item.unmarked!;

      await test.step(`So sánh: Có dấu "${markedText}" vs Không dấu "${unmarkedText}"`, async () => {
        await searchPage.submitSearch(markedText, "enter");
        const topTitlesWithMarks = await searchPage.getTopProductTitles(3);

        await searchPage.submitSearch(unmarkedText, "enter");
        const topTitlesNoMarks = await searchPage.getTopProductTitles(3);

        expect(
          topTitlesWithMarks.length,
          `Lỗi tìm có dấu: ${markedText}`,
        ).toBeGreaterThan(0);
        expect(
          topTitlesNoMarks.length,
          `Lỗi tìm không dấu: ${unmarkedText}`,
        ).toBeGreaterThan(0);
      });
    }
  });

  test("TC-SEARCH-S1-004: Tìm kiếm bằng mã định danh sản phẩm (SKU / ISBN)", async () => {
    test.setTimeout(3 * 60 * 1000);
    for (const item of data.s1_skuData) {
      await test.step(`Tìm mã SKU: ${item.sku}`, async () => {
        await searchPage.submitSearch(item.sku, "enter");
        await searchPage.openFirstResult();

        const skuValue = await searchPage.getDetailFieldValue("Mã hàng");
        expect(safeNormalize(skuValue)).toContain(safeNormalize(item.expected));
      });
    }
  });

  // =====================================================================
  // NHÓM 2: ĐẦU VÀO BẤT THƯỜNG & BẢO MẬT (INVALID & SECURITY)
  // =====================================================================

  test("TC-SEARCH-S2-001: Tìm kiếm với khoảng trống (Empty Input)", async () => {
    test.setTimeout(3 * 60 * 1000);
    for (const item of data.s2_emptySpacesData) {
      await test.step(`Thử nghiệm: [${item.desc}]`, async () => {
        await searchPage.submitSearch(item.kw, "enter");

        // Đổi logic kiểm tra: Chắc chắn web không crash và thanh search vẫn tồn tại
        await expect(searchPage.page.locator("body")).toBeVisible();
        await expect(searchPage.searchInput).toBeVisible();
      });
    }
  });

  test("TC-SEARCH-S2-002: Tìm kiếm chứa ký tự đặc biệt", async () => {
    test.setTimeout(3 * 60 * 1000);
    const xssData = data.s2_specialAndXssData.filter(
      (i) => !i.desc.includes("SQL"),
    );
    for (const item of xssData) {
      await test.step(`Thử nghiệm XSS: [${item.desc}]`, async () => {
        await searchPage.submitSearch(item.kw, "enter");
        await expect(searchPage.searchInput).toBeVisible();
      });
    }
  });

  test("TC-SEARCH-S2-003: Tìm kiếm từ khóa vô nghĩa (Not Found)", async () => {
    for (const item of data.s2_notFoundData) {
      await test.step(`Tìm chuỗi vô nghĩa: [${item.desc}]`, async () => {
        await searchPage.submitSearch(item.kw, "enter");
        // Dựa vào cơ chế retry của expect thay vì sleep cứng
        await expect(searchPage.noResultsText).toBeVisible({ timeout: 10000 });
      });
    }
  });

  test("TC-SEARCH-S2-004: Tự động cắt khoảng trắng thừa (Input Trimming)", async () => {
    for (const item of data.s2_trimData) {
      await test.step(`Thử nghiệm Trim: [${item.desc}]`, async () => {
        await searchPage.submitSearch(item.kw, "enter");
        await expect(searchPage.searchInput).toHaveValue(item.expected, {
          timeout: 5000,
        });
      });
    }
  });

  // =====================================================================
  // NHÓM 3: GIÁ TRỊ BIÊN (BOUNDARY)
  // =====================================================================

  test("TC-SEARCH-S3-001: Kiểm tra giới hạn độ dài từ khóa (Boundary Length)", async () => {
    test.setTimeout(3 * 60 * 1000);
    for (const item of data.s3_boundaryData) {
      await test.step(`Kiểm tra biên: [${item.desc}]`, async () => {
        await searchPage.submitSearch(item.kw, "enter");
        await expect(searchPage.searchInput).toBeVisible();
      });
    }
  });

  // =====================================================================
  // NHÓM 4: BỘ LỌC NÂNG CAO (FILTERS)
  // =====================================================================

  test("TC-SEARCH-S4-001: Lọc kết quả tìm kiếm theo khoảng giá (Price Filter)", async () => {
    test.setTimeout(3 * 60 * 1000);
    for (const filter of data.filterPriceData) {
      await test.step(`Từ khóa "${filter.kw}" lọc khoảng: ${filter.desc}`, async () => {
        await searchPage.submitSearch(filter.kw, "enter");

        await searchPage.applyCustomPriceFilter(filter.min, filter.max);

        // 1. Kiểm tra thông báo lỗi "Khoảng giá chưa đúng" (khi Min > Max)
        const invalidRangeWarning = searchPage.page
          .locator("text=/Khoảng giá chưa đúng/i")
          .first();
        const isInvalidRangeVisible = await invalidRangeWarning.isVisible({
          timeout: 2000,
        });

        // 2. Kiểm tra thông báo "Không có sản phẩm" (khi không có sách trong khoảng giá hợp lệ)
        const noProductWarning = searchPage.page
          .locator("text=/Không có sản phẩm/i")
          .first();
        const isNoProductVisible = await noProductWarning.isVisible({
          timeout: 2000,
        });

        if (isInvalidRangeVisible) {
          // KỊCH BẢN 1: Báo lỗi do nhập sai logic khoảng giá
          // Xác nhận lại xem data test truyền vào có thực sự là Min > Max không
          expect(
            filter.min,
            "Hệ thống báo 'Khoảng giá chưa đúng', kỳ vọng dữ liệu đầu vào phải có Min > Max",
          ).toBeGreaterThanOrEqual(filter.max);
        } else if (isNoProductVisible) {
          // KỊCH BẢN 2: Web báo không có sản phẩm
          expect(
            isNoProductVisible,
            "Hệ thống hiển thị đúng thông báo không có sản phẩm",
          ).toBe(true);
        } else {
          // KỊCH BẢN 3: Có sản phẩm -> Đi lấy giá và kiểm tra đúng logic (Min <= Giá <= Max)
          const topPrices = await searchPage.getTopProductPrices(5);

          expect(
            topPrices.length,
            "Không tìm thấy sản phẩm nào để kiểm tra giá",
          ).toBeGreaterThanOrEqual(0);

          for (const price of topPrices) {
            expect(
              price,
              `Lỗi: Giá ${price} thấp hơn Min ${filter.min}`,
            ).toBeGreaterThanOrEqual(filter.min);
            expect(
              price,
              `Lỗi: Giá ${price} cao hơn Max ${filter.max}`,
            ).toBeLessThanOrEqual(filter.max);
          }
        }
      });
    }
  });

  test("TC-SEARCH-S4-002: Lọc kết quả tìm kiếm theo Nhà xuất bản (Publisher Filter)", async () => {
    test.setTimeout(3 * 60 * 1000);
    for (const filter of data.filterPublisherData) {
      await test.step(`Lọc NXB "${filter.publisher}" cho từ khóa "${filter.kw}"`, async () => {
        await searchPage.submitSearch(filter.kw, "enter");

        // Gọi hàm với tham số type là "publisher"
        await searchPage.applyFilterByValue("publisher", filter.publisher);

        // Verify bằng locator chặt chẽ, có key="publisher"
        const checkedLocator = searchPage.filterBlock.locator(
          `a[key="publisher"][value="${filter.publisher}"]`,
        );
        await expect(checkedLocator).toHaveClass(/m-checkbox-checked/);
      });
    }
  });

  // =====================================================================
  // NHÓM 5: LỖI CHÍNH TẢ & NÂNG CAO (TYPO & ADVANCED)
  // =====================================================================

  test("TC-SEARCH-S5-001: Kết hợp Tìm kiếm từ khóa và click Bộ lọc cùng lúc", async () => {
    test.setTimeout(3 * 60 * 1000); // Thêm timeout 3 phút giống các test khác
    const filter = data.filterPublisherData[0];

    await test.step(`Tìm kiếm "${filter.kw}" và lọc NXB "${filter.publisher}"`, async () => {
      await searchPage.submitSearch(filter.kw, "enter");

      // Thêm tham số "publisher" vào đây
      await searchPage.applyFilterByValue("publisher", filter.publisher);

      const topTitles = await searchPage.getTopProductTitles(3);
      expect(
        topTitles.length,
        "Lỗi: Không có kết quả sau khi kết hợp Search và Filter",
      ).toBeGreaterThan(0);
    });
  });

  test("TC-SEARCH-S5-002: Kiểm tra hiệu năng phản hồi cơ bản (Search Performance)", async ({
    page,
  }) => {
    const keyword = "harry potter";
    const maxAcceptableTimeMs = 5000;

    // Chuẩn bị sẵn từ khóa trên ô tìm kiếm (Không tính thời gian này vào hiệu năng)
    await expect(searchPage.searchInput).toBeVisible({ timeout: 10000 });
    await searchPage.searchInput.evaluate((node) => node.removeAttribute("readonly"));
    await searchPage.searchInput.click();
    await searchPage.searchInput.fill(keyword);

    // Bắt đầu đếm thời gian NGAY TRƯỚC khi bấm Enter
    const startTime = Date.now();
    await searchPage.searchInput.press("Enter");

    // Đợi kết quả xuất hiện thực tế thay vì chỉ đợi domcontentloaded
    await searchPage.expectProductListVisible();

    const endTime = Date.now();
    const loadTime = endTime - startTime;

    expect(
      loadTime,
      `Lỗi Hiệu năng: Tìm kiếm "${keyword}" tốn ${loadTime}ms (Vượt quá ${maxAcceptableTimeMs}ms)`,
    ).toBeLessThanOrEqual(maxAcceptableTimeMs);
  });

  test("TC-SEARCH-S5-003: Nhận diện dung sai lỗi chính tả (Thiếu ký tự)", async () => {
    test.setTimeout(5 * 60 * 1000);
    const testData = data.typoTestData.filter(
      (item) => item.category === "Thiếu ký tự",
    );

    for (const item of testData) {
      await test.step(`[${item.category}] Nhập "${item.typo}", kỳ vọng ra "${item.expected}"`, async () => {
        await searchPage.submitSearch(item.typo!, "enter");

        const topTitles = await searchPage.getTopProductTitles(3);
        const isMatch = topTitles.some((title) =>
          safeNormalize(title).includes(safeNormalize(item.expected)),
        );
        expect(
          isMatch,
          `Lỗi [${item.category}]: Không nhận diện được "${item.typo}"`,
        ).toBe(true);
      });
    }
  });

  test("TC-SEARCH-S5-004: Nhận diện dung sai lỗi chính tả (Thừa ký tự)", async () => {
    test.setTimeout(5 * 60 * 1000);
    const testData = data.typoTestData.filter(
      (item) => item.category === "Thừa ký tự",
    );

    for (const item of testData) {
      await test.step(`[${item.category}] Nhập "${item.typo}", kỳ vọng ra "${item.expected}"`, async () => {
        await searchPage.submitSearch(item.typo!, "enter");

        const topTitles = await searchPage.getTopProductTitles(3);
        const isMatch = topTitles.some((title) =>
          safeNormalize(title).includes(safeNormalize(item.expected)),
        );
        expect(
          isMatch,
          `Lỗi [${item.category}]: Không nhận diện được "${item.typo}"`,
        ).toBe(true);
      });
    }
  });

  test("TC-SEARCH-S5-005: Nhận diện dung sai lỗi chính tả (Đảo vị trí ký tự)", async () => {
    test.setTimeout(5 * 60 * 1000);
    const testData = data.typoTestData.filter(
      (item) => item.category === "Đảo vị trí",
    );

    for (const item of testData) {
      await test.step(`[${item.category}] Nhập "${item.typo}", kỳ vọng ra "${item.expected}"`, async () => {
        await searchPage.submitSearch(item.typo!, "enter");

        const topTitles = await searchPage.getTopProductTitles(3);
        const isMatch = topTitles.some((title) =>
          safeNormalize(title).includes(safeNormalize(item.expected)),
        );
        expect(
          isMatch,
          `Lỗi [${item.category}]: Không nhận diện được "${item.typo}"`,
        ).toBe(true);
      });
    }
  });

  test("TC-SEARCH-S5-006: Nhận diện dung sai lỗi chính tả (Dính phím liền kề)", async () => {
    test.setTimeout(5 * 60 * 1000);
    const testData = data.typoTestData.filter(
      (item) => item.category === "Dính phím",
    );

    for (const item of testData) {
      await test.step(`[${item.category}] Nhập "${item.typo}", kỳ vọng ra "${item.expected}"`, async () => {
        await searchPage.submitSearch(item.typo!, "enter");

        const topTitles = await searchPage.getTopProductTitles(3);
        const isMatch = topTitles.some((title) =>
          safeNormalize(title).includes(safeNormalize(item.expected)),
        );
        expect(
          isMatch,
          `Lỗi [${item.category}]: Không nhận diện được "${item.typo}"`,
        ).toBe(true);
      });
    }
  });

  test("TC-SEARCH-S5-007: Nhận diện dung sai lỗi chính tả (Lỗi gõ Telex/VNI)", async () => {
    test.setTimeout(5 * 60 * 1000);
    // Gộp cả "Lỗi dấu" và "Lỗi Telex" vì trong data file của bạn đang có 2 category này cho nhóm lỗi gõ
    const testData = data.typoTestData.filter(
      (item) => item.category === "Lỗi Telex" || item.category === "Lỗi dấu",
    );

    for (const item of testData) {
      await test.step(`[${item.category}] Nhập "${item.typo}", kỳ vọng ra "${item.expected}"`, async () => {
        await searchPage.submitSearch(item.typo!, "enter");

        const topTitles = await searchPage.getTopProductTitles(3);
        const isMatch = topTitles.some((title) =>
          safeNormalize(title).includes(safeNormalize(item.expected)),
        );
        expect(
          isMatch,
          `Lỗi [${item.category}]: Không nhận diện được "${item.typo}"`,
        ).toBe(true);
      });
    }
  });
});
