import { test, expect } from "@playwright/test";

// 温泉詳細ページのE2Eテスト
// - レビュー投稿ボタンの表示
// - モーダルの開閉
// - 未ログイン時のサインイン誘導
// - 投稿バリデーション
// - 成功時のリロード・UI反映

test.describe("温泉詳細ページ（S01）レビュー投稿", () => {
  test("レビュー投稿ボタンが表示され、モーダルが開閉できる", async ({
    page,
  }) => {
    // テスト用温泉ID（seed.sqlのデータに合わせて適宜変更）
    const onsenId = "10000000-0000-0000-0000-000000000001";
    await page.goto(`/onsen/${onsenId}`);
    // レビューを書くボタンが表示されている
    await expect(
      page.getByRole("button", { name: "レビューを書く" })
    ).toBeVisible();
    // ボタンをクリック→モーダルが開く
    await page.getByRole("button", { name: "レビューを書く" }).click();
    await expect(
      page.getByRole("heading", { name: "レビューを書く" })
    ).toBeVisible();
    // モーダルを閉じる
    await page.keyboard.press("Escape");
    await expect(page.locator("h2", { hasText: "レビューを書く" })).toHaveCount(
      0,
      { timeout: 1000 }
    );
  });

  test("未ログイン時はサインイン誘導メッセージが表示される", async ({
    page,
  }) => {
    const onsenId = "10000000-0000-0000-0000-000000000001";
    await page.goto(`/onsen/${onsenId}`);
    await page.getByRole("button", { name: "レビューを書く" }).click();
    // 星とコメントを入力して投稿
    await page.getByLabel("1つ星").click();
    await page.getByPlaceholder("コメントを入力...").fill("テストコメント");
    await page.getByRole("button", { name: "投稿する" }).click();
    // サインイン誘導メッセージ
    await expect(page.getByText("投稿にはサインインが必要です")).toBeVisible();
  });

  // サインイン済みでの正常投稿は、テスト用ユーザーの自動ログイン処理が必要なため、
  // 別途Playwrightのsetup/fixturesで対応することを推奨
});
