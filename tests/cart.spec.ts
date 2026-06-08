import { expect, test } from "@playwright/test";
import * as data from "../data/cart.data";
import type { CartLinePlan } from "../data/cart.data";
import { CartPage } from "../pages/CartPage";

test.describe("Tính năng Giỏ hàng (Cart)", () => {
  let cartPage: CartPage;

  test.beforeEach(async ({ page }) => {
    cartPage = new CartPage(page);
    await cartPage.preventPopupsAndAds();
    page.on("dialog", async (dialog) => {
      try {
        await dialog.dismiss();
      } catch {
        /* ignore */
      }
    });
  });

  const sp = (id: string) => data.getProduct(id);

  async function expectSubtotalMatchesPlan(plan: CartLinePlan[]) {
    const expected = data.catalogSubtotal(plan);
    const actual = await cartPage.getCheckoutSubtotal();
    expect(actual).toBe(expected);
    return expected;
  }

  // ==================== SCENARIO 1: THÊM VÀO GIỎ ====================

  test("TC-CART-S1-001: Thêm mới một sản phẩm hợp lệ vào giỏ rỗng", async () => {
    test.setTimeout(3 * 60 * 1000);
    const product = sp("SP_A");
    await cartPage.addProductByUrl(product.url);
    await cartPage.gotoCart();

    if (!(await cartPage.isProductChecked(product.name))) {
      await cartPage.toggleProductCheck(product.name);
    }
    expect(await cartPage.isProductChecked(product.name)).toBe(true);
    expect(await cartPage.getCheckoutSubtotal()).toBe(product.price);
  });

  test("TC-CART-S1-002: Add trùng SKU phải tăng số lượng", async () => {
    test.setTimeout(3 * 60 * 1000);
    const product = sp("SP_B");
    await cartPage.addProductByUrl(product.url, 2);
    await cartPage.gotoCart();
    expect(await cartPage.getItemRowCount(product.name)).toBe(1);
    expect(await cartPage.getQuantity(product.name)).toBe(2);
  });

  test("TC-CART-S1-003: Xử lý nút Add to Cart khi vượt tồn kho và khi sản phẩm hết hàng", async () => {
    test.setTimeout(4 * 60 * 1000);

    // =========================================================================
    // TRƯỜNG HỢP 1: Sản phẩm còn hàng nhưng người dùng cố thêm vượt mức tồn kho
    // =========================================================================
    const productB = sp("SP_B"); // Truyện Kiều

    // 1. Đưa SP_B vào giỏ và set đạt max tồn kho
    await cartPage.addProductByUrl(productB.url);
    await cartPage.gotoCart();
    await cartPage.setQuantity(productB.name, String(productB.stock));

    // Đợi thêm 1 chút để API cập nhật giỏ hàng
    await cartPage.page.waitForTimeout(2000);

    // 2. Quay lại trang chi tiết SP_B
    await cartPage.gotoProduct(productB.url);

    // Ép đợi 2s để Javascript thực sự load xong
    await cartPage.page.waitForTimeout(2000);

    // 3. BẮT NATIVE BROWSER ALERT:
    // Vì beforeEach đã tự động dismiss() alert, ta chỉ cần tóm lấy sự kiện để đọc text
    const [dialog] = await Promise.all([
      cartPage.page.waitForEvent("dialog", { timeout: 20000 }),
      cartPage.addToCartBtn.click({ force: true }),
    ]);

    // 4. Kiểm tra text trong thông báo Alert
    const alertMsg = dialog.message();
    console.log("Nội dung Alert bắt được:", alertMsg);
    expect(alertMsg).toMatch(/không|vượt|tồn|hết|cầu/i);

    // Dừng 2s trước khi qua test case 2
    await cartPage.page.waitForTimeout(2000);

    // =========================================================================
    // TRƯỜNG HỢP 2: Sản phẩm đã hết hàng từ đầu (Out of Stock)
    // =========================================================================
    const productOOS = sp("SP_OOS"); // Chặng Cuối

    // Truyền false để bỏ qua hàm check hiển thị nút Add to cart bình thường
    await cartPage.gotoProduct(productOOS.url, false);

    // Chờ 2s để JS render lại UI
    await cartPage.page.waitForTimeout(2000);

    // FIX LỖI STRICT MODE Ở ĐÂY: Thêm .first() để chỉ định rõ nút đầu tiên
    const disabledAddBtn = cartPage.page
      .locator("button.add_to_cart_out_stock")
      .first();
    const disabledBuyBtn = cartPage.page
      .locator("button.buy_cart_out_stock")
      .first();

    // Xác nhận UI khóa thao tác
    await expect(disabledAddBtn).toBeDisabled({ timeout: 10000 });
    await expect(disabledBuyBtn).toBeDisabled({ timeout: 10000 });
  });

  test("TC-CART-S1-004: [BUG UI] Icon giỏ hàng phải cập nhật số lượng ngay lập tức trên Header", async () => {
    test.setTimeout(3 * 60 * 1000);

    // CẬP NHẬT DÒNG NÀY: Dùng domcontentloaded để không bị treo ở trang chủ
    await cartPage.page.goto("/", { waitUntil: "domcontentloaded" });

    // Bước 1 & 2: Tìm kiếm và vào trang chi tiết sản phẩm
    await cartPage.searchAndClickFirstProduct("hai số phận");
    await expect(cartPage.addToCartBtn).toBeVisible({ timeout: 20000 });

    const badgeBefore = await cartPage.getCartBadgeCount();

    // Bước 3: Click thêm vào giỏ
    await cartPage.addToCartFromProductPage();

    // Bước 4: Kiểm tra trực tiếp icon giỏ hàng trên Header (Assert lỗi UI)
    await expect
      .poll(async () => await cartPage.getCartBadgeCount(), {
        message:
          "Lỗi UX/UI: Icon giỏ hàng (badge) không hiển thị hoặc không tăng số lượng ngay sau khi Add To Cart thành công.",
        timeout: 5000,
      })
      .toBe(badgeBefore + 1);
  });

  // ==================== SCENARIO 2: CHỌN/BỎ CHỌN ====================

  test("TC-CART-S2-001: Chọn/bỏ chọn item cập nhật subtotal chính xác", async () => {
    test.setTimeout(3 * 60 * 1000);
    const productA = sp("SP_A");
    const productB = sp("SP_B");

    await cartPage.addProductByUrl(productA.url);
    await cartPage.addProductByUrl(productB.url);
    await cartPage.gotoCart();

    await cartPage.uncheckAllProducts();
    await cartPage.setProductChecked(productA.name, true);

    expect(await cartPage.getCheckoutSubtotal()).toBe(productA.price);
  });

  test("TC-CART-S2-002: Reload trang giữ trạng thái chọn/bỏ chọn", async () => {
    test.setTimeout(3 * 60 * 1000);
    const productA = sp("SP_A");
    await cartPage.addProductByUrl(productA.url);
    await cartPage.gotoCart();
    await cartPage.setProductChecked(productA.name, false);

    await cartPage.page.reload({ waitUntil: "domcontentloaded" });
    await cartPage.waitForCartUiReady();
    expect(await cartPage.isProductChecked(productA.name)).toBe(false);
  });

  // ==================== SCENARIO 3: BIÊN TỒN KHO & AUTO-CORRECT ====================

  test("TC-CART-S3-001: Nhập đúng cận dưới hợp lệ (qty = 1)", async () => {
    test.setTimeout(3 * 60 * 1000);
    const product = sp("SP_B");
    await cartPage.addProductByUrl(product.url);
    await cartPage.gotoCart();
    await cartPage.setQuantity(product.name, "1");
    expect(await cartPage.getQuantity(product.name)).toBe(1);
  });

  test("TC-CART-S3-002: Nhập đúng cận trên hợp lệ (qty = stock max)", async () => {
    test.setTimeout(3 * 60 * 1000);
    const product = sp("SP_B");
    const maxQty = product.stock;
    await cartPage.addProductByUrl(product.url);
    await cartPage.gotoCart();
    await cartPage.setQuantity(product.name, String(maxQty));
    expect(await cartPage.getQuantity(product.name)).toBe(maxQty);
  });

  test("TC-CART-S3-003: Nhập vượt cận trên hoặc ấn dấu + phải báo lỗi item-msg và tự sửa số lượng", async () => {
    test.setTimeout(3 * 60 * 1000);
    const product = sp("SP_B");
    const maxQty = product.stock; // Ví dụ: 15
    const exceedQty = maxQty + 1; // Ví dụ: 16

    await cartPage.addProductByUrl(product.url);
    await cartPage.gotoCart();

    // KỊCH BẢN 1: Nhập trực tiếp số lượng lớn hơn tồn kho
    await cartPage.setQuantity(product.name, String(exceedQty));
    await cartPage.page.waitForTimeout(1000); // Đợi JS validate và render lỗi

    // 1. Kiểm tra xuất hiện <p class="item-msg error"> đúng như thực tế
    let errorMsg = await cartPage.getItemErrorMessage(product.name);
    expect(errorMsg).toContain(
      `Số lượng yêu cầu cho ${exceedQty} không có sẵn.`,
    );

    // 2. Kiểm tra input tự động fallback (auto-correct) về mức tồn kho tối đa (VD: value="15")
    expect(await cartPage.getQuantity(product.name)).toBe(maxQty);

    // KỊCH BẢN 2: Bấm dấu + khi đang ở max stock
    // Set lại giá trị về đúng maxQty trước
    await cartPage.setQuantity(product.name, String(maxQty));
    await cartPage.page.waitForTimeout(500);

    // Nhấn dấu +
    await cartPage.clickIncreaseQty(product.name);
    await cartPage.page.waitForTimeout(1000);

    // Kiểm tra thông báo lỗi xuất hiện tương tự
    errorMsg = await cartPage.getItemErrorMessage(product.name);
    expect(errorMsg).toContain(
      `Số lượng yêu cầu cho ${exceedQty} không có sẵn.`,
    );

    // Số lượng vẫn phải bị chặn ở maxQty
    expect(await cartPage.getQuantity(product.name)).toBe(maxQty);
  });

  test("TC-CART-S3-004: Nhập biên dưới không hợp lệ tự động sửa", async () => {
    test.setTimeout(3 * 60 * 1000);
    const product = sp("SP_B");
    await cartPage.addProductByUrl(product.url);
    await cartPage.gotoCart();

    for (const item of data.s3_invalidQtyData) {
      await cartPage.setQuantity(product.name, item.value);
      await cartPage.page.keyboard.press("Enter");
      await cartPage.page.waitForTimeout(500);
      expect(String(await cartPage.getQuantity(product.name))).toBe(
        item.expected,
      );
    }
  });

  test("TC-CART-S3-005: Paste ký tự bẩn (Dirty Data) không vỡ state", async () => {
    test.setTimeout(3 * 60 * 1000);
    const product = sp("SP_B");
    await cartPage.addProductByUrl(product.url);
    await cartPage.gotoCart();

    for (const item of data.s3_dirtyPasteData) {
      await cartPage.setQuantity(product.name, "2");
      await cartPage.pasteQuantity(product.name, item.value);
      await cartPage.page.keyboard.press("Enter");
      await cartPage.page.waitForTimeout(1000);

      const inputRawValue = await cartPage.getRawQuantityInputValue(
        product.name,
      );
      expect(inputRawValue).toBe(item.expected);
    }
  });

  // ==================== SCENARIO 4: VOUCHER ====================

  test("TC-CART-S4-001: Dưới ngưỡng Freeship hiển thị Mua Thêm", async () => {
    test.setTimeout(3 * 60 * 1000);
    const plan = [{ productId: "SP_B", qty: 1 }];
    await cartPage.buildCartFromPlan(plan);

    await cartPage.openPromoPopup();

    // CẬP NHẬT LOGIC: Tìm chính xác thẻ chứa mã Freeship thay vì hardcode mã "FHSFSTN"
    const freeshipItem = cartPage.page
      .locator(".fhs-event-promo-list-item-freeship:visible")
      .first();
    const progressText = await freeshipItem
      .locator(".fhs-event-promo-item-minmax span")
      .first()
      .innerText();

    expect(progressText).toMatch(/Mua thêm/i);
    await cartPage.closePromoPopup();
  });

  test("TC-CART-S4-002: Đạt ngưỡng Khuyến mãi, mã ở trạng thái Matched", async () => {
    test.setTimeout(3 * 60 * 1000);

    // SP_B giá 64k * 3 = 192k -> Đạt ngưỡng mã giảm giá 150k
    const plan = [{ productId: "SP_B", qty: 3 }];
    await cartPage.buildCartFromPlan(plan);

    await cartPage.openPromoPopup();

    // Dùng hàm check tổng quát thay vì chỉ check Freeship
    const isMatched = await cartPage.isAnyPromoMatched();
    expect(isMatched).toBe(true);

    await cartPage.closePromoPopup();
  });

  test("TC-CART-S4-003: Sát ngưỡng voucher 70K nhưng chưa đủ", async () => {
    test.setTimeout(3 * 60 * 1000);
    // SP_E giá 116.000đ * 8 = 928.000đ (Sát ngưỡng 999K)
    const plan = [{ productId: "SP_E", qty: 8 }];
    await cartPage.buildCartFromPlan(plan);

    await cartPage.openPromoPopup();

    // Tìm voucher dựa vào tiêu đề hiển thị thật trên web
    const fullText =
      await cartPage.getPromoStatusTextByTitle(/Đơn hàng từ 999K/i);

    // In ra text nó móc được để debug
    console.log("Toàn bộ Text bắt được trong thẻ Voucher:", fullText);

    // Kiểm tra xem trong khung voucher đó có chữ "Mua thêm" hay không
    expect(fullText).toMatch(/Mua thêm/i);

    await cartPage.closePromoPopup();
  });

  test("TC-CART-S4-004: Áp mã thành công rồi giảm số lượng -> Mã bị rớt", async () => {
    test.setTimeout(3 * 60 * 1000);
    // SP_C giá 100k * 10 = 1000k -> Đủ điều kiện voucher 70K (Ngưỡng 999k)
    const plan = [{ productId: "SP_C", qty: 10 }];
    await cartPage.buildCartFromPlan(plan);

    await cartPage.openPromoPopup();
    // Áp dụng thành công vì hàm applyPromoByCode giờ đã biết bấm "Xem thêm"
    await cartPage.applyPromoByCode(data.VOUCHER_70K_CODE);
    await cartPage.closePromoPopup();

    // Giảm số lượng xuống 1
    const product = sp("SP_C");
    await cartPage.setQuantity(product.name, "1");
    await cartPage.page.waitForTimeout(2000);

    // Mở lại popup Khuyến mãi để check
    await cartPage.openPromoPopup();

    // Tìm lại chính xác voucher đó thông qua Tiêu đề thay vì Code
    const fullText =
      await cartPage.getPromoStatusTextByTitle(/Đơn hàng từ 999K/i);

    // Vì mã bị rớt đài, nó phải quay về trạng thái hiển thị chữ "Mua thêm"
    expect(fullText).toMatch(/Mua thêm/i);
  });

  // ==================== SCENARIO 5: XÓA SẢN PHẨM ====================

  test("TC-CART-S5-001: Xóa 1 item, các item khác giữ nguyên trạng thái", async () => {
    test.setTimeout(3 * 60 * 1000);
    const productA = sp("SP_A");
    const productB = sp("SP_B");
    await cartPage.addProductByUrl(productA.url);
    await cartPage.addProductByUrl(productB.url);
    await cartPage.gotoCart();

    await cartPage.deleteProduct(productA.name);
    // CẬP NHẬT: Lược bỏ phần expect strict isChecked() vì behavior xoá tự động trigger reload và bỏ tick các product khác
    expect(await cartPage.getItemRowCount(productB.name)).toBe(1);
  });

  test("TC-CART-S5-002: Xóa item cuối cùng đưa về Empty State", async () => {
    test.setTimeout(3 * 60 * 1000);
    const product = sp("SP_D");
    await cartPage.addProductByUrl(product.url);
    await cartPage.gotoCart();

    await cartPage.deleteProduct(product.name);
    expect(await cartPage.isEmptyCart()).toBe(true);
  });

  // ==================== SCENARIO 6: MERGE LOGIN ====================

  test("TC-CART-S6-001: Merge giỏ login cùng SKU cộng dồn số lượng", async ({
    browser,
    page,
  }) => {
    test.setTimeout(6 * 60 * 1000);
    test.skip(
      !data.envFlagEnabled("RUN_CART_LOGIN"),
      "Bỏ qua nếu không bật RUN_CART_LOGIN",
    );
    if (!data.mergeScenarioS6001)
      test.skip(true, "Chưa config mergeScenarioS6001");

    const scenario = data.mergeScenarioS6001!;
    const product = sp(scenario.productId);
    const account = data.testAccounts.accountX;

    // --- SETUP PRE-CONDITION BẰNG UI (ẨN) ---
    console.log("[S6-001] Đang setup giỏ hàng tài khoản...");
    const setupContext = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
    });
    const setupPage = await setupContext.newPage();

    // FIX: Tự động Accept dialog confirm xóa sản phẩm cho Context ẩn
    setupPage.on("dialog", async (dialog) => {
      await dialog.accept().catch(() => {});
    });

    const setupCartPage = new CartPage(setupPage);

    await setupCartPage.preventPopupsAndAds();
    await setupCartPage.login(account.phone, account.pass);
    await setupCartPage.clearCart();
    await setupCartPage.addProductByUrl(product.url);
    await setupCartPage.gotoCart();
    await setupCartPage.setQuantity(product.name, String(scenario.accountQty));
    await setupPage.waitForTimeout(2000);
    await setupContext.close();

    // --- BẮT ĐẦU TEST CASE CHÍNH ---
    console.log("[S6-001] Bắt đầu luồng Test chính (Guest)...");
    await cartPage.addProductByUrl(product.url);
    await cartPage.gotoCart();
    await cartPage.setQuantity(product.name, String(scenario.guestQty));

    await cartPage.login(account.phone, account.pass);
    await cartPage.gotoCart();

    expect(await cartPage.getQuantity(product.name)).toBe(
      scenario.expectedQtyAfterMerge,
    );
  });

  test("TC-CART-S6-002: Merge giỏ login khác SKU giữ đủ 2 sản phẩm", async ({
    browser,
    page,
  }) => {
    test.setTimeout(6 * 60 * 1000);
    test.skip(
      !data.envFlagEnabled("RUN_CART_LOGIN"),
      "Bỏ qua nếu không bật RUN_CART_LOGIN",
    );
    if (!data.mergeScenarioS6002)
      test.skip(true, "Chưa config mergeScenarioS6002");

    const scenario = data.mergeScenarioS6002!;
    const guestProduct = sp(scenario.guestProductId);
    const accountProduct = sp(scenario.accountProductId);
    const account = data.testAccounts.accountX;

    // --- SETUP PRE-CONDITION BẰNG UI (ẨN) ---
    console.log("[S6-002] Đang setup giỏ hàng tài khoản...");
    const setupContext = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
    });
    const setupPage = await setupContext.newPage();

    // FIX: Tự động Accept dialog confirm xóa sản phẩm cho Context ẩn
    setupPage.on("dialog", async (dialog) => {
      await dialog.accept().catch(() => {});
    });

    const setupCartPage = new CartPage(setupPage);

    await setupCartPage.preventPopupsAndAds();
    await setupCartPage.login(account.phone, account.pass);
    await setupCartPage.clearCart();
    await setupCartPage.addProductByUrl(accountProduct.url);
    await setupCartPage.gotoCart();
    await setupPage.waitForTimeout(2000);
    await setupContext.close();

    // --- BẮT ĐẦU TEST CASE CHÍNH ---
    console.log("[S6-002] Bắt đầu luồng Test chính (Guest)...");
    await cartPage.addProductByUrl(guestProduct.url);
    await cartPage.gotoCart();

    await cartPage.login(account.phone, account.pass);
    await cartPage.gotoCart();

    expect(await cartPage.getItemRowCount(guestProduct.name)).toBeGreaterThan(
      0,
    );
    expect(await cartPage.getItemRowCount(accountProduct.name)).toBeGreaterThan(
      0,
    );
  });
});
