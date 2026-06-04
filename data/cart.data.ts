export const cartData = [
  {
    id: "SP_A", // alias trong spec
    name: "Chính Sách Kinh Tế Trong Thế Kỷ XXI - Bốn Thách Thức Lớn",
    url: "https://www.fahasa.com/chinh-sach-kinh-te-trong-the-ky-xxi-bon-thach-thuc-lon.html?fhs_campaign=SEARCH",
    sku: "8935279187591", // hoặc product id trong DOM (qty-407511)
    price: 106000, // giá hiện tại trên web (parse số)
    stock: 1, // max qty thực tế (thử +/- trên UI)
    inStock: true,
  },
  {
    id: "SP_B", // alias trong spec
    name: "Truyện Kiều - Kim Vân Kiều Tân Truyện",
    url: "https://www.fahasa.com/truyen-kieu-kim-van-kieu-tan-truyen-606177.html?fhs_campaign=SEARCH",
    sku: "8935077040012", // hoặc product id trong DOM (qty-407511)
    price: 64000, // giá hiện tại trên web (parse số)
    stock: 7, // max qty thực tế (thử +/- trên UI)
    inStock: true,
  },
  {
    id: "SP_C", // alias trong spec
    name: "Cây Cam Ngọt Của Tôi (Tái Bản 2026)",
    url: "https://www.fahasa.com/cay-cam-ngot-cua-toi-tai-ban-2026.html?fhs_campaign=SEARCH",
    sku: "8935235248168", // hoặc product id trong DOM (qty-407511)
    price: 100000, // giá hiện tại trên web (parse số)
    stock: 33, // max qty thực tế (thử +/- trên UI)
    inStock: true,
  },
  {
    id: "SP_D", // alias trong spec
    name: "Đắc Nhân Tâm",
    url: "https://www.fahasa.com/dac-nhan-tam-sbooks.html?fhs_campaign=SEARCH",
    sku: "9786043949247", // hoặc product id trong DOM (qty-407511)
    price: 56000, // giá hiện tại trên web (parse số)
    stock: 20, // max qty thực tế (thử +/- trên UI)
    inStock: true,
  },
  {
    id: "SP_E", // alias trong spec
    name: "Hồ Điệp Và Kình Ngư",
    url: "https://www.fahasa.com/ho-diep-va-kinh-ngu.html?fhs_campaign=POPULAR_SEARCH",
    sku: "8935212370189", // hoặc product id trong DOM (qty-407511)
    price: 116000, // giá hiện tại trên web (parse số)
    stock: 50, // max qty thực tế (thử +/- trên UI)
    inStock: true,
  },
];

export const testAccounts = {
  accountX: { phone: "0339469831", pass: "123456" },
};

export type CartProduct = (typeof cartData)[number];

export function getProduct(id: string): CartProduct {
  const product = cartData.find((p) => p.id === id);
  if (!product) {
    throw new Error(`Không tìm thấy sản phẩm với id: ${id}`);
  }
  return product;
}

// Ngưỡng khuyến mãi theo cart_spec.md
export const FREESHIP_THRESHOLD = 500_000;
export const VOUCHER_70K_THRESHOLD = 999_000;

// DATA CHO SCENARIO 3: Số lượng không hợp lệ / paste dữ liệu bẩn
export const s3_invalidQtyData = [
  { value: "0", desc: "Số lượng bằng 0" },
  { value: "", desc: "Ô rỗng" },
  { value: "-1", desc: "Số âm" },
];

export const s3_dirtyPasteData = [
  { value: "abc", desc: "Chữ cái" },
  { value: "@#$", desc: "Ký tự đặc biệt" },
  { value: "2e3", desc: "Ký hiệu khoa học" },
  { value: "1.5", desc: "Số thập phân" },
  { value: "  2  ", desc: "Khoảng trắng đầu/cuối" },
];
