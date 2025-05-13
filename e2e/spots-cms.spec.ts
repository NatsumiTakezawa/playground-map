import { test, expect } from '@playwright/test';

// 管理者用テストユーザー
const admin = { email: 'admin@example.com', password: 'password' };

// スポットダミーデータ
const newSpot = {
  name: 'テスト温泉',
  geo_lat: 35.4723,
  geo_lng: 133.0505,
  description: 'テスト用の温泉です',
  tags: '露天,家族風呂',
};

// スポット編集用データ
const editSpot = {
  name: '編集後温泉',
  description: '編集後の説明',
};

test.describe('管理画面: スポットCMS CRUD', () => {
  test('未ログイン時はサインイン画面へリダイレクト', async ({ page }) => {
    await page.goto('/admin/spots');
    await expect(page).toHaveURL(/\/auth\/signin/);
  });

  test('管理者でログインし、スポット一覧→新規作成→編集→削除', async ({ page }) => {
    // サインイン
    await page.goto('/auth/signin');
    await page.getByLabel('メールアドレス').fill(admin.email);
    await page.getByLabel('パスワード').fill(admin.password);
    await page.getByRole('button', { name: 'サインイン' }).click();
    await expect(page).toHaveURL(/\/admin/);

    // スポットCMSへ遷移
    await page.goto('/admin/spots');
    await expect(page.getByRole('heading', { name: /スポット管理/ })).toBeVisible();

    // 新規作成
    await page.getByRole('button', { name: /新規作成/ }).click();
    await page.getByLabel('温泉名').fill(newSpot.name);
    await page.getByLabel('緯度').fill(newSpot.geo_lat.toString());
    await page.getByLabel('経度').fill(newSpot.geo_lng.toString());
    await page.getByLabel('説明').fill(newSpot.description);
    await page.getByLabel('タグ').fill(newSpot.tags);
    await page.getByRole('button', { name: /登録/ }).click();
    await expect(page.getByText(newSpot.name)).toBeVisible();

    // 編集
    await page.getByRole('row', { name: newSpot.name }).getByRole('button', { name: /編集/ }).click();
    await page.getByLabel('温泉名').fill(editSpot.name);
    await page.getByLabel('説明').fill(editSpot.description);
    await page.getByRole('button', { name: /保存/ }).click();
    await expect(page.getByText(editSpot.name)).toBeVisible();

    // 削除
    await page.getByRole('row', { name: editSpot.name }).getByRole('button', { name: /削除/ }).click();
    await page.getByRole('dialog').getByRole('button', { name: /OK|はい/ }).click();
    await expect(page.getByText(editSpot.name)).not.toBeVisible();
  });

  test('画像未設定時はPlacehold画像が表示される', async ({ page }) => {
    await page.goto('/auth/signin');
    await page.getByLabel('メールアドレス').fill(admin.email);
    await page.getByLabel('パスワード').fill(admin.password);
    await page.getByRole('button', { name: 'サインイン' }).click();
    await page.goto('/admin/spots');
    // 画像alt属性・src確認
    const img = await page.getByAltText(/温泉画像/);
    await expect(img).toHaveAttribute('src', /file\.svg/);
  });
});
