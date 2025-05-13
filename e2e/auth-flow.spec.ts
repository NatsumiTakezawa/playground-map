import { test, expect } from "./fixtures";

test.describe("仮認証フロー", () => {
  test("未ログイン時は管理画面にアクセスできずサインイン画面へリダイレクト", async ({
    page,
  }) => {
    await page.goto("/admin/spots");
    await expect(page).toHaveURL(/\/auth\/signin/);
  });

  test("admin@example.comでサインイン→管理画面→サインアウト→再度アクセスでリダイレクト", async ({
    page,
  }) => {
    await page.goto("/auth/signin");
    await page.getByLabel("メールアドレス").fill("admin@example.com");
    await page.getByRole("button", { name: "サインイン（メール）" }).click();
    await expect(page).toHaveURL(/\/admin\/spots/);
    // サインアウト
    await page.goto("/admin");
    await page.getByTestId("signout-btn").click();
    await expect(page).toHaveURL(/\/auth\/signin/);
    // 再度管理画面アクセス
    await page.goto("/admin/spots");
    await expect(page).toHaveURL(/\/auth\/signin/);
  });

  test("admin以外は管理画面に入れない", async ({ page }) => {
    await page.goto("/auth/signin");
    await page.getByLabel("メールアドレス").fill("user@example.com");
    await page.getByRole("button", { name: "サインイン（メール）" }).click();
    await expect(page).toHaveURL(/\/auth\/signin/);
  });

  test("サインイン済みでサインイン画面にアクセス→自動で管理画面へ遷移", async ({
    page,
  }) => {
    await page.goto("/auth/signin");
    await page.getByLabel("メールアドレス").fill("admin@example.com");
    await page.getByRole("button", { name: "サインイン（メール）" }).click();
    await expect(page).toHaveURL(/\/admin\/spots/);
    // サインイン画面へ再アクセス
    await page.goto("/auth/signin");
    await expect(page).toHaveURL(/\/admin\/spots/);
  });
});
