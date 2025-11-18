import React from 'react'

// Mock user data
export const mockUser = {
  id: 'user_test123',
  firstName: 'Test',
  lastName: 'User',
  emailAddresses: [{ emailAddress: 'test@example.com' }],
  primaryEmailAddressId: 'email_test123',
  imageUrl: 'https://example.com/avatar.jpg',
}

// Mock organization data
export const mockOrganization = {
  id: 'org_test123',
  name: 'Test Organization',
  slug: 'test-org',
  imageUrl: 'https://example.com/org-logo.jpg',
  createdAt: new Date('2024-01-01'),
}

// Mock hooks
export const useUser = jest.fn(() => ({
  isLoaded: true,
  isSignedIn: true,
  user: mockUser,
}))

export const useOrganization = jest.fn(() => ({
  isLoaded: true,
  organization: mockOrganization,
}))

export const useAuth = jest.fn(() => ({
  isLoaded: true,
  isSignedIn: true,
  userId: mockUser.id,
  sessionId: 'session_test123',
  getToken: jest.fn().mockResolvedValue('mock_token'),
}))

export const useClerk = jest.fn(() => ({
  signOut: jest.fn().mockResolvedValue(undefined),
  openSignIn: jest.fn(),
  openSignUp: jest.fn(),
}))

// Mock components
export const ClerkProvider = ({ children }: { children: React.ReactNode }) => (
  <div data-testid="clerk-provider">{children}</div>
)

export const SignInButton = ({ children }: { children: React.ReactNode }) => (
  <button data-testid="sign-in-button">{children}</button>
)

export const SignUpButton = ({ children }: { children: React.ReactNode }) => (
  <button data-testid="sign-up-button">{children}</button>
)

export const UserButton = () => <div data-testid="user-button">User Menu</div>

export const OrganizationSwitcher = ({ appearance }: any) => (
  <div data-testid="organization-switcher">Org Switcher</div>
)

export const SignedIn = ({ children }: { children: React.ReactNode }) => (
  <div data-testid="signed-in">{children}</div>
)

export const SignedOut = ({ children }: { children: React.ReactNode }) => (
  <div data-testid="signed-out">{children}</div>
)

// Mock middleware utilities
export const authMiddleware = jest.fn((config) => (req: any) => {
  return new Response('OK')
})

export const clerkMiddleware = jest.fn(() => (req: any) => {
  return new Response('OK')
})

export const createRouteMatcher = jest.fn((routes: string[]) => {
  return (req: any) => routes.some((route) => req.url?.includes(route))
})
