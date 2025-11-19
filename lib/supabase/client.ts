import { createBrowserClient } from '@supabase/ssr';
import { Database } from './types';

/**
 * Supabase Client for Client Components
 *
 * Use this in React Client Components (components with 'use client')
 * This client uses the public anon key and runs in the browser
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
