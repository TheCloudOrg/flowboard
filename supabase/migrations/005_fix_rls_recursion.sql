-- =====================================================
-- Fix RLS Infinite Recursion
-- =====================================================
-- The organization_members policy causes infinite recursion
-- because it queries organization_members while evaluating
-- permissions on organization_members.
--
-- Solution: Use a SECURITY DEFINER function to bypass RLS
-- when checking user's organizations.
-- =====================================================

-- =====================================================
-- 1. DROP PROBLEMATIC POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Users can view members of their organizations" ON organization_members;
DROP POLICY IF EXISTS "Users can view their organizations" ON organizations;
DROP POLICY IF EXISTS "Organizations can view their own subscription" ON subscriptions;
DROP POLICY IF EXISTS "Organizations can view their own usage" ON usage_tracking;
DROP POLICY IF EXISTS "Users can view their own waitlist entries" ON waitlist;
DROP POLICY IF EXISTS "Users can view boards in their organizations" ON boards;
DROP POLICY IF EXISTS "Users can create boards in their organizations" ON boards;
DROP POLICY IF EXISTS "Users can update boards in their organizations" ON boards;
DROP POLICY IF EXISTS "Users can delete boards in their organizations" ON boards;
DROP POLICY IF EXISTS "Users can view columns in their boards" ON columns;
DROP POLICY IF EXISTS "Users can create columns in their boards" ON columns;
DROP POLICY IF EXISTS "Users can update columns in their boards" ON columns;
DROP POLICY IF EXISTS "Users can delete columns in their boards" ON columns;
DROP POLICY IF EXISTS "Users can view cards in their boards" ON cards;
DROP POLICY IF EXISTS "Users can create cards in their boards" ON cards;
DROP POLICY IF EXISTS "Users can update cards in their boards" ON cards;
DROP POLICY IF EXISTS "Users can delete cards in their boards" ON cards;

-- =====================================================
-- 2. CREATE HELPER FUNCTION TO AVOID RECURSION
-- =====================================================

-- Function to get user's organizations (bypasses RLS)
CREATE OR REPLACE FUNCTION public.user_organizations(user_id_param TEXT)
RETURNS SETOF TEXT
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT organization_id FROM organization_members WHERE user_id = user_id_param;
$$;

-- =====================================================
-- 3. RECREATE ORGANIZATION_MEMBERS POLICIES (NO RECURSION)
-- =====================================================

-- Users can view members of organizations they belong to
CREATE POLICY "Users can view members of their organizations"
  ON organization_members
  FOR SELECT
  USING (
    organization_id IN (
      SELECT public.user_organizations(auth.jwt() ->> 'sub')
    )
  );

-- =====================================================
-- 4. RECREATE ORGANIZATIONS POLICIES (USES HELPER FUNCTION)
-- =====================================================

-- Users can view organizations they're members of
CREATE POLICY "Users can view their organizations"
  ON organizations
  FOR SELECT
  USING (
    id IN (
      SELECT public.user_organizations(auth.jwt() ->> 'sub')
    )
  );

-- =====================================================
-- 5. RECREATE SUBSCRIPTIONS POLICIES (USES HELPER FUNCTION)
-- =====================================================

-- Organizations can read their own subscription
CREATE POLICY "Organizations can view their own subscription"
  ON subscriptions
  FOR SELECT
  USING (
    organization_id IN (
      SELECT public.user_organizations(auth.jwt() ->> 'sub')
    )
  );

-- =====================================================
-- 6. RECREATE USAGE_TRACKING POLICIES (USES HELPER FUNCTION)
-- =====================================================

-- Organizations can read their own usage data
CREATE POLICY "Organizations can view their own usage"
  ON usage_tracking
  FOR SELECT
  USING (
    organization_id IN (
      SELECT public.user_organizations(auth.jwt() ->> 'sub')
    )
  );

-- =====================================================
-- 7. RECREATE WAITLIST POLICIES (USES HELPER FUNCTION)
-- =====================================================

-- Users can view their own waitlist entries
CREATE POLICY "Users can view their own waitlist entries"
  ON waitlist
  FOR SELECT
  USING (
    user_id = auth.jwt() ->> 'sub'
    OR
    organization_id IN (
      SELECT public.user_organizations(auth.jwt() ->> 'sub')
    )
  );

-- =====================================================
-- 8. RECREATE BOARDS POLICIES (USES HELPER FUNCTION)
-- =====================================================

CREATE POLICY "Users can view boards in their organizations"
  ON boards
  FOR SELECT
  USING (
    organization_id IN (
      SELECT public.user_organizations(auth.jwt() ->> 'sub')
    )
  );

CREATE POLICY "Users can create boards in their organizations"
  ON boards
  FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT public.user_organizations(auth.jwt() ->> 'sub')
    )
  );

CREATE POLICY "Users can update boards in their organizations"
  ON boards
  FOR UPDATE
  USING (
    organization_id IN (
      SELECT public.user_organizations(auth.jwt() ->> 'sub')
    )
  );

CREATE POLICY "Users can delete boards in their organizations"
  ON boards
  FOR DELETE
  USING (
    organization_id IN (
      SELECT public.user_organizations(auth.jwt() ->> 'sub')
    )
  );

-- =====================================================
-- 9. RECREATE COLUMNS POLICIES (USES HELPER FUNCTION)
-- =====================================================

CREATE POLICY "Users can view columns in their boards"
  ON columns
  FOR SELECT
  USING (
    board_id IN (
      SELECT id FROM boards
      WHERE organization_id IN (
        SELECT public.user_organizations(auth.jwt() ->> 'sub')
      )
    )
  );

CREATE POLICY "Users can create columns in their boards"
  ON columns
  FOR INSERT
  WITH CHECK (
    board_id IN (
      SELECT id FROM boards
      WHERE organization_id IN (
        SELECT public.user_organizations(auth.jwt() ->> 'sub')
      )
    )
  );

CREATE POLICY "Users can update columns in their boards"
  ON columns
  FOR UPDATE
  USING (
    board_id IN (
      SELECT id FROM boards
      WHERE organization_id IN (
        SELECT public.user_organizations(auth.jwt() ->> 'sub')
      )
    )
  );

CREATE POLICY "Users can delete columns in their boards"
  ON columns
  FOR DELETE
  USING (
    board_id IN (
      SELECT id FROM boards
      WHERE organization_id IN (
        SELECT public.user_organizations(auth.jwt() ->> 'sub')
      )
    )
  );

-- =====================================================
-- 10. RECREATE CARDS POLICIES (USES HELPER FUNCTION)
-- =====================================================

CREATE POLICY "Users can view cards in their boards"
  ON cards
  FOR SELECT
  USING (
    board_id IN (
      SELECT id FROM boards
      WHERE organization_id IN (
        SELECT public.user_organizations(auth.jwt() ->> 'sub')
      )
    )
  );

CREATE POLICY "Users can create cards in their boards"
  ON cards
  FOR INSERT
  WITH CHECK (
    board_id IN (
      SELECT id FROM boards
      WHERE organization_id IN (
        SELECT public.user_organizations(auth.jwt() ->> 'sub')
      )
    )
  );

CREATE POLICY "Users can update cards in their boards"
  ON cards
  FOR UPDATE
  USING (
    board_id IN (
      SELECT id FROM boards
      WHERE organization_id IN (
        SELECT public.user_organizations(auth.jwt() ->> 'sub')
      )
    )
  );

CREATE POLICY "Users can delete cards in their boards"
  ON cards
  FOR DELETE
  USING (
    board_id IN (
      SELECT id FROM boards
      WHERE organization_id IN (
        SELECT public.user_organizations(auth.jwt() ->> 'sub')
      )
    )
  );

-- =====================================================
-- DONE!
-- =====================================================
-- Fixed infinite recursion by using SECURITY DEFINER function
-- The helper function public.user_organizations() bypasses RLS
-- All policies now use this function instead of direct subqueries
-- =====================================================
