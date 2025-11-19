# Phase 3: Data Migration & Component Updates

## Overview

This phase migrates the Kanban board from localStorage to Supabase while maintaining the exact same UI/UX and drag-and-drop functionality.

## Current Structure (localStorage)

### Data Model

```typescript
interface Board {
  columns: Column[]; // Array of columns
  cards: { [id: string]: Card }; // Dictionary of cards
}

interface Column {
  id: string; // 'todo', 'column-{timestamp}-{random}'
  title: string;
  cardIds: string[]; // Ordered array of card IDs
  color?: string;
}

interface Card {
  id: string; // 'card-{timestamp}-{random}'
  title: string;
  description?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
```

### Operations

- All operations (add, update, delete, move, reorder) use localStorage
- Board state stored as single JSON object
- Column order = array order in `columns`
- Card order = array order in `cardIds`

## Target Structure (Supabase)

### Data Model

```sql
boards (
  id UUID PRIMARY KEY
  organization_id TEXT FK
  name TEXT
  created_by TEXT FK
)

columns (
  id UUID PRIMARY KEY
  board_id UUID FK
  title TEXT
  color TEXT
  position INTEGER UNIQUE per board
)

cards (
  id UUID PRIMARY KEY
  board_id UUID FK
  column_id UUID FK
  title TEXT
  description TEXT
  notes TEXT
  position INTEGER UNIQUE per column
)
```

### Key Differences

- UUIDs instead of string IDs
- Explicit position fields instead of array order
- Board belongs to organization
- Normalized structure (no nested objects)

## Migration Strategy

### Step 1: Read localStorage

- Get current board from localStorage
- If no board exists, skip migration (fresh user)

### Step 2: Get Organization Context

- Get user's organization ID from Clerk
- If user has no organization, create personal workspace (optional)

### Step 3: Create Board

- Insert board into Supabase
- Name: "Main Board" (or "Migrated Board")
- Associate with organization

### Step 4: Migrate Columns

- For each column in `board.columns`:
  - Insert into Supabase columns table
  - Set position = array index
  - Store UUID mapping: `localStorage_id → supabase_uuid`

### Step 5: Migrate Cards

- For each card in `board.cards`:
  - Find which column it belongs to via `column.cardIds`
  - Insert into Supabase cards table
  - Set position = index in `cardIds` array
  - Set column_id = mapped UUID from Step 4

### Step 6: Verify Migration

- Fetch board from Supabase
- Compare count of columns and cards
- Log success message

### Step 7: Clean Up (Optional)

- Keep localStorage as backup initially
- Add flag: `localStorage.setItem('migrated', 'true')`
- Later: prompt user to clear localStorage

## Implementation Plan

### File 1: lib/supabase/boards.ts

**Purpose**: Supabase operations that mirror localStorage API

```typescript
export async function getBoard(organizationId: string): Promise<Board>;
export async function addCard(
  boardId: string,
  columnId: string,
  card: Partial<Card>
): Promise<Card>;
export async function updateCard(cardId: string, updates: Partial<Card>): Promise<Card>;
export async function deleteCard(cardId: string): Promise<void>;
export async function addColumn(boardId: string, title: string, color?: string): Promise<Column>;
export async function deleteColumn(columnId: string): Promise<void>;
export async function moveCard(
  cardId: string,
  newColumnId: string,
  newPosition: number
): Promise<void>;
export async function reorderCard(cardId: string, newPosition: number): Promise<void>;
```

### File 2: lib/migration/migrateToSupabase.ts

**Purpose**: One-time migration utility

```typescript
export async function migrateLocalStorageToSupabase(organizationId: string): Promise<{
  success: boolean;
  boardId?: string;
  stats?: { columns: number; cards: number };
  error?: string;
}>;
```

### File 3: components/KanbanBoard.tsx (UPDATE)

**Changes**:

- Replace localStorage imports with Supabase functions
- Add organization context (from Clerk)
- Load board from Supabase instead of localStorage
- Update all operations to use Supabase
- Keep drag-and-drop logic identical

## Position Management

### Column Positions

- Sequential integers: 0, 1, 2, 3...
- When adding column: position = MAX(position) + 1
- When deleting column: no need to update other positions
- When reordering columns (future): update multiple positions

### Card Positions

- Sequential integers per column: 0, 1, 2, 3...
- When adding card: position = MAX(position in column) + 1
- When moving card between columns:
  1. Remove from source column (delete)
  2. Insert into destination column at new position
  3. Update positions of affected cards in destination
- When reordering within column:
  1. Update positions of all cards between old and new position

### Position Update Queries

```sql
-- Inserting card at position 2 in column
UPDATE cards
SET position = position + 1
WHERE column_id = $1 AND position >= 2;

INSERT INTO cards (column_id, position, ...)
VALUES ($1, 2, ...);
```

## Edge Cases

### No localStorage Data

- User is new or already using Supabase
- Create default board with 3 columns (TODO, In Progress, Completed)
- Same as current DEFAULT_BOARD behavior

### Multiple Organizations

- Migrate to user's current active organization
- Later: add UI to switch organizations

### Migration Failures

- Wrap in try-catch
- If fails, fall back to localStorage
- Show error message to user
- Keep localStorage data intact

### Concurrent Migrations

- Check if board already exists for organization
- If exists, ask user: "Replace?" or "Keep both?"

## Testing Checklist

- [ ] Migration creates board with correct name
- [ ] All columns migrated with correct positions
- [ ] All cards migrated with correct positions
- [ ] Column colors preserved
- [ ] Card titles, descriptions, notes preserved
- [ ] Card timestamps preserved
- [ ] Drag-and-drop still works
- [ ] Add card works
- [ ] Edit card works
- [ ] Delete card works
- [ ] Add column works
- [ ] Delete column works
- [ ] AI prompt generation still works
- [ ] Theme toggle still works
- [ ] No console errors

## Rollback Plan

If migration fails:

1. Keep localStorage intact
2. Add feature flag to switch between localStorage and Supabase
3. User can continue using localStorage mode
4. Debug and retry migration

## Success Metrics

- Migration completes in < 5 seconds for typical board (10 columns, 50 cards)
- Zero data loss (all cards and columns preserved)
- UI remains responsive during migration
- No changes to user workflow
