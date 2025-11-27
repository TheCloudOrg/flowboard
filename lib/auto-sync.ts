/**
 * Auto-sync organization members from Clerk to Supabase
 *
 * This ensures that even if webhooks fail, users can still access their organization's data
 * by syncing organization membership on login.
 */

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

/**
 * Ensure user and their organization membership exists in Supabase
 * Called on login to guarantee data consistency
 */
export async function ensureUserAndOrgSync(userId: string, orgId: string) {
  try {
    const clerk = await clerkClient();

    // 1. Sync the organization first
    const clerkOrg = await clerk.organizations.getOrganization({ organizationId: orgId });

    await supabaseAdmin.from('organizations').upsert(
      {
        id: clerkOrg.id,
        name: clerkOrg.name,
        slug: clerkOrg.slug!,
        created_by: clerkOrg.createdBy,
      },
      { onConflict: 'id', ignoreDuplicates: false }
    );

    // 2. Get user info from Clerk
    const clerkUser = await clerk.users.getUser(userId);

    // 3. Sync the user
    await supabaseAdmin.from('users').upsert(
      {
        id: clerkUser.id,
        email: clerkUser.emailAddresses[0]?.emailAddress || '',
        name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || null,
        avatar_url: clerkUser.imageUrl || null,
      },
      { onConflict: 'id', ignoreDuplicates: false }
    );

    // 4. Get user's role in the organization
    const membershipList = await clerk.organizations.getOrganizationMembershipList({
      organizationId: orgId,
    });

    const userMembership = membershipList.data.find((m: any) => m.publicUserData.userId === userId);

    if (!userMembership) {
      console.warn('User is not a member of this organization in Clerk:', userId, orgId);
      return { success: false, error: 'User not in organization' };
    }

    // 5. Sync the membership
    const { error: memberError } = await supabaseAdmin.from('organization_members').upsert(
      {
        organization_id: orgId,
        user_id: userId,
        role: userMembership.role === 'org:admin' ? 'admin' : 'member',
      },
      { onConflict: 'organization_id,user_id', ignoreDuplicates: false }
    );

    if (memberError && memberError.code !== '23505') {
      console.error('Error syncing organization membership:', memberError);
      return { success: false, error: memberError.message };
    }

    console.log('✅ Auto-synced user and org:', userId, orgId);
    return { success: true };
  } catch (error: any) {
    console.error('Error in ensureUserAndOrgSync:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Sync ALL members of an organization from Clerk to Supabase
 * Useful for ensuring complete data consistency
 */
export async function syncAllOrgMembers(orgId: string) {
  try {
    const clerk = await clerkClient();

    // Get all members from Clerk
    const clerkMembers = await clerk.organizations.getOrganizationMembershipList({
      organizationId: orgId,
    });

    const syncedMembers = [];
    const errors = [];

    for (const member of clerkMembers.data) {
      const memberId = member.publicUserData.userId;

      // Sync user
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
        errors.push({ userId: memberId, error: userError.message });
        continue;
      }

      // Sync membership
      const { error: memberError } = await supabaseAdmin.from('organization_members').upsert(
        {
          organization_id: orgId,
          user_id: memberId,
          role: member.role === 'org:admin' ? 'admin' : 'member',
        },
        { onConflict: 'organization_id,user_id', ignoreDuplicates: false }
      );

      if (memberError && memberError.code !== '23505') {
        errors.push({ userId: memberId, error: memberError.message });
        continue;
      }

      syncedMembers.push(memberId);
    }

    return { success: true, syncedCount: syncedMembers.length, errors };
  } catch (error: any) {
    console.error('Error in syncAllOrgMembers:', error);
    return { success: false, error: error.message };
  }
}
