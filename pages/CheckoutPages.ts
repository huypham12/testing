import { expect, type Locator, type Page } from "@playwright/test";

/**
 * Page Object Model cho trang Checkout của Fahasa.com
 * Bao gồm cả luồng Guest (form inline) và Logged-in
 *
 * ⚠️ LƯU Ý QUAN TRỌNG: Fahasa web sử dụng loading overlay (spinner)
 * sau hầu hết các thao tác thay đổi dữ liệu trên trang Checkout.
 * Mọi hàm thay đổi state đều phải gọi waitForCheckoutLoading() sau đó.
 */
export class CheckoutPage {
  readonly page: Page;

  // ==================== LOADING OVERLAY ====================
  readonly checkoutLoadingOverlay: Locator;

  // ==================== FORM ĐỊA CHỈ GIAO HÀNG (GUEST) ====================
  readonly fullNameInput: Locator;
  readonly emailInput: Locator;
  readonly phoneInput: Locator;
  readonly citySelect: Locator;        // select2 gốc
  readonly districtSelect: Locator;
  readonly wardSelect: Locator;
  readonly streetInput: Locator;

  // ==================== FORM ĐỊA CHỈ GIAO HÀNG (LOGGED-IN POPUP) ====================
  readonly addAddressBtn: Locator;
  readonly popupFullNameInput: Locator;
  readonly popupPhoneInput: Locator;
  readonly popupCitySelect: Locator;
  readonly popupDistrictSelect: Locator;
  readonly popupWardSelect: Locator;
  readonly popupStreetInput: Locator;
  readonly popupSaveBtn: Locator;
  readonly popupCancelBtn: Locator;

  // ==================== KHUYẾN MÃI / VOUCHER ====================
  readonly couponInput: Locator;
  readonly couponApplyBtn: Locator;
  readonly promoPopupOpenBtn: Locator;

  // ==================== GHI CHÚ ====================
  readonly noteCheckbox: Locator;
  readonly noteInput: Locator;

  // ==================== HÓA ĐƠN GTGT ====================
  readonly vatCheckbox: Locator;
  readonly vatPersonalRadio: Locator;
  readonly vatCompanyRadio: Locator;
  // Form Cá nhân
  readonly vatPersonalName: Locator;
  readonly vatPersonalAddress: Locator;
  readonly vatCitizenId: Locator;
  readonly vatPassportNo: Locator;
  readonly vatPersonalEmail: Locator;
  // Form Doanh nghiệp
  readonly vatCompanyBuyerName: Locator;
  readonly vatCompanyName: Locator;
  readonly vatCompanyAddress: Locator;
  readonly vatTaxCode: Locator;
  readonly vatBudgetCode: Locator;
  readonly vatCompanyEmail: Locator;

  // ==================== PHƯƠNG THỨC THANH TOÁN ====================
  readonly paymentMethodCOD: Locator;
  readonly paymentMethodZaloPay: Locator;
  readonly paymentMethodVNPAY: Locator;
  readonly paymentMethodShopeePay: Locator;
  readonly paymentMethodMomo: Locator;
  readonly paymentMethodATM: Locator;

  // ==================== NÚT XÁC NHẬN THANH TOÁN ====================
  readonly submitOrderBtn: Locator;

  // ==================== BLOCK TỔNG TIỀN ====================
  readonly orderSummaryBlock: Locator;

  // ==================== LOGIN (tái sử dụng từ CartPage) ====================
  readonly loginBtn: Locator;
  readonly loginUsername: Locator;
  readonly loginPassword: Locator;
  readonly loginSubmitBtn: Locator;

  // ==================== ADD TO CART (chuẩn bị giỏ hàng) ====================
  readonly addToCartBtn: Locator;
  readonly addToCartSuccessToast: Locator;
  readonly cartItems: Locator;
  readonly selectAllCheckbox: Locator;

  constructor(page: Page) {
    this.page = page;

    // Loading overlay — xuất hiện sau mỗi thao tác thay đổi dữ liệu
    this.checkoutLoadingOverlay = page.locator(".fhs_checkout_block_loading").first();

    // ====== FORM GUEST CHECKOUT ======
    this.fullNameInput = page.locator("#fhs_shipping_fullname");
    this.emailInput = page.locator("#fhs_shipping_email");
    this.phoneInput = page.locator("#fhs_shipping_telephone");
    this.citySelect = page.locator("#fhs_shipping_city_select");
    this.districtSelect = page.locator("#fhs_shipping_district_select");
    this.wardSelect = page.locator("#fhs_shipping_wards_select");
    this.streetInput = page.locator("#fhs_shipping_street");

    // ====== LOGGED-IN ADDRESS POPUP ======
    this.addAddressBtn = page.locator(".fhs_checkout_block_address_list-btn");
    this.popupFullNameInput = page.locator("#fhs_address_fullname");
    this.popupPhoneInput = page.locator("#fhs_address_telephone");
    this.popupCitySelect = page.locator("#fhs_address_city_select");
    this.popupDistrictSelect = page.locator("#fhs_address_district_select");
    this.popupWardSelect = page.locator("#fhs_address_wards_select");
    this.popupStreetInput = page.locator("#fhs_address_street");
    this.popupSaveBtn = page.locator("button.fhs-btn-saveaddress");
    this.popupCancelBtn = page.locator("button.fhs-btn-saveaddress-cancel");

    // ====== KHUYẾN MÃI ======
    this.couponInput = page.locator("#fhs_checkout_coupon");
    // Nút Áp dụng nằm cạnh ô input mã khuyến mãi
    this.couponApplyBtn = page.locator(
      ".fhs_checkout_coupon_btn, button:has-text('Áp dụng')"
    ).first();
    this.promoPopupOpenBtn = page.locator("text=Chọn mã khuyến mãi").first();

    // ====== GHI CHÚ ======
    this.noteCheckbox = page.locator("#fhs_checkout_note_checkbox");
    this.noteInput = page.locator("#fhs_checkout_note");

    // ====== HÓA ĐƠN GTGT ======
    this.vatCheckbox = page.locator("#fhs_checkout_vat_checkbox");
    this.vatPersonalRadio = page.locator('.radio-option-vat[data-type="personal"]');
    this.vatCompanyRadio = page.locator('.radio-option-vat[data-type="company"]');

    // Form Cá nhân
    this.vatPersonalName = page.locator("#fhs_checkout_name_personal");
    this.vatPersonalAddress = page.locator("#fhs_checkout_address_personal");
    this.vatCitizenId = page.locator("#fhs_checkout_citizen_id");
    this.vatPassportNo = page.locator("#fhs_checkout_passport_no");
    this.vatPersonalEmail = page.locator("#fhs_checkout_email_personal");

    // Form Doanh nghiệp
    this.vatCompanyBuyerName = page.locator("#fhs_checkout_name_company");
    this.vatCompanyName = page.locator("#fhs_checkout_companyname");
    this.vatCompanyAddress = page.locator("#fhs_checkout_companyaddress");
    this.vatTaxCode = page.locator("#fhs_checkout_companyvat");
    this.vatBudgetCode = page.locator("#fhs_checkout_budget_code");
    this.vatCompanyEmail = page.locator("#fhs_checkout_email_company");

    // ====== PHƯƠNG THỨC THANH TOÁN ======
    this.paymentMethodCOD = page.locator("#fhs_checkout_paymentmethod_cashondelivery");
    this.paymentMethodZaloPay = page.locator("#fhs_checkout_paymentmethod_zalopay");
    this.paymentMethodVNPAY = page.locator("#fhs_checkout_paymentmethod_vnpay");
    this.paymentMethodShopeePay = page.locator("#fhs_checkout_paymentmethod_shopeepay");
    this.paymentMethodMomo = page.locator("#fhs_checkout_paymentmethod_momo");
    this.paymentMethodATM = page.locator("#fhs_checkout_paymentmethod_banktransfer");

    // ====== NÚT XÁC NHẬN ======
    this.submitOrderBtn = page.locator(
      "button.fhs-btn-confirm:has-text('Xác nhận thanh toán'), " +
      "button.fhs_btn_order:has-text('Xác nhận thanh toán')"
    ).first();

    // ====== BLOCK TỔNG TIỀN ======
    this.orderSummaryBlock = page.locator("#fhs_checkout_block_order_review, .fhs_checkout_block_order");

    // ====== LOGIN ======
    this.loginBtn = page
      .locator('button[title="Đăng nhập"], button.fhs_btn_default:has-text("Đăng nhập")')
      .first();
    this.loginUsername = page.locator("#login_username");
    this.loginPassword = page.locator("#login_password");
    this.loginSubmitBtn = page.locator("button.fhs-btn-login");

    // ====== ADD TO CART ======
    this.addToCartBtn = page.locator("button.btn-cart-to-cart").first();
    this.addToCartSuccessToast = page.locator(".wrapper_box", {
      hasText: "Sản phẩm đã được thêm vào giỏ hàng",
    });
    this.cartItems = page.locator(".item-product-cart");
    this.selectAllCheckbox = page.locator("#checkbox-all-products");
  }

  // ==================== UTILITY METHODS ====================

  /** Chặn popup quảng cáo và cheat */
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

  /**
   * ⚠️ QUAN TRỌNG: Chờ loading overlay biến mất.
   * Phải gọi sau MỌI thao tác thay đổi dữ liệu trên trang Checkout.
   */
  async waitForCheckoutLoading() {
    // Chờ 1 chút cho loading kịp xuất hiện
    await this.page.waitForTimeout(300);
    // Sau đó chờ TẤT CẢ loading overlay biến mất
    const allLoadings = this.page.locator(".fhs_checkout_block_loading");
    const count = await allLoadings.count();
    for (let i = 0; i < count; i++) {
      const loading = allLoadings.nth(i);
      if (await loading.isVisible().catch(() => false)) {
        await loading.waitFor({ state: "hidden", timeout: 30000 }).catch(() => {});
      }
    }
    await this.page.waitForTimeout(500);
  }

  parsePrice(text: string): number {
    const parsed = parseInt(text.replace(/[^\d]/g, ""), 10);
    return Number.isNaN(parsed) ? 0 : parsed;
  }

  // ==================== NAVIGATION ====================

  async gotoCheckout() {
    await this.page.goto("/checkout/", {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    });
    await this.page.waitForTimeout(2000);
  }

  async gotoCart() {
    await this.page.goto("/checkout/cart/", {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    });
    await this.page.waitForTimeout(2000);
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

  async addProductByUrl(url: string, times = 1) {
    for (let i = 0; i < times; i++) {
      await this.gotoProduct(url);
      await this.addToCartFromProductPage();
    }
  }

  /** Chuẩn bị giỏ hàng từ plan rồi bấm Thanh toán để đến trang Checkout */
  async buildCartAndGoToCheckout(plan: { productId: string; qty: number }[]) {
    const { getProduct } = await import("../data/cart.data");
    for (const line of plan) {
      const product = getProduct(line.productId);
      await this.addProductByUrl(product.url);
      if (line.qty > 1) {
        await this.gotoCart();
        // Set quantity
        const keyword = product.name.slice(0, 40);
        const row = this.cartItems.filter({
          has: this.page.locator("h2.product-name-full-text a", { hasText: keyword }),
        });
        const checkboxId = await row
          .first()
          .locator('input.checkbox-add-cart[id^="checkbox-product-"]')
          .getAttribute("id");
        const productId = checkboxId?.replace("checkbox-product-", "") ?? "";
        const qtyInput = this.page.locator(`#qty-${productId}`);
        await qtyInput.click();
        await qtyInput.fill(String(line.qty));
        await qtyInput.blur();
        await this.page.waitForTimeout(1500);
      }
    }
    await this.gotoCart();

    // Tick chọn tất cả sản phẩm
    const selectAll = this.selectAllCheckbox;
    if (!(await selectAll.isChecked())) {
      await selectAll.click();
      await this.page.waitForTimeout(1000);
    }

    // Click nút "Thanh toán"
    const checkoutBtn = this.page.locator("span:has-text('Thanh toán')").first();
    await checkoutBtn.click();
    await this.page.waitForLoadState("domcontentloaded");
    await this.page.waitForTimeout(3000);
  }

  // ==================== SELECT2 DROPDOWN HANDLING ====================

  /**
   * Chọn giá trị trong Select2 dropdown (Fahasa dùng jQuery Select2).
   * Click vào container Select2 → gõ text → chọn kết quả đầu tiên.
   */
  async selectSelect2Option(selectId: string, optionText: string) {
    // Click vào Select2 container để mở dropdown
    const container = this.page.locator(
      `span.select2-container[data-select2-id] ~ ` +
      `span.select2-container, ` +
      `#${selectId} + .select2-container, ` +
      `[data-select2-id="${selectId}"] ~ .select2-container`
    ).first();

    // Cách tiếp cận trực tiếp: dùng JavaScript để mở Select2
    await this.page.evaluate((id: string) => {
      const $jq = (window as any).$jq || (window as any).jQuery || (window as any).$;
      if ($jq) {
        $jq(`#${id}`).select2("open");
      }
    }, selectId);

    await this.page.waitForTimeout(500);

    // Gõ text tìm kiếm vào ô search của Select2
    const searchInput = this.page.locator(".select2-search__field:visible").first();
    if (await searchInput.isVisible().catch(() => false)) {
      await searchInput.fill(optionText);
      await this.page.waitForTimeout(500);
    }

    // Click vào kết quả đầu tiên khớp
    const option = this.page
      .locator(".select2-results__option:visible", { hasText: optionText })
      .first();
    await option.click();

    // Chờ loading overlay biến mất
    await this.waitForCheckoutLoading();
  }

  /**
   * Chọn Tỉnh/Thành phố trên form Guest
   */
  async selectCity(cityName: string) {
    await this.selectSelect2Option("fhs_shipping_city_select", cityName);
  }

  /**
   * Chọn Quận/Huyện trên form Guest
   */
  async selectDistrict(districtName: string) {
    await this.selectSelect2Option("fhs_shipping_district_select", districtName);
  }

  /**
   * Chọn Phường/Xã trên form Guest
   */
  async selectWard(wardName: string) {
    await this.selectSelect2Option("fhs_shipping_wards_select", wardName);
  }

  // ==================== FORM GUEST CHECKOUT ====================

  /**
   * Điền đầy đủ thông tin giao hàng Guest
   */
  async fillGuestShippingAddress(data: {
    fullName: string;
    email: string;
    phone: string;
    city: string;
    district: string;
    ward: string;
    street: string;
  }) {
    // 1. Họ tên
    await this.fullNameInput.waitFor({ state: "visible", timeout: 10000 });
    await this.fullNameInput.clear();
    await this.fullNameInput.pressSequentially(data.fullName, { delay: 30 });

    // 2. Email
    await this.emailInput.clear();
    await this.emailInput.pressSequentially(data.email, { delay: 30 });

    // 3. SĐT
    await this.phoneInput.clear();
    await this.phoneInput.pressSequentially(data.phone, { delay: 30 });

    // 4. Tỉnh/Thành phố → Chờ loading
    await this.selectCity(data.city);

    // 5. Quận/Huyện → Chờ loading
    await this.selectDistrict(data.district);

    // 6. Phường/Xã → Chờ loading
    await this.selectWard(data.ward);

    // 7. Địa chỉ nhận hàng
    await this.streetInput.clear();
    await this.streetInput.pressSequentially(data.street, { delay: 30 });
    await this.page.waitForTimeout(500);
  }

  // ==================== VALIDATION ERROR HELPERS ====================

  /** Lấy thông báo lỗi của 1 trường (cùng cấp .fhs-input-box cha) */
  async getFieldErrorMessage(fieldLocator: Locator): Promise<string> {
    const parent = fieldLocator.locator("xpath=ancestor::div[contains(@class,'fhs-input-box')]").first();
    const alert = parent.locator(".fhs-input-alert");
    if (await alert.isVisible().catch(() => false)) {
      const text = (await alert.innerText()).trim();
      if (text) return text;
    }
    return "";
  }

  /** Kiểm tra trường có bị highlight đỏ hay không (class checked-error) */
  async isFieldHighlightedError(fieldLocator: Locator): Promise<boolean> {
    const parent = fieldLocator.locator("xpath=ancestor::div[contains(@class,'fhs-input-box')]").first();
    const cls = (await parent.getAttribute("class")) ?? "";
    return cls.includes("checked-error");
  }

  /** Lấy tất cả thông báo lỗi trên form hiện tại */
  async getAllErrorMessages(): Promise<string[]> {
    const alerts = this.page.locator(".fhs-input-alert:visible");
    const count = await alerts.count();
    const messages: string[] = [];
    for (let i = 0; i < count; i++) {
      const text = (await alerts.nth(i).innerText()).trim();
      if (text) messages.push(text);
    }
    return messages;
  }

  /** Lấy thông báo lỗi từ khối checked-msg (Defect-002: SĐT đã đăng ký) */
  async getPhoneRegisteredMessage(): Promise<string> {
    const msgBlock = this.page.locator(
      ".fhs-input-box.checked-msg .fhs-input-alert:visible"
    ).first();
    if (await msgBlock.isVisible().catch(() => false)) {
      return (await msgBlock.innerText()).trim();
    }
    return "";
  }

  // ==================== NÚT XÁC NHẬN THANH TOÁN ====================

  async clickSubmitOrder() {
    await this.submitOrderBtn.scrollIntoViewIfNeeded();
    await this.submitOrderBtn.click();
    await this.page.waitForTimeout(2000);
  }

  async isSubmitOrderEnabled(): Promise<boolean> {
    return this.submitOrderBtn.isEnabled();
  }

  // ==================== HÓA ĐƠN GTGT ====================

  async checkVatCheckbox() {
    if (!(await this.vatCheckbox.isChecked())) {
      await this.vatCheckbox.click();
      await this.page.waitForTimeout(500);
    }
  }

  async uncheckVatCheckbox() {
    if (await this.vatCheckbox.isChecked()) {
      await this.vatCheckbox.click();
      await this.page.waitForTimeout(500);
    }
  }

  async selectVatPersonal() {
    await this.vatPersonalRadio.click();
    await this.page.waitForTimeout(500);
  }

  async selectVatCompany() {
    await this.vatCompanyRadio.click();
    await this.page.waitForTimeout(500);
  }

  async isVatPersonalSelected(): Promise<boolean> {
    const radioBox = this.vatPersonalRadio.locator(".edit-vat-radio-box");
    const cls = (await radioBox.getAttribute("class")) ?? "";
    return cls.includes("checked");
  }

  async isVatCompanySelected(): Promise<boolean> {
    const radioBox = this.vatCompanyRadio.locator(".edit-vat-radio-box");
    const cls = (await radioBox.getAttribute("class")) ?? "";
    return cls.includes("checked");
  }

  /** Kiểm tra form VAT có đang hiển thị không */
  async isVatFormVisible(): Promise<boolean> {
    // Khi check checkbox, radio-option-container xuất hiện
    return this.page
      .locator(".radio-option-container:visible")
      .first()
      .isVisible()
      .catch(() => false);
  }

  /** Điền form VAT Cá nhân */
  async fillVatPersonal(data: {
    buyerName: string;
    address: string;
    citizenId: string;
    passportNo: string;
    email: string;
  }) {
    await this.vatPersonalName.clear();
    await this.vatPersonalName.pressSequentially(data.buyerName, { delay: 30 });
    await this.vatPersonalAddress.clear();
    await this.vatPersonalAddress.pressSequentially(data.address, { delay: 30 });
    await this.vatCitizenId.clear();
    await this.vatCitizenId.pressSequentially(data.citizenId, { delay: 30 });
    await this.vatPassportNo.clear();
    await this.vatPassportNo.pressSequentially(data.passportNo, { delay: 30 });
    await this.vatPersonalEmail.clear();
    await this.vatPersonalEmail.pressSequentially(data.email, { delay: 30 });
  }

  /** Điền form VAT Doanh nghiệp */
  async fillVatCompany(data: {
    buyerName: string;
    companyName: string;
    companyAddress: string;
    taxCode: string;
    budgetCode: string;
    email: string;
  }) {
    await this.vatCompanyBuyerName.clear();
    await this.vatCompanyBuyerName.pressSequentially(data.buyerName, { delay: 30 });
    await this.vatCompanyName.clear();
    await this.vatCompanyName.pressSequentially(data.companyName, { delay: 30 });
    await this.vatCompanyAddress.clear();
    await this.vatCompanyAddress.pressSequentially(data.companyAddress, { delay: 30 });
    await this.vatTaxCode.clear();
    await this.vatTaxCode.pressSequentially(data.taxCode, { delay: 30 });
    await this.vatBudgetCode.clear();
    await this.vatBudgetCode.pressSequentially(data.budgetCode, { delay: 30 });
    await this.vatCompanyEmail.clear();
    await this.vatCompanyEmail.pressSequentially(data.email, { delay: 30 });
  }

  /** Lấy thông báo lỗi MST (error-message) */
  async getVatTaxCodeError(): Promise<string> {
    const errorSpan = this.page.locator("#onestep_error_companyvat");
    if (await errorSpan.isVisible().catch(() => false)) {
      return (await errorSpan.innerText()).trim();
    }
    return "";
  }

  /** Lấy thông báo lỗi Email VAT (Cá nhân hoặc Doanh nghiệp) */
  async getVatEmailError(type: "personal" | "company"): Promise<string> {
    const id = type === "personal"
      ? "#onestep_error_email_personal"
      : "#onestep_error_email_company";
    const errorSpan = this.page.locator(id);
    if (await errorSpan.isVisible().catch(() => false)) {
      return (await errorSpan.innerText()).trim();
    }
    return "";
  }

  // ==================== PHƯƠNG THỨC THANH TOÁN ====================

  /** Chọn 1 phương thức thanh toán bằng value */
  async selectPaymentMethod(value: string) {
    const radio = this.page.locator(
      `input.fhs_checkout_paymentmethod_option[value="${value}"]`
    );
    
    // Tìm thẻ label đang trực tiếp bao bọc nút radio này
    const label = radio.locator("xpath=ancestor::label").first();
    
    // Scroll tới và thực hiện click chuột thật vào label
    await label.scrollIntoViewIfNeeded();
    await label.click();
    
    await this.waitForCheckoutLoading();
  }


  /** Kiểm tra phương thức thanh toán nào đang được chọn */
  async getSelectedPaymentMethod(): Promise<string> {
    const checked = this.page.locator(
      "input.fhs_checkout_paymentmethod_option:checked"
    );
    return (await checked.getAttribute("value")) ?? "";
  }

  // ==================== KHUYẾN MÃI (CHECKOUT PAGE) ====================

  /** Nhập mã khuyến mãi / Gift Card và bấm Áp dụng */
async applyCouponCode(code: string) {
  await this.couponInput.waitFor({ state: "visible", timeout: 10000 });
  await this.couponInput.clear();
  await this.couponInput.pressSequentially(code, { delay: 50 });
  
  // Nhấn phím Enter ngay trên ô input thay vì click nút
  await this.couponInput.press('Enter'); 
  
  await this.waitForCheckoutLoading();
}

  /** Mở popup chọn mã khuyến mãi */
  async openPromoPopup() {
    await this.promoPopupOpenBtn.click();
    await this.page.waitForTimeout(1000);
    // Chờ danh sách mã xuất hiện
    await expect(
      this.page.locator(".fhs-event-promo-list-item").first()
    ).toBeVisible({ timeout: 15000 });
  }

  /** Đóng popup chọn mã khuyến mãi */
  async closePromoPopup() {
    const closeBtn = this.page.locator(".fhs_event_promo_btn_close").first();
    if (await closeBtn.isVisible().catch(() => false)) {
      await closeBtn.click();
    } else {
      await this.page.keyboard.press("Escape");
    }
    await this.page.waitForTimeout(500);
  }

  /** Áp dụng voucher trong popup bằng mã code */
  async applyVoucherInPopup(code: string) {
    // Mở rộng tất cả các panel ẩn
    await this.page.evaluate(() => {
      const panels = document.querySelectorAll(".panel-collapse");
      panels.forEach((panel) => {
        panel.classList.remove("collapse", "out", "collapsed");
        panel.classList.add("in");
        (panel as HTMLElement).style.display = "block";
        (panel as HTMLElement).style.height = "auto";
        (panel as HTMLElement).style.visibility = "visible";
      });
    });
    await this.page.waitForTimeout(500);

    const btn = this.page.locator(`button[coupon="${code}"]`);
    try {
      await btn.scrollIntoViewIfNeeded({ timeout: 2000 });
      await btn.click({ force: true, timeout: 5000 });
    } catch {
      await btn.evaluate((node: HTMLElement) => node.click());
    }
    await this.waitForCheckoutLoading();
  }

  /** Bỏ chọn voucher đang áp dụng trong popup */
  async removeVoucherInPopup(code: string) {
    const btn = this.page.locator(`button[coupon="${code}"][apply="0"]`);
    if (await btn.isVisible().catch(() => false)) {
      await btn.click({ force: true });
      await this.waitForCheckoutLoading();
    }
  }

  /** Kiểm tra voucher có đang ở trạng thái "Đã áp dụng" không */
  async isVoucherApplied(code: string): Promise<boolean> {
    const btn = this.page.locator(`button[coupon="${code}"]`);
    const applyAttr = await btn.getAttribute("apply");
    return applyAttr === "0"; // apply="0" = Đã áp dụng, apply="1" = Chưa áp dụng
  }

  /** Kiểm tra voucher có bị mờ/disable không (không đủ điều kiện) */
  async isVoucherDisabled(code: string): Promise<boolean> {
    const item = this.page
      .locator(`.fhs-event-promo-list-item:has(button[coupon="${code}"])`)
      .first();
    const cls = (await item.getAttribute("class")) ?? "";
    return cls.includes("not_matched");
  }

  /** Lấy thông báo lỗi khi nhập mã khuyến mãi sai */
  async getCouponErrorMessage(): Promise<string> {
    // Tìm thông báo lỗi gần ô input coupon
    const errorMsg = this.page.locator(
      ".fhs_checkout_coupon_error:visible, " +
      ".fhs-input-alert:visible:near(#fhs_checkout_coupon)"
    ).first();
    if (await errorMsg.isVisible().catch(() => false)) {
      return (await errorMsg.innerText()).trim();
    }
    // Cũng check popup alert nếu có
    return "";
  }

  // ==================== BLOCK TỔNG TIỀN ====================

  /** Lấy phí vận chuyển hiển thị */
async getShippingFee(): Promise<number> {
    // ƯU TIÊN 1: Lấy trực tiếp từ block Phương thức vận chuyển (Dựa trên HTML thực tế)
    // Tìm thẻ div chứa dấu "đ" bên trong label của phương thức giao hàng
    const shippingOption = this.page.locator('#fhs_checkout_block_shippingmethod label.fhs-radio-big div').filter({ hasText: /đ|₫/i }).first();
    
    if (await shippingOption.isVisible().catch(() => false)) {
      const text = await shippingOption.innerText(); // Lấy ra: "Giao hàng tiêu chuẩn: 32.000 đ"
      
      // Mẹo chống lỗi: Tách chuỗi theo dấu ":" để lấy mảng bên phải, tránh parse nhầm số "2" trong chữ "Giao 2h"
      const priceString = text.includes(":") ? text.split(":")[1] : text;
      
      const parsed = this.parsePrice(priceString);
      if (parsed >= 0) return parsed;
    }

    // ƯU TIÊN 2: Fallback (Dự phòng) tìm dưới bảng Tổng tiền
    const summaryLabel = this.page.locator("text=/Phí vận chuyển|Vận chuyển/i").first();
    if (await summaryLabel.isVisible().catch(() => false)) {
      const container = summaryLabel.locator("xpath=..");
      const priceText = await container.innerText();
      return this.parsePrice(priceText);
    }

    return 0; // Trả về 0 nếu thực sự không tìm thấy
  }

  /** Lấy tổng số tiền cuối cùng */
  async getTotalAmount(): Promise<number> {
    const totalLabel = this.page.locator("text=Tổng Số Tiền").first();
    if (await totalLabel.isVisible().catch(() => false)) {
      const container = totalLabel.locator("xpath=..");
      const priceText = await container
        .locator("span, .price")
        .filter({ hasText: /đ/ })
        .first()
        .innerText()
        .catch(() => "");
      return this.parsePrice(priceText);
    }
    return 0;
  }

  /** Lấy thành tiền hàng */
  async getSubtotalAmount(): Promise<number> {
    const label = this.page.locator("text=Thành tiền").first();
    if (await label.isVisible().catch(() => false)) {
      const container = label.locator("xpath=..");
      const priceText = await container
        .locator("span, .price")
        .filter({ hasText: /đ/ })
        .first()
        .innerText()
        .catch(() => "");
      return this.parsePrice(priceText);
    }
    return 0;
  }

  /** Lấy giá trị giảm giá */
  async getDiscountAmount(): Promise<number> {
    const label = this.page.locator("text=Giảm giá").first();
    if (await label.isVisible().catch(() => false)) {
      const container = label.locator("xpath=..");
      const priceText = await container
        .locator("span, .price")
        .filter({ hasText: /đ/ })
        .first()
        .innerText()
        .catch(() => "");
      return this.parsePrice(priceText);
    }
    return 0;
  }

  // ==================== GHI CHÚ ====================

  async checkNoteCheckbox() {
    if (!(await this.noteCheckbox.isChecked())) {
      await this.noteCheckbox.click();
      await this.page.waitForTimeout(500);
    }
  }

  async uncheckNoteCheckbox() {
    if (await this.noteCheckbox.isChecked()) {
      await this.noteCheckbox.click();
      await this.page.waitForTimeout(500);
    }
  }

  async fillNote(text: string) {
    await this.noteInput.clear();
    await this.noteInput.pressSequentially(text, { delay: 30 });
  }

  async getNoteValue(): Promise<string> {
    return this.noteInput.inputValue();
  }

  // ==================== PHƯƠNG THỨC VẬN CHUYỂN ====================

  /** Kiểm tra block Phương thức vận chuyển có hiển thị hay không */
  async isShippingMethodVisible(): Promise<boolean> {
    const block = this.page.locator(
      "#fhs_checkout_block_shippingmethod, " +
      ".fhs_checkout_block:has-text('Phương thức vận chuyển')"
    ).first();
    return block.isVisible().catch(() => false);
  }

  // ==================== BLOCK KIỂM TRA LẠI ĐƠN HÀNG ====================

  /** Kiểm tra sản phẩm hiển thị đúng trong block review */
  async getOrderReviewProductName(): Promise<string> {
    const productName = this.page.locator(
      ".fhs_checkout_block_order .product-name, " +
      ".fhs-checkout-order-item-name"
    ).first();
    if (await productName.isVisible().catch(() => false)) {
      return (await productName.innerText()).trim();
    }
    return "";
  }

  // ==================== DROPDOWN KIỂM TRA ====================

  /** Lấy danh sách options của 1 dropdown Select2 */
  async getSelect2Options(selectId: string): Promise<string[]> {
    // Mở dropdown
    await this.page.evaluate((id: string) => {
      const $jq = (window as any).$jq || (window as any).jQuery || (window as any).$;
      if ($jq) $jq(`#${id}`).select2("open");
    }, selectId);
    await this.page.waitForTimeout(500);

    // Lấy danh sách kết quả
    const options = this.page.locator(".select2-results__option:visible");
    const count = await options.count();
    const texts: string[] = [];
    for (let i = 0; i < count; i++) {
      texts.push((await options.nth(i).innerText()).trim());
    }

    // Đóng dropdown
    await this.page.keyboard.press("Escape");
    await this.page.waitForTimeout(300);

    return texts;
  }

  /** Lấy placeholder hiện tại của Select2 dropdown */
  async getSelect2SelectedText(selectId: string): Promise<string> {
    const rendered = this.page.locator(
      `#select2-${selectId}-container`
    );
    if (await rendered.isVisible().catch(() => false)) {
      return (await rendered.innerText()).trim();
    }
    return "";
  }

  // ==================== F-POINT ====================

  /** Check checkbox Dùng F-Point */
  async checkFpointCheckbox() {
    const checkbox = this.page.locator("#fhs_checkout_fpoint_checkbox, input[name='use_fpoint']").first();
    if (await checkbox.isVisible().catch(() => false)) {
      if (!(await checkbox.isChecked())) {
        await checkbox.click();
        await this.page.waitForTimeout(500);
      }
    }
  }

  /** Nhập số F-Point */
  async fillFpointAmount(amount: string) {
    const input = this.page.locator("#fhs_checkout_fpoint, input[name='fpoint_amount']").first();
    if (await input.isVisible().catch(() => false)) {
      await input.clear();
      await input.fill(amount);
      await input.blur();
      await this.waitForCheckoutLoading();
    }
  }

  /** Lấy giá trị F-Point đang nhập */
  async getFpointValue(): Promise<string> {
    const input = this.page.locator("#fhs_checkout_fpoint, input[name='fpoint_amount']").first();
    if (await input.isVisible().catch(() => false)) {
      return input.inputValue();
    }
    return "";
  }

  // ==================== LOGIN ====================

  async openLoginPopup() {
    await this.page.goto("/", { waitUntil: "domcontentloaded" });
    await this.page.waitForTimeout(2000);

    await this.page
      .evaluate(() => {
        const win = window as any;
        if (typeof win.fhs_account !== "undefined" && win.fhs_account.showLoginPopup) {
          win.fhs_account.showLoginPopup("login");
        }
      })
      .catch(() => {});

    try {
      await this.loginBtn.click({ force: true, timeout: 3000 });
    } catch {
      /* ignore */
    }

    await expect(this.loginUsername).toBeVisible({ timeout: 10000 });
  }

  async login(phone: string, password: string) {
    await this.openLoginPopup();

    await this.loginUsername.clear();
    await this.loginUsername.pressSequentially(phone, { delay: 50 });

    await this.loginPassword.clear();
    await this.loginPassword.pressSequentially(password, { delay: 50 });

    await expect(this.loginSubmitBtn).toBeEnabled({ timeout: 10000 });
    await this.loginSubmitBtn.click();

    await expect(this.loginUsername).toBeHidden({ timeout: 15000 });

    await expect(
      this.page.locator("#fhs_top_account_title"),
      "Lỗi: Login thất bại.",
    ).not.toContainText("Tài khoản", { timeout: 30000 });

    await this.page.waitForLoadState("domcontentloaded");
    await this.page.waitForTimeout(2000);
  }
}
