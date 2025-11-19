# Database Schema Design

## Overview

This schema supports a multi-tenant Kanban board application with:

- **Organizations**: Team workspaces (synced from Clerk)
- **Boards**: Multiple boards per organization
- **Columns**: Customizable columns per board
- **Cards**: Tasks/items within columns
- **User Access**: Row Level Security ensuring users only see their organization's data

## Tables

### 1. users

Stores user information synced from Clerk authentication.

```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,                    -- Clerk user ID
  email TEXT NOT NULL,
  name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Indexes:**

- Primary key on `id`
- Index on `email` for lookups

---

### 2. organizations

Stores organization/team information synced from Clerk.

```sql
CREATE TABLE organizations (
  id TEXT PRIMARY KEY,                    -- Clerk organization ID
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_by TEXT REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Indexes:**

- Primary key on `id`
- Unique index on `slug`

---

### 3. organization_members

Maps users to organizations (many-to-many relationship).

```sql
CREATE TABLE organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member',   -- 'admin', 'member'
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, user_id)
);
```

**Indexes:**

- Primary key on `id`
- Index on `organization_id` for filtering by org
- Index on `user_id` for filtering by user
- Unique constraint on `(organization_id, user_id)` to prevent duplicates

---

### 4. boards

Each organization can have multiple boards.

```sql
CREATE TABLE boards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'My Board',
  description TEXT,
  created_by TEXT REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Indexes:**

- Primary key on `id`
- Index on `organization_id` for filtering boards by org

---

### 5. columns

Columns belong to a board and contain cards.

```sql
CREATE TABLE columns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#8b5cf6',
  position INTEGER NOT NULL,              -- For ordering columns
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(board_id, position)
);
```

**Indexes:**

- Primary key on `id`
- Index on `board_id` for filtering columns by board
- Index on `(board_id, position)` for ordering

---

### 6. cards

Cards belong to a column and represent tasks/items.

```sql
CREATE TABLE cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  column_id UUID NOT NULL REFERENCES columns(id) ON DELETE CASCADE,
  board_id UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  notes TEXT,
  position INTEGER NOT NULL,              -- For ordering cards within column
  created_by TEXT REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(column_id, position)
);
```

**Indexes:**

- Primary key on `id`
- Index on `column_id` for filtering cards by column
- Index on `board_id` for filtering cards by board
- Index on `(column_id, position)` for ordering

---

## Row Level Security (RLS) Policies

RLS ensures users can only access data from organizations they belong to.

### Enable RLS on all tables

```sql
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE columns ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
```

### Policy: Users can see their own data

```sql
CREATE POLICY "Users can view own data"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON users FOR UPDATE
  USING (auth.uid() = id);
```

### Policy: Organization members can access organization data

```sql
-- Users can view organizations they belong to
CREATE POLICY "Users can view their organizations"
  ON organizations FOR SELECT
  USING (
    id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
    )
  );

-- Users can view organization members of orgs they belong to
CREATE POLICY "Users can view members of their organizations"
  ON organization_members FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
    )
  );
```

### Policy: Board access based on organization membership

```sql
-- Users can view boards in their organizations
CREATE POLICY "Users can view boards in their organizations"
  ON boards FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
    )
  );

-- Users can create boards in their organizations
CREATE POLICY "Users can create boards in their organizations"
  ON boards FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
    )
  );

-- Users can update boards in their organizations
CREATE POLICY "Users can update boards in their organizations"
  ON boards FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
    )
  );

-- Users can delete boards in their organizations
CREATE POLICY "Users can delete boards in their organizations"
  ON boards FOR DELETE
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
    )
  );
```

### Policy: Column and card access inherits from board access

```sql
-- Columns
CREATE POLICY "Users can view columns in their boards"
  ON columns FOR SELECT
  USING (
    board_id IN (
      SELECT id FROM boards
      WHERE organization_id IN (
        SELECT organization_id FROM organization_members
        WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can manage columns in their boards"
  ON columns FOR ALL
  USING (
    board_id IN (
      SELECT id FROM boards
      WHERE organization_id IN (
        SELECT organization_id FROM organization_members
        WHERE user_id = auth.uid()
      )
    )
  );

-- Cards
CREATE POLICY "Users can view cards in their boards"
  ON cards FOR SELECT
  USING (
    board_id IN (
      SELECT id FROM boards
      WHERE organization_id IN (
        SELECT organization_id FROM organization_members
        WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can manage cards in their boards"
  ON cards FOR ALL
  USING (
    board_id IN (
      SELECT id FROM boards
      WHERE organization_id IN (
        SELECT organization_id FROM organization_members
        WHERE user_id = auth.uid()
      )
    )
  );
```

---

## Helper Functions

### Update timestamp trigger

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_boards_updated_at BEFORE UPDATE ON boards
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_columns_updated_at BEFORE UPDATE ON columns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cards_updated_at BEFORE UPDATE ON cards
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

## Relationships

```
organizations
  ├─ organization_members (many users per org)
  └─ boards (many boards per org)
      ├─ columns (many columns per board)
      └─ cards (many cards per board)
          └─ column_id (cards belong to a column)

users
  ├─ organization_members (user can be in many orgs)
  ├─ boards.created_by
  └─ cards.created_by
```

---

## Migration from localStorage

When migrating from localStorage to Supabase:

1. User signs in with Clerk
2. Get or create user's default organization
3. Create a default board for that organization
4. Migrate localStorage columns → database columns
5. Migrate localStorage cards → database cards
6. Clear localStorage after successful migration

---

## Authentication Flow (Clerk + Supabase)

### Option 1: JWT-based RLS (Recommended)

- Clerk provides JWT tokens
- Configure Supabase to accept Clerk JWTs
- Use `auth.uid()` in RLS policies (points to Clerk user ID)

### Option 2: Webhook-based sync

- Set up Clerk webhooks to sync user/org data to Supabase
- When user signs up: Create user in `users` table
- When org created: Create org in `organizations` table
- When user joins org: Add to `organization_members`

**We'll use Option 2 (webhook sync) as it's more explicit and easier to debug.**

---

## Next Steps

1. Create these tables in Supabase SQL Editor
2. Set up RLS policies
3. Create Supabase client utility in Next.js
4. Generate TypeScript types from schema
5. Build data migration tool from localStorage
