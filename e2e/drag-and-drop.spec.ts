import { test, expect } from '@playwright/test'

/**
 * E2E Tests for Drag-and-Drop Functionality
 *
 * Note: These tests require authentication and test data setup.
 * They are marked as .skip by default.
 */

test.describe.skip('Drag and Drop', () => {
  test.beforeEach(async ({ page }) => {
    // Assume user is authenticated and board has test data
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Wait for board to load
    await page.waitForSelector('text=TODO')
    await page.waitForTimeout(1000)
  })

  test('should drag card within same column', async ({ page }) => {
    // Get all cards in TODO column
    const todoColumn = page.locator('text=TODO').locator('..')
    const cards = todoColumn.locator('[data-testid^="card-"]').or(
      todoColumn.locator('[class*="card"]')
    )

    const cardCount = await cards.count()

    if (cardCount < 2) {
      test.skip()
      return
    }

    const firstCard = cards.nth(0)
    const firstCardText = await firstCard.textContent()

    // Get bounding box for drag operation
    const firstCardBox = await firstCard.boundingBox()
    const secondCardBox = await cards.nth(1).boundingBox()

    if (!firstCardBox || !secondCardBox) {
      throw new Error('Could not get card positions')
    }

    // Drag first card to second position
    await page.mouse.move(
      firstCardBox.x + firstCardBox.width / 2,
      firstCardBox.y + firstCardBox.height / 2
    )
    await page.mouse.down()
    await page.mouse.move(
      secondCardBox.x + secondCardBox.width / 2,
      secondCardBox.y + secondCardBox.height / 2 + 50,
      { steps: 10 }
    )
    await page.mouse.up()

    // Wait for drag operation to complete
    await page.waitForTimeout(1000)

    // Verify card moved
    const cardsAfterDrag = await todoColumn.locator('[data-testid^="card-"]').or(
      todoColumn.locator('[class*="card"]')
    )
    const secondCardText = await cardsAfterDrag.nth(1).textContent()

    expect(secondCardText).toContain(firstCardText || '')
  })

  test('should drag card to different column', async ({ page }) => {
    const todoColumn = page.locator('text=TODO').locator('..')
    const inProgressColumn = page.locator('text=In Progress').locator('..')

    const todoCards = todoColumn.locator('[data-testid^="card-"]').or(
      todoColumn.locator('[class*="card"]')
    )

    if (await todoCards.count() === 0) {
      test.skip()
      return
    }

    const cardToMove = todoCards.first()
    const cardText = await cardToMove.textContent()

    // Get positions
    const cardBox = await cardToMove.boundingBox()
    const targetColumnBox = await inProgressColumn.boundingBox()

    if (!cardBox || !targetColumnBox) {
      throw new Error('Could not get positions')
    }

    // Drag card to In Progress column
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
    const inProgressCards = inProgressColumn.locator('[data-testid^="card-"]').or(
      inProgressColumn.locator('[class*="card"]')
    )

    const movedCardExists = await inProgressCards.locator(`text=${cardText?.trim().substring(0, 20)}`).isVisible()
    expect(movedCardExists).toBeTruthy()
  })

  test('should show drag handle on hover', async ({ page }) => {
    const cards = page.locator('[data-testid^="card-"]').or(
      page.locator('[class*="card"]')
    )

    if (await cards.count() === 0) {
      test.skip()
      return
    }

    const firstCard = cards.first()

    // Hover over card
    await firstCard.hover()

    await page.waitForTimeout(300)

    // Drag handle should be visible (look for grip icon or similar)
    const dragHandle = firstCard.locator('[class*="grip"]').or(
      firstCard.locator('svg').filter({ hasText: /grip/i })
    )

    // Note: This test assumes drag handle has opacity transition
    // Adjust based on your implementation
    const isVisible = await dragHandle.isVisible()
    expect(isVisible).toBeTruthy()
  })

  test('should update card position after drag', async ({ page }) => {
    const todoColumn = page.locator('text=TODO').locator('..')
    const cards = todoColumn.locator('[data-testid^="card-"]').or(
      todoColumn.locator('[class*="card"]')
    )

    if (await cards.count() < 2) {
      test.skip()
      return
    }

    // Get initial order
    const initialFirstCard = await cards.nth(0).textContent()
    const initialSecondCard = await cards.nth(1).textContent()

    // Perform drag operation
    const firstCardBox = await cards.nth(0).boundingBox()
    const secondCardBox = await cards.nth(1).boundingBox()

    if (!firstCardBox || !secondCardBox) {
      throw new Error('Could not get card positions')
    }

    await page.mouse.move(
      firstCardBox.x + firstCardBox.width / 2,
      firstCardBox.y + firstCardBox.height / 2
    )
    await page.mouse.down()
    await page.mouse.move(
      secondCardBox.x + secondCardBox.width / 2,
      secondCardBox.y + secondCardBox.height + 10,
      { steps: 10 }
    )
    await page.mouse.up()

    await page.waitForTimeout(1000)

    // Reload page to verify persistence
    await page.reload()
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    // Check that order persisted
    const cardsAfterReload = todoColumn.locator('[data-testid^="card-"]').or(
      todoColumn.locator('[class*="card"]')
    )

    const newSecondCard = await cardsAfterReload.nth(1).textContent()

    // Second card should now be the original first card
    expect(newSecondCard).toContain(initialFirstCard || '')
  })

  test('should handle drag cancellation (ESC key)', async ({ page }) => {
    const cards = page.locator('[data-testid^="card-"]').or(
      page.locator('[class*="card"]')
    )

    if (await cards.count() === 0) {
      test.skip()
      return
    }

    const cardToMove = cards.first()
    const cardBox = await cardToMove.boundingBox()

    if (!cardBox) {
      throw new Error('Could not get card position')
    }

    // Start drag
    await page.mouse.move(
      cardBox.x + cardBox.width / 2,
      cardBox.y + cardBox.height / 2
    )
    await page.mouse.down()
    await page.mouse.move(
      cardBox.x + cardBox.width / 2,
      cardBox.y + cardBox.height / 2 + 100,
      { steps: 5 }
    )

    // Cancel with ESC
    await page.keyboard.press('Escape')
    await page.mouse.up()

    await page.waitForTimeout(500)

    // Card should return to original position
    // This is a simple check - adjust based on your implementation
    const isStillVisible = await cardToMove.isVisible()
    expect(isStillVisible).toBeTruthy()
  })

  test('should provide visual feedback during drag', async ({ page }) => {
    const cards = page.locator('[data-testid^="card-"]').or(
      page.locator('[class*="card"]')
    )

    if (await cards.count() === 0) {
      test.skip()
      return
    }

    const cardToMove = cards.first()
    const cardBox = await cardToMove.boundingBox()

    if (!cardBox) {
      throw new Error('Could not get card position')
    }

    // Start drag
    await page.mouse.move(
      cardBox.x + cardBox.width / 2,
      cardBox.y + cardBox.height / 2
    )
    await page.mouse.down()

    await page.waitForTimeout(100)

    // Card should have reduced opacity or other visual feedback
    const opacity = await cardToMove.evaluate((el) => {
      return window.getComputedStyle(el).opacity
    })

    // During drag, opacity should be reduced (e.g., 0.5)
    expect(parseFloat(opacity)).toBeLessThan(1)

    await page.mouse.up()
  })
})

/**
 * Setup instructions:
 *
 * 1. Remove .skip from test.describe.skip
 * 2. Implement authentication helper
 * 3. Ensure test board has sufficient cards (at least 2-3 per column)
 * 4. Adjust selectors to match your component structure
 * 5. Test data should be predictable and isolated
 */
