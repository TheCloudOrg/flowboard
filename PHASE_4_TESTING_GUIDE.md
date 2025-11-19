# Phase 4 Testing Guide: Organization Context

## What Changed

Phase 4 adds multi-organization support with a beautiful organization switcher in the header.

## Features Added

1. **Organization Switcher** - Dropdown to view/switch organizations
2. **Organization Name Display** - Shows current org under app title
3. **Automatic Board Reloading** - Board loads when switching orgs
4. **Organization Isolation** - Each org has its own board and data

## Testing Checklist

### 1. View Current Organization

- [ ] Open the app at http://localhost:3000
- [ ] Look under "Project Management" title
- [ ] You should see your current organization name displayed
- [ ] The organization switcher button appears in the top-right header

### 2. Organization Switcher UI

- [ ] Click the organization switcher button (shows org name/icon)
- [ ] A dropdown menu should appear with glassmorphic styling
- [ ] Menu should show:
  - Current organization (highlighted)
  - "Create organization" button
  - "Manage organization" option
  - Personal account option

### 3. Create a New Organization

- [ ] Click the organization switcher
- [ ] Click "Create organization"
- [ ] Fill in organization name (e.g., "Test Company")
- [ ] Click "Create"
- [ ] New organization should be created
- [ ] Board should reload with a fresh default board (TODO, In Progress, Completed columns)
- [ ] Organization name under title should update

### 4. Switch Between Organizations

- [ ] Create at least 2 organizations for testing
- [ ] Add some cards to the first organization's board
- [ ] Click organization switcher
- [ ] Select the second organization
- [ ] Board should reload and show empty/different board
- [ ] Organization name should update
- [ ] Switch back to first organization
- [ ] Original cards should still be there (data persistence verified)

### 5. Board Isolation

- [ ] Create Organization A, add cards to columns
- [ ] Create Organization B, add different cards
- [ ] Switch between A and B
- [ ] Verify each organization has completely separate data
- [ ] Cards from Org A don't appear in Org B and vice versa

### 6. Invite Team Members (Optional)

- [ ] Click organization switcher
- [ ] Click "Manage organization"
- [ ] Go to "Members" tab
- [ ] Click "Invite members"
- [ ] Enter email address
- [ ] Send invitation
- [ ] Invited user should receive email
- [ ] When they join, they should see the same board

### 7. Verify Supabase Data Isolation

- [ ] Go to Supabase Dashboard → Table Editor
- [ ] Open `boards` table
- [ ] You should see multiple boards, each with different `organization_id`
- [ ] Verify that each org has exactly 1 board
- [ ] Open `cards` and `columns` tables
- [ ] Verify data is properly scoped to the correct board

### 8. Edge Cases

#### Test 8.1: No Organization

- [ ] Sign out from Clerk
- [ ] Create a new test account
- [ ] Don't create/join any organization
- [ ] App should show loading state or prompt to create org

#### Test 8.2: Switching Mid-Drag

- [ ] Start dragging a card (don't drop it)
- [ ] Try to switch organizations (should not be possible during drag)
- [ ] Drop the card first
- [ ] Then switch organizations

#### Test 8.3: Rapid Switching

- [ ] Create 3+ organizations
- [ ] Rapidly switch between them
- [ ] Each should load correctly without errors
- [ ] No cards from wrong organization should appear

### 9. Visual/UX Verification

#### Organization Switcher Styling

- [ ] Switcher has glassmorphic background
- [ ] Hover effect changes border to primary color
- [ ] Dropdown menu has consistent glass styling
- [ ] Works in both dark and light mode

#### Organization Name Display

- [ ] Name appears in subtle gray text
- [ ] Font size is smaller than main title
- [ ] Looks visually balanced with header

#### Loading States

- [ ] When switching orgs, brief loading spinner appears
- [ ] "Loading your board..." message shows
- [ ] Smooth transition between boards

## Expected Behavior

### Organization Creation Flow

1. Click organization switcher
2. Click "Create organization"
3. Clerk modal opens
4. Enter org name → Create
5. Board initializes with default 3 columns
6. Organization name updates in UI

### Organization Switching Flow

1. Click organization switcher
2. Select different organization
3. Board loading state appears
4. New organization's board loads
5. All data is specific to new org

### Data Isolation

- Each organization has exactly 1 board
- Boards are completely separate
- No data leakage between orgs
- Switching is instant and reliable

## Verifying in Supabase

### boards table

Should show multiple boards for different organizations:

| id     | organization_id | name       | created_by |
| ------ | --------------- | ---------- | ---------- |
| uuid-1 | org_xxx         | Main Board | user_xxx   |
| uuid-2 | org_yyy         | Main Board | user_xxx   |
| uuid-3 | org_zzz         | Main Board | user_xxx   |

### cards and columns tables

- Each card/column has `board_id` linking to the correct board
- Filtering by `board_id` shows only that org's data
- No cross-contamination

## Common Issues

### Issue: "Organization switcher not appearing"

**Cause**: User doesn't have any organizations

**Solution**:

1. Click the UserButton → "Create organization"
2. Or look for "Create organization" prompt in UI
3. Create first organization

### Issue: "Board doesn't reload when switching orgs"

**Cause**: React effect not triggering

**Solution**:

1. Check browser console for errors
2. Hard refresh the page (Cmd+Shift+R)
3. Verify `organization` is in useEffect dependency array

### Issue: "Seeing cards from wrong organization"

**Cause**: Board data not filtered correctly

**Solution**:

1. Check Supabase - verify `organization_id` on boards
2. Check that `getBoardAction` uses correct org ID
3. Clear browser cache and reload

### Issue: "Can't create new organization"

**Cause**: Clerk organization settings

**Solution**:

1. Go to Clerk Dashboard → Organizations
2. Enable "Allow users to create organizations"
3. Set appropriate permissions

## Success Criteria

- [ ] Organization switcher appears in header
- [ ] Current organization name displayed under title
- [ ] Can create new organizations
- [ ] Can switch between organizations seamlessly
- [ ] Each organization has separate board data
- [ ] Data persists after switching and returning
- [ ] No console errors when switching
- [ ] UI remains smooth and responsive
- [ ] Works in both dark and light mode

## Next Steps

Once all tests pass:

- ✅ Phase 4 complete
- Ready for Phase 5: Advanced features (dates, assignees, labels, etc.)
- Consider adding organization settings page
- Consider adding organization member management UI

## Notes

- The OrganizationSwitcher is a Clerk component - very robust
- It handles all the complexity of org management
- Invitation emails are sent by Clerk automatically
- Role-based permissions (Admin, Member) work out of the box
