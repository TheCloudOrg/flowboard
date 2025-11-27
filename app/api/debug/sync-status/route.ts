import { auth } from '@clerk/nextjs/server';
import { createClient } from '@/lib/supabase/server';
import { clerkClient } from '@clerk/nextjs/server';

export async function GET() {
  try {
    const { userId, orgId } = await auth();

    if (!userId) {
      return Response.json({ error: 'Not authenticated' }, { status: 401 });
    }

    if (!orgId) {
      return Response.json({ error: 'No organization selected' }, { status: 400 });
    }

    const supabase = await createClient();
    const clerk = await clerkClient();

    // Get organization from Clerk
    const clerkOrg = await clerk.organizations.getOrganization({ organizationId: orgId });
    const clerkMembers = await clerk.organizations.getOrganizationMembershipList({
      organizationId: orgId,
    });

    // Get organization from Supabase
    const { data: supabaseOrg } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', orgId)
      .single();

    // Get members from Supabase
    const { data: supabaseMembers } = await supabase
      .from('organization_members')
      .select('*')
      .eq('organization_id', orgId);

    // Get boards from Supabase
    const { data: supabaseBoards } = await supabase
      .from('boards')
      .select('*')
      .eq('organization_id', orgId);

    return Response.json({
      organizationId: orgId,
      clerk: {
        organization: clerkOrg ? { id: clerkOrg.id, name: clerkOrg.name } : null,
        memberCount: clerkMembers.totalCount,
        members: clerkMembers.data.map((m: any) => ({
          userId: m.publicUserData.userId,
          email: m.publicUserData.identifier,
          role: m.role,
        })),
      },
      supabase: {
        organization: supabaseOrg,
        memberCount: supabaseMembers?.length || 0,
        members: supabaseMembers,
        boardCount: supabaseBoards?.length || 0,
        boards: supabaseBoards,
      },
      sync: {
        organizationSynced: !!supabaseOrg,
        memberCountMatch: clerkMembers.totalCount === (supabaseMembers?.length || 0),
        missingMembers: clerkMembers.data
          .filter(
            (cm: any) => !supabaseMembers?.find((sm) => sm.user_id === cm.publicUserData.userId)
          )
          .map((m: any) => ({
            userId: m.publicUserData.userId,
            email: m.publicUserData.identifier,
          })),
      },
    });
  } catch (error: any) {
    console.error('Debug sync status error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
