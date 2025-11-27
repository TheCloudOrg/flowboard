'use server';

import { currentUser } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

// Use service role key to bypass RLS
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
 * Ensures the current Clerk user exists in Supabase
 * This is a fallback for when webhooks don't work (local development)
 *
 * @returns boolean - true if user exists or was created successfully
 */
export async function ensureUserExists(): Promise<boolean> {
  try {
    const user = await currentUser();

    if (!user) {
      console.log('[SyncUser] No authenticated user found');
      return false;
    }

    // Check if user already exists in Supabase
    const { data: existingUser, error: fetchError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('id', user.id)
      .single();

    if (existingUser) {
      console.log('[SyncUser] ✅ User already exists:', user.id);
      return true;
    }

    // If not found error (PGRST116), create the user
    if (fetchError && fetchError.code === 'PGRST116') {
      console.log('[SyncUser] Creating new user in Supabase:', user.id);

      const { error: insertError } = await supabaseAdmin.from('users').insert({
        id: user.id,
        email: user.emailAddresses[0]?.emailAddress || null,
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || null,
        avatar_url: user.imageUrl || null,
      });

      if (insertError) {
        // Ignore duplicate key errors (race condition with webhook)
        if (insertError.code === '23505') {
          console.log('[SyncUser] ✅ User exists (race condition):', user.id);
          return true;
        }

        console.error('[SyncUser] ❌ Error creating user:', insertError);
        return false;
      }

      console.log('[SyncUser] ✅ User created successfully:', user.id);
      return true;
    }

    // Some other error occurred
    console.error('[SyncUser] ❌ Error checking user:', fetchError);
    return false;
  } catch (error) {
    console.error('[SyncUser] ❌ Unexpected error:', error);
    return false;
  }
}

/**
 * Ensures the user has access to an organization
 * Creates a personal organization if the user has none
 *
 * @returns string | null - organization ID or null if failed
 */
export async function ensureUserHasOrganization(): Promise<string | null> {
  try {
    const user = await currentUser();

    if (!user) {
      return null;
    }

    // Check if user has any organization memberships
    const { data: memberships } = await supabaseAdmin
      .from('organization_members')
      .select('organization_id')
      .eq('user_id', user.id)
      .limit(1);

    if (memberships && memberships.length > 0) {
      console.log('[SyncUser] ✅ User has organization:', memberships[0].organization_id);
      return memberships[0].organization_id;
    }

    // Check if user has a personal organization in Clerk
    // For now, we'll just return null and let the user create one through Clerk
    console.log('[SyncUser] ℹ️ User has no organization');
    return null;
  } catch (error) {
    console.error('[SyncUser] ❌ Error checking organization:', error);
    return null;
  }
}
