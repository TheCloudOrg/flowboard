'use client';

import { useEffect } from 'react';

/**
 * ForceDarkMode Component
 *
 * Forces the document to use dark mode by setting the 'dark' class on the <html> element.
 * This is used on the landing page to ensure it ALWAYS displays in dark mode,
 * regardless of the user's app theme preference stored in localStorage.
 *
 * How it works:
 * - On mount, removes 'light' class and adds 'dark' class to <html>
 * - Does NOT modify localStorage (preserves user's app preference)
 * - When user navigates to the app, ThemeProvider will restore their preference
 *
 * Why this is needed:
 * - The app uses Tailwind CSS with `.light` and `.dark` prefixed styles
 * - When user toggles to light mode in the app, 'light' class is set on <html>
 * - Without this component, landing page would render in light mode after logout
 */
export default function ForceDarkMode() {
  useEffect(() => {
    // Force dark mode on the document
    const root = window.document.documentElement;
    root.classList.remove('light');
    root.classList.add('dark');

    // Cleanup: When navigating away from landing page,
    // the app's ThemeProvider will handle restoring user preference
  }, []);

  // This component doesn't render anything
  return null;
}
