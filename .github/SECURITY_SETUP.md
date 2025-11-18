# Security Setup Guide

This document explains the automated security scanning setup for Flow Board.

## 📋 Overview

We've implemented comprehensive automated security scanning that runs on every pull request and on a scheduled basis. This helps us identify and fix security issues early.

## 🛡️ Security Tools Configured

### 1. GitHub Actions Workflows

#### `security-scan.yml`
Runs on every PR and daily at 2 AM UTC. Includes:
- **npm audit** - Scans for dependency vulnerabilities
- **Gitleaks** - Scans for accidentally committed secrets
- **Snyk** - Advanced dependency vulnerability scanning
- **ESLint** - Code quality and security linting
- **Security headers check** - Validates security configuration

**Triggers:**
- Pull requests to `main` or `develop`
- Pushes to `main` or `develop`
- Daily schedule (2 AM UTC)
- Manual dispatch

#### `codeql-analysis.yml`
GitHub's native code security scanner. Runs weekly on Monday at 3 AM UTC.
- **CodeQL** - Static analysis for security vulnerabilities
- Analyzes JavaScript and TypeScript code
- Uploads findings to GitHub Security tab

**Triggers:**
- Pull requests to `main` or `develop`
- Pushes to `main` or `develop`
- Weekly schedule (Monday 3 AM UTC)
- Manual dispatch

### 2. Dependabot

Automatically creates pull requests for:
- Dependency security updates (high priority)
- Dependency version updates (weekly)
- GitHub Actions workflow updates (weekly)

**Configuration:** `.github/dependabot.yml`

**Schedule:** Weekly on Mondays at 9 AM UTC

### 3. Secret Scanning

**Gitleaks** - Prevents secrets from being committed to the repository.

**Configuration:** `.gitleaksignore`

**Ignores:**
- Example files (`.env.local.example`)
- Documentation with placeholder secrets
- Test fixtures

## 🚀 Setup Instructions

### Step 1: Configure Snyk (Required)

Snyk provides advanced dependency vulnerability scanning.

1. **Create Snyk Account:**
   - Go to https://snyk.io
   - Sign up with your GitHub account
   - It's free for open source projects

2. **Get Snyk Token:**
   - Go to Account Settings → General
   - Copy your "API Token"

3. **Add to GitHub Secrets:**
   - Go to repository Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Name: `SNYK_TOKEN`
   - Value: [paste your Snyk API token]
   - Click "Add secret"

4. **Connect Repository (Optional but Recommended):**
   - In Snyk dashboard, click "Add project"
   - Select GitHub
   - Select this repository
   - Snyk will now also scan directly

### Step 2: Enable GitHub Security Features

1. **Go to Repository Settings → Security:**
   - Click "Code security and analysis"

2. **Enable the following:**
   - ✅ Dependency graph (should already be on)
   - ✅ Dependabot alerts
   - ✅ Dependabot security updates
   - ✅ Code scanning (CodeQL)
   - ✅ Secret scanning (if available for your plan)

3. **Configure Notifications:**
   - Settings → Notifications → Dependabot alerts
   - Choose how you want to be notified

### Step 3: Set Up Branch Protection (Recommended)

1. **Go to Settings → Branches**

2. **Add rule for `main` branch:**
   - Branch name pattern: `main`
   - ✅ Require a pull request before merging
   - ✅ Require status checks to pass before merging
     - Search and select: "Dependency Scan"
     - Search and select: "Secret Scan"
     - Search and select: "CodeQL"
   - ✅ Require branches to be up to date before merging
   - ✅ Do not allow bypassing the above settings

3. **Repeat for `develop` branch** (if using)

### Step 4: Test the Setup

1. **Create a test PR:**
   ```bash
   git checkout -b test-security-scan
   echo "# Test" >> README.md
   git add README.md
   git commit -m "test: security scan"
   git push origin test-security-scan
   ```

2. **Create a pull request on GitHub**

3. **Verify all checks run:**
   - Dependency Scan
   - Secret Scan
   - Snyk Scan
   - ESLint Scan
   - CodeQL Analysis

4. **Check the results:**
   - Green checkmarks = all passed
   - Red X = issues found (review the logs)
   - Yellow dot = checks running

5. **Close the test PR** when done

## 📊 Viewing Security Results

### GitHub Security Tab

All security findings are aggregated in one place:

1. Go to the **Security** tab in the repository
2. Click **Code scanning** to see CodeQL results
3. Click **Dependabot alerts** to see dependency vulnerabilities
4. Click **Secret scanning** to see any detected secrets

### Pull Request Checks

When you create a PR, security scans run automatically:
- View results in the "Checks" tab of the PR
- Each job shows detailed logs
- Failed checks will block merging (if branch protection enabled)

### Workflow Runs

View historical scan results:
1. Go to **Actions** tab
2. Select a workflow (e.g., "Security Scan")
3. View recent runs and their results
4. Download artifacts (reports) if needed

## 🔔 Notifications

You'll receive notifications for:

1. **Dependabot Alerts:**
   - New vulnerabilities in dependencies
   - Pull requests for updates

2. **Code Scanning Alerts:**
   - Security issues found by CodeQL
   - New issues in pull requests

3. **Failed Workflow Runs:**
   - Security scan failures
   - Failed scheduled scans

**Configure notifications:**
- GitHub → Settings → Notifications → Dependabot alerts
- GitHub → Settings → Notifications → Actions

## 🔧 Maintenance

### Weekly Tasks
- [ ] Review and merge Dependabot PRs
- [ ] Check Security tab for new alerts
- [ ] Review failed workflow runs

### Monthly Tasks
- [ ] Review security scan trends
- [ ] Update security configurations if needed
- [ ] Review and update `.gitleaksignore` if needed

### Quarterly Tasks
- [ ] Review overall security posture
- [ ] Update security documentation
- [ ] Test incident response procedures

## 🚨 Handling Security Alerts

### When Dependabot Creates a PR:

1. **Review the PR:**
   - Check what changed
   - Read the vulnerability details
   - Assess severity (Critical, High, Medium, Low)

2. **Test the update:**
   - Locally: `npm install package@version`
   - Run tests: `npm test`
   - Run build: `npm run build`
   - Test manually if needed

3. **Merge if safe:**
   - If tests pass and no breaking changes → merge
   - If breaking changes → create issue, plan migration
   - If critical → prioritize and fix ASAP

### When CodeQL Finds Issues:

1. **Go to Security → Code scanning**
2. **Click on the alert**
3. **Review the details:**
   - What is the vulnerability?
   - Where is it in the code?
   - What is the severity?

4. **Fix the issue:**
   - Create a branch
   - Fix the vulnerability
   - Create PR
   - Verify alert is resolved

### When Gitleaks Finds Secrets:

1. **IMMEDIATE ACTION REQUIRED**
2. **Assume the secret is compromised**
3. **Steps:**
   - Rotate the secret immediately
   - Update the secret in environment variables
   - Review access logs for unauthorized use
   - If needed, revoke tokens/API keys
   - Fix the code to remove the secret
   - Commit with proper `.gitignore` or env vars

4. **Prevention:**
   - Always use environment variables
   - Never commit `.env.local` files
   - Use `.env.local.example` for templates only

## 📝 Adding More Security Checks

### Adding a New Scan to `security-scan.yml`

1. **Edit `.github/workflows/security-scan.yml`**

2. **Add a new job:**
```yaml
new-security-check:
  name: New Security Check
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - name: Run security tool
      run: |
        # Your security check commands
```

3. **Add to audit summary:**
```yaml
audit-summary:
  needs: [dependency-scan, secret-scan, snyk-scan, eslint-scan, new-security-check]
```

### Popular Additional Tools

- **OWASP Dependency-Check:** Java/JVM dependency scanner
- **Trivy:** Container and dependency scanner
- **Semgrep:** Static analysis for custom rules
- **SonarCloud:** Code quality and security

## 🔐 Security Headers

Security headers are configured in `next.config.js`:

- **CSP (Content Security Policy):** Prevents XSS attacks
- **HSTS:** Forces HTTPS
- **X-Frame-Options:** Prevents clickjacking
- **X-Content-Type-Options:** Prevents MIME sniffing

**Test headers after deployment:**
```bash
curl -I https://your-app.com
# or visit https://securityheaders.com
```

## 📚 Resources

### Documentation
- [GitHub Actions Security](https://docs.github.com/en/actions/security-guides)
- [Dependabot Documentation](https://docs.github.com/en/code-security/dependabot)
- [CodeQL Documentation](https://codeql.github.com/docs/)
- [Snyk Documentation](https://docs.snyk.io/)

### Best Practices
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://cheatsheetseries.owasp.org/cheatsheets/Nodejs_Security_Cheat_Sheet.html)
- [Next.js Security](https://nextjs.org/docs/app/building-your-application/deploying/production-checklist)

### Tools
- [SecurityHeaders.com](https://securityheaders.com) - Test security headers
- [SSL Labs](https://www.ssllabs.com/ssltest/) - Test SSL/TLS configuration
- [OWASP ZAP](https://www.zaproxy.org/) - Web security scanner

## ❓ FAQ

### Q: Why are security scans failing on my PR?

**A:** Security scans can fail for several reasons:
1. New vulnerabilities in dependencies → Run `npm audit fix`
2. Code security issues → Review CodeQL alerts
3. Secrets detected → Remove secrets, use env vars
4. Missing Snyk token → Add `SNYK_TOKEN` to GitHub secrets

### Q: Can I skip security checks for a PR?

**A:** You can, but you shouldn't. If you absolutely must:
1. Add `[skip ci]` to commit message (skips all checks)
2. Or disable branch protection temporarily (not recommended)

**Better approach:**
- Fix the security issues
- Or if false positive, add to ignore files
- Or update security check configuration

### Q: How often should I update dependencies?

**A:**
- **Security updates:** Immediately (within 48 hours)
- **Minor updates:** Weekly (via Dependabot)
- **Major updates:** Monthly, with thorough testing
- **Dev dependencies:** Less urgent, but still important

### Q: What if I find a security issue?

**A:**
1. **Do not** create a public issue
2. Use GitHub Security Advisory (Security tab)
3. Or email security contact (see SECURITY.md)
4. See full reporting guidelines in SECURITY.md

### Q: How do I test security locally?

**A:**
```bash
# Check for dependency vulnerabilities
npm audit

# Fix non-breaking vulnerabilities
npm audit fix

# Check for secrets (requires gitleaks installed)
gitleaks detect --source . --verbose

# Run linter
npm run lint

# Run type checking
npm run type-check  # if available
```

## 🆘 Getting Help

If you need help with security setup:

1. **Check this guide first**
2. **Review GitHub documentation** (links above)
3. **Ask in team chat/discussion**
4. **Open an issue** (for non-security questions)
5. **Contact security team** (for security concerns)

---

**Last Updated:** November 17, 2025

For security vulnerability reporting, see [SECURITY.md](../SECURITY.md)
