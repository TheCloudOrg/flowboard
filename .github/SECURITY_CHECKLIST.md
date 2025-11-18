# Security Checklist for Developers

Use this checklist before committing code or creating a pull request.

## 🔒 Pre-Commit Checklist

### Secrets & Credentials
- [ ] No API keys, tokens, or passwords in code
- [ ] All secrets use environment variables
- [ ] No `.env.local` files committed
- [ ] Updated `.env.local.example` with new variables (placeholders only)
- [ ] No hardcoded URLs with credentials
- [ ] No commented-out secrets

### Authentication & Authorization
- [ ] All API routes check authentication (`auth()` from Clerk)
- [ ] All server actions check authentication (`currentUser()` from Clerk)
- [ ] User can only access their own organization's data
- [ ] Proper error handling for unauthorized access (401, 403)

### Input Validation
- [ ] All user inputs are validated
- [ ] Maximum length checks on text inputs
- [ ] Type validation (using TypeScript)
- [ ] Sanitized before database insertion
- [ ] No direct use of user input in queries

### Database Operations
- [ ] Using Supabase client (parameterized queries)
- [ ] No raw SQL with string concatenation
- [ ] Proper error handling
- [ ] Transactions used where needed
- [ ] Data filtered by organization/user

### Error Handling
- [ ] No sensitive data in error messages
- [ ] Error details logged server-side only
- [ ] User-friendly error messages
- [ ] Proper HTTP status codes (400, 401, 403, 404, 500)
- [ ] No stack traces exposed to users

### Dependencies
- [ ] Only necessary dependencies added
- [ ] Checked for known vulnerabilities (`npm audit`)
- [ ] Using latest stable versions
- [ ] Reviewed package reputation and maintainers

## 📝 Pre-Pull Request Checklist

### Code Quality
- [ ] TypeScript types properly defined
- [ ] No `any` types (unless absolutely necessary)
- [ ] ESLint passes (`npm run lint`)
- [ ] Tests pass (if applicable)
- [ ] Build succeeds (`npm run build`)

### Security Specific
- [ ] No `dangerouslySetInnerHTML` usage
- [ ] No `eval()` or `Function()` constructor
- [ ] No `innerHTML` for user-generated content
- [ ] XSS protection in place (React escapes by default)
- [ ] No SQL injection vectors

### API Security
- [ ] Rate limiting considered (if new API route)
- [ ] CORS policy appropriate (if new API route)
- [ ] Input validation on all parameters
- [ ] Proper authentication and authorization
- [ ] Request/response logging (without sensitive data)

### Third-Party Integrations
- [ ] Using official SDKs where available
- [ ] API keys in environment variables
- [ ] Webhook signatures verified (if applicable)
- [ ] HTTPS used for all external calls
- [ ] Proper error handling for external failures

## 🚀 Pre-Deployment Checklist

### Environment
- [ ] All production environment variables set
- [ ] Using production API keys (not test/dev)
- [ ] Production database configured
- [ ] Production Clerk instance configured
- [ ] HTTPS enforced

### Configuration
- [ ] Security headers configured (`next.config.js`)
- [ ] RLS enabled on all Supabase tables
- [ ] Rate limiting configured
- [ ] CORS policy configured
- [ ] Error logging configured

### Monitoring
- [ ] Error tracking enabled (Sentry/similar)
- [ ] Security alerts configured
- [ ] Uptime monitoring enabled
- [ ] Database backup enabled
- [ ] Audit logging active

### Testing
- [ ] Security scans passed
- [ ] Manual testing in staging
- [ ] Authentication flows tested
- [ ] Authorization rules tested
- [ ] Error handling tested

## 🔍 Code Review Checklist (For Reviewers)

### General Security
- [ ] No hardcoded secrets or credentials
- [ ] Authentication properly implemented
- [ ] Authorization checks in place
- [ ] Input validation comprehensive
- [ ] Error handling doesn't leak information

### Logic Security
- [ ] No authentication bypass possible
- [ ] No privilege escalation possible
- [ ] Race conditions handled
- [ ] Business logic sound
- [ ] Edge cases considered

### Data Security
- [ ] Personal data properly handled
- [ ] Data scoped to user/organization
- [ ] No mass assignment vulnerabilities
- [ ] File uploads validated (if applicable)
- [ ] Data properly sanitized

## 🛠️ Quick Commands

```bash
# Check for secrets locally (requires gitleaks)
gitleaks detect --source . --verbose

# Scan dependencies
npm audit

# Fix vulnerabilities
npm audit fix

# Run linter
npm run lint

# Type check
npx tsc --noEmit

# Build project
npm run build

# Run security scan (if setup locally)
npm run security-scan  # add this script to package.json
```

## 🚨 Red Flags to Watch For

### In Code Reviews
- ⛔ Hardcoded secrets or tokens
- ⛔ Authentication bypasses
- ⛔ Raw SQL queries
- ⛔ User input directly in queries
- ⛔ Missing authorization checks
- ⛔ Overly permissive CORS
- ⛔ Eval or similar dangerous functions
- ⛔ Missing error handling
- ⛔ Sensitive data in logs
- ⛔ No rate limiting on new endpoints

### In Dependencies
- ⛔ Unmaintained packages (last update > 2 years)
- ⛔ Packages with known vulnerabilities
- ⛔ Packages from unknown authors
- ⛔ Packages with very few downloads
- ⛔ Packages requesting unnecessary permissions

## 📚 Common Vulnerabilities to Avoid

### 1. SQL Injection
❌ **Bad:**
```typescript
const query = `SELECT * FROM users WHERE id = ${userId}`
```

✅ **Good:**
```typescript
const { data } = await supabase
  .from('users')
  .select('*')
  .eq('id', userId)
```

### 2. XSS (Cross-Site Scripting)
❌ **Bad:**
```typescript
<div dangerouslySetInnerHTML={{ __html: userInput }} />
```

✅ **Good:**
```typescript
<div>{userInput}</div>  // React escapes automatically
```

### 3. Authentication Bypass
❌ **Bad:**
```typescript
export async function deleteBoard(boardId: string) {
  // No auth check!
  await supabase.from('boards').delete().eq('id', boardId)
}
```

✅ **Good:**
```typescript
export async function deleteBoard(boardId: string) {
  const user = await currentUser()
  if (!user) throw new Error('Unauthorized')

  // Verify user owns this board
  const board = await getBoard(boardId)
  if (board.organization_id !== user.orgId) {
    throw new Error('Forbidden')
  }

  await supabase.from('boards').delete().eq('id', boardId)
}
```

### 4. Sensitive Data Exposure
❌ **Bad:**
```typescript
catch (error) {
  return NextResponse.json({ error: error.stack }, { status: 500 })
}
```

✅ **Good:**
```typescript
catch (error) {
  console.error('Internal error:', error)  // Log server-side
  return NextResponse.json(
    { error: 'An error occurred' },  // Generic message to user
    { status: 500 }
  )
}
```

### 5. Missing Rate Limiting
❌ **Bad:**
```typescript
export async function POST(request: NextRequest) {
  // No rate limiting - can be abused
  await expensiveOperation()
}
```

✅ **Good:**
```typescript
export async function POST(request: NextRequest) {
  const { success } = await ratelimit.limit(request.ip)
  if (!success) {
    return new Response('Too many requests', { status: 429 })
  }

  await expensiveOperation()
}
```

## 📋 File-Specific Guidelines

### Environment Files (`.env.local`)
- ✅ Listed in `.gitignore`
- ✅ Never committed
- ✅ Has corresponding `.env.local.example`
- ✅ All values are actual secrets (not config)

### API Routes (`app/api/**/*.ts`)
- ✅ Authentication check at the start
- ✅ Input validation
- ✅ Rate limiting
- ✅ Proper error handling
- ✅ CORS configured if needed

### Server Actions (`app/actions/**/*.ts`)
- ✅ Marked with `'use server'`
- ✅ Authentication check (`currentUser()`)
- ✅ Authorization check (user can access resource)
- ✅ Input validation
- ✅ Proper error handling

### Components (`components/**/*.tsx`)
- ✅ No sensitive logic (move to server)
- ✅ No API keys or secrets
- ✅ Proper TypeScript types
- ✅ User input properly handled

### Database Migrations (`supabase/migrations/*.sql`)
- ✅ RLS enabled on new tables
- ✅ RLS policies defined
- ✅ Proper indexes
- ✅ Foreign key constraints
- ✅ No hardcoded data with secrets

## 🎯 Security Best Practices Summary

1. **Authentication:** Always check who the user is
2. **Authorization:** Always check what they can access
3. **Validation:** Never trust user input
4. **Secrets:** Never commit credentials
5. **Errors:** Never expose internal details
6. **Dependencies:** Keep them updated
7. **Logging:** Log security events
8. **Testing:** Test security controls
9. **Defense in Depth:** Multiple layers of security
10. **Principle of Least Privilege:** Minimum necessary access

## 📞 Need Help?

- **Security questions:** See [SECURITY.md](../SECURITY.md)
- **Setup questions:** See [SECURITY_SETUP.md](SECURITY_SETUP.md)
- **General questions:** Open a discussion
- **Found a vulnerability:** Report privately via Security tab

---

**Remember:** Security is everyone's responsibility!

Last Updated: November 17, 2025
