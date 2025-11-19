# Testing Guide - Flow Board

This document provides comprehensive information about the testing suite for the Flow Board application.

## Table of Contents

- [Overview](#overview)
- [Test Infrastructure](#test-infrastructure)
- [Running Tests](#running-tests)
- [Unit & Integration Tests](#unit--integration-tests)
- [E2E Tests](#e2e-tests)
- [Test Coverage](#test-coverage)
- [CI/CD Integration](#cicd-integration)
- [Writing New Tests](#writing-new-tests)
- [Troubleshooting](#troubleshooting)

## Overview

The Flow Board application uses a comprehensive testing strategy that includes:

- **Unit Tests**: Test individual components and functions in isolation
- **Integration Tests**: Test how different parts of the application work together
- **E2E Tests**: Test complete user workflows in a real browser environment

### Testing Stack

- **Jest**: Unit and integration testing framework
- **React Testing Library**: Component testing utilities
- **Playwright**: E2E testing framework
- **TypeScript**: Type-safe tests

## Test Infrastructure

### Directory Structure

```
projectManagementApp/
├── __mocks__/                      # Mock implementations for external dependencies
│   ├── @clerk/nextjs.tsx          # Clerk authentication mocks
│   ├── @supabase/ssr.ts           # Supabase mocks
│   ├── @dnd-kit/core.tsx          # Drag-and-drop mocks
│   └── @dnd-kit/sortable.tsx      # Sortable mocks
├── __tests__/
│   └── utils/                     # Test utilities and helpers
│       ├── test-utils.tsx         # Custom render functions
│       └── mock-data.ts           # Mock data generators
├── app/
│   └── actions/__tests__/         # Server action tests
├── components/__tests__/          # Component tests
├── contexts/__tests__/            # Context tests
├── lib/
│   └── supabase/__tests__/        # Database function tests
├── e2e/                           # End-to-end tests
│   ├── auth.spec.ts
│   ├── card-operations.spec.ts
│   ├── drag-and-drop.spec.ts
│   ├── organization-switching.spec.ts
│   └── theme-toggle.spec.ts
├── jest.config.ts                 # Jest configuration
├── jest.setup.ts                  # Jest setup file
└── playwright.config.ts           # Playwright configuration
```

### Configuration Files

#### jest.config.ts

Configures Jest for Next.js with:

- JSdom test environment for browser APIs
- TypeScript support
- Module path mapping
- Coverage collection and thresholds

#### jest.setup.ts

Sets up:

- Testing Library matchers
- Environment variable mocks
- Browser API mocks (matchMedia, IntersectionObserver, localStorage)

#### playwright.config.ts

Configures Playwright with:

- Multiple browser targets (Chromium, Firefox, WebKit)
- Mobile viewport testing
- Local development server integration
- Screenshot and video capture on failure

## Running Tests

### Unit & Integration Tests

```bash
# Run all Jest tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### E2E Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui

# Run E2E tests in debug mode
npm run test:e2e:debug
```

### Run All Tests

```bash
# Run both unit and E2E tests
npm test && npm run test:e2e
```

## Unit & Integration Tests

### Component Tests

Located in `components/__tests__/`, these tests verify:

- Component rendering
- User interactions
- Props handling
- Conditional rendering
- Event handlers

**Example: Card Component Test**

```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import Card from '../Card'

test('calls onDelete when delete button is clicked', () => {
  const mockOnDelete = jest.fn()

  render(
    <Card
      card={mockCard}
      onDelete={mockOnDelete}
      // ... other props
    />
  )

  const deleteButton = screen.getByLabelText('Delete')
  fireEvent.click(deleteButton)

  expect(mockOnDelete).toHaveBeenCalledWith(mockCard.id)
})
```

### Context Tests

Located in `contexts/__tests__/`, these tests verify:

- Context provider functionality
- Hook behavior
- State management
- Side effects

**Example: ThemeContext Test**

```typescript
import { renderHook, act } from '@testing-library/react';
import { ThemeProvider, useTheme } from '../ThemeContext';

test('toggles theme from dark to light', async () => {
  const { result } = renderHook(() => useTheme(), {
    wrapper: ThemeProvider,
  });

  act(() => {
    result.current.toggleTheme();
  });

  await waitFor(() => {
    expect(result.current.theme).toBe('light');
  });
});
```

### Server Action Tests

Located in `lib/supabase/__tests__/`, these tests verify:

- Database operations
- Data transformation
- Error handling
- Edge cases

**Example: Board Actions Test**

```typescript
import { getBoard } from '../boards';

test('retrieves board with columns and cards', async () => {
  // Setup mock data
  mockSupabaseClient.from.mockImplementation(/* ... */);

  const result = await getBoard('org_1');

  expect(result).not.toBeNull();
  expect(result?.columns).toHaveLength(2);
});
```

### Test Utilities

#### Custom Render Function

Use `render` from `__tests__/utils/test-utils.tsx` for components that need providers:

```typescript
import { render, screen } from '@/__tests__/utils/test-utils'

test('renders with theme provider', () => {
  render(<MyComponent />, { initialTheme: 'dark' })
  // Component has access to ThemeContext
})
```

#### Mock Data Generators

Use helpers from `__tests__/utils/mock-data.ts`:

```typescript
import { createMockCard, mockBoard } from '@/__tests__/utils/mock-data';

const testCard = createMockCard({
  title: 'Custom Title',
  position: 5,
});
```

## E2E Tests

### Authentication Tests (`e2e/auth.spec.ts`)

Tests user authentication flows:

- Sign-in page display
- Sign-up page display
- Authentication redirects
- Sign-out functionality

**Note**: Most auth tests are skipped by default and require test credentials to run.

### Theme Toggle Tests (`e2e/theme-toggle.spec.ts`)

Tests dark/light mode functionality:

- Theme toggle button presence
- Theme switching
- Theme persistence
- Style application

**Example:**

```typescript
test('should toggle between light and dark mode', async ({ page }) => {
  await page.goto('/landing');

  const htmlElement = page.locator('html');
  const initialClass = await htmlElement.getAttribute('class');

  const themeButton = page.locator('button[aria-label*="mode"]').first();
  await themeButton.click();

  const newClass = await htmlElement.getAttribute('class');
  expect(newClass).not.toBe(initialClass);
});
```

### Card Operations Tests (`e2e/card-operations.spec.ts`)

Tests CRUD operations for cards:

- Creating new cards
- Editing existing cards
- Deleting cards
- Form validation

**Note**: These tests require authentication setup and are skipped by default.

### Drag-and-Drop Tests (`e2e/drag-and-drop.spec.ts`)

Tests drag-and-drop functionality:

- Dragging within same column
- Dragging to different columns
- Position persistence
- Visual feedback

### Organization Switching Tests (`e2e/organization-switching.spec.ts`)

Tests multi-organization support:

- Organization switcher display
- Switching between organizations
- Board data loading per organization
- Organization preference persistence

## Test Coverage

### Coverage Reports

After running `npm run test:coverage`, view the coverage report:

```bash
# Open HTML coverage report
open coverage/lcov-report/index.html
```

### Coverage Thresholds

The project maintains the following coverage thresholds:

- **Branches**: 70%
- **Functions**: 70%
- **Lines**: 70%
- **Statements**: 70%

### Improving Coverage

To identify untested code:

1. Run coverage report
2. Open `coverage/lcov-report/index.html`
3. Click on files with low coverage
4. Red lines indicate untested code
5. Write tests for critical untested paths

## CI/CD Integration

### GitHub Actions Workflow

The `.github/workflows/test.yml` workflow runs on:

- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches

### Workflow Jobs

1. **Unit Tests**: Runs Jest with coverage
2. **E2E Tests**: Runs Playwright tests
3. **Type Check**: Runs TypeScript compiler
4. **Lint**: Runs ESLint
5. **Build**: Verifies production build
6. **Test Summary**: Aggregates all results

### Required Secrets

Configure these secrets in your GitHub repository:

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: Clerk public key
- `CLERK_SECRET_KEY`: Clerk secret key
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key
- `OPENAI_API_KEY`: OpenAI API key (for AI features)
- `CODECOV_TOKEN`: (Optional) For coverage reporting

### Setting Up Secrets

```bash
# In your GitHub repository
Settings → Secrets and variables → Actions → New repository secret
```

## Writing New Tests

### Unit Test Guidelines

1. **Test behavior, not implementation**

   ```typescript
   // Good: Tests behavior
   expect(screen.getByText('Card Title')).toBeVisible();

   // Avoid: Tests implementation details
   expect(component.state.title).toBe('Card Title');
   ```

2. **Use descriptive test names**

   ```typescript
   test('calls onEdit when edit button is clicked');
   test('displays validation error for empty title');
   ```

3. **Arrange-Act-Assert pattern**

   ```typescript
   test('example test', () => {
     // Arrange: Set up test data
     const mockData = createMockCard();

     // Act: Perform the action
     const result = processCard(mockData);

     // Assert: Verify the result
     expect(result).toBe(expected);
   });
   ```

4. **Mock external dependencies**
   ```typescript
   jest.mock('@/lib/supabase/client');
   ```

### E2E Test Guidelines

1. **Test user workflows, not implementation**
   - Focus on what users do, not how the code works

2. **Use data-testid for stable selectors**

   ```typescript
   <div data-testid="card-123">
   page.getByTestId('card-123')
   ```

3. **Wait for elements properly**

   ```typescript
   await page.waitForSelector('text=Card Title');
   await expect(page.locator('text=Success')).toBeVisible();
   ```

4. **Clean up test data**
   ```typescript
   test.afterEach(async () => {
     // Delete test cards, reset state, etc.
   });
   ```

### Testing Checklist

When adding a new feature, ensure:

- [ ] Unit tests for new functions/utilities
- [ ] Component tests for new UI components
- [ ] Integration tests for new workflows
- [ ] E2E tests for critical user paths
- [ ] All tests pass locally
- [ ] Coverage thresholds are met
- [ ] Tests are documented

## Troubleshooting

### Common Issues

#### Jest: "Cannot find module '@/...'"

**Solution**: Check `jest.config.ts` has correct `moduleNameMapper` entries.

#### Jest: "localStorage is not defined"

**Solution**: Ensure `jest.setup.ts` includes localStorage mock.

#### Playwright: Tests timeout

**Solutions**:

- Increase timeout in `playwright.config.ts`
- Check if dev server is running
- Verify network conditions

#### Playwright: "Element not found"

**Solutions**:

- Add `await page.waitForSelector()`
- Increase wait times
- Check if element actually exists in UI
- Use more specific selectors

#### CI: Tests pass locally but fail in CI

**Solutions**:

- Check environment variables
- Verify secrets are configured
- Ensure consistent Node.js version
- Check for timing issues (add waits)

### Debug Mode

#### Jest Debug

```bash
# Run single test file in debug mode
node --inspect-brk node_modules/.bin/jest --runInBand path/to/test
```

Then open `chrome://inspect` in Chrome.

#### Playwright Debug

```bash
# Run in debug mode with inspector
npm run test:e2e:debug

# Run specific test
npx playwright test e2e/auth.spec.ts --debug
```

### Getting Help

- Check existing issues in the repository
- Review test output carefully
- Use `console.log()` for debugging
- Run tests in isolation to identify conflicts
- Consult documentation:
  - [Jest Docs](https://jestjs.io/docs/getting-started)
  - [Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
  - [Playwright Docs](https://playwright.dev/)

## Best Practices

### 1. Keep Tests Fast

- Mock external dependencies
- Use `jest.mock()` for heavy imports
- Avoid unnecessary waits

### 2. Keep Tests Isolated

- Each test should be independent
- Clean up after each test
- Don't rely on test execution order

### 3. Keep Tests Readable

- Use descriptive names
- Add comments for complex logic
- Follow AAA pattern (Arrange-Act-Assert)

### 4. Keep Tests Maintainable

- Use shared test utilities
- Extract common setup to `beforeEach`
- Use helper functions for repetitive tasks

### 5. Test Real Scenarios

- Test user workflows, not code coverage
- Include edge cases
- Test error states

## Continuous Improvement

### Regular Maintenance

- Review and update tests when features change
- Remove obsolete tests
- Refactor duplicated test code
- Update mocks to match real implementations

### Coverage Goals

Aim for high coverage in critical areas:

- Authentication logic: 90%+
- Data mutations: 85%+
- Core UI components: 80%+
- Utility functions: 90%+

### Performance Monitoring

Track test suite performance:

- Monitor test execution time
- Identify slow tests
- Optimize or split slow tests
- Use `.only` sparingly (remove before committing)

---

## Additional Resources

- [Next.js Testing](https://nextjs.org/docs/app/building-your-application/testing)
- [Jest Configuration](https://jestjs.io/docs/configuration)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Testing Library Guiding Principles](https://testing-library.com/docs/guiding-principles)

---

**Last Updated**: 2025-11-17
**Maintained by**: Flow Board Development Team
