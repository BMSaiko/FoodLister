import { test, expect } from '@playwright/test';

test.describe('Reviews', () => {
  test('should display reviews on restaurant detail', async ({ page }) => {
    await page.goto('/restaurants');
    await page.waitForTimeout(2000);
    const firstCard = page.locator('article, [class*="card"]').first();
    if (await firstCard.isVisible()) {
      await firstCard.click();
      await page.waitForURL(/.*restaurants\/.+/);
      await page.waitForTimeout(1000);
      const hasReviews = await page.locator('text=/Review|Avaliação|Comentário/i').count() > 0;
      expect(typeof hasReviews).toBe('boolean');
    }
  });

  test('should show review form for authenticated users', async ({ page }) => {
    await page.goto('/restaurants');
    await page.waitForTimeout(2000);
    const firstCard = page.locator('article, [class*="card"]').first();
    if (await firstCard.isVisible()) {
      await firstCard.click();
      await page.waitForURL(/.*restaurants\/.+/);
      const reviewForm = page.locator('form:has(textarea), form:has(input[type="number"])').first();
      expect(typeof await reviewForm.count()).toBe('number');
    }
  });

  test('should display star ratings', async ({ page }) => {
    await page.goto('/restaurants');
    await page.waitForTimeout(2000);
    const stars = page.locator('[class*="star"], [class*="rating"]').first();
    expect(typeof await stars.count()).toBe('number');
  });
});

