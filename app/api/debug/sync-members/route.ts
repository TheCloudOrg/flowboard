import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { clerkClient } from '@clerk/nextjs/server';

// Use service role key for admin operations (bypasses RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// Allow both GET and POST for easy testing
export async function GET() {
  return syncMembers();
}

export async function POST() {
  return syncMembers();
}

async function syncMembers() {
  try {
    const { userId, orgId } = await auth();

    if (!userId) {
      return Response.json({ error: 'Not authenticated' }, { status: 401 });
    }

    if (!orgId) {
      return Response.json({ error: 'No organization selected' }, { status: 400 });
    }

    const clerk = await clerkClient();

    // Get all members from Clerk
    const clerkMembers = await clerk.organizations.getOrganizationMembershipList({
      organizationId: orgId,
    });

    // Get existing members from Supabase
    const { data: existingMembers } = await supabaseAdmin
      .from('organization_members')
      .select('user_id')
      .eq('organization_id', orgId);

    const existingUserIds = new Set(existingMembers?.map((m) => m.user_id) || []);

    // Find missing members
    const missingMembers = clerkMembers.data.filter(
      (m: any) => m.publicUserData && !existingUserIds.has(m.publicUserData.userId)
    );

    // Sync missing members
    const syncedMembers = [];
    const errors = [];

    for (const member of missingMembers) {
      // Skip if publicUserData is null/undefined
      if (!member.publicUserData) {
        continue;
      }

      const memberId = member.publicUserData.userId;

      // First, ensure the user exists in Supabase
      const { error: userError } = await supabaseAdmin.from('users').upsert(
        {
          id: memberId,
          email: member.publicUserData.identifier || '',
          name: member.publicUserData.firstName
            ? `${member.publicUserData.firstName} ${member.publicUserData.lastName || ''}`.trim()
            : null,
          avatar_url: member.publicUserData.imageUrl || null,
        },
        { onConflict: 'id', ignoreDuplicates: false }
      );

      if (userError && userError.code !== '23505') {
        console.error('Error syncing user:', memberId, userError);
        errors.push({ userId: memberId, error: userError.message });
        continue;
      }

      // Then add to organization_members
      const { error: memberError } = await supabaseAdmin.from('organization_members').insert({
        organization_id: orgId,
        user_id: memberId,
        role: member.role === 'org:admin' ? 'admin' : 'member',
      });

      if (memberError && memberError.code !== '23505') {
        console.error('Error syncing organization member:', memberId, memberError);
        errors.push({ userId: memberId, error: memberError.message });
        continue;
      }

      syncedMembers.push({
        userId: memberId,
        email: member.publicUserData.identifier,
        role: member.role,
      });
    }

    return Response.json({
      success: true,
      organizationId: orgId,
      clerkMemberCount: clerkMembers.totalCount,
      existingMemberCount: existingMembers?.length || 0,
      syncedCount: syncedMembers.length,
      syncedMembers,
      errors,
    });
  } catch (error: any) {
    console.error('Sync members error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
