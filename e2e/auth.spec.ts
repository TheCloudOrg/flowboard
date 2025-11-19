import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Authentication Flow
 *
 * Note: These tests require a test Clerk account and proper environment setup.
 * For CI/CD, you'll need to set up Clerk test mode or use mock authentication.
 */

test.describe('Authentication Flow', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
    // Clear any existing session
    await page.context().clearCookies();
    await page.context().clearPermissions();
  });

  test('should redirect unauthenticated users to sign-in page', async ({ page }) => {
    await page.goto('/');

    // Should be redirected to sign-in or see sign-in prompt
    await page.waitForTimeout(2000); // Wait for redirect

    const url = page.url();
    expect(
      url.includes('/sign-in') || url.includes('clerk') || url.includes('accounts')
    ).toBeTruthy();
  });

  test('should display sign-in form', async ({ page }) => {
    await page.goto('/sign-in');

    // Wait for Clerk sign-in component to load
    await page.waitForTimeout(2000);

    // Check for common sign-in elements
    const hasSignInElements = await page.evaluate(() => {
      return (
        document.body.innerText.includes('Sign in') ||
        document.body.innerText.includes('Email') ||
        document.querySelector('input[type="email"]') !== null ||
        document.querySelector('input[type="password"]') !== null
      );
    });

    expect(hasSignInElements).toBeTruthy();
  });

  test('should display sign-up form', async ({ page }) => {
    await page.goto('/sign-up');

    // Wait for Clerk sign-up component to load
    await page.waitForTimeout(2000);

    // Check for common sign-up elements
    const hasSignUpElements = await page.evaluate(() => {
      return (
        document.body.innerText.includes('Sign up') ||
        document.body.innerText.includes('Create') ||
        document.body.innerText.includes('Email') ||
        document.querySelector('input[type="email"]') !== null
      );
    });

    expect(hasSignUpElements).toBeTruthy();
  });

  test('should have link to switch between sign-in and sign-up', async ({ page }) => {
    await page.goto('/sign-in');
    await page.waitForTimeout(2000);

    // Look for text that suggests switching to sign-up
    const pageContent = await page.content();
    const hasSignUpLink =
      pageContent.includes('Sign up') ||
      pageContent.includes('Create account') ||
      pageContent.includes('Register');

    expect(hasSignUpLink).toBeTruthy();
  });

  // Test for authenticated state (requires manual setup or test user)
  test.skip('should show main board when authenticated', async ({ page }) => {
    // This test is skipped by default as it requires authentication setup
    // To enable: Set up test credentials and remove .skip

    await page.goto('/sign-in');

    // Fill in test credentials (replace with your test user)
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'TestPassword123!');
    await page.click('button[type="submit"]');

    // Wait for navigation to main page
    await page.waitForURL('/');

    // Should see the Kanban board
    await expect(page.locator('text=TODO')).toBeVisible();
    await expect(page.locator('text=In Progress')).toBeVisible();
    await expect(page.locator('text=Completed')).toBeVisible();
  });

  test.skip('should allow sign out', async ({ page }) => {
    // This test is skipped by default as it requires authentication setup

    // Assume user is already authenticated
    await page.goto('/');

    // Look for user menu/button
    const userButton = page.getByTestId('user-button');
    await userButton.click();

    // Click sign out
    await page.click('text=Sign out');

    // Should redirect to sign-in page
    await page.waitForURL(/sign-in/);
    expect(page.url()).toContain('sign-in');
  });
});

/**
 * Setup instructions for running these tests:
 *
 * 1. Create a test organization in Clerk
 * 2. Add test users
 * 3. Set up environment variables:
 *    - PLAYWRIGHT_TEST_BASE_URL (if different from localhost:3000)
 *    - Test user credentials (if using password-based auth)
 *
 * 4. For CI/CD:
 *    - Use Clerk's test mode or create dedicated test environment
 *    - Store credentials securely in GitHub Secrets
 *    - Consider using Clerk's testing utilities if available
 */
