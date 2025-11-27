-- =====================================================
-- RLS Policies for Core Tables
-- =====================================================
-- Secures users, organizations, boards, columns, and cards
-- Uses Clerk JWT authentication (sub claim)
-- Ensures organizations can only access their own data
-- =====================================================

-- =====================================================
-- 1. ENABLE RLS ON ALL CORE TABLES
-- =====================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE columns ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 2. USERS TABLE POLICIES
-- =====================================================

-- Users can read their own profile
CREATE POLICY "Users can view their own profile"
  ON users
  FOR SELECT
  USING (id = auth.jwt() ->> 'sub');

-- Users can update their own profile
CREATE POLICY "Users can update their own profile"
  ON users
  FOR UPDATE
  USING (id = auth.jwt() ->> 'sub');

-- Service role has full access (for Clerk webhook sync)
CREATE POLICY "Service role has full access to users"
  ON users
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- =====================================================
-- 3. ORGANIZATIONS TABLE POLICIES
-- =====================================================

-- Users can view organizations they're members of
CREATE POLICY "Users can view their organizations"
  ON organizations
  FOR SELECT
  USING (
    id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.jwt() ->> 'sub'
    )
  );

-- Service role has full access (for Clerk webhook sync)
CREATE POLICY "Service role has full access to organizations"
  ON organizations
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- =====================================================
-- 4. ORGANIZATION_MEMBERS TABLE POLICIES
-- =====================================================

-- Users can view members of their organizations
CREATE POLICY "Users can view members of their organizations"
  ON organization_members
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.jwt() ->> 'sub'
    )
  );

-- Service role has full access (for Clerk webhook sync)
CREATE POLICY "Service role has full access to organization_members"
  ON organization_members
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- =====================================================
-- 5. BOARDS TABLE POLICIES
-- =====================================================

-- Users can view boards in their organizations
CREATE POLICY "Users can view boards in their organizations"
  ON boards
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.jwt() ->> 'sub'
    )
  );

-- Users can create boards in their organizations
CREATE POLICY "Users can create boards in their organizations"
  ON boards
  FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.jwt() ->> 'sub'
    )
  );

-- Users can update boards in their organizations
CREATE POLICY "Users can update boards in their organizations"
  ON boards
  FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.jwt() ->> 'sub'
    )
  );

-- Users can delete boards in their organizations
CREATE POLICY "Users can delete boards in their organizations"
  ON boards
  FOR DELETE
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.jwt() ->> 'sub'
    )
  );

-- Service role has full access
CREATE POLICY "Service role has full access to boards"
  ON boards
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- =====================================================
-- 6. COLUMNS TABLE POLICIES
-- =====================================================

-- Users can view columns in boards they have access to
CREATE POLICY "Users can view columns in their boards"
  ON columns
  FOR SELECT
  USING (
    board_id IN (
      SELECT id FROM boards
      WHERE organization_id IN (
        SELECT organization_id FROM organization_members
        WHERE user_id = auth.jwt() ->> 'sub'
      )
    )
  );

-- Users can create columns in boards they have access to
CREATE POLICY "Users can create columns in their boards"
  ON columns
  FOR INSERT
  WITH CHECK (
    board_id IN (
      SELECT id FROM boards
      WHERE organization_id IN (
        SELECT organization_id FROM organization_members
        WHERE user_id = auth.jwt() ->> 'sub'
      )
    )
  );

-- Users can update columns in boards they have access to
CREATE POLICY "Users can update columns in their boards"
  ON columns
  FOR UPDATE
  USING (
    board_id IN (
      SELECT id FROM boards
      WHERE organization_id IN (
        SELECT organization_id FROM organization_members
        WHERE user_id = auth.jwt() ->> 'sub'
      )
    )
  );

-- Users can delete columns in boards they have access to
CREATE POLICY "Users can delete columns in their boards"
  ON columns
  FOR DELETE
  USING (
    board_id IN (
      SELECT id FROM boards
      WHERE organization_id IN (
        SELECT organization_id FROM organization_members
        WHERE user_id = auth.jwt() ->> 'sub'
      )
    )
  );

-- Service role has full access
CREATE POLICY "Service role has full access to columns"
  ON columns
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- =====================================================
-- 7. CARDS TABLE POLICIES
-- =====================================================

-- Users can view cards in boards they have access to
CREATE POLICY "Users can view cards in their boards"
  ON cards
  FOR SELECT
  USING (
    board_id IN (
      SELECT id FROM boards
      WHERE organization_id IN (
        SELECT organization_id FROM organization_members
        WHERE user_id = auth.jwt() ->> 'sub'
      )
    )
  );

-- Users can create cards in boards they have access to
CREATE POLICY "Users can create cards in their boards"
  ON cards
  FOR INSERT
  WITH CHECK (
    board_id IN (
      SELECT id FROM boards
      WHERE organization_id IN (
        SELECT organization_id FROM organization_members
        WHERE user_id = auth.jwt() ->> 'sub'
      )
    )
  );

-- Users can update cards in boards they have access to
CREATE POLICY "Users can update cards in their boards"
  ON cards
  FOR UPDATE
  USING (
    board_id IN (
      SELECT id FROM boards
      WHERE organization_id IN (
        SELECT organization_id FROM organization_members
        WHERE user_id = auth.jwt() ->> 'sub'
      )
    )
  );

-- Users can delete cards in boards they have access to
CREATE POLICY "Users can delete cards in their boards"
  ON cards
  FOR DELETE
  USING (
    board_id IN (
      SELECT id FROM boards
      WHERE organization_id IN (
        SELECT organization_id FROM organization_members
        WHERE user_id = auth.jwt() ->> 'sub'
      )
    )
  );

-- Service role has full access
CREATE POLICY "Service role has full access to cards"
  ON cards
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- =====================================================
-- DONE!
-- =====================================================
-- RLS enabled on all core tables:
-- - users: Users can only access their own profile
-- - organizations: Users can only see orgs they're members of
-- - organization_members: Users can only see members in their orgs
-- - boards: Users can CRUD boards in their organizations
-- - columns: Users can CRUD columns in boards they have access to
-- - cards: Users can CRUD cards in boards they have access to
--
-- Service role (backend API) has full access to all tables
-- =====================================================
