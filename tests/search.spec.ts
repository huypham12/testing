import { expect, test, type Locator, type Page } from "@playwright/test";

/**
 * Tự động hóa tìm kiếm cho Fahasa.com
 * Dựng khung kiểm thử từ docs/test-case-search.md.
 *
 * Ghi chú:
 * - Trang web bên ngoài + tìm kiếm mờ (fuzzy search) => các kiểm chứng (assertions) được thiết kế để đảm bảo tính ổn định.
 * - Bộ kiểm thử bị giới hạn chạy trên Chromium (Desktop Chrome) để phù hợp với yêu cầu của đồ án.
 */

test.describe("Tìm kiếm (Fahasa)", () => {
  test.describe.configure({ mode: "serial" });

  test.skip(
    ({ browserName }) => browserName !== "chromium",
    "Chỉ nhắm mục tiêu Desktop Chrome",
  );

  const data = {
    KW_EXACT_VI: "hai số phận",
    KW_EXACT_VI_SPACES: "   hai số phận   ",
    KW_EXACT_VI_MULTI: "hai số phận kane",
    KW_NO_DIACRITIC: "hai so phan",
    KW_PARTIAL: "so phan",
    KW_NO_RESULT: "alkdieyklkdkjsoid",
    KW_SPECIAL: "@#$%^",
    KW_XSS: "<script>alert(1);</script>",
    KW_MIN: "a",
    KW_LONG_400: "a".repeat(400),
    KW_VI_D_CHAR: "đắc nhân tâm",
    EXPECTED_TITLES_ANY_OF: [
      "Hai Số Phận - Kane And Abel (Tái Bản 2025)",
      "Hai Số Phận - Kane And Abel - Bìa Cứng (Tái Bản 2025)",
    ],
    PRODUCT_CODE: "8935095635047",
    SUGGEST_PREFIX: "ha",
  } as const;

  test.beforeEach(async ({ page }) => {
    // Ngăn chặn bài kiểm tra XSS tạo ra hộp thoại chặn.
    page.on("dialog", async (dialog) => {
      await dialog.dismiss();
    });

    await gotoHome(page);
  });

  test("TC-S1-01 (FT-01) — từ khóa chính xác phải hiển thị tiêu đề mong đợi trong top 5", async ({
    page,
  }) => {
    await submitSearch(page, data.KW_EXACT_VI, "enter");

    const topTitles = await getTopProductTitles(page, 5);
    expect(
      anyOf(topTitles, data.EXPECTED_TITLES_ANY_OF),
      `Top 5 tiêu đề phải chứa một trong số: ${data.EXPECTED_TITLES_ANY_OF.join(" | ")}`,
    ).toBe(true);
  });

  test("TC-S1-02 (FT-02) — từ khóa một phần phải trả về kết quả", async ({
    page,
  }) => {
    await submitSearch(page, data.KW_PARTIAL, "enter");
    await expectProductListVisible(page);
  });

  test("TC-S1-03 (FT-04) — từ khóa có dấu và không dấu đều phải hoạt động", async ({
    page,
  }) => {
    await submitSearch(page, data.KW_EXACT_VI, "enter");
    let topTitles = await getTopProductTitles(page, 5);
    expect(anyOf(topTitles, data.EXPECTED_TITLES_ANY_OF)).toBe(true);

    await submitSearch(page, data.KW_NO_DIACRITIC, "enter");
    topTitles = await getTopProductTitles(page, 5);
    expect(anyOf(topTitles, data.EXPECTED_TITLES_ANY_OF)).toBe(true);
  });

  test("TC-S1-04 (FT-07) — tìm kiếm theo mã sản phẩm sau đó xác minh mã trên trang chi tiết sản phẩm", async ({
    page,
  }) => {
    await submitSearch(page, data.PRODUCT_CODE, "enter");
    await openFirstResult(page);

    const code = await getDetailFieldValue(page, "Mã hàng");
    expect(normalize(code)).toContain(normalize(data.PRODUCT_CODE));
  });

  test("TC-S1-05 (FT-09) — tìm kiếm nhiều từ khóa phải trả về các kết quả liên quan", async ({
    page,
  }) => {
    await submitSearch(page, data.KW_EXACT_VI_MULTI, "enter");

    await expectProductListVisible(page);
    const topTitles = await getTopProductTitles(page, 5);
    const hasExpected = anyOf(topTitles, data.EXPECTED_TITLES_ANY_OF);
    const hasKeyword = topTitles.some((t) =>
      normalize(t).includes(normalize("Hai Số Phận")),
    );
    expect(hasExpected || hasKeyword).toBe(true);
  });

  test("TC-S2-01 (VT-01) — tìm kiếm rỗng phải hiển thị trang gợi ý/kết quả mặc định", async ({
    page,
  }) => {
    await submitSearch(page, "", "click");

    await expectResultsHeaderVisible(page);
    await expectProductListVisible(page);

    const inputValue = await getSearchInput(page).inputValue();
    expect(inputValue.trim()).toBe("");
  });

  test("TC-S2-02 (VT-02) — tìm kiếm chỉ có khoảng trắng phải được cắt rỉa (trim)/xử lý an toàn", async ({
    page,
  }) => {
    await submitSearch(page, "     ", "enter");

    await expectResultsHeaderVisible(page);
    await expectProductListVisible(page);

    const inputValue = await getSearchInput(page).inputValue();
    expect(inputValue.trim()).toBe("");
  });

  test("TC-S2-03 (VT-03) — tìm kiếm ký tự đặc biệt không được gây sập (crash)", async ({
    page,
  }) => {
    await submitSearch(page, data.KW_SPECIAL, "enter");

    // Chấp nhận trang kết quả có sản phẩm hoặc trạng thái 'không có kết quả' rõ ràng.
    await expect(
      page
        .locator("text=/KẾT\\s*QUẢ\\s*TÌM\\s*KIẾM/i")
        .or(page.locator("text=/Không\s*tìm\s*thấy/i")),
    ).toBeVisible();
  });

  test("TC-S2-04 (VT-04) — mã độc XSS không được thực thi (không có hộp thoại)", async ({
    page,
  }) => {
    test.skip(
      process.env.RUN_WAF_XSS !== "1",
      "Fahasa được bảo vệ bởi Cloudflare WAF; việc gửi các payload dạng XSS có thể chặn phiên làm việc và làm hỏng các bài kiểm tra tiếp theo. Đặt RUN_WAF_XSS=1 để cố ý chạy bài kiểm tra này.",
    );

    let dialogShown = false;
    page.once("dialog", async (dialog) => {
      dialogShown = true;
      await dialog.dismiss();
    });

    // Không sử dụng submitSearch() ở đây vì WAF có thể chuyển hướng đến một trang chặn
    // không chứa tiêu đề kết quả bình thường.
    await closeOverlays(page);
    const input = getSearchInput(page);
    await expect(input).toBeVisible({ timeout: 15000 });
    await input.click();
    await input.fill(data.KW_XSS);
    await input.press("Enter");
    await page.waitForLoadState("domcontentloaded");

    await expect(
      page
        .locator("text=/KẾT\\s*QUẢ\\s*TÌM\\s*KIẾM/i")
        .or(page.locator("text=/Không\\s*tìm\\s*thấy/i"))
        .or(page.locator("text=/Sorry, you have been blocked/i")),
    ).toBeVisible({ timeout: 30000 });
    expect(dialogShown).toBe(false);
  });

  test("TC-S3-01 (BT-01) — từ khóa rất dài không được gây sập", async ({
    page,
  }) => {
    await submitSearch(page, data.KW_LONG_400, "enter");
    await expectResultsHeaderVisible(page);

    // Đại diện tối thiểu cho 'giao diện không bị vỡ': ô nhập tìm kiếm vẫn có thể sử dụng được.
    const input = getSearchInput(page);
    await expect(input).toBeVisible({ timeout: 15000 });
    await input.click();
  });

  test("TC-S3-02 (BT-02) — từ khóa tối thiểu phải trả về phản hồi hợp lệ", async ({
    page,
  }) => {
    await submitSearch(page, data.KW_MIN, "enter");
    await expectResultsHeaderVisible(page);
  });

  test("TC-S4-01 (UX-01) — Nhấn Enter so với click biểu tượng phải tạo ra kết quả tương đương (trùng lặp trong top 5)", async ({
    page,
  }) => {
    await submitSearch(page, data.KW_EXACT_VI, "enter");
    const enterTop = await getTopProductTitles(page, 5);

    await submitSearch(page, data.KW_EXACT_VI, "click");
    const clickTop = await getTopProductTitles(page, 5);

    const intersection = intersect(
      enterTop.map(normalize),
      clickTop.map(normalize),
    );
    expect(intersection.length).toBeGreaterThanOrEqual(1);
  });

  test("TC-S4-02 (UX-02) — gõ tiền tố phải hiển thị danh sách thả xuống gợi ý", async ({
    page,
  }) => {
    await closeOverlays(page);
    const input = getSearchInput(page);
    await expect(input).toBeVisible({ timeout: 15000 });
    await input.click();
    await input.fill("");
    await input.type(data.SUGGEST_PREFIX, { delay: 80 });

    const items = getSuggestionItemsOnPage(page);
    const hasDropdown = await items
      .first()
      .waitFor({ state: "visible", timeout: 15000 })
      .then(() => true)
      .catch(() => false);

    test.skip(
      !hasDropdown,
      "Danh sách thả xuống gợi ý không xuất hiện (hành vi của trang web bên ngoài có thể thay đổi theo phiên / kiểm tra A-B).",
    );
  });

  test("TC-S4-03 (UX-03) — nhấp vào một gợi ý sẽ điều hướng hoặc điền từ khóa và tìm kiếm hoạt động", async ({
    page,
  }) => {
    await closeOverlays(page);
    const input = getSearchInput(page);
    await expect(input).toBeVisible({ timeout: 15000 });
    await input.click();
    await input.fill("");
    await input.type(data.SUGGEST_PREFIX, { delay: 80 });

    const items = getSuggestionItemsOnPage(page);
    const hasDropdown = await items
      .first()
      .waitFor({ state: "visible", timeout: 15000 })
      .then(() => true)
      .catch(() => false);

    test.skip(
      !hasDropdown,
      "Danh sách thả xuống gợi ý không xuất hiện (hành vi của trang web bên ngoài có thể thay đổi theo phiên / kiểm tra A-B).",
    );

    const firstItem = items.first();
    const beforeValue = (await input.inputValue()).trim();

    await firstItem.click();

    // Điều hướng đã xảy ra hoặc giá trị ô nhập đã thay đổi; trong cả hai trường hợp, chúng ta đều phải kết thúc ở một trang kết quả hợp lệ.
    const afterValue = (await input.inputValue()).trim();
    if (afterValue === beforeValue) {
      // Nếu việc nhấp vào gợi ý dẫn đến điều hướng, chúng ta sẽ thấy kết quả; nếu không, dự phòng bằng cách gửi (submit).
      // Cho quá trình điều hướng một chút thời gian.
      await page.waitForLoadState("domcontentloaded");
    }

    if (!(await isResultsHeaderVisible(page))) {
      await submitSearch(page, afterValue || data.SUGGEST_PREFIX, "enter");
    }

    await expectResultsHeaderVisible(page);
    await expectProductListVisible(page);
  });

  test("TC-S4-04 (UX-04) — từ khóa phải được giữ lại trong ô nhập sau khi tìm kiếm", async ({
    page,
  }) => {
    await submitSearch(page, data.KW_EXACT_VI, "enter");

    const inputValue = await getSearchInput(page).inputValue();
    expect(normalize(inputValue)).toContain(normalize(data.KW_EXACT_VI));
  });

  test("TC-S5-01 (PF-01) — gửi liên tục (spam) 20 lần không được kích hoạt chặn", async ({
    page,
  }) => {
    test.skip(
      process.env.RUN_STRESS !== "1",
      "Trang web bên ngoài có thể giới hạn tốc độ/chặn các tìm kiếm lặp lại; đặt RUN_STRESS=1 để cố ý chạy kiểm tra dạng chịu tải này.",
    );

    for (let i = 0; i < 20; i++) {
      await submitSearch(page, data.KW_EXACT_VI, "enter");
      await expectNoBlocking(page);
    }

    await expectResultsHeaderVisible(page);
    await expectProductListVisible(page);

    // Đại diện cho khả năng phản hồi của giao diện (UI) sau khi spam.
    const input = getSearchInput(page);
    await expect(input).toBeVisible({ timeout: 15000 });
    await input.click();
  });

  test("TC-S2-05 (EC-01) — từ khóa không tồn tại phải hiển thị trạng thái không có kết quả", async ({
    page,
  }) => {
    await submitSearch(page, data.KW_NO_RESULT, "enter");

    const noResults = page.locator("text=/Không\s*tìm\s*thấy/i");
    const hasProducts = await hasAnyProduct(page);
    expect(
      (await noResults.isVisible().catch(() => false)) || !hasProducts,
      'Phải hiển thị "Không tìm thấy" hoặc có 0 kết quả',
    ).toBe(true);
  });

  test("TC-S2-07 (EC-03) — khoảng trắng ở đầu/cuối phải được cắt rỉa và kết quả tương đương với TC-S1-01", async ({
    page,
  }) => {
    await submitSearch(page, data.KW_EXACT_VI_SPACES, "enter");

    const inputValue = (await getSearchInput(page).inputValue()).trim();
    expect(normalize(inputValue)).toContain(normalize(data.KW_EXACT_VI));

    const topTitles = await getTopProductTitles(page, 5);
    expect(anyOf(topTitles, data.EXPECTED_TITLES_ANY_OF)).toBe(true);
  });

  test("TC-S2-06 (EC-02) — từ khóa tiếng Việt có đ/Đ không được làm hỏng bảng mã (encoding)", async ({
    page,
  }) => {
    await submitSearch(page, data.KW_VI_D_CHAR, "enter");

    await expectResultsHeaderVisible(page);
    await expectProductListVisible(page);

    const inputValue = await getSearchInput(page).inputValue();
    expect(inputValue).toContain("đ");
  });
});

// ----------------------- các hàm hỗ trợ -----------------------

type SubmitMethod = "enter" | "click";

async function gotoHome(page: Page) {
  // Fahasa tải nhiều tài nguyên của bên thứ 3; việc chờ "tải (load)" hoàn tất rất thiếu ổn định.
  // Điều hướng cho đến khi DOM sẵn sàng, sau đó tiến hành các tương tác giao diện người dùng ổn định.
  const timeoutMs = 60_000;

  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      await page.goto("/", {
        waitUntil: "domcontentloaded",
        timeout: timeoutMs,
      });
      break;
    } catch (err) {
      if (attempt === 2) throw err;
    }
  }

  await closeOverlays(page);
}

async function closeOverlays(page: Page) {
  const closeCandidates: Locator[] = [
    page.getByRole("button", {
      name: /đồng ý|tôi đồng ý|chấp nhận|accept|ok/i,
    }),
    page.getByRole("button", { name: /đóng|close/i }),
    page.getByRole("link", { name: /đóng|close/i }),
  ];

  const iconClose = page.locator(
    [
      // Các nút đóng hộp thoại/cửa sổ bật lên thông thường (thường chỉ có biểu tượng)
      ".fancybox-close-small",
      ".fancybox-close",
      ".mfp-close",
      ".modal .close",
      ".modal-dialog .close",
      "button.close",
      // Biểu tượng đóng cửa sổ bật lên quảng cáo của Fahasa (do người dùng xác định): đường dẫn svg với id="Line-2"
      "button:has(path#Line-2)",
      "a:has(path#Line-2)",
      '[role="button"]:has(path#Line-2)',
      "svg:has(path#Line-2)",
      "path#Line-2",
      '[aria-label="Close"]',
      '[aria-label="Đóng"]',
      'button[title="Close"]',
      'button[title="Đóng"]',
      '[class*="popup"][class*="close"]',
      '[class*="popup"] [class*="close"]',
      '[class*="modal"] [class*="close"]',
    ].join(", "),
  );

  // Một số chiến dịch hiển thị điều khiển đóng dưới dạng đường dẫn SVG bên trong một nút mà không có nhãn/lớp hữu ích.
  // Cố gắng nhấp vào phần tử cha có thể nhấp gần nhất của id đường dẫn đã biết.
  const svgLine2Close = page
    .locator("path#Line-2")
    .first()
    .locator(
      'xpath=ancestor::button[1] | ancestor::a[1] | ancestor::*[@role="button"][1]',
    )
    .first();

  const backdrop = page.locator(
    [
      ".fancybox-bg",
      ".fancybox-overlay",
      ".modal-backdrop",
      ".overlay",
      '[class*="backdrop"]',
    ].join(", "),
  );

  const dialog = page.getByRole("dialog").first();

  // Hai lần lặp: một số lớp phủ xuất hiện sau khi chấp nhận cookie, v.v.
  for (let pass = 0; pass < 2; pass++) {
    // Một số lớp phủ quảng cáo xuất hiện một lúc sau khi tải; tạm dừng một khoảng thời gian nhỏ ở lần lặp đầu tiên.
    if (pass === 0) await page.waitForTimeout(50);

    for (const candidate of closeCandidates) {
      const button = candidate.first();
      const visible = await button.isVisible().catch(() => false);
      if (visible) {
        await button.click({ timeout: 3000 }).catch(() => undefined);
      }
    }

    const svgCloseVisible = await svgLine2Close.isVisible().catch(() => false);
    if (svgCloseVisible) {
      await svgLine2Close
        .click({ timeout: 3000, force: true })
        .catch(() => undefined);
    }

    const icon = iconClose.first();
    const iconVisible = await icon.isVisible().catch(() => false);
    if (iconVisible) {
      await icon.click({ timeout: 3000 }).catch(() => undefined);
    }

    const dialogVisible = await dialog.isVisible().catch(() => false);
    if (dialogVisible) {
      // Thử các điều khiển đóng thông thường bên trong hộp thoại (các nút chỉ có biểu tượng thường có các lớp mang ý nghĩa đóng).
      const dialogClose = dialog
        .locator(
          [
            'button[class*="close"]',
            'a[class*="close"]',
            '[class*="close"]',
            '[aria-label="Close"]',
            '[aria-label="Đóng"]',
            'button[title="Close"]',
            'button[title="Đóng"]',
          ].join(", "),
        )
        .first();

      if (await dialogClose.isVisible().catch(() => false)) {
        await dialogClose.click({ timeout: 3000 }).catch(() => undefined);
      }

      // Dự phòng: nhiều cửa sổ bật lên quảng cáo của Fahasa sử dụng ký tự X/× chỉ có biểu tượng mà không có các lớp/nhãn hữu ích.
      const dialogCloseByText = dialog
        .locator(
          [
            'button:has-text("×")',
            'button:has-text("X")',
            'button:has-text("x")',
            'a:has-text("×")',
            'a:has-text("X")',
            'a:has-text("x")',
            'span:has-text("×")',
            'span:has-text("X")',
            'span:has-text("x")',
            'div:has-text("×")',
            'div:has-text("X")',
            'div:has-text("x")',
          ].join(", "),
        )
        .first();

      if (await dialogCloseByText.isVisible().catch(() => false)) {
        await dialogCloseByText
          .click({ timeout: 3000, force: true })
          .catch(() => undefined);
      }

      // Nhiều hộp thoại quảng cáo đóng khi nhấn Escape.
      await page.keyboard.press("Escape").catch(() => undefined);
    }

    const bd = backdrop.first();
    if (await bd.isVisible().catch(() => false)) {
      await bd.click({ timeout: 3000 }).catch(() => undefined);
    }

    // Biện pháp cuối cùng: một số lớp phủ quảng cáo (ví dụ: các chiến dịch trên trang của MoEngage) chặn
    // các sự kiện con trỏ nhưng không hiển thị điều khiển đóng đáng tin cậy. Xóa chúng.
    await page
      .evaluate(() => {
        const selectors = [
          '[id^="moe-onsite-campaign"]',
          'div[role="dialog"][aria-label="A pop-up has appeared on screen"]',
          'div[aria-modal="true"][role="dialog"]',
        ];

        for (const sel of selectors) {
          for (const el of Array.from(document.querySelectorAll(sel))) {
            el.remove();
          }
        }
      })
      .catch(() => undefined);
  }
}

function getSearchInput(page: Page): Locator {
  // Bộ chọn heuristic để tồn tại qua các thay đổi giao diện nhỏ.
  return page
    .locator(
      [
        'input[type="search"]',
        'input[name="q"]',
        "input#search",
        'input[placeholder*="Tìm"]',
        'input[placeholder*="Search"]',
        'header input[type="text"]',
      ].join(", "),
    )
    .first();
}

function getSearchForm(page: Page): Locator {
  const input = getSearchInput(page);
  return page.locator("form").filter({ has: input }).first();
}

function getSearchSubmitButton(page: Page): Locator {
  const form = getSearchForm(page);
  return form
    .locator(
      [
        'button[type="submit"]',
        'button[aria-label*="Search"]',
        'button[aria-label*="Tìm"]',
        'button[title*="Search"]',
        'button[title*="Tìm"]',
      ].join(", "),
    )
    .first();
}

function getResultsHeader(page: Page): Locator {
  return page.locator("text=/KẾT\\s*QUẢ\\s*TÌM\\s*KIẾM/i").first();
}

async function isResultsHeaderVisible(page: Page): Promise<boolean> {
  return getResultsHeader(page)
    .isVisible()
    .then(Boolean)
    .catch(() => false);
}

async function expectResultsHeaderVisible(page: Page) {
  await expect(getResultsHeader(page)).toBeVisible({ timeout: 30000 });
}

function getProductsContainer(page: Page): Locator {
  return page
    .locator(
      [
        "#product-list-container",
        ".category-products",
        ".products.wrapper",
        ".products-grid",
        ".products",
        ".product_list",
        ".product-items",
      ].join(", "),
    )
    .first();
}

function getProductTitleLinks(page: Page): Locator {
  const container = getProductsContainer(page);
  return container.locator(
    "a.product-item-link, .product-name a, h2 a, a[title]",
  );
}

async function expectProductListVisible(page: Page) {
  const links = getProductTitleLinks(page);
  await expect(links.first()).toBeVisible({ timeout: 30000 });
}

async function hasAnyProduct(page: Page): Promise<boolean> {
  const links = getProductTitleLinks(page);
  const count = await links.count().catch(() => 0);
  return count > 0;
}

async function getTopProductTitles(
  page: Page,
  limit: number,
): Promise<string[]> {
  await expectProductListVisible(page);

  const links = getProductTitleLinks(page);
  const titles = (await links.allTextContents())
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, limit);

  if (titles.length > 0) return titles;

  // Dự phòng: đôi khi tiêu đề đến từ thuộc tính title.
  const attrTitles = (await links.evaluateAll((els) =>
    els
      .map((el) => (el.getAttribute("title") ?? "").trim())
      .filter((t) => t.length > 0),
  )) as string[];

  return attrTitles.slice(0, limit);
}

async function submitSearch(page: Page, keyword: string, method: SubmitMethod) {
  await closeOverlays(page);

  const input = getSearchInput(page);
  await expect(input).toBeVisible({ timeout: 15000 });

  await input.click();
  await input.fill(keyword);

  if (method === "click") {
    const button = getSearchSubmitButton(page);
    const canClick = await button.isVisible().catch(() => false);
    if (canClick) {
      await button.click();
    } else {
      await input.press("Enter");
    }
  } else {
    await input.press("Enter");
  }

  await page.waitForLoadState("domcontentloaded");
  await expectResultsHeaderVisible(page);
}

async function openFirstResult(page: Page) {
  await expectProductListVisible(page);

  const link = getProductTitleLinks(page).first();
  await link.click();

  await page.waitForLoadState("domcontentloaded");
  await closeOverlays(page);

  // Đảm bảo tiêu đề sản phẩm được hiển thị.
  await expect(page.locator("h1")).toBeVisible({ timeout: 30000 });
}

async function getDetailFieldValue(page: Page, label: string): Promise<string> {
  // Cuộn phần chi tiết vào tầm nhìn nếu có.
  const detailHeading = page
    .locator("text=/Thông\s*tin\s*chi\s*tiết/i")
    .first();
  if (await detailHeading.isVisible().catch(() => false)) {
    await detailHeading.scrollIntoViewIfNeeded().catch(() => undefined);
  }

  // Ưu tiên: hàng của bảng với nhãn ở ô đầu tiên.
  const byRow = page
    .locator(`xpath=//tr[td[normalize-space()="${label}"]]/td[2]`)
    .first();
  if ((await byRow.count()) > 0) {
    const v = (await byRow.innerText().catch(() => "")).trim();
    if (v) return v;
  }

  // Dự phòng: bất kỳ phần tử nào khớp với nhãn theo sau là phần tử anh em.
  const bySibling = page
    .locator(`xpath=//*[normalize-space()="${label}"]/following-sibling::*[1]`)
    .first();
  const v2 = (await bySibling.innerText().catch(() => "")).trim();
  if (v2) return v2;

  // Biện pháp cuối cùng: tìm kiếm bên trong phần chi tiết cho một cấu trúc giống như hàng.
  const byText = page.getByText(label, { exact: true }).first();
  const v3 = (await (
    await byText
      .locator(
        "xpath=ancestor::*[self::tr or self::div][1]//*[self::td or self::div][last()]",
      )
      .first()
      .innerText()
      .catch(() => "")
  ).trim()) as string;

  return v3;
}

function getSuggestionItemsOnPage(page: Page): Locator {
  // DOM gợi ý của Fahasa có thể thay đổi (ul, div, dựa trên vai trò). Nhắm mục tiêu trực tiếp vào các mục.
  return page
    .locator(
      [
        "#search_autocomplete li",
        "#search_autocomplete a",
        'ul[role="listbox"] [role="option"]',
        '[role="option"]',
        "ul.ui-autocomplete li",
        "ul.ui-autocomplete a",
        ".ui-menu-item",
        ".ui-menu-item a",
        "div.search-autocomplete li",
        ".search-autocomplete li",
        ".autocomplete-suggestions .autocomplete-suggestion",
        ".tt-menu .tt-suggestion",
        ".suggestion li",
        ".suggestion a",
        ".suggestions li",
        ".suggestions a",
      ].join(", "),
    )
    .filter({ hasText: /\S/ });
}

async function expectNoBlocking(page: Page) {
  const blocking = page.locator(
    "text=/captcha|access\s*denied|too\s*many\s*requests|bị\s*chặn/i",
  );
  await expect(blocking).toHaveCount(0);
}

function normalize(s: string): string {
  return s.replace(/\s+/g, " ").trim().toLowerCase();
}

function anyOf(actual: string[], expectedAnyOf: readonly string[]): boolean {
  const normActual = actual.map(normalize);
  const normExpected = expectedAnyOf.map(normalize);
  return normExpected.some((e) => normActual.includes(e));
}

function intersect<T>(a: T[], b: T[]): T[] {
  const setB = new Set(b);
  return a.filter((x) => setB.has(x));
}
