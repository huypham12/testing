import { expect, type Locator, type Page } from "@playwright/test";
import { getProduct, type CartLinePlan } from "../data/cart.data";

export class CartPage {
  readonly page: Page;

  readonly addToCartBtn: Locator;
  readonly addToCartSuccessToast: Locator;
  readonly cartBadge: Locator;
  readonly cartItems: Locator;
  readonly selectAllCheckbox: Locator;
  readonly emptyCartMessage: Locator;
  readonly continueShoppingBtn: Locator;
  readonly promoBlock: Locator;
  readonly loginBtn: Locator;
  readonly loginUsername: Locator;
  readonly loginPassword: Locator;
  readonly loginSubmitBtn: Locator;
  readonly cartLoadingOverlay: Locator;
  readonly searchInput: Locator;
  readonly firstSearchResult: Locator;

  constructor(page: Page) {
    this.page = page;

    this.addToCartBtn = page.locator("button.btn-cart-to-cart").first();
    this.addToCartSuccessToast = page.locator(".wrapper_box", {
      hasText: "Sản phẩm đã được thêm vào giỏ hàng",
    });
    this.cartBadge = page.locator(".cartmini_qty, .cart-number span").first();
    this.cartItems = page.locator(".item-product-cart");
    this.selectAllCheckbox = page.locator("#checkbox-all-products");
    this.emptyCartMessage = page.locator(
      "text=/(chưa có sản phẩm|giỏ hàng.*trống|giỏ hàng.*rỗng|không có sản phẩm)/i",
    );
    this.continueShoppingBtn = page.locator("a, button", {
      hasText: /tiếp tục mua sắm|mua sắm ngay/i,
    });
    this.promoBlock = page.locator(
      "#block-totals, .fhs_checkout_event_promotion",
    );
    this.loginBtn = page
      .locator(
        'button[title="Đăng nhập"], button.fhs_btn_default:has-text("Đăng nhập")',
      )
      .first();
    this.loginUsername = page.locator("#login_username");
    this.loginPassword = page.locator("#login_password");
    this.loginSubmitBtn = page.locator("button.fhs-btn-login");
    this.cartLoadingOverlay = page
      .locator(".fhs_checkout_block_loading")
      .first();

    this.searchInput = page.locator("#search_desktop");
    this.firstSearchResult = page
      .locator(".product-name-no-ellipsis a")
      .first();
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
      // CẬP NHẬT: Gỡ bỏ việc chặn .fancybox-* vì Fahasa dùng nó cho popup Voucher
      style.innerHTML = `
        [id^="moe-onsite-campaign"],
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

  async searchAndClickFirstProduct(keyword: string) {
    // Đảm bảo ô search hiện ra rồi mới tương tác
    await this.searchInput.waitFor({ state: "visible", timeout: 15000 });
    await this.searchInput.click();

    // QUAN TRỌNG: Dùng pressSequentially gõ từng chữ một để kích hoạt API gợi ý của Fahasa
    await this.searchInput.clear();
    await this.searchInput.pressSequentially(keyword, { delay: 100 });

    // KHÔNG ẤN ENTER Ở ĐÂY.
    // Chờ cái dropdown gợi ý xổ xuống và hiển thị kết quả đầu tiên
    await this.firstSearchResult.waitFor({ state: "visible", timeout: 15000 });

    // Click vào kết quả đầu tiên trong dropdown
    await this.firstSearchResult.click();

    // Đợi trang chi tiết sản phẩm load xong
    await this.page.waitForLoadState("domcontentloaded");
  }

  parsePrice(text: string): number {
    const parsed = parseInt(text.replace(/[^\d]/g, ""), 10);
    return Number.isNaN(parsed) ? 0 : parsed;
  }

  normalize(text: string): string {
    return text.replace(/\s+/g, " ").trim().toLowerCase();
  }

  getItemByProductName(productName: string): Locator {
    const keyword = productName.slice(0, 40);
    return this.cartItems.filter({
      has: this.page.locator("h2.product-name-full-text a", {
        hasText: keyword,
      }),
    });
  }

  async waitForCartUiReady() {
    if (await this.cartLoadingOverlay.isVisible().catch(() => false)) {
      await this.cartLoadingOverlay
        .waitFor({ state: "hidden", timeout: 20000 })
        .catch(() => {});
    }

    await expect
      .poll(
        async () => {
          if ((await this.cartItems.count()) > 0) return "items";
          if (await this.emptyCartMessage.isVisible().catch(() => false)) {
            return "empty";
          }
          if (await this.selectAllCheckbox.isVisible().catch(() => false)) {
            return "header";
          }
          return "";
        },
        { timeout: 20000 },
      )
      .not.toBe("");
  }

  private async expectProductRowVisible(productName: string): Promise<Locator> {
    const row = this.getItemByProductName(productName).first();
    await expect(row).toBeVisible({ timeout: 15000 });
    await expect(row.locator("input.checkbox-add-cart")).toBeVisible({
      timeout: 10000,
    });
    return row;
  }

  private async waitForCartActionSettled() {
    if (await this.cartLoadingOverlay.isVisible().catch(() => false)) {
      await this.cartLoadingOverlay
        .waitFor({ state: "hidden", timeout: 15000 })
        .catch(() => {});
    }
    await this.page.waitForTimeout(400);
  }

  // CẬP NHẬT: Thêm cờ expectAddToCart để linh hoạt cho test OOS
  async gotoProduct(url: string, expectAddToCart = true) {
    await this.page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    });
    if (expectAddToCart) {
      await expect(this.addToCartBtn).toBeVisible({ timeout: 20000 });
    }
  }

  async addToCartFromProductPage() {
    const responsePromise = this.page
      .waitForResponse(
        (resp) =>
          resp.url().includes("checkout/cart/add") &&
          resp.status() >= 200 &&
          resp.status() < 400,
        { timeout: 20000 },
      )
      .catch(() => null);

    const toastPromise = this.addToCartSuccessToast
      .waitFor({ state: "visible", timeout: 20000 })
      .catch(() => null);

    await this.addToCartBtn.click();
    await Promise.race([responsePromise, toastPromise]);
    await this.addToCartSuccessToast
      .waitFor({ state: "hidden", timeout: 15000 })
      .catch(() => {});
    await this.page.waitForTimeout(500);
  }

  async gotoCart() {
    await this.page.goto("/checkout/cart/", {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    });
    await this.waitForCartUiReady();
  }

  async expectCartLoaded() {
    await this.waitForCartUiReady();
  }

  async getItemRowCount(productName: string): Promise<number> {
    return this.getItemByProductName(productName).count();
  }

  async getProductIdByName(productName: string): Promise<string> {
    const row = await this.expectProductRowVisible(productName);
    const checkboxId = await row
      .locator('input.checkbox-add-cart[id^="checkbox-product-"]')
      .getAttribute("id");
    return checkboxId?.replace("checkbox-product-", "") ?? "";
  }

  async getQuantity(productName: string): Promise<number> {
    const productId = await this.getProductIdByName(productName);
    const qtyInput = this.page.locator(`#qty-${productId}`);
    return this.parsePrice(await qtyInput.inputValue());
  }

  async getRawQuantityInputValue(productName: string): Promise<string> {
    const productId = await this.getProductIdByName(productName);
    const qtyInput = this.page.locator(`#qty-${productId}`);
    return qtyInput.inputValue();
  }

  async setQuantity(productName: string, qty: string) {
    const productId = await this.getProductIdByName(productName);
    const qtyInput = this.page.locator(`#qty-${productId}`);
    await qtyInput.click();
    await qtyInput.fill(qty);
    await qtyInput.blur();
    await this.waitForCartActionSettled();
  }

  // CẬP NHẬT: Thay đổi logic paste thành select toàn bộ rồi insert native text
  async pasteQuantity(productName: string, value: string) {
    const productId = await this.getProductIdByName(productName);
    const qtyInput = this.page.locator(`#qty-${productId}`);
    await qtyInput.focus();
    await qtyInput.selectText();
    await this.page.keyboard.insertText(value);
    await qtyInput.blur();
    await this.waitForCartActionSettled();
  }

  async clickIncreaseQty(productName: string) {
    const row = await this.expectProductRowVisible(productName);
    await row.locator(".btn-add-qty").click();
    await this.waitForCartActionSettled();
  }

  async clickDecreaseQty(productName: string) {
    const row = await this.expectProductRowVisible(productName);
    await row.locator(".btn-subtract-qty").click();
    await this.waitForCartActionSettled();
  }

  private async isQtyButtonVisuallyDisabled(btn: Locator): Promise<boolean> {
    return btn.evaluate((el) => {
      const style = getComputedStyle(el);
      if (style.pointerEvents === "none" || Number(style.opacity) < 0.5) {
        return true;
      }
      if (el.classList.contains("disabled") || el.hasAttribute("disabled")) {
        return true;
      }
      const img = el.querySelector("img");
      if (img) {
        const imgStyle = getComputedStyle(img);
        if (Number(imgStyle.opacity) < 0.5) return true;
      }
      return false;
    });
  }

  async isIncreaseQtyDisabled(productName: string): Promise<boolean> {
    const row = this.getItemByProductName(productName).first();
    const btn = row.locator(".btn-add-qty");
    if (await this.isQtyButtonVisuallyDisabled(btn)) return true;

    const qtyBefore = await this.getQuantity(productName);
    await this.clickIncreaseQty(productName);
    const qtyAfter = await this.getQuantity(productName);
    return qtyAfter === qtyBefore;
  }

  async isDecreaseQtyDisabled(productName: string): Promise<boolean> {
    const row = this.getItemByProductName(productName).first();
    const btn = row.locator(".btn-subtract-qty");
    if (await this.isQtyButtonVisuallyDisabled(btn)) return true;

    const qtyBefore = await this.getQuantity(productName);
    await this.clickDecreaseQty(productName);
    const qtyAfter = await this.getQuantity(productName);
    return qtyAfter === qtyBefore;
  }

  async getLineTotal(productName: string): Promise<number> {
    const row = this.getItemByProductName(productName).first();
    const priceText = await row
      .locator(".cart-price-total .price")
      .first()
      .innerText();
    return this.parsePrice(priceText);
  }

  async getUnitPrice(productName: string): Promise<number> {
    const row = this.getItemByProductName(productName).first();
    const priceText = await row
      .locator(".cart-fhsItem-price .price")
      .first()
      .innerText();
    return this.parsePrice(priceText);
  }

  async isProductChecked(productName: string): Promise<boolean> {
    const row = await this.expectProductRowVisible(productName);
    return row.locator("input.checkbox-add-cart").isChecked();
  }

  async toggleProductCheck(productName: string) {
    const row = await this.expectProductRowVisible(productName);
    await row.locator("input.checkbox-add-cart").click();
    await this.waitForCartActionSettled();
  }

  async setProductChecked(productName: string, checked: boolean) {
    const isChecked = await this.isProductChecked(productName);
    if (isChecked !== checked) {
      await this.toggleProductCheck(productName);
    }
  }

  async checkAllProducts() {
    await expect(this.selectAllCheckbox).toBeVisible({ timeout: 15000 });
    if (!(await this.selectAllCheckbox.isChecked())) {
      await this.selectAllCheckbox.click();
      await this.waitForCartActionSettled();
    }
  }

  async uncheckAllProducts() {
    await expect(this.selectAllCheckbox).toBeVisible({ timeout: 15000 });
    if (await this.selectAllCheckbox.isChecked()) {
      await this.selectAllCheckbox.click();
      await this.waitForCartActionSettled();
    }
  }

  async isSelectAllChecked(): Promise<boolean> {
    await expect(this.selectAllCheckbox).toBeVisible({ timeout: 15000 });
    return this.selectAllCheckbox.isChecked();
  }

  async isSelectAllIndeterminate(): Promise<boolean> {
    return this.selectAllCheckbox.evaluate(
      (el: HTMLInputElement) => el.indeterminate,
    );
  }

  async getCheckoutSubtotal(): Promise<number> {
    const label = this.page.getByText("Thành tiền", { exact: true }).first();
    if (await label.isVisible().catch(() => false)) {
      const container = label.locator("xpath=..");
      const priceText = await container
        .locator("span, .price")
        .filter({ hasText: /đ/ })
        .first()
        .innerText()
        .catch(() => "");
      if (priceText) return this.parsePrice(priceText);
    }

    return this.getSelectedItemsSubtotal();
  }

  async getSelectedItemsSubtotal(): Promise<number> {
    const count = await this.cartItems.count();
    let total = 0;
    for (let i = 0; i < count; i++) {
      const row = this.cartItems.nth(i);
      const checked = await row.locator("input.checkbox-add-cart").isChecked();
      if (checked) {
        const priceText = await row
          .locator(".cart-price-total .price")
          .first()
          .innerText();
        total += this.parsePrice(priceText);
      }
    }
    return total;
  }

  async getSelectedSubtotal(): Promise<number> {
    return this.getCheckoutSubtotal();
  }

  async deleteProduct(productName: string) {
    const row = this.getItemByProductName(productName).first();
    await row.locator(".btn-remove-desktop-cart").click();
    await expect(row).toBeHidden({ timeout: 15000 });
    await this.waitForCartActionSettled();
  }

  async clearCart() {
    await this.gotoCart();

    // Chờ 2s để JavaScript kịp gắn sự kiện click vào nút xóa
    await this.page.waitForTimeout(2000);

    let currentCount = await this.cartItems.count();

    while (currentCount > 0) {
      // Click nút xóa của sản phẩm đầu tiên
      await this.cartItems.first().locator(".btn-remove-desktop-cart").click();

      // FIX LỖI: Chờ tổng số lượng phần tử thay đổi thay vì chờ giảm đúng 1 (vì có thể có sản phẩm tặng kèm bị xóa theo)
      await expect(this.cartItems).not.toHaveCount(currentCount, {
        timeout: 15000,
      });

      // Cập nhật lại số lượng count hiện tại để tiếp tục vòng lặp
      currentCount = await this.cartItems.count();

      // Thêm một khoảng nghỉ nhỏ để UI hoặc API không bị nghẽn
      await this.page.waitForTimeout(500);
    }
  }

  async isEmptyCart(): Promise<boolean> {
    const itemCount = await this.cartItems.count();
    if (itemCount === 0) return true;
    return this.emptyCartMessage.isVisible().catch(() => false);
  }

  async getCartBadgeCount(): Promise<number> {
    if (!(await this.cartBadge.isVisible().catch(() => false))) return 0;
    return this.parsePrice(await this.cartBadge.innerText());
  }

  async getItemErrorMessage(productName: string): Promise<string> {
    const row = this.getItemByProductName(productName).first();
    const error = row.locator(".item-msg.error");
    if (await error.isVisible().catch(() => false)) {
      return (await error.innerText()).trim();
    }
    return "";
  }

  async addProductByUrl(url: string, times = 1) {
    for (let i = 0; i < times; i++) {
      await this.gotoProduct(url);
      await this.addToCartFromProductPage();
    }
  }

  async openLoginPopup() {
    // 1. Về trang chủ, chỉ đợi DOM load xong, tuyệt đối KHÔNG dùng networkidle
    await this.page.goto("/", { waitUntil: "domcontentloaded" });
    await this.page.waitForTimeout(2000); // Cho UI thời gian thở để render

    // 2. Dùng Javascript gọi thẳng hàm mở Popup của Fahasa (chắc chắn 100% mở được)
    await this.page
      .evaluate(() => {
        const win = window as any;
        if (
          typeof win.fhs_account !== "undefined" &&
          win.fhs_account.showLoginPopup
        ) {
          win.fhs_account.showLoginPopup("login");
        }
      })
      .catch(() => {});

    // 3. Backup: Nếu hàm JS tịt, Playwright sẽ ép click (force: true) bỏ qua mọi vật cản
    try {
      await this.loginBtn.click({ force: true, timeout: 3000 });
    } catch (error) {
      /* ignore */
    }

    // 4. Chờ ô username xuất hiện
    await expect(this.loginUsername).toBeVisible({ timeout: 10000 });
  }

  async login(phone: string, password: string) {
    await this.openLoginPopup();

    // Giả lập gõ phím để kích hoạt validate của web
    await this.loginUsername.clear();
    await this.loginUsername.pressSequentially(phone, { delay: 50 });

    await this.loginPassword.clear();
    await this.loginPassword.pressSequentially(password, { delay: 50 });

    await expect(this.loginSubmitBtn).toBeEnabled({ timeout: 10000 });
    await this.loginSubmitBtn.click();

    // 1. Chờ popup biến mất
    await expect(this.loginUsername).toBeHidden({ timeout: 15000 });

    // 2. FIX LỖI RACE CONDITION & TYPESCRIPT:
    // Chuyển câu message thành tham số thứ 2 của expect()
    await expect(
      this.page.locator("#fhs_top_account_title"),
      "Lỗi: Trang chưa reload xong sau khi login hoặc login thất bại.",
    ).not.toContainText("Tài khoản", {
      timeout: 30000,
    });

    // 3. Cho DOM ổn định lại sau khi reload
    await this.page.waitForLoadState("domcontentloaded");
    await this.page.waitForTimeout(2000);
  }

  async buildCartFromPlan(plan: CartLinePlan[]) {
    for (const line of plan) {
      const product = getProduct(line.productId);
      await this.addProductByUrl(product.url);
      if (line.qty > 1) {
        await this.gotoCart();
        await this.setQuantity(product.name, String(line.qty));
      }
    }
    await this.gotoCart();
    await this.checkAllProducts();
  }

  async getStockLimitNoticeText(): Promise<string> {
    const notice = this.page.locator(
      "text=/Số lượng sản phẩm đã được cập nhật|giới hạn tồn kho|không có sẵn/i",
    );
    if (
      await notice
        .first()
        .isVisible()
        .catch(() => false)
    ) {
      return (await notice.first().innerText()).trim();
    }
    return "";
  }

  outOfStockOnProductPage(): Locator {
    return this.page.locator(
      "text=/Hết hàng|Không còn hàng|Ngừng kinh doanh/i",
    );
  }

  async openPromoPopup() {
    // 1. Tìm cái nút "Xem thêm" hoặc box khuyến mãi ở giỏ hàng để click
    const openers = [
      this.page.locator(".fhs_checkout_block_coupon_search").first(),
      this.page.locator(".fhs-event-promo-title-viewmore").first(),
      // Dựa vào HTML thật: onclick="fhs_promotion.showEventCart();"
      this.page
        .locator('div[onclick="fhs_promotion.showEventCart();"]')
        .first(),
      this.page.locator('text="8 khuyến mãi đủ điều kiện"').first(),
    ];

    let opened = false;
    for (const opener of openers) {
      if (await opener.isVisible().catch(() => false)) {
        await opener.click();
        opened = true;
        break;
      }
    }

    if (!opened) {
      console.log(
        "Cảnh báo: Không thể bấm nút mở popup bằng các selector thông thường, thử click ép (force).",
      );
      await this.page.evaluate(() => {
        // CẬP NHẬT: Ép kiểu window về any để TypeScript không báo lỗi đỏ
        const win = window as any;
        if (
          typeof win.fhs_promotion !== "undefined" &&
          win.fhs_promotion.showEventCart
        ) {
          win.fhs_promotion.showEventCart();
        }
      });
    }

    // 2. CHỜ DANH SÁCH MÃ GIẢM GIÁ XUẤT HIỆN
    // HTML thật có class .fhs-event-promo-list-item
    await expect(
      this.page.locator(".fhs-event-promo-list-item").first(),
    ).toBeVisible({ timeout: 15000 });
  }

  async closePromoPopup() {
    // Nếu nó là một cái popup, thường có nút close.
    // Do bạn chưa gửi HTML của cái header popup, nên ta dùng nút Escape hoặc click ra ngoài.
    const closeBtn = this.page.locator(".fhs_event_promo_btn_close").first();
    if (await closeBtn.isVisible().catch(() => false)) {
      await closeBtn.click();
    } else {
      await this.page.keyboard.press("Escape");
    }
    await this.page.waitForTimeout(500);
  }

  async getMatchedFreeshipCount(): Promise<number> {
    return this.page
      .locator(".fhs-event-promo-list-item-freeship.matched")
      .count();
  }

  async getPromoProgressTextByCode(code: string): Promise<string> {
    const item = this.page
      .locator(`.fhs-event-promo-list-item:has(button[coupon="${code}"])`)
      .first();

    if (await item.isVisible().catch(() => false)) {
      const progressText = item
        .locator(".fhs-event-promo-item-minmax span")
        .first();
      if (await progressText.isVisible().catch(() => false)) {
        return (await progressText.innerText()).trim();
      }
    }
    return "";
  }

  async isPromoMatchedByCode(code: string): Promise<boolean> {
    const item = this.page
      .locator(`.fhs-event-promo-list-item:has(button[coupon="${code}"])`)
      .first();
    if ((await item.count()) === 0) return false;

    const cls = (await item.getAttribute("class")) ?? "";
    return cls.includes("matched") && !cls.includes("not_matched");
  }

  async isFreeshipPromoMatched(): Promise<boolean> {
    // Tìm các thẻ voucher có chữ "Freeship" hoặc "vận chuyển" VÀ đang ở trạng thái "matched"
    const matchedFreeshipItems = this.page
      .locator(".fhs-event-promo-list-item.matched")
      .filter({ hasText: /Freeship|vận chuyển|Miễn phí giao hàng/i });

    // Trả về true nếu có ít nhất 1 mã freeship đủ điều kiện
    return (await matchedFreeshipItems.count()) > 0;
  }

  async applyPromoByCode(code: string) {
    // 1. Dùng Javascript can thiệp thẳng vào DOM để mở toang tất cả các block bị ẩn
    // Cách này loại bỏ hoàn toàn sự cố kẹt animation (xổ xuống) của web
    await this.page.evaluate(() => {
      const hiddenPanels = document.querySelectorAll(".panel-collapse");
      hiddenPanels.forEach((panel) => {
        panel.classList.remove("collapse", "out", "collapsed");
        panel.classList.add("in");
        (panel as HTMLElement).style.display = "block";
        (panel as HTMLElement).style.height = "auto";
        (panel as HTMLElement).style.visibility = "visible";
      });
    });

    await this.page.waitForTimeout(500); // Nghỉ nửa giây cho DOM ổn định

    // 2. Tìm nút Apply bằng mã code
    const btn = this.page.locator(`button[coupon="${code}"]`);

    // 3. Thực hiện Click. Nếu Playwright vẫn chê nút bị che, ta dùng Javascript ép click thẳng vào lõi DOM
    try {
      await btn.scrollIntoViewIfNeeded({ timeout: 2000 });
      // Dùng force: true để bỏ qua việc kiểm tra nút có bị phần tử khác đè lên không
      await btn.click({ force: true, timeout: 5000 });
    } catch (error) {
      console.log(
        "Click Playwright thất bại, chuyển sang Javascript click ép...",
      );
      await btn.evaluate((node: HTMLElement) => node.click());
    }

    await this.page.waitForTimeout(1500);
  }

  // ==== CÁC HÀM CŨ ====

  async getFreeshipProgressText(options?: {
    inPromoPopup?: boolean;
  }): Promise<string> {
    const scopes: Locator[] = options?.inPromoPopup
      ? [this.page.locator(".popup-loading-event-cart-info").first()]
      : [
          this.promoBlock,
          this.page.locator(".popup-loading-event-cart-info").first(),
          this.page.locator(".fhs-event-promo").first(),
        ];

    for (const scope of scopes) {
      if (!(await scope.isVisible().catch(() => false))) continue;
      const progress = scope
        .locator(
          ".fhs-event-promo-list-item-freeship.not_matched .fhs-event-promo-item-minmax span",
        )
        .filter({ hasText: /Mua thêm/i })
        .first();
      if (await progress.isVisible().catch(() => false)) {
        return (await progress.innerText()).trim();
      }
    }
    return "";
  }

  promoListItem(kind: "coupon" | "freeship", titlePattern: RegExp): Locator {
    const kindClass =
      kind === "coupon"
        ? ".fhs-event-promo-list-item-coupon"
        : ".fhs-event-promo-list-item-freeship";
    return this.page.locator(kindClass).filter({ hasText: titlePattern });
  }

  async isPromoItemMatched(
    kind: "coupon" | "freeship",
    titlePattern: RegExp,
  ): Promise<boolean> {
    const item = this.promoListItem(kind, titlePattern).first();
    if ((await item.count()) === 0) return false;
    const cls = (await item.getAttribute("class")) ?? "";
    return cls.includes("matched");
  }

  async isAnyPromoMatched(): Promise<boolean> {
    // Tìm xem có bất kỳ nút "Áp dụng" nào (đại diện cho việc đủ điều kiện) xuất hiện trong popup không
    const applyBtns = this.page.locator("button", { hasText: "Áp dụng" });

    // Nếu đếm được lớn hơn 0 tức là có ít nhất 1 mã có thể dùng
    return (await applyBtns.count()) > 0;
  }

  async getPromoStatusTextByTitle(
    titlePattern: RegExp | string,
  ): Promise<string> {
    // 1. Mở rộng tất cả các mục "Xem thêm" bị ẩn bên trong popup
    const viewMoreBtns = this.page.locator(".fhs-event-promo-list-viewmore");
    for (let i = 0; i < (await viewMoreBtns.count()); i++) {
      if (
        await viewMoreBtns
          .nth(i)
          .isVisible()
          .catch(() => false)
      ) {
        // Click thẳng vào element để mở accordion xổ xuống
        await viewMoreBtns
          .nth(i)
          .click()
          .catch(() => {});
        await this.page.waitForTimeout(500); // Chờ 0.5s cho animation xổ xuống kịp
      }
    }

    // 2. Tìm cái voucher chứa chữ cần tìm (Ví dụ: 999K)
    const item = this.page
      .locator(".fhs-event-promo-list-item")
      .filter({ hasText: titlePattern })
      .first();

    // Scroll tới voucher đó nếu danh sách quá dài bị khuất bên dưới
    await item.scrollIntoViewIfNeeded().catch(() => {});

    // 3. QUAN TRỌNG: Dùng textContent() thay vì innerText().
    // textContent sẽ móc được chữ ra kể cả khi CSS của nó đang lộn xộn.
    if ((await item.count()) > 0) {
      return (await item.textContent()) || "";
    }

    return "";
  }

  async applyPromoCoupon(titlePattern: RegExp) {
    await this.openPromoPopup();
    const item = this.page
      .locator(".fhs-event-promo-list-item-coupon.matched")
      .filter({ hasText: titlePattern })
      .first();
    await expect(item).toBeVisible({ timeout: 15000 });
    const applyBtn = item.locator(
      'button.fhs-btn-view-promo-coupon[apply="1"], button.fhs-btn-view-promo-coupon:not([apply="0"])',
    );
    await applyBtn.click();
    await this.page.waitForTimeout(1500);
    await this.closePromoPopup();
  }

  async applyPromoFreeship(titlePattern: RegExp) {
    await this.openPromoPopup();
    const item = this.page
      .locator(".fhs-event-promo-list-item-freeship.matched")
      .filter({ hasText: titlePattern })
      .first();
    await expect(item).toBeVisible({ timeout: 15000 });
    const applyBtn = item.locator("button.fhs-btn-view-promo-coupon").first();
    await applyBtn.click();
    await this.page.waitForTimeout(1500);
    await this.closePromoPopup();
  }

  async getAppliedCouponCount(): Promise<number> {
    return this.page
      .locator(
        ".fhs-event-promo-list-item-coupon.matched button.fhs-btn-view-promo-coupon[apply='0'], .fhs-event-promo-list-item-coupon.matched .fhs-btn-view-promo-coupon.applied",
      )
      .count();
  }
}
