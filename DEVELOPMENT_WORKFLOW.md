# Development Workflow

This project follows **Git Flow** for branch management and deployment.

## Branch Strategy

### Main Branches

- **`main`** - Production branch
  - Deployed automatically to production on Vercel
  - Protected: Requires PR approval and passing CI checks
  - Never commit directly to main

- **`develop`** - Integration/staging branch
  - Deployed automatically to staging environment on Vercel
  - All feature branches merge here first
  - Protected: Requires PR approval and passing CI checks

### Supporting Branches

- **`feature/*`** - Feature development branches
  - Branch from: `develop`
  - Merge back to: `develop`
  - Naming: `feature/description-of-feature`
  - Example: `feature/add-dark-mode`

- **`hotfix/*`** - Emergency production fixes
  - Branch from: `main`
  - Merge back to: `main` AND `develop`
  - Naming: `hotfix/description-of-fix`
  - Example: `hotfix/fix-auth-bug`

- **`claude/*`** - Claude AI agent branches
  - Automated branches created by Claude Code web agents
  - Follow same merge rules as feature branches

---

## Workflow Steps

### Creating a New Feature

1. **Start from develop**
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/your-feature-name
   ```

2. **Make changes and commit regularly**
   ```bash
   git add .
   git commit -m "feat: Add your feature description"
   ```

3. **Push to GitHub**
   ```bash
   git push -u origin feature/your-feature-name
   ```

4. **Create Pull Request**
   - Go to GitHub
   - Create PR from `feature/your-feature-name` → `develop`
   - Wait for CI checks to pass (all must be green)
   - Request code review

5. **Merge to develop**
   - After approval and green checks, merge PR
   - Delete feature branch after merge

6. **Test on staging**
   - Verify your changes on the staging environment
   - Staging URL: [Your Vercel staging URL]

### Releasing to Production

1. **Create release PR**
   ```bash
   git checkout develop
   git pull origin develop
   ```
   - Create PR from `develop` → `main`
   - Title: "Release: v1.x.x - Brief description"

2. **Final verification**
   - All CI checks must pass
   - Review all changes since last release
   - Test thoroughly on staging

3. **Merge to main**
   - After approval, merge PR
   - This triggers automatic production deployment

4. **Monitor deployment**
   - Watch Vercel deployment logs
   - Verify production site works correctly
   - Monitor error tracking (if configured)

### Hotfix Process (Emergency Fixes)

1. **Branch from main**
   ```bash
   git checkout main
   git pull origin main
   git checkout -b hotfix/critical-issue-description
   ```

2. **Fix the issue**
   ```bash
   git add .
   git commit -m "fix: Critical issue description"
   git push -u origin hotfix/critical-issue-description
   ```

3. **Create TWO Pull Requests**
   - PR #1: `hotfix/...` → `main` (for immediate production fix)
   - PR #2: `hotfix/...` → `develop` (to keep develop in sync)

4. **Merge to main first**
   - Get urgent approval
   - Merge to main
   - Verify production deployment

5. **Then merge to develop**
   - Merge second PR to develop
   - Keeps develop branch up to date

---

## CI/CD Checks

All PRs must pass these checks before merging:

### Code Quality Checks
- ✅ Prettier formatting
- ✅ ESLint (no errors)
- ✅ TypeScript type checking
- ✅ Build verification

### Testing Suite
- ✅ Unit tests (Jest)
- ✅ E2E tests (Playwright)
- ✅ Test coverage report

### Security Scans
- ✅ CodeQL analysis
- ✅ npm audit (dependency vulnerabilities)
- ✅ Gitleaks (secret scanning)
- ✅ ESLint security rules

---

## Local Development

### First Time Setup

```bash
# Clone the repository
git clone https://github.com/TheCloudOrg/projectManagementApp.git
cd projectManagementApp

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local
# Then edit .env.local with your credentials

# Run development server
npm run dev
```

### Common Commands

```bash
# Development
npm run dev              # Start dev server on http://localhost:3000

# Quality Checks (run before creating PR)
npm run quality          # Run all quality checks
npm run format           # Auto-format code with Prettier
npm run lint:fix         # Auto-fix linting issues
npm run type-check       # Check TypeScript types

# Testing
npm test                 # Run unit tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Generate coverage report
npm run test:e2e         # Run E2E tests
npm run test:e2e:ui      # Run E2E tests with UI

# Build
npm run build            # Build for production
npm start                # Start production server
```

---

## Commit Message Guidelines

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>: <description>

[optional body]

[optional footer]
```

### Types

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks
- `perf:` - Performance improvements

### Examples

```bash
feat: Add user authentication with Clerk
fix: Resolve card drag-and-drop issue in Safari
docs: Update deployment workflow documentation
test: Add unit tests for ThemeContext
chore: Upgrade Next.js to v16.0.3
```

---

## Getting Help

- **Documentation Issues**: Create an issue on GitHub
- **Development Questions**: Ask in team chat
- **CI/CD Failures**: Check GitHub Actions logs
- **Deployment Issues**: Check Vercel deployment logs

---

## Branch Protection Rules

### Main Branch
- ✅ Require pull request reviews (1 approver)
- ✅ Require status checks to pass
- ✅ Require branches to be up to date
- ✅ Include administrators
- ❌ No force pushes allowed
- ❌ No deletions allowed

### Develop Branch
- ✅ Require pull request reviews (1 approver)
- ✅ Require status checks to pass
- ✅ Require branches to be up to date
- ✅ Include administrators
- ⚠️ Force pushes allowed for maintainers only
- ❌ No deletions allowed

---

## Tips for Success

1. **Always branch from develop** for new features
2. **Pull latest changes** before creating new branch
3. **Run quality checks** before pushing: `npm run quality`
4. **Write clear commit messages** following conventional commits
5. **Keep PRs focused** - one feature/fix per PR
6. **Request reviews early** - don't wait until PR is perfect
7. **Test on staging** before releasing to production
8. **Monitor production** after deployment

---

## Troubleshooting

### CI Checks Failing

```bash
# Run the same checks locally
npm run quality          # Format, lint, type-check
npm test                 # Unit tests
npm run test:e2e         # E2E tests (requires dev server running)
npm run build            # Build verification
```

### Merge Conflicts

```bash
# Update your branch with latest develop
git checkout develop
git pull origin develop
git checkout your-feature-branch
git merge develop
# Resolve conflicts
git commit
git push
```

### Accidental Commit to Main/Develop

```bash
# DO NOT force push!
# Instead, create a revert PR
git revert <commit-hash>
git push
# Then create PR to undo the change
```
