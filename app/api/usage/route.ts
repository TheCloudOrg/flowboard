/**
 * Usage API Endpoint
 *
 * GET /api/usage - Fetch current usage stats for the authenticated organization
 *
 * Returns:
 * - Current usage counts (AI prompts, cards, boards)
 * - Plan limits
 * - Plan tier
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getUsageStats } from '@/lib/usage-limits';

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user and organization
    const { userId, orgId } = await auth();

    // Check authentication
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in to view usage stats.' },
        { status: 401 }
      );
    }

    // Check organization membership
    if (!orgId) {
      return NextResponse.json(
        {
          error: 'No organization selected. Please select or create an organization.',
        },
        { status: 400 }
      );
    }

    // Fetch usage stats for the organization
    const usageStats = await getUsageStats(orgId);

    // Return usage data
    return NextResponse.json({
      success: true,
      data: {
        usage: {
          ai_prompts: {
            current: usageStats.ai_prompts.current,
            limit: usageStats.ai_prompts.limit,
            percentage:
              usageStats.ai_prompts.limit === -1
                ? 0
                : Math.round((usageStats.ai_prompts.current / usageStats.ai_prompts.limit) * 100),
          },
          cards: {
            current: usageStats.cards.current,
            limit: usageStats.cards.limit,
            percentage:
              usageStats.cards.limit === -1
                ? 0
                : Math.round((usageStats.cards.current / usageStats.cards.limit) * 100),
          },
          boards: {
            current: usageStats.boards.current,
            limit: usageStats.boards.limit,
            percentage:
              usageStats.boards.limit === -1
                ? 0
                : Math.round((usageStats.boards.current / usageStats.boards.limit) * 100),
          },
        },
        planTier: usageStats.planTier,
        organizationId: orgId,
      },
    });
  } catch (error: any) {
    console.error('Error fetching usage stats:', error);

    return NextResponse.json(
      {
        error: error?.message || 'Failed to fetch usage stats',
        success: false,
      },
      { status: 500 }
    );
  }
}
