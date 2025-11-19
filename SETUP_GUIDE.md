# Backend Infrastructure & Authentication Setup Guide

## ✅ Phase 1 Complete: Authentication Setup

The following has been implemented:

### Installed Packages

- `@clerk/nextjs` - Authentication with Organizations support
- `@supabase/supabase-js` - Supabase client
- `@supabase/ssr` - Supabase SSR utilities for Next.js

### Files Created/Modified

1. **app/layout.tsx** - Wrapped with `ClerkProvider`
2. **middleware.ts** - Authentication middleware protecting routes
3. **app/sign-in/[[...sign-in]]/page.tsx** - Sign-in page
4. **app/sign-up/[[...sign-up]]/page.tsx** - Sign-up page
5. **.env.local.example** - Environment variables template

## 📋 Next Steps: Get Your API Keys

### Step 1: Create Clerk Account

1. Go to [https://dashboard.clerk.com/sign-up](https://dashboard.clerk.com/sign-up)
2. Create a new application (choose "Next.js" as framework)
3. Copy your API keys:
   - **Publishable Key**: `pk_test_...`
   - **Secret Key**: `sk_test_...`

### Step 2: Create Supabase Project

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Choose:
   - **Project name**: `project-management-app`
   - **Database password**: (save this securely!)
   - **Region**: Choose closest to your users
4. Wait 2-3 minutes for project creation
5. Go to **Settings → API** (or click avatar → Command menu → Get API Keys)
6. Copy your keys:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **Publishable key**: `sb_publishable_...` (NEW format as of 2025)
   - Note: Legacy "anon" key still works but use the new Publishable key for future compatibility

### Step 3: Configure Environment Variables

1. Copy `.env.local.example` to `.env.local`:

   ```bash
   cp .env.local.example .env.local
   ```

2. Edit `.env.local` and add your keys:

   ```env
   # Keep your existing OpenAI key
   OPENAI_API_KEY=sk-your-actual-key

   # Add Clerk keys
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your-actual-key
   CLERK_SECRET_KEY=sk_test_your-actual-key

   # Add Supabase keys (use NEW Publishable key format from 2025)
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_your-actual-key
   ```

3. **IMPORTANT**: Add `.env.local` to `.gitignore` (already done)

### Step 4: Configure Clerk Settings

1. In Clerk Dashboard → **Configure → Paths**:
   - Sign-in URL: `/sign-in`
   - Sign-up URL: `/sign-up`
   - After sign-in URL: `/`
   - After sign-up URL: `/`

2. In Clerk Dashboard → **Configure → Social Connections**:
   - Enable **Google** (recommended)
   - Enable **GitHub** (optional)
   - Enable **Email** (required for email/password)

3. In Clerk Dashboard → **Configure → Email & SMS**:
   - Enable email verification

4. In Clerk Dashboard → **Organizations**:
   - Enable Organizations feature
   - This unlocks team workspaces!

### Step 5: Test Authentication

1. Restart your development server (if running):

   ```bash
   npm run dev
   ```

2. Visit [http://localhost:3000](http://localhost:3000)
3. You should be redirected to sign-in page
4. Create an account using:
   - **Google** (easiest)
   - **Email/password**
5. After sign-in, you should see your Kanban board

## 🎯 What's Working Now

- ✅ User authentication (sign-up, sign-in, sign-out)
- ✅ OAuth with Google/GitHub
- ✅ Protected routes (requires login)
- ✅ User session management
- ✅ Beautiful auth UI (Clerk components)

## 🚧 What's Next (Phase 2)

Once you've completed the setup above and confirmed authentication works:

1. **Database Schema Design** - Create tables for boards/columns/cards
2. **Supabase Client Setup** - Configure database connection
3. **Type Generation** - Auto-generate TypeScript types from schema
4. **Data Migration Tool** - Migrate from localStorage to database

## 🆘 Troubleshooting

### "Invalid Clerk publishable key"

- Check `.env.local` has correct `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- Restart dev server after adding keys

### "Redirect loop" or "Too many redirects"

- Check Clerk Dashboard paths are configured correctly
- Ensure middleware.ts has correct public routes

### "CORS error" with Supabase

- Verify Supabase URL is correct
- Use the **Publishable key** (sb*publishable*...) from Settings → API, NOT the secret key
- Legacy "anon" key (eyJhbGci...) still works but use Publishable key for 2025+ projects
- Ensure you're using the client-safe key, not the service_role/secret key

### Changes not reflecting

- Clear `.next` folder: `rm -rf .next`
- Restart dev server: `npm run dev`

## 📚 Documentation Links

- [Clerk Next.js Quickstart](https://clerk.com/docs/quickstarts/nextjs)
- [Clerk Organizations Guide](https://clerk.com/docs/organizations/overview)
- [Supabase Next.js Guide](https://supabase.com/docs/guides/getting-started/tutorials/with-nextjs)
- [Supabase Auth with Next.js](https://supabase.com/docs/guides/auth/server-side/nextjs)

## ✅ Completion Checklist

Before moving to Phase 2, verify:

- [ ] Clerk account created
- [ ] Supabase project created
- [ ] All environment variables in `.env.local`
- [ ] Can sign up with new account
- [ ] Can sign in with existing account
- [ ] Redirected to `/` after sign-in
- [ ] Can see Kanban board when signed in
- [ ] Can sign out successfully
- [ ] Organizations enabled in Clerk dashboard

**Once all items checked, you're ready for Phase 2!**

---

**Need help?** Check the troubleshooting section or reach out with specific error messages.
