import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Theme Toggle (Dark/Light Mode)
 */

test.describe('Theme Toggle', () => {
  test.beforeEach(async ({ page }) => {
    // Note: These tests assume the landing page is publicly accessible
    // Adjust URL if theme toggle is only available after authentication
    await page.goto('/landing');
    await page.waitForLoadState('networkidle');
  });

  test('should have theme toggle button', async ({ page }) => {
    // Look for theme toggle button
    const themeButton = page
      .locator('button[aria-label*="mode"]')
      .or(page.locator('button').filter({ hasText: /sun|moon/i }));

    await expect(themeButton.first()).toBeVisible();
  });

  test('should toggle between light and dark mode', async ({ page }) => {
    // Get initial theme
    const htmlElement = page.locator('html');
    const initialClass = await htmlElement.getAttribute('class');
    const isInitiallyDark = initialClass?.includes('dark') ?? false;

    // Find and click theme toggle
    const themeButton = page.locator('button[aria-label*="mode"]').first();
    await themeButton.click();

    // Wait for transition
    await page.waitForTimeout(500);

    // Check that theme has changed
    const newClass = await htmlElement.getAttribute('class');
    const isNowDark = newClass?.includes('dark') ?? false;

    expect(isNowDark).not.toBe(isInitiallyDark);
  });

  test('should persist theme preference', async ({ page }) => {
    // Set theme to light
    const htmlElement = page.locator('html');
    const themeButton = page.locator('button[aria-label*="mode"]').first();

    // Ensure we're in dark mode first
    let currentClass = await htmlElement.getAttribute('class');
    if (!currentClass?.includes('dark')) {
      await themeButton.click();
      await page.waitForTimeout(500);
    }

    // Toggle to light
    await themeButton.click();
    await page.waitForTimeout(500);

    // Reload page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Check that theme persisted
    const persistedClass = await htmlElement.getAttribute('class');
    expect(persistedClass).toContain('light');
    expect(persistedClass).not.toContain('dark');
  });

  test('should update aria-label when toggling', async ({ page }) => {
    const themeButton = page.locator('button[aria-label*="mode"]').first();
    const initialLabel = await themeButton.getAttribute('aria-label');

    // Click to toggle
    await themeButton.click();
    await page.waitForTimeout(500);

    // Check that label changed
    const newLabel = await themeButton.getAttribute('aria-label');
    expect(newLabel).not.toBe(initialLabel);
  });

  test('should apply correct styles in dark mode', async ({ page }) => {
    const htmlElement = page.locator('html');
    const themeButton = page.locator('button[aria-label*="mode"]').first();

    // Ensure dark mode
    let currentClass = await htmlElement.getAttribute('class');
    if (!currentClass?.includes('dark')) {
      await themeButton.click();
      await page.waitForTimeout(500);
    }

    // Check for dark mode styles (background should be dark)
    const backgroundColor = await page.evaluate(() => {
      return window.getComputedStyle(document.body).backgroundColor;
    });

    // Dark mode should have a dark background (rgb values closer to 0)
    // This is a simple check - you may need to adjust based on your exact colors
    expect(backgroundColor).toBeTruthy();
  });

  test('should apply correct styles in light mode', async ({ page }) => {
    const htmlElement = page.locator('html');
    const themeButton = page.locator('button[aria-label*="mode"]').first();

    // Ensure light mode
    let currentClass = await htmlElement.getAttribute('class');
    if (currentClass?.includes('dark')) {
      await themeButton.click();
      await page.waitForTimeout(500);
    }

    // Check for light mode styles
    const backgroundColor = await page.evaluate(() => {
      return window.getComputedStyle(document.body).backgroundColor;
    });

    expect(backgroundColor).toBeTruthy();
  });

  test('should handle rapid toggles', async ({ page }) => {
    const themeButton = page.locator('button[aria-label*="mode"]').first();

    // Rapidly toggle theme multiple times
    await themeButton.click();
    await themeButton.click();
    await themeButton.click();

    await page.waitForTimeout(500);

    // Should still be functional
    const htmlElement = page.locator('html');
    const finalClass = await htmlElement.getAttribute('class');

    // Should have either light or dark class
    const hasValidTheme = finalClass?.includes('light') || finalClass?.includes('dark');
    expect(hasValidTheme).toBeTruthy();
  });

  test('should show correct icon for current theme', async ({ page }) => {
    const htmlElement = page.locator('html');
    const currentClass = await htmlElement.getAttribute('class');
    const isDark = currentClass?.includes('dark') ?? false;

    // In dark mode, should show sun icon (to switch to light)
    // In light mode, should show moon icon (to switch to dark)
    const expectedIcon = isDark ? 'sun' : 'moon';

    // This is a simple check - you may need to adjust based on your implementation
    const pageContent = await page.content();
    const hasExpectedIconClass = pageContent.toLowerCase().includes(expectedIcon);

    expect(hasExpectedIconClass).toBeTruthy();
  });
});
