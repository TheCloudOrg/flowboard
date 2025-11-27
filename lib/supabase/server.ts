import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { auth } from '@clerk/nextjs/server';

/**
 * Supabase Client for Server Components & API Routes
 *
 * Use this in:
 * - Server Components (no 'use client')
 * - Server Actions
 * - API Routes
 *
 * This integrates with Clerk authentication by passing the JWT token
 */
export async function createClient() {
  const cookieStore = await cookies();

  // Get Clerk session token for Supabase authentication
  let supabaseAccessToken: string | null = null;

  try {
    const { getToken } = await auth();
    supabaseAccessToken = await getToken({ template: 'supabase' });
  } catch (error: any) {
    // JWT template not configured in Clerk
    if (error.code === 'api_response_error' && error.status === 404) {
      console.error(
        '\n⚠️  CLERK JWT TEMPLATE NOT CONFIGURED\n' +
          'Please create a "supabase" JWT template in Clerk Dashboard.\n' +
          'See CLERK_SUPABASE_SETUP.md for instructions.\n'
      );
    } else {
      console.error('Error getting Clerk token:', error);
    }
  }

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          Authorization: supabaseAccessToken ? `Bearer ${supabaseAccessToken}` : '',
        },
      },
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
}
