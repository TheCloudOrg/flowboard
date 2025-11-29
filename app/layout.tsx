import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Flow Board - Team Collaboration',
  description:
    'Organize and flow through your tasks with beautiful drag-and-drop boards and team collaboration',
};

/**
 * Root Layout
 *
 * This is the root layout for the entire app.
 * ThemeProvider is NOT here - it's in the (app) route group layout.
 * This allows landing page to be independent of app theme.
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={inter.className}>{children}</body>
      </html>
    </ClerkProvider>
  );
}
