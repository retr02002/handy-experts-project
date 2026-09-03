import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function proxy(req) {
    const { pathname } = req.nextUrl;
    const { token } = req.nextauth;

    // Signed in but hasn't picked an account type yet — send everywhere to
    // /onboarding until that's done. This is a JWT-only check (no DB call),
    // so it's safe to run in edge middleware; deeper profile-completeness
    // checks (e.g. a customer missing name/phone) happen in each dashboard's
    // layout Server Component instead, where Prisma is actually usable.
    //
    // /customer is also excluded: a PENDING account reaching /onboarding with
    // no vendor/technician role param is redirected there itself (OTP/Google
    // customer sign-in — see src/app/onboarding/page.tsx), and /customer's
    // own layout already gates on completeness inline. Without this
    // exclusion, that redirect and this one would bounce the request back
    // and forth between /onboarding and /customer forever.
    if (token?.role === "PENDING" && !pathname.startsWith("/onboarding") && !pathname.startsWith("/customer")) {
      return NextResponse.redirect(new URL("/onboarding", req.url));
    }

    // Route protections based on roles. /admin is deliberately not handled
    // here — its own layout (src/app/admin/layout.tsx) gates it server-side
    // and renders a login form in place, instead of redirecting away.
    if (pathname.startsWith("/vendor") && token?.role !== "VENDOR") {
      return NextResponse.redirect(new URL("/sign-in", req.url));
    }

    // PENDING is allowed through here (see note above) — /customer/layout.tsx
    // shows the profile-completion gate instead of the real dashboard.
    if (pathname.startsWith("/customer") && token?.role !== "CUSTOMER" && token?.role !== "PENDING") {
      return NextResponse.redirect(new URL("/sign-in", req.url));
    }
    
    if (pathname.startsWith("/technician") && token?.role !== "TECHNICIAN") {
      return NextResponse.redirect(new URL("/sign-in", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/sign-in",
    },
    secret: process.env.NEXTAUTH_SECRET || "fallback_secret_for_development_12345",
  }
);

export const config = {
  matcher: ["/vendor/:path*", "/customer/:path*", "/technician/:path*", "/cart"],
};
