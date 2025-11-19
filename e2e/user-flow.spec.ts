import { test, expect } from '@playwright/test'

/**
 * Comprehensive E2E Test: Complete User Journey
 *
 * This test validates the entire user flow from sign-up to board management,
 * testing all major features in a realistic user scenario.
 *
 * Flow:
 * 1. Sign up with Clerk
 * 2. Create new organization
 * 3. Create board
 * 4. Add columns
 * 5. Add cards
 * 6. Drag cards between columns
 * 7. Edit card
 * 8. Delete card
 * 9. Sign out
 *
 * Note: This test is marked as .skip by default because it requires:
 * - Clerk test mode or test credentials
 * - Clean test environment
 * - Proper test data setup/teardown
 */

test.describe.skip('Complete User Journey', () => {
  test('should complete full user workflow from signup to card management', async ({ page }) => {
    // Step 1: Sign up with Clerk
    await test.step('Sign up with Clerk', async () => {
      await page.goto('/sign-up')
      await page.waitForLoadState('networkidle')

      // Fill in sign-up form
      // Note: Adjust selectors based on Clerk's actual form structure
      const emailInput = page.locator('input[name="emailAddress"]').or(
        page.locator('input[type="email"]')
      )

      const passwordInput = page.locator('input[name="password"]').or(
        page.locator('input[type="password"]')
      )

      // Use test credentials from environment or generate unique ones
      const testEmail = process.env.TEST_USER_EMAIL || `test-${Date.now()}@example.com`
      const testPassword = process.env.TEST_USER_PASSWORD || 'TestPassword123!'

      await emailInput.fill(testEmail)
      await passwordInput.fill(testPassword)

      // Submit sign-up form
      const submitButton = page.locator('button[type="submit"]')
      await submitButton.click()

      // Wait for sign-up to complete (may require email verification in real scenario)
      await page.waitForTimeout(3000)

      // Should be redirected to main app or organization creation
      expect(page.url()).not.toContain('/sign-up')
    })

    // Step 2: Create new organization
    await test.step('Create new organization', async () => {
      // Clerk may prompt for organization creation after signup
      const createOrgButton = page.locator('button').filter({
        hasText: /create.*organization|new.*organization/i
      })

      // Check if we need to create an organization
      if (await createOrgButton.isVisible({ timeout: 5000 })) {
        await createOrgButton.click()

        // Fill in organization details
        const orgNameInput = page.locator('input[name="name"]').or(
          page.locator('input[placeholder*="organization"]')
        )

        await orgNameInput.fill('Test Organization E2E')

        // Submit organization creation
        const submitOrgButton = page.locator('button[type="submit"]')
        await submitOrgButton.click()

        await page.waitForTimeout(2000)
      }

      // Should now be on the main board
      await page.waitForURL('/', { timeout: 10000 })
    })

    // Step 3: Verify board is loaded
    await test.step('Verify board is loaded', async () => {
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(1000)

      // Default columns should be visible
      await expect(page.getByText('TODO', { exact: false })).toBeVisible()
      await expect(page.getByText('In Progress', { exact: false })).toBeVisible()
      await expect(page.getByText('Completed', { exact: false })).toBeVisible()
    })

    // Step 4: Add columns (if feature is available)
    await test.step('Add columns if feature is available', async () => {
      const addColumnButton = page.locator('button').filter({
        hasText: /add.*column|new.*column/i
      })

      if (await addColumnButton.isVisible({ timeout: 2000 })) {
        await addColumnButton.click()

        const columnNameInput = page.locator('input[name="columnName"]')
        await columnNameInput.fill('Review')

        const submitButton = page.locator('button[type="submit"]')
        await submitButton.click()

        await page.waitForTimeout(1000)

        // Verify new column appears
        await expect(page.getByText('Review')).toBeVisible()
      }
    })

    // Step 5: Add cards
    await test.step('Add cards to board', async () => {
      // Add card to TODO column
      const todoColumn = page.locator('text=TODO').locator('..')
      const addButton = todoColumn.locator('button').filter({ hasText: /\+|add/i }).first()

      await addButton.click()
      await page.waitForTimeout(500)

      // Fill in card details
      const titleInput = page.locator('input[name="title"]')
      const descriptionInput = page.locator('textarea[name="description"]')

      await titleInput.fill('First Test Card')
      await descriptionInput.fill('This is a test card created during E2E user flow test')

      // Submit card creation
      const submitCardButton = page.locator('button[type="submit"]')
      await submitCardButton.click()

      await page.waitForTimeout(1500)

      // Verify card appears
      await expect(page.getByText('First Test Card')).toBeVisible()

      // Add a second card
      await addButton.click()
      await page.waitForTimeout(500)

      await titleInput.fill('Second Test Card')
      await descriptionInput.fill('Another test card for drag and drop testing')

      await submitCardButton.click()
      await page.waitForTimeout(1500)

      await expect(page.getByText('Second Test Card')).toBeVisible()
    })

    // Step 6: Drag cards between columns
    await test.step('Drag card between columns', async () => {
      const todoColumn = page.locator('text=TODO').locator('..')
      const inProgressColumn = page.locator('text=In Progress').locator('..')

      // Find the first card in TODO column
      const cardToMove = page.getByText('First Test Card').locator('..')

      const cardBox = await cardToMove.boundingBox()
      const targetColumnBox = await inProgressColumn.boundingBox()

      if (cardBox && targetColumnBox) {
        // Drag card from TODO to In Progress
        await page.mouse.move(
          cardBox.x + cardBox.width / 2,
          cardBox.y + cardBox.height / 2
        )
        await page.mouse.down()
        await page.mouse.move(
          targetColumnBox.x + targetColumnBox.width / 2,
          targetColumnBox.y + 100,
          { steps: 10 }
        )
        await page.mouse.up()

        await page.waitForTimeout(1500)

        // Verify card is now in In Progress column
        const inProgressCards = inProgressColumn.getByText('First Test Card')
        await expect(inProgressCards).toBeVisible()
      }
    })

    // Step 7: Edit card
    await test.step('Edit a card', async () => {
      // Find and click on the second card to edit it
      const cardToEdit = page.getByText('Second Test Card').locator('..')

      await cardToEdit.hover()
      await page.waitForTimeout(300)

      // Look for edit button
      const editButton = cardToEdit.locator('button[aria-label*="Edit"]').or(
        cardToEdit.locator('button').filter({ hasText: /edit/i })
      )

      // If edit button is visible, click it
      if (await editButton.count() > 0) {
        await editButton.first().click()
      } else {
        // Otherwise, just click the card
        await cardToEdit.click()
      }

      await page.waitForTimeout(500)

      // Modify the card
      const titleInput = page.locator('input[name="title"]')
      await titleInput.fill('Updated Second Card')

      const descriptionInput = page.locator('textarea[name="description"]')
      await descriptionInput.fill('This card has been updated during E2E test')

      // Save changes
      const submitButton = page.locator('button[type="submit"]')
      await submitButton.click()

      await page.waitForTimeout(1500)

      // Verify changes
      await expect(page.getByText('Updated Second Card')).toBeVisible()
    })

    // Step 8: Delete card
    await test.step('Delete a card', async () => {
      // Find the card to delete
      const cardToDelete = page.getByText('Updated Second Card').locator('..')

      await cardToDelete.hover()
      await page.waitForTimeout(300)

      // Look for delete button
      const deleteButton = cardToDelete.locator('button[aria-label*="Delete"]').or(
        cardToDelete.locator('button').filter({ hasText: /delete|remove/i })
      )

      if (await deleteButton.count() > 0) {
        await deleteButton.first().click()

        await page.waitForTimeout(300)

        // Confirm deletion if there's a confirmation dialog
        const confirmButton = page.locator('button').filter({
          hasText: /confirm|delete|yes/i
        })

        if (await confirmButton.isVisible({ timeout: 2000 })) {
          await confirmButton.click()
        }

        await page.waitForTimeout(1500)

        // Verify card is deleted
        await expect(page.getByText('Updated Second Card')).not.toBeVisible()
      }
    })

    // Step 9: Sign out
    await test.step('Sign out', async () => {
      // Look for user button/menu
      const userButton = page.locator('button[data-testid="user-button"]').or(
        page.locator('[class*="cl-userButton"]')
      )

      if (await userButton.isVisible({ timeout: 3000 })) {
        await userButton.click()
        await page.waitForTimeout(500)

        // Click sign out
        const signOutButton = page.locator('button').filter({
          hasText: /sign out|log out/i
        })

        if (await signOutButton.isVisible({ timeout: 2000 })) {
          await signOutButton.click()

          await page.waitForTimeout(2000)

          // Should be redirected to sign-in page
          expect(
            page.url().includes('/sign-in') ||
            page.url().includes('clerk') ||
            page.url().includes('accounts')
          ).toBeTruthy()
        }
      }
    })
  })
})

/**
 * Simplified User Flow (for CI/CD with existing auth)
 *
 * This version assumes the user is already authenticated and focuses on
 * board operations only.
 */
test.describe('Simplified User Flow - Board Operations', () => {
  test.beforeEach(async ({ page }) => {
    // Assumes user is already authenticated
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)
  })

  test('should complete basic board workflow', async ({ page }) => {
    // Verify board loads
    await expect(page.getByText('TODO', { exact: false })).toBeVisible()

    // Add a card
    const todoColumn = page.locator('text=TODO').locator('..')
    const addButton = todoColumn.locator('button').filter({ hasText: /\+|add/i }).first()

    if (await addButton.isVisible({ timeout: 3000 })) {
      await addButton.click()
      await page.waitForTimeout(500)

      const titleInput = page.locator('input[name="title"]')
      await titleInput.fill('User Flow Test Card')

      const submitButton = page.locator('button[type="submit"]')
      await submitButton.click()

      await page.waitForTimeout(1500)

      // Verify card appears
      await expect(page.getByText('User Flow Test Card')).toBeVisible()

      // Clean up - delete the card
      const testCard = page.getByText('User Flow Test Card').locator('..')
      await testCard.hover()
      await page.waitForTimeout(300)

      const deleteButton = testCard.locator('button[aria-label*="Delete"]').first()

      if (await deleteButton.count() > 0) {
        await deleteButton.click()

        const confirmButton = page.locator('button').filter({
          hasText: /confirm|delete|yes/i
        })

        if (await confirmButton.isVisible({ timeout: 2000 })) {
          await confirmButton.click()
        }

        await page.waitForTimeout(1000)
      }
    }
  })
})
