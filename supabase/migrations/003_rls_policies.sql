-- =====================================================
-- RLS Policies for Usage Tracking Tables
-- =====================================================
-- Secures subscriptions, usage_tracking, and waitlist tables
-- Uses Clerk JWT authentication (not Supabase Auth)
-- Ensures organizations can only access their own data
-- =====================================================

-- =====================================================
-- 1. ENABLE RLS ON ALL TABLES
-- =====================================================

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 2. SUBSCRIPTIONS POLICIES
-- =====================================================

-- Organizations can read their own subscription
-- Uses Clerk user ID from JWT token (sub claim)
CREATE POLICY "Organizations can view their own subscription"
  ON subscriptions
  FOR SELECT
  USING (
    organization_id IN (
      SELECT id FROM organizations
      WHERE id IN (
        SELECT organization_id FROM organization_members
        WHERE user_id = auth.jwt() ->> 'sub'
      )
    )
  );

-- Service role can do everything (for backend operations)
CREATE POLICY "Service role has full access to subscriptions"
  ON subscriptions
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- =====================================================
-- 3. USAGE TRACKING POLICIES
-- =====================================================

-- Organizations can read their own usage data
-- Uses Clerk user ID from JWT token (sub claim)
CREATE POLICY "Organizations can view their own usage"
  ON usage_tracking
  FOR SELECT
  USING (
    organization_id IN (
      SELECT id FROM organizations
      WHERE id IN (
        SELECT organization_id FROM organization_members
        WHERE user_id = auth.jwt() ->> 'sub'
      )
    )
  );

-- Service role can do everything (for tracking usage from API)
CREATE POLICY "Service role has full access to usage_tracking"
  ON usage_tracking
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- =====================================================
-- 4. WAITLIST POLICIES
-- =====================================================

-- Anyone can join the waitlist (INSERT only)
CREATE POLICY "Anyone can join waitlist"
  ON waitlist
  FOR INSERT
  WITH CHECK (true);

-- Users can view their own waitlist entries
-- Uses Clerk user ID from JWT token (sub claim)
CREATE POLICY "Users can view their own waitlist entries"
  ON waitlist
  FOR SELECT
  USING (
    user_id = auth.jwt() ->> 'sub'
    OR
    organization_id IN (
      SELECT id FROM organizations
      WHERE id IN (
        SELECT organization_id FROM organization_members
        WHERE user_id = auth.jwt() ->> 'sub'
      )
    )
  );

-- Service role can do everything (for admin operations)
CREATE POLICY "Service role has full access to waitlist"
  ON waitlist
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- =====================================================
-- DONE!
-- =====================================================
-- RLS enabled on all usage tracking tables
-- Organizations can only access their own data
-- Service role can manage all data for backend operations
-- =====================================================
