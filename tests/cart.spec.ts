import { expect, test } from "@playwright/test";
import * as data from "../data/cart.data";
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

  // =====================================================================
  // SCENARIO 1: THÊM SẢN PHẨM VÀO GIỎ HÀNG
  // =====================================================================

  test("TC-CART-S1-001: Thêm mới một sản phẩm hợp lệ vào giỏ rỗng", async () => {
    test.setTimeout(3 * 60 * 1000);
    const product = sp("SP_A");

    await cartPage.addProductByUrl(product.url);
    await cartPage.gotoCart();
    await cartPage.expectCartLoaded();

    expect(await cartPage.getItemRowCount(product.name)).toBe(1);
    expect(await cartPage.getQuantity(product.name)).toBe(1);
    expect(await cartPage.getLineTotal(product.name)).toBe(product.price);

    // Fahasa: item đầu tiên trong giỏ rỗng chưa tick — tick chọn rồi kiểm tra subtotal
    await cartPage.toggleProductCheck(product.name);
    expect(await cartPage.isProductChecked(product.name)).toBe(true);
    expect(await cartPage.getCheckoutSubtotal()).toBe(product.price);
  });

  test("TC-CART-S1-002: Add trùng SKU phải tăng số lượng, không tạo dòng mới", async () => {
    test.setTimeout(3 * 60 * 1000);
    const product = sp("SP_B");

    await cartPage.addProductByUrl(product.url, 2);
    await cartPage.gotoCart();

    expect(await cartPage.getItemRowCount(product.name)).toBe(1);
    expect(await cartPage.getQuantity(product.name)).toBe(2);
    expect(await cartPage.getLineTotal(product.name)).toBe(product.price * 2);
  });

  test("TC-CART-S1-003: Thêm sản phẩm hết hàng phải bị chặn ở UI", async () => {
    test.setTimeout(3 * 60 * 1000);
    test.skip(
      true,
      "Chưa có SP hết hàng trong cart.data.ts — cần bổ sung URL sản phẩm out-of-stock",
    );

    const product = sp("SP_B");
    await cartPage.gotoProduct(product.url);

    const outOfStockText = cartPage.page.locator(
      "text=/Hết hàng|Không còn hàng/i",
    );
    await expect(outOfStockText).toBeVisible();
    await expect(cartPage.addToCartBtn).toBeDisabled();
  });

  test("TC-CART-S1-004: Spam click khi mạng chậm không nhân đôi dòng sản phẩm", async () => {
    test.setTimeout(4 * 60 * 1000);
    test.skip(
      !process.env.RUN_CART_NETWORK,
      "Bật RUN_CART_NETWORK=1 để chạy test mô phỏng mạng chậm",
    );

    const product = sp("SP_D");

    await cartPage.page.route("**/checkout/cart/add/**", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 3000));
      await route.continue();
    });

    await cartPage.gotoProduct(product.url);
    for (let i = 0; i < 5; i++) {
      await cartPage.addToCartBtn.click({ force: true }).catch(() => {});
    }

    await cartPage.gotoCart();
    expect(await cartPage.getItemRowCount(product.name)).toBe(1);
    expect(await cartPage.getQuantity(product.name)).toBeLessThanOrEqual(2);
  });

  // =====================================================================
  // SCENARIO 2: CHỌN / BỎ CHỌN VÀ SUBTOTAL
  // =====================================================================

  test("TC-CART-S2-001: Chọn / bỏ chọn item phải cập nhật subtotal chính xác", async () => {
    test.setTimeout(4 * 60 * 1000);
    const productA = sp("SP_A");
    const productB = sp("SP_B");
    const productC = sp("SP_C");

    for (const product of [productA, productB, productC]) {
      await cartPage.addProductByUrl(product.url);
    }
    await cartPage.gotoCart();

    await cartPage.uncheckAllProducts();
    for (const product of [productA, productB, productC]) {
      await cartPage.setProductChecked(product.name, false);
    }

    const fullSubtotal = productA.price + productB.price + productC.price;

    await cartPage.checkAllProducts();
    expect(await cartPage.isSelectAllChecked()).toBe(true);
    expect(await cartPage.getCheckoutSubtotal()).toBe(fullSubtotal);

    await cartPage.toggleProductCheck(productC.name);
    const subtotalWithoutC = productA.price + productB.price;
    expect(await cartPage.getCheckoutSubtotal()).toBe(subtotalWithoutC);
    expect(await cartPage.isSelectAllChecked()).toBe(false);

    await cartPage.toggleProductCheck(productC.name);
    expect(await cartPage.isSelectAllChecked()).toBe(true);
    expect(await cartPage.getCheckoutSubtotal()).toBe(fullSubtotal);
  });

  test("TC-CART-S2-002: Reload trang phải giữ trạng thái chọn / bỏ chọn", async () => {
    test.setTimeout(3 * 60 * 1000);
    const productA = sp("SP_A");
    const productB = sp("SP_B");

    await cartPage.addProductByUrl(productA.url);
    await cartPage.addProductByUrl(productB.url);
    await cartPage.gotoCart();

    await cartPage.setProductChecked(productA.name, true);
    await cartPage.setProductChecked(productB.name, false);

    const subtotalBefore = await cartPage.getCheckoutSubtotal();
    const checkedA = await cartPage.isProductChecked(productA.name);
    const checkedB = await cartPage.isProductChecked(productB.name);

    await cartPage.page.reload({ waitUntil: "domcontentloaded" });
    await cartPage.page.waitForTimeout(2000);

    expect(await cartPage.isProductChecked(productA.name)).toBe(checkedA);
    expect(await cartPage.isProductChecked(productB.name)).toBe(checkedB);
    expect(await cartPage.getCheckoutSubtotal()).toBe(subtotalBefore);
  });

  // =====================================================================
  // SCENARIO 3: CẬP NHẬT SỐ LƯỢNG VÀ BIÊN TỒN KHO
  // =====================================================================

  test("TC-CART-S3-001: Nhập đúng cận dưới hợp lệ (qty = 1)", async () => {
    test.setTimeout(3 * 60 * 1000);
    const product = sp("SP_B");

    await cartPage.addProductByUrl(product.url);
    await cartPage.gotoCart();
    await cartPage.setQuantity(product.name, "2");
    await cartPage.setQuantity(product.name, "1");

    expect(await cartPage.getQuantity(product.name)).toBe(1);
    expect(await cartPage.isDecreaseQtyDisabled(product.name)).toBe(true);
    expect(await cartPage.getLineTotal(product.name)).toBe(product.price);
  });

  test("TC-CART-S3-002: Nhập đúng cận trên hợp lệ (qty = stock max)", async () => {
    test.setTimeout(3 * 60 * 1000);
    const product = sp("SP_B");
    const maxQty = product.stock;

    await cartPage.addProductByUrl(product.url);
    await cartPage.gotoCart();
    await cartPage.setQuantity(product.name, String(maxQty));

    expect(await cartPage.getQuantity(product.name)).toBe(maxQty);
    expect(await cartPage.getLineTotal(product.name)).toBe(
      product.price * maxQty,
    );
  });

  test("TC-CART-S3-003: Nhập vượt cận trên phải bị chặn", async () => {
    test.setTimeout(3 * 60 * 1000);
    const product = sp("SP_A");
    const maxQty = product.stock;

    await cartPage.addProductByUrl(product.url);
    await cartPage.gotoCart();
    await cartPage.setQuantity(product.name, String(maxQty));
    await cartPage.setQuantity(product.name, String(maxQty + 1));

    const currentQty = await cartPage.getQuantity(product.name);
    expect(currentQty).toBeLessThanOrEqual(maxQty);

    const errorMsg = await cartPage.getItemErrorMessage(product.name);
    const lineTotal = await cartPage.getLineTotal(product.name);
    expect(errorMsg.length > 0 || lineTotal <= product.price * maxQty).toBe(
      true,
    );
  });

  test("TC-CART-S3-004: Nhập biên dưới không hợp lệ và giá trị rỗng", async () => {
    test.setTimeout(4 * 60 * 1000);
    const product = sp("SP_B");

    await cartPage.addProductByUrl(product.url);
    await cartPage.gotoCart();
    await cartPage.setQuantity(product.name, "2");

    for (const item of data.s3_invalidQtyData) {
      await test.step(`Thử qty invalid: ${item.desc}`, async () => {
        await cartPage.setQuantity(product.name, item.value);
        const qty = await cartPage.getQuantity(product.name);
        expect(qty).toBeGreaterThanOrEqual(1);
        expect(qty).toBeLessThanOrEqual(product.stock);
      });
    }
  });

  test("TC-CART-S3-005: Paste ký tự bẩn không làm vỡ state", async () => {
    test.setTimeout(4 * 60 * 1000);
    const product = sp("SP_B");
    const baselineQty = 2;

    await cartPage.addProductByUrl(product.url);
    await cartPage.gotoCart();
    await cartPage.setQuantity(product.name, String(baselineQty));

    for (const item of data.s3_dirtyPasteData) {
      await test.step(`Paste dữ liệu bẩn: ${item.desc}`, async () => {
        await cartPage.pasteQuantity(product.name, item.value);
        const qty = await cartPage.getQuantity(product.name);
        expect(Number.isFinite(qty)).toBe(true);
        expect(qty).toBeGreaterThanOrEqual(1);
        expect(qty).toBeLessThanOrEqual(product.stock);
      });
    }
  });

  // =====================================================================
  // SCENARIO 4: FREESHIP / VOUCHER THEO NGƯỠNG SUBTOTAL
  // =====================================================================

  test("TC-CART-S4-001: Dưới ngưỡng freeship — hiển thị số tiền cần thêm", async () => {
    test.setTimeout(3 * 60 * 1000);
    const product = sp("SP_A");

    await cartPage.addProductByUrl(product.url);
    await cartPage.gotoCart();
    await cartPage.checkAllProducts();

    const subtotal = await cartPage.getCheckoutSubtotal();
    expect(subtotal).toBeLessThan(data.FREESHIP_THRESHOLD);

    const progressText = await cartPage.getFreeshipProgressText();
    if (progressText) {
      expect(progressText).toMatch(/Mua thêm/i);
    }

    expect(await cartPage.getMatchedFreeshipCount()).toBe(0);
  });

  test("TC-CART-S4-002: Đạt ngưỡng freeship (subtotal >= 500.000đ)", async () => {
    test.setTimeout(5 * 60 * 1000);
    const product = sp("SP_E");
    const qtyNeeded = Math.ceil(data.FREESHIP_THRESHOLD / product.price);

    await cartPage.addProductByUrl(product.url);
    await cartPage.gotoCart();
    await cartPage.setQuantity(product.name, String(qtyNeeded));
    await cartPage.checkAllProducts();

    const subtotal = await cartPage.getCheckoutSubtotal();
    expect(subtotal).toBeGreaterThanOrEqual(data.FREESHIP_THRESHOLD);

    await expect(cartPage.promoBlock.first()).toBeVisible({ timeout: 10000 });
  });

  test("TC-CART-S4-003: Sát ngưỡng voucher 70k nhưng chưa đủ", async () => {
    test.setTimeout(5 * 60 * 1000);
    test.skip(
      true,
      "Cần dựng giỏ chính xác 998.999đ — khó đạt chính xác trên dữ liệu SP hiện tại",
    );
  });

  test("TC-CART-S4-004: Giảm subtotal phải recalculation voucher", async () => {
    test.setTimeout(5 * 60 * 1000);
    test.skip(
      !process.env.RUN_CART_PROMO,
      "Bật RUN_CART_PROMO=1 để chạy test voucher phức tạp (cần đăng nhập / mã KM)",
    );
  });

  // =====================================================================
  // SCENARIO 5: XÓA SẢN PHẨM VÀ EMPTY STATE
  // =====================================================================

  test("TC-CART-S5-001: Xóa item đang tick nhưng giỏ vẫn còn item khác", async () => {
    test.setTimeout(3 * 60 * 1000);
    const productA = sp("SP_A");
    const productB = sp("SP_B");

    await cartPage.addProductByUrl(productA.url);
    await cartPage.addProductByUrl(productB.url);
    await cartPage.gotoCart();
    await cartPage.checkAllProducts();

    await cartPage.deleteProduct(productA.name);

    expect(await cartPage.getItemRowCount(productA.name)).toBe(0);
    expect(await cartPage.getItemRowCount(productB.name)).toBe(1);
    expect(await cartPage.isProductChecked(productB.name)).toBe(true);
    expect(await cartPage.getCheckoutSubtotal()).toBe(productB.price);
    expect(await cartPage.isSelectAllChecked()).toBe(true);
  });

  test("TC-CART-S5-002: Xóa item cuối cùng phải chuyển sang empty state", async () => {
    test.setTimeout(3 * 60 * 1000);
    const product = sp("SP_D");

    await cartPage.addProductByUrl(product.url);
    await cartPage.gotoCart();
    await cartPage.deleteProduct(product.name);

    expect(await cartPage.isEmptyCart()).toBe(true);
    await expect(cartPage.selectAllCheckbox).toBeHidden();
    await expect(cartPage.continueShoppingBtn.first()).toBeVisible({
      timeout: 10000,
    });
  });

  // =====================================================================
  // SCENARIO 6: SESSION, MERGE GIỎ VÀ CONCURRENCY
  // =====================================================================

  test("TC-CART-S6-001: Merge giỏ khi login với cùng SKU phải cộng dồn đúng quy tắc", async () => {
    test.setTimeout(5 * 60 * 1000);
    test.skip(
      !process.env.RUN_CART_LOGIN,
      "Bật RUN_CART_LOGIN=1 — test cần đăng nhập (có thể gặp reCAPTCHA)",
    );

    const product = sp("SP_A");
    const account = data.testAccounts.accountX;

    await cartPage.addProductByUrl(product.url);
    await cartPage.gotoCart();
    await cartPage.setQuantity(product.name, "3");

    await cartPage.login(account.phone, account.pass);
    await cartPage.gotoCart();

    expect(await cartPage.getItemRowCount(product.name)).toBe(1);
    expect(await cartPage.getQuantity(product.name)).toBeLessThanOrEqual(
      product.stock,
    );
  });

  test("TC-CART-S6-002: Merge giỏ khi login với SKU khác nhau phải giữ đủ cả hai", async () => {
    test.setTimeout(5 * 60 * 1000);
    test.skip(
      !process.env.RUN_CART_LOGIN,
      "Bật RUN_CART_LOGIN=1 — test cần đăng nhập (có thể gặp reCAPTCHA)",
    );
  });

  test("TC-CART-S6-003: Session stale không được làm mất guest cart", async () => {
    test.setTimeout(5 * 60 * 1000);
    test.skip(
      !process.env.RUN_CART_LOGIN,
      "Bật RUN_CART_LOGIN=1 — test cần mô phỏng session expire",
    );
  });

  // =====================================================================
  // SCENARIO 7: GIỚI HẠN SỐ DÒNG SẢN PHẨM TRONG GIỎ
  // =====================================================================

  test("TC-CART-S7-001: Thêm vượt quá giới hạn dòng sản phẩm tối đa", async () => {
    test.setTimeout(10 * 60 * 1000);
    test.skip(
      true,
      "Cần 100+ SKU khác nhau — không khả thi trong phạm vi kiểm thử tự động thường",
    );
  });
});
