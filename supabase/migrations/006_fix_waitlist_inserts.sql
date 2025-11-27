-- =====================================================
-- Fix Waitlist INSERT Policy
-- =====================================================
-- The waitlist table has RLS enabled but no INSERT policy,
-- preventing anonymous users from joining the waitlist.
--
-- Solution: Allow anyone to INSERT into waitlist (it's a public signup)
-- =====================================================

-- Allow anyone to join the waitlist (no authentication required)
CREATE POLICY "Anyone can join waitlist"
  ON waitlist
  FOR INSERT
  WITH CHECK (true);

-- =====================================================
-- DONE!
-- =====================================================
-- Anonymous users can now join the waitlist from landing page
-- Users can still only view their own waitlist entries (existing SELECT policy)
-- =====================================================
