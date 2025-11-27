-- =====================================================
-- User Onboarding Tracking Table
-- =====================================================
-- Tracks user onboarding progress including current step,
-- theme preferences, and completion status
-- =====================================================

-- =====================================================
-- 1. CREATE user_onboarding TABLE
-- =====================================================

CREATE TABLE user_onboarding (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT false,
  current_step INTEGER DEFAULT 0,
  theme_preference TEXT,
  first_board_created BOOLEAN DEFAULT false,
  skipped BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 2. CREATE INDEXES
-- =====================================================

-- Index for efficient user_id lookups
CREATE INDEX idx_user_onboarding_user_id ON user_onboarding(user_id);

-- Index for finding incomplete onboarding
CREATE INDEX idx_user_onboarding_completed ON user_onboarding(completed);

-- Index for finding users who skipped onboarding
CREATE INDEX idx_user_onboarding_skipped ON user_onboarding(skipped);

-- =====================================================
-- 3. CREATE TRIGGER FOR updated_at
-- =====================================================

CREATE TRIGGER update_user_onboarding_updated_at
  BEFORE UPDATE ON user_onboarding
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 4. ENABLE RLS AND CREATE POLICIES
-- =====================================================

ALTER TABLE user_onboarding ENABLE ROW LEVEL SECURITY;

-- Users can read their own onboarding data
CREATE POLICY "Users can view their own onboarding data"
  ON user_onboarding
  FOR SELECT
  USING (user_id = auth.jwt() ->> 'sub');

-- Users can insert their own onboarding record
CREATE POLICY "Users can create their own onboarding record"
  ON user_onboarding
  FOR INSERT
  WITH CHECK (user_id = auth.jwt() ->> 'sub');

-- Users can update their own onboarding data
CREATE POLICY "Users can update their own onboarding data"
  ON user_onboarding
  FOR UPDATE
  USING (user_id = auth.jwt() ->> 'sub');

-- Users can delete their own onboarding data
CREATE POLICY "Users can delete their own onboarding data"
  ON user_onboarding
  FOR DELETE
  USING (user_id = auth.jwt() ->> 'sub');

-- Service role has full access (for backend operations)
CREATE POLICY "Service role has full access to user_onboarding"
  ON user_onboarding
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- =====================================================
-- DONE!
-- =====================================================
-- Created user_onboarding table with:
-- - id: UUID primary key
-- - user_id: TEXT unique reference to users table
-- - completed: BOOLEAN to track completion status
-- - current_step: INTEGER for multi-step onboarding
-- - theme_preference: TEXT for light/dark theme preference
-- - first_board_created: BOOLEAN to track board creation
-- - skipped: BOOLEAN to track if user skipped onboarding
-- - created_at: TIMESTAMPTZ for creation timestamp
-- - completed_at: TIMESTAMPTZ for completion timestamp
-- - updated_at: TIMESTAMPTZ for updates (with trigger)
--
-- RLS enabled with policies for:
-- - Users can only access their own onboarding data
-- - Service role has full access for backend operations
-- =====================================================
