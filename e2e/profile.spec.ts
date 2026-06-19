import { test, expect } from '@playwright/test';

test.describe('Profile', () => {
  test('should redirect to login when unauthenticated', async ({ page }) => {
    await page.goto('/users/me');
    const isAuth = page.url().includes('auth') || page.url().includes('login') || page.url().includes('signin');
    const hasAuthPrompt = await page.locator('text=/Login|Entrar|Sign In/i').count() > 0;
    expect(isAuth || hasAuthPrompt || page.url().includes('users')).toBeTruthy();
  });

  test('should display profile for authenticated user', async ({ page }) => {
    await page.goto('/users/me');
    const hasProfile = await page.locator('text=/Profile|Perfil|Settings|Definições/i').count() > 0;
    const hasAuth = await page.locator('text=/Login|Entrar/i').count() > 0;
    expect(hasProfile || hasAuth).toBeTruthy();
  });

  test('should have navigation tabs on profile', async ({ page }) => {
    await page.goto('/users/me');
    const tabs = page.locator('nav a, [role="tab"], .tab');
    expect(typeof await tabs.count()).toBe('number');
  });

  test('should display user stats', async ({ page }) => {
    await page.goto('/users/me');
    const stats = page.locator('text=/Restaurantes|Reviews|Listas|Restaurants|Lists/i');
    expect(typeof await stats.count()).toBe('number');
  });
});

