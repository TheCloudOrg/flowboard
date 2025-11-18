import React from 'react'
import { renderHook, act, waitFor } from '@testing-library/react'
import { ThemeProvider, useTheme } from '../ThemeContext'

describe('ThemeContext', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear()
    // Reset document element classes
    document.documentElement.classList.remove('light', 'dark')
    // Reset matchMedia mock
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation((query) => ({
        matches: query === '(prefers-color-scheme: dark)',
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    })
  })

  describe('ThemeProvider', () => {
    it('provides default dark theme', async () => {
      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider,
      })

      await waitFor(() => {
        expect(result.current.theme).toBe('dark')
      })
    })

    it('loads theme from localStorage if available', async () => {
      localStorage.setItem('theme', 'light')

      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider,
      })

      await waitFor(() => {
        expect(result.current.theme).toBe('light')
      })
    })

    it('uses system preference when no saved theme exists', async () => {
      // Mock system preference for light mode
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation((query) => ({
          matches: query === '(prefers-color-scheme: light)',
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        })),
      })

      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider,
      })

      await waitFor(() => {
        expect(result.current.theme).toBe('light')
      })
    })

    it('applies theme class to document element', async () => {
      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider,
      })

      await waitFor(() => {
        expect(document.documentElement.classList.contains('dark')).toBe(true)
      })
    })

    it('saves theme to localStorage', async () => {
      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider,
      })

      await waitFor(() => {
        expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'dark')
      })
    })
  })

  describe('toggleTheme', () => {
    it('toggles from dark to light', async () => {
      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider,
      })

      await waitFor(() => {
        expect(result.current.theme).toBe('dark')
      })

      act(() => {
        result.current.toggleTheme()
      })

      await waitFor(() => {
        expect(result.current.theme).toBe('light')
      })
    })

    it('toggles from light to dark', async () => {
      localStorage.setItem('theme', 'light')

      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider,
      })

      await waitFor(() => {
        expect(result.current.theme).toBe('light')
      })

      act(() => {
        result.current.toggleTheme()
      })

      await waitFor(() => {
        expect(result.current.theme).toBe('dark')
      })
    })

    it('updates document classes when toggling', async () => {
      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider,
      })

      await waitFor(() => {
        expect(document.documentElement.classList.contains('dark')).toBe(true)
      })

      act(() => {
        result.current.toggleTheme()
      })

      await waitFor(() => {
        expect(document.documentElement.classList.contains('light')).toBe(true)
        expect(document.documentElement.classList.contains('dark')).toBe(false)
      })
    })

    it('persists theme changes to localStorage', async () => {
      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider,
      })

      act(() => {
        result.current.toggleTheme()
      })

      await waitFor(() => {
        expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'light')
      })
    })
  })

  describe('useTheme hook', () => {
    it('throws error when used outside ThemeProvider', () => {
      // Suppress console.error for this test
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      expect(() => {
        renderHook(() => useTheme())
      }).toThrow('useTheme must be used within a ThemeProvider')

      consoleSpy.mockRestore()
    })

    it('returns theme context when used inside ThemeProvider', () => {
      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider,
      })

      expect(result.current).toHaveProperty('theme')
      expect(result.current).toHaveProperty('toggleTheme')
      expect(typeof result.current.toggleTheme).toBe('function')
    })
  })

  describe('Multiple toggles', () => {
    it('handles rapid theme toggles correctly', async () => {
      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider,
      })

      await waitFor(() => {
        expect(result.current.theme).toBe('dark')
      })

      // Toggle multiple times rapidly
      act(() => {
        result.current.toggleTheme() // dark -> light
        result.current.toggleTheme() // light -> dark
        result.current.toggleTheme() // dark -> light
      })

      await waitFor(() => {
        expect(result.current.theme).toBe('light')
      })
    })
  })
})
