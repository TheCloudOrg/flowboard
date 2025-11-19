# Pre-Deployment Testing Checklist

## Critical: Preventing Production Breakage

This checklist MUST be completed before deploying to production to prevent the app from breaking.

### 1. Build Verification

- [ ] Run `npm run build` successfully
- [ ] No TypeScript errors
- [ ] No build warnings related to missing dependencies or configurations
- [ ] All routes compile without errors

### 2. Functionality Testing (Both Modes)

#### Dark Mode Testing

- [ ] Column titles are visible and properly styled
- [ ] Card titles and descriptions are readable
- [ ] All buttons and inputs are styled correctly
- [ ] Navigation and user controls work properly
- [ ] AI features work (if applicable)

#### Light Mode Testing

- [ ] Column titles are visible and properly styled
- [ ] Card titles and descriptions are readable
- [ ] All buttons and inputs are styled correctly
- [ ] Navigation and user controls work properly
- [ ] AI features work (if applicable)
- [ ] **Verify all `light:` prefixed Tailwind classes are applying**

### 3. Core Features Testing

- [ ] Can create new cards
- [ ] Can edit existing cards
- [ ] Can delete cards
- [ ] Can drag and drop cards between columns
- [ ] Can add new columns
- [ ] Can delete columns
- [ ] Organization switcher works
- [ ] User authentication works

### 4. Landing Page Testing (if changed)

- [ ] Landing page loads correctly
- [ ] All sections render properly
- [ ] Links and CTAs work
- [ ] Responsive design works on mobile
- [ ] Pricing section displays correctly

### 5. Style/Theme Testing

- [ ] Theme toggle switches between light and dark modes
- [ ] No flash of unstyled content (FOUC)
- [ ] Custom Tailwind variants work (e.g., `light:`, `dark:`)
- [ ] Gradients and colors render correctly
- [ ] Glass effects and backdrop blur work

### 6. Browser Testing

- [ ] Test in Chrome/Chromium
- [ ] Test in Firefox
- [ ] Test in Safari (if on macOS)
- [ ] Test responsive layout on mobile viewport

### 7. Performance

- [ ] Page loads in reasonable time
- [ ] No console errors in browser
- [ ] No excessive re-renders or janky animations

## Post-Merge Checklist

Before merging feature branches that modify UI or styling:

1. **Check Tailwind Config Changes**
   - [ ] Verify custom variants are configured in `tailwind.config.ts`
   - [ ] If code uses `light:` prefix, ensure plugin is added:
     ```typescript
     plugins: [
       function ({ addVariant }: any) {
         addVariant('light', ':not(.dark) &');
       },
     ];
     ```

2. **Check Global Styles**
   - [ ] Review changes to `app/globals.css`
   - [ ] Ensure theme classes (`.light`, `.dark`) are properly defined

3. **Component Review**
   - [ ] Check if new components use non-standard Tailwind variants
   - [ ] Verify components work in both light and dark modes

## Emergency Rollback

If production breaks after deployment:

1. Check Vercel deployment logs: `vercel inspect [deployment-url] --logs`
2. Identify the breaking commit
3. Revert: `git revert [commit-hash]`
4. Push: `git push origin main`
5. Redeploy: `vercel --prod`

## Lessons Learned

### Issue: Main App Broken After Landing Page Merge (2025-11-18)

- **Root Cause**: Components used `light:` Tailwind variant that wasn't configured
- **Fix**: Added custom `light` variant plugin to `tailwind.config.ts`
- **Prevention**: Always test both light and dark modes before deployment
- **Key Insight**: Tailwind CSS only provides `dark:` variant by default; `light:` must be custom configured

---

## Quick Test Commands

```bash
# Build for production
npm run build

# Start dev server for manual testing
npm run dev

# Deploy to production
vercel --prod

# Check deployment status
vercel ls

# View deployment logs
vercel inspect [deployment-url] --logs
```

## Notes

- **Always test the main Kanban board** after merging any styling or config changes
- **Never skip light mode testing** - it's easy to forget since dark mode is more commonly used during development
- **Run production build locally** before deploying to catch build-time errors
- **Check browser console** for runtime errors that might not show in terminal
