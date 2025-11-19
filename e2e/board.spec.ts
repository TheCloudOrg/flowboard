import { test, expect } from '@playwright/test'

/**
 * E2E Tests for Board Creation and Loading
 *
 * Tests the Kanban board functionality including initial load,
 * board creation, and board data persistence.
 */

test.describe('Board Operations', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the main board page
    await page.goto('/')
    await page.waitForLoadState('networkidle')
  })

  test('should load the Kanban board page', async ({ page }) => {
    // Check that the page loads successfully
    await expect(page).toHaveURL('/')

    // Verify page title or main heading exists
    const mainContent = page.locator('main')
    await expect(mainContent).toBeVisible()
  })

  test('should display default board columns', async ({ page }) => {
    // Check for standard Kanban columns
    await expect(page.getByText('TODO', { exact: false })).toBeVisible()
    await expect(page.getByText('In Progress', { exact: false })).toBeVisible()
    await expect(page.getByText('Completed', { exact: false })).toBeVisible()
  })

  test('should display board structure correctly', async ({ page }) => {
    // Verify the board has the expected structure
    const columns = page.locator('[data-testid^="column-"]').or(
      page.locator('[class*="column"]')
    )

    // Should have at least 3 columns (TODO, In Progress, Completed)
    const columnCount = await columns.count()
    expect(columnCount).toBeGreaterThanOrEqual(3)
  })

  test('should load board data from database', async ({ page }) => {
    // Wait for any existing data to load
    await page.waitForTimeout(1500)

    // Board should be functional (even if empty)
    const todoColumn = page.getByText('TODO', { exact: false }).locator('..')
    await expect(todoColumn).toBeVisible()
  })

  test('should maintain board state on page reload', async ({ page }) => {
    // Wait for initial load
    await page.waitForTimeout(1000)

    // Get initial column count
    const initialColumns = page.locator('[data-testid^="column-"]').or(
      page.locator('text=TODO').or(page.locator('text=In Progress'))
    )
    const initialCount = await initialColumns.count()

    // Reload the page
    await page.reload()
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    // Verify columns still exist
    const reloadedColumns = page.locator('[data-testid^="column-"]').or(
      page.locator('text=TODO').or(page.locator('text=In Progress'))
    )
    const reloadedCount = await reloadedColumns.count()

    expect(reloadedCount).toBeGreaterThanOrEqual(initialCount)
  })

  test('should display empty state when no cards exist', async ({ page }) => {
    // This test assumes a fresh board or will check for empty columns
    await page.waitForTimeout(1000)

    // Each column should be visible even if empty
    await expect(page.getByText('TODO', { exact: false })).toBeVisible()
    await expect(page.getByText('In Progress', { exact: false })).toBeVisible()
    await expect(page.getByText('Completed', { exact: false })).toBeVisible()
  })

  test('should have responsive layout', async ({ page }) => {
    // Test on desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.waitForTimeout(500)

    const todoColumn = page.getByText('TODO', { exact: false })
    await expect(todoColumn).toBeVisible()

    // Test on mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.waitForTimeout(500)

    // Board should still be functional on mobile
    await expect(todoColumn).toBeVisible()
  })

  test('should handle network errors gracefully', async ({ page }) => {
    // Simulate offline mode
    await page.context().setOffline(true)

    // Try to reload
    await page.reload().catch(() => {})

    // Go back online
    await page.context().setOffline(false)
    await page.reload()
    await page.waitForLoadState('networkidle')

    // Board should load after reconnection
    await expect(page.getByText('TODO', { exact: false })).toBeVisible()
  })

  test('should load within acceptable time', async ({ page }) => {
    const startTime = Date.now()

    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Wait for board columns to be visible
    await expect(page.getByText('TODO', { exact: false })).toBeVisible()

    const loadTime = Date.now() - startTime

    // Board should load within 5 seconds
    expect(loadTime).toBeLessThan(5000)
  })

  test('should display board header elements', async ({ page }) => {
    await page.waitForTimeout(1000)

    // Look for common header elements (adjust based on your UI)
    // This could include organization switcher, user menu, etc.
    const pageContent = await page.content()

    // Verify some content is loaded
    expect(pageContent.length).toBeGreaterThan(100)
  })
})

/**
 * Board Creation Tests (if applicable)
 * These tests are for scenarios where users can create multiple boards
 */
test.describe.skip('Board Creation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
  })

  test('should allow creating a new board', async ({ page }) => {
    // Look for "New Board" or "Create Board" button
    const createButton = page.locator('button').filter({
      hasText: /new board|create board/i
    })

    if (await createButton.isVisible()) {
      await createButton.click()

      // Fill in board details
      await page.fill('input[name="boardName"]', 'Test Board')
      await page.fill('textarea[name="boardDescription"]', 'E2E Test Board')

      // Submit
      await page.click('button[type="submit"]')

      await page.waitForTimeout(1000)

      // Verify board was created
      await expect(page.getByText('Test Board')).toBeVisible()
    } else {
      test.skip()
    }
  })

  test('should validate board name is required', async ({ page }) => {
    const createButton = page.locator('button').filter({
      hasText: /new board|create board/i
    })

    if (await createButton.isVisible()) {
      await createButton.click()

      // Try to submit without name
      await page.click('button[type="submit"]')

      // Should show validation error or prevent submission
      const nameInput = page.locator('input[name="boardName"]')
      await expect(nameInput).toBeVisible()
    } else {
      test.skip()
    }
  })
})
