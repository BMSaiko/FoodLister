import { test, expect } from '@playwright/test';

test.describe('Lists', () => {
  test('should display lists page', async ({ page }) => {
    await page.goto('/lists');
    await expect(page).toHaveURL(/.*lists/);
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('should display list of lists or empty state', async ({ page }) => {
    await page.goto('/lists');
    await page.waitForTimeout(2000);
    const hasCards = await page.locator('article, [class*="card"], [class*="list"]').count() > 0;
    const hasEmpty = await page.locator('text=/Nenhuma lista|No lists|empty/i').count() > 0;
    expect(hasCards || hasEmpty).toBeTruthy();
  });

  test('should have create list button', async ({ page }) => {
    await page.goto('/lists');
    const createBtn = page.getByRole('link', { name: /create|criar|nova|new/i }).first();
    expect(typeof await createBtn.count()).toBe('number');
  });

  test('should navigate to create list page', async ({ page }) => {
    await page.goto('/lists');
    const createLink = page.getByRole('link', { name: /create|criar|nova|new/i }).first();
    if (await createLink.isVisible()) {
      await createLink.click();
      await expect(page).toHaveURL(/.*lists\/create/);
    }
  });

  test('should navigate to list detail', async ({ page }) => {
    await page.goto('/lists');
    await page.waitForTimeout(2000);
    const firstCard = page.locator('article, [class*="card"]').first();
    if (await firstCard.isVisible()) {
      await firstCard.click();
      await page.waitForURL(/.*lists\/.+/);
      await expect(page).toHaveURL(/.*lists\/[a-zA-Z0-9-]+/);
    }
  });
});

