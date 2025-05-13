import { test, expect } from '@playwright/test';

test.describe('管理メニュー共通化', () => {
  test('全てのadmin配下ページでメニュー・サインアウトが表示される', async ({ page }) => {
    await page.goto('/auth/signin');
    await page.getByLabel('メールアドレス').fill('admin@example.com');
    await page.getByRole('button', { name: 'サインイン（メール）' }).click();
    // ダッシュボード
    await page.goto('/admin');
    await expect(page.locator('[data-testid="admin-menu"]')).toBeVisible();
    await expect(page.getByRole('button', { name: 'サインアウト' })).toBeVisible();
    // スポットCMS
    await page.goto('/admin/spots');
    await expect(page.locator('[data-testid="admin-menu"]')).toBeVisible();
    await expect(page.getByRole('button', { name: 'サインアウト' })).toBeVisible();
    // 広告管理
    await page.goto('/admin/ads');
    await expect(page.locator('[data-testid="admin-menu"]')).toBeVisible();
    await expect(page.getByRole('button', { name: 'サインアウト' })).toBeVisible();
    // テーマ管理
    await page.goto('/admin/themes');
    await expect(page.locator('[data-testid="admin-menu"]')).toBeVisible();
    await expect(page.getByRole('button', { name: 'サインアウト' })).toBeVisible();
  });
});
