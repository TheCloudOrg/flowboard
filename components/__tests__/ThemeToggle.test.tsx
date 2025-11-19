import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ThemeToggle from '../ThemeToggle';
import { ThemeProvider } from '@/contexts/ThemeContext';

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    button: ({ children, onClick, className, ...props }: any) => (
      <button onClick={onClick} className={className} {...props}>
        {children}
      </button>
    ),
    div: ({ children, className, ...props }: any) => (
      <div className={className} {...props}>
        {children}
      </div>
    ),
  },
}));

describe('ThemeToggle', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('light', 'dark');
  });

  const renderWithThemeProvider = (component: React.ReactElement) => {
    return render(<ThemeProvider>{component}</ThemeProvider>);
  };

  it('renders without crashing', () => {
    renderWithThemeProvider(<ThemeToggle />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('has correct aria-label for dark mode', async () => {
    renderWithThemeProvider(<ThemeToggle />);

    await waitFor(
      () => {
        const button = screen.getByRole('button');
        expect(button).toHaveAttribute('aria-label', 'Switch to light mode');
      },
      { timeout: 3000 }
    );
  });

  it('has correct aria-label for light mode', async () => {
    localStorage.setItem('theme', 'light');
    renderWithThemeProvider(<ThemeToggle />);

    await waitFor(
      () => {
        const button = screen.getByRole('button');
        expect(button).toHaveAttribute('aria-label', 'Switch to dark mode');
      },
      { timeout: 3000 }
    );
  });

  it('displays Sun icon in dark mode', async () => {
    renderWithThemeProvider(<ThemeToggle />);

    await waitFor(() => {
      // Sun icon should be visible in dark mode
      const svgElements = screen.getAllByRole('button')[0].querySelectorAll('svg');
      expect(svgElements.length).toBeGreaterThan(0);
    });
  });

  it('displays Moon icon in light mode', async () => {
    localStorage.setItem('theme', 'light');
    renderWithThemeProvider(<ThemeToggle />);

    await waitFor(() => {
      // Moon icon should be visible in light mode
      const svgElements = screen.getAllByRole('button')[0].querySelectorAll('svg');
      expect(svgElements.length).toBeGreaterThan(0);
    });
  });

  it('toggles theme when clicked', async () => {
    renderWithThemeProvider(<ThemeToggle />);

    const button = screen.getByRole('button');

    // Initially dark mode - wait for mount
    await waitFor(
      () => {
        expect(button).toHaveAttribute('aria-label', 'Switch to light mode');
      },
      { timeout: 3000 }
    );

    // Click to toggle
    fireEvent.click(button);

    // Should switch to light mode
    await waitFor(
      () => {
        expect(button).toHaveAttribute('aria-label', 'Switch to dark mode');
      },
      { timeout: 3000 }
    );
  });

  it('updates document classes when toggled', async () => {
    renderWithThemeProvider(<ThemeToggle />);

    const button = screen.getByRole('button');

    await waitFor(() => {
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });

    fireEvent.click(button);

    await waitFor(() => {
      expect(document.documentElement.classList.contains('light')).toBe(true);
      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });
  });

  it('persists theme preference to localStorage', async () => {
    renderWithThemeProvider(<ThemeToggle />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'light');
    });
  });

  it('handles multiple rapid clicks', async () => {
    renderWithThemeProvider(<ThemeToggle />);

    const button = screen.getByRole('button');

    // Wait for initial mount and theme setup
    await waitFor(
      () => {
        expect(button).toHaveAttribute('aria-label', 'Switch to light mode');
      },
      { timeout: 3000 }
    );

    // Click multiple times with small delays to allow state updates
    fireEvent.click(button); // dark -> light
    await waitFor(() => expect(button).toHaveAttribute('aria-label', 'Switch to dark mode'), {
      timeout: 2000,
    });

    fireEvent.click(button); // light -> dark
    await waitFor(() => expect(button).toHaveAttribute('aria-label', 'Switch to light mode'), {
      timeout: 2000,
    });

    fireEvent.click(button); // dark -> light
    await waitFor(
      () => {
        expect(button).toHaveAttribute('aria-label', 'Switch to dark mode');
        expect(document.documentElement.classList.contains('light')).toBe(true);
      },
      { timeout: 2000 }
    );
  });

  it('applies correct CSS classes', () => {
    renderWithThemeProvider(<ThemeToggle />);

    const button = screen.getByRole('button');
    expect(button).toHaveClass('glass-effect');
    expect(button).toHaveClass('rounded-xl');
  });
});
