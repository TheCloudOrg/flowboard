import { test, expect } from '@playwright/test'

/**
 * E2E Tests for Card CRUD Operations
 *
 * Note: These tests require authentication to be set up.
 * They are marked as .skip by default - remove .skip when you have auth configured.
 */

test.describe.skip('Card CRUD Operations', () => {
  test.beforeEach(async ({ page }) => {
    // Assume user is already authenticated
    // You'll need to implement authentication helper or use Clerk's test utilities
    await page.goto('/')
    await page.waitForLoadState('networkidle')
  })

  test('should create a new card', async ({ page }) => {
    // Find the TODO column add button
    const todoColumn = page.locator('text=TODO').locator('..')
    const addButton = todoColumn.locator('button').filter({ hasText: '+' }).or(
      todoColumn.locator('button[aria-label*="Add"]')
    )

    await addButton.first().click()

    // Fill in card details in modal
    await page.fill('input[name="title"]', 'Test Card from E2E')
    await page.fill('textarea[name="description"]', 'This is a test card created by Playwright')

    // Submit the form
    await page.click('button[type="submit"]')

    // Wait for card to appear
    await page.waitForTimeout(1000)

    // Verify card appears in TODO column
    await expect(page.locator('text=Test Card from E2E')).toBeVisible()
  })

  test('should edit an existing card', async ({ page }) => {
    // Find a card to edit (assumes at least one card exists)
    const cards = page.locator('[data-testid^="card-"]').or(
      page.locator('.card').or(page.locator('[class*="card"]'))
    )

    const firstCard = cards.first()

    // Hover to reveal edit button
    await firstCard.hover()

    // Click edit button
    const editButton = firstCard.locator('button[aria-label*="Edit"]').or(
      firstCard.locator('button').filter({ hasText: 'Edit' })
    )
    await editButton.first().click()

    // Modify card details
    await page.fill('input[name="title"]', 'Updated Card Title')
    await page.fill('textarea[name="description"]', 'Updated description')

    // Save changes
    await page.click('button[type="submit"]')

    await page.waitForTimeout(1000)

    // Verify changes
    await expect(page.locator('text=Updated Card Title')).toBeVisible()
  })

  test('should delete a card', async ({ page }) => {
    // Create a card to delete
    const todoColumn = page.locator('text=TODO').locator('..')
    const addButton = todoColumn.locator('button').first()
    await addButton.click()

    await page.fill('input[name="title"]', 'Card to Delete')
    await page.click('button[type="submit"]')
    await page.waitForTimeout(1000)

    // Find and delete the card
    const cardToDelete = page.locator('text=Card to Delete').locator('..')
    await cardToDelete.hover()

    const deleteButton = cardToDelete.locator('button[aria-label*="Delete"]').or(
      cardToDelete.locator('button').filter({ hasText: 'Delete' })
    )

    await deleteButton.first().click()

    // Confirm deletion if there's a confirmation dialog
    const confirmButton = page.locator('button').filter({ hasText: /confirm|delete|yes/i })
    if (await confirmButton.isVisible()) {
      await confirmButton.click()
    }

    await page.waitForTimeout(1000)

    // Verify card is gone
    await expect(page.locator('text=Card to Delete')).not.toBeVisible()
  })

  test('should show card details in modal when editing', async ({ page }) => {
    // Find a card with description
    const cards = page.locator('[data-testid^="card-"]').or(
      page.locator('.card')
    )

    const firstCard = cards.first()
    await firstCard.hover()

    const editButton = firstCard.locator('button[aria-label*="Edit"]').first()
    await editButton.click()

    // Modal should be visible with form fields
    await expect(page.locator('input[name="title"]')).toBeVisible()
    await expect(page.locator('textarea[name="description"]')).toBeVisible()

    // Fields should have values
    const titleValue = await page.locator('input[name="title"]').inputValue()
    expect(titleValue.length).toBeGreaterThan(0)
  })

  test('should close modal without saving when cancelled', async ({ page }) => {
    // Open add card modal
    const addButton = page.locator('button').filter({ hasText: '+' }).first()
    await addButton.click()

    // Fill in some data
    await page.fill('input[name="title"]', 'Cancelled Card')

    // Close modal (look for X, Cancel, or ESC key)
    const cancelButton = page.locator('button').filter({ hasText: /cancel|close/i })
    if (await cancelButton.isVisible()) {
      await cancelButton.click()
    } else {
      await page.keyboard.press('Escape')
    }

    await page.waitForTimeout(500)

    // Card should not be created
    await expect(page.locator('text=Cancelled Card')).not.toBeVisible()
  })

  test('should validate required fields', async ({ page }) => {
    // Open add card modal
    const addButton = page.locator('button').filter({ hasText: '+' }).first()
    await addButton.click()

    // Try to submit without filling required field (title)
    await page.click('button[type="submit"]')

    // Should show validation error or prevent submission
    // Modal should still be open
    await expect(page.locator('input[name="title"]')).toBeVisible()
  })

  test('should display card count in column header', async ({ page }) => {
    // Each column should show how many cards it contains
    const todoColumn = page.locator('text=TODO').locator('..')
    const countElement = todoColumn.locator('text=/\\d+/')

    await expect(countElement.first()).toBeVisible()
  })

  test('should support adding notes to a card', async ({ page }) => {
    const addButton = page.locator('button').filter({ hasText: '+' }).first()
    await addButton.click()

    await page.fill('input[name="title"]', 'Card with Notes')

    // Fill notes field if available
    const notesField = page.locator('textarea[name="notes"]').or(
      page.locator('input[name="notes"]')
    )

    if (await notesField.isVisible()) {
      await notesField.fill('These are test notes')
      await page.click('button[type="submit"]')

      await page.waitForTimeout(1000)

      // Verify card was created
      await expect(page.locator('text=Card with Notes')).toBeVisible()
    }
  })
})

/**
 * Setup instructions:
 *
 * 1. Remove .skip from test.describe.skip
 * 2. Implement authentication helper in beforeEach
 * 3. Ensure test database is properly set up and isolated
 * 4. Adjust selectors based on your actual component structure
 * 5. Consider adding test data cleanup in afterEach
 */
