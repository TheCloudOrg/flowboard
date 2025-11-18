# Security Policy

## Overview

Flow Board takes security seriously. We appreciate the security community's efforts in helping us maintain the security of our project management application.

## Supported Versions

We release patches for security vulnerabilities for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| Latest  | :white_check_mark: |
| < Latest| :x:                |

**Note:** We currently only support the latest version. Please ensure you're running the most recent release.

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

If you discover a security vulnerability, please report it to us privately using one of the following methods:

### Preferred Method: GitHub Security Advisories

1. Go to the [Security tab](https://github.com/YashShelar007/projectManagementApp/security/advisories) of this repository
2. Click "Report a vulnerability"
3. Fill out the form with details about the vulnerability

### Alternative: Email

If you prefer, you can also send an email to:
- **Email:** [Your Security Email] (Please add your security email here)
- **Subject Line:** [SECURITY] Flow Board Vulnerability Report

### What to Include in Your Report

Please include the following information to help us better understand and address the issue:

1. **Type of vulnerability** (e.g., SQL injection, XSS, authentication bypass, etc.)
2. **Affected component(s)** (e.g., API endpoint, authentication, database)
3. **Steps to reproduce** the vulnerability
4. **Potential impact** of the vulnerability
5. **Suggested fix** (if you have one)
6. **Your contact information** for follow-up questions

### Example Report Format

```
## Vulnerability Type
[e.g., Unauthenticated API endpoint]

## Affected Component
[e.g., /api/generate-prompt endpoint]

## Steps to Reproduce
1. Navigate to...
2. Send a POST request to...
3. Observe that...

## Impact
[e.g., Allows unauthorized access to OpenAI API, potentially draining credits]

## Suggested Fix
[e.g., Add Clerk authentication check at the beginning of the handler]

## Contact
[Your email for follow-up]
```

## Response Timeline

We strive to respond to security reports promptly:

- **Initial Response:** Within 48 hours of receiving the report
- **Status Update:** Within 7 days with our assessment and planned remediation timeline
- **Fix Timeline:**
  - Critical vulnerabilities: 1-7 days
  - High severity: 7-30 days
  - Medium severity: 30-90 days
  - Low severity: Best effort

## Security Update Process

When we receive a security vulnerability report:

1. **Acknowledgment:** We'll confirm receipt of your report
2. **Assessment:** We'll verify and assess the severity of the vulnerability
3. **Fix Development:** We'll develop and test a fix
4. **Disclosure:** We'll coordinate with you on disclosure timing
5. **Release:** We'll release the security patch
6. **Credit:** We'll publicly credit you (unless you prefer to remain anonymous)

## Known Security Considerations

### Current Security Measures

- ✅ **Authentication:** Clerk-based authentication for all protected routes
- ✅ **Database:** Supabase with prepared statements (no SQL injection risk)
- ✅ **Secrets Management:** Environment variables for sensitive data
- ✅ **HTTPS:** Enforced in production
- ✅ **Dependencies:** Automated scanning with Dependabot and Snyk

### Areas Under Active Development

- 🔧 **Row Level Security (RLS):** Implementing Supabase RLS policies
- 🔧 **Rate Limiting:** Adding API rate limiting
- 🔧 **Security Headers:** Implementing CSP and other security headers
- 🔧 **Input Validation:** Enhanced validation for all user inputs

### Out of Scope

The following are **not** considered security vulnerabilities:

- Reports from automated scanning tools without proof of exploitability
- Issues requiring physical access to a user's device
- Social engineering attacks
- Denial of Service attacks that require excessive resources
- Issues in third-party dependencies (please report to the respective projects)
- Theoretical vulnerabilities without a proof of concept
- Vulnerabilities in outdated versions

## Security Best Practices for Contributors

If you're contributing to Flow Board, please follow these security guidelines:

### Code Security

1. **Never commit secrets** (API keys, tokens, passwords)
2. **Use environment variables** for all sensitive configuration
3. **Validate all user input** server-side
4. **Use parameterized queries** for database operations (already implemented)
5. **Implement proper error handling** without exposing sensitive information
6. **Follow the principle of least privilege** for database and API access

### Authentication & Authorization

1. **Always use Clerk's `auth()`** or `currentUser()` in API routes and server actions
2. **Never trust client-side data** for authorization decisions
3. **Verify user permissions** for organization-specific resources
4. **Use RLS policies** once implemented

### Dependencies

1. **Keep dependencies up to date** (automated via Dependabot)
2. **Review security advisories** for all dependencies
3. **Minimize dependency footprint** (only install what's necessary)
4. **Audit new dependencies** before adding them

### API Security

1. **Require authentication** on all non-public API endpoints
2. **Implement rate limiting** to prevent abuse
3. **Validate input** thoroughly
4. **Use proper HTTP methods** (GET for reads, POST for writes, etc.)
5. **Return appropriate status codes** (401, 403, etc.)

## Security Features in Production

### Recommended Environment Variables

Ensure the following environment variables are properly configured:

```bash
# Required for production
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
CLERK_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
OPENAI_API_KEY=sk-...

# Recommended for production
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### Deployment Checklist

Before deploying to production:

- [ ] All environment variables are set in production environment
- [ ] HTTPS is enforced
- [ ] Clerk is configured with production keys
- [ ] Supabase RLS policies are enabled
- [ ] Rate limiting is configured
- [ ] Security headers are configured in `next.config.js`
- [ ] Error logging is configured (without exposing sensitive data)
- [ ] Database backups are enabled
- [ ] Monitoring and alerting are configured

## Automated Security Scanning

This repository uses automated security scanning:

- **GitHub CodeQL:** Advanced code security analysis
- **Snyk:** Dependency vulnerability scanning
- **Dependabot:** Automated dependency updates
- **Gitleaks:** Secret scanning
- **npm audit:** Node.js dependency auditing
- **ESLint:** Code quality and security linting

Security scans run:
- On every pull request
- On every push to main/develop branches
- Daily via scheduled workflows
- Weekly for comprehensive CodeQL analysis

## Security-Related Dependencies

Our security stack includes:

- **@clerk/nextjs** - Authentication and user management
- **@supabase/supabase-js** - Database with built-in security features
- **@supabase/ssr** - Secure server-side rendering
- **svix** - Webhook signature verification
- **TypeScript** - Type safety to prevent common bugs

## Hall of Fame

We appreciate security researchers who have responsibly disclosed vulnerabilities:

<!-- This section will be updated as we receive and address security reports -->

*No vulnerabilities have been reported yet.*

## Questions?

If you have questions about this security policy, please:

1. Open a discussion in the [Discussions](https://github.com/YashShelar007/projectManagementApp/discussions) section
2. Tag it with "security" label
3. Do NOT include details of a specific vulnerability in public discussions

## Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security Best Practices](https://nextjs.org/docs/app/building-your-application/deploying/production-checklist)
- [Clerk Security Documentation](https://clerk.com/docs/security/overview)
- [Supabase Security Documentation](https://supabase.com/docs/guides/platform/security)

---

**Last Updated:** 2025-11-17

Thank you for helping keep Flow Board and our users safe!
