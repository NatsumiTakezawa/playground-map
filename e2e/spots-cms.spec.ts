import { test, expect } from "@playwright/test";
import fs from "fs/promises";

// 管理者用テストユーザー
const admin = { email: "admin@example.com", password: "password" };

// スポットダミーデータ
const newSpot = {
  name: "テスト温泉",
  geo_lat: 35.4723,
  geo_lng: 133.0505,
  description: "テスト用の温泉です",
  tags: "露天,家族風呂",
};

// スポット編集用データ
const editSpot = {
  name: "編集後温泉",
  description: "編集後の説明",
};

test.describe("管理画面: スポットCMS CRUD", () => {
  test("未ログイン時はサインイン画面へリダイレクト", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());
    await page.goto("/admin/spots");
    await page.waitForURL(/\/auth\/signin/);
    await expect(page).toHaveURL(/\/auth\/signin/);
  });

  test("管理者でログインし、スポット一覧→新規作成→編集→削除", async ({
    page,
  }) => {
    // サインイン
    await page.goto("/auth/signin");
    await page.getByLabel("メールアドレス").fill(admin.email);
    await page.getByRole("button", { name: "サインイン（メール）" }).click();
    await page.waitForURL(/\/admin\/spots/);

    // スポットCMSへ遷移
    await expect(
      page.getByRole("heading", { name: /スポット管理|スポットCMS/ })
    ).toBeVisible();

    // 新規作成
    await page.getByRole("button", { name: /新規作成/ }).click();
    await page.getByLabel("温泉名").fill(newSpot.name);
    await page.getByLabel("緯度").fill(newSpot.geo_lat.toString());
    await page.getByLabel("経度").fill(newSpot.geo_lng.toString());
    await page.getByLabel("説明").fill(newSpot.description);
    await page.getByLabel("タグ").fill(newSpot.tags);
    await page.getByRole("button", { name: /登録/ }).click();
    await page.reload();
    await expect(
      page.locator(`[data-testid="spot-name-${newSpot.name}"]`).first()
    ).toBeVisible();

    // 編集
    const editRow = await page
      .locator(`[data-testid="spot-name-${newSpot.name}"]`)
      .first()
      .locator("..")
      .locator("..");
    await editRow.getByRole("button", { name: /編集/ }).click();
    await page.getByLabel("温泉名").fill(editSpot.name);
    await page.getByLabel("説明").fill(editSpot.description);
    await page.getByRole("button", { name: /保存/ }).click();
    await expect(
      page.locator(`[data-testid="spot-name-${editSpot.name}"]`).first()
    ).toBeVisible();

    // 削除
    const delRow = await page
      .locator(`[data-testid="spot-name-${editSpot.name}"]`)
      .first()
      .locator("..")
      .locator("..");
    await delRow.getByRole("button", { name: /削除/ }).click();
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "削除" })
      .click();
    await expect(
      page.locator(`[data-testid="spot-name-${editSpot.name}"]`)
    ).toHaveCount(0);
  });

  test("画像未設定時はPlacehold画像が表示される", async ({ page }) => {
    await page.goto("/auth/signin");
    await page.getByLabel("メールアドレス").fill(admin.email);
    await page.getByRole("button", { name: "サインイン（メール）" }).click();
    await page.waitForURL(/\/admin\/spots/);
    // 画像未設定スポットを新規作成
    await page.getByRole("button", { name: /新規作成/ }).click();
    await page.getByLabel("温泉名").fill("画像なし温泉");
    await page.getByLabel("緯度").fill("35.0");
    await page.getByLabel("経度").fill("133.0");
    await page.getByLabel("説明").fill("画像未設定テスト");
    await page.getByLabel("タグ").fill("テスト");
    await page.getByRole("button", { name: /登録/ }).click();
    await page.reload();
    const img = await page
      .locator(`[data-testid="spot-img-画像なし温泉"]`)
      .first();
    await expect(img).toHaveAttribute("src", "/file.svg");
  });

  test("CSVインポートで複数スポットを一括登録できる", async ({
    page,
  }, testInfo) => {
    await page.goto("/auth/signin");
    await page.getByLabel("メールアドレス").fill(admin.email);
    await page.getByRole("button", { name: "サインイン（メール）" }).click();
    await page.waitForURL(/\/admin\/spots/);
    // CSVファイル作成
    const csv = `name,geo_lat,geo_lng,description,tags\nCSV温泉1,35.1,133.1,CSVテスト1,タグ1\nCSV温泉2,35.2,133.2,CSVテスト2,タグ2`;
    const filePath = testInfo.outputPath("test.csv");
    await fs.writeFile(filePath, csv);
    // CSVインポート
    await page.getByRole("button", { name: /CSVインポート/ }).click();
    const fileChooserPromise = page.waitForEvent("filechooser");
    await page.getByLabel("ファイルを選択").click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(filePath);
    await page.getByRole("button", { name: /一括登録/ }).click();
    await expect(
      page.locator(`[data-testid="spot-name-CSV温泉1"]`).first()
    ).toBeVisible();
    await expect(
      page.locator(`[data-testid="spot-name-CSV温泉2"]`).first()
    ).toBeVisible();
  });

  test("CSVインポートで必須項目不足時はエラー表示", async ({
    page,
  }, testInfo) => {
    await page.goto("/auth/signin");
    await page.getByLabel("メールアドレス").fill(admin.email);
    await page.getByRole("button", { name: "サインイン（メール）" }).click();
    await page.waitForURL(/\/admin\/spots/);
    // 不正なCSV
    const csv = `name,geo_lat\n不正温泉,35.0`;
    const filePath = testInfo.outputPath("invalid.csv");
    await fs.writeFile(filePath, csv);
    await page.getByRole("button", { name: /CSVインポート/ }).click();
    const fileChooserPromise = page.waitForEvent("filechooser");
    await page.getByLabel("ファイルを選択").click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(filePath);
    await page.getByRole("button", { name: /一括登録/ }).click();
    await expect(
      page.locator('[data-testid="error-message"]').first()
    ).toBeVisible();
  });

  test("必須項目未入力時はバリデーションエラーが表示される", async ({
    page,
  }) => {
    await page.goto("/auth/signin");
    await page.getByLabel("メールアドレス").fill(admin.email);
    await page.getByRole("button", { name: "サインイン（メール）" }).click();
    await page.waitForURL(/\/admin\/spots/);
    await page.getByRole("button", { name: /新規作成/ }).click();
    // フォームが開いていることを確認
    await expect(
      page.getByRole("heading", { name: "新規スポット作成" })
    ).toBeVisible();

    // フォームの HTML5 バリデーションをオフ
    await page.evaluate(() => {
      const form = document.querySelector("form");
      if (form) form.setAttribute("novalidate", "true");
    });

    await page.getByRole("button", { name: /登録/ }).click();
    // エラーメッセージが表示されていることを確認
    const error = page.locator('[data-testid="error-message"]');
    await expect(error.first()).toBeVisible();
    await expect(error.first()).toHaveText(/必須項目が未入力です/);
  });
});
