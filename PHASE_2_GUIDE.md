# Phase 2: Database Setup Guide

## What We're Building

In Phase 2, we're migrating from localStorage to a real PostgreSQL database (Supabase). This enables:

- **Multi-user collaboration**: Teams can work on the same boards
- **Organization workspaces**: Separate data for different teams
- **Real-time updates**: Changes sync instantly across users
- **Data persistence**: No more losing data when clearing browser cache

## Files Created

### 1. [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md)

Complete documentation of:

- All database tables (users, organizations, boards, columns, cards)
- Relationships between tables
- Row Level Security (RLS) policies
- Authentication flow with Clerk

### 2. [supabase/migrations/001_initial_schema.sql](supabase/migrations/001_initial_schema.sql)

SQL script to create:

- 6 tables with proper indexes
- Automatic timestamp updates
- Row Level Security policies
- User permissions

---

## Step-by-Step: Run Database Migration

### Step 1: Open Supabase SQL Editor

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: `project-management-app`
3. Click **SQL Editor** in the left sidebar
4. Click **New Query**

### Step 2: Copy and Run the Migration

**IMPORTANT: Use the simplified version first**

1. Open [supabase/migrations/001_initial_schema_simplified.sql](supabase/migrations/001_initial_schema_simplified.sql)
2. Copy the **entire file contents**
3. Paste into Supabase SQL Editor
4. Click **Run** (or press Cmd/Ctrl + Enter)

**Expected result:** You should see "Success. No rows returned" (this is normal!)

**Why simplified?** The full version with RLS policies requires Clerk JWT integration first. We'll add security policies in the next step after configuring authentication properly.

### Step 3: Verify Tables Were Created

1. Click **Table Editor** in the left sidebar
2. You should see 6 new tables:
   - `users`
   - `organizations`
   - `organization_members`
   - `boards`
   - `columns`
   - `cards`

3. Click on any table to see its structure
4. Verify all 6 tables are present with their columns

**Note:** RLS (Row Level Security) is disabled for now. We'll enable it after setting up Clerk JWT integration in the next steps.

---

## What Happens Next

Once you confirm the tables are created, I'll help you:

1. **Create Supabase Client Utility** - Helper functions to interact with the database
2. **Generate TypeScript Types** - Auto-generate types from your schema
3. **Sync Clerk Users** - Set up webhooks to sync user/org data
4. **Migrate localStorage Data** - Move existing boards/cards to database
5. **Update Components** - Replace localStorage calls with Supabase queries

---

## Understanding the Schema

### Data Hierarchy

```
Organization (your team)
  └── Board (e.g., "Q4 Projects")
      ├── Column (e.g., "To Do", "In Progress", "Done")
      │   └── Card (e.g., "Build login page")
      │   └── Card (e.g., "Add dark mode")
      └── Column (e.g., "In Review")
          └── Card (e.g., "Test authentication")
```

### How Organizations Work

- When you signed up with Clerk, you created an organization
- This organization will be synced to Supabase
- All your boards belong to that organization
- You can invite teammates to join your organization
- Each organization's data is completely separate (RLS ensures this)

### Row Level Security (RLS)

RLS is like a security guard for your database:

- Users can ONLY see data from organizations they belong to
- Even if someone knows a board's ID, they can't access it unless they're in that organization
- This happens automatically at the database level

---

## Troubleshooting

### "Success. No rows returned" after running migration

✅ **This is correct!** The migration creates tables/triggers but doesn't insert data.

### "operator does not exist: uuid = text" error

❌ You ran the full version with RLS policies. Use the **simplified version** instead:

- File: [001_initial_schema_simplified.sql](supabase/migrations/001_initial_schema_simplified.sql)
- This version skips RLS policies which require Clerk JWT setup first

### Can't see tables in Table Editor

❌ Try refreshing the page. If still not visible, re-run the migration script.

### "relation already exists" error

⚠️ You've already run the migration. To start fresh:

1. Go to **Table Editor**
2. Delete all 6 tables (cards, columns, boards, organization_members, organizations, users)
3. Re-run the migration script

---

## Ready for Next Steps?

Once you've confirmed the tables are created in Supabase, let me know and we'll continue with:

- Creating the Supabase client utility
- Generating TypeScript types
- Setting up Clerk webhooks to sync users/organizations

**Don't worry about filling the tables with data yet - we'll automate that!**
