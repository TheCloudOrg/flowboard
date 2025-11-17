# Clerk Webhook Setup Guide

## What Are Webhooks?

Webhooks automatically sync data between Clerk (authentication) and Supabase (database). When someone:
- Signs up → Creates user in Supabase
- Updates profile → Updates user in Supabase
- Creates organization → Creates organization in Supabase
- Joins team → Adds to organization_members table

This happens automatically in the background!

---

## Step-by-Step Setup

### Step 1: Get Supabase Service Role Key

The service role key bypasses Row Level Security, allowing the webhook to create/update data on behalf of users.

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: `project-management-app`
3. Click **Settings** → **API**
4. Find the **Secret key** (starts with `sb_secret_...`)
   - **IMPORTANT**: This is different from the Publishable key!
   - This key has full admin access - never expose it in client code
5. Copy the Secret key

### Step 2: Add Keys to .env.local

Add these two new environment variables to your `.env.local` file:

```env
# Supabase Service Role Key (keep secret!)
SUPABASE_SERVICE_ROLE_KEY=sb_secret_your-actual-secret-key

# Clerk Webhook Secret (we'll get this in Step 4)
CLERK_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

**Do NOT commit `.env.local` to git!** (It's already in .gitignore)

### Step 3: Deploy Webhook Endpoint (Local Testing)

For local development, we need to expose your localhost to the internet so Clerk can send webhooks.

**Option A: Using ngrok (Recommended)**

1. Install ngrok: [https://ngrok.com/download](https://ngrok.com/download)
2. Run your dev server:
   ```bash
   npm run dev
   ```
3. In a new terminal, expose port 3000:
   ```bash
   ngrok http 3000
   ```
4. Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`)

**Option B: Using Vercel Preview Deployment**

1. Push your code to GitHub
2. Deploy to Vercel (connects automatically if you've set it up)
3. Use your Vercel preview URL

### Step 4: Configure Webhook in Clerk

1. Go to [Clerk Dashboard](https://dashboard.clerk.com/)
2. Select your application
3. Click **Webhooks** in the left sidebar
4. Click **+ Add Endpoint**
5. Configure:
   - **Endpoint URL**: `https://your-ngrok-url.ngrok.io/api/webhooks/clerk`
     - Or: `https://your-vercel-app.vercel.app/api/webhooks/clerk`
   - **Subscribe to events**: Select these:
     - ✅ `user.created`
     - ✅ `user.updated`
     - ✅ `user.deleted`
     - ✅ `organization.created`
     - ✅ `organization.updated`
     - ✅ `organization.deleted`
     - ✅ `organizationMembership.created`
     - ✅ `organizationMembership.deleted`
6. Click **Create**
7. Copy the **Signing Secret** (starts with `whsec_...`)
8. Add it to `.env.local`:
   ```env
   CLERK_WEBHOOK_SECRET=whsec_your-actual-signing-secret
   ```

### Step 5: Restart Dev Server

Restart your development server to load the new environment variables:

```bash
# Stop the server (Ctrl+C)
npm run dev
```

---

## Testing the Webhook

### Test 1: Create a New User

1. Sign out of your app (if signed in)
2. Sign up with a new email address
3. Check Supabase **Table Editor** → `users` table
4. You should see the new user automatically created!

### Test 2: Update Your Profile

1. Click your user avatar → **Manage account**
2. Update your name or profile picture
3. Check Supabase **Table Editor** → `users` table
4. The user should be updated!

### Test 3: Create an Organization

1. In Clerk dashboard or your app's org switcher (if implemented)
2. Create a new organization
3. Check Supabase tables:
   - `organizations` table → New org appears
   - `organization_members` table → You're added as admin

---

## Verifying Webhook Logs

### In Clerk Dashboard

1. Go to **Webhooks** → Your endpoint
2. Click **Logs** tab
3. You should see:
   - ✅ `200` status codes (success)
   - ❌ `400`/`500` status codes (errors - check logs below)

### In Your Terminal

When webhooks fire, you'll see console logs:

```
✅ User created in Supabase: user_xxxxx
✅ Organization created in Supabase: org_xxxxx
✅ Organization membership created: org_xxxxx user_xxxxx
```

If you see errors, check:
- Is `SUPABASE_SERVICE_ROLE_KEY` correct in `.env.local`?
- Is `CLERK_WEBHOOK_SECRET` correct?
- Did you restart the dev server after adding keys?

---

## Production Deployment

When deploying to production (Vercel, Railway, etc.):

### 1. Add Environment Variables

Add these to your hosting platform:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `CLERK_WEBHOOK_SECRET`
- `OPENAI_API_KEY` (if using AI features)

### 2. Update Clerk Webhook URL

1. Go to Clerk Dashboard → **Webhooks**
2. Click your webhook endpoint
3. Update **Endpoint URL** to production:
   - `https://your-domain.com/api/webhooks/clerk`
   - Or: `https://your-app.vercel.app/api/webhooks/clerk`
4. Save changes

### 3. Test in Production

- Sign up with a new account in production
- Verify user appears in Supabase
- Check Clerk webhook logs for successful deliveries

---

## Troubleshooting

### Webhook returns 400 error
**Problem**: Webhook signature verification failed

**Solutions**:
- Verify `CLERK_WEBHOOK_SECRET` in `.env.local` matches Clerk dashboard
- Make sure you restarted the dev server after adding the secret
- Check you're using the correct signing secret (not API keys)

### Webhook returns 500 error
**Problem**: Error creating/updating data in Supabase

**Solutions**:
- Check `SUPABASE_SERVICE_ROLE_KEY` is correct (should start with `sb_secret_`)
- Verify Supabase tables exist (run migration if not)
- Check terminal logs for specific error messages
- Ensure Supabase project URL is correct

### User created in Clerk but not in Supabase
**Problem**: Webhook not firing or failing silently

**Solutions**:
- Check Clerk Dashboard → Webhooks → Logs for delivery status
- Verify webhook URL is correct (should end with `/api/webhooks/clerk`)
- For ngrok: Make sure ngrok is running and URL is up to date
- Check webhook events are subscribed (user.created, etc.)

### "Missing signing secret" error
**Problem**: `CLERK_WEBHOOK_SECRET` not set

**Solutions**:
- Add `CLERK_WEBHOOK_SECRET=whsec_...` to `.env.local`
- Restart dev server
- Get secret from Clerk Dashboard → Webhooks → Your endpoint

---

## Next Steps

Once webhooks are working:
- ✅ Users automatically sync to Supabase
- ✅ Organizations automatically sync
- ✅ Team memberships automatically sync

**Ready for Phase 3**: Migrating localStorage data to Supabase!
