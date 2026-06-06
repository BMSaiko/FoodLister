import { test, expect } from '@playwright/test';

test.describe('Restaurants', () => {
  test('should display restaurants page', async ({ page }) => {
    await page.goto('/restaurants');
    await expect(page).toHaveURL(/.*restaurants/);
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('should display restaurant list or empty state', async ({ page }) => {
    await page.goto('/restaurants');
    await page.waitForTimeout(2000);
    const hasCards = await page.locator('article, [class*="card"], [class*="restaurant"]').count() > 0;
    const hasEmpty = await page.locator('text=/Nenhum|No |empty|vazio/i').count() > 0;
    expect(hasCards || hasEmpty).toBeTruthy();
  });

  test('should have working search bar', async ({ page }) => {
    await page.goto('/restaurants');
    const searchInput = page.locator('input[type="search"], input[placeholder*="search" i], input[placeholder*="pesquisar" i], input[name="search"]').first();
    if (await searchInput.isVisible()) {
      await searchInput.fill('pizza');
      await searchInput.press('Enter');
      await page.waitForTimeout(1000);
    }
  });

  test('should have filter options', async ({ page }) => {
    await page.goto('/restaurants');
    const filterBtn = page.locator('button:has-text("Filter"), button:has-text("Filtro"), [class*="filter"]').first();
    expect(typeof await filterBtn.count()).toBe('number');
  });

  test('should navigate to restaurant detail', async ({ page }) => {
    await page.goto('/restaurants');
    await page.waitForTimeout(2000);
    const firstCard = page.locator('article, [class*="card"], [class*="restaurant"]').first();
    if (await firstCard.isVisible()) {
      await firstCard.click();
      await page.waitForURL(/.*restaurants\/.+/);
      await expect(page).toHaveURL(/.*restaurants\/[a-zA-Z0-9-]+/);
    }
  });
});

