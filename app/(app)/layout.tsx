import { ThemeProvider } from '@/contexts/ThemeContext';

/**
 * App Layout
 *
 * This layout is for authenticated app pages (board, settings, etc.).
 * Includes ThemeProvider for light/dark mode toggle.
 * This theme only affects pages within this route group.
 */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <ThemeProvider>{children}</ThemeProvider>;
}
