-- =====================================================
-- Usage Tracking & Subscription Management
-- =====================================================
-- Creates tables for:
-- 1. Subscriptions (organization plan management)
-- 2. Usage Tracking (monthly usage metrics)
-- 3. Waitlist (interested users for paid plans)
-- =====================================================

-- =====================================================
-- 1. CREATE SUBSCRIPTIONS TABLE
-- =====================================================

-- Subscriptions table (organization plan management)
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  plan_tier TEXT NOT NULL DEFAULT 'free' CHECK (plan_tier IN ('free', 'pro', 'business')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired')),
  current_period_start TIMESTAMPTZ DEFAULT NOW(),
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id)
);

CREATE INDEX idx_subscriptions_org_id ON subscriptions(organization_id);
CREATE INDEX idx_subscriptions_plan_tier ON subscriptions(plan_tier);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);

-- =====================================================
-- 2. CREATE USAGE TRACKING TABLE
-- =====================================================

-- Usage tracking table (monthly usage metrics)
CREATE TABLE usage_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  metric_type TEXT NOT NULL CHECK (metric_type IN ('ai_prompts', 'cards', 'boards')),
  count INTEGER NOT NULL DEFAULT 0,
  period_month TEXT NOT NULL, -- Format: YYYY-MM
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, metric_type, period_month)
);

CREATE INDEX idx_usage_tracking_org_id ON usage_tracking(organization_id);
CREATE INDEX idx_usage_tracking_metric_type ON usage_tracking(metric_type);
CREATE INDEX idx_usage_tracking_period ON usage_tracking(period_month);
CREATE INDEX idx_usage_tracking_org_metric_period ON usage_tracking(organization_id, metric_type, period_month);

-- =====================================================
-- 3. CREATE WAITLIST TABLE
-- =====================================================

-- Waitlist table (interested users for paid plans)
CREATE TABLE waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  plan_interest TEXT NOT NULL CHECK (plan_interest IN ('pro', 'business')),
  organization_id TEXT REFERENCES organizations(id) ON DELETE CASCADE,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(email)
);

CREATE INDEX idx_waitlist_email ON waitlist(email);
CREATE INDEX idx_waitlist_plan_interest ON waitlist(plan_interest);
CREATE INDEX idx_waitlist_org_id ON waitlist(organization_id);

-- =====================================================
-- 4. CREATE TRIGGERS FOR updated_at
-- =====================================================

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_usage_tracking_updated_at
  BEFORE UPDATE ON usage_tracking
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 5. AUTO-INSERT FREE SUBSCRIPTIONS FOR EXISTING ORGS
-- =====================================================

-- Give all existing organizations a free subscription
INSERT INTO subscriptions (organization_id, plan_tier, status)
SELECT id, 'free', 'active'
FROM organizations
ON CONFLICT (organization_id) DO NOTHING;

-- =====================================================
-- 6. CREATE TRIGGER TO AUTO-CREATE SUBSCRIPTION ON ORG CREATE
-- =====================================================

-- Automatically create a free subscription when a new organization is created
CREATE OR REPLACE FUNCTION create_subscription_for_org()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO subscriptions (organization_id, plan_tier, status)
  VALUES (NEW.id, 'free', 'active')
  ON CONFLICT (organization_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_create_subscription_on_org_create
  AFTER INSERT ON organizations
  FOR EACH ROW
  EXECUTE FUNCTION create_subscription_for_org();

-- =====================================================
-- DONE!
-- =====================================================
-- Usage tracking tables created successfully
-- All existing organizations now have free subscriptions
-- New organizations will automatically get free subscriptions
-- =====================================================
