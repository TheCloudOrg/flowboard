import LandingPage from './(landing)/page';
import ForceDarkMode from '@/components/ForceDarkMode';

/**
 * Root Page - Always shows landing page
 *
 * This follows the standard SaaS pattern:
 * - `/` (root) → Landing page for everyone (marketing/info)
 * - `/board` → Protected app (requires auth)
 *
 * The landing page shows different CTAs based on auth status:
 * - Logged out: "Sign In" + "Start Free"
 * - Logged in: "Go to Dashboard"
 *
 * ForceDarkMode ensures the landing page stays dark even if user
 * previously had light mode enabled in the app.
 */
export default function Home() {
  return (
    <>
      <ForceDarkMode />
      <LandingPage />
    </>
  );
}
