// ===================== CHECKOUT TEST DATA =====================
// Dữ liệu phục vụ cho 28 Test Cases tính năng Checkout — Fahasa.com
// Tham khảo: docs/checkout_spec.md, docs/checkout_components.md

import { cartData, getProduct, type CartLinePlan } from "./cart.data";

// ==================== THÔNG TIN TÀI KHOẢN ====================
export const checkoutAccounts = {
  // Tài khoản đã đăng ký để test DEFECT-002 (rò rỉ SĐT)
  registeredPhone: process.env.ACCOUNT_PHONE ?? "0339469831",
  password: process.env.ACCOUNT_PASSWORD ?? "123456",
};

// ==================== THÔNG TIN ĐỊA CHỈ GIAO HÀNG (GUEST) ====================

/** Dữ liệu hợp lệ hoàn chỉnh cho Guest Checkout (TC-CHECKOUT-S1-001) */
export const validGuestAddress = {
  fullName: "Nguyen Van A",
  email: "testabc2411@gmail.com",
  phone: "0165825825",
  city: "Hồ Chí Minh",       // value="485"
  cityValue: "485",
  district: "Quận 1",         // value cần tra trên web
  ward: "Bến Nghé",           // value cần tra trên web
  street: "123 Lê Lợi",
};

/** Dữ liệu địa chỉ Hà Nội (cho TC-CHECKOUT-S1-008, S1-009) */
export const hanoiAddress = {
  city: "Hà Nội",
  cityValue: "487",
  district: "Quận Hoàn Kiếm", // value="48"
  ward: "Phường Hàng Bạc",    // Cần xác nhận trên web
};

/** Dữ liệu địa chỉ Hà Giang (cho TC-CHECKOUT-S4-005 — tỉnh miền núi xa) */
export const hagiangAddress = {
  city: "Hà Giang",
  cityValue: "501",
  district: "Huyện Xín Mần",  // Đã cập nhật cho xa xôi
  ward: "Xã Xín Mần",         // Đã cập nhật cho xa xôi
};

// ==================== DỮ LIỆU VALIDATE SĐT ====================

/** TC-CHECKOUT-S1-003: BVA biên dưới — thiếu 1 số */
export const phone9Digits = "037841650";

/** TC-CHECKOUT-S1-004: BVA vượt biên trên — thừa 1 số */
export const phone11Digits = "03784165041";

/** TC-CHECKOUT-S1-005: DEFECT-001 — đủ 10 số nhưng không bắt đầu bằng 0 */
export const phoneNoLeadingZero = "1001010101";

/** TC-CHECKOUT-S1-006: EP — chứa chữ cái */
export const phoneWithLetters = "0378abc504";

/** TC-CHECKOUT-S1-011: Email sai định dạng */
export const invalidEmail = "user@domain";

/** TC-CHECKOUT-S1-012: Họ tên chỉ chứa khoảng trắng */
export const whitespaceOnlyName = "     ";

// ==================== DỮ LIỆU VOUCHER / KHUYẾN MÃI ====================

/** Mã voucher giảm 30K — ngưỡng 499K (TC-CHECKOUT-S2-001, S2-002) */
export const VOUCHER_30K_CODE = "FHS30KT06";
export const VOUCHER_30K_THRESHOLD = 499_000;
export const VOUCHER_30K_AMOUNT = 30_000;

/** Mã voucher giảm 10K — ngưỡng 150K */
export const VOUCHER_10K_CODE = "FHS10KT06";
export const VOUCHER_10K_THRESHOLD = 150_000;

/** Mã voucher giảm 20K — ngưỡng 300K */
export const VOUCHER_20K_CODE = "FHS20KT06";

/** Mã khuyến mãi / Gift Card không hợp lệ (TC-CHECKOUT-S2-004) */
export const INVALID_COUPON_CODE = "KHONGTONNTAI999";

// ==================== DỮ LIỆU HÓA ĐƠN GTGT ====================

/** Dữ liệu form VAT Cá nhân hợp lệ */
export const validVatPersonal = {
  buyerName: "Nguyen Van B",
  address: "456 Nguyễn Trãi Quận 5 HCM",     // >= 10 ký tự
  citizenId: "079203012345",                    // 12 số
  passportNo: "C12345678",
  email: "vatpersonal@gmail.com",
};

/** Dữ liệu form VAT Doanh nghiệp hợp lệ */
export const validVatCompany = {
  buyerName: "Tran Thi C",
  companyName: "Công ty TNHH ABC",
  companyAddress: "789 Trần Hưng Đạo Quận 1 HCM", // >= 10 ký tự
  taxCode: "0312345678",                            // 10 số
  budgetCode: "QHNS12345",
  email: "vatcompany@gmail.com",
};

/** Email nhận hóa đơn sai định dạng (TC-CHECKOUT-S3-003) */
export const invalidVatEmail = "user@domain";

// ==================== DỮ LIỆU PHƯƠNG THỨC THANH TOÁN ====================

/** Danh sách value của các phương thức thanh toán trên web */
export const paymentMethods = {
  cod: "cashondelivery",
  zalopay: "zalopayapp",  // Sẵn tiện sửa zalopay thành zalopayapp (dựa theo HTML bạn gửi)
  vnpay: "vnpay",
  shopeepay: "airpay",    // Web Fahasa dùng chữ airpay cho ShopeePay
  momo: "momopay",        // 👈 Sửa "momo" thành "momopay"
  atm: "zalopayatm",      // Sẵn tiện sửa atm luôn
} as const;

/** Thứ tự chọn phương thức cho TC-CHECKOUT-S4-004 */
export const paymentSwitchSequence = ["vnpay", "cashondelivery", "momopay"] as const; 
// Chú ý: Phải là "momopay" ở trong mảng này!

// ==================== DỮ LIỆU GHI CHÚ ====================

/** TC-CHECKOUT-S5-002: Ghi chú đơn hàng */
export const orderNote = "Giao hàng giờ hành chính, gọi trước khi giao";

// ==================== HELPER FUNCTIONS ====================

/**
 * Tạo giỏ hàng đạt ĐÚNG BẰNG 1 ngưỡng tiền nhất định
 * Sử dụng sản phẩm từ cartData
 */
export function buildCartPlanForExactAmount(target: number): CartLinePlan[] | null {
  const items = cartData
    .filter((p) => p.inStock && p.price > 0)
    .map((p) => ({ id: p.id, price: p.price }));

  function dfs(
    index: number,
    lines: CartLinePlan[],
    sum: number,
  ): CartLinePlan[] | null {
    if (sum === target) return lines.length ? [...lines] : null;
    if (sum > target || index >= items.length) return null;

    const { id, price } = items[index];
    for (let qty = 0; qty <= 15; qty++) {
      const next = sum + qty * price;
      if (next > target) break;
      const nextLines = qty > 0 ? [...lines, { productId: id, qty }] : lines;
      const found = dfs(index + 1, nextLines, next);
      if (found) return found;
    }
    return dfs(index + 1, lines, sum);
  }

  return dfs(0, [], 0);
}

/**
 * Tạo giỏ hàng có tổng tiền DƯỚI 1 ngưỡng (sát nhất có thể)
 */
export function buildCartPlanBelowThreshold(threshold: number): CartLinePlan[] | null {
  const items = cartData
    .filter((p) => p.inStock && p.price > 0)
    .map((p) => ({ id: p.id, price: p.price }));

  // Lấy sản phẩm rẻ nhất, tính qty sao cho < threshold
  const cheapest = items.reduce((min, p) => (p.price < min.price ? p : min), items[0]);
  const maxQty = Math.floor((threshold - 1) / cheapest.price);
  if (maxQty < 1) return null;
  return [{ productId: cheapest.id, qty: maxQty }];
}

/** Plan cho TC-CHECKOUT-S2-001: Giỏ hàng = 499,000đ */
export const PLAN_EXACT_499K = buildCartPlanForExactAmount(VOUCHER_30K_THRESHOLD);

/** Plan cho TC-CHECKOUT-S2-002: Giỏ hàng = 498,000đ (dưới ngưỡng) */
export const PLAN_BELOW_499K = buildCartPlanBelowThreshold(VOUCHER_30K_THRESHOLD);

/** Plan đơn giản: 1 sản phẩm SP_C (100K) để test nhanh các form */
export const PLAN_SINGLE_PRODUCT: CartLinePlan[] = [{ productId: "SP_C", qty: 1 }];

/** Plan cho checkout cơ bản: đủ ngưỡng voucher 150K */
export const PLAN_ABOVE_150K: CartLinePlan[] = [{ productId: "SP_B", qty: 3 }];
// SP_B = 64K * 3 = 192K > 150K


/** Plan "Đại gia" ~ 2 triệu VNĐ để test các case Decision Table / State Transition thoải mái */
export const PLAN_HIGH_VALUE_2M: CartLinePlan[] = [{ productId: "SP_C", qty: 20 }];

/** Plan cho TC-CHECKOUT-S2-003: Mua Manga (đủ điều kiện Freeship) + sách thường (đủ ngưỡng Voucher) */
export const PLAN_VOUCHER_AND_FREESHIP: CartLinePlan[] = [
  { productId: "SP_MANGA", qty: 1 },  // Solo Leveling Manga 442K → đủ điều kiện freeship Manga
  { productId: "SP_C", qty: 5 },       // Cây Cam Ngọt 100K → tổng > 499K, đủ ngưỡng voucher 30K
];