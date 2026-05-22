import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",

  /* ===== EXECUTION STRATEGY ===== */

  // chạy song song để tăng tốc
  fullyParallel: true,

  // fail CI nếu còn test.only (tránh quên debug code)
  forbidOnly: !!process.env.CI,

  // retry khi fail (CI: 2 lần, local: 0)
  retries: process.env.CI ? 2 : 1,

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
    trace: "on-first-retry", // debug chi tiết khi retry

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

    // Firefox: giữ để đa browser testing (điểm cộng)
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },

    // Webkit: optional nhưng vẫn nên giữ để “đủ chuẩn”
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
  ],

  /* ===== OPTIONAL LOCAL SERVER (nếu có frontend local) ===== */
  // webServer: {
  //   command: 'npm run dev',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});
