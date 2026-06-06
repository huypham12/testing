import path from "path";
import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";

dotenv.config({ path: path.resolve(__dirname, ".env") });

export default defineConfig({
  testDir: "./tests",

  /* ===== EXECUTION STRATEGY ===== */

  // chạy song song để tăng tốc
  fullyParallel: true,

  // fail CI nếu còn test.only (tránh quên debug code)
  forbidOnly: !!process.env.CI,

  // Tắt hoàn toàn retry để chỉ chạy 1 lần duy nhất
  retries: 0,

  // CI chạy 1 worker để ổn định, local thì auto
  workers: process.env.CI ? 1 : undefined,

  /* ===== REPORTING (RẤT QUAN TRỌNG CHO ĐỒ ÁN) ===== */

  reporter: [
    ["html", { open: "never" }], // report chính để nộp
    ["json", { outputFile: "test-results.json" }], // phục vụ export / thống kê
    ["junit", { outputFile: "results.xml" }], // CI-style (nếu giảng viên thích)
  ],

  /* ===== GLOBAL TEST SETTINGS ===== */

  use: {
    /* Base URL (bắt buộc nên set cho đồ án web) */
    baseURL: "https://www.fahasa.com/",

    /* Evidence (bằng chứng test) */
    screenshot: "only-on-failure", // fail mới chụp
    video: "retain-on-failure", // fail mới lưu video

    // Đổi thành retain-on-failure vì test không còn retry nữa
    // Nếu fail sẽ lưu lại file trace để xem chi tiết network/DOM
    trace: "retain-on-failure",

    /* UX ổn định hơn */
    actionTimeout: 15000,
    navigationTimeout: 30000,
  },

  /* ===== BROWSER PROJECTS ===== */
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },

    // Đã comment Firefox lại để chỉ chạy Chrome lúc debug
    /*
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    */

    // Đã comment Webkit lại để chỉ chạy Chrome lúc debug
    /*
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
    */
  ],

  /* ===== OPTIONAL LOCAL SERVER (nếu có frontend local) ===== */
  // webServer: {
  //   command: 'npm run dev',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});
