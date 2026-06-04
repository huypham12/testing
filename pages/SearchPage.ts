import { expect, type Locator, type Page } from "@playwright/test";

export class SearchPage {
  readonly page: Page;
  readonly searchInput: Locator;
  readonly searchSubmitBtn: Locator;
  readonly productTitleLinks: Locator;
  readonly suggestionDropdown: Locator;
  readonly suggestionFirstItem: Locator;
  readonly noResultsText: Locator;
  readonly searchResultsHeader: Locator;
  readonly captchaOrDeniedText: Locator;

  // --- Locators mới cho Bộ lọc & Giá ---
  readonly filterBlock: Locator;
  readonly priceMinInput: Locator;
  readonly priceMaxInput: Locator;
  readonly productPrices: Locator;

  constructor(page: Page) {
    this.page = page;

    // 1. Ô tìm kiếm và nút submit
    this.searchInput = page
      .locator('input#search_desktop, input.input-search, input[name="q"]')
      .first();
    this.searchSubmitBtn = page
      .locator("span.button-search, .button-search")
      .first();

    // 2. Danh sách sản phẩm
    this.productTitleLinks = page.locator(
      "h2.product-name-no-ellipsis a, h2.p-name-list a, .products-grid .p-name-list a",
    );
    this.productPrices = page.locator(".price-label .m-price-font");

    // 3. Khung gợi ý tìm kiếm
    this.suggestionDropdown = page
      .locator(
        ".product-suggestions, .form-suggestion-history, .search-autocomplete",
      )
      .first();

    this.suggestionFirstItem = this.suggestionDropdown
      .locator("a, span.form-suggestion_text, li")
      .first();

    // 4. Các thông báo hệ thống
    this.noResultsText = page.locator(".search-term-text", {
      hasText: "0 kết quả",
    });
    this.searchResultsHeader = page.locator(
      "text=/KẾT\\s*QUẢ\\s*TÌM\\s*KIẾM/i",
    );
    this.captchaOrDeniedText = page.locator("text=/captcha|access\\s*denied/i");

    // 5. Khởi tạo locators cho Bộ lọc (Filter)
    this.filterBlock = page.locator(".block-content.catalog-list");
    this.priceMinInput = page.locator('input[name="min"].min-input');
    this.priceMaxInput = page.locator('input[name="max"].max-input');
  }

  async preventPopupsAndAds() {
    await this.page.route("**/*", (route) => {
      const url = route.request().url();
      const adDomains = [
        "moengage.com",
        "useinsider.com",
        "clevertap.com",
        "googleadservices.com",
      ];
      if (adDomains.some((domain) => url.includes(domain))) {
        route.abort();
      } else {
        route.continue();
      }
    });

    await this.page.addInitScript(() => {
      const style = document.createElement("style");
      style.innerHTML = `
        [id^="moe-onsite-campaign"],
        .fancybox-overlay, .fancybox-wrap, .fancybox-bg,
        .modal-backdrop, .modal, #popup-modal,
        .insider-opt-in, iframe[title*="chat"] {
          display: none !important;
          opacity: 0 !important;
          visibility: hidden !important;
          pointer-events: none !important;
          z-index: -9999 !important;
        }
        body { overflow: auto !important; }
      `;
      document.head.appendChild(style);
    });
  }

  async gotoHome() {
    await this.page.goto("/", {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    });
  }

  async submitSearch(keyword: string, method: "enter" | "click") {
    await expect(this.searchInput).toBeVisible({ timeout: 10000 });
    await this.searchInput.evaluate((node) => node.removeAttribute("readonly"));
    await this.searchInput.click();
    await this.searchInput.fill(keyword);

    if (method === "click") {
      await this.searchSubmitBtn.click();
    } else {
      await this.searchInput.press("Enter");
    }
    // Đã xóa this.page.waitForLoadState("domcontentloaded") ở đây
  }

  async expectProductListVisible() {
    await expect(this.productTitleLinks.first()).toBeVisible({
      timeout: 15000,
    });
  }

  async getTopProductTitles(limit: number): Promise<string[]> {
    await this.expectProductListVisible();
    const textContents = await this.productTitleLinks.allTextContents();
    return textContents
      .map((t) => t.trim())
      .filter(Boolean)
      .slice(0, limit);
  }

  async getTopProductPrices(limit: number): Promise<number[]> {
    await this.expectProductListVisible();
    const priceTexts = await this.productPrices.allTextContents();
    return priceTexts.slice(0, limit).map((text) => {
      const parsed = parseInt(text.replace(/[^\d]/g, ""), 10);
      // Nếu text rỗng hoặc không parse được, trả về 0 để assert tự bắt lỗi, tránh crash code
      return isNaN(parsed) ? 0 : parsed;
    });
  }

  async openFirstResult() {
    await this.expectProductListVisible();
    await this.productTitleLinks.first().click();
    await this.page.waitForLoadState("domcontentloaded");
  }

  async getDetailFieldValue(label: string): Promise<string> {
    const byRow = this.page
      .locator(`xpath=//tr[th[normalize-space()="${label}"]]/td`)
      .first();
    return (await byRow.innerText().catch(() => "")).trim();
  }

  // --- Actions cho Bộ lọc (Filter) ---

  async applyFilterByValue(filterType: string, filterValue: string) {
    const filterOption = this.filterBlock
      .locator(`a[key="${filterType}"][value="${filterValue}"]`)
      .first();
    await filterOption.waitFor({ state: "visible" });
    await filterOption.click();

    // Chờ UI cập nhật trạng thái đã tick thay vì chờ bắt request
    await expect(filterOption).toHaveClass(/m-checkbox-checked/, {
      timeout: 15000,
    });
    await this.page.waitForTimeout(1000); // Đợi 1 nhịp cho DOM lưới sản phẩm render lại
  }

  async applyCustomPriceFilter(min: number, max: number) {
    await this.priceMinInput.waitFor({ state: "visible" });
    await this.priceMinInput.fill(min.toString());
    await this.priceMaxInput.fill(max.toString());

    await this.priceMaxInput.press("Enter");

    // SỬA Ở ĐÂY: Xóa waitForTimeout(1500).
    // Thay bằng việc chờ động: Đợi danh sách sản phẩm render xong (tối đa 15s)
    await expect(this.productTitleLinks.first()).toBeVisible({
      timeout: 15000,
    });
  }

  normalize(s: string): string {
    return s.replace(/\s+/g, " ").trim().toLowerCase();
  }
}
