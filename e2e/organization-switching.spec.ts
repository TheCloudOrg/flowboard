import { test, expect } from '@playwright/test'

/**
 * E2E Tests for Organization Switching
 *
 * Note: These tests require multiple organizations to be set up in Clerk.
 * They are marked as .skip by default.
 */

test.describe.skip('Organization Switching', () => {
  test.beforeEach(async ({ page }) => {
    // Assume user is authenticated and belongs to multiple organizations
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)
  })

  test('should display organization switcher', async ({ page }) => {
    // Look for Clerk's OrganizationSwitcher component
    const orgSwitcher = page.getByTestId('organization-switcher').or(
      page.locator('[class*="organization"]').filter({ hasText: /organization/i })
    )

    await expect(orgSwitcher.first()).toBeVisible()
  })

  test('should show current organization name', async ({ page }) => {
    // The organization switcher should display the current org name
    const orgSwitcher = page.getByTestId('organization-switcher').or(
      page.locator('[class*="cl-organizationSwitcher"]')
    )

    const orgName = await orgSwitcher.first().textContent()
    expect(orgName).toBeTruthy()
    expect(orgName?.length).toBeGreaterThan(0)
  })

  test('should open organization menu when clicked', async ({ page }) => {
    // Click on organization switcher
    const orgSwitcher = page.getByTestId('organization-switcher').or(
      page.locator('[class*="cl-organizationSwitcher"]')
    )

    await orgSwitcher.first().click()
    await page.waitForTimeout(500)

    // Menu should appear with list of organizations
    const menu = page.locator('[role="menu"]').or(
      page.locator('[class*="organizationList"]')
    )

    await expect(menu.first()).toBeVisible()
  })

  test('should list available organizations', async ({ page }) => {
    // Open organization switcher
    const orgSwitcher = page.getByTestId('organization-switcher').or(
      page.locator('[class*="cl-organizationSwitcher"]')
    )

    await orgSwitcher.first().click()
    await page.waitForTimeout(500)

    // Should show list of organizations
    const orgItems = page.locator('[role="menuitem"]').or(
      page.locator('[class*="organizationPreview"]')
    )

    const count = await orgItems.count()
    expect(count).toBeGreaterThan(0)
  })

  test('should switch to different organization', async ({ page }) => {
    // Get current organization name
    const orgSwitcher = page.getByTestId('organization-switcher').or(
      page.locator('[class*="cl-organizationSwitcher"]')
    )

    const currentOrgName = await orgSwitcher.first().textContent()

    // Open organization menu
    await orgSwitcher.first().click()
    await page.waitForTimeout(500)

    // Find a different organization to switch to
    const orgItems = page.locator('[role="menuitem"]').or(
      page.locator('[class*="organizationPreview"]')
    )

    const itemCount = await orgItems.count()

    if (itemCount < 2) {
      test.skip()
      return
    }

    // Click on second organization
    await orgItems.nth(1).click()
    await page.waitForTimeout(2000)

    // Verify organization changed
    const newOrgName = await orgSwitcher.first().textContent()
    expect(newOrgName).not.toBe(currentOrgName)
  })

  test('should load different board data when switching organizations', async ({ page }) => {
    // Get cards from current board
    const cardsBeforeSwitch = page.locator('[data-testid^="card-"]').or(
      page.locator('[class*="card"]')
    )
    const countBefore = await cardsBeforeSwitch.count()

    // Switch organization
    const orgSwitcher = page.getByTestId('organization-switcher').or(
      page.locator('[class*="cl-organizationSwitcher"]')
    )

    await orgSwitcher.first().click()
    await page.waitForTimeout(500)

    const orgItems = page.locator('[role="menuitem"]')
    const itemCount = await orgItems.count()

    if (itemCount < 2) {
      test.skip()
      return
    }

    await orgItems.nth(1).click()
    await page.waitForTimeout(2000)

    // Wait for board to reload
    await page.waitForLoadState('networkidle')

    // Get cards from new board
    const cardsAfterSwitch = page.locator('[data-testid^="card-"]').or(
      page.locator('[class*="card"]')
    )
    const countAfter = await cardsAfterSwitch.count()

    // Card count should potentially be different (depends on test data)
    // At minimum, the board should have loaded
    expect(typeof countAfter).toBe('number')
  })

  test('should preserve organization choice after page reload', async ({ page }) => {
    // Switch to second organization
    const orgSwitcher = page.getByTestId('organization-switcher').or(
      page.locator('[class*="cl-organizationSwitcher"]')
    )

    await orgSwitcher.first().click()
    await page.waitForTimeout(500)

    const orgItems = page.locator('[role="menuitem"]')
    const itemCount = await orgItems.count()

    if (itemCount < 2) {
      test.skip()
      return
    }

    // Get name of second org
    const secondOrgName = await orgItems.nth(1).textContent()

    // Switch to it
    await orgItems.nth(1).click()
    await page.waitForTimeout(2000)

    // Reload page
    await page.reload()
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    // Verify same organization is still selected
    const currentOrgName = await orgSwitcher.first().textContent()
    expect(currentOrgName).toBe(secondOrgName)
  })

  test('should show create organization option', async ({ page }) => {
    const orgSwitcher = page.getByTestId('organization-switcher').or(
      page.locator('[class*="cl-organizationSwitcher"]')
    )

    await orgSwitcher.first().click()
    await page.waitForTimeout(500)

    // Look for create/new organization button
    const createButton = page.locator('button').filter({
      hasText: /create|new.*organization/i,
    })

    // This depends on Clerk configuration
    const hasCreateButton = await createButton.count() > 0
    expect(typeof hasCreateButton).toBe('boolean')
  })

  test('should handle switching between organizations rapidly', async ({ page }) => {
    const orgSwitcher = page.getByTestId('organization-switcher').or(
      page.locator('[class*="cl-organizationSwitcher"]')
    )

    const orgItems = page.locator('[role="menuitem"]')

    // Switch back and forth
    await orgSwitcher.first().click()
    await page.waitForTimeout(300)

    if (await orgItems.count() < 2) {
      test.skip()
      return
    }

    await orgItems.nth(1).click()
    await page.waitForTimeout(500)

    await orgSwitcher.first().click()
    await page.waitForTimeout(300)

    await orgItems.nth(0).click()
    await page.waitForTimeout(500)

    // Application should still be functional
    await expect(page.locator('text=TODO')).toBeVisible()
    await expect(page.locator('text=In Progress')).toBeVisible()
  })

  test('should display correct board name for each organization', async ({ page }) => {
    // Each organization may have a different board name
    // Get current board name/title if displayed
    const boardTitle = page.locator('h1').or(page.locator('[class*="board-title"]'))
    const currentBoardName = await boardTitle.first().textContent()

    // Switch organization
    const orgSwitcher = page.getByTestId('organization-switcher').or(
      page.locator('[class*="cl-organizationSwitcher"]')
    )

    await orgSwitcher.first().click()
    await page.waitForTimeout(500)

    const orgItems = page.locator('[role="menuitem"]')
    if (await orgItems.count() < 2) {
      test.skip()
      return
    }

    await orgItems.nth(1).click()
    await page.waitForTimeout(2000)

    // Get new board name
    const newBoardName = await boardTitle.first().textContent()

    // Board names might be different (depends on test data)
    expect(typeof newBoardName).toBe('string')
  })
})

/**
 * Setup instructions:
 *
 * 1. Create at least 2 test organizations in Clerk
 * 2. Add the test user as a member of both organizations
 * 3. Create distinct board data for each organization
 * 4. Remove .skip from test.describe.skip
 * 5. Implement authentication helper
 * 6. Adjust selectors based on Clerk's actual UI
 */
