import type { Metadata } from 'next';
import ForceDarkMode from '@/components/ForceDarkMode';

export const metadata: Metadata = {
  title: 'Flow Board - AI-Powered Project Management',
  description:
    'Turn project ideas into AI-ready prompts. The project management tool for developers using AI assistants.',
};

/**
 * Landing Page Layout
 *
 * This layout is for unauthenticated landing pages.
 * Uses ForceDarkMode to ensure landing page is ALWAYS dark.
 *
 * Why this is needed:
 * - The app uses CSS classes (.light/.dark) on <html> for theming
 * - When user toggles to light mode in app and logs out, <html> still has 'light' class
 * - ForceDarkMode forces 'dark' class on <html> when landing page loads
 * - This ensures landing page always displays in dark mode
 */
export default function LandingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ForceDarkMode />
      {children}
    </>
  );
}
