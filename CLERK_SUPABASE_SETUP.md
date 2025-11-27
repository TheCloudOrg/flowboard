# Clerk + Supabase JWT Integration Setup

## Overview

This guide configures Clerk to issue JWT tokens that Supabase can validate, enabling Row Level Security (RLS) policies to recognize authenticated users.

## Step 1: Create Supabase JWT Template in Clerk

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Select your application: **brief-alien-10**
3. Navigate to: **Configure → JWT Templates**
4. Click **New template** → Choose **Supabase**
5. Name it: `supabase`

### Template Configuration

**Claims Configuration:**

```json
{
  "aud": "authenticated",
  "exp": "{{session.expire_at}}",
  "iat": "{{session.created_at}}",
  "iss": "https://brief-alien-10.clerk.accounts.dev",
  "sub": "{{user.id}}",
  "email": "{{user.primary_email_address}}",
  "role": "authenticated",
  "app_metadata": {},
  "user_metadata": {}
}
```

**Important Notes:**

- The `sub` claim contains the Clerk user ID (matches `users.id` in your database)
- The `aud` and `role` claims are set to `authenticated` for regular users
- Service role access is handled separately via `SUPABASE_SERVICE_ROLE_KEY`

## Step 2: Configure Supabase to Validate Clerk JWTs

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select project: **dlyntigazsdizcgqlngh**
3. Navigate to: **Settings → API**
4. Scroll to **JWT Settings**

### JWT Settings Configuration

**JWKS URL:**

```
https://brief-alien-10.clerk.accounts.dev/.well-known/jwks.json
```

**JWT Issuer:**

```
https://brief-alien-10.clerk.accounts.dev
```

**JWT Secret:** (Leave as default - JWKS handles verification)

5. Click **Save** to apply changes

## Step 3: Verify Integration

After configuration, the following RLS policy pattern should work:

```sql
-- Example: Users can view their own profile
CREATE POLICY "Users can view their own profile"
  ON users
  FOR SELECT
  USING (id = auth.jwt() ->> 'sub');
```

Where:

- `auth.jwt()` returns the Clerk JWT claims
- `auth.jwt() ->> 'sub'` extracts the Clerk user ID
- This matches against `users.id` (TEXT column containing Clerk user ID)

## Step 4: Test the Integration

1. Log into the app at http://localhost:3000
2. Check browser console for errors
3. Verify you can see:
   - Usage stats
   - Kanban boards
   - Columns and cards
4. Check Supabase logs for RLS policy evaluation

## Troubleshooting

### Error: "JWT token is invalid"

- Verify JWKS URL is correct in Supabase
- Check JWT template name is exactly `supabase` in Clerk
- Ensure JWT issuer matches Clerk domain

### Error: "row-level security policy violation"

- Check user is logged in via Clerk
- Verify `auth.jwt() ->> 'sub'` returns the user ID
- Confirm user exists in `users` table
- Check organization membership in `organization_members` table

### Error: "Failed to create board"

- Verify organization exists in `organizations` table
- Check user is member of organization in `organization_members` table
- Confirm RLS policies allow INSERT for organization members

## Technical Details

### How It Works

1. **Client Login**: User logs in via Clerk
2. **JWT Generation**: Clerk generates JWT with user claims
3. **Token Passing**: Server client calls `getToken({ template: 'supabase' })`
4. **Request Authorization**: Token passed as `Authorization: Bearer <token>` header
5. **Supabase Validation**: Supabase validates JWT using Clerk's JWKS
6. **RLS Evaluation**: Policies use `auth.jwt() ->> 'sub'` to check permissions

### Files Modified

- `lib/supabase/server.ts` - Server client with Clerk JWT integration
- `lib/supabase/client.ts` - Browser client with JWT support (for future use)

### Environment Variables Required

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_YnJpZWYtYWxpZW4tMTAuY2xlcmsuYWNjb3VudHMuZGV2JA
CLERK_SECRET_KEY=sk_test_V8hX7bygjF7axSJmmLJ8T3uA9g9qngu58ClNzyDMMs
NEXT_PUBLIC_SUPABASE_URL=https://dlyntigazsdizcgqlngh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_xd3al9NrFRN9Q6P3Ecy5Pw_lq-AlgsA
SUPABASE_SERVICE_ROLE_KEY=sb_secret_NFN-LIovqB1dJcg0WnrJhA_n0CX14Mu
```

## Next Steps

After completing this setup:

1. Restart the development server
2. Test all critical user flows
3. Verify RLS policies are working correctly
4. Deploy to production with same configuration
