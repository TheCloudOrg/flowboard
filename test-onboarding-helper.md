# Testing Onboarding Flow

## Step 1: Find Your User ID

**Option A - From Browser Console:**

1. Open the app in your browser while logged in
2. Open Developer Tools (F12 or Cmd+Option+I)
3. Go to Console tab
4. Run: `console.log(window.localStorage)`
5. Look for Clerk session data or auth tokens
6. Your user ID should be visible in the auth data

**Option B - From Supabase:**

1. Go to Supabase Dashboard
2. Open SQL Editor
3. Run: `SELECT id FROM users LIMIT 10;`
4. Find your user ID in the results

## Step 2: Reset Onboarding Status

In Supabase SQL Editor, run:

```sql
-- Replace 'YOUR_USER_ID' with your actual Clerk user ID
DELETE FROM user_onboarding WHERE user_id = 'YOUR_USER_ID';

-- Or delete all records for testing:
DELETE FROM user_onboarding;
```

## Step 3: Test the Flow

1. **Clear browser cache** (or use incognito mode)
2. **Navigate to the app** - You should be automatically redirected to `/onboarding`
3. **Complete the steps:**
   - Step 1: Welcome screen - Click "Get Started"
   - Step 2: Theme selection - Choose light or dark mode
   - Step 3: Board setup - Create your first board
   - Step 4: Completion - Should redirect to main app

## Step 4: Verify Database

After completing onboarding, check Supabase:

```sql
SELECT * FROM user_onboarding WHERE user_id = 'YOUR_USER_ID';
```

You should see:

- `completed = true`
- `current_step = 5` (final step)
- `theme_preference` set to your choice
- `first_board_created = true`
- `completed_at` timestamp

## Troubleshooting

**If you're not redirected to onboarding:**

1. Check middleware is running: Look for console logs in terminal
2. Verify you're logged in with Clerk
3. Try clearing cookies and localStorage
4. Check that the route `/onboarding` is accessible directly

**If onboarding page crashes:**

1. Check browser console for errors
2. Check terminal for server errors
3. Verify all imports are correct
4. Make sure Clerk user object is available

**If board creation fails:**

1. Check Supabase RLS policies on boards table
2. Verify user has permission to create boards
3. Check server action logs
