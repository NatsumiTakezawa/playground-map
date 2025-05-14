import { test, expect } from "./fixtures";

// 正常系: ルートページの主要要素が表示されること
// - ヘッダー、温泉一覧見出し、地図、SpotCardリスト、バナー、フッター

test.describe("ルートページ（トップ/温泉マップ）", () => {
  test("主要UI要素が表示される", async ({ page }) => {
    await page.goto("/");
    // ヘッダー
    await expect(page.getByRole("banner")).toBeVisible();
    await expect(
      page.getByRole("link", { name: "松江市温泉マップ" })
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "サインイン" })).toBeVisible();
    // 温泉一覧見出し
    await expect(page.getByRole("heading", { name: "温泉一覧" })).toBeVisible();
    // 地図
    await expect(page.getByLabel("温泉マップ")).toBeVisible();
    // SpotCardリスト（最低1件）
    const cards = await page.locator('[aria-label$="の詳細ページへ"]');
    await expect(cards.first()).toBeVisible();
    // バナー
    await expect(page.getByText("広告バナー（サンプル）")).toBeVisible();
    // フッター
    await expect(page.getByText("© 2025 松江市温泉マップ")).toBeVisible();
  });
});
