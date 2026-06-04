import { expect, type Locator, type Page } from "@playwright/test";

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
      "text=/giỏ hàng.*(trống|rỗng|chưa có|không có sản phẩm)/i",
    );
    this.continueShoppingBtn = page.locator(
      "a, button",
      { hasText: /tiếp tục mua sắm|mua sắm ngay/i },
    );
    this.promoBlock = page.locator("#block-totals, .fhs_checkout_event_promotion");
    this.loginBtn = page.locator(
      'button[title="Đăng nhập"], button.fhs_btn_default:has-text("Đăng nhập")',
    ).first();
    this.loginUsername = page.locator("#login_username");
    this.loginPassword = page.locator("#login_password");
    this.loginSubmitBtn = page.locator("button.fhs-btn-login");
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

  async gotoProduct(url: string) {
    await this.page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    });
    await expect(this.addToCartBtn).toBeVisible({ timeout: 20000 });
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
    await this.page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});
  }

  async expectCartLoaded() {
    await expect(this.page.locator("body")).toBeVisible();
    const hasItems = (await this.cartItems.count()) > 0;
    const isEmpty = await this.emptyCartMessage.isVisible().catch(() => false);
    expect(hasItems || isEmpty).toBe(true);
  }

  async getItemRowCount(productName: string): Promise<number> {
    return this.getItemByProductName(productName).count();
  }

  async getProductIdByName(productName: string): Promise<string> {
    const row = this.getItemByProductName(productName).first();
    await expect(row).toBeVisible({ timeout: 10000 });
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

  async setQuantity(productName: string, qty: string) {
    const productId = await this.getProductIdByName(productName);
    const qtyInput = this.page.locator(`#qty-${productId}`);
    await qtyInput.click();
    await qtyInput.fill(qty);
    await qtyInput.blur();
    await this.page.waitForTimeout(800);
  }

  async pasteQuantity(productName: string, value: string) {
    const productId = await this.getProductIdByName(productName);
    const qtyInput = this.page.locator(`#qty-${productId}`);
    await qtyInput.click();
    await qtyInput.fill("");
    await qtyInput.evaluate((el, text) => {
      const input = el as HTMLInputElement;
      input.value = text;
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.dispatchEvent(new Event("change", { bubbles: true }));
    }, value);
    await qtyInput.blur();
    await this.page.waitForTimeout(800);
  }

  async clickIncreaseQty(productName: string) {
    const row = this.getItemByProductName(productName).first();
    await row.locator(".btn-add-qty").click();
    await this.page.waitForTimeout(800);
  }

  async clickDecreaseQty(productName: string) {
    const row = this.getItemByProductName(productName).first();
    await row.locator(".btn-subtract-qty").click();
    await this.page.waitForTimeout(800);
  }

  async isIncreaseQtyDisabled(productName: string): Promise<boolean> {
    const row = this.getItemByProductName(productName).first();
    const btn = row.locator(".btn-add-qty");
    const pointerEvents = await btn.evaluate(
      (el) => getComputedStyle(el).pointerEvents,
    );
    const opacity = await btn.evaluate((el) => getComputedStyle(el).opacity);
    return pointerEvents === "none" || Number(opacity) < 0.5;
  }

  async isDecreaseQtyDisabled(productName: string): Promise<boolean> {
    const row = this.getItemByProductName(productName).first();
    const btn = row.locator(".btn-subtract-qty");
    const pointerEvents = await btn.evaluate(
      (el) => getComputedStyle(el).pointerEvents,
    );
    const opacity = await btn.evaluate((el) => getComputedStyle(el).opacity);
    return pointerEvents === "none" || Number(opacity) < 0.5;
  }

  async getLineTotal(productName: string): Promise<number> {
    const row = this.getItemByProductName(productName).first();
    const priceText = await row.locator(".cart-price-total .price").first().innerText();
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
    const row = this.getItemByProductName(productName).first();
    return row.locator("input.checkbox-add-cart").isChecked();
  }

  async toggleProductCheck(productName: string) {
    const row = this.getItemByProductName(productName).first();
    await row.locator("input.checkbox-add-cart").click();
    await this.page.waitForTimeout(500);
  }

  async setProductChecked(productName: string, checked: boolean) {
    const isChecked = await this.isProductChecked(productName);
    if (isChecked !== checked) {
      await this.toggleProductCheck(productName);
    }
  }

  async checkAllProducts() {
    if (!(await this.selectAllCheckbox.isChecked())) {
      await this.selectAllCheckbox.click();
      await this.page.waitForTimeout(500);
    }
  }

  async uncheckAllProducts() {
    if (await this.selectAllCheckbox.isChecked()) {
      await this.selectAllCheckbox.click();
      await this.page.waitForTimeout(500);
    }
  }

  async isSelectAllChecked(): Promise<boolean> {
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

  /** @deprecated Dùng getCheckoutSubtotal() — đọc "Thành tiền" trên sidebar giỏ hàng */
  async getSelectedSubtotal(): Promise<number> {
    return this.getCheckoutSubtotal();
  }

  async deleteProduct(productName: string) {
    const row = this.getItemByProductName(productName).first();
    await row.locator(".btn-remove-desktop-cart").click();
    await expect(row).toBeHidden({ timeout: 15000 });
  }

  async clearCart() {
    await this.gotoCart();
    while ((await this.cartItems.count()) > 0) {
      const firstRow = this.cartItems.first();
      await firstRow.locator(".btn-remove-desktop-cart").click();
      await expect(firstRow).toBeHidden({ timeout: 15000 });
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
    await this.loginBtn.click();
    await expect(this.loginUsername).toBeVisible({ timeout: 10000 });
  }

  async login(phone: string, password: string) {
    await this.openLoginPopup();
    await this.loginUsername.fill(phone);
    await this.loginPassword.fill(password);
    if (await this.loginSubmitBtn.isEnabled()) {
      await this.loginSubmitBtn.click();
      await this.page.waitForTimeout(3000);
    }
  }

  async getMatchedFreeshipCount(): Promise<number> {
    return this.page
      .locator(".fhs-event-promo-list-item-freeship.matched")
      .count();
  }

  async getFreeshipProgressText(): Promise<string> {
    const progress = this.page
      .locator(".fhs-event-promo-list-item-freeship.not_matched .fhs-event-promo-item-minmax span")
      .first();
    if (await progress.isVisible().catch(() => false)) {
      return (await progress.innerText()).trim();
    }
    return "";
  }
}
