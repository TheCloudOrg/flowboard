# Fixing Clerk CAPTCHA Error

## Issue

When signing up, you may see this error:

```
The CAPTCHA failed to load. This may be due to an unsupported browser or a browser extension.
```

## Root Cause

Clerk's bot protection feature uses CAPTCHA (reCAPTCHA or hCaptcha) which can fail to load in certain scenarios:

- Development environment without proper CAPTCHA keys configured
- Browser extensions blocking CAPTCHA scripts
- Unsupported browsers
- Network issues

## Solutions

### Option 1: Disable Bot Protection (Recommended for Development)

1. Go to your Clerk Dashboard: https://dashboard.clerk.com
2. Select your application
3. Navigate to **User & Authentication** → **Attack Protection**
4. Find the **Bot Sign-up Protection** section
5. Toggle **OFF** bot protection for development
6. Click **Save**

This will disable CAPTCHA for sign-ups in your development environment.

### Option 2: Configure CAPTCHA Keys (For Production)

If you want to keep bot protection enabled:

1. Get CAPTCHA keys:
   - **Google reCAPTCHA**: https://www.google.com/recaptcha/admin
   - **hCaptcha**: https://www.hcaptcha.com

2. Add keys to Clerk Dashboard:
   - Go to **Attack Protection** → **Bot Sign-up Protection**
   - Select your CAPTCHA provider
   - Enter Site Key and Secret Key
   - Save changes

### Option 3: Browser-Based Workarounds

If the issue persists:

1. **Disable browser extensions** temporarily:
   - Ad blockers (uBlock Origin, AdBlock, etc.)
   - Privacy extensions
   - Script blockers

2. **Try a different browser**:
   - Chrome, Firefox, or Edge usually work best
   - Ensure browser is up to date

3. **Check browser settings**:
   - Enable JavaScript
   - Allow third-party cookies
   - Disable strict tracking protection temporarily

### Option 4: Use Incognito/Private Mode

Open your application in an incognito/private browsing window to rule out extension conflicts.

## Recommended Approach

For **development/testing**: Use Option 1 (disable bot protection)

For **production**: Use Option 2 (configure proper CAPTCHA keys)

## Testing After Fix

1. Clear browser cache and cookies
2. Navigate to the sign-up page
3. Try creating a new account
4. CAPTCHA should either not appear (if disabled) or load properly (if configured)

## Production Considerations

Before deploying to production:

1. **Enable bot protection** with properly configured CAPTCHA
2. Test sign-up flow in production environment
3. Monitor for any CAPTCHA-related errors in Clerk dashboard
4. Consider using **Clerk's invisible CAPTCHA** option for better UX

## Additional Resources

- [Clerk Attack Protection Docs](https://clerk.com/docs/security/attack-protection)
- [Clerk Bot Protection](https://clerk.com/docs/security/bot-protection)
- [Google reCAPTCHA](https://www.google.com/recaptcha/about/)
- [hCaptcha](https://www.hcaptcha.com/)
