import { ensureUserAndOrgSync } from '@/lib/auto-sync';

/**
 * Auto-sync endpoint
 * Called automatically on login to ensure user and org membership exists in Supabase
 * This is a safety net in case Clerk webhooks fail
 */
export async function POST(req: Request) {
  try {
    const { userId, orgId } = await req.json();

    if (!userId || !orgId) {
      return Response.json({ error: 'Missing userId or orgId' }, { status: 400 });
    }

    const result = await ensureUserAndOrgSync(userId, orgId);

    if (!result.success) {
      console.error('Auto-sync failed:', result.error);
      // Don't return error to user - let them continue even if sync fails
      // The RLS policies will handle access control
    }

    return Response.json({ success: true });
  } catch (error: any) {
    console.error('Auto-sync error:', error);
    // Don't return error to user - let them continue even if sync fails
    return Response.json({ success: true });
  }
}
