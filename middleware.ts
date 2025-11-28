import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  '/', // Root page (handles its own auth redirect)
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhooks(.*)', // Webhook endpoints
  '/api/waitlist(.*)', // Waitlist endpoint
  '/landing(.*)', // Landing page
]);

// Define routes that should skip onboarding check
const isOnboardingRoute = createRouteMatcher([
  '/onboarding(.*)',
  '/api(.*)',
  '/sign-in(.*)',
  '/sign-up(.*)',
]);

export default clerkMiddleware(async (auth, request) => {
  const { userId } = await auth();

  // Protect all routes except public ones
  if (!isPublicRoute(request)) {
    await auth.protect();
  }

  // TODO: Re-enable onboarding redirect after rebuilding the system
  // Only check onboarding for authenticated users on protected routes
  // if (userId && !isPublicRoute(request) && !isOnboardingRoute(request)) {
  //   console.log('[Middleware] Checking onboarding for user:', userId, 'path:', request.nextUrl.pathname);
  //   try {
  //     // Import here to avoid edge runtime issues
  //     const { shouldShowOnboarding } = await import('@/lib/onboarding');
  //     const needsOnboarding = await shouldShowOnboarding(userId);
  //     console.log('[Middleware] Needs onboarding:', needsOnboarding);

  //     // Redirect to onboarding if needed
  //     if (needsOnboarding) {
  //       console.log('[Middleware] Redirecting to /onboarding');
  //       const onboardingUrl = new URL('/onboarding', request.url);
  //       return NextResponse.redirect(onboardingUrl);
  //     }
  //   } catch (error) {
  //     // Log error but don't block user access
  //     console.error('[Middleware] Error checking onboarding status:', error);
  //   }
  // }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
