import { createBrowserClient } from '@supabase/ssr';
import { Database } from './types';

/**
 * Supabase Client for Client Components
 *
 * Use this in React Client Components (components with 'use client')
 * This client integrates with Clerk authentication by passing the JWT token
 */
export function createClient(supabaseAccessToken?: string) {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          Authorization: supabaseAccessToken ? `Bearer ${supabaseAccessToken}` : '',
        },
      },
    }
  );
}
