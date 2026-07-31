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
    if (token?.role === "PENDING" && !pathname.startsWith("/onboarding")) {
      return NextResponse.redirect(new URL("/onboarding", req.url));
    }

    // Route protections based on roles
    if (pathname.startsWith("/admin") && token?.role !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/sign-in", req.url));
    }
    
    if (pathname.startsWith("/vendor") && token?.role !== "VENDOR") {
      return NextResponse.redirect(new URL("/sign-in", req.url));
    }
    
    if (pathname.startsWith("/customer") && token?.role !== "CUSTOMER") {
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
  matcher: [
    "/admin/:path*",
    "/vendor/:path*",
    "/customer/:path*",
    "/technician/:path*",
    "/cart",
    "/onboarding",
  ],
};
