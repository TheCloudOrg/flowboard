# Testing Quick Reference

Quick commands and common patterns for the Flow Board testing suite.

## Quick Start

```bash
# Install dependencies (if not already installed)
npm install

# Install Playwright browsers (first time only)
npx playwright install

# Run all tests
npm test                    # Unit tests
npm run test:e2e           # E2E tests
```

## Common Commands

### Unit Tests (Jest)

```bash
npm test                         # Run all tests
npm run test:watch              # Watch mode
npm run test:coverage           # With coverage report

# Run specific test file
npm test ThemeContext

# Run tests matching pattern
npm test -- --testNamePattern="toggle"

# Update snapshots
npm test -- -u
```

### E2E Tests (Playwright)

```bash
npm run test:e2e                # Run all E2E tests
npm run test:e2e:ui             # Interactive UI mode
npm run test:e2e:debug          # Debug mode

# Run specific test file
npx playwright test e2e/theme-toggle.spec.ts

# Run specific browser
npx playwright test --project=chromium

# Show report
npx playwright show-report
```

## Quick Test Patterns

### Component Test Template

```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import MyComponent from '../MyComponent'

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />)
    expect(screen.getByText('Expected Text')).toBeInTheDocument()
  })

  it('handles click events', () => {
    const mockHandler = jest.fn()
    render(<MyComponent onClick={mockHandler} />)

    fireEvent.click(screen.getByRole('button'))
    expect(mockHandler).toHaveBeenCalled()
  })
})
```

### E2E Test Template

```typescript
import { test, expect } from '@playwright/test'

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should do something', async ({ page }) => {
    await page.click('text=Button')
    await expect(page.locator('text=Success')).toBeVisible()
  })
})
```

### Async Test Pattern

```typescript
test('async operation', async () => {
  const result = await asyncFunction()

  await waitFor(() => {
    expect(result).toBeDefined()
  })
})
```

### Mock Pattern

```typescript
// Mock module
jest.mock('@/lib/api')

// Mock function
const mockFn = jest.fn()
mockFn.mockResolvedValue({ data: 'test' })
mockFn.mockRejectedValue(new Error('Failed'))

// Reset mocks
beforeEach(() => {
  jest.clearAllMocks()
})
```

## Common Selectors

### Testing Library

```typescript
// By role (preferred)
screen.getByRole('button', { name: 'Submit' })

// By text
screen.getByText('Hello World')
screen.getByText(/hello/i)  // Case insensitive

// By label
screen.getByLabelText('Email')

// By test ID
screen.getByTestId('custom-element')

// By placeholder
screen.getByPlaceholderText('Enter email')
```

### Playwright

```typescript
// By text
page.locator('text=Submit')
page.getByText('Submit')

// By role
page.getByRole('button', { name: 'Submit' })

// By test ID
page.getByTestId('submit-button')

// By CSS
page.locator('.my-class')
page.locator('#my-id')

// Chaining
page.locator('form').locator('button')
```

## Assertions

### Jest/Testing Library

```typescript
expect(value).toBe(expected)
expect(value).toEqual(expected)
expect(value).toBeTruthy()
expect(value).toBeNull()
expect(value).toBeUndefined()
expect(array).toContain(item)
expect(array).toHaveLength(3)
expect(fn).toHaveBeenCalled()
expect(fn).toHaveBeenCalledWith(arg)
expect(element).toBeInTheDocument()
expect(element).toBeVisible()
expect(element).toHaveClass('my-class')
expect(element).toHaveAttribute('href', '/path')
```

### Playwright

```typescript
await expect(page).toHaveURL(/dashboard/)
await expect(page).toHaveTitle('Dashboard')
await expect(locator).toBeVisible()
await expect(locator).toBeHidden()
await expect(locator).toHaveText('Expected')
await expect(locator).toContainText('Partial')
await expect(locator).toHaveClass(/active/)
await expect(locator).toHaveAttribute('disabled')
await expect(locator).toHaveCount(5)
```

## User Interactions

### Testing Library

```typescript
import { fireEvent, userEvent } from '@testing-library/react'

// Click
fireEvent.click(button)

// Type (userEvent is preferred for realistic input)
await userEvent.type(input, 'Hello')

// Clear and type
await userEvent.clear(input)
await userEvent.type(input, 'New value')

// Select
await userEvent.selectOptions(select, 'option1')

// Keyboard
await userEvent.keyboard('{Enter}')
await userEvent.keyboard('{Escape}')
```

### Playwright

```typescript
// Click
await page.click('text=Submit')
await page.getByRole('button').click()

// Type
await page.fill('input[name="email"]', 'user@example.com')
await page.type('input[name="email"]', 'user@example.com')

// Press key
await page.press('input', 'Enter')
await page.keyboard.press('Escape')

// Hover
await page.hover('button')

// Drag and drop
await page.dragAndDrop('#source', '#target')
```

## Waiting & Timeouts

### Testing Library

```typescript
import { waitFor, waitForElementToBeRemoved } from '@testing-library/react'

// Wait for element
await waitFor(() => {
  expect(screen.getByText('Loaded')).toBeInTheDocument()
})

// Wait for element to be removed
await waitForElementToBeRemoved(() => screen.getByText('Loading...'))

// With timeout
await waitFor(() => {
  expect(screen.getByText('Done')).toBeInTheDocument()
}, { timeout: 5000 })
```

### Playwright

```typescript
// Wait for element
await page.waitForSelector('text=Success')

// Wait for navigation
await page.waitForURL('/dashboard')

// Wait for network
await page.waitForResponse(resp => resp.url().includes('/api/'))

// Wait for state
await page.waitForLoadState('networkidle')

// Custom timeout
await page.waitForSelector('text=Success', { timeout: 10000 })
```

## Coverage Commands

```bash
# Generate coverage
npm run test:coverage

# View HTML report
open coverage/lcov-report/index.html

# Coverage for specific file
npm test -- --coverage --collectCoverageFrom="components/Card.tsx"
```

## Debugging

### Jest

```bash
# Debug specific test
node --inspect-brk node_modules/.bin/jest --runInBand MyTest

# Add breakpoint in test
test('my test', () => {
  debugger;  // Execution will pause here
})

# Console log
console.log(container.innerHTML)
screen.debug()  // Pretty print DOM
```

### Playwright

```bash
# Debug mode
npm run test:e2e:debug

# Headed mode (see browser)
npx playwright test --headed

# Slow motion
npx playwright test --headed --slow-mo=1000

# Pause in test
await page.pause()
```

## CI/CD Quick Checks

```bash
# Run what CI runs
npm test -- --coverage --maxWorkers=2
npm run test:e2e
npm run lint
npx tsc --noEmit
npm run build
```

## Troubleshooting

### Reset Everything

```bash
# Clear Jest cache
npx jest --clearCache

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Reinstall Playwright
npx playwright install --force
```

### Common Fixes

```bash
# Fix: "Cannot find module"
npm install

# Fix: "Playwright browsers not found"
npx playwright install

# Fix: "Port already in use"
lsof -ti:3000 | xargs kill -9

# Fix: Stale snapshots
npm test -- -u
```

## Resources

- [Full Testing Guide](./TESTING.md)
- [Jest Docs](https://jestjs.io/)
- [Testing Library](https://testing-library.com/)
- [Playwright](https://playwright.dev/)

---

**Pro Tips:**

1. Use `.only` to run single test: `test.only('my test', ...)`
2. Use `.skip` to skip test: `test.skip('broken test', ...)`
3. Run tests before committing: `npm test && npm run test:e2e`
4. Keep tests fast: mock external dependencies
5. Test user behavior, not implementation details
