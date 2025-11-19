# Phase 3 Testing Guide

## What Changed

Phase 3 migrates all data from localStorage to Supabase while maintaining the exact same UI/UX.

## Migration Process

When you first load the app after Phase 3:

1. **Automatic Detection**: The app checks if you have a board in Supabase
2. **Migration**: If no board exists, it reads your localStorage data and migrates it to Supabase
3. **Default Board**: If localStorage is empty, it creates a default board with 3 columns (TODO, In Progress, Completed)

## Testing Checklist

### 1. Board Initialization

- [ ] Open the app at http://localhost:3000
- [ ] You should see a loading spinner briefly
- [ ] Check browser console for migration logs:
  ```
  ✅ Board initialized: { columns: X, cards: Y }
  ```
- [ ] Verify your columns appear correctly

### 2. Add Card

- [ ] Click the "+ Add Card" button on any column
- [ ] Fill in title, description, notes
- [ ] Click "Save"
- [ ] Card should appear in the column
- [ ] Refresh the page - card should persist

### 3. Edit Card

- [ ] Click on any card to open it
- [ ] Edit the title or description
- [ ] Click "Save"
- [ ] Changes should be visible
- [ ] Refresh the page - changes should persist

### 4. Delete Card

- [ ] Click the delete button on a card
- [ ] Confirm deletion
- [ ] Card should disappear
- [ ] Refresh the page - card should stay deleted

### 5. Drag and Drop Card

- [ ] Drag a card within the same column (reorder)
- [ ] Drop it in a new position
- [ ] Card position should update
- [ ] Drag a card to a different column
- [ ] Card should move to the new column
- [ ] Refresh the page - positions should persist

### 6. Add Column

- [ ] Click the "Add Column" button
- [ ] Enter a column name
- [ ] Click "Add"
- [ ] New column should appear
- [ ] Refresh the page - column should persist

### 7. Delete Column

- [ ] Create a test column with some cards
- [ ] Click the delete button on the column
- [ ] Confirm deletion
- [ ] Column and all its cards should disappear
- [ ] Refresh the page - column should stay deleted

### 8. AI Prompt Generation

- [ ] Create a card with title and description
- [ ] Click the AI sparkle icon
- [ ] AI prompt modal should open
- [ ] Verify AI generates a prompt (if OpenAI API key is set)

### 9. Theme Toggle

- [ ] Toggle between light and dark mode
- [ ] All UI elements should remain visible
- [ ] Preference should persist

### 10. Verify Supabase Data

- [ ] Go to Supabase Dashboard → Table Editor
- [ ] Check the `boards` table - should have 1 board for your organization
- [ ] Check the `columns` table - should match your columns with correct positions
- [ ] Check the `cards` table - should match your cards with correct positions and column associations

## Expected Behavior

### Loading State

- Brief spinner when app first loads
- "Loading your board..." message

### Data Persistence

- All changes persist immediately to Supabase
- Refreshing the page should show all changes
- No data loss between page refreshes

### Performance

- Drag and drop should feel responsive
- UI updates should happen instantly (optimistic updates during drag)
- Database sync happens in background after drag ends

## Verifying Migration

### In Browser Console

Look for these logs:

```javascript
✅ Board created: <uuid>
✅ Column migrated: TODO (X cards)
✅ Column migrated: In Progress (X cards)
✅ Column migrated: Completed (X cards)
✅ Migration complete: X columns, Y cards
✅ Board initialized: { columns: X, cards: Y }
```

### In Supabase Dashboard

**boards table:**
| id | organization_id | name | created_by |
|----|----------------|------|------------|
| uuid | org_xxx | Main Board | user_xxx |

**columns table:**
| id | board_id | title | color | position |
|----|----------|-------|-------|----------|
| uuid | board_uuid | TODO | #8b5cf6 | 0 |
| uuid | board_uuid | In Progress | #3b82f6 | 1 |
| uuid | board_uuid | Completed | #10b981 | 2 |

**cards table:**
| id | board_id | column_id | title | position |
|----|----------|-----------|-------|----------|
| uuid | board_uuid | col_uuid | My Card | 0 |
| uuid | board_uuid | col_uuid | Another Card | 1 |

## Common Issues

### Issue: "Loading your board..." never finishes

**Cause**: Not authenticated or organization not found

**Solution**:

1. Make sure you're signed in
2. Check that you have an organization created
3. Check browser console for errors

### Issue: Cards don't persist after refresh

**Cause**: Server actions failing to save to Supabase

**Solution**:

1. Check Supabase credentials in `.env.local`
2. Check browser console for error messages
3. Check server terminal for error logs

### Issue: Drag and drop not working

**Cause**: Server action failing to update positions

**Solution**:

1. Check browser console for errors
2. Try refreshing the page
3. Check that `moveCardAction` is returning success

### Issue: "Duplicate key" errors in console

**Cause**: Attempting to migrate when board already exists

**Solution**: This is expected behavior if migration already ran. The app should detect existing board and skip migration.

## Rollback Plan

If you encounter critical issues:

1. **localStorage backup**: Your original data is still in localStorage (not deleted)
2. **Check localStorage**: Open DevTools → Application → Local Storage → `kanban-board`
3. **Manual rollback**: If needed, we can add a feature flag to temporarily use localStorage mode

## Success Criteria

- [ ] All cards from localStorage migrated to Supabase
- [ ] All CRUD operations work (add, edit, delete cards and columns)
- [ ] Drag and drop works smoothly
- [ ] Data persists across page refreshes
- [ ] No console errors
- [ ] Supabase tables show correct data
- [ ] UI/UX feels identical to Phase 2

## Next Steps

Once all tests pass:

- ✅ Phase 3 complete
- Move to Phase 4: Organization Context (add organization switcher)
- Then: Launch web agents for Real-Time Collaboration and Advanced Card Metadata
