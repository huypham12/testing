export const cartData = [
  {
    id: "SP_A",
    name: "Chính Sách Kinh Tế Trong Thế Kỷ XXI - Bốn Thách Thức Lớn",
    url: "https://www.fahasa.com/chinh-sach-kinh-te-trong-the-ky-xxi-bon-thach-thuc-lon.html?fhs_campaign=SEARCH",
    sku: "8935279187591",
    price: 106000,
    stock: 1,
    inStock: true,
  },
  {
    id: "SP_B",
    name: "Truyện Kiều - Kim Vân Kiều Tân Truyện",
    url: "https://www.fahasa.com/truyen-kieu-kim-van-kieu-tan-truyen-606177.html?fhs_campaign=SEARCH",
    sku: "8935077040012",
    price: 64000,
    stock: 7,
    inStock: true,
  },
  {
    id: "SP_C",
    name: "Cây Cam Ngọt Của Tôi (Tái Bản 2026)",
    url: "https://www.fahasa.com/cay-cam-ngot-cua-toi-tai-ban-2026.html?fhs_campaign=SEARCH",
    sku: "8935235248168",
    price: 100000,
    stock: 33,
    inStock: true,
  },
  {
    id: "SP_D",
    name: "Đắc Nhân Tâm",
    url: "https://www.fahasa.com/dac-nhan-tam-sbooks.html?fhs_campaign=SEARCH",
    sku: "9786043949247",
    price: 56000,
    stock: 20,
    inStock: true,
  },
  {
    id: "SP_E",
    name: "Hồ Điệp Và Kình Ngư",
    url: "https://www.fahasa.com/ho-diep-va-kinh-ngu.html?fhs_campaign=POPULAR_SEARCH",
    sku: "8935212370189",
    price: 116000,
    stock: 50,
    inStock: true,
  },
  {
    id: "SP_OOS",
    name: "Chặng Cuối",
    url: "https://www.fahasa.com/chang-cuoi.html",
    sku: "OOS_CHANG_CUOI",
    price: 0,
    stock: 0,
    inStock: false,
  },
];

export const testAccounts = {
  accountX: {
    phone: process.env.FAHASA_ACCOUNT_PHONE ?? "0339469831",
    pass: process.env.FAHASA_ACCOUNT_PASSWORD ?? "123456",
  },
};

export type CartProduct = (typeof cartData)[number];

export function getProduct(id: string): CartProduct {
  const product = cartData.find((p) => p.id === id);
  if (!product) {
    throw new Error(`Không tìm thấy sản phẩm với id: ${id}`);
  }
  return product;
}

export const VOUCHER_10K_THRESHOLD = 150_000;
export const VOUCHER_20K_THRESHOLD = 300_000;
export const DISCOUNT_VOUCHER_THRESHOLD = 499_000;
export const VOUCHER_70K_THRESHOLD = 999_000;

export const VOUCHER_70K_CODE = "FHS70KT06";
export const VOUCHER_30K_CODE = "FHS30KT06";

export const FREESHIP_THRESHOLD = 150_000;
export const FREESHIP_STACK_THRESHOLD = 300_000;

export const s3_invalidQtyData = [
  { value: "0", expected: "1", desc: "Số lượng bằng 0 -> Web tự đổi thành 1" },
  { value: "", expected: "1", desc: "Ô rỗng -> Web tự đổi thành 1" },
  { value: "-1", expected: "1", desc: "Số âm -> Chặn nhập dấu trừ, nhận 1" },
];

export const s3_dirtyPasteData = [
  // CẬP NHẬT: Khi paste bẩn, Fahasa sẽ hoàn trả lại số cũ hợp lệ gần nhất (ở đây là "2")
  { value: "abc", expected: "2", desc: "Chữ cái -> Chặn, giữ nguyên số cũ 2" },
  {
    value: "@#$",
    expected: "2",
    desc: "Ký tự đặc biệt -> Chặn, giữ nguyên số cũ 2",
  },
  // ❌ Dòng cũ bị sai kỳ vọng
  // { value: "2e3", expected: "23", desc: "Ký hiệu khoa học -> Bỏ e, thành 23" },

  // ✅ Sửa lại thành thế này:
  {
    value: "2e3",
    expected: "2",
    desc: "Ký hiệu khoa học -> Bị chặn do có chữ e, giữ nguyên số cũ 2",
  },

  { value: "1.5", expected: "1", desc: "Số thập phân -> Luôn làm tròn xuống" },
  {
    value: "  2  ",
    expected: "2",
    desc: "Khoảng trắng đầu/cuối -> Tự trim thành 2",
  },
];

export type CartLinePlan = { productId: string; qty: number };

export function planSubtotal(
  target: number,
  maxQtyPerLine = 15,
): CartLinePlan[] | null {
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
    for (let qty = 0; qty <= maxQtyPerLine; qty++) {
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

const PRODUCT_IDS = ["SP_A", "SP_B", "SP_C", "SP_D", "SP_E"] as const;

export function indexPlanToCartPlan(
  indexPlan: [number, number][],
): CartLinePlan[] {
  const inStock = cartData.filter((p) => p.inStock && p.price > 0);
  return indexPlan
    .filter(([, qty]) => qty > 0)
    .map(([index, qty]) => ({
      productId: inStock[index]?.id ?? PRODUCT_IDS[index],
      qty,
    }));
}

export function planMaxBelow(threshold: number): CartLinePlan[] | null {
  const inStock = cartData
    .filter((p) => p.inStock && p.price > 0)
    .map((p) => p.price);

  function dfs(
    index: number,
    lines: [number, number][],
    sum: number,
  ): [number, number][] | null {
    if (index >= inStock.length) {
      return sum < threshold ? lines : null;
    }

    let best: [number, number][] | null = null;
    let bestSum = -1;

    for (let qty = 0; qty <= 15; qty++) {
      const nextSum = sum + qty * inStock[index];
      if (nextSum >= threshold) continue;
      const nextLines: [number, number][] =
        qty > 0 ? [...lines, [index, qty]] : lines;
      const found = dfs(index + 1, nextLines, nextSum);
      if (found) {
        const foundSum = found.reduce((s, [i, q]) => s + inStock[i] * q, 0);
        if (foundSum > bestSum) {
          bestSum = foundSum;
          best = found;
        }
      }
    }
    return best;
  }

  const raw = dfs(0, [], 0);
  return raw ? indexPlanToCartPlan(raw) : null;
}

export const FREESHIP_EXACT_PLAN: CartLinePlan[] =
  planSubtotal(FREESHIP_THRESHOLD) ?? [];

export const BELOW_FREESHIP_PLAN: CartLinePlan[] =
  planMaxBelow(FREESHIP_THRESHOLD) ?? [];

export const VOUCHER_70K_EXACT_PLAN: CartLinePlan[] =
  planSubtotal(VOUCHER_70K_THRESHOLD) ?? [];

export const BELOW_VOUCHER_70K_PLAN: CartLinePlan[] =
  planMaxBelow(VOUCHER_70K_THRESHOLD) ?? [];

export const STACKING_499K_PLAN: CartLinePlan[] =
  planSubtotal(DISCOUNT_VOUCHER_THRESHOLD) ?? [];

export const STACKING_399K_PLAN: CartLinePlan[] =
  planSubtotal(DISCOUNT_VOUCHER_THRESHOLD - 100_000) ?? [];

export function catalogSubtotal(plan: CartLinePlan[]): number {
  return plan.reduce((sum, line) => {
    const p = getProduct(line.productId);
    return sum + p.price * line.qty;
  }, 0);
}

export function envFlagEnabled(name: string): boolean {
  const v = process.env[name];
  return v === "1" || v === "true" || v === "yes";
}
export type MergeSameSkuScenario = {
  productId: string;
  guestQty: number;
  accountQty: number;
  expectedQtyAfterMerge: number;
};

export const mergeScenarioS6001: MergeSameSkuScenario | null = {
  productId: "SP_C", // Đổi từ SP_A sang SP_C (Tồn kho: 33)
  guestQty: 2,
  accountQty: 3,
  expectedQtyAfterMerge: 5,
};

export type MergeDifferentSkuScenario = {
  guestProductId: string;
  accountProductId: string;
};

export const mergeScenarioS6002: MergeDifferentSkuScenario | null = {
  guestProductId: "SP_A",
  accountProductId: "SP_B",
};

export function assertPlanReady(
  plan: CartLinePlan[],
  label: string,
): plan is CartLinePlan[] {
  return plan.length > 0;
}
