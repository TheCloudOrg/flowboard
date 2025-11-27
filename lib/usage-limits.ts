/**
 * Usage Limits Library
 *
 * Manages subscription plan limits and usage tracking for organizations
 * Supports free, pro, and business tiers with different limits
 */

import { createClient } from '@/lib/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Service role client for admin operations (bypasses RLS)
const supabaseAdmin = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// =====================================================
// PLAN LIMITS CONFIGURATION
// =====================================================

export type PlanTier = 'free' | 'pro' | 'business';
export type MetricType = 'ai_prompts' | 'cards' | 'boards';

export interface PlanLimits {
  ai_prompts: number;
  cards: number;
  boards: number;
}

/**
 * Plan limits for each subscription tier
 * -1 means unlimited
 */
export const PLAN_LIMITS: Record<PlanTier, PlanLimits> = {
  free: {
    ai_prompts: 10, // 10 AI prompts per month
    cards: 50, // 50 total cards
    boards: 3, // 3 total boards
  },
  pro: {
    ai_prompts: 100, // 100 AI prompts per month
    cards: 500, // 500 total cards
    boards: 20, // 20 total boards
  },
  business: {
    ai_prompts: -1, // Unlimited AI prompts
    cards: -1, // Unlimited cards
    boards: -1, // Unlimited boards
  },
};

// =====================================================
// HELPER FUNCTIONS
// =====================================================

/**
 * Get the current period month in YYYY-MM format
 */
function getCurrentPeriodMonth(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * Get organization's subscription plan tier
 */
async function getOrganizationPlanTier(organizationId: string): Promise<PlanTier> {
  const supabase = await createClient();

  const { data: subscription, error } = await supabase
    .from('subscriptions')
    .select('plan_tier')
    .eq('organization_id', organizationId)
    .eq('status', 'active')
    .single();

  if (error || !subscription) {
    console.error('Error fetching subscription:', error);
    // Default to free tier if subscription not found
    return 'free';
  }

  return subscription.plan_tier as PlanTier;
}

// =====================================================
// MAIN EXPORTED FUNCTIONS
// =====================================================

/**
 * Check if an organization has reached its usage limit for a specific metric
 *
 * @param orgId - Organization ID
 * @param metricType - Type of metric to check (ai_prompts, cards, boards)
 * @returns Promise<boolean> - true if under limit (can use), false if limit reached
 */
export async function checkUsageLimit(orgId: string, metricType: MetricType): Promise<boolean> {
  try {
    const supabase = await createClient();

    // Get organization's plan tier
    const planTier = await getOrganizationPlanTier(orgId);
    const limit = PLAN_LIMITS[planTier][metricType];

    // -1 means unlimited
    if (limit === -1) {
      return true;
    }

    // For monthly metrics (ai_prompts), check usage_tracking for current month
    if (metricType === 'ai_prompts') {
      const periodMonth = getCurrentPeriodMonth();

      const { data: usage, error } = await supabase
        .from('usage_tracking')
        .select('count')
        .eq('organization_id', orgId)
        .eq('metric_type', metricType)
        .eq('period_month', periodMonth)
        .single();

      if (error && error.code !== 'PGRST116') {
        // PGRST116 is "not found" error, which is fine
        console.error('Error checking usage limit:', error);
        return false;
      }

      const currentCount = usage?.count || 0;
      return currentCount < limit;
    }

    // For total metrics (cards, boards), count directly from database
    if (metricType === 'cards') {
      const { count, error } = await supabase
        .from('cards')
        .select('id', { count: 'exact', head: true })
        .eq('board_id', orgId); // This will be fixed to use proper org filtering

      // Note: Cards don't have direct org_id, need to join through boards
      // For now, we'll count cards across all boards in the org
      const { data: boards } = await supabase
        .from('boards')
        .select('id')
        .eq('organization_id', orgId);

      if (!boards || boards.length === 0) {
        return true; // No boards, so under limit
      }

      const boardIds = boards.map((b) => b.id);

      const { count: cardCount, error: cardError } = await supabase
        .from('cards')
        .select('id', { count: 'exact', head: true })
        .in('board_id', boardIds);

      if (cardError) {
        console.error('Error counting cards:', cardError);
        return false;
      }

      return (cardCount || 0) < limit;
    }

    if (metricType === 'boards') {
      const { count, error } = await supabase
        .from('boards')
        .select('id', { count: 'exact', head: true })
        .eq('organization_id', orgId);

      if (error) {
        console.error('Error counting boards:', error);
        return false;
      }

      return (count || 0) < limit;
    }

    return false;
  } catch (error) {
    console.error('Error in checkUsageLimit:', error);
    return false;
  }
}

/**
 * Track usage for a specific metric (increments the count)
 *
 * @param orgId - Organization ID
 * @param metricType - Type of metric to track (ai_prompts, cards, boards)
 * @returns Promise<void>
 */
export async function trackUsage(orgId: string, metricType: MetricType): Promise<void> {
  try {
    // Use admin client to bypass RLS for usage tracking
    const periodMonth = getCurrentPeriodMonth();

    // First, try to get the current usage record
    const { data: existingUsage } = await supabaseAdmin
      .from('usage_tracking')
      .select('id, count')
      .eq('organization_id', orgId)
      .eq('metric_type', metricType)
      .eq('period_month', periodMonth)
      .single();

    if (existingUsage) {
      // Update existing record
      const { error } = await supabaseAdmin
        .from('usage_tracking')
        .update({ count: existingUsage.count + 1 })
        .eq('id', existingUsage.id);

      if (error) {
        console.error('Error updating usage tracking:', error);
      }
    } else {
      // Insert new record
      const { error } = await supabaseAdmin.from('usage_tracking').insert({
        organization_id: orgId,
        metric_type: metricType,
        count: 1,
        period_month: periodMonth,
      });

      if (error) {
        console.error('Error inserting usage tracking:', error);
      }
    }
  } catch (error) {
    console.error('Error in trackUsage:', error);
  }
}

/**
 * Get current usage stats for an organization
 *
 * @param orgId - Organization ID
 * @returns Promise with usage stats and limits
 */
export async function getUsageStats(orgId: string): Promise<{
  ai_prompts: { current: number; limit: number };
  cards: { current: number; limit: number };
  boards: { current: number; limit: number };
  planTier: PlanTier;
}> {
  try {
    const supabase = await createClient();
    const planTier = await getOrganizationPlanTier(orgId);
    const periodMonth = getCurrentPeriodMonth();

    // Get AI prompts usage for current month
    const { data: aiUsage } = await supabase
      .from('usage_tracking')
      .select('count')
      .eq('organization_id', orgId)
      .eq('metric_type', 'ai_prompts')
      .eq('period_month', periodMonth)
      .single();

    // Get boards count
    const { data: boards } = await supabase
      .from('boards')
      .select('id')
      .eq('organization_id', orgId);

    const boardIds = boards?.map((b) => b.id) || [];

    // Get cards count across all boards
    const { count: cardsCount } = await supabase
      .from('cards')
      .select('id', { count: 'exact', head: true })
      .in('board_id', boardIds);

    return {
      ai_prompts: {
        current: aiUsage?.count || 0,
        limit: PLAN_LIMITS[planTier].ai_prompts,
      },
      cards: {
        current: cardsCount || 0,
        limit: PLAN_LIMITS[planTier].cards,
      },
      boards: {
        current: boards?.length || 0,
        limit: PLAN_LIMITS[planTier].boards,
      },
      planTier,
    };
  } catch (error) {
    console.error('Error in getUsageStats:', error);
    // Return safe defaults
    return {
      ai_prompts: { current: 0, limit: 10 },
      cards: { current: 0, limit: 50 },
      boards: { current: 0, limit: 3 },
      planTier: 'free',
    };
  }
}
