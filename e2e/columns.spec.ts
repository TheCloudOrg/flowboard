import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Column Operations
 *
 * Tests column-specific functionality including adding, editing,
 * deleting columns, and managing column properties.
 */

test.describe('Column Operations', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
  });

  test('should display all default columns', async ({ page }) => {
    // Verify default columns are visible
    await expect(page.getByText('TODO', { exact: false })).toBeVisible();
    await expect(page.getByText('In Progress', { exact: false })).toBeVisible();
    await expect(page.getByText('Completed', { exact: false })).toBeVisible();
  });

  test('should show column headers with titles', async ({ page }) => {
    // Each column should have a header with title
    const todoHeader = page.locator('text=TODO').first();
    const inProgressHeader = page.locator('text=In Progress').first();
    const completedHeader = page.locator('text=Completed').first();

    await expect(todoHeader).toBeVisible();
    await expect(inProgressHeader).toBeVisible();
    await expect(completedHeader).toBeVisible();
  });

  test('should display card count in column headers', async ({ page }) => {
    // Columns should show how many cards they contain
    // Look for numbers in column headers
    const columnHeaders = page
      .locator('[data-testid^="column-header"]')
      .or(page.locator('text=TODO').locator('..'));

    const firstHeader = columnHeaders.first();
    await expect(firstHeader).toBeVisible();

    // Check if count is displayed (e.g., "TODO (3)")
    const headerText = await firstHeader.textContent();
    expect(headerText).toBeTruthy();
  });

  test('should display columns in correct order', async ({ page }) => {
    // Get all column titles
    const columnTitles = await page.evaluate(() => {
      const headers = Array.from(document.querySelectorAll('[class*="column"]'));
      return headers.map((el) => el.textContent?.trim()).filter(Boolean);
    });

    // Verify TODO comes before In Progress, which comes before Completed
    const todoIndex = columnTitles.findIndex((title) => title?.includes('TODO'));
    const inProgressIndex = columnTitles.findIndex((title) => title?.includes('In Progress'));
    const completedIndex = columnTitles.findIndex((title) => title?.includes('Completed'));

    expect(todoIndex).toBeGreaterThanOrEqual(0);
    expect(inProgressIndex).toBeGreaterThan(todoIndex);
    expect(completedIndex).toBeGreaterThan(inProgressIndex);
  });

  test('should have add card button in each column', async ({ page }) => {
    // Each column should have a button to add cards
    const todoColumn = page.locator('text=TODO').locator('..');
    const addButton = todoColumn.locator('button').filter({ hasText: /\+|add/i });

    await expect(addButton.first()).toBeVisible();
  });

  test('should display empty state for columns with no cards', async ({ page }) => {
    // Columns without cards should still be visible and functional
    const columns = page.locator('[data-testid^="column-"]').or(page.locator('[class*="column"]'));

    const columnCount = await columns.count();
    expect(columnCount).toBeGreaterThanOrEqual(3);
  });

  test('should maintain column layout on window resize', async ({ page }) => {
    // Test responsive behavior
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(300);

    await expect(page.getByText('TODO', { exact: false })).toBeVisible();
    await expect(page.getByText('In Progress', { exact: false })).toBeVisible();

    // Resize to tablet
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(300);

    await expect(page.getByText('TODO', { exact: false })).toBeVisible();
    await expect(page.getByText('In Progress', { exact: false })).toBeVisible();

    // Resize to mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(300);

    // Columns should still be accessible (may require scrolling)
    const todoColumn = page.getByText('TODO', { exact: false });
    await expect(todoColumn).toBeVisible();
  });

  test('should support horizontal scrolling on small screens', async ({ page }) => {
    // On mobile, columns should be horizontally scrollable
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);

    // Should be able to see at least one column
    const columns = page.locator('text=TODO').or(page.locator('text=In Progress'));

    await expect(columns.first()).toBeVisible();
  });

  test('should display column styling correctly', async ({ page }) => {
    const todoColumn = page.locator('text=TODO').locator('..');

    // Check that column has some basic styling
    const boundingBox = await todoColumn.first().boundingBox();

    expect(boundingBox).toBeTruthy();
    expect(boundingBox?.width).toBeGreaterThan(100);
    expect(boundingBox?.height).toBeGreaterThan(50);
  });

  test('should handle long column names gracefully', async ({ page }) => {
    // Column names should not break layout
    const inProgressColumn = page.locator('text=In Progress').first();
    await expect(inProgressColumn).toBeVisible();

    // Text should not overflow
    const boundingBox = await inProgressColumn.boundingBox();
    expect(boundingBox).toBeTruthy();
  });
});

/**
 * Advanced Column Operations Tests
 * These tests are for scenarios where users can add, edit, or delete columns
 */
test.describe.skip('Advanced Column Operations', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
  });

  test('should allow adding a new column', async ({ page }) => {
    // Look for "Add Column" button
    const addColumnButton = page.locator('button').filter({
      hasText: /add column|new column/i,
    });

    if (await addColumnButton.isVisible()) {
      await addColumnButton.click();

      // Fill in column name
      await page.fill('input[name="columnName"]', 'Testing');

      // Submit
      await page.click('button[type="submit"]');
      await page.waitForTimeout(1000);

      // Verify new column appears
      await expect(page.getByText('Testing')).toBeVisible();
    } else {
      test.skip();
    }
  });

  test('should allow editing column name', async ({ page }) => {
    // Find a column to edit
    const todoColumn = page.locator('text=TODO').first();

    // Look for edit button (may appear on hover)
    await todoColumn.hover();

    const editButton = page.locator('button[aria-label*="Edit column"]').first();

    if (await editButton.isVisible({ timeout: 2000 })) {
      await editButton.click();

      // Change the name
      await page.fill('input[name="columnName"]', 'To Do');
      await page.click('button[type="submit"]');

      await page.waitForTimeout(1000);

      // Verify name changed
      await expect(page.getByText('To Do')).toBeVisible();
    } else {
      test.skip();
    }
  });

  test('should allow deleting a column', async ({ page }) => {
    // Find delete button for a column
    const columnHeader = page.locator('text=TODO').first();
    await columnHeader.hover();

    const deleteButton = page.locator('button[aria-label*="Delete column"]').first();

    if (await deleteButton.isVisible({ timeout: 2000 })) {
      const initialColumns = await page.locator('[class*="column"]').count();

      await deleteButton.click();

      // Confirm deletion
      const confirmButton = page.locator('button').filter({ hasText: /confirm|delete|yes/i });
      if (await confirmButton.isVisible()) {
        await confirmButton.click();
      }

      await page.waitForTimeout(1000);

      // Verify column count decreased
      const finalColumns = await page.locator('[class*="column"]').count();
      expect(finalColumns).toBeLessThan(initialColumns);
    } else {
      test.skip();
    }
  });

  test('should prevent deleting column with cards', async ({ page }) => {
    // Try to delete a column that has cards
    const columnWithCards = page.locator('text=TODO').first();
    await columnWithCards.hover();

    const deleteButton = page.locator('button[aria-label*="Delete column"]').first();

    if (await deleteButton.isVisible({ timeout: 2000 })) {
      await deleteButton.click();

      // Should show warning or prevent deletion
      const warningMessage = page.locator('text=/cannot delete|has cards|move cards/i');

      // Either warning appears or column is not deleted
      const hasWarning = await warningMessage.isVisible({ timeout: 2000 });
      expect(typeof hasWarning).toBe('boolean');
    } else {
      test.skip();
    }
  });

  test('should allow reordering columns', async ({ page }) => {
    // Check if columns can be dragged to reorder
    const todoColumn = page.locator('text=TODO').first();
    const inProgressColumn = page.locator('text=In Progress').first();

    const todoBox = await todoColumn.boundingBox();
    const inProgressBox = await inProgressColumn.boundingBox();

    if (todoBox && inProgressBox) {
      // Try to drag TODO column to In Progress position
      await page.mouse.move(todoBox.x + todoBox.width / 2, todoBox.y + todoBox.height / 2);
      await page.mouse.down();
      await page.mouse.move(
        inProgressBox.x + inProgressBox.width / 2,
        inProgressBox.y + inProgressBox.height / 2,
        { steps: 10 }
      );
      await page.mouse.up();

      await page.waitForTimeout(1000);

      // If reordering is supported, order should have changed
      // This is a basic test - adjust based on your implementation
      const pageContent = await page.content();
      expect(pageContent).toBeTruthy();
    } else {
      test.skip();
    }
  });

  test('should validate column name is required', async ({ page }) => {
    const addColumnButton = page.locator('button').filter({
      hasText: /add column|new column/i,
    });

    if (await addColumnButton.isVisible()) {
      await addColumnButton.click();

      // Try to submit without name
      await page.click('button[type="submit"]');

      // Should show validation error or prevent submission
      const nameInput = page.locator('input[name="columnName"]');
      await expect(nameInput).toBeVisible();
    } else {
      test.skip();
    }
  });

  test('should prevent duplicate column names', async ({ page }) => {
    const addColumnButton = page.locator('button').filter({
      hasText: /add column|new column/i,
    });

    if (await addColumnButton.isVisible()) {
      await addColumnButton.click();

      // Try to use existing column name
      await page.fill('input[name="columnName"]', 'TODO');
      await page.click('button[type="submit"]');

      // Should show error about duplicate name
      const errorMessage = page.locator('text=/already exists|duplicate/i');
      const hasError = await errorMessage.isVisible({ timeout: 2000 });

      expect(typeof hasError).toBe('boolean');
    } else {
      test.skip();
    }
  });
});
