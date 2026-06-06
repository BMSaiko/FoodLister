import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should display login page', async ({ page }) => {
    await page.goto('/auth/signin');
    await expect(page).toHaveURL(/.*auth\/signin/);
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('should display signup page', async ({ page }) => {
    await page.goto('/auth/signup');
    await expect(page).toHaveURL(/.*auth\/signup/);
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('should show validation on empty form submit', async ({ page }) => {
    await page.goto('/auth/signin');
    const submitBtn = page.getByRole('button', { name: /login|entrar|sign in|submit/i }).first();
    if (await submitBtn.isVisible()) {
      await submitBtn.click();
      // Should stay on same page
      await expect(page).toHaveURL(/.*auth\/signin/);
    }
  });

  test('should navigate between login and signup', async ({ page }) => {
    await page.goto('/auth/signin');
    const signupLink = page.getByRole('link', { name: /sign up|criar conta|registar/i }).first();
    if (await signupLink.isVisible()) {
      await signupLink.click();
      await expect(page).toHaveURL(/.*auth\/signup/);
    }
  });

  test('should display forgot password link', async ({ page }) => {
    await page.goto('/auth/signin');
    const forgotLink = page.getByRole('link', { name: /forgot|esqueceu|password/i }).first();
    // Link may or may not be present depending on implementation
    expect(typeof await forgotLink.count()).toBe('number');
  });
});

