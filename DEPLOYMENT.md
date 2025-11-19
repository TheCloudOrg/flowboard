# Deployment Guide

This project is deployed using **Vercel** with automatic deployments configured for multiple environments.

## Deployment Environments

### 1. Production

- **Branch**: `main`
- **URL**: https://flow-board.vercel.app (or your custom domain)
- **Trigger**: Automatic on merge to `main`
- **Environment Variables**: Production credentials

### 2. Staging

- **Branch**: `develop`
- **URL**: https://flow-board-staging.vercel.app (or generated URL)
- **Trigger**: Automatic on push to `develop`
- **Environment Variables**: Staging credentials (or same as production with caution)

### 3. Preview

- **Branch**: Feature branches (`feature/*`, `claude/*`)
- **URL**: Auto-generated unique URL per PR
- **Trigger**: Automatic on PR creation/update
- **Environment Variables**: Staging credentials

---

## Automatic Deployment Flow

```
feature/my-feature  →  PR to develop  →  Preview Deployment
                                        (unique URL generated)
        ↓
   Merge to develop  →  Staging Deployment
                       (https://...-staging.vercel.app)
        ↓
    PR to main  →  Production Deployment
                   (https://flow-board.vercel.app)
```

---

## Environment Variables

### Required Variables (All Environments)

Add these in Vercel Dashboard → Settings → Environment Variables:

#### Clerk Authentication

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
```

#### Supabase Database

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJh...
SUPABASE_SERVICE_ROLE_KEY=eyJh...
```

#### OpenAI API (for AI features)

```bash
OPENAI_API_KEY=sk-...
```

### Environment-Specific Setup

1. **Production Environment**
   - Use production Clerk instance
   - Use production Supabase project
   - Use production OpenAI key (with rate limits)

2. **Staging/Preview Environment**
   - Use staging Clerk instance (or same as production with care)
   - Use staging Supabase project (recommended)
   - Use development OpenAI key

---

## Manual Deployment

### Deploy via CLI

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

### Deploy via GitHub

Deployments are automatic when:

- Push to `main` → Production
- Push to `develop` → Staging
- Create/update PR → Preview

---

## Vercel Configuration

### vercel.json

Located at project root:

```json
{
  "git": {
    "deploymentEnabled": {
      "main": true,
      "develop": true
    }
  },
  "github": {
    "autoJobCancelation": true
  }
}
```

This configuration:

- Enables automatic deployment for `main` and `develop` branches
- Cancels outdated deployments when new commits are pushed

### Build Settings (in Vercel Dashboard)

- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm ci`
- **Node Version**: 20.x

---

## Deployment Checklist

### Before Deploying to Production

- [ ] All CI checks passing (green checkmarks)
- [ ] Code reviewed and approved
- [ ] Tested on staging environment
- [ ] Database migrations completed (if any)
- [ ] Environment variables updated (if needed)
- [ ] Breaking changes documented
- [ ] User-facing changes documented in changelog

### After Deploying to Production

- [ ] Verify production site loads correctly
- [ ] Check all main user flows work
- [ ] Monitor Vercel deployment logs for errors
- [ ] Monitor application logs for runtime errors
- [ ] Verify database migrations succeeded
- [ ] Announce deployment in team chat

---

## Monitoring Deployments

### Vercel Dashboard

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your project
3. View deployments list
4. Click on specific deployment for:
   - Build logs
   - Runtime logs
   - Performance metrics
   - Deployment URL

### Via CLI

```bash
# List recent deployments
vercel ls

# Get deployment logs
vercel logs [deployment-url]

# Inspect specific deployment
vercel inspect [deployment-url]

# Promote deployment to production
vercel promote [deployment-url]

# Alias deployment to custom domain
vercel alias [deployment-url] your-domain.com
```

### GitHub Actions Integration

Every deployment creates a comment on the PR with:

- ✅ Deployment status
- 🔗 Preview URL
- 📊 Build time
- 🚀 Deployment logs link

---

## Rollback Procedure

### Method 1: Revert via Git (Recommended)

```bash
# Identify problematic commit
git log --oneline

# Revert the commit
git revert <commit-hash>

# Push to main
git push origin main

# Automatic deployment will be triggered
```

### Method 2: Redeploy Previous Version (Fast)

```bash
# List deployments
vercel ls

# Promote previous working deployment
vercel promote [previous-deployment-url]
```

### Method 3: Via Vercel Dashboard (Fastest)

1. Go to Vercel Dashboard → Deployments
2. Find last working deployment
3. Click "..." menu → "Promote to Production"

---

## Domain Configuration

### Custom Domain Setup

1. Go to Vercel Dashboard → Settings → Domains
2. Add your custom domain
3. Configure DNS records:

**Option A: Nameservers (Recommended)**

- Update your domain nameservers to Vercel's

**Option B: A/CNAME Records**

```
Type    Name    Value
A       @       76.76.21.21
CNAME   www     cname.vercel-dns.com
```

4. SSL certificate auto-generated by Vercel
5. Enable automatic HTTPS redirect

### Subdomain for Staging

```
staging.yourdomain.com  →  CNAME  cname.vercel-dns.com
```

Then in Vercel:

- Go to Settings → Domains
- Add `staging.yourdomain.com`
- Connect to `develop` branch

---

## Performance Optimization

### Vercel Analytics

Enable in Vercel Dashboard:

- Go to Analytics tab
- View Core Web Vitals
- Monitor page load times
- Track user interactions

### Speed Insights

```bash
# Install Vercel Speed Insights
npm install @vercel/speed-insights

# Add to app/layout.tsx
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
```

---

## Troubleshooting

### Build Failures

```bash
# Run build locally to reproduce error
npm run build

# Check build logs in Vercel dashboard
# Common issues:
# - Missing environment variables
# - TypeScript errors
# - Import errors
# - Dependency issues
```

### Runtime Errors

```bash
# Check Vercel runtime logs
vercel logs [deployment-url]

# Common issues:
# - API route errors
# - Database connection issues
# - Missing environment variables
# - CORS issues
```

### Environment Variable Issues

```bash
# Verify variables are set
vercel env ls

# Pull environment variables locally
vercel env pull .env.local

# Add new variable
vercel env add [VARIABLE_NAME]
```

---

## Deployment Best Practices

1. **Always deploy to staging first**
   - Test changes on staging environment
   - Verify all functionality works
   - Check performance metrics

2. **Use preview deployments**
   - Share preview URL with team for review
   - Test before merging to develop
   - Validate UI/UX changes

3. **Monitor after deployment**
   - Watch Vercel logs for first 5-10 minutes
   - Check error tracking dashboard
   - Verify critical user flows

4. **Schedule production deployments**
   - Deploy during low-traffic hours
   - Have team available for monitoring
   - Prepare rollback plan

5. **Document changes**
   - Update CHANGELOG.md
   - Note breaking changes
   - Document new environment variables

---

## Getting Help

- **Vercel Documentation**: https://vercel.com/docs
- **Deployment Issues**: Check Vercel support or team chat
- **Build Errors**: Review build logs and CI checks
- **Performance Issues**: Use Vercel Analytics

---

## Emergency Contacts

- **Vercel Support**: support@vercel.com
- **Team Lead**: [Your contact]
- **DevOps**: [Your contact]
